import React from 'react';
import { Github, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-base">
                A
              </span>
              <span>ANEXAR — Consultoría Contable & Tecnológica</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
              Plataforma SaaS Text-to-SQL y servicios profesionales de asesoramiento para empresas. Centralice sus sistemas transaccionales, asegure la fidelidad de sus balances contables y potencie su toma de decisiones con inteligencia artificial.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/LucianoMassa98/Anexar.git"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4 text-brand-400" />
                <span>Repositorio GitHub (Open Source)</span>
              </a>
              <span className="text-slate-700">|</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Retention Certified</span>
              </span>
            </div>
          </div>

          {/* Links: Services */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Servicios B2B
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Centralización de ERPs
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Auditoría Contable de Datos
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Habilitación de Text-to-SQL
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Ingeniería de Datos & Pipelines
                </a>
              </li>
            </ul>
          </div>

          {/* Links: Technology */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Tecnología & Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li>PostgreSQL & Railway DB</li>
              <li>Adapter Pattern Multi-Engine</li>
              <li>node-sql-parser AST Firewall</li>
              <li>Google Calendar OAuth Sync</li>
              <li>Vercel AI SDK Integration</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ANEXAR — Consultoría Contable & Tecnológica. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Diseñado con pasión por la precisión contable y tecnológica</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

