import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import initSqlJs, { Database } from 'sql.js';
import { DatabaseAdapter } from './DatabaseAdapter';
import { MemoryFileConnectionConfig, TableSchema, QueryResult, QueryResultField } from '../types';

/**
 * MemoryFileAdapter
 * Processes ephemeral uploaded Excel (.xlsx, .xls) and CSV files directly from memory buffers.
 * Mounts them into an in-memory SQLite database (via sql.js WebAssembly).
 * Guarantees ZERO disk persistence: the database exists solely in RAM during query execution.
 */
export class MemoryFileAdapter implements DatabaseAdapter {
  private files: MemoryFileConnectionConfig['files'];
  private db: Database | null = null;
  private isLoaded = false;

  constructor(config: MemoryFileConnectionConfig) {
    this.files = config.files;
  }

  async connect(): Promise<void> {
    if (this.isLoaded && this.db) {
      return;
    }

    const SQL = await initSqlJs();
    this.db = new SQL.Database();

    for (const file of this.files) {
      const lowerName = file.originalname.toLowerCase();
      if (lowerName.endsWith('.csv')) {
        this.loadCsvFile(file.originalname, file.buffer);
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        this.loadExcelFile(file.originalname, file.buffer);
      }
    }

    this.isLoaded = true;
  }

  private sanitizeIdentifier(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/^(\d)/, 'col_$1'); // SQL identifiers cannot start with number
  }

  private loadCsvFile(fileName: string, buffer: Buffer): void {
    if (!this.db) return;

    const baseTableName = this.sanitizeIdentifier(fileName.replace(/\.csv$/i, '')) || 'imported_csv';
    const csvContent = buffer.toString('utf-8');

    const records: Record<string, any>[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) return;

    this.createTableAndInsert(baseTableName, records);
  }

  private loadExcelFile(fileName: string, buffer: Buffer): void {
    if (!this.db) return;

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const baseName = this.sanitizeIdentifier(fileName.replace(/\.xlsx?$|\.xls$/i, '')) || 'excel';

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const records: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      if (records.length === 0) continue;

      const sanitizedSheetName = this.sanitizeIdentifier(sheetName);
      const tableName = workbook.SheetNames.length === 1 ? baseName : `${baseName}_${sanitizedSheetName}`;

      this.createTableAndInsert(tableName, records);
    }
  }

  private createTableAndInsert(tableName: string, records: Record<string, any>[]): void {
    if (!this.db || records.length === 0) return;

    const rawHeaders = Object.keys(records[0]);
    const headerMap = new Map<string, string>(); // raw -> sanitized

    for (const raw of rawHeaders) {
      let sanitized = this.sanitizeIdentifier(raw) || 'unnamed_col';
      // Ensure unique headers
      let counter = 1;
      while (Array.from(headerMap.values()).includes(sanitized)) {
        sanitized = `${sanitized}_${counter++}`;
      }
      headerMap.set(raw, sanitized);
    }

    // Infer column types based on initial samples
    const columnDefinitions = Array.from(headerMap.entries()).map(([raw, colName]) => {
      let isNumeric = true;
      let hasDecimal = false;

      for (let i = 0; i < Math.min(records.length, 50); i++) {
        const val = records[i][raw];
        if (val === null || val === undefined || val === '') continue;

        if (isNaN(Number(val))) {
          isNumeric = false;
          break;
        } else if (String(val).includes('.')) {
          hasDecimal = true;
        }
      }

      const type = isNumeric ? (hasDecimal ? 'REAL' : 'INTEGER') : 'TEXT';
      return `"${colName}" ${type}`;
    });

    const createSql = `CREATE TABLE "${tableName}" (${columnDefinitions.join(', ')});`;
    this.db.run(createSql);

    // Prepare insert statement
    const cols = Array.from(headerMap.values()).map((c) => `"${c}"`).join(', ');
    const placeholders = Array.from(headerMap.values()).map(() => '?').join(', ');
    const insertSql = `INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders});`;

    const stmt = this.db.prepare(insertSql);

    try {
      this.db.run('BEGIN TRANSACTION;');
      for (const record of records) {
        const values = Array.from(headerMap.keys()).map((rawKey) => {
          const val = record[rawKey];
          return val === undefined ? null : val;
        });
        stmt.run(values);
      }
      this.db.run('COMMIT;');
    } catch (err) {
      try {
        this.db.run('ROLLBACK;');
      } catch {
        // ignore
      }
      throw err;
    } finally {
      stmt.free();
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isLoaded = false;
    // Release file buffer references immediately to free RAM
    this.files = [];
  }

  getDialect(): 'sqlite' {
    return 'sqlite';
  }

  async getSchema(): Promise<TableSchema[]> {
    await this.connect();
    if (!this.db) throw new Error('In-memory database is not initialized');

    const tablesRes = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    if (tablesRes.length === 0 || !tablesRes[0].values) {
      return [];
    }

    const tableSchemas: TableSchema[] = [];

    for (const row of tablesRes[0].values) {
      const tableName = String(row[0]);
      const pragmaRes = this.db.exec(`PRAGMA table_info("${tableName}");`);

      const columns = [];
      if (pragmaRes.length > 0 && pragmaRes[0].values) {
        for (const colRow of pragmaRes[0].values) {
          // colRow: [cid, name, type, notnull, dflt_value, pk]
          columns.push({
            name: String(colRow[1]),
            dataType: String(colRow[2] || 'TEXT'),
            isNullable: colRow[3] === 0,
            isPrimaryKey: colRow[5] === 1,
          });
        }
      }

      tableSchemas.push({
        tableName,
        columns,
      });
    }

    return tableSchemas;
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    await this.connect();
    if (!this.db) throw new Error('In-memory database is not initialized');

    const startTime = Date.now();

    try {
      const results = this.db.exec(sql);
      const executionTimeMs = Date.now() - startTime;

      if (results.length === 0) {
        return {
          rows: [],
          fields: [],
          rowCount: 0,
          executionTimeMs,
        };
      }

      const firstResult = results[0];
      const columnNames = firstResult.columns;
      const rows: Record<string, any>[] = [];

      for (const valueRow of firstResult.values) {
        const rowObj: Record<string, any> = {};
        for (let i = 0; i < columnNames.length; i++) {
          rowObj[columnNames[i]] = valueRow[i];
        }
        rows.push(rowObj);
      }

      const fields: QueryResultField[] = columnNames.map((col) => ({
        name: col,
        dataType: 'TEXT',
      }));

      return {
        rows,
        fields,
        rowCount: rows.length,
        executionTimeMs,
      };
    } catch (error: any) {
      throw new Error(`In-Memory SQLite execution error: ${error.message}`);
    }
  }
}
