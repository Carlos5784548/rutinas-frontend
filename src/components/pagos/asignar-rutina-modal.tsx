import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { Pago, RutinaRequestDTO } from '../../types';
import { pagosApi } from '../../services/pagos.service';
import { addToast } from '@heroui/react';

interface AsignarRutinaModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    pago: Pago | null;
    onSuccess?: () => void;
}

export const AsignarRutinaModal: React.FC<AsignarRutinaModalProps> = ({
    isOpen,
    onOpenChange,
    pago,
    onSuccess
}) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [numDays, setNumDays] = React.useState<number>(0);
    const [dayNames, setDayNames] = React.useState<string[]>([]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset
    } = useForm<RutinaRequestDTO>({
        defaultValues: {
            nombre: '',
            enfoque: 'Tonificar',
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            clienteId: undefined,
            estado: 'ACTIVA',
            monto: 0,
            descripcionDias: ''
        }
    });

    React.useEffect(() => {
        if (pago) {
            reset({
                nombre: `Rutina para ${pago.cliente.nombre}`,
                enfoque: 'Tonificar',
                fechaInicio: new Date().toISOString().split('T')[0],
                fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                clienteId: pago.cliente.id,
                estado: 'ACTIVA',
                monto: pago.monto,
                descripcionDias: ''
            });
            setNumDays(0);
            setDayNames([]);
        }
    }, [pago, reset]);

    React.useEffect(() => {
        if (numDays > 0) {
            setDayNames(prev => {
                const newNames = [...prev];
                if (numDays > prev.length) {
                    for (let i = prev.length; i < numDays; i++) {
                        newNames.push('');
                    }
                } else {
                    return newNames.slice(0, numDays);
                }
                return newNames;
            });
        } else {
            setDayNames([]);
        }
    }, [numDays]);

    const handleDayNameChange = (index: number, value: string) => {
        const newNames = [...dayNames];
        newNames[index] = value;
        setDayNames(newNames);

        const desc = newNames
            .map((name, i) => `${i + 1}:${name}`)
            .filter(part => part.split(':')[1].trim() !== '')
            .join(';');
        setValue('descripcionDias', desc);
    };

    const onSubmit = async (data: RutinaRequestDTO) => {
        if (!pago) return;
        try {
            setIsSubmitting(true);
            await pagosApi.asignarRutina(pago.cliente.id!, data);

            addToast({
                title: 'Rutina Asignada',
                description: 'Se ha enviado la rutina al cliente correctamente',
                severity: 'success'
            });

            if (onSuccess) onSuccess();
            onOpenChange();
        } catch (error) {
            console.error('Error assigning routine:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo asignar la rutina',
                severity: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader className="flex flex-col gap-1">
                            Asignar Rutina a {pago?.cliente.nombre} {pago?.cliente.apellido}
                        </ModalHeader>
                        <ModalBody className="gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="nombre"
                                    control={control}
                                    rules={{ required: 'Nombre es obligatorio' }}
                                    render={({ field }) => (
                                        <Input {...field} label="Nombre de Rutina" isRequired isInvalid={!!errors.nombre} />
                                    )}
                                />
                                <Controller
                                    name="enfoque"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Enfoque"
                                            selectedKeys={[field.value]}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        >
                                            <SelectItem key="Tonificar">Tonificar</SelectItem>
                                            <SelectItem key="Volumen">Volumen</SelectItem>
                                            <SelectItem key="Resistencia">Resistencia</SelectItem>
                                            <SelectItem key="Fuerza">Fuerza</SelectItem>
                                        </Select>
                                    )}
                                />
                                <Controller
                                    name="fechaInicio"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} type="date" label="Fecha Inicio" />
                                    )}
                                />
                                <Controller
                                    name="fechaFin"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} type="date" label="Fecha Fin" />
                                    )}
                                />
                            </div>

                            <div className="space-y-4 p-4 bg-default-50 rounded-xl border border-default-200">
                                <div className="flex justify-between items-center bg">
                                    <span className="font-semibold text-small">Días de Entrenamiento</span>
                                    <Select
                                        placeholder="Días"
                                        className="max-w-[120px]"
                                        size="sm"
                                        selectedKeys={numDays ? [String(numDays)] : []}
                                        onChange={(e) => setNumDays(Number(e.target.value))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                            <SelectItem key={String(n)}>{String(n)}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                {numDays > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                        {dayNames.map((name, index) => (
                                            <Input
                                                key={index}
                                                size="sm"
                                                label={`Día ${index + 1}`}
                                                placeholder="Ej: Pecho"
                                                value={name}
                                                onValueChange={(val) => handleDayNameChange(index, val)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                isLoading={isSubmitting}
                                startContent={<Icon icon="lucide:send" />}
                            >
                                Enviar al Cliente
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};
