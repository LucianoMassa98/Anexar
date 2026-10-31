import React from 'react';

export const ArchitectureShowcase: React.FC = () => {
  return (
    <section id="arquitectura" className="py-24 bg-black border-t border-blue-950/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase">
            Arquitectura & Seguridad
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacidad de Grado Financiero
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Diseñado para cumplir con las exigencias del auditor contable y el oficial de seguridad.
          </p>
        </div>

        {/* 3 Minimal Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#070F1E] to-[#03060C] border border-blue-900/30">
            <span className="text-blue-400 font-mono text-xs font-semibold">01 / PRIVACIDAD</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">Zero-Retention Absoluto</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Credenciales, contraseñas y archivos procesados existen únicamente en la RAM durante la consulta. Jamás se persisten en base de datos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#070F1E] to-[#03060C] border border-blue-900/30">
            <span className="text-blue-400 font-mono text-xs font-semibold">02 / SEGURIDAD</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">SQL AST Firewall</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspección sintáctica estricta antes de ejecutar. Se bloquea cualquier mutación DDL o DML, forzando transacciones BEGIN READ ONLY.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#070F1E] to-[#03060C] border border-blue-900/30">
            <span className="text-blue-400 font-mono text-xs font-semibold">03 / CONECTIVIDAD</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">Adapter Multi-Fuente</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conexión directa a PostgreSQL, SQLite en memoria para Excel/CSV, y arquitectura lista para MySQL y SQL Server.
            </p>
          </div>
        </div>

        {/* Minimal Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#050D1D] via-[#09152C] to-[#050D1D] border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-white">Alertas de KPIs en Google Calendar</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Monitoree desvíos de umbrales sobre margen de EBITDA o días de mora. Se agendan automáticamente como eventos recurrentes en su calendario vía OAuth2.
            </p>
          </div>
          <span className="shrink-0 text-xs font-mono font-medium px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30">
            RFC 5545 RRULE
          </span>
        </div>
      </div>
    </section>
  );
};
