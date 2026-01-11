import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Spinner, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientApi, getClienteId } from '../../services/api';
import { PageTransition } from '../../components/clientes-components/page-transition';

const PaymentSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'pending' | 'error'>('loading');
    const [routineId, setRoutineId] = useState<number | null>(null);
    const [attempts, setAttempts] = useState(0);
    const MAX_ATTEMPTS = 10;

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const collectionStatus = queryParams.get('collection_status');
        const prefId = queryParams.get('preference_id');
        // El backend suele enviar el ID en external_reference o podemos buscarlo en las rutinas
        const id = queryParams.get('external_reference');

        if (collectionStatus === 'approved' || collectionStatus === 'pending') {
            if (id) setRoutineId(parseInt(id));
            setStatus('verifying');
        } else {
            setStatus('error');
        }
    }, [location]);

    useEffect(() => {
        let interval: any;

        if (status === 'verifying') {
            const checkStatus = async () => {
                const clienteId = getClienteId();
                if (!clienteId) return;

                try {
                    const routines = await clientApi.getMyRoutines(clienteId);

                    // Si tenemos routineId, buscamos esa específicamente
                    const targetRoutine = routineId
                        ? routines.find(r => r.id === routineId)
                        : routines.find(r => r.estado === 'ACTIVA'); // Fallback: buscar la más reciente activa

                    if (targetRoutine && targetRoutine.estado === 'ACTIVA') {
                        setStatus('success');
                        clearInterval(interval);
                    } else {
                        setAttempts(prev => {
                            if (prev >= MAX_ATTEMPTS) {
                                setStatus('pending');
                                clearInterval(interval);
                                return prev;
                            }
                            return prev + 1;
                        });
                    }
                } catch (error) {
                    console.error("Error verifying payment:", error);
                }
            };

            checkStatus();
            interval = setInterval(checkStatus, 3000);
        }

        return () => clearInterval(interval);
    }, [status, routineId]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
            case 'loading':
                return (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <Spinner size="lg" color="primary" />
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Icon icon="lucide:credit-card" className="text-primary text-xl" />
                            </motion.div>
                        </div>
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black">Verificando Pago</h2>
                            <p className="text-foreground-500">Estamos confirmando tu transacción con Mercado Pago...</p>
                        </div>
                    </div>
                );
            case 'success':
                return (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center text-success shadow-inner">
                            <Icon icon="lucide:check-circle-2" className="text-6xl" />
                        </div>
                        <div className="space-y-2 text-center text-balance">
                            <h2 className="text-3xl font-black text-success">¡Pago Exitoso!</h2>
                            <p className="text-foreground-500 font-medium">Tu rutina ha sido activada correctamente. Ya puedes comenzar a entrenar.</p>
                        </div>
                        <Button
                            color="primary"
                            size="lg"
                            className="font-bold w-full shadow-xl shadow-primary/30 h-14 mt-4"
                            onPress={() => navigate(routineId ? `/cliente-app/routines/${routineId}` : '/cliente-app/routines')}
                        >
                            EMPEZAR AHORA
                        </Button>
                    </motion.div>
                );
            case 'pending':
                return (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center text-warning">
                            <Icon icon="lucide:clock" className="text-5xl" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black">Procesando...</h2>
                            <p className="text-foreground-500">Tu pago se está procesando. La rutina se activará automáticamente en unos minutos.</p>
                        </div>
                        <Button
                            variant="flat"
                            className="font-bold w-full"
                            onPress={() => navigate('/cliente-app/routines')}
                        >
                            IR A MIS RUTINAS
                        </Button>
                    </div>
                );
            case 'error':
            default:
                return (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center text-danger">
                            <Icon icon="lucide:x-circle" className="text-5xl" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black">Ups, algo salió mal</h2>
                            <p className="text-foreground-500">No pudimos verificar tu pago. Si crees que esto es un error, contacta a tu entrenador.</p>
                        </div>
                        <Button
                            color="primary"
                            className="font-bold w-full"
                            onPress={() => navigate('/cliente-app/routines')}
                        >
                            VOLVER A INTENTAR
                        </Button>
                    </div>
                );
        }
    };

    return (
        <PageTransition>
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-none bg-background/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-4">
                    <CardBody className="py-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </CardBody>
                </Card>
            </div>
        </PageTransition>
    );
};

export default PaymentSuccessPage;
