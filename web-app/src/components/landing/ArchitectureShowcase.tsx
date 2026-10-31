import React from 'react';
import { ShieldCheck, Calendar, Lock, GitFork } from 'lucide-react';

export const ArchitectureShowcase: React.FC = () => {
  return (
    <section id="arquitectura" className="py-24 bg-navy-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Seguridad & Arquitectura Empresarial
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
            Diseñado para cumplir con las exigencias del CIO y el Auditor Contable
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Nuestros clientes confían en ANEXAR porque garantizamos matemáticamente que sus datos confidenciales jamás quedan almacenados en servidores de terceros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Zero-Retention */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Política Zero-Retention Estricta</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Las credenciales de bases de datos, contraseñas y archivos Excel/CSV subidos jamás se guardan en la base de datos interna. Viven únicamente en la memoria volátil durante la solicitud y son inmediatamente purgados por el Garbage Collector.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
              ✓ Cero persistencia en disco de datos de clientes
            </div>
          </div>

          {/* Card 2: Adapter Pattern */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Patrón Adapter Multi-Fuente</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Una interfaz unificada abstrae la conexión a motores SQL y archivos planos. Inicia con PostgreSQL y SQLite WebAssembly en memoria, con arquitectura lista para conectar conectores nativos de MySQL, SQL Server y MongoDB.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
              ✓ DatabaseAdapter Interface + Factory Pattern
            </div>
          </div>

          {/* Card 3: SQL Firewall */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Firewall SQL con Validación AST</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Cada consulta generada por el LLM es inspeccionada en su Árbol de Sintaxis Abstracta (AST) con node-sql-parser. Sólo se permite el comando SELECT, prohibiendo rotundamente cualquier mutación (INSERT, UPDATE, DROP, ALTER) y ejecutando bajo BEGIN READ ONLY.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
              ✓ Protección contra SQLi y mutaciones accidentales
            </div>
          </div>
        </div>

        {/* Banner: Google Calendar Sync */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-brand-950/80 via-slate-900 to-navy-950 border border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Sincronización Inteligente con Google Calendar</h4>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Programe revisiones recurrentes de sus estrategias de control de gestión. Las alertas evaluadas sobre desvíos de umbrales se agendan automáticamente en el calendario de los responsables financieros.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold px-4 py-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
            OAuth2 RFC 5545 RRULE
          </span>
        </div>
      </div>
    </section>
  );
};

