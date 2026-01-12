import { useState, useEffect, useCallback } from 'react';
import { Pago, EstadoPago } from '../types';
import { pagosApi } from '../services/pagos.service';
import { getEntrenadorId } from '../services/api';

export const usePagos = () => {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const entrenadorId = getEntrenadorId();

    const fetchPagos = useCallback(async (estado?: EstadoPago) => {
        if (!entrenadorId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await pagosApi.getAll(entrenadorId, estado);
            setPagos(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los pagos');
        } finally {
            setLoading(false);
        }
    }, [entrenadorId]);

    useEffect(() => {
        fetchPagos();
    }, [fetchPagos]);

    return { pagos, loading, error, refresh: fetchPagos };
};
