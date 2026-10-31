import React, { useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { QueryConsole } from './components/dashboard/QueryConsole';
import { ConnectionModal } from './components/dashboard/ConnectionModal';
import { MarketplaceModal } from './components/dashboard/MarketplaceModal';
import { ConsultingModal } from './components/dashboard/ConsultingModal';
import { AdminModal } from './components/dashboard/AdminModal';
import { Strategy } from './types';
import { useAuthStore } from './store/useAuthStore';
import { ArrowLeft, Database, Sparkles, LogOut, User, Headphones, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isConsultingOpen, setIsConsultingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();

  const handleSelectStrategy = (strategy: Strategy) => {
    console.log('Selected strategy:', strategy.title);
  };

  const handleOpenApp = (defaultModal?: 'consulting') => {
    setView('dashboard');
    if (defaultModal === 'consulting') {
      setIsConsultingOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setView('landing');
  };

  if (view === 'landing') {
    return <LandingPage onOpenApp={handleOpenApp} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Top Console Bar */}
      <header className="h-16 bg-[#040812] border-b border-blue-950/60 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-black/60 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </span>
            <span className="text-sm font-bold text-white hidden sm:inline">
              ANEXAR Text-to-SQL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{user.name}</span>
            </div>
          )}

          <button
            onClick={() => setIsConsultingOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-xs text-blue-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Solicitar Consultoría / Soporte</span>
            <span className="sm:hidden">Consultoría</span>
          </button>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/40 text-xs text-blue-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Panel de Administración y Métricas"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Panel Admin</span>
            <span className="sm:hidden">Admin</span>
          </button>

          <button
            onClick={() => setIsMarketplaceOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-slate-900 border border-blue-900/40 text-xs text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setIsConnectOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Conectar Fuente</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Console */}
      <main className="flex-1 flex flex-col">
        <QueryConsole
          onOpenConnectModal={() => setIsConnectOpen(true)}
          onOpenMarketplaceModal={() => setIsMarketplaceOpen(true)}
        />
      </main>

      {/* Modals */}
      <ConnectionModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
      <MarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        onSelectStrategy={handleSelectStrategy}
      />
      <ConsultingModal
        isOpen={isConsultingOpen}
        onClose={() => setIsConsultingOpen(false)}
      />
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
};

export default App;
