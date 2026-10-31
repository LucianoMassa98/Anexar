import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
  provider?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, apiUrl?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, company?: string, apiUrl?: string) => Promise<boolean>;
  loginOAuth: (provider: 'google' | 'meta' | 'apple', apiUrl?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const savedToken = localStorage.getItem('anexar_auth_token');
const savedUser = localStorage.getItem('anexar_auth_user');

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password, apiUrl = 'http://localhost:4000') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('anexar_auth_token', data.token);
      localStorage.setItem('anexar_auth_user', JSON.stringify(data.user));

      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Error de autenticación' });
      return false;
    }
  },

  register: async (name, email, password, company, apiUrl = 'http://localhost:4000') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      localStorage.setItem('anexar_auth_token', data.token);
      localStorage.setItem('anexar_auth_user', JSON.stringify(data.user));

      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Error al registrarse' });
      return false;
    }
  },

  loginOAuth: async (provider, apiUrl = 'http://localhost:4000') => {
    set({ isLoading: true, error: null });
    try {
      // If backend has guest / dev oauth endpoint or token issue
      const res = await fetch(`${apiUrl}/api/auth/guest-token`, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        const oauthUser: User = {
          id: data.user.id,
          name: `${data.user.name} (${provider.toUpperCase()})`,
          email: `${provider}_user@anexar.com.ar`,
          company: 'Empresa Verificada',
          role: data.user.role || 'USER',
          provider,
        };

        localStorage.setItem('anexar_auth_token', data.token);
        localStorage.setItem('anexar_auth_user', JSON.stringify(oauthUser));

        set({
          token: data.token,
          user: oauthUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      }
      throw new Error(`Error al conectar con ${provider}`);
    } catch (err: any) {
      set({ isLoading: false, error: err.message || `Error con ${provider}` });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('anexar_auth_token');
    localStorage.removeItem('anexar_auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
