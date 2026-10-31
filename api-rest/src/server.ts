import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './services/prisma.service';
import analyticsRoutes from './routes/analytics.routes';
import strategyRoutes from './routes/strategy.routes';
import alertRoutes from './routes/alert.routes';
import leadRoutes from './routes/lead.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

const app = express();

// Middlewares
app.use(
  cors({
    origin: [env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ANEXAR Data Analytics REST API',
    brand: 'ANEXAR — Consultoría Contable & Tecnológica',
    zeroRetention: true,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

// Seed Built-In KPI Templates on Startup if Empty
async function seedDefaultTemplates() {
  try {
    const templateCount = await prisma.strategy.count({ where: { isTemplate: true } });
    if (templateCount > 0) return;

    const consultant = await prisma.user.upsert({
      where: { email: 'consultoria@anexar.com.ar' },
      update: {},
      create: {
        email: 'consultoria@anexar.com.ar',
        name: 'Equipo Senior ANEXAR',
        role: 'CONSULTANT',
        company: 'ANEXAR Consultoría Contable & Tecnológica',
      },
    });

    const defaultTemplates = [
      {
        title: 'EBITDA y Margen Operativo Mensual',
        slug: 'ebitda-margen-operativo-mensual',
        description: 'Calcula el Resultado Operativo antes de Depreciaciones y Amortizaciones junto con el porcentaje de rentabilidad sobre ingresos netos.',
        promptTemplate: 'Calcular el EBITDA y margen operativo mensual del último ejercicio económico.',
        generatedSql: `SELECT \n  periodo,\n  SUM(ingresos_operativos) AS ingresos_totales,\n  SUM(costo_mercaderias) AS costo_ventas,\n  SUM(gastos_comerciales + gastos_admin) AS opex,\n  SUM(ingresos_operativos - costo_mercaderias - gastos_comerciales - gastos_admin) AS ebitda,\n  ROUND((SUM(ingresos_operativos - costo_mercaderias - gastos_comerciales - gastos_admin) / NULLIF(SUM(ingresos_operativos), 0)) * 100, 2) AS margen_ebitda\nFROM balance_mensual\nGROUP BY periodo\nORDER BY periodo ASC;`,
        chartType: 'BAR' as const,
        category: 'FINANCE' as const,
        visibility: 'PUBLIC' as const,
        isPremium: false,
        isTemplate: true,
        authorId: consultant.id,
      },
      {
        title: 'Aging de Cuentas por Cobrar (Créditos Morosos)',
        slug: 'aging-cuentas-por-cobrar-creditos-morosos',
        description: 'Estratificación de saldos impagos por antigüedad de vencimiento (0-30 días, 31-60 días, 61-90 días y mora crítica >90 días).',
        promptTemplate: 'Estratificar las cuentas por cobrar por tramo de antigüedad de deuda para auditoría de cartera.',
        generatedSql: `SELECT \n  razon_social AS cliente,\n  SUM(CASE WHEN dias_mora <= 30 THEN saldo_pendiente ELSE 0 END) AS corriente_0_30d,\n  SUM(CASE WHEN dias_mora BETWEEN 31 AND 60 THEN saldo_pendiente ELSE 0 END) AS mora_31_60d,\n  SUM(CASE WHEN dias_mora BETWEEN 61 AND 90 THEN saldo_pendiente ELSE 0 END) AS mora_61_90d,\n  SUM(CASE WHEN dias_mora > 90 THEN saldo_pendiente ELSE 0 END) AS mora_critica_90d,\n  SUM(saldo_pendiente) AS deuda_total\nFROM clientes_creditos\nGROUP BY razon_social\nORDER BY deuda_total DESC\nLIMIT 25;`,
        chartType: 'BAR' as const,
        category: 'CONTABILITY' as const,
        visibility: 'PUBLIC' as const,
        isPremium: true,
        isTemplate: true,
        authorId: consultant.id,
      },
      {
        title: 'Rotación de Inventario y Días Calle (DSI)',
        slug: 'rotacion-inventario-dias-calle-dsi',
        description: 'Mide la eficiencia del capital de trabajo inmovilizado calculando el coeficiente de rotación de stock y días promedio en bodega.',
        promptTemplate: 'Analizar la rotación de inventarios y días de permanencia por categoría de producto.',
        generatedSql: `SELECT \n  linea_producto,\n  SUM(costo_ventas) AS costo_anual,\n  AVG(stock_valorizado) AS inventario_promedio,\n  ROUND(SUM(costo_ventas) / NULLIF(AVG(stock_valorizado), 0), 2) AS rotacion_veces,\n  ROUND((AVG(stock_valorizado) / NULLIF(SUM(costo_ventas), 0)) * 365, 0) AS dias_calle_stock\nFROM inventarios\nGROUP BY linea_producto\nORDER BY dias_calle_stock DESC;`,
        chartType: 'LINE' as const,
        category: 'OPERATIONS' as const,
        visibility: 'PUBLIC' as const,
        isPremium: false,
        isTemplate: true,
        authorId: consultant.id,
      },
      {
        title: 'Conciliación Bancaria vs. Libro Mayor',
        slug: 'conciliacion-bancaria-vs-libro-mayor',
        description: 'Cruza extractos bancarios contra asientos de la cuenta 1.1.1.01 (Bancos) identificando partidas pendientes, cheques no debitados y depósitos en tránsito.',
        promptTemplate: 'Generar reporte de conciliación contable entre extractos bancarios y mayor de contabilidad.',
        generatedSql: `SELECT \n  b.fecha_movimiento,\n  b.referencia_bancaria,\n  b.monto_extracto,\n  m.monto_libro_mayor,\n  (COALESCE(b.monto_extracto, 0) - COALESCE(m.monto_libro_mayor, 0)) AS diferencia_partida\nFROM extracto_bancario b\nFULL OUTER JOIN mayor_contable m \n  ON b.id_comprobante = m.id_comprobante\nWHERE COALESCE(b.monto_extracto, 0) != COALESCE(m.monto_libro_mayor, 0)\nORDER BY b.fecha_movimiento DESC;`,
        chartType: 'TABLE' as const,
        category: 'CONTABILITY' as const,
        visibility: 'PUBLIC' as const,
        isPremium: true,
        isTemplate: true,
        authorId: consultant.id,
      },
    ];

    for (const t of defaultTemplates) {
      await prisma.strategy.create({ data: t });
    }
    console.log('[Anexar API] Plantillas estándar de KPI contable y financiero inicializadas con éxito.');
  } catch (err: any) {
    console.warn(`[Anexar API] Template seeding skipped (DB connection pending): ${err.message}`);
  }
}

// Start Server
const server = app.listen(env.PORT, async () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════════════╗
  ║   ANEXAR — Consultoría Contable & Tecnológica                      ║
  ║   Data Analytics Platform (Text-to-SQL & Zero-Retention Engine)   ║
  ╠════════════════════════════════════════════════════════════════════╣
  ║   API Rest running on port: ${env.PORT}                                   ║
  ║   Environment: ${env.NODE_ENV}                                     ║
  ║   Zero-Retention Policy: ACTIVE (Ephemeral state memory only)     ║
  ║   SQL Firewall (node-sql-parser AST): ENFORCED                     ║
  ║   Google Calendar OAuth: ENABLED                                   ║
  ╚════════════════════════════════════════════════════════════════════╝
  `);

  await seedDefaultTemplates();
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('[Anexar API] SIGTERM recibido. Cerrando conexiones...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

export default app;
