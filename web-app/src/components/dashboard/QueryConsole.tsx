import React, { useState } from 'react';
import {
  Play,
  Terminal,
  ShieldCheck,
  Database,
  Calendar,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useConnectionStore } from '../../store/useConnectionStore';
import { useStrategyStore } from '../../store/useStrategyStore';

interface QueryConsoleProps {
  onOpenConnectModal: () => void;
  onOpenMarketplaceModal: () => void;
}

export const QueryConsole: React.FC<QueryConsoleProps> = ({
  onOpenConnectModal,
  onOpenMarketplaceModal,
}) => {
  const { engine, isConnected, schema, ephemeralFiles } = useConnectionStore();
  const { isExecuting, queryResponse, executeQuery, error } = useStrategyStore();

  const [promptInput, setPromptInput] = useState('');
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Threshold Alert configuration state
  const [enableAlert, setEnableAlert] = useState(false);
  const [metricName, setMetricName] = useState('margen_ebitda');
  const [operator, setOperator] = useState<'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'EQUALS'>('LESS_THAN');
  const [thresholdVal, setThresholdVal] = useState<number>(20);
  const [syncCalendar, setSyncCalendar] = useState(false);

  const handleRun = async () => {
    if (!promptInput.trim()) return;

    await executeQuery({
      prompt: promptInput,
      threshold: enableAlert
        ? {
            conditionMetric: metricName,
            operator,
            thresholdValue: Number(thresholdVal),
          }
        : undefined,
    });
  };

  const handleQuickQuestion = (q: string) => {
    setPromptInput(q);
  };

  const rows = queryResponse?.results?.rows || [];
  const fields = queryResponse?.results?.fields || [];
  const firstNumericKey = fields.find(
    (f) => typeof rows[0]?.[f.name] === 'number'
  )?.name;
  const firstStringKey = fields.find(
    (f) => typeof rows[0]?.[f.name] === 'string'
  )?.name || fields[0]?.name;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Connection Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isConnected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {isConnected
                  ? engine === 'memory-file'
                    ? `Archivos en Memoria (${ephemeralFiles.length} cargados)`
                    : 'PostgreSQL Activo'
                  : 'Sin Fuente Conectada'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isConnected ? 'ZERO-RETENTION ACTIVO' : 'MODO DEMO / DESCONECTADO'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isConnected
                ? `${schema.length} tablas introspeccionadas listas para consultar.`
                : 'Conecte una base de datos o suba un archivo Excel/CSV para consultar sus propios datos.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMarketplaceModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Marketplace de KPIs</span>
          </button>

          <button
            onClick={onOpenConnectModal}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-500/20"
          >
            <Database className="w-4 h-4" />
            <span>{isConnected ? 'Cambiar Fuente' : 'Conectar Datos'}</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="rounded-2xl bg-navy-950 border border-slate-800 p-5 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Consulta en Lenguaje Natural (Text-to-SQL)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Terminal className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Ej. Calcular el EBITDA mensual y graficar el margen operativo proyectado..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button
              onClick={handleRun}
              disabled={isExecuting || !promptInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/25 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isExecuting ? 'Procesando...' : 'Ejecutar Consulta'}</span>
            </button>
          </div>
        </div>

        {/* Quick Questions Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px]">Sugerencias frecuentes:</span>
          {[
            'EBITDA y margen operativo mensual',
            'Aging de cuentas por cobrar por tramo de mora',
            'Rotación de stock y días calle de inventario',
            'Conciliación bancaria contra libro mayor',
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(q)}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer text-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Threshold & Google Calendar Alert Panel (Collapsible) */}
        <div className="pt-3 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={enableAlert}
                onChange={(e) => setEnableAlert(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-brand-600"
              />
              <span>Configurar Alerta de Umbral y Sincronización en Google Calendar</span>
            </label>
            <span className="text-[11px] text-slate-500">Módulo 4: Evaluador de Umbrales</span>
          </div>

          {enableAlert && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Métrica en SQL:</label>
                <input
                  type="text"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  placeholder="ej. margen_ebitda"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Operador:</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value="LESS_THAN">Menor que (&lt;)</option>
                  <option value="GREATER_THAN">Mayor que (&gt;)</option>
                  <option value="LESS_EQUAL">Menor o igual (&lt;=)</option>
                  <option value="GREATER_EQUAL">Mayor o igual (&gt;=)</option>
                  <option value="EQUALS">Igual (==)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Valor Umbral:</label>
                <input
                  type="number"
                  value={thresholdVal}
                  onChange={(e) => setThresholdVal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 py-2">
                  <input
                    type="checkbox"
                    checked={syncCalendar}
                    onChange={(e) => setSyncCalendar(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-brand-600"
                  />
                  <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Google Calendar Sync</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execution Results View */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error en la ejecución analítica</p>
            <p className="text-xs text-rose-300/90 mt-1">{error}</p>
          </div>
        </div>
      )}

      {queryResponse && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-4">
          {/* Status Header */}
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>SQL Firewall: {queryResponse.firewall.policy}</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{queryResponse.results.executionTimeMs} ms</span>
              </span>
              <span className="text-xs text-slate-400">
                {queryResponse.results.rowCount} registros
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeView === 'chart'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Gráfico</span>
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeView === 'table'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
            </div>
          </div>

          {/* Generated SQL Accordion */}
          <div className="px-6">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">SQL Validado (BEGIN READ ONLY):</span>
                <span className="font-mono text-[11px] text-emerald-400">node-sql-parser OK</span>
              </div>
              <pre className="text-xs font-mono text-brand-300 overflow-x-auto leading-relaxed">
                <code>{queryResponse.sql}</code>
              </pre>
            </div>
          </div>

          {/* Threshold alert banner */}
          {queryResponse.thresholdEvaluation && (
            <div
              className={`mx-6 p-4 rounded-xl text-xs flex items-center gap-3 ${
                queryResponse.thresholdEvaluation.isTriggered
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {queryResponse.thresholdEvaluation.isTriggered ? (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="font-medium">
                {queryResponse.thresholdEvaluation.message}
              </span>
            </div>
          )}

          {/* Visualization Body */}
          <div className="p-6">
            {activeView === 'chart' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Mapeo de Datos: {firstStringKey} vs {firstNumericKey}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                        chartType === 'bar' ? 'bg-slate-800 text-white' : 'text-slate-500'
                      }`}
                    >
                      Barras
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                        chartType === 'line' ? 'bg-slate-800 text-white' : 'text-slate-500'
                      }`}
                    >
                      Líneas
                    </button>
                  </div>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={rows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey={firstStringKey} stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={firstNumericKey || ''}
                          stroke="#0ea5e9"
                          strokeWidth={2.5}
                          dot={{ fill: '#38bdf8', r: 4 }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={rows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey={firstStringKey} stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar
                          dataKey={firstNumericKey || ''}
                          fill="#0284c7"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase font-semibold text-slate-400 tracking-wider sticky top-0">
                    <tr>
                      {fields.map((f, i) => (
                        <th key={i} className="px-4 py-3 border-b border-slate-800">
                          {f.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                    {rows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50">
                        {fields.map((f, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5">
                            {r[f.name] !== null && r[f.name] !== undefined
                              ? String(r[f.name])
                              : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

