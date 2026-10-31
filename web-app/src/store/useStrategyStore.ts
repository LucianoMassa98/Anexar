import { create } from 'zustand';
import { Strategy, QueryResponse } from '../types';
import { useConnectionStore } from './useConnectionStore';

interface StrategyStoreState {
  strategies: Strategy[];
  templates: Strategy[];
  activeStrategy: Strategy | null;
  queryResponse: QueryResponse | null;
  isExecuting: boolean;
  error: string | null;

  setStrategies: (strategies: Strategy[]) => void;
  setTemplates: (templates: Strategy[]) => void;
  setActiveStrategy: (strategy: Strategy | null) => void;
  fetchMarketplace: (apiUrl?: string) => Promise<void>;
  executeQuery: (params: {
    prompt?: string;
    sql?: string;
    threshold?: {
      conditionMetric: string;
      operator: 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'EQUALS' | 'NOT_EQUALS';
      thresholdValue: number;
    };
    apiUrl?: string;
  }) => Promise<QueryResponse | null>;
}

export const useStrategyStore = create<StrategyStoreState>((set) => ({
  strategies: [],
  templates: [],
  activeStrategy: null,
  queryResponse: null,
  isExecuting: false,
  error: null,

  setStrategies: (strategies) => set({ strategies }),
  setTemplates: (templates) => set({ templates }),
  setActiveStrategy: (strategy) => set({ activeStrategy: strategy }),

  fetchMarketplace: async (apiUrl = 'http://localhost:4000') => {
    try {
      const [stratRes, tmplRes] = await Promise.all([
        fetch(`${apiUrl}/api/strategies?visibility=PUBLIC`),
        fetch(`${apiUrl}/api/strategies/templates`),
      ]);

      const stratData = await stratRes.json();
      const tmplData = await tmplRes.json();

      if (stratData.success) set({ strategies: stratData.data });
      if (tmplData.success) set({ templates: tmplData.data });
    } catch (err: any) {
      console.warn('Marketplace fetch fallback:', err.message);
    }
  },

  executeQuery: async ({ prompt, sql, threshold, apiUrl = 'http://localhost:4000' }) => {
    set({ isExecuting: true, error: null });

    const conn = useConnectionStore.getState();

    try {
      let response: Response;

      if (conn.engine === 'memory-file') {
        const formData = new FormData();
        conn.ephemeralFiles.forEach((f) => formData.append('files', f));

        const payload = {
          prompt,
          sql,
          engine: 'memory-file',
          threshold,
        };

        formData.append('payload', JSON.stringify(payload));

        response = await fetch(`${apiUrl}/api/analytics/query`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${apiUrl}/api/analytics/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            sql,
            engine: conn.engine,
            connectionConfig: {
              engine: conn.engine,
              connectionString: conn.postgresCreds.connectionString?.trim(),
              ...conn.postgresCreds,
            },
            threshold,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al ejecutar la consulta analítica.');
      }

      set({
        queryResponse: data,
        isExecuting: false,
        error: null,
      });

      return data;
    } catch (err: any) {
      set({
        isExecuting: false,
        error: err.message || 'Error en la ejecución analítica',
      });
      return null;
    }
  },
}));

