import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    if (mode === 'register') {
      const ok = await register(name, email, password, company, apiUrl);
      if (ok) {
        onSuccess();
        onClose();
      }
    } else {
      const ok = await login(email, password, apiUrl);
      if (ok) {
        onSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0B132B] via-[#050A14] to-black border border-blue-900/40 shadow-2xl p-6 sm:p-8 relative">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/20 blur-2xl pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-medium tracking-wide mb-3">
            ANEXAR SaaS
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Crear Cuenta para Probar' : 'Iniciar Sesión'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'register'
              ? 'Regístrese gratis para acceder a la plataforma Text-to-SQL'
              : 'Ingrese sus credenciales corporativas para continuar'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre y Apellido
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Empresa (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nombre de la empresa"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-blue-500 text-white text-xs placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : mode === 'register' ? (
                <span>Completar Registro y Acceder</span>
              ) : (
                <span>Entrar a la Plataforma</span>
              )}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          Acceso instantáneo con políticas de Zero-Retention. Sus datos jamás se persisten.
        </p>
      </div>
    </div>
  );
};
