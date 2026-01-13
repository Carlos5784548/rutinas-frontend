import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';

interface PaymentMethodModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectMercadoPago: () => void;
    onSelectTransfer: () => void;
    monto: number;
    loading?: boolean;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    isOpen,
    onOpenChange,
    onSelectMercadoPago,
    onSelectTransfer,
    monto,
    loading
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            className="bg-zinc-900 border border-zinc-800 text-white"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Seleccionar Método de Pago</h2>
                            <p className="text-small text-zinc-400 font-normal">
                                Elige cómo quieres abonar tu rutina
                            </p>
                        </ModalHeader>
                        <ModalBody className="pb-8">
                            <div className="flex flex-col gap-4">
                                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 flex justify-between items-center mb-2">
                                    <span className="text-zinc-400">Total a pagar</span>
                                    <span className="text-2xl font-black text-white">${(monto || 0).toLocaleString()}</span>
                                </div>

                                <Button
                                    onPress={onSelectMercadoPago}
                                    isLoading={loading}
                                    className="h-16 bg-[#009EE3] text-white font-bold text-lg rounded-2xl flex justify-between px-6 group"
                                    endContent={<Icon icon="lucide:chevron-right" className="transition-transform group-hover:translate-x-1" />}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-lg">
                                            <Icon icon="simple-icons:mercadopago" className="text-[#009EE3]" width={24} />
                                        </div>
                                        <span>Mercado Pago</span>
                                    </div>
                                </Button>

                                <div className="relative py-2">
                                    <Divider className="bg-zinc-800" />
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">O</span>
                                </div>

                                <Button
                                    onPress={onSelectTransfer}
                                    isLoading={loading}
                                    className="h-16 bg-white text-zinc-900 font-bold text-lg rounded-2xl flex justify-between px-6 group hover:bg-zinc-100"
                                    endContent={<Icon icon="lucide:chevron-right" className="transition-transform group-hover:translate-x-1" />}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
                                            <Icon icon="lucide:landmark" className="text-zinc-900" width={24} />
                                        </div>
                                        <span>Transferencia Bancaria</span>
                                    </div>
                                </Button>

                                <p className="text-center text-[10px] text-zinc-500 mt-2 px-4 italic leading-relaxed">
                                    Los pagos por transferencia requieren validación manual por parte del entrenador después de realizar el envío.
                                </p>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
