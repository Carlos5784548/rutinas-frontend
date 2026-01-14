import axios, { AxiosResponse } from 'axios';
import { Pago, PagoStats, RutinaRequestDTO, Routine } from '../types';

// We'll use a local axios instance or the one from api.ts
// To maintain consistency, I'll see if I can import 'api' from ./api
// but usually it's better to stay decoupled or follow the existing pattern.
// Existing pattern in api.ts is exporting specific api objects.

const API_URL = 'https://rutinas-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for token (copied logic from api.ts to ensure it works if we don't import direct)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const pagosApi = {
    // GET /api/entrenador/{id}/pagos
    getAll: async (entrenadorId: number, estado?: string): Promise<Pago[]> => {
        const params = estado ? { estado } : {};
        const response: AxiosResponse<Pago[]> = await api.get(`/entrenadores/${entrenadorId}/pagos`, { params });
        // Normalize IDs: some endpoints might return pagoId instead of id
        return response.data.map(pago => ({
            ...pago,
            id: pago.id || (pago as any).pagoId
        }));
    },

    // GET /api/entrenador/{id}/stats
    getStats: async (entrenadorId: number): Promise<PagoStats> => {
        const response: AxiosResponse<PagoStats> = await api.get(`/entrenadores/${entrenadorId}/stats`);
        return response.data;
    },

    // POST /api/pagos/{id}/marcar-visto
    marcarVisto: async (pagoId: number): Promise<void> => {
        await api.post(`/pagos/${pagoId}/marcar-visto`);
    },

    // POST /api/rutinas/asignar/{clienteId}
    asignarRutina: async (clienteId: number, rutina: RutinaRequestDTO): Promise<Routine> => {
        const response: AxiosResponse<Routine> = await api.post(`/rutinas/asignar/${clienteId}`, rutina);
        return response.data;
    },

    approvePayment: async (pagoId: number): Promise<void> => {
        await api.post(`/pagos/transferencia/${pagoId}/aprobar`);
    },

    rejectPayment: async (pagoId: number, motivo?: string): Promise<void> => {
        await api.post(`/pagos/transferencia/${pagoId}/rechazar`, { motivo });
    },

    getBankDetails: async (entrenadorId: number): Promise<any> => {
        const response: AxiosResponse<any> = await api.get(`/entrenadores/${entrenadorId}/datos-bancarios`);
        return response.data;
    },

    updateBankDetails: async (entrenadorId: number, data: any): Promise<void> => {
        await api.put(`/entrenadores/${entrenadorId}/datos-bancarios`, data);
    }
};
