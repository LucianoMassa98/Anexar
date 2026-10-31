import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ServiceRequestType } from '../../types';

interface ConsultingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ServiceRequestType;
}

export const ConsultingModal: React.FC<ConsultingModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'CONSULTORIA_CONTABLE',
}) => {
  const { user } = useAuthStore();
  const [type, setType] = useState<ServiceRequestType>(defaultType);
  const [title, setTitle] = useState('');
  const [currentErp, setCurrentErp] = useState('SAP');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title,
          type,
          currentErp,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar la solicitud.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#0B132B] via-[#050A14] to-black border border-blue-900/40 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Servicios de Consultoría & Soporte</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Solicitar Asistencia Profesional
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Asistencia directa para <strong className="text-slate-200">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Solicitud Registrada con Éxito</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Un consultor senior de <strong className="text-white">ANEXAR</strong> analizará su requerimiento y le responderá a su casilla de correo en menos de 24 horas hábiles.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setTitle('');
                  setDescription('');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Volver a la Consola
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de Servicio
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ServiceRequestType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs focus:outline-none transition-colors"
              >
                <option value="CONSULTORIA_CONTABLE">Consultoría Contable & Auditoría de Balances</option>
                <option value="CENTRALIZACION_ERPS">Centralización de ERPs & Multi-Bases</option>
                <option value="TEXT_TO_SQL_IA">Habilitación de Text-to-SQL & IA a Medida</option>
                <option value="SOPORTE_TECNICO">Soporte Técnico de la Plataforma</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Asunto / Título
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Auditoría de conciliación bancaria y ERP Tango"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ERP o Sistema Principal de la Empresa
              </label>
              <select
                value={currentErp}
                onChange={(e) => setCurrentErp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs focus:outline-none transition-colors"
              >
                <option value="SAP">SAP (ECC / S/4HANA)</option>
                <option value="Tango">Tango Software</option>
                <option value="Bejerman">Bejerman / Thomson Reuters</option>
                <option value="Odoo">Odoo ERP</option>
                <option value="Excel">Hojas de Cálculo / Archivos Planos</option>
                <option value="Postgres_SQL">PostgreSQL / SQL Server Propietario</option>
                <option value="Otro">Otro Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Detalle del Requerimiento
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describa el objetivo o problema que desea resolver con el equipo de ANEXAR..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando requerimiento...</span>
                  </>
                ) : (
                  <span>Enviar Solicitud a ANEXAR</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
