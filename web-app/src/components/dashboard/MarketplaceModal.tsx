import React, { useEffect, useState } from 'react';
import { X, Sparkles, Star, MessageSquare, Lock, CheckCircle2, Bookmark, ArrowRight } from 'lucide-react';
import { Strategy } from '../../types';
import { useStrategyStore } from '../../store/useStrategyStore';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStrategy: (strategy: Strategy) => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ isOpen, onClose, onSelectStrategy }) => {
  const { strategies, templates, fetchMarketplace } = useStrategyStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'community'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      fetchMarketplace();
    }
  }, [isOpen, fetchMarketplace]);

  if (!isOpen) return null;

  const currentList = activeTab === 'templates' ? templates : strategies;
  const filteredList =
    selectedCategory === 'ALL'
      ? currentList
      : currentList.filter((s) => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Marketplace & Plantillas Contables</h3>
              <p className="text-xs text-slate-400">
                Estrategias de control de gestión, KPIs y auditoría diseñadas por ANEXAR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs & Filter */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'templates'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Plantillas Estándar ANEXAR
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'community'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Comunidad Open Source
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="FINANCE">Finanzas</option>
              <option value="CONTABILITY">Contabilidad & Auditoría</option>
              <option value="OPERATIONS">Operaciones & Stock</option>
              <option value="SALES">Ventas & Clientes</option>
              <option value="TAX">Impuestos & Tributario</option>
            </select>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              No se encontraron estrategias en esta categoría.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 hover:border-brand-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      {item.isPremium && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Premium B2B</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-brand-300 font-mono">
                      "{item.promptTemplate}"
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.averageRating || 5.0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.commentsCount || 0}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectStrategy(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      <span>Cargar Estrategia</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredList.length} estrategias disponibles</span>
          <span className="text-brand-400 font-medium">ANEXAR Marketplace Engine</span>
        </div>
      </div>
    </div>
  );
};
