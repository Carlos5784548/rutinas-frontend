import React from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { EstadoPago, Client } from '../../types';
import { clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { toast } from 'sonner';

interface PagoFiltersProps {
    onFilterChange: (filters: { estado?: EstadoPago; search: string; clientId?: number; dateRange: { start: string; end: string } }) => void;
}

export const PagoFilters: React.FC<PagoFiltersProps> = ({ onFilterChange }) => {
    const [search, setSearch] = React.useState('');
    const [clientId, setClientId] = React.useState<number | undefined>(undefined);
    const [estado, setEstado] = React.useState<string>('all');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [clients, setClients] = React.useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = React.useState(false);

    React.useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoadingClients(true);
            const isTrainerUser = isTrainer();
            const entrenadorId = getEntrenadorId();
            let data: Client[] = [];

            if (isTrainerUser && entrenadorId) {
                data = await trainerApi.getMyClients(entrenadorId);
            } else {
                data = await clientApi.getAll(entrenadorId || undefined);
            }
            setClients(data.filter(c => c.id !== undefined));
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Error al cargar los clientes');
        } finally {
            setLoadingClients(false);
        }
    };

    const handleApply = () => {
        onFilterChange({
            estado: estado === 'all' ? undefined : (estado as EstadoPago),
            search,
            clientId,
            dateRange: { start: startDate, end: endDate }
        });
    };

    const handleClear = () => {
        setSearch('');
        setClientId(undefined);
        setEstado('all');
        setStartDate('');
        setEndDate('');
        onFilterChange({ search: '', clientId: undefined, dateRange: { start: '', end: '' } });
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-background border border-default-200 rounded-xl shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                    label="Cliente"
                    placeholder="Seleccionar cliente"
                    selectedKeys={clientId ? [String(clientId)] : []}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0];
                        setClientId(key ? Number(key) : undefined);
                    }}
                    className="w-full"
                    isLoading={loadingClients}
                    startContent={<Icon icon="lucide:user" className="text-default-400" />}
                >
                    {clients.map((client) => (
                        <SelectItem key={String(client.id)} textValue={`${client.nombre} ${client.apellido}`}>
                            {client.nombre} {client.apellido}
                        </SelectItem>
                    ))}
                </Select>

                <Select
                    label="Estado"
                    placeholder="Todos los estados"
                    selectedKeys={[estado]}
                    onSelectionChange={(keys) => setEstado(Array.from(keys)[0] as string)}
                    className="w-full"
                >
                    <SelectItem key="all">Todos</SelectItem>
                    <SelectItem key="APROBADO">Aprobados</SelectItem>
                    <SelectItem key="PENDIENTE">Pendientes</SelectItem>
                    <SelectItem key="RECHAZADO">Rechazados</SelectItem>
                </Select>

                <Input
                    type="date"
                    label="Desde"
                    placeholder="Fecha inicio"
                    value={startDate}
                    onValueChange={setStartDate}
                />

                <Input
                    type="date"
                    label="Hasta"
                    placeholder="Fecha fin"
                    value={endDate}
                    onValueChange={setEndDate}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="flat" color="default" onPress={handleClear} startContent={<Icon icon="lucide:rotate-ccw" />}>
                    Limpiar
                </Button>
                <Button color="primary" onPress={handleApply} startContent={<Icon icon="lucide:filter" />}>
                    Aplicar Filtros
                </Button>
            </div>
        </div>
    );
};
