import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '../config/env';
import { TableSchema, QueryResult } from '../types';

/**
 * TextToSqlService
 * Translates natural language financial & operational queries into high-performance,
 * read-only SQL grounded on the database schema, and generates executive business reports.
 * Powered primarily by Google Gemini (GEMINI_API_KEY) with OpenAI & Heuristic fallbacks.
 */
export class TextToSqlService {
  private static genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
  private static openai = env.OPENAI_API_KEY ? createOpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

  private static getGeminiModelsToTry(): string[] {
    const list = [
      env.GEMINI_MODEL,
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ].filter(Boolean) as string[];
    return Array.from(new Set(list));
  }

  public static getActiveProvider(): string {
    if (env.GEMINI_API_KEY && (env.LLM_PROVIDER === 'gemini' || env.LLM_PROVIDER === 'auto')) {
      return `Google Gemini (${env.GEMINI_MODEL || 'gemini-3-flash-preview'})`;
    }
    if (env.OPENAI_API_KEY && (env.LLM_PROVIDER === 'openai' || env.LLM_PROVIDER === 'auto')) {
      return `OpenAI (${env.OPENAI_MODEL})`;
    }
    return 'Motor Heurístico Offline';
  }

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
        const cols = table.columns
          .map((c) => `  ${c.name} (${c.dataType}${c.isNullable ? ', null' : ''})`)
          .join('\n');
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
1. Generate EXACTLY ONE valid, executable SELECT query. Do NOT generate multiple statements or semicolons.
2. NEVER generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or CREATE statements.
3. Use proper column aliases and aggregation functions (SUM, AVG, COUNT, MIN, MAX, ROUND).
4. If working with SQLite, quote table and column names with double quotes ("table_name", "column_name").
5. If working with PostgreSQL, respect table and column casing. If any table or column name contains spaces or hyphens (e.g. "remitos de ventas"), you MUST wrap it in double quotes.
6. Format the query cleanly without trailing semicolons.
7. Provide a concise 1-2 sentence explanation of the metrics calculated.

Format your response exactly as:
\`\`\`sql
SELECT ...
\`\`\`
Explanation: <brief business context>
`.trim();

