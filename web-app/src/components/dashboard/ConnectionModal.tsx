import React, { useState } from 'react';
import {
  X,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Table as TableIcon,
  Trash2,
  UploadCloud,
} from 'lucide-react';
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
    addEphemeralFiles,
    removeEphemeralFile,
    clearEphemeralFiles,
    connect,
    disconnect,
  } = useConnectionStore();

  const [selectedTab, setSelectedTab] = useState<'memory-file' | 'database'>(
    engine === 'memory-file' ? 'memory-file' : 'database'
  );
  const [selectedDbEngine, setSelectedDbEngine] = useState<'postgres' | 'mysql'>(
    engine === 'mysql' ? 'mysql' : 'postgres'
  );
  const [previewFile, setPreviewFile] = useState<PreviewFileData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addEphemeralFiles(Array.from(e.target.files));
      setPreviewFile(null);
      // Reset input value so subsequent selections of the same or new files trigger properly
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addEphemeralFiles(Array.from(e.dataTransfer.files));
      setPreviewFile(null);
    }
  };

  const handleConnect = async () => {
    if (selectedTab === 'memory-file') {
      setEngine('memory-file');
    } else {
      setEngine(selectedDbEngine);
    }
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
          [
            'Formato',
            file.name.toLowerCase().endsWith('.xlsx')
              ? 'Hoja de Cálculo Excel OpenXML (.xlsx)'
              : 'Libro Excel 97-2004 (.xls)',
          ],
          ['Tamaño en Memoria', `${(file.size / 1024).toFixed(1)} KB`],
          ['Motor de Procesamiento', 'SQLite WebAssembly en RAM volátil (Zero-Retention)'],
        ],
      });
    }
  };

  const totalFilesSizeKb = (
    ephemeralFiles.reduce((acc, f) => acc + f.size, 0) / 1024
  ).toFixed(1);

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
              setSelectedTab('database');
              setPreviewFile(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              selectedTab === 'database'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Conecta tu base de datos</span>
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

              {/* Drag and Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-400 bg-blue-950/40 shadow-inner'
                    : 'border-slate-700 hover:border-blue-500/60 bg-slate-950/40'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ephemeral-file-input"
                />
                <label htmlFor="ephemeral-file-input" className="cursor-pointer block space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Haga clic para agregar archivos o arrástrelos aquí
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Puede subir múltiples archivos simultáneamente (balance, mayor, ventas, extractos)
                  </p>
                </label>
              </div>

              {/* Uploaded Files List with "Ver" and "Eliminar" */}
              {ephemeralFiles.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                      <span>Archivos cargados en memoria:</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-mono text-[11px]">
                        {ephemeralFiles.length}
                      </span>
                    </span>

                    {ephemeralFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          clearEphemeralFiles();
                          setPreviewFile(null);
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Limpiar todos
                      </button>
                    )}
                  </div>

                  {/* Scrollable list displaying all files */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {ephemeralFiles.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-500/40 transition-colors text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 mr-3">
                          <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                          <div className="truncate">
                            <p className="truncate font-medium text-white" title={f.name}>
                              {f.name}
                            </p>
                            <p className="text-slate-400 font-mono text-[10px]">
                              {(f.size / 1024).toFixed(1)} KB • {f.name.split('.').pop()?.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* "Ver" Button */}
                          <button
                            type="button"
                            onClick={() => handlePreviewFile(f)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-500/30 shadow-sm"
                            title="Previsualizar registros del archivo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>

                          {/* "Eliminar" Button */}
                          <button
                            type="button"
                            onClick={() => {
                              removeEphemeralFile(i);
                              if (previewFile?.name === f.name) {
                                setPreviewFile(null);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                            title="Quitar archivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>
                      Total: <strong className="text-white">{ephemeralFiles.length}</strong> archivo(s) listo(s)
                    </span>
                    <span className="font-mono text-blue-400">{totalFilesSizeKb} KB en RAM</span>
                  </div>
                </div>
              )}

              {/* In-Modal File Preview Area */}
              {previewFile && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <TableIcon className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">
                        Vista Previa: <span className="font-mono text-blue-300">{previewFile.name}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30 uppercase shrink-0">
                        {previewFile.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewFile(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-slate-800 shrink-0 transition-colors"
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
                    Mostrando primeras filas de muestra. Al presionar "Conectar e Introspeccionar", todos los archivos se montan en SQLite volátil para Text-to-SQL.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Seleccione su motor de base de datos
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDbEngine('postgres')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedDbEngine === 'postgres'
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-sm shadow-blue-500/15'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                        PG
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">PostgreSQL</p>
                        <p className="text-[10px] text-slate-400">Puerto por defecto: 5432</p>
                      </div>
                    </div>
                    {selectedDbEngine === 'postgres' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDbEngine('mysql')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedDbEngine === 'mysql'
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-sm shadow-blue-500/15'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/20">
                        MY
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">MySQL</p>
                        <p className="text-[10px] text-slate-400">Puerto por defecto: 3306</p>
                      </div>
                    </div>
                    {selectedDbEngine === 'mysql' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL pública
                </label>
                <input
                  type="text"
                  placeholder={
                    selectedDbEngine === 'postgres'
                      ? 'postgresql://usuario:contraseña@servidor.com:5432/nombre_bd?sslmode=require'
                      : 'mysql://usuario:contraseña@servidor.com:3306/nombre_bd'
                  }
                  value={postgresCreds.connectionString || ''}
                  onChange={(e) => setPostgresCreds({ connectionString: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Ingrese la cadena de conexión URI provista por su servicio de hosting (Railway, Supabase, Neon, AWS RDS, PlanetScale, etc.).
                </p>
              </div>

              {/* Recomendación de seguridad */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-slate-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Recomendación de Seguridad</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Por su propia seguridad y confidencialidad, le recomendamos utilizar y conectar bases de datos que <strong>no pertenezcan a entornos controlados o críticos de producción</strong> (sugerimos réplicas de sólo lectura, entornos de prueba, staging o copias anonimizadas).
                </p>
                <p className="text-[10px] text-slate-400">
                  * Anexar ejecuta todas las consultas bajo transacciones estrictas de <code className="text-blue-300">READ ONLY</code> y nunca almacena sus credenciales ni sus datos (política Zero-Retention).
                </p>
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
              disabled={
                isLoading ||
                (selectedTab === 'memory-file' && ephemeralFiles.length === 0) ||
                (selectedTab === 'database' && !postgresCreds.connectionString?.trim())
              }
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
