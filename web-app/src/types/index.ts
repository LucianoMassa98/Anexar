export type EngineType = 'postgres' | 'mysql' | 'memory-file';

export interface DataClassification {
  industry: string;
  dataDomain: string;
  sourceErp: string;
  analysisGoal: string;
}

export interface PostgresCredentials {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

export interface EphemeralFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface ColumnSchema {
  name: string;
  dataType: string;
  isNullable: boolean;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
}

export interface QueryResult {
  rows: Record<string, any>[];
  fields: { name: string; dataType?: string }[];
  rowCount: number;
  executionTimeMs: number;
}

export interface QueryResponse {
  success: boolean;
  sql: string;
  explanation: string;
  dialect: string;
  results: QueryResult;
  firewall: {
    status: string;
    policy: string;
    statementType?: string;
  };
  thresholdEvaluation?: {
    isTriggered: boolean;
    metricFound: boolean;
    actualValue: number | null;
    thresholdValue: number;
    message: string;
  } | null;
}

export type ChartType = 'BAR' | 'LINE' | 'PIE' | 'AREA' | 'TABLE' | 'KPI_CARD';

export interface Strategy {
  id: string;
  title: string;
  slug: string;
  description: string;
  promptTemplate: string;
  generatedSql: string;
  chartType: ChartType;
  category: 'FINANCE' | 'CONTABILITY' | 'OPERATIONS' | 'SALES' | 'INVENTORY' | 'TAX';
  visibility: 'PRIVATE' | 'PUBLIC';
  isPremium: boolean;
  isTemplate: boolean;
  averageRating?: number;
  ratingsCount?: number;
  commentsCount?: number;
  author?: {
    id: string;
    name: string;
    company?: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export type ServiceRequestType =
  | 'CONSULTORIA_CONTABLE'
  | 'CENTRALIZACION_ERPS'
  | 'TEXT_TO_SQL_IA'
  | 'SOPORTE_TECNICO';

export interface ServiceRequestData {
  title: string;
  description: string;
  type: ServiceRequestType;
  currentErp?: string;
  userId?: string;
}

