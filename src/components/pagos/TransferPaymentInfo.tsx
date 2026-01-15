import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Snippet,
    Card,
    CardBody
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { DatosBancarios } from '../../types';

interface TransferPaymentInfoProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    datosBancarios: DatosBancarios;
    monto: number;
    entrenadorNombre: string;
    onConfirm: () => void;
    loading?: boolean;
}

export const TransferPaymentInfo: React.FC<TransferPaymentInfoProps> = ({
    isOpen,
    onOpenChange,
    datosBancarios,
    monto,
    entrenadorNombre,
    onConfirm,
    loading
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            className="bg-zinc-900 border border-zinc-800 text-white"
            size="md"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Datos de Transferencia</h2>
                            <p className="text-small text-zinc-400 font-normal">
                                Realiza el pago para desbloquear tu rutina
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            <Card className="bg-zinc-800/40 border-zinc-700/50 mb-6 shadow-xl">
                                <CardBody className="p-6 gap-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Titular</span>
                                        <span className="font-bold text-white">{entrenadorNombre}</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Alias</span>
                                        <Snippet
                                            hideSymbol
                                            variant="flat"
                                            className="bg-zinc-900 text-white w-full border border-zinc-700/30"
                                            classNames={{ pre: "font-mono font-bold text-lg" }}
                                        >
                                            {datosBancarios.alias}
                                        </Snippet>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">CVU</span>
                                        <Snippet
                                            hideSymbol
                                            variant="flat"
                                            className="bg-zinc-900 text-white w-full border border-zinc-700/30"
                                            classNames={{ pre: "font-mono truncate" }}
                                        >
                                            {datosBancarios.cvu}
                                        </Snippet>
                                    </div>

                                    <div className="flex justify-between items-center bg-zinc-900/50 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-zinc-700/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Monto a Transferir</span>
                                            <span className="text-2xl font-black text-white">${(monto || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                                            <Icon icon="lucide:shield-check" className="text-white" width={24} />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 mb-4">
                                <Icon icon="lucide:info" className="text-blue-400 shrink-0" width={20} />
                                <p className="text-xs text-blue-200 leading-relaxed">
                                    Una vez realizada la transferencia, haz clic en el botón de abajo. Tu entrenador verificará el pago y activará tu rutina a la brevedad.
                                </p>
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex flex-col gap-3 pb-8 px-8">
                            <Button
                                color="primary"
                                onPress={() => {
                                    toast.success("Ya fue enviada la notificación al entrenador");
                                    onConfirm();
                                }}
                                isLoading={loading}
                                className="w-full h-14 font-black text-lg shadow-lg shadow-blue-500/20 rounded-xl"
                            >
                                Ya realicé la transferencia
                            </Button>
                            <Button
                                variant="light"
                                className="text-zinc-500 hover:text-white"
                                onPress={onClose}
                                isDisabled={loading}
                            >
                                Volver atrás
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
