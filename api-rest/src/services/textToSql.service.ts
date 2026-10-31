import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '../config/env';
import { TableSchema } from '../types';

/**
 * TextToSqlService
 * Utilizes Vercel AI SDK to translate natural language financial and operational questions
 * into precise, optimized, read-only SQL queries grounded on the introspected database schema.
 */
export class TextToSqlService {
  private static openai = env.OPENAI_API_KEY ? createOpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

  /**
   * Generates a SQL query from natural language given the target schema and dialect.
   */
  public static async generateSql(
    userPrompt: string,
    schema: TableSchema[],
    dialect: 'postgresql' | 'sqlite' | 'mysql' | 'transactsql' = 'postgresql',
    classification?: { industry?: string; dataDomain?: string; sourceErp?: string; analysisGoal?: string }
  ): Promise<{ sql: string; explanation: string }> {
    // Format schema into compact DDL representation for context window efficiency
    const formattedSchema = schema
      .map((table) => {
        const cols = table.columns.map((c) => `  ${c.name} (${c.dataType}${c.isNullable ? ', null' : ''})`).join('\n');
        return `TABLE ${table.tableName} (\n${cols}\n)`;
      })
      .join('\n\n');

    const businessContext = [
      classification?.industry ? `Industry / Sector: ${classification.industry}` : '',
      classification?.dataDomain ? `Domain Area: ${classification.dataDomain}` : '',
      classification?.sourceErp ? `Source System / ERP: ${classification.sourceErp}` : '',
      classification?.analysisGoal ? `Primary Strategic Goal: ${classification.analysisGoal}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `
You are the Lead Data & Financial SQL Architect for "ANEXAR — Consultoría Contable & Tecnológica".
Your role is to translate business, financial, and operational analytical requests into high-performance, strictly READ-ONLY SQL queries.

Target SQL Dialect: ${dialect.toUpperCase()}
${businessContext ? `BUSINESS & DOMAIN CONTEXT:\n${businessContext}\n` : ''}
DATABASE SCHEMA:
${formattedSchema || 'No explicit schema provided. Use standard SQL financial naming conventions.'}

CRITICAL RULES:
1. Generate ONLY valid, executable SELECT queries.
2. NEVER generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or CREATE statements.
3. Use proper column aliases and aggregation functions (SUM, AVG, COUNT, MIN, MAX, ROUND).
4. If working with SQLite, quote table and column names with double quotes ("table_name", "column_name").
5. Format the query cleanly.
6. Provide a concise 1-2 sentence explanation of the metrics calculated.

Format your response exactly as:
\`\`\`sql
SELECT ...
\`\`\`
Explanation: <brief business context>
`.trim();

    // If an OpenAI API Key is configured, use Vercel AI SDK
    if (this.openai && env.OPENAI_API_KEY) {
      try {
        const model = this.openai(env.OPENAI_MODEL || 'gpt-4o');
        const response = await generateText({
          model,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.1, // Low temperature for deterministic, precise SQL
        });

        const text = response.text;
        const sqlMatch = text.match(/```sql([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
        const sql = sqlMatch ? sqlMatch[1].trim() : text.trim();

        const explanationMatch = text.split(/```/)[2];
        const explanation = explanationMatch
          ? explanationMatch.replace(/^Explanation:\s*/i, '').trim()
          : 'Consulta SQL analítica generada con éxito.';

        return { sql, explanation };
      } catch (err: any) {
        console.warn(`[TextToSqlService] Vercel AI SDK failed or unavailable: ${err.message}. Using fallback engine.`);
      }
    }

    // Heuristic Fallback Engine for offline self-hosted mode / demo without OpenAI key
    return this.generateHeuristicFallback(userPrompt, schema, dialect);
  }

  /**
   * Fallback rule-based generator for self-hosted instances or when LLM API keys are not provided.
   */
  private static generateHeuristicFallback(
    prompt: string,
    schema: TableSchema[],
    dialect: string
  ): { sql: string; explanation: string } {
    const lowerPrompt = prompt.toLowerCase();
    const firstTable = schema[0]?.tableName || 'ventas';
    const cols = schema[0]?.columns || [];
    const colNames = cols.map((c) => c.name);

    const quote = (name: string) => (dialect === 'sqlite' ? `"${name}"` : name);

    // Common KPI patterns
    if (lowerPrompt.includes('ebitda') || lowerPrompt.includes('margen') || lowerPrompt.includes('operativo')) {
      return {
        sql: `SELECT \n  ${quote('periodo') || "'2025-Q1'"} AS periodo,\n  SUM(ingresos_operativos) AS ingresos_totales,\n  SUM(costo_ventas) AS costo_mercaderias,\n  SUM(gastos_admin + gastos_comercializacion) AS opex,\n  ROUND((SUM(ingresos_operativos - costo_ventas - gastos_admin - gastos_comercializacion) / NULLIF(SUM(ingresos_operativos), 0)) * 100, 2) AS margen_ebitda\nFROM ${quote(firstTable)}\nGROUP BY 1\nORDER BY 1 DESC;`,
        explanation: 'Cálculo de EBITDA y margen operativo porcentual proyectado por período.',
      };
    }

    if (lowerPrompt.includes('aging') || lowerPrompt.includes('cobrar') || lowerPrompt.includes('mora')) {
      return {
        sql: `SELECT \n  cliente,\n  SUM(CASE WHEN dias_mora <= 30 THEN saldo ELSE 0 END) AS corriente_30d,\n  SUM(CASE WHEN dias_mora BETWEEN 31 AND 60 THEN saldo ELSE 0 END) AS mora_31_60d,\n  SUM(CASE WHEN dias_mora BETWEEN 61 AND 90 THEN saldo ELSE 0 END) AS mora_61_90d,\n  SUM(CASE WHEN dias_mora > 90 THEN saldo ELSE 0 END) AS mora_critica_mas90d,\n  SUM(saldo) AS deuda_total\nFROM ${quote(firstTable)}\nGROUP BY cliente\nORDER BY deuda_total DESC\nLIMIT 20;`,
        explanation: 'Estratificación por antigüedad de saldos (Aging) de créditos por cobrar.',
      };
    }

    if (lowerPrompt.includes('rotacion') || lowerPrompt.includes('inventario') || lowerPrompt.includes('stock')) {
      return {
        sql: `SELECT \n  categoria_producto,\n  SUM(costo_ventas_anual) AS costo_anual,\n  AVG(stock_valorizado) AS stock_promedio,\n  ROUND(SUM(costo_ventas_anual) / NULLIF(AVG(stock_valorizado), 0), 2) AS rotacion_inventario,\n  ROUND((AVG(stock_valorizado) / NULLIF(SUM(costo_ventas_anual), 0)) * 365, 0) AS dias_calle_inventario\nFROM ${quote(firstTable)}\nGROUP BY categoria_producto\nORDER BY rotacion_inventario ASC;`,
        explanation: 'Rotación de inventario anual y cálculo de días promedio de permanencia en stock (DSI).',
      };
    }

    // Default overview query
    const sampleCols = colNames.slice(0, 5).map(quote).join(', ') || '*';
    return {
      sql: `SELECT ${sampleCols}\nFROM ${quote(firstTable)}\nLIMIT 50;`,
      explanation: `Exploración preliminar de las primeras 50 filas de la entidad ${firstTable}.`,
    };
  }
}

