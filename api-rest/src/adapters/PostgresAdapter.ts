import { Client } from 'pg';
import { DatabaseAdapter } from './DatabaseAdapter';
import { PostgresConnectionConfig, TableSchema, QueryResult } from '../types';

/**
 * PostgresAdapter
 * Connects directly to a client's PostgreSQL instance.
 * Guarantees Zero-Retention: connection settings are received per-request,
 * executed in an isolated transaction set to READ ONLY, and closed immediately.
 */
export class PostgresAdapter implements DatabaseAdapter {
  private client: Client;
  private isConnected = false;

  constructor(config: PostgresConnectionConfig) {
    if (config.connectionString) {
      this.client = new Client({
        connectionString: config.connectionString,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        statement_timeout: 15000, // 15 second safety guard against heavy queries
      });
    } else {
      this.client = new Client({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        statement_timeout: 15000,
      });
    }
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
    }
  }

  getDialect(): 'postgresql' {
    return 'postgresql';
  }

  async getSchema(): Promise<TableSchema[]> {
    await this.connect();

    const query = `
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable
      FROM information_schema.columns c
      JOIN information_schema.tables t 
        ON c.table_name = t.table_name 
        AND c.table_schema = t.table_schema
      WHERE c.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
      ORDER BY c.table_name, c.ordinal_position;
    `;

    const res = await this.client.query(query);
    const tableMap = new Map<string, TableSchema>();

    for (const row of res.rows) {
      const tableName = row.table_name;
      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, {
          tableName,
          columns: [],
        });
      }

      tableMap.get(tableName)!.columns.push({
        name: row.column_name,
        dataType: row.data_type,
        isNullable: row.is_nullable === 'YES',
      });
    }

    return Array.from(tableMap.values());
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    await this.connect();
    const startTime = Date.now();

    try {
      // Enforce strict READ ONLY transaction at Postgres engine level
      await this.client.query('BEGIN TRANSACTION READ ONLY;');
      
      const res = await this.client.query(sql);
      
      await this.client.query('COMMIT;');

      const executionTimeMs = Date.now() - startTime;

      const fields = (res.fields || []).map((f) => ({
        name: f.name,
        dataType: f.dataTypeID.toString(),
      }));

      return {
        rows: res.rows || [],
        fields,
        rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
        executionTimeMs,
      };
    } catch (error) {
      try {
        await this.client.query('ROLLBACK;');
      } catch {
        // Rollback attempt ignore
      }
      throw error;
    }
  }
}

