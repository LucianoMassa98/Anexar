import { create } from 'zustand';
import { EngineType, PostgresCredentials, TableSchema, DataClassification } from '../types';

interface ConnectionStoreState {
  engine: EngineType;
  postgresCreds: PostgresCredentials;
  ephemeralFiles: File[];
  schema: TableSchema[];
  classification: DataClassification;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  setEngine: (engine: EngineType) => void;
  setPostgresCreds: (creds: Partial<PostgresCredentials>) => void;
  setClassification: (classification: Partial<DataClassification>) => void;
  setEphemeralFiles: (files: File[]) => void;
  addEphemeralFiles: (files: File[]) => void;
  removeEphemeralFile: (index: number) => void;
  clearEphemeralFiles: () => void;
  setSchema: (schema: TableSchema[]) => void;
  connect: (apiUrl?: string) => Promise<boolean>;
  disconnect: () => void;
}

export const useConnectionStore = create<ConnectionStoreState>((set, get) => ({
  engine: 'memory-file',
  postgresCreds: {
    host: 'localhost',
    port: 5432,
    database: 'empresa_erp',
    user: 'postgres',
    password: '',
    ssl: false,
  },
  ephemeralFiles: [],
  schema: [],
  classification: {
    industry: '',
    dataDomain: '',
    sourceErp: '',
    analysisGoal: '',
  },
  isConnected: false,
  isLoading: false,
  error: null,

  setEngine: (engine) => set({ engine, error: null }),

  setPostgresCreds: (creds) =>
    set((state) => ({
      postgresCreds: { ...state.postgresCreds, ...creds },
      error: null,
    })),

  setClassification: (newClass) =>
    set((state) => ({
      classification: { ...state.classification, ...newClass },
    })),

  setEphemeralFiles: (files) => set({ ephemeralFiles: files, error: null }),

  addEphemeralFiles: (newFiles) =>
    set((state) => {
      // Deduplicate by name and size so re-uploading adds missing files cleanly
      const existingKeys = new Set(state.ephemeralFiles.map((f) => `${f.name}-${f.size}`));
      const nonDuplicates = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      return {
        ephemeralFiles: [...state.ephemeralFiles, ...nonDuplicates],
        error: null,
      };
    }),

  removeEphemeralFile: (index) =>
    set((state) => ({
      ephemeralFiles: state.ephemeralFiles.filter((_, idx) => idx !== index),
    })),

  clearEphemeralFiles: () => set({ ephemeralFiles: [] }),

  setSchema: (schema) => set({ schema }),

  connect: async (apiUrl = 'http://localhost:4000') => {
    const { engine, postgresCreds, ephemeralFiles } = get();
    set({ isLoading: true, error: null });

    try {
      let response: Response;

      if (engine === 'memory-file') {
        if (ephemeralFiles.length === 0) {
          throw new Error('Debe seleccionar al menos un archivo CSV o Excel (.xlsx).');
        }

        const formData = new FormData();
        ephemeralFiles.forEach((f) => formData.append('files', f));

        response = await fetch(`${apiUrl}/api/analytics/schema`, {
          method: 'POST',
          body: formData,
        });
      } else {
        if (!postgresCreds.connectionString?.trim() && !postgresCreds.host?.trim()) {
          throw new Error('Debe ingresar la URL pública de la base de datos.');
        }

        response = await fetch(`${apiUrl}/api/analytics/schema`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engine,
            connectionString: postgresCreds.connectionString?.trim(),
            ...postgresCreds,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al conectar y extraer el esquema.');
      }

      set({
        schema: data.schema,
        isConnected: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({
        isConnected: false,
        isLoading: false,
        error: err.message || 'Error de conexión',
      });
      return false;
    }
  },

  disconnect: () => {
    // Guarantees Zero-Retention: wipes memory state clean
    set({
      ephemeralFiles: [],
      schema: [],
      classification: {
        industry: '',
        dataDomain: '',
        sourceErp: '',
        analysisGoal: '',
      },
      isConnected: false,
      error: null,
    });
  },
}));
