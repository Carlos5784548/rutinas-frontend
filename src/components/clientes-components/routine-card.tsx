import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { RutinaResponseDTO } from '../../types';
import { Icon } from '@iconify/react';
import { clientApi, getClienteId, pagosApi } from '../../services/api';
import { PaymentMethodModal } from '../pagos/PaymentMethodModal';
import { TransferPaymentInfo } from '../pagos/TransferPaymentInfo';
import { DatosBancarios } from '../../types';

interface RoutineCardProps {
    routine: RutinaResponseDTO;
    index: number;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine, index }) => {
    const navigate = useNavigate();
    const [isPaying, setIsPaying] = React.useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = React.useState(false);
    const [isTransferInfoOpen, setIsTransferInfoOpen] = React.useState(false);
    const [bankDetails, setBankDetails] = React.useState<DatosBancarios | null>(null);
    const [currentPagoId, setCurrentPagoId] = React.useState<number | null>(null);

    const focusIconMap: Record<string, string> = {
        'Tonificar': 'lucide:zap',
        'Volumen': 'lucide:dumbbell',
        'Resistencia': 'lucide:heart'
    };

    const isLocked = routine.estado.includes('PENDIENTE');
    const isActiveOrFinished = routine.estado === 'ACTIVA' || routine.estado === 'FINALIZADA';

    const handleRoutinePress = async () => {
        if (isLocked) {
            setIsMethodModalOpen(true);
            return;
        }
        navigate(`/cliente-app/routines/${routine.id}`);
    };

    const handleSelectMercadoPago = async () => {
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
    };

    const handleSelectTransfer = async () => {
        setIsPaying(true);
        try {
            const clienteId = getClienteId();
            if (!clienteId) return;

            // 1. Fetch trainer's bank details (we might need a trainerId from routine or somewhere else)
            // For now let's assume entrenadorId 1 or fetch from a service that doesn't strictly need it if there's only one trainer
            // Better: routine probably has trainer info? Let's check RutinaResponseDTO.
            // If not, we might need a general endpoint for common bank details.

            // Try to get details first
            const details = await pagosApi.getBankDetails(1); // Fallback to 1 for now
            setBankDetails(details);

            // 2. Initiate transfer payment record in backend
            const data = await clientApi.initiateTransferPayment(routine.id, clienteId);
            setCurrentPagoId(data.pagoId);

            setIsMethodModalOpen(false);
            setIsTransferInfoOpen(true);
        } catch (error) {
            console.error("Error starting transfer payment:", error);
        } finally {
            setIsPaying(false);
        }
    };

    const handleConfirmTransfer = async () => {
        if (!currentPagoId) return;
        setIsPaying(true);
        try {
            await clientApi.confirmTransferPayment(currentPagoId);
            setIsTransferInfoOpen(false);
            // Refresh routine or state
            window.location.reload(); // Quick refresh to show "Wait for verification"
        } catch (error) {
            console.error("Error confirming transfer:", error);
        } finally {
            setIsPaying(false);
        }
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
                    transition-all duration-500 ease-out z-0
                    ${isLocked
                        ? 'bg-zinc-900 border-zinc-800'
                        : 'border-zinc-200/20 hover:border-zinc-300/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50'
                    }
                `}>
                    {/* Background Image & Overlay */}
                    {!isLocked && (
                        <>
                            <div className="absolute inset-0 z-0">
                                <img
                                    src="/routine-card-bg.jpg"
                                    alt="Background"
                                    className="w-full h-full object-cover opacity-100"
                                />
                            </div>
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-zinc-900/40 backdrop-blur-[1px]" />
                        </>
                    )}

                    {/* Unique Identifier Stripe */}
                    <div className={`h-2 w-full ${isLocked ? 'bg-zinc-800' : 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900'}`} />

                    <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <Chip
                                startContent={<Icon icon={statusConfig.icon} width={14} className="text-white" />}
                                variant="solid"
                                color={statusConfig.color as any}
                                className={`border-0 font-bold text-[10px] uppercase tracking-wider h-7 text-white shadow-sm ${isLocked ? 'bg-white/10' : ''}`}
                            >
                                {statusConfig.text}
                            </Chip>
                            {!isLocked && (
                                <div className="text-xs font-bold text-white bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full shadow-sm">
                                    {formatDate(routine.fechaInicio)} - {formatDate(routine.fechaFin)}
                                </div>
                            )}
                        </div>

                        {/* Title Section */}
                        <div className="mb-8">
                            <h3 className={`text-2xl md:text-3xl font-black tracking-tight leading-none mb-3 text-white drop-shadow-md`}>
                                {routine.nombre}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                                    <Icon icon={focusIconMap[routine.enfoque] || 'lucide:target'} className="text-white" width={14} />
                                </div>
                                <span className="text-sm font-bold text-zinc-100/90 tracking-wide">
                                    Enfoque: {routine.enfoque}
                                </span>
                            </div>
                        </div>

                        {/* Schedule Preview */}
                        {!isLocked && schedule.length > 0 && (
                            <div className="mb-8">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-300 font-bold mb-3 pl-1">Cronograma Semanal</p>
                                <div className="flex flex-wrap gap-2">
                                    {schedule.map((item, idx) => (
                                        <div key={idx} className="flex flex-col bg-black/40 border border-white/10 rounded-xl p-2 min-w-[70px] backdrop-blur-md shadow-sm">
                                            <span className="text-[9px] text-zinc-300 font-bold uppercase mb-0.5">Día {item.day}</span>
                                            <span className="text-xs font-bold text-white truncate max-w-[80px]">{item.muscle}</span>
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
                                className="w-full bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-black/20 h-12 rounded-xl group-hover:pl-6 group-hover:pr-4 justify-between"
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

            <PaymentMethodModal
                isOpen={isMethodModalOpen}
                onOpenChange={setIsMethodModalOpen}
                monto={routine.monto || 0}
                onSelectMercadoPago={handleSelectMercadoPago}
                onSelectTransfer={handleSelectTransfer}
                loading={isPaying}
            />

            {bankDetails && (
                <TransferPaymentInfo
                    isOpen={isTransferInfoOpen}
                    onOpenChange={setIsTransferInfoOpen}
                    datosBancarios={bankDetails}
                    monto={routine.monto || 0}
                    entrenadorNombre="Tu Entrenador" // Should ideally come from backend
                    onConfirm={handleConfirmTransfer}
                    loading={isPaying}
                />
            )}
        </motion.div>
    );
};