    // 1. Prioritize Google Gemini API with intelligent model fallback
    if (this.genAI && env.GEMINI_API_KEY && (env.LLM_PROVIDER === 'gemini' || env.LLM_PROVIDER === 'auto')) {
      const models = this.getGeminiModelsToTry();
      for (const modelName of models) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.1, // Deterministic, highly accurate SQL
            },
          });

          const promptCombined = `${systemPrompt}\n\nUSER CONSULTATION / REQUERIMIENTO:\n"${userPrompt}"`;
          const result = await model.generateContent(promptCombined);
          const text = result.response.text();

          const sqlMatch = text.match(/```sql([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
          let sql = sqlMatch ? sqlMatch[1].trim() : text.trim();
          sql = sql.replace(/;\s*$/, '').trim();

          const explanationMatch = text.split(/```/)[2];
          const explanation = explanationMatch
            ? explanationMatch.replace(/^Explanation:\s*/i, '').trim()
            : `Consulta SQL analítica generada con Google Gemini (${modelName}).`;

          return { sql, explanation };
        } catch (err: any) {
          console.warn(`[TextToSqlService] Google Gemini (${modelName}) error: ${err.message}. Trying next candidate model...`);
        }
      }
    }

    // 2. OpenAI Fallback
    if (this.openai && env.OPENAI_API_KEY) {
      try {
        const model = this.openai(env.OPENAI_MODEL || 'gpt-4o');
        const response = await generateText({
          model,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.1,
        });

        const text = response.text;
        const sqlMatch = text.match(/```sql([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
        const sql = sqlMatch ? sqlMatch[1].trim() : text.trim();

        const explanationMatch = text.split(/```/)[2];
        const explanation = explanationMatch
          ? explanationMatch.replace(/^Explanation:\s*/i, '').trim()
          : 'Consulta SQL analítica generada con OpenAI.';

        return { sql, explanation };
      } catch (err: any) {
        console.warn(`[TextToSqlService] OpenAI API error: ${err.message}. Using heuristic fallback.`);
      }
    }

    // 3. Heuristic Fallback Engine (Offline Mode / Demo without API Keys)
    return this.generateHeuristicFallback(userPrompt, schema, dialect);
  }

  /**
   * Generates a comprehensive Executive Business Report analyzing the SQL query results.
   */
  public static async generateExecutiveReport(
    userPrompt: string,
    sql: string,
    results: QueryResult,
    classification?: { industry?: string; dataDomain?: string; sourceErp?: string; analysisGoal?: string }
  ): Promise<string> {
    const rows = results.rows || [];
    if (rows.length === 0) {
      return '### 📌 Resumen\nNo se encontraron registros en la base de datos para los criterios consultados.';
    }

    // Provide a sample of rows to the LLM (up to 20 rows) for concise inference
    const sampleRows = rows.slice(0, 20);
    const rowsJson = JSON.stringify(sampleRows, null, 2);

    const reportPrompt = `
Eres el Asesor Financiero & Analista de Negocios Senior de "ANEXAR — Consultoría Contable & Tecnológica".
El usuario realizó la siguiente consulta en lenguaje natural sobre su base de datos PostgreSQL:
"${userPrompt}"

Consulta SQL ejecutada exitosamente:
\`\`\`sql
${sql}
\`\`\`

Resultados obtenidos (${results.rowCount} registros totales en la base de datos, tiempo de ejecución: ${results.executionTimeMs} ms):
\`\`\`json
${rowsJson}
\`\`\`

${classification?.industry ? `Sector/Rubro: ${classification.industry}` : ''}
${classification?.dataDomain ? `Área Contable/Operativa: ${classification.dataDomain}` : ''}
${classification?.analysisGoal ? `Objetivo Estratégico: ${classification.analysisGoal}` : ''}

Por favor genera un INFORME EJECUTIVO PROFESIONAL y riguroso en formato Markdown, estructurado exactamente con las siguientes secciones:

### 📌 Resumen Ejecutivo
(1 o 2 párrafos concisos con las conclusiones directas de los datos para la dirección general)

### 📊 Hallazgos y Métricas Relevantes
(3 a 5 puntos destacados con cifras concretas, porcentajes, promedios o valores máximos observados en los datos)

### ⚠️ Detección de Riesgos / Oportunidades
(Análisis crítico de desvíos, concentración, morosidad, rotación o impacto en liquidez/márgenes)

### 🎯 Recomendaciones Accionables de ANEXAR
(2 o 3 sugerencias concretas y financieras para la toma de decisiones gerenciales)
`.trim();

    // 1. Try Google Gemini API with candidate models
    if (this.genAI && env.GEMINI_API_KEY && (env.LLM_PROVIDER === 'gemini' || env.LLM_PROVIDER === 'auto')) {
      const models = this.getGeminiModelsToTry();
      for (const modelName of models) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.2,
            },
          });
          const result = await model.generateContent(reportPrompt);
          return result.response.text();
        } catch (err: any) {
          console.warn(`[TextToSqlService] Google Gemini (${modelName}) Report generation error: ${err.message}`);
        }
      }
    }

    // 2. Try OpenAI Fallback
    if (this.openai && env.OPENAI_API_KEY) {
      try {
        const model = this.openai(env.OPENAI_MODEL || 'gpt-4o');
        const response = await generateText({
          model,
          prompt: reportPrompt,
          temperature: 0.2,
        });
        return response.text;
      } catch (err: any) {
        console.warn(`[TextToSqlService] OpenAI Report generation error: ${err.message}`);
      }
    }

    // 3. Fallback Report Generation
    return `### 📌 Resumen Ejecutivo
Se ejecutó con éxito la consulta sobre la base de datos PostgreSQL, analizando **${results.rowCount} registros** en **${results.executionTimeMs} ms**.

### 📊 Métricas Observadas
- **Total de registros recuperados:** ${results.rowCount}
- **Columnas estructuradas:** ${results.fields.map((f) => `\`${f.name}\``).join(', ')}

