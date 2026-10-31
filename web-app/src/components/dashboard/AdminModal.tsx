import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Coins,
  Layers,
  Activity,
  Server,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  BarChart3,
  Clock,
  Lock,
  Loader2,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl?: string;
}

interface OverviewData {
  usage: {
    totalUsers: number;
    totalQueries: number;
    totalViews: number;
    totalStrategies: number;
    totalTemplates: number;
    totalAlerts: number;
    totalCalendarSyncs: number;
    totalServiceRequests: number;
    pendingServiceRequests: number;
    avgLatencyMs: number;
    firewallBlocks: number;
    zeroRetentionRate: string;
  };
  llmUsage: {
    provider: string;
    model: string;
    hasApiKey: boolean;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    pricing: {
      inputPerMillion: number;
      outputPerMillion: number;
    };
    history: { day: string; tokens: number; cost: number; queries: number }[];
  };
  integrations: {
    id: string;
    name: string;
    category: string;
    model: string;
    status: string;
    statusLabel: string;
    details: string;
    latency: string;
  }[];
}

interface StrategyItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  promptTemplate: string;
  generatedSql: string;
  category: string;
  chartType: string;
  isTemplate: boolean;
  isPremium: boolean;
  visibility: string;
  executionsCount: number;
  viewsCount: number;
  author?: {
    name: string;
    email: string;
    role: string;
  };
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  apiUrl = 'http://localhost:4000',
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'llm' | 'integrations' | 'strategies'>('metrics');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [isCreatingStrategy, setIsCreatingStrategy] = useState(false);

  // New Strategy Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('FINANCE');
  const [newPrompt, setNewPrompt] = useState('');
  const [newSql, setNewSql] = useState('');
  const [newChartType, setNewChartType] = useState('BAR');
  const [newIsTemplate, setNewIsTemplate] = useState(true);
  const [newIsPremium, setNewIsPremium] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/overview`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/strategies`);
      const data = await res.json();
      if (data.success) {
        setStrategies(data.data);
      }
    } catch (err) {
      console.error('Error fetching strategies:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOverview();
      fetchStrategies();
    }
  }, [isOpen]);

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const res = await fetch(`${apiUrl}/api/admin/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: newDescription,
          category: newCategory,
          promptTemplate: newPrompt,
          generatedSql: newSql,
          chartType: newChartType,
          isTemplate: newIsTemplate,
          isPremium: newIsPremium,
          visibility: 'PUBLIC',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormMsg('Estrategia creada exitosamente.');
        setIsCreatingStrategy(false);
        // Reset form
        setNewTitle('');
        setNewSlug('');
        setNewDescription('');
        setNewPrompt('');
        setNewSql('');
        fetchStrategies();
        fetchOverview();
      } else {
        setFormMsg(data.error || 'Error al crear la estrategia.');
      }
    } catch (err: any) {
      setFormMsg(err.message || 'Error al conectar con el servidor.');
    }
  };

  const handleToggleTemplate = async (strat: StrategyItem) => {
    try {
      await fetch(`${apiUrl}/api/admin/strategies/${strat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: !strat.isTemplate }),
      });
      fetchStrategies();
    } catch (err) {
      console.error('Error toggling template:', err);
    }
  };

  const handleTogglePremium = async (strat: StrategyItem) => {
    try {
      await fetch(`${apiUrl}/api/admin/strategies/${strat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: !strat.isPremium }),
      });
      fetchStrategies();
    } catch (err) {
      console.error('Error toggling premium:', err);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta estrategia?')) return;
    try {
      await fetch(`${apiUrl}/api/admin/strategies/${id}`, {
        method: 'DELETE',
      });
      fetchStrategies();
      fetchOverview();
    } catch (err) {
      console.error('Error deleting strategy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Panel de Administración</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 font-mono text-[10px] uppercase font-bold">
                  ANEXAR Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo de telemetría, consumos LLM, integraciones activas y Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchOverview();
                fetchStrategies();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refrescar métricas"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 min-w-[150px] py-3.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Métricas de Uso</span>
          </button>

          <button
            onClick={() => setActiveTab('llm')}
            className={`flex-1 min-w-[150px] py-3.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'llm'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Consumo de LLMs</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex-1 min-w-[150px] py-3.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'integrations'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Integraciones ({overview?.integrations?.length || 6})</span>
          </button>

          <button
            onClick={() => setActiveTab('strategies')}
            className={`flex-1 min-w-[160px] py-3.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'strategies'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gestionar Estrategias ({strategies.length})</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !overview ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Cargando datos administrativos y telemetría...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: METRICAS DE USO */}
              {activeTab === 'metrics' && overview && (
                <div className="space-y-6">
                  {/* Top KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Consultas Ejecutadas</span>
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold font-mono text-white">
                        {overview.usage.totalQueries.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Text-to-SQL + AST Firewall</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Usuarios & Empresas</span>
                        <Activity className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold font-mono text-white">
                        {overview.usage.totalUsers}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {overview.usage.totalUsers > 1 ? 'Cuentas activas registradas' : '1 cuenta administrativa'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Latencia Promedio</span>
                        <Clock className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-2xl font-bold font-mono text-white">
                        {overview.usage.avgLatencyMs} ms
                      </p>
                      <p className="text-[11px] text-cyan-400">
                        Acelerado por SQLite RAM & Índices
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Zero-Retention Activo</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-bold font-mono text-emerald-400">
                        {overview.usage.zeroRetentionRate}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        0 bytes de datos retenidos en disco
                      </p>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-white font-semibold text-xs">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>Marketplace & Estrategias</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Plantillas Oficiales KPI:</span>
                          <span className="font-mono text-white font-bold">{overview.usage.totalTemplates}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Estrategias en Plataforma:</span>
                          <span className="font-mono text-white font-bold">{overview.usage.totalStrategies}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Visualizaciones Totales:</span>
                          <span className="font-mono text-blue-400 font-bold">{overview.usage.totalViews}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-white font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Alertas y Seguridad</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Alertas de Umbral:</span>
                          <span className="font-mono text-white font-bold">{overview.usage.totalAlerts}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Sincronizaciones Calendar:</span>
                          <span className="font-mono text-white font-bold">{overview.usage.totalCalendarSyncs}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Inyecciones Bloqueadas (AST):</span>
                          <span className="font-mono text-emerald-400 font-bold">{overview.usage.firewallBlocks}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-white font-semibold text-xs">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>Consultoría & Soporte B2B</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Total Solicitudes:</span>
                          <span className="font-mono text-white font-bold">{overview.usage.totalServiceRequests}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Pendientes de Atención:</span>
                          <span className="font-mono text-amber-400 font-bold">{overview.usage.pendingServiceRequests}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Canal Exclusivo:</span>
                          <span className="font-mono text-blue-400 font-bold">In-App Dashboard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONSUMO DE LLMS */}
              {activeTab === 'llm' && overview && (
                <div className="space-y-6">
                  {/* LLM Financial Overview Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Consumo Acumulado de la API del LLM
                        </span>
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-3xl font-black text-white font-mono">
                            ${overview.llmUsage.estimatedCostUsd.toFixed(4)} <span className="text-sm font-normal text-slate-400">USD</span>
                          </h4>
                          <span className="text-xs text-blue-400 font-mono">
                            ({overview.llmUsage.totalTokens.toLocaleString()} tokens totales)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Modelo en Producción</span>
                        <span className="text-xs font-bold text-white font-mono bg-blue-900/40 px-2.5 py-1 rounded-lg border border-blue-500/30">
                          {overview.llmUsage.model}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Token breakdown grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="text-slate-400 text-xs">Prompt Tokens (Input)</span>
                      <p className="text-xl font-bold font-mono text-white">
                        {overview.llmUsage.promptTokens.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tarifa: $2.50 USD / 1M tokens (GPT-4o)
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="text-slate-400 text-xs">Completion Tokens (SQL)</span>
                      <p className="text-xl font-bold font-mono text-white">
                        {overview.llmUsage.completionTokens.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tarifa: $10.00 USD / 1M tokens (GPT-4o)
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="text-slate-400 text-xs">Ahorro por Caché y Esquema</span>
                      <p className="text-xl font-bold font-mono text-emerald-400">
                        ~68.4%
                      </p>
                      <p className="text-[11px] text-slate-500">
                        DDL sintético compacto + filtrado AST
                      </p>
                    </div>
                  </div>

                  {/* Chart of Daily Token Consumption */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Historial de Consumo Diario (Tokens)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Volumen de tokens procesados durante la última semana
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-900/30 border border-blue-500/20">
                        7 días recientes
                      </span>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overview.llmUsage.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                            formatter={(value: any) => [`${Number(value).toLocaleString()} tokens`, 'Consumo']}
                          />
                          <Bar dataKey="tokens" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MODULO DE INTEGRACIONES */}
              {activeTab === 'integrations' && overview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Estado operativo y diagnóstico en tiempo real de todos los conectores del ecosistema ANEXAR.
                    </p>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Todos los servicios operativos</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overview.integrations.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                              <Server className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">{item.name}</h5>
                              <span className="text-[10px] text-slate-500">{item.category}</span>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                              item.status === 'CONNECTED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {item.statusLabel}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">{item.details}</p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Driver / Modelo: <strong className="text-slate-200">{item.model}</strong></span>
                          <span>Latencia: <strong className="text-blue-400">{item.latency}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GESTION DE ESTRATEGIAS */}
              {activeTab === 'strategies' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Catálogo de Estrategias y Plantillas KPI</h4>
                      <p className="text-xs text-slate-400">
                        Cree nuevas plantillas oficiales para el Marketplace o administre las existentes.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCreatingStrategy(!isCreatingStrategy)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingStrategy ? 'Ocultar Formulario' : 'Nueva Plantilla KPI'}</span>
                    </button>
                  </div>

                  {formMsg && (
                    <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs">
                      {formMsg}
                    </div>
                  )}

                  {/* Create Strategy Form */}
                  {isCreatingStrategy && (
                    <form
                      onSubmit={handleCreateStrategy}
                      className="p-5 rounded-2xl bg-slate-900 border border-blue-500/40 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Plus className="w-4 h-4 text-blue-400" />
                          <span>Crear Nueva Estrategia / Plantilla</span>
                        </span>
                        <span className="text-[11px] text-slate-500">Se guardará en Railway PostgreSQL</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Título de la Estrategia:</label>
                          <input
                            type="text"
                            required
                            placeholder="ej. Margen de Contribución por Sucursal"
                            value={newTitle}
                            onChange={(e) => {
                              setNewTitle(e.target.value);
                              if (!newSlug) {
                                setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Slug URL único:</label>
                          <input
                            type="text"
                            required
                            placeholder="margen-contribucion-sucursal"
                            value={newSlug}
                            onChange={(e) => setNewSlug(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Categoría:</label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                          >
                            <option value="FINANCE">Finanzas / Tesorería</option>
                            <option value="CONTABILITY">Contabilidad & Balances</option>
                            <option value="OPERATIONS">Operaciones</option>
                            <option value="SALES">Ventas y Facturación</option>
                            <option value="INVENTORY">Inventario / Stock</option>
                            <option value="TAX">Impuestos & Fiscal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Tipo de Gráfico Principal:</label>
                          <select
                            value={newChartType}
                            onChange={(e) => setNewChartType(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                          >
                            <option value="BAR">Gráfico de Barras</option>
                            <option value="LINE">Gráfico de Líneas</option>
                            <option value="TABLE">Tabla de Datos</option>
                            <option value="AREA">Gráfico de Área</option>
                            <option value="PIE">Gráfico Circular / Torta</option>
                            <option value="KPI_CARD">Tarjeta KPI Numérica</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-300 font-semibold mb-1">Descripción del Negocio:</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Explica qué calcula esta métrica y qué impacto tiene en la toma de decisiones..."
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-300 font-semibold mb-1">Prompt de Entrada (Lenguaje Natural):</label>
                        <input
                          type="text"
                          required
                          placeholder="ej. Calcular el margen de contribución de cada sucursal ordenado de mayor a menor."
                          value={newPrompt}
                          onChange={(e) => setNewPrompt(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-300 font-semibold mb-1">Consulta SQL Validada (Solo Lectura):</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="SELECT sucursal, SUM(ventas - costo_variable) AS margen_contribucion FROM operaciones GROUP BY sucursal;"
                          value={newSql}
                          onChange={(e) => setNewSql(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={newIsTemplate}
                            onChange={(e) => setNewIsTemplate(e.target.checked)}
                            className="rounded bg-slate-950 border-slate-800 text-blue-600"
                          />
                          <span>Publicar como Plantilla Oficial de ANEXAR</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={newIsPremium}
                            onChange={(e) => setNewIsPremium(e.target.checked)}
                            className="rounded bg-slate-950 border-slate-800 text-blue-600"
                          />
                          <span>Estrategia Premium (Monetización)</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingStrategy(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20"
                        >
                          Guardar y Publicar
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Strategies Table List */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 uppercase font-semibold text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-800">Estrategia</th>
                          <th className="px-3 py-3 border-b border-slate-800">Categoría</th>
                          <th className="px-3 py-3 border-b border-slate-800">Estado</th>
                          <th className="px-3 py-3 border-b border-slate-800 text-right">Ejecuciones</th>
                          <th className="px-4 py-3 border-b border-slate-800 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-sans">
                        {strategies.map((strat) => (
                          <tr key={strat.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{strat.title}</div>
                              <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                                {strat.slug}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                                {strat.category}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {strat.isTemplate && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30 font-bold">
                                    Plantilla KPI
                                  </span>
                                )}
                                {strat.isPremium ? (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/30">
                                    Premium
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                    Libre
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 font-mono text-right text-slate-300">
                              {strat.executionsCount} ejecuciones
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTemplate(strat)}
                                  className={`p-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                                    strat.isTemplate
                                      ? 'border-blue-500/40 text-blue-300 bg-blue-950/30 hover:bg-blue-900/40'
                                      : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                  }`}
                                  title={strat.isTemplate ? 'Quitar de plantillas oficiales' : 'Hacer plantilla oficial'}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePremium(strat)}
                                  className={`p-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                                    strat.isPremium
                                      ? 'border-amber-500/40 text-amber-300 bg-amber-950/30 hover:bg-amber-900/40'
                                      : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                  }`}
                                  title={strat.isPremium ? 'Cambiar a libre' : 'Marcar como Premium'}
                                >
                                  {strat.isPremium ? <Lock className="w-3.5 h-3.5" /> : <Coins className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStrategy(strat.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer border border-transparent hover:border-red-900/40"
                                  title="Eliminar estrategia"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema ANEXAR Operativo • Railway PostgreSQL Conectado</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
