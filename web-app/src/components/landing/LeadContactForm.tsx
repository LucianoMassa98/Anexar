import React, { useState } from 'react';
import { LeadFormData } from '../../types';

interface LeadContactFormProps {
  initialNeedType?: string;
}

export const LeadContactForm: React.FC<LeadContactFormProps> = ({ initialNeedType = 'GENERAL_CONSULTING' }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    currentErp: 'SAP',
    dataVolume: '10-100GB',
    needType: initialNeedType as any,
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar la consulta');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 bg-gradient-to-b from-black via-[#030712] to-black border-t border-blue-950/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase">
            Contacto B2B
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            Hable con un Consultor Senior
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Diagnóstico contable y tecnológico para centralizar sus datos corporativos.
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-b from-[#091326] via-[#040813] to-black border border-blue-900/40 p-6 sm:p-10 shadow-2xl">
          {submitSuccess ? (
            <div className="text-center py-10 space-y-3">
              <h3 className="text-xl font-bold text-white">Solicitud Recibida</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Un especialista de ANEXAR se comunicará en menos de 24 horas hábiles.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Martín Rodríguez"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Razón Social"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="martin@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+54 9 11 4567-8900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ERP o Sistema Actual
                  </label>
                  <select
                    value={formData.currentErp}
                    onChange={(e) => setFormData({ ...formData, currentErp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs focus:outline-none transition-colors"
                  >
                    <option value="SAP">SAP (ECC / S/4HANA)</option>
                    <option value="Tango">Tango Software</option>
                    <option value="Bejerman">Bejerman / Thomson</option>
                    <option value="Odoo">Odoo</option>
                    <option value="Excel">Hojas Excel Dispersas</option>
                    <option value="Otro">Otro Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Necesidad Principal
                  </label>
                  <select
                    value={formData.needType}
                    onChange={(e) => setFormData({ ...formData, needType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs focus:outline-none transition-colors"
                  >
                    <option value="CENTRALIZATION">Centralización de ERPs</option>
                    <option value="FINANCIAL_AUDIT">Auditoría Contable de Datos</option>
                    <option value="AI_ANALYTICS">Text-to-SQL & IA de Negocio</option>
                    <option value="GENERAL_CONSULTING">Consultoría Integral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mensaje o Consulta
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalle breve de la situación actual..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Consulta B2B'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
