import React from 'react';
import { RoutineCard } from '../../components/clientes-components/routine-card';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { clientApi, getClienteId } from '../../services/api';
import { RutinaResponseDTO } from '../../types';
import { Spinner, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const RoutinesPage = () => {
    const [routines, setRoutines] = React.useState<RutinaResponseDTO[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchRoutines = async () => {
            const clienteId = getClienteId();
            if (!clienteId) {
                setLoading(false);
                return;
            }

            try {
                const data = await clientApi.getMyRoutines(clienteId);
                // Filter out cancelled, but keep Pending/Active/Finished
                const visibleRoutines = data.filter(r => r.estado !== 'CANCELADA');
                setRoutines(visibleRoutines);
            } catch (error) {
                console.error("Error fetching routines:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutines();
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 relative overflow-hidden font-sans">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-zinc-50 pointer-events-none" />
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Premium Header */}
                <header className="relative pt-10 pb-8 px-4 md:px-6 z-10">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/5 border border-zinc-900/10 text-zinc-700 font-bold tracking-wider text-[10px] uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Centro de Entrenamiento
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 mb-2">
                                        Mis Rutinas
                                    </h1>
                                    <p className="text-zinc-500 font-medium max-w-lg text-sm md:text-base leading-relaxed">
                                        Aquí encontrarás tus planes de entrenamiento personalizados.
                                        Sigue el plan para alcanzar tu mejor versión.
                                    </p>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            {!loading && routines.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-zinc-100"
                                >
                                    <div className="flex -space-x-3 p-2">
                                        {[...Array(Math.min(3, routines.length))].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center">
                                                <Icon icon="lucide:dumbbell" className="text-zinc-400 w-3 h-3" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total</span>
                                        <span className="text-lg font-black text-zinc-900 leading-none">{routines.length} Planes</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </header>

                {/* Content Grid */}
                <main className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Spinner size="lg" color="primary" />
                            <p className="text-zinc-400 font-medium animate-pulse">Preparando tus planes...</p>
                        </div>
                    ) : routines.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {routines.map((routine, index) => (
                                <RoutineCard
                                    key={routine.id}
                                    routine={routine}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-[2rem] bg-zinc-50/50"
                        >
                            <div className="p-6 bg-white rounded-2xl mb-6 shadow-sm border border-zinc-100">
                                <Icon icon="lucide:clipboard-list" width={40} className="text-zinc-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Aún no tienes rutinas</h3>
                            <p className="text-zinc-500 max-w-sm mb-8 text-sm">
                                Tu entrenador está diseñando tu plan personalizado. Te notificaremos cuando esté listo.
                            </p>
                            <Button
                                className="font-bold bg-zinc-900 text-white hover:bg-zinc-800 px-6 rounded-xl shadow-lg shadow-zinc-200"
                                startContent={<Icon icon="lucide:message-circle" width={18} />}
                            >
                                Contactar Entrenador
                            </Button>
                        </motion.div>
                    )}
                </main>
            </div>
        </PageTransition>
    );
};

export default RoutinesPage;