import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Pago } from '../../types';
import { PagoStatusBadge } from './pago-status-badge';
import { pagosApi } from '../../services/pagos.service';
import { addToast } from '@heroui/react';

interface PagoDetailModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    pago: Pago | null;
    onAssignRoutine?: (pago: Pago) => void;
    onStatusChange?: () => void;
}

export const PagoDetailModal: React.FC<PagoDetailModalProps> = ({
    isOpen,
    onOpenChange,
    pago,
    onAssignRoutine,
    onStatusChange
}) => {
    const [loading, setLoading] = React.useState(false);
    if (!pago) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApprove = async () => {
        if (!pago) return;
        setLoading(true);
        try {
            await pagosApi.approvePayment(pago.id);
            addToast({ title: 'Éxito', description: 'Pago aprobado correctamente', severity: 'success' });
            onStatusChange?.();
            onOpenChange();
        } catch (error) {
            console.error("Error approving payment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!pago) return;
        setLoading(true);
        try {
            await pagosApi.rejectPayment(pago.id);
            addToast({ title: 'Pago rechazado', description: 'El pago ha sido marcado como rechazado', severity: 'danger' });
            onStatusChange?.();
            onOpenChange();
        } catch (error) {
            console.error("Error rejecting payment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1"> Detalle del Pago</ModalHeader>
                        <ModalBody>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-default-500">Estado</span>
                                <PagoStatusBadge status={pago.estado} />
                            </div>

                            <Divider className="my-2" />

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-default-500">Cliente</span>
                                    <span className="font-semibold">{pago.cliente?.nombre || 'Cliente'} {pago.cliente?.apellido || 'no encontrado'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-500">Rutina</span>
                                    <span className="font-semibold">{pago.rutina?.nombre || 'Rutina no encontrada'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-500">Monto</span>
                                    <span className="font-bold text-lg text-primary">${(pago.monto || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-500">Fecha de Creación</span>
                                    <span className="text-small">{formatDate(pago.fechaCreacion)}</span>
                                </div>
                                {pago.fechaAprobacion && (
                                    <div className="flex justify-between text-success-600">
                                        <span className="text-default-500">Fecha de Aprobación</span>
                                        <span className="text-small font-medium">{formatDate(pago.fechaAprobacion)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-default-500">Método de Pago</span>
                                    <span className="text-small uppercase">{pago.pasarela}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-500">ID Externo</span>
                                    <span className="text-xs font-mono bg-default-100 p-1 rounded">{pago.idExterno}</span>
                                </div>
                                {pago.comprobanteUrl && (
                                    <div className="mt-4">
                                        <span className="text-default-500 block mb-2">Comprobante</span>
                                        <div className="border border-default-200 rounded-lg overflow-hidden">
                                            <img src={pago.comprobanteUrl} alt="Comprobante" className="w-full h-auto" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cerrar
                            </Button>
                            {pago.estado === 'PENDIENTE_VERIFICACION' && (
                                <div className="flex gap-2 w-full">
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={handleReject}
                                        isLoading={loading}
                                        className="flex-1"
                                        startContent={<Icon icon="lucide:x-circle" />}
                                    >
                                        Rechazar
                                    </Button>
                                    <Button
                                        color="success"
                                        onPress={handleApprove}
                                        isLoading={loading}
                                        className="flex-1 text-white"
                                        startContent={<Icon icon="lucide:check-circle" />}
                                    >
                                        Aprobar
                                    </Button>
                                </div>
                            )}
                            {pago.estado === 'APROBADO' && onAssignRoutine && (
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        onAssignRoutine(pago);
                                        onClose();
                                    }}
                                    startContent={<Icon icon="lucide:clipboard-list" />}
                                >
                                    Asignar Rutina
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
