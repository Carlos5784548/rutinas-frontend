import React from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    useDisclosure,
    Spinner,
    Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/page-header';
import { usePagos } from '../../hooks/usePagos';
import { PagoStatusBadge } from '../../components/pagos/pago-status-badge';
import { PagoFilters } from '../../components/pagos/pago-filters';
import { PagoDetailModal } from '../../components/pagos/pago-detail-modal';
import { AsignarRutinaModal } from '../../components/pagos/asignar-rutina-modal';
import { Pago } from '../../types';
import { pagosApi } from '../../services/pagos.service';

export const PagoList: React.FC = () => {
    const { pagos, loading, refresh } = usePagos();
    const [filteredPagos, setFilteredPagos] = React.useState<Pago[]>([]);
    const [selectedPago, setSelectedPago] = React.useState<Pago | null>(null);
    const { isOpen: isDetailOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isAssignOpen, onOpen: onAssignOpen, onOpenChange: onAssignOpenChange } = useDisclosure();

    React.useEffect(() => {
        setFilteredPagos(pagos);
    }, [pagos]);

    const handleFilterChange = (filters: { estado?: string; search: string; dateRange: { start: string; end: string } }) => {
        let result = [...pagos];

        if (filters.estado) {
            result = result.filter(p => p.estado === filters.estado);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(p =>
                (p.nombreCliente || `${p.cliente?.nombre || ''} ${p.cliente?.apellido || ''}`).toLowerCase().includes(search)
            );
        }

        if (filters.dateRange.start) {
            result = result.filter(p => new Date(p.fechaCreacion) >= new Date(filters.dateRange.start));
        }

        if (filters.dateRange.end) {
            result = result.filter(p => new Date(p.fechaCreacion) <= new Date(filters.dateRange.end));
        }

        setFilteredPagos(result);
    };

    const handleMarcarVisto = async (pago: Pago) => {
        if (!pago.visto) {
            try {
                await pagosApi.marcarVisto(pago.id);
                // We update local state to avoid full refresh if possible, or refresh
                refresh();
            } catch (error) {
                console.error("Error marking as viewed:", error);
            }
        }
    };



    // ... (existing imports)

    const handleShowDetail = (pago: Pago) => {
        toast.info("Cargando detalles del pago...");
        setSelectedPago(pago);
        onOpen();
        handleMarcarVisto(pago);
    };

    const handleShowAssign = (pago: Pago) => {
        toast.info("Abriendo asignación de rutina...");
        setSelectedPago(pago);
        onAssignOpen();
        handleMarcarVisto(pago);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Pagos"
                description="Administra los pagos de tus clientes y asigna rutinas"
            />

            <PagoFilters onFilterChange={handleFilterChange} />

            <div className="bg-background border border-default-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3">
                        <Spinner size="lg" color="primary" />
                        <p className="text-default-500 font-medium animate-pulse">Cargando pagos...</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile View */}
                        <div className="md:hidden space-y-4 p-4 bg-default-50">
                            {filteredPagos.map((pago) => (
                                <div key={pago.id} className="bg-background rounded-2xl p-4 shadow-sm border border-default-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-default-900 text-lg">
                                                {pago.nombreCliente || `${pago.cliente?.nombre} ${pago.cliente?.apellido}`}
                                            </span>
                                            <span className="text-tiny text-default-500">{formatDate(pago.fechaCreacion)}</span>
                                        </div>
                                        <PagoStatusBadge status={pago.estado} />
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-y border-dashed border-default-100 mb-3">
                                        <span className="text-small text-default-500">Monto</span>
                                        <span className="font-black text-xl text-primary">${(pago.monto || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-tiny text-default-400 uppercase font-bold">Rutina</span>
                                        <p className="text-small font-semibold text-default-700">{pago.nombreRutina || pago.rutina?.nombre || 'Rutina no encontrada'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="w-full"
                                            onPress={() => handleShowDetail(pago)}
                                            startContent={<Icon icon="lucide:eye" />}
                                        >
                                            Ver detalle
                                        </Button>
                                        {pago.estado === 'APROBADO' && (
                                            <Button
                                                size="sm"
                                                color="primary"
                                                className="w-full"
                                                onPress={() => handleShowAssign(pago)}
                                                startContent={<Icon icon="lucide:clipboard-list" />}
                                            >
                                                Asignar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <Table
                            aria-label="Tabla de pagos"
                            removeWrapper
                            classNames={{
                                base: "hidden md:flex",
                                th: "bg-default-50 text-default-600 font-bold uppercase py-4 border-b border-default-100",
                                td: "py-4 border-b border-default-50 last:border-0"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>CLIENTE</TableColumn>
                                <TableColumn>RUTINA</TableColumn>
                                <TableColumn>MONTO</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn align="end">ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No se encontraron pagos con los filtros seleccionados">
                                {filteredPagos.map((pago) => (
                                    <TableRow key={pago.id} className="hover:bg-default-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col relative">
                                                {!pago.visto && (
                                                    <span className="absolute -left-3 top-1 w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" title="Nuevo" />
                                                )}
                                                <span className="font-semibold text-default-900">
                                                    {pago.nombreCliente || `${pago.cliente?.nombre || 'Cliente'} ${pago.cliente?.apellido || 'no encontrado'}`}
                                                </span>
                                                {pago.cliente?.email && (
                                                    <span className="text-tiny text-default-500">{pago.cliente.email}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-default-700 font-medium">{pago.nombreRutina || pago.rutina?.nombre || 'Rutina no encontrada'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-primary-600">${(pago.monto || 0).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <PagoStatusBadge status={pago.estado} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-default-500 text-small">{formatDate(pago.fechaCreacion)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Tooltip content="Ver detalles">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() => handleShowDetail(pago)}
                                                        className="bg-default-100 text-default-600"
                                                    >
                                                        <Icon icon="lucide:eye" width={18} />
                                                    </Button>
                                                </Tooltip>

                                                {pago.estado === 'APROBADO' && (
                                                    <Tooltip content="Asignar Rutina" color="primary">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={() => handleShowAssign(pago)}
                                                        >
                                                            <Icon icon="lucide:clipboard-list" width={18} />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}
            </div>

            <PagoDetailModal
                isOpen={isDetailOpen}
                onOpenChange={onOpenChange}
                pago={selectedPago}
                onAssignRoutine={handleShowAssign}
                onStatusChange={refresh}
            />

            <AsignarRutinaModal
                isOpen={isAssignOpen}
                onOpenChange={onAssignOpenChange}
                pago={selectedPago}
                onSuccess={refresh}
            />
        </div>
    );
};
