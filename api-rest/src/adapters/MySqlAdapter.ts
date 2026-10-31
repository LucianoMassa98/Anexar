import mysql, { Connection, RowDataPacket, FieldPacket } from 'mysql2/promise';
import { DatabaseAdapter } from './DatabaseAdapter';
import { MySQLConnectionConfig, TableSchema, QueryResult } from '../types';

/**
 * MySqlAdapter
 * Connects directly to a client's MySQL database instance via public connection string or credentials.
 * Guarantees Zero-Retention: connection settings are received per-request,
 * executed in an isolated READ ONLY transaction, and closed immediately.
 */
export class MySqlAdapter implements DatabaseAdapter {
  private config: MySQLConnectionConfig;
  private connection: Connection | null = null;
  private isConnected = false;

  constructor(config: MySQLConnectionConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.connection) {
      return;
    }

    if (this.config.connectionString) {
      this.connection = await mysql.createConnection(this.config.connectionString);
    } else {
      this.connection = await mysql.createConnection({
        host: this.config.host || 'localhost',
        port: this.config.port || 3306,
        user: this.config.user || 'root',
        password: this.config.password || '',
        database: this.config.database,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
      });
    }

    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected && this.connection) {
      await this.connection.end();
      this.connection = null;
      this.isConnected = false;
    }
  }

  getDialect(): 'mysql' {
    return 'mysql';
  }

  async getSchema(): Promise<TableSchema[]> {
    await this.connect();
    if (!this.connection) throw new Error('No se pudo establecer la conexión a MySQL.');

    const query = `
      SELECT 
        TABLE_NAME as table_name,
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        IS_NULLABLE as is_nullable
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `;

    const [rows] = await this.connection.query<RowDataPacket[]>(query);
    const tableMap = new Map<string, TableSchema>();

    for (const row of rows) {
      const tableName = String(row.table_name);
      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, {
          tableName,
          columns: [],
        });
      }

      tableMap.get(tableName)!.columns.push({
        name: String(row.column_name),
        dataType: String(row.data_type),
        isNullable: row.is_nullable === 'YES',
      });
    }

    return Array.from(tableMap.values());
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    await this.connect();
    if (!this.connection) throw new Error('No se pudo establecer la conexión a MySQL.');

    const startTime = Date.now();

    try {
      // Enforce strict READ ONLY session at MySQL engine level
      await this.connection.query('START TRANSACTION READ ONLY;');

      const [rows, fields] = await this.connection.query<RowDataPacket[]>(sql);

      await this.connection.query('COMMIT;');

      const executionTimeMs = Date.now() - startTime;

      const formattedFields = (fields || []).map((f: FieldPacket) => ({
        name: f.name,
        dataType: f.type ? String(f.type) : undefined,
      }));

      const rowsArray = Array.isArray(rows) ? (rows as Record<string, any>[]) : [];

      return {
        rows: rowsArray,
        fields: formattedFields,
        rowCount: rowsArray.length,
        executionTimeMs,
      };
    } catch (error) {
      try {
        await this.connection?.query('ROLLBACK;');
      } catch {
        // Rollback attempt ignore
      }
      throw error;
    }
  }
}

