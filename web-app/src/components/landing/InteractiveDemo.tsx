import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { Play, Sparkles, ShieldCheck, Terminal, Layers } from 'lucide-react';

export const InteractiveDemo: React.FC = () => {
  const sampleScenarios = [
    {
      id: 'ebitda',
      label: 'EBITDA Mensual',
      prompt: 'Calcular el EBITDA y margen operativo porcentual proyectado por mes',
      sql: `SELECT \n  periodo,\n  SUM(ingresos_operativos) AS ingresos,\n  SUM(ebitda) AS ebitda,\n  ROUND((SUM(ebitda) / NULLIF(SUM(ingresos_operativos), 0)) * 100, 1) AS margen_ebitda\nFROM balance_mensual\nGROUP BY periodo\nORDER BY periodo ASC;`,
      chartType: 'bar',
      data: [
        { periodo: 'Ene', ingresos: 125000, ebitda: 31250, margen_ebitda: 25.0 },
        { periodo: 'Feb', ingresos: 138000, ebitda: 37260, margen_ebitda: 27.0 },
        { periodo: 'Mar', ingresos: 152000, ebitda: 42560, margen_ebitda: 28.0 },
        { periodo: 'Abr', ingresos: 145000, ebitda: 36250, margen_ebitda: 25.0 },
        { periodo: 'May', ingresos: 168000, ebitda: 50400, margen_ebitda: 30.0 },
        { periodo: 'Jun', ingresos: 185000, ebitda: 59200, margen_ebitda: 32.0 },
      ],
      alertText: '✅ Umbral Nominal: Margen EBITDA promedio superó el piso establecido del 20%.',
    },
    {
      id: 'aging',
      label: 'Aging de Deuda (Mora)',
      prompt: 'Estratificar los créditos por cobrar por tramo de mora de clientes principales',
      sql: `SELECT \n  cliente,\n  SUM(corriente_30d) AS corriente,\n  SUM(mora_31_60d) AS mora_media,\n  SUM(mora_critica_90d) AS mora_critica\nFROM cartera_creditos\nGROUP BY cliente\nORDER BY (corriente + mora_media + mora_critica) DESC\nLIMIT 5;`,
      chartType: 'bar_stacked',
      data: [
        { cliente: 'Distribuidora Norte', corriente: 45000, mora_media: 12000, mora_critica: 4000 },
        { cliente: 'Industrias Cuyo', corriente: 62000, mora_media: 8000, mora_critica: 1500 },
        { cliente: 'Supermercados del Sur', corriente: 38000, mora_media: 15000, mora_critica: 9200 },
        { cliente: 'Logística Platense', corriente: 51000, mora_media: 6000, mora_critica: 800 },
        { cliente: 'Alimentos Centro', corriente: 29000, mora_media: 19000, mora_critica: 14000 },
      ],
      alertText: '🚨 Alerta: Alimentos Centro registra más de $14.000 en tramo crítico >90 días.',
    },
    {
      id: 'rotacion',
      label: 'Días Calle Stock (DSI)',
      prompt: 'Analizar la rotación y días promedio de stock por categoría de producto',
      sql: `SELECT \n  categoria,\n  ROUND((AVG(stock) / NULLIF(SUM(costo_ventas), 0)) * 365, 0) AS dias_calle\nFROM inventarios\nGROUP BY categoria;`,
      chartType: 'line',
      data: [
        { categoria: 'Electrónica', dias_calle: 42 },
        { categoria: 'Ferretería', dias_calle: 78 },
        { categoria: 'Construcción', dias_calle: 95 },
        { categoria: 'Pinturería', dias_calle: 61 },
        { categoria: 'Herramientas', dias_calle: 54 },
      ],
      alertText: '⚠️ Atención de Gestión: Categoría Construcción inmoviliza capital durante 95 días.',
    },
  ];

  const [activeScenario, setActiveScenario] = useState(sampleScenarios[0]);

  return (
    <section className="py-20 bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-cyan-400 font-semibold text-xs tracking-wider uppercase px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Demostración Interactiva
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            Poder analítico instantáneo en lenguaje natural
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Vea cómo Anexar traduce preguntas de negocio complejas en SQL seguro, ejecutado en memoria y graficado en tiempo real.
          </p>
        </div>

        {/* Scenario selector tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {sampleScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeScenario.id === sc.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span>{sc.label}</span>
            </button>
          ))}
        </div>

        {/* Demo Playground Box */}
        <div className="rounded-2xl bg-navy-950 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 ml-2">
                <Terminal className="w-3.5 h-3.5 text-brand-400" />
                <span>anexar://text-to-sql-session</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SQL Firewall: AST Validated</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>Zero-Retention RAM Engine</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Left Column: Natural Language Prompt + Generated SQL */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Prompt en Lenguaje Natural:
                </label>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm font-medium flex items-center justify-between gap-3">
                  <span>"{activeScenario.prompt}"</span>
                  <Play className="w-4 h-4 text-brand-400 fill-brand-400 shrink-0" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    SQL Read-Only Generado:
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400">BEGIN READ ONLY</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-brand-300 font-mono text-xs leading-relaxed overflow-x-auto">
                  <code>{activeScenario.sql}</code>
                </pre>
              </div>

              {/* Alert threshold notice */}
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                <p className="font-medium text-slate-200 mb-1">Monitoreo de Umbral:</p>
                <p className="font-mono text-xs">{activeScenario.alertText}</p>
              </div>
            </div>

            {/* Right Column: Recharts Visualization */}
            <div className="lg:col-span-7 p-6 bg-slate-950/40 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{activeScenario.label}</h4>
                  <p className="text-xs text-slate-400">Visualización interactiva generada automáticamente</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  6 registros evaluados en 28ms
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {activeScenario.chartType === 'line' ? (
                    <LineChart data={activeScenario.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="categoria" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} unit="d" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="dias_calle"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ fill: '#38bdf8', r: 5 }}
                        name="Días Calle"
                      />
                    </LineChart>
                  ) : activeScenario.chartType === 'bar_stacked' ? (
                    <BarChart data={activeScenario.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="cliente" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={11} unit="$" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Bar dataKey="corriente" stackId="a" fill="#10b981" name="0-30d Corriente" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="mora_media" stackId="a" fill="#f59e0b" name="31-60d Mora" />
                      <Bar dataKey="mora_critica" stackId="a" fill="#ef4444" name=">90d Crítica" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={activeScenario.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="periodo" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} unit="$" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Bar dataKey="ingresos" fill="#334155" name="Ingresos" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ebitda" fill="#0284c7" name="EBITDA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Fuente de datos: SQLite In-Memory (Zero-Retention)</span>
                <span className="text-brand-400 font-medium">Recharts Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
