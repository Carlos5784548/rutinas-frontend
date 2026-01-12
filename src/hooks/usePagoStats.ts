import { useState, useEffect, useCallback } from 'react';
import { PagoStats } from '../types';
import { pagosApi } from '../services/pagos.service';
import { getEntrenadorId } from '../services/api';

export const usePagoStats = () => {
    const [stats, setStats] = useState<PagoStats>({
        pendientes: 0,
        aprobados: 0,
        totalMesActual: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const entrenadorId = getEntrenadorId();

    const fetchStats = useCallback(async () => {
        if (!entrenadorId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await pagosApi.getStats(entrenadorId);
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas de pagos');
        } finally {
            setLoading(false);
        }
    }, [entrenadorId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refresh: fetchStats };
};
