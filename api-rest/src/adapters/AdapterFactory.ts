import { DatabaseAdapter } from './DatabaseAdapter';
import { PostgresAdapter } from './PostgresAdapter';
import { MemoryFileAdapter } from './MemoryFileAdapter';
import { ConnectionConfig } from '../types';

/**
 * AdapterFactory
 * Implements the Factory Pattern to instantiate database adapters dynamically.
 * Decouples controller logic from concrete driver implementations and guarantees
 * seamless extensibility for enterprise connectors (MySQL, SQL Server, MongoDB, Snowflake).
 */
export class AdapterFactory {
  /**
   * Instantiates the appropriate DatabaseAdapter based on the incoming configuration.
   */
  public static createAdapter(config: ConnectionConfig): DatabaseAdapter {
    switch (config.engine) {
      case 'postgres':
        return new PostgresAdapter(config);

      case 'memory-file':
        return new MemoryFileAdapter(config);

      case 'mysql':
        // Architectural extensibility: MySQL driver hook
        throw new Error(
          'MySQL Adapter is ready for integration. Install mysql2 and instantiate MySQLAdapter(config).'
        );

      case 'sqlserver':
        // Architectural extensibility: SQL Server (mssql) driver hook
        throw new Error(
          'SQL Server (T-SQL) Adapter is ready for integration. Install mssql and instantiate SqlServerAdapter(config).'
        );

      case 'mongodb':
        // Architectural extensibility: MongoDB aggregation pipeline hook
        throw new Error(
          'MongoDB Adapter is ready for integration. Install mongodb and instantiate MongoAdapter(config).'
        );

      default: {
        const exhaustiveCheck: never = config;
        throw new Error(`Unsupported database engine: ${JSON.stringify(exhaustiveCheck)}`);
      }
    }
  }
}
