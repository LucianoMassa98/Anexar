import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AdapterFactory } from '../adapters/AdapterFactory';
import { DatabaseAdapter } from '../adapters/DatabaseAdapter';
import { SqlFirewall } from '../firewall/SqlFirewall';
import { TextToSqlService } from '../services/textToSql.service';
import { ThresholdEvaluator } from '../services/thresholdEvaluator.service';
import { ConnectionConfig, PostgresConnectionConfig, MemoryFileConnectionConfig, MySQLConnectionConfig } from '../types';

// Zod validation schemas
const dbConfigSchema = z.object({
  engine: z.enum(['postgres', 'mysql']).default('postgres'),
  connectionString: z.string().optional(),
  host: z.string().optional(),
  port: z.union([z.number(), z.string().transform(Number)]).optional(),
  database: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().optional(),
});

const queryBodySchema = z.object({
  prompt: z.string().optional(),
  sql: z.string().optional(),
  engine: z.enum(['postgres', 'mysql', 'memory-file']).default('postgres'),
  connectionConfig: dbConfigSchema.optional(),
  threshold: z
    .object({
      conditionMetric: z.string(),
      operator: z.enum(['GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'EQUALS', 'NOT_EQUALS']),
      thresholdValue: z.number(),
    })
    .optional(),
});

/**
 * AnalyticsController
 * Orchestrates Text-to-SQL generation and execution through the Adapter Pattern.
 * Enforces Zero-Retention: connection credentials and uploaded file buffers are
 * accepted per request, processed ephemerally, and flushed from memory upon completion.
 */
export class AnalyticsController {
  /**
   * Introspects database schema or spreadsheet structure.
   * POST /api/analytics/schema
   */
  public static async getSchema(req: Request, res: Response, next: NextFunction): Promise<void> {
    let adapter: DatabaseAdapter | null = null;

    try {
      const config = AnalyticsController.resolveConnectionConfig(req);
      adapter = AdapterFactory.createAdapter(config);

      await adapter.connect();
      const schema = await adapter.getSchema();

      res.status(200).json({
        success: true,
        dialect: adapter.getDialect(),
        tablesCount: schema.length,
        schema,
      });
    } catch (error: any) {
      next(error);
    } finally {
      if (adapter) {
        await adapter.disconnect().catch(() => {});
      }
    }
  }

  /**
   * Translates natural language to SQL (or receives raw SQL),
   * validates it through the SQL Firewall, executes it, and checks threshold rules.
   * POST /api/analytics/query
   */
  public static async executeAnalyticsQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
    let adapter: DatabaseAdapter | null = null;

    try {
      // Parse request body or multipart form fields
      let bodyData = req.body;
      if (typeof bodyData.payload === 'string') {
        try {
          bodyData = { ...JSON.parse(bodyData.payload), ...bodyData };
        } catch {
          // ignore if payload isn't JSON string
        }
      }

      const parsed = queryBodySchema.safeParse(bodyData);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: 'Parámetros de consulta inválidos.',
          details: parsed.error.format(),
        });
        return;
      }

      const { prompt, sql: rawSqlInput, threshold } = parsed.data;

      if (!prompt && !rawSqlInput) {
        res.status(400).json({
          success: false,
          error: 'Debe proporcionar un prompt en lenguaje natural o una consulta SQL directa.',
        });
        return;
      }

      // 1. Resolve Ephemeral Connection Configuration
      const config = AnalyticsController.resolveConnectionConfig(req, parsed.data.connectionConfig);
      adapter = AdapterFactory.createAdapter(config);

      await adapter.connect();
      const dialect = adapter.getDialect();

      let targetSql = rawSqlInput || '';
      let explanation = 'Consulta ejecutada directamente por el usuario.';

      // 2. Generate SQL via Vercel AI SDK if natural language prompt is given
      if (!targetSql && prompt) {
        const schema = await adapter.getSchema();
        const aiResult = await TextToSqlService.generateSql(prompt, schema, dialect);
        targetSql = aiResult.sql;
        explanation = aiResult.explanation;
      }

      // 3. Strict SQL Firewall Inspection (node-sql-parser AST analysis)
      const firewallCheck = SqlFirewall.validate(targetSql, dialect);
      if (!firewallCheck.isValid) {
        res.status(403).json({
          success: false,
          error: 'Violación de Seguridad en SQL Firewall: La consulta no cumple con la política de sólo lectura.',
          details: firewallCheck.error,
          sqlAttempted: targetSql,
        });
        return;
      }

      // 4. Execution under Read-Only transaction
      const queryResult = await adapter.executeQuery(targetSql);

      // 5. Evaluate Metric Thresholds (if alert parameters are present)
      let thresholdResult = null;
      if (threshold && queryResult.rows.length > 0) {
        thresholdResult = ThresholdEvaluator.evaluate({
          conditionMetric: threshold.conditionMetric,
          operator: threshold.operator,
          thresholdValue: threshold.thresholdValue,
          rows: queryResult.rows,
        });
      }

      // 6. Return response (Zero-Retention: no database or query data is written to internal Prisma DB)
      res.status(200).json({
        success: true,
        sql: targetSql,
        explanation,
        dialect,
        results: {
          rows: queryResult.rows,
          fields: queryResult.fields,
          rowCount: queryResult.rowCount,
          executionTimeMs: queryResult.executionTimeMs,
        },
        firewall: {
          status: 'PASSED',
          policy: 'STRICT_READ_ONLY_SELECT',
          statementType: firewallCheck.statementType,
        },
        thresholdEvaluation: thresholdResult,
      });
    } catch (error: any) {
      next(error);
    } finally {
      // 7. Ensure connection teardown and RAM cleanup
      if (adapter) {
        await adapter.disconnect().catch(() => {});
      }
    }
  }

  /**
   * Helper to resolve ephemeral connection details from request headers, body, or multipart files.
   * Never retrieves credentials from disk or database.
   */
  private static resolveConnectionConfig(
    req: Request,
    explicitConfig?: PostgresConnectionConfig | MySQLConnectionConfig
  ): ConnectionConfig {
    const files = req.files as Express.Multer.File[] | undefined;
    const singleFile = req.file as Express.Multer.File | undefined;
    const uploadedFiles = files || (singleFile ? [singleFile] : []);

    // If files are attached, prioritize MemoryFileAdapter
    if (uploadedFiles.length > 0) {
      const memoryConfig: MemoryFileConnectionConfig = {
        engine: 'memory-file',
        files: uploadedFiles.map((f) => ({
          originalname: f.originalname,
          buffer: f.buffer,
          mimetype: f.mimetype,
        })),
      };
      return memoryConfig;
    }

    // Check if explicit config passed
    if (explicitConfig) {
      return explicitConfig;
    }

    const engineType =
      req.body.engine === 'mysql' || (req.body.connectionString && req.body.connectionString.startsWith('mysql://'))
        ? 'mysql'
        : 'postgres';

    // Check request body for connection string or host parameters
    if (req.body.connectionString || req.body.host) {
      if (engineType === 'mysql') {
        return {
          engine: 'mysql',
          connectionString: req.body.connectionString,
          host: req.body.host,
          port: req.body.port ? Number(req.body.port) : 3306,
          database: req.body.database,
          user: req.body.user,
          password: req.body.password,
          ssl: req.body.ssl === true || req.body.ssl === 'true',
        };
      }

      return {
        engine: 'postgres',
        connectionString: req.body.connectionString,
        host: req.body.host,
        port: req.body.port ? Number(req.body.port) : 5432,
        database: req.body.database,
        user: req.body.user,
        password: req.body.password,
        ssl: req.body.ssl === true || req.body.ssl === 'true',
      };
    }

    // Check encrypted/base64 headers if client transmitted ephemeral creds via header
    const headerConn = req.headers['x-anexar-postgres-conn'] || req.headers['x-anexar-db-conn'];
    if (typeof headerConn === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(headerConn, 'base64').toString('utf-8'));
        return decoded;
      } catch {
        // ignore
      }
    }

    throw new Error(
      'No se proporcionaron credenciales efímeras ni archivos para la conexión. Por favor especifique una URL pública de PostgreSQL / MySQL o adjunte un archivo CSV/Excel.'
    );
  }
}

