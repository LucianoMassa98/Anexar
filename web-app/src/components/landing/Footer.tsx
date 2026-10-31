import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-slate-900 py-10 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </span>
          <span className="text-white font-semibold">ANEXAR</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Consultoría Contable & Tecnológica</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/LucianoMassa98/Anexar.git"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Open Source</span>
          </a>
          <span>© {new Date().getFullYear()} Todos los derechos reservados</span>
        </div>
      </div>
    </footer>
  );
};
