import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Divider,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { pagosApi, getEntrenadorId } from '../../services/api';
import { DatosBancarios } from '../../types';

export const BankDetailsSettings: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [details, setDetails] = React.useState<DatosBancarios>({
        cvu: '',
        alias: '',
        banco: ''
    });

    const trainerId = getEntrenadorId();

    React.useEffect(() => {
        if (!trainerId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await pagosApi.getBankDetails(trainerId);
                if (data) setDetails(data);
            } catch (error) {
                console.error("Error fetching bank details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [trainerId]);

    const handleSave = async () => {
        if (!trainerId) return;
        setSaving(true);
        try {
            await pagosApi.updateBankDetails(trainerId, details);
            addToast({
                title: 'Éxito',
                description: 'Datos bancarios actualizados correctamente',
                severity: 'success'
            });
        } catch (error) {
            console.error("Error saving bank details:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Icon icon="lucide:loader-2" className="animate-spin text-primary" width={32} /></div>;

    return (
        <Card className="max-w-2xl border-zinc-200/20 shadow-xl">
            <CardHeader className="flex gap-3 p-6 pb-2">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <Icon icon="lucide:landmark" className="text-primary" width={24} />
                </div>
                <div className="flex flex-col">
                    <p className="text-xl font-bold">Datos de Cobro</p>
                    <p className="text-small text-default-500">Configura tu CVU y Alias para recibir transferencias</p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-6 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Banco"
                        placeholder="Ej: Banco Galicia, Mercado Pago"
                        value={details.banco}
                        onValueChange={(val) => setDetails({ ...details, banco: val })}
                        variant="bordered"
                    />
                    <Input
                        label="Titular (Nombre Completo)"
                        placeholder="Tu nombre completo"
                        // Titular might be a separate field in some implementations, 
                        // but usually it's deduced from the trainer profile.
                        // Let's keep it simple for now or add it to DatosBancarios if needed.
                        variant="bordered"
                        isDisabled
                        description="Viene de tu perfil"
                    />
                </div>

                <Input
                    label="Alias"
                    placeholder="Ej: entrenar.pro.2024"
                    value={details.alias}
                    onValueChange={(val) => setDetails({ ...details, alias: val })}
                    variant="bordered"
                    startContent={<Icon icon="lucide:at-sign" className="text-default-400" />}
                />

                <Input
                    label="CVU / CBU"
                    placeholder="Ingresa los 22 dígitos"
                    value={details.cvu}
                    onValueChange={(val) => setDetails({ ...details, cvu: val })}
                    variant="bordered"
                    maxLength={22}
                    startContent={<Icon icon="lucide:hash" className="text-default-400" />}
                />

                <div className="bg-warning-50 border border-warning-100 p-4 rounded-xl flex gap-3">
                    <Icon icon="lucide:alert-triangle" className="text-warning-500 shrink-0" width={18} />
                    <p className="text-xs text-warning-700 leading-relaxed">
                        Asegúrate de que los datos sean correctos. Estos datos serán mostrados a tus clientes al momento de pagar por transferencia.
                    </p>
                </div>

                <Button
                    color="primary"
                    className="h-12 font-bold shadow-lg shadow-primary/20"
                    onPress={handleSave}
                    isLoading={saving}
                    startContent={!saving && <Icon icon="lucide:save" width={18} />}
                >
                    Guardar Configuración
                </Button>
            </CardBody>
        </Card>
    );
};