### 🎯 Recomendaciones
- Para habilitar diagnósticos analíticos e informes predictivos completos en tiempo real con IA, verifique su \`GEMINI_API_KEY\` en el archivo \`.env\`.`;
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

    // If table name contains spaces, hyphens, or is reserved, ALWAYS quote with double quotes
    const quote = (name: string) => {
      if (!name) return '';
      if (name.includes(' ') || name.includes('-') || dialect === 'sqlite' || dialect === 'postgresql') {
        return `"${name}"`;
      }
      return name;
    };

    // Sales by period / remitos / comprobantes pattern
    if (
      lowerPrompt.includes('venta') ||
      lowerPrompt.includes('periodo') ||
      lowerPrompt.includes('remito') ||
      lowerPrompt.includes('comprobante')
    ) {
      const targetTable =
        schema.find(
          (t) =>
            t.tableName.toLowerCase().includes('comprobante') ||
            t.tableName.toLowerCase().includes('venta') ||
            t.tableName.toLowerCase().includes('remito')
        )?.tableName || firstTable;

      return {
        sql: `SELECT \n  ${quote('periodo') || "'2025-Q1'"} AS periodo,\n  COUNT(*) AS total_documentos,\n  SUM(total) AS total_ventas\nFROM ${quote(targetTable)}\nGROUP BY 1\nORDER BY 1 DESC`,
        explanation: `Consolidación de ventas y cantidad de comprobantes por período sobre la entidad ${targetTable}.`,
      };
    }

    // Common KPI patterns
    if (lowerPrompt.includes('ebitda') || lowerPrompt.includes('margen') || lowerPrompt.includes('operativo')) {
      return {
        sql: `SELECT \n  ${quote('periodo') || "'2025-Q1'"} AS periodo,\n  SUM(ingresos_operativos) AS ingresos_totales,\n  SUM(costo_ventas) AS costo_mercaderias,\n  SUM(gastos_admin + gastos_comercializacion) AS opex,\n  ROUND((SUM(ingresos_operativos - costo_ventas - gastos_admin - gastos_comercializacion) / NULLIF(SUM(ingresos_operativos), 0)) * 100, 2) AS margen_ebitda\nFROM ${quote(firstTable)}\nGROUP BY 1\nORDER BY 1 DESC`,
        explanation: 'Cálculo de EBITDA y margen operativo porcentual proyectado por período.',
      };
    }

    if (lowerPrompt.includes('aging') || lowerPrompt.includes('cobrar') || lowerPrompt.includes('mora')) {
      return {
        sql: `SELECT \n  cliente,\n  SUM(CASE WHEN dias_mora <= 30 THEN saldo ELSE 0 END) AS corriente_30d,\n  SUM(CASE WHEN dias_mora BETWEEN 31 AND 60 THEN saldo ELSE 0 END) AS mora_31_60d,\n  SUM(CASE WHEN dias_mora BETWEEN 61 AND 90 THEN saldo ELSE 0 END) AS mora_61_90d,\n  SUM(CASE WHEN dias_mora > 90 THEN saldo ELSE 0 END) AS mora_critica_mas90d,\n  SUM(saldo) AS deuda_total\nFROM ${quote(firstTable)}\nGROUP BY cliente\nORDER BY deuda_total DESC\nLIMIT 20`,
        explanation: 'Estratificación por antigüedad de saldos (Aging) de créditos por cobrar.',
      };
    }

    if (lowerPrompt.includes('rotacion') || lowerPrompt.includes('inventario') || lowerPrompt.includes('stock')) {
      return {
        sql: `SELECT \n  categoria_producto,\n  SUM(costo_ventas_anual) AS costo_anual,\n  AVG(stock_valorizado) AS stock_promedio,\n  ROUND(SUM(costo_ventas_anual) / NULLIF(AVG(stock_valorizado), 0), 2) AS rotacion_inventario,\n  ROUND((AVG(stock_valorizado) / NULLIF(SUM(costo_ventas_anual), 0)) * 365, 0) AS dias_calle_inventario\nFROM ${quote(firstTable)}\nGROUP BY categoria_producto\nORDER BY rotacion_inventario ASC`,
        explanation: 'Rotación de inventario anual y cálculo de días promedio de permanencia en stock (DSI).',
      };
    }

    // Default overview query
    const sampleCols = colNames.length > 0 ? colNames.slice(0, 5).map(quote).join(', ') : '*';
    return {
      sql: `SELECT ${sampleCols}\nFROM ${quote(firstTable)}\nLIMIT 50`,
      explanation: `Exploración preliminar de las primeras 50 filas de la entidad ${firstTable}.`,
    };
  }
}
