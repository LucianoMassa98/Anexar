import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Building2, User, Mail, Phone } from 'lucide-react';
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
        throw new Error(data.error || 'Error al enviar la solicitud. Intente nuevamente.');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 bg-navy-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-brand-400 font-semibold text-xs tracking-wider uppercase px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            Embudo de Consultoría B2B
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
            Hable con un Especialista Contable & Tecnológico
          </h2>
          <p className="mt-3 text-slate-300 text-base max-w-2xl mx-auto">
            ¿Sus datos están fragmentados en múltiples ERPs, planillas o bases no integradas? Analizamos la arquitectura de su empresa y le presentamos una propuesta personalizada de saneamiento y analítica.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle decoration glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 blur-3xl pointer-events-none rounded-full" />

          {submitSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">¡Solicitud recibida con éxito!</h3>
              <p className="text-slate-300 max-w-md mx-auto text-sm">
                Un consultor senior de <strong className="text-brand-300 font-medium">ANEXAR — Consultoría Contable & Tecnológica</strong> revisará el perfil de su empresa y se contactará en menos de 24 horas hábiles.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormData({
                      fullName: '',
                      company: '',
                      email: '',
                      phone: '',
                      currentErp: 'SAP',
                      dataVolume: '10-100GB',
                      needType: 'GENERAL_CONSULTING',
                      message: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Enviar otra consulta
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Nombre y Apellido *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Rodríguez"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Empresa / Razón Social *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Grupo Logístico Austral S.A."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Correo Corporativo *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="martin@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="+54 9 11 4567-8900"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    ERP / Sistema Actual
                  </label>
                  <select
                    value={formData.currentErp}
                    onChange={(e) => setFormData({ ...formData, currentErp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="SAP">SAP (ECC / S/4HANA)</option>
                    <option value="Tango">Tango Software</option>
                    <option value="Bejerman">Bejerman / Thomson</option>
                    <option value="Odoo">Odoo ERP</option>
                    <option value="QuickBooks">QuickBooks / Xero</option>
                    <option value="Excel_Disperso">Planillas Excel Dispersas</option>
                    <option value="Base_Custom">Base SQL Propietaria</option>
                    <option value="Otro">Otro ERP Regional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Volumen Estimado
                  </label>
                  <select
                    value={formData.dataVolume}
                    onChange={(e) => setFormData({ ...formData, dataVolume: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="<10GB">&lt; 10 GB (Pyme / Inicial)</option>
                    <option value="10-100GB">10 a 100 GB (Mediana empresa)</option>
                    <option value=">100GB">&gt; 100 GB (Corporativo)</option>
                    <option value="Multi_Sucursal">Multi-Sucursal distribuida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Necesidad Principal *
                  </label>
                  <select
                    value={formData.needType}
                    onChange={(e) => setFormData({ ...formData, needType: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="CENTRALIZATION">Centralización de ERPs</option>
                    <option value="FINANCIAL_AUDIT">Auditoría Contable de Datos</option>
                    <option value="AI_ANALYTICS">Text-to-SQL & IA de Negocio</option>
                    <option value="ERP_MIGRATION">Migración de Base / Pipeline</option>
                    <option value="GENERAL_CONSULTING">Consultoría Integral 360°</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Detalle de su situación o desafío actual
                </label>
                <textarea
                  rows={3}
                  placeholder="Describa brevemente cómo manejan hoy sus reportes y qué problemas de datos enfrentan..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Enviando información...' : 'Enviar Solicitud de Consultoría B2B'}</span>
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  🔒 Sus datos están protegidos bajo estricto acuerdo de confidencialidad comercial.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

