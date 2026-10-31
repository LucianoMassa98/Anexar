import React, { useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { QueryConsole } from './components/dashboard/QueryConsole';
import { ConnectionModal } from './components/dashboard/ConnectionModal';
import { MarketplaceModal } from './components/dashboard/MarketplaceModal';
import { Strategy } from './types';
import { ArrowLeft, Database, Sparkles, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

  const handleSelectStrategy = (strategy: Strategy) => {
    // Strategy prompt can be passed or automatically populated
    console.log('Selected strategy:', strategy.title);
  };

  if (view === 'landing') {
    return <LandingPage onOpenApp={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      {/* Top Console Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Consultoría B2B</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </span>
            <span className="text-sm font-bold text-white hidden sm:inline">
              ANEXAR SaaS Playground
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsMarketplaceOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setIsConnectOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Conectar Fuente</span>
          </button>
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
    </div>
  );
};

export default App;
