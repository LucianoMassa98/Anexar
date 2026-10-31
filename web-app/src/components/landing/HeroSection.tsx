import React from 'react';
import { ArrowRight, ShieldCheck, Database, BrainCircuit, Terminal, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onOpenApp: () => void;
  onContactClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenApp, onContactClick }) => {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-32">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm shadow-inner shadow-brand-500/10">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>ANEXAR — Consultoría Contable & Tecnológica</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="text-slate-400">Open Source & B2B Advisory</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Unifique sus datos contables y ERPs con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-300 to-blue-500">
              Text-to-SQL
            </span>{' '}
            de Grado Financiero
          </h1>

          {/* Subtitle / Value Prop */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            ¿Su empresa opera con datos fragmentados en múltiples sistemas, hojas de cálculo dispersas o bases desconectadas?{' '}
            <strong className="text-white font-semibold">Anexar</strong> le permite consultar sus finanzas y operaciones en lenguaje natural sin mover sus datos, respaldado por consultores contables y arquitectos de datos senior.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onOpenApp}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 flex items-center justify-center gap-2 group text-base cursor-pointer"
            >
              <Terminal className="w-5 h-5 text-brand-200" />
              <span>Probar Anexar SaaS (Open Source)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onContactClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 hover:border-brand-500/50 shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <span>Hablar con un Especialista</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                Respuesta en 24h
              </span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Políticas Estrictas</p>
                <p className="text-sm font-semibold text-slate-200">Zero-Retention Total</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Motor de Seguridad</p>
                <p className="text-sm font-semibold text-slate-200">SQL AST Firewall</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Arquitectura Flexible</p>
                <p className="text-sm font-semibold text-slate-200">Adapter Multi-Fuente</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Consultoría B2B</p>
                <p className="text-sm font-semibold text-slate-200">Contable & Tecnológica</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
