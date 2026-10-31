import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ServicesGridProps {
  onSelectService: (serviceName?: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const services = [
    {
      title: 'Centralización de ERPs & Multi-Bases',
      category: 'DATA INTEGRATION',
      description:
        'Conectamos SAP, Tango, Bejerman, Odoo y bases dispersas en una sola capa analítica limpia y estandarizada.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      needType: 'CENTRALIZATION',
    },
    {
      title: 'Consultoría Contable & Auditoría',
      category: 'FINANCIAL ADVISORY',
      description:
        'Auditores senior validan balances, conciliaciones bancarias automáticas y consistencia fiscal de cada métrica.',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      needType: 'FINANCIAL_AUDIT',
    },
    {
      title: 'Text-to-SQL & IA de Grado Financiero',
      category: 'AI GOVERNANCE',
      description:
        'Consultas en lenguaje natural sin mover datos de su servidor. Cumplimiento estricto de Zero-Retention.',
      image:
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
      needType: 'AI_ANALYTICS',
    },
  ];

  return (
    <section id="servicios" className="py-24 bg-gradient-to-b from-black via-[#040812] to-black border-t border-blue-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase">
            Servicios Profesionales B2B
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Consultoría Contable & Tecnológica
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Infraestructura de datos sólida y asesoramiento contable experto para empresas en crecimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-gradient-to-b from-[#0A1224] to-[#040812] border border-blue-900/30 overflow-hidden hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Visual Card Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-transparent to-transparent" />
                <span className="absolute top-4 left-4 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-md bg-black/80 text-blue-400 border border-blue-500/30">
                  {srv.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => onSelectService(srv.needType)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Consultar por este servicio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
