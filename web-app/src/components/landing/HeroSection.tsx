import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onContactClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onRegisterClick, onContactClick }) => {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 bg-black">
      {/* Radial Blue Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-700/20 via-blue-500/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-0 w-[450px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050A14] border border-blue-500/30 text-blue-400 text-xs font-medium mb-8 shadow-inner shadow-blue-500/10">
          <span>ANEXAR</span>
          <span className="w-1 h-1 rounded-full bg-blue-400" />
          <span className="text-slate-300">Consultoría Contable & Tecnológica</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          Análisis de datos para negocios en la{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-white">
            era de la IA
          </span>
        </h1>

        {/* Short, direct copy */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Analice datos operativos, contables y fiscales con mayor facilidad. Conciliaciones automáticas, control de gestión y respuestas inmediatas en lenguaje natural sin mover sus datos.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Registrarse para Probar Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onContactClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#050A14] hover:bg-slate-900 text-slate-200 text-sm font-semibold border border-blue-900/50 hover:border-blue-500/50 transition-all cursor-pointer"
          >
            Hablar con un Especialista
          </button>
        </div>

        {/* Minimal Hero Visual Showcase (Image / UI Mockup with gradient border) */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="rounded-2xl p-1 bg-gradient-to-b from-blue-500/30 via-blue-900/20 to-transparent shadow-2xl">
            <div className="rounded-xl bg-[#050A14] border border-blue-950 overflow-hidden relative group">
              {/* Image Container with placeholder attributes for easy swapping */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-b from-slate-950 to-black flex items-center justify-center">
                {/* Visual Dashboard Mockup Image */}
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
                  alt="Anexar Data Analytics Dashboard Interface"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-[1.01] transition-transform duration-500"
                />
                
                {/* Gradient Overlay for high-end contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Floating Minimal Metric Badges on the Image */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/75 backdrop-blur-md border border-blue-500/20">
                  <div className="text-left">
                    <p className="text-[11px] text-blue-400 font-mono">ANEXAR TEXT-TO-SQL</p>
                    <p className="text-sm font-semibold text-white">EBITDA y Margen Operativo en Tiempo Real</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                      Zero-Retention RAM Engine
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white font-mono">
                      SQL AST Validated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
