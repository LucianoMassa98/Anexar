import React, { useState } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';
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

  // Consent checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptContact, setAcceptContact] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { login, register, loginOAuth, isLoading, error, clearError } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    if (mode === 'register') {
      if (!acceptTerms) {
        setValidationError('Debe aceptar los Términos y Condiciones para registrarse.');
        return;
      }
      if (!acceptContact) {
        setValidationError('Debe autorizar el contacto comercial y de asesoramiento para continuar.');
        return;
      }

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

  const handleOAuthClick = async (provider: 'google' | 'meta' | 'apple') => {
    clearError();
    setValidationError(null);

    if (mode === 'register' && (!acceptTerms || !acceptContact)) {
      setValidationError('Debe aceptar los Términos y la Autorización de contacto para registrarse con redes.');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const ok = await loginOAuth(provider, apiUrl);
    if (ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0B132B] via-[#050A14] to-black border border-blue-900/40 shadow-2xl p-6 sm:p-8 relative my-8">
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
              : 'Ingrese sus credenciales para continuar'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearError();
              setValidationError(null);
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
              setValidationError(null);
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

        {/* Social OAuth Buttons (Google, Meta, iOS) */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={() => handleOAuthClick('google')}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Meta Button */}
            <button
              type="button"
              onClick={() => handleOAuthClick('meta')}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {/* Meta Icon */}
              <svg className="w-4 h-4 shrink-0 text-[#0081FB] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>Meta</span>
            </button>

            {/* Apple / iOS Button */}
            <button
              type="button"
              onClick={() => handleOAuthClick('apple')}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {/* Apple Icon */}
              <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.62-.75 1.04-1.8 1.01-2.85-.92.04-2.03.62-2.68 1.38-.58.67-.99 1.74-.95 2.78.99.08 2-.56 2.62-1.31z" />
              </svg>
              <span>Apple iOS</span>
            </button>
          </div>
        </div>

        {/* Minimal Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#060D1A] px-3 text-[11px] text-slate-500 uppercase tracking-wider shrink-0 font-medium">
            o con correo corporativo
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium">
            {validationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre y Apellido *
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
              Correo Electrónico *
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
              Contraseña *
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

          {/* Consent Checkboxes (Terms & Contact Authorization) */}
          <div className="pt-2 space-y-2.5 text-xs text-slate-300">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required={mode === 'register'}
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded bg-black border-slate-700 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <span className="text-[11px] leading-snug text-slate-400">
                Acepto los <strong className="text-slate-200">Términos y Condiciones</strong> de uso de la plataforma y la Política de Privacidad de ANEXAR.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required={mode === 'register'}
                checked={acceptContact}
                onChange={(e) => setAcceptContact(e.target.checked)}
                className="mt-0.5 rounded bg-black border-slate-700 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <span className="text-[11px] leading-snug text-slate-400">
                Acepto y autorizo expresamente a <strong className="text-slate-200">ANEXAR — Consultoría Contable & Tecnológica</strong> a utilizar mis datos de contacto para comunicarse conmigo con fines comerciales, de diagnóstico, soporte y asesoramiento contable.
              </span>
            </label>
          </div>

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
                <span>Aceptar y Crear Cuenta</span>
              ) : (
                <span>Entrar a la Plataforma</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Políticas de Zero-Retention. Sus bases jamás se persisten.</span>
        </div>
      </div>
    </div>
  );
};
