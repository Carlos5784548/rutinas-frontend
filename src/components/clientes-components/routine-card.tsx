import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { RutinaResponseDTO } from '../../types';
import { Icon } from '@iconify/react';
import { clientApi, getClienteId } from '../../services/api';

interface RoutineCardProps {
    routine: RutinaResponseDTO;
    index: number;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine, index }) => {
    const navigate = useNavigate();
    const [isPaying, setIsPaying] = React.useState(false);

    const focusIconMap: Record<string, string> = {
        'Tonificar': 'lucide:zap',
        'Volumen': 'lucide:dumbbell',
        'Resistencia': 'lucide:heart'
    };

    const isLocked = routine.estado.includes('PENDIENTE');
    const isActiveOrFinished = routine.estado === 'ACTIVA' || routine.estado === 'FINALIZADA';

    const handleRoutinePress = async () => {
        if (isLocked) {
            setIsPaying(true);
            try {
                const clienteId = getClienteId();
                if (!clienteId) return;
                const data = await clientApi.initiatePayment(routine.id, clienteId);
                if (data && data.initPoint) {
                    window.location.href = data.initPoint;
                }
            } catch (error) {
                console.error("Error starting payment:", error);
            } finally {
                setIsPaying(false);
            }
            return;
        }
        navigate(`/cliente-app/routines/${routine.id}`);
    };

    const statusConfig = useMemo(() => {
        if (isLocked) return { color: "danger", icon: "lucide:lock", text: "Requiere Pago" };
        if (routine.estado === 'FINALIZADA') return { color: "default", icon: "lucide:check-circle", text: "Finalizada" };
        return { color: "success", icon: "lucide:activity", text: "Activa" };
    }, [isLocked, routine.estado]);

    // Parse schedule
    const schedule = useMemo(() => {
        if (!routine.descripcionDias) return [];
        return routine.descripcionDias.split(';').map(dayStr => {
            const [day, muscle] = dayStr.split(':');
            return { day, muscle };
        }).filter(item => item.day && item.muscle);
    }, [routine.descripcionDias]);

    // Format dates
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            className="h-full"
        >
            <Card
                isPressable={isActiveOrFinished}
                onPress={() => isActiveOrFinished && navigate(`/cliente-app/routines/${routine.id}`)}
                className={`h-full border-0 bg-transparent shadow-none group relative overflow-visible`}
            >
                {/* Main Card Container */}
                <div className={`
                    relative h-full flex flex-col overflow-hidden rounded-[2rem] border 
                    transition-all duration-500 ease-out
                    ${isLocked
                        ? 'bg-zinc-900 border-zinc-800'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-200/50'
                    }
                `}>

                    {/* Unique Identifier Stripe */}
                    <div className={`h-2 w-full ${isLocked ? 'bg-zinc-800' : 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900'}`} />

                    <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <Chip
                                startContent={<Icon icon={statusConfig.icon} width={14} />}
                                variant="flat"
                                color={statusConfig.color as any}
                                className={`border-0 font-bold text-[10px] uppercase tracking-wider h-7 ${isLocked ? 'bg-white/10 text-white' : ''}`}
                            >
                                {statusConfig.text}
                            </Chip>
                            {!isLocked && (
                                <div className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                                    {formatDate(routine.fechaInicio)} - {formatDate(routine.fechaFin)}
                                </div>
                            )}
                        </div>

                        {/* Title Section */}
                        <div className="mb-8">
                            <h3 className={`text-2xl md:text-3xl font-black tracking-tight leading-none mb-3 ${isLocked ? 'text-white' : 'text-zinc-900'}`}>
                                {routine.nombre}
                            </h3>
                            <div className="flex items-center gap-2">
                                <Icon icon={focusIconMap[routine.enfoque] || 'lucide:target'} className={isLocked ? "text-zinc-500" : "text-primary"} width={16} />
                                <span className={`text-sm font-medium ${isLocked ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    Enfoque: {routine.enfoque}
                                </span>
                            </div>
                        </div>

                        {/* Schedule Preview */}
                        {!isLocked && schedule.length > 0 && (
                            <div className="mb-8">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-3">Cronograma Semanal</p>
                                <div className="flex flex-wrap gap-2">
                                    {schedule.map((item, idx) => (
                                        <div key={idx} className="flex flex-col bg-zinc-50 border border-zinc-100 rounded-xl p-2 min-w-[70px]">
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Día {item.day}</span>
                                            <span className="text-xs font-bold text-zinc-700 truncate max-w-[80px]">{item.muscle}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-grow" />

                        {/* Action Area */}
                        {isLocked ? (
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between text-white">
                                    <span className="text-sm text-zinc-400">Precio Total</span>
                                    <span className="text-xl font-bold font-mono">
                                        ${routine.monto?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <Button
                                    onPress={handleRoutinePress}
                                    isLoading={isPaying}
                                    className="w-full font-bold bg-white text-black hover:bg-zinc-200 transition-all rounded-xl h-12"
                                >
                                    {isPaying ? 'Procesando...' : 'Desbloquear Ahora'}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 h-12 rounded-xl group-hover:pl-6 group-hover:pr-4 justify-between"
                                endContent={<Icon icon="lucide:arrow-right" className="transition-transform group-hover:translate-x-1" />}
                                onPress={() => navigate(`/cliente-app/routines/${routine.id}`)}
                            >
                                Ver Entrenamiento
                            </Button>
                        )}
                    </div>

                    {/* Background Decorative Icon */}
                    <div className={`absolute -bottom-6 -right-6 opacity-[0.03] rotate-[-15deg] pointer-events-none ${isLocked ? 'text-white' : 'text-zinc-900'}`}>
                        <Icon icon="lucide:dumbbell" width={200} height={200} />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
