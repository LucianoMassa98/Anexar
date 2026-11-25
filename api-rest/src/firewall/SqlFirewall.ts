import { Parser } from 'node-sql-parser';
import { FirewallValidationResult } from '../types';

/**
 * SqlFirewall
 * Advanced SQL Inspection Engine powered by node-sql-parser.
 * Analyzes the Abstract Syntax Tree (AST) of LLM-generated or user queries.
 * Enforces strict Read-Only constraints: allows only `SELECT` operations,
 * explicitly rejects any DDL, DML, data exfiltration, or multi-statement injections.
 */
export class SqlFirewall {
  private static parser = new Parser();

  // Explicit forbidden statement types in AST
  private static readonly FORBIDDEN_TYPES = new Set([
    'insert',
    'update',
    'delete',
    'drop',
    'alter',
    'create',
    'truncate',
    'replace',
    'merge',
    'grant',
    'revoke',
    'call',
    'exec',
    'execute',
    'rename',
    'lock',
    'unlock',
  ]);

  // Secondary regex patterns for defense-in-depth against SQL injection tricks
  private static readonly DANGEROUS_PATTERNS = [
    /pg_sleep\s*\(/i,
    /sleep\s*\(/i,
    /benchmark\s*\(/i,
    /xp_cmdshell/i,
    /into\s+(outfile|dumpfile)/i,
    /copy\s+.*\s+(to|from)\s+program/i,
    /load_file\s*\(/i,
    /alter\s+system/i,
    /shutdown/i,
  ];

  /**
   * Validates a SQL query against strict read-only security policies.
   *
   * @param sql Raw SQL query to validate
   * @param dialect SQL dialect ('postgresql' | 'sqlite' | 'mysql' | 'transactsql')
   * @returns FirewallValidationResult indicating whether query is safe to execute
   */
  public static validate(
    sql: string,
    dialect: 'postgresql' | 'sqlite' | 'mysql' | 'transactsql' = 'postgresql'
  ): FirewallValidationResult {
    let trimmed = sql.trim();

    if (!trimmed) {
      return { isValid: false, error: 'SQL query cannot be empty.' };
    }

    // Strip trailing semicolon to ensure clean single-statement parsing
    trimmed = trimmed.replace(/;\s*$/, '').trim();

    // 1. Secondary regex scan for dangerous functions/patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          error: `SQL Firewall bloqueó la consulta por contener patrón potencialmente peligroso: ${pattern.source}`,
        };
      }
    }

    // 2. Parse into Abstract Syntax Tree (AST) using node-sql-parser
    let ast: any;
    try {
      // Map dialect to node-sql-parser format
      const parserDatabase = dialect === 'sqlite' ? 'sqlite' : 'postgresql';
      ast = this.parser.astify(trimmed, { database: parserDatabase });
    } catch (parseError: any) {
      // If parser failed, attempt generic dialect parse
      try {
        ast = this.parser.astify(trimmed);
      } catch (fallbackError: any) {
        // Fallback: If node-sql-parser failed on valid Postgres constructs (e.g. ::date casting or functions),
        // verify strictly that the query begins with SELECT / WITH and contains zero forbidden keywords
        const isSelectOnly = /^\s*(WITH\s+[\s\S]+?\s+)?SELECT\s+[\s\S]+/i.test(trimmed);
        const hasMutations = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE|MERGE|GRANT|REVOKE|EXEC|EXECUTE)\b/i.test(trimmed);

        if (isSelectOnly && !hasMutations) {
          return {
            isValid: true,
            statementType: 'select',
          };
        }

        return {
          isValid: false,
          error: `Error de sintaxis SQL en Firewall: ${parseError.message || fallbackError.message}`,
        };
      }
    }

    if (!ast) {
      return { isValid: false, error: 'Unable to parse SQL Abstract Syntax Tree.' };
    }

    // 3. Inspect AST statement types
    const statements = Array.isArray(ast) ? ast : [ast];

    // Disallow multi-statement query batches as a vector for stacked injection
    if (statements.length > 1) {
      return {
        isValid: false,
        error: 'Multiple SQL statements in a single execution payload are strictly forbidden by SQL Firewall.',
      };
    }

    for (const stmt of statements) {
      const type = (stmt.type || '').toLowerCase();

      if (this.FORBIDDEN_TYPES.has(type)) {
        return {
          isValid: false,
          statementType: type,
          error: `Forbidden SQL operation detected: [${type.toUpperCase()}]. Anexar allows only read-only SELECT queries.`,
        };
      }

      if (type !== 'select') {
        return {
          isValid: false,
          statementType: type,
          error: `Operation [${type.toUpperCase()}] is not an authorized read-only query.`,
        };
      }

      // Check for SELECT ... INTO (which writes tables)
      if (stmt.into) {
        return {
          isValid: false,
          error: 'SELECT ... INTO statements are forbidden because they mutate schema state.',
        };
      }
    }

    return {
      isValid: true,
      ast,
      statementType: 'select',
    };
  }
}

