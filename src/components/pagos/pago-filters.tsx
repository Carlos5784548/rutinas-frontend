import React from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { EstadoPago } from '../../types';

interface PagoFiltersProps {
    onFilterChange: (filters: { estado?: EstadoPago; search: string; dateRange: { start: string; end: string } }) => void;
}

export const PagoFilters: React.FC<PagoFiltersProps> = ({ onFilterChange }) => {
    const [search, setSearch] = React.useState('');
    const [estado, setEstado] = React.useState<string>('all');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    const handleApply = () => {
        onFilterChange({
            estado: estado === 'all' ? undefined : (estado as EstadoPago),
            search,
            dateRange: { start: startDate, end: endDate }
        });
    };

    const handleClear = () => {
        setSearch('');
        setEstado('all');
        setStartDate('');
        setEndDate('');
        onFilterChange({ search: '', dateRange: { start: '', end: '' } });
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-background border border-default-200 rounded-xl shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    placeholder="Buscar por cliente..."
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Icon icon="lucide:search" className="text-default-400" />}
                    className="w-full"
                />

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
