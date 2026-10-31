import { TableSchema, QueryResult } from '../types';

/**
 * Base Database Adapter Interface
 * Implements the contract for the Adapter Pattern in Anexar.
 * Ensures zero-retention by encapsulating connection lifecycles and ephemeral schema extraction.
 */
export interface DatabaseAdapter {
  /**
   * Initializes the connection or loads in-memory data structures.
   */
  connect(): Promise<void>;

  /**
   * Closes connections or frees memory buffers.
   */
  disconnect(): Promise<void>;

  /**
   * Introspects the data source and returns tables and column schemas
   * formatted for LLM context prompt generation.
   */
  getSchema(): Promise<TableSchema[]>;

  /**
   * Executes a validated, read-only SQL query against the data source.
   * Must enforce read-only isolation at the driver/session level.
   *
   * @param sql Validated SQL string
   */
  executeQuery(sql: string): Promise<QueryResult>;

  /**
   * Returns SQL dialect used by node-sql-parser and LLM prompts.
   */
  getDialect(): 'postgresql' | 'sqlite' | 'mysql' | 'transactsql';
}
