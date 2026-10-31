import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { ServicesGrid } from './ServicesGrid';
import { InteractiveDemo } from './InteractiveDemo';
import { ArchitectureShowcase } from './ArchitectureShowcase';
import { LeadContactForm } from './LeadContactForm';
import { Footer } from './Footer';
import { Terminal, ArrowRight, Github } from 'lucide-react';

interface LandingPageProps {
  onOpenApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [selectedNeedType, setSelectedNeedType] = useState('GENERAL_CONSULTING');

  const scrollToContact = (needType?: string) => {
    if (needType) setSelectedNeedType(needType);
    const element = document.getElementById('contacto');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                ANEXAR
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-brand-400 block -mt-1">
                Consultoría Contable & Tecnológica
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#servicios" className="hover:text-white transition-colors">
              Servicios B2B
            </a>
            <a href="#arquitectura" className="hover:text-white transition-colors">
              Arquitectura & Seguridad
            </a>
            <a
              href="https://github.com/LucianoMassa98/Anexar.git"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4 text-slate-400" />
              <span>GitHub</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToContact()}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              Hablar con un Especialista
            </button>

            <button
              onClick={onOpenApp}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-brand-200" />
              <span>Probar SaaS</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Sections */}
      <main className="flex-1">
        <HeroSection onOpenApp={onOpenApp} onContactClick={() => scrollToContact()} />
        <InteractiveDemo />
        <ServicesGrid onSelectService={(type) => scrollToContact(type)} />
        <ArchitectureShowcase />
        <LeadContactForm initialNeedType={selectedNeedType} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
