import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { ServicesGrid } from './ServicesGrid';
import { ArchitectureShowcase } from './ArchitectureShowcase';
import { Footer } from './Footer';
import { AuthModal } from '../auth/AuthModal';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onOpenApp: (defaultModal?: 'consulting') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const { isAuthenticated, user, logout } = useAuthStore();

  const handleTrySaaS = () => {
    if (isAuthenticated) {
      onOpenApp();
    } else {
      setAuthMode('register');
      setIsAuthOpen(true);
    }
  };

  const handleConsultingClick = () => {
    if (isAuthenticated) {
      onOpenApp('consulting');
    } else {
      setAuthMode('register');
      setIsAuthOpen(true);
    }
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      onOpenApp();
    } else {
      setAuthMode('login');
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Minimal Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-md border-b border-blue-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              A
            </span>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">ANEXAR</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-400 block -mt-1 font-medium">
                Consultoría Contable & Tecnológica
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#servicios" className="hover:text-white transition-colors">
              Servicios
            </a>
            <a href="#arquitectura" className="hover:text-white transition-colors">
              Seguridad & Zero-Retention
            </a>
            <button
              onClick={handleConsultingClick}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Consultoría & Soporte
            </button>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 hidden sm:inline">
                  Hola, <strong className="text-white">{user?.name}</strong>
                </span>
                <button
                  onClick={() => onOpenApp()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Ir al Panel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Salir
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={handleTrySaaS}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Registrarse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Minimalist Sections (No contact form, directs to registration & panel) */}
      <main className="flex-1">
        <HeroSection onRegisterClick={handleTrySaaS} onContactClick={handleConsultingClick} />
        <ServicesGrid onSelectService={() => handleConsultingClick()} />
        <ArchitectureShowcase />
      </main>

      <Footer />

      {/* Auth / Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => onOpenApp()}
        initialMode={authMode}
      />
    </div>
  );
};
