import React, { useState } from 'react';
import { X, Database, FileSpreadsheet, ShieldCheck, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useConnectionStore } from '../../store/useConnectionStore';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose }) => {
  const {
    engine,
    postgresCreds,
    ephemeralFiles,
    isConnected,
    isLoading,
    error,
    setEngine,
    setPostgresCreds,
    setEphemeralFiles,
    connect,
    disconnect,
  } = useConnectionStore();

  const [selectedTab, setSelectedTab] = useState<'memory-file' | 'postgres'>(engine);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEphemeralFiles(Array.from(e.target.files));
    }
  };

  const handleConnect = async () => {
    setEngine(selectedTab);
    const success = await connect();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conexión de Datos Efímera</h3>
              <p className="text-xs text-slate-400">Zero-Retention Policy: memoria volátil en Zustand</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Retention Banner */}
        <div className="bg-brand-950/60 px-6 py-3 border-b border-brand-500/20 flex items-center gap-2.5 text-xs text-brand-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Garantía de Seguridad:</strong> Ni sus credenciales ni sus archivos se guardan en el servidor. Existen sólo durante la solicitud.
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setSelectedTab('memory-file')}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              selectedTab === 'memory-file'
                ? 'text-brand-400 border-b-2 border-brand-500 bg-slate-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Archivos Excel / CSV (In-Memory)</span>
          </button>
          <button
            onClick={() => setSelectedTab('postgres')}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              selectedTab === 'postgres'
                ? 'text-brand-400 border-b-2 border-brand-500 bg-slate-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>PostgreSQL (Adapter Directo)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {selectedTab === 'memory-file' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Suba uno o varios archivos <code className="text-brand-300">.xlsx</code> o <code className="text-brand-300">.csv</code>. El backend los montará en una base SQLite en memoria para consultar con SQL estándar sin escribir nada en disco.
              </p>

              <div className="border-2 border-dashed border-slate-700 hover:border-brand-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ephemeral-file-input"
                />
                <label htmlFor="ephemeral-file-input" className="cursor-pointer block space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-200">
                    Haga clic para seleccionar archivos o arrástrelos aquí
                  </p>
                  <p className="text-[11px] text-slate-500">Soporta hojas de balance, mayores, ventas o extractos</p>
                </label>
              </div>

              {ephemeralFiles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Archivos en memoria listos:
                  </span>
                  {ephemeralFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 text-xs text-slate-200"
                    >
                      <span>{f.name}</span>
                      <span className="text-slate-400 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Host / Servidor
                </label>
                <input
                  type="text"
                  placeholder="ej. db.miempresa.com o localhost"
                  value={postgresCreds.host || ''}
                  onChange={(e) => setPostgresCreds({ host: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Puerto
                  </label>
                  <input
                    type="number"
                    value={postgresCreds.port || 5432}
                    onChange={(e) => setPostgresCreds({ port: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Base de Datos
                  </label>
                  <input
                    type="text"
                    placeholder="erp_produccion"
                    value={postgresCreds.database || ''}
                    onChange={(e) => setPostgresCreds({ database: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    placeholder="readonly_user"
                    value={postgresCreds.user || ''}
                    onChange={(e) => setPostgresCreds({ user: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={postgresCreds.password || ''}
                    onChange={(e) => setPostgresCreds({ password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ssl-checkbox"
                  checked={postgresCreds.ssl || false}
                  onChange={(e) => setPostgresCreds({ ssl: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-0"
                />
                <label htmlFor="ssl-checkbox" className="text-xs text-slate-300 cursor-pointer">
                  Habilitar conexión segura SSL (Recomendado para servidores remotos)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {isConnected ? (
            <button
              onClick={disconnect}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
            >
              Desconectar y purgar memoria
            </button>
          ) : (
            <span className="text-xs text-slate-500">Estado: Desconectado</span>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspeccionando esquema...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Conectar e Introspeccionar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

