import React from 'react';
import { Header } from '../../components/clientes-components/header';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { Card, CardBody, Chip, Spinner, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { clientApi, getClienteId } from '../../services/api';
import { ProgresoEjercicioResponseDTO } from '../../types';
import { motion } from 'framer-motion';

const HistoryPage = () => {
    const [history, setHistory] = React.useState<ProgresoEjercicioResponseDTO[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            const clienteId = getClienteId();
            if (!clienteId) return;
            try {
                const data = await clientApi.getMyProgress(clienteId);
                // Sort by ID descending as a proxy for recency if date is same, or just trust backend sort
                // We reverse locally to show newest first generally
                setHistory(data.reverse());
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Group by date (Date string -> Items)
    const groupedHistory = React.useMemo(() => {
        return history.reduce((groups: Record<string, ProgresoEjercicioResponseDTO[]>, item) => {
            // Ensure date parsing works correctly across timezones/formats if needed
            // Assuming item.fecha is YYYY-MM-DD
            const dateObj = new Date(item.fecha);
            // Format: "Lunes, 29 de Diciembre"
            const dateKey = dateObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
            return groups;
        }, {});
    }, [history]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50/50 pb-24">
                {/* Custom Header for History */}
                <header className="pt-24 pb-8 px-6 bg-white/80 backdrop-blur-md border-b border-zinc-200">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-2 rounded-full bg-primary/10 text-primary">
                                <Icon icon="lucide:history" width={18} />
                            </span>
                            <span className="text-xs font-bold tracking-widest text-primary uppercase">Tu Actividad</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
                            Historial
                        </h1>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto px-6 py-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Spinner size="lg" color="primary" />
                            <p className="text-zinc-400 font-medium animate-pulse">Cargando registros...</p>
                        </div>
                    ) : Object.keys(groupedHistory).length > 0 ? (
                        <div className="space-y-12">
                            {Object.entries(groupedHistory).map(([date, items], groupIndex) => (
                                <motion.div
                                    key={date}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: groupIndex * 0.1 }}
                                    className="relative pl-4 md:pl-0"
                                >
                                    {/* Timeline Line (Mobile) */}
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 md:hidden" />

                                    {/* Date Header */}
                                    <div className="flex items-center gap-4 mb-6 relative">
                                        <div className="w-3 h-3 rounded-full bg-primary border-4 border-white shadow-sm absolute -left-[5px] md:hidden" />
                                        <h3 className="text-xl font-bold text-zinc-800 capitalize md:ml-0 ml-4">
                                            {date}
                                        </h3>
                                        <div className="h-px bg-zinc-100 flex-grow" />
                                        <span className="text-xs font-semibold text-zinc-400">
                                            {items.length} ejercicios
                                        </span>
                                    </div>

                                    {/* Items Grid */}
                                    <div className="grid grid-cols-1 gap-3">
                                        {items.map((item, index) => (
                                            <Card
                                                key={item.id || index}
                                                className={`
                                                    border shadow-sm hover:shadow-md transition-shadow duration-300
                                                    ${item.completado ? 'border-zinc-200 bg-white' : 'border-dashed border-zinc-300 bg-zinc-50/50'}
                                                `}
                                                radius="lg"
                                            >
                                                <CardBody className="p-4 flex items-center justify-between gap-4">

                                                    {/* Left: Indicator & Info */}
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        {/* Status Icon */}
                                                        <div className={`
                                                            w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                                                            ${item.completado
                                                                ? 'bg-green-100/50 text-green-600 border border-green-200/50'
                                                                : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                                                            }
                                                        `}>
                                                            <Icon
                                                                icon={item.completado ? "lucide:check" : "lucide:minus"}
                                                                width={24}
                                                                strokeWidth={3}
                                                            />
                                                        </div>

                                                        {/* Text Info */}
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className={`text-base font-bold truncate ${item.completado ? 'text-zinc-900' : 'text-zinc-500'}`}>
                                                                    {item.ejercicioNombre}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                                                <span className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                                                                    <Icon icon="lucide:calendar-check" width={12} />
                                                                    Día {item.dia}
                                                                </span>
                                                                {item.serieNumero && (
                                                                    <span className="flex items-center gap-1 text-zinc-400">
                                                                        • Serie {item.serieNumero}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Metrics */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {(item.kg || 0) > 0 && (
                                                            <Chip
                                                                startContent={<Icon icon="lucide:weight" width={12} />}
                                                                variant="flat"
                                                                className="bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold"
                                                                size="sm"
                                                            >
                                                                {item.kg} kg
                                                            </Chip>
                                                        )}
                                                    </div>

                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-white">
                            <div className="p-6 bg-zinc-50 rounded-full mb-6 border border-zinc-100">
                                <Icon icon="lucide:clipboard-list" width={48} className="text-zinc-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Sin historial</h3>
                            <p className="text-zinc-500 max-w-sm">
                                Completa tu primer entrenamiento para ver tu progreso aquí.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default HistoryPage;
