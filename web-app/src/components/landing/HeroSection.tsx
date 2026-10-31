import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onContactClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onRegisterClick, onContactClick }) => {
  return (
    <section className="relative w-full min-h-screen min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black pt-20 pb-16">
      {/* 
        BACKGROUND IMAGE LAYER (Behind text)
        - Desktop: Positioned on the left side, fading smoothly to pure black on the right.
        - Mobile: Centered, fading smoothly at the top and bottom.
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="relative w-full h-full">
          {/* Base Image */}
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80"
            alt="Anexar Data Analytics Interface"
            className="w-full h-full object-cover opacity-35 sm:opacity-40 lg:opacity-50 object-center lg:object-left lg:w-7/12"
          />

          {/* DESKTOP GRADIENT: Fades from transparent/light on the left into solid black on the right */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/20 via-black/75 via-50% to-black to-80%" />

          {/* MOBILE GRADIENT: Fades at the top and bottom into black with centered visibility */}
          <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-black via-transparent via-50% to-black" />
          <div className="block lg:hidden absolute inset-0 bg-black/55" />

          {/* Edge blend: Soft top and bottom fade for seamless scrolling */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

          {/* Ambient Blue Radial Glows */}
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[300px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />
        </div>
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center my-auto">
        {/* Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050A14]/90 border border-blue-500/30 text-blue-400 text-xs font-medium mb-8 backdrop-blur-md shadow-inner shadow-blue-500/10">
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

        {/* Short, direct description */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Analice datos operativos, contables y fiscales con mayor facilidad. Conciliaciones automáticas, control de gestión y respuestas inmediatas en lenguaje natural sin mover sus datos.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Registrarse para Probar Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onContactClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#050A14]/80 hover:bg-slate-900 text-slate-200 text-sm font-semibold border border-blue-900/50 hover:border-blue-500/50 backdrop-blur-sm transition-all cursor-pointer"
          >
            Hablar con un Especialista
          </button>
        </div>

        {/* Minimal Feature Highlights Pill Bar */}
        <div className="mt-14 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Zero-Retention Activo</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>SQL AST Firewall</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Conciliaciones Automáticas</span>
          </span>
        </div>
      </div>
    </section>
  );
};
