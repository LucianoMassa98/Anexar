import React, { useState } from 'react';
import { X, Database, FileSpreadsheet, ShieldCheck, Check, AlertCircle, Loader2, Eye, Table as TableIcon } from 'lucide-react';
import { useConnectionStore } from '../../store/useConnectionStore';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewFileData {
  name: string;
  size: number;
  type: 'csv' | 'excel';
  headers: string[];
  rows: string[][];
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
  const [previewFile, setPreviewFile] = useState<PreviewFileData | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEphemeralFiles(Array.from(e.target.files));
      setPreviewFile(null);
    }
  };

  const handleConnect = async () => {
    setEngine(selectedTab);
    const success = await connect();
    if (success) {
      onClose();
    }
  };

  const handlePreviewFile = (file: File) => {
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          const delimiter = lines[0].includes(';') ? ';' : ',';
          const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
          const rows = lines.slice(1, 9).map((line) =>
            line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''))
          );
          setPreviewFile({
            name: file.name,
            size: file.size,
            type: 'csv',
            headers,
            rows,
          });
        } else {
          setPreviewFile({
            name: file.name,
            size: file.size,
            type: 'csv',
            headers: ['Contenido'],
            rows: [['(Archivo CSV sin registros)']],
          });
        }
      };
      reader.readAsText(file);
    } else {
      // Excel File metadata preview
      setPreviewFile({
        name: file.name,
        size: file.size,
        type: 'excel',
        headers: ['Propiedad', 'Detalle'],
        rows: [
          ['Nombre del Archivo', file.name],
          ['Formato', file.name.toLowerCase().endsWith('.xlsx') ? 'Hoja de Cálculo Excel OpenXML (.xlsx)' : 'Libro Excel 97-2004 (.xls)'],
          ['Tamaño en Memoria', `${(file.size / 1024).toFixed(1)} KB`],
          ['Motor de Procesamiento', 'SQLite WebAssembly en RAM volátil (Zero-Retention)'],
        ],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conexión de Datos Efímera</h3>
              <p className="text-xs text-slate-400">Zero-Retention Policy: memoria volátil en Zustand</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Retention Banner */}
        <div className="bg-blue-950/60 px-6 py-3 border-b border-blue-500/20 flex items-center gap-2.5 text-xs text-blue-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            <strong>Garantía de Seguridad:</strong> Ni sus credenciales ni sus archivos se guardan en el servidor. Existen sólo durante la solicitud.
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => {
              setSelectedTab('memory-file');
              setPreviewFile(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              selectedTab === 'memory-file'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Archivos Excel / CSV (In-Memory)</span>
          </button>
          <button
            onClick={() => {
              setSelectedTab('postgres');
              setPreviewFile(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              selectedTab === 'postgres'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/40'
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
                Suba uno o varios archivos <code className="text-blue-300">.xlsx</code> o <code className="text-blue-300">.csv</code>. El backend los montará en una base SQLite en memoria para consultar con SQL estándar sin escribir nada en disco.
              </p>

              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
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

              {/* Uploaded Files List with "Ver" Button */}
              {ephemeralFiles.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Archivos cargados en memoria ({ephemeralFiles.length}):
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {ephemeralFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2 truncate mr-3">
                          <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="truncate font-medium">{f.name}</span>
                          <span className="text-slate-400 font-mono text-[11px] shrink-0">
                            ({(f.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>

                        {/* "Ver" Button */}
                        <button
                          type="button"
                          onClick={() => handlePreviewFile(f)}
                          className="px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-blue-500/30 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Modal File Preview Area */}
              {previewFile && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">
                        Vista Previa: <span className="font-mono text-blue-300">{previewFile.name}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30 uppercase">
                        {previewFile.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewFile(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded hover:bg-slate-800"
                    >
                      Cerrar Vista
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[11px] text-slate-300">
                      <thead className="bg-slate-900 uppercase font-semibold text-slate-400 tracking-wider sticky top-0">
                        <tr>
                          {previewFile.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-3 py-2 border-b border-slate-800 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-mono">
                        {previewFile.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/60">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Mostrando primeras filas de muestra. Al conectar, todos los registros se montan en SQLite volátil para Text-to-SQL.
                  </p>
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ssl-checkbox"
                  checked={postgresCreds.ssl || false}
                  onChange={(e) => setPostgresCreds({ ssl: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-colors"
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
