export type SupportedEngine = 'postgres' | 'memory-file' | 'mysql' | 'sqlserver' | 'mongodb';

export interface ColumnSchema {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  rowCountEstimate?: number;
}

export interface QueryResultField {
  name: string;
  dataType?: string;
}

export interface QueryResult {
  rows: Record<string, any>[];
  fields: QueryResultField[];
  rowCount: number;
  executionTimeMs: number;
}

// Postgres connection config (sent ephemerally from client or constructed on-the-fly)
export interface PostgresConnectionConfig {
  engine: 'postgres';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

// In-Memory file connection config (sent via Multer memoryStorage)
export interface MemoryFileConnectionConfig {
  engine: 'memory-file';
  files: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
  }[];
}

// Future adapters
export interface MySQLConnectionConfig {
  engine: 'mysql';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

export interface SqlServerConnectionConfig {
  engine: 'sqlserver';
  server?: string;
  database?: string;
  user?: string;
  password?: string;
}

export interface MongoConnectionConfig {
  engine: 'mongodb';
  uri?: string;
}

export type ConnectionConfig =
  | PostgresConnectionConfig
  | MemoryFileConnectionConfig
  | MySQLConnectionConfig
  | SqlServerConnectionConfig
  | MongoConnectionConfig;

export interface FirewallValidationResult {
  isValid: boolean;
  ast?: any;
  statementType?: string;
  error?: string;
}

export interface ThresholdEvaluationRequest {
  conditionMetric: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'EQUALS' | 'NOT_EQUALS';
  thresholdValue: number;
  rows: Record<string, any>[];
}

export interface ThresholdEvaluationResult {
  isTriggered: boolean;
  metricFound: boolean;
  actualValue: number | null;
  thresholdValue: number;
  message: string;
}

