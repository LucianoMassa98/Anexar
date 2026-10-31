import React from 'react';
import { Layers, Calculator, ShieldAlert, Cpu, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface ServicesGridProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const services = [
    {
      icon: Layers,
      title: 'Centralización de ERPs y Multi-Bases',
      tag: 'Integración de Datos',
      description:
        'Conectamos y normalizamos sus sistemas transaccionales (SAP, Tango, Bejerman, Odoo, bases custom o archivos Excel de sucursales) en una arquitectura analítica coherente y sin silos.',
      benefits: [
        'Fin de los silos de información entre sucursales',
        'Modelado de datos unificado para finanzas y operaciones',
        'Compatibilidad con Postgres, SQL Server, MySQL y archivos planos',
      ],
      needType: 'CENTRALIZATION',
    },
    {
      icon: Calculator,
      title: 'Consultoría Contable & Auditoría de Datos',
      tag: 'Finanzas & Compliance',
      description:
        'Nuestros contadores públicos y auditores revisan la consistencia de sus balances, conciliaciones bancarias, devengamientos y flujos de fondos para asegurar que cada KPI refleje la realidad jurídica y fiscal.',
      benefits: [
        'Conciliación automática de mayor contable vs. extractos',
        'Diseño de planes de cuentas y centros de costos analíticos',
        'Aging de cuentas a cobrar y control de capital de trabajo',
      ],
      needType: 'FINANCIAL_AUDIT',
    },
    {
      icon: Cpu,
      title: 'Habilitación de Inteligencia Artificial (Text-to-SQL)',
      tag: 'IA & Analítica de Negocio',
      description:
        'Transforme a su equipo directivo y financiero en analistas de datos autosuficientes. Habilitamos motores LLM con contexto de su negocio bajo estrictas políticas de Zero-Retention.',
      benefits: [
        'Consultas en lenguaje natural sin requerir código SQL',
        'Generación automática de gráficos ejecutivos (EBITDA, DSI, ROI)',
        'Sus datos y credenciales nunca se almacenan ni entrenan modelos',
      ],
      needType: 'AI_ANALYTICS',
    },
    {
      icon: ShieldAlert,
      title: 'Gobernanza, Seguridad & Monitoreo de Alertas',
      tag: 'Seguridad Empresarial',
      description:
        'Implementamos firewalls de sólo lectura (SQL AST) para proteger sus bases operativas y configuramos alertas automáticas sincronizadas con Google Calendar ante desviaciones de margen o mora.',
      benefits: [
        'Imposibilidad técnica de mutación o borrado de datos (READ ONLY)',
        'Alertas de umbrales automáticas en el calendario de los líderes',
        'Auditoría y trazabilidad completa de consultas analíticas',
      ],
      needType: 'GENERAL_CONSULTING',
    },
  ];

  return (
    <section id="servicios" className="py-24 bg-slate-950/60 border-y border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-400 font-semibold text-xs tracking-wider uppercase px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            Nuestros Servicios de Consultoría B2B
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Deje de perder horas cruzando Excels. <br className="hidden sm:block" />
            <span className="text-slate-400">Diseñamos su infraestructura de datos de principio a fin.</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            La plataforma Anexar es sólo la punta del iceberg. Como firma consultora contable y tecnológica, acompañamos a medianas y grandes empresas en el saneamiento integral de sus datos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-navy-950/90 border border-slate-800 p-8 hover:border-brand-500/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700">
                      {srv.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {srv.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/70">
                  <button
                    onClick={() => onSelectService(srv.needType)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                  >
                    <span>Solicitar asesoramiento en este servicio</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
