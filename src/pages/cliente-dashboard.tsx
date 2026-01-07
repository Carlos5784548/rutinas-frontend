import React from 'react';
import { Card, CardBody, CardHeader, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/page-header';
import { routineApi, getClienteId } from '../services/api';
import { Routine } from '../types';

export const ClienteDashboard: React.FC = () => {
    const clienteId = getClienteId();
    const [routines, setRoutines] = React.useState<Routine[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchRoutines = async () => {
            if (!clienteId) return;

            try {
                setLoading(true);
                const data = await routineApi.getAll({ clienteId });
                setRoutines(data);
            } catch (error) {
                console.error('Error fetching client routines:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutines();
    }, [clienteId]);

    const activeRoutines = routines.filter(r => r.estado === 'Activa');

    const getEnfoqueColor = (enfoque: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
        switch (enfoque) {
            case 'Tonificar':
                return 'success';
            case 'Volumen':
                return 'primary';
            case 'Resistencia':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div>
            <PageHeader
                title="Mi Dashboard"
                description="Bienvenido a tu área de entrenamiento personal"
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <Card className="shadow-sm">
                            <CardBody className="flex items-center gap-4 p-6">
                                <div className="rounded-full p-3 bg-primary-100 text-primary-600">
                                    <Icon icon="lucide:clipboard-list" className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-default-600 text-sm">Rutinas Totales</p>
                                    <h3 className="text-2xl font-semibold">{routines.length}</h3>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm">
                            <CardBody className="flex items-center gap-4 p-6">
                                <div className="rounded-full p-3 bg-success-100 text-success-600">
                                    <Icon icon="lucide:check-circle" className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-default-600 text-sm">Rutinas Activas</p>
                                    <h3 className="text-2xl font-semibold">{activeRoutines.length}</h3>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Card className="shadow-sm">
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Mis Rutinas</h2>
                        </CardHeader>
                        <CardBody>
                            {routines.length === 0 ? (
                                <div className="text-center py-12">
                                    <Icon icon="lucide:clipboard" className="h-16 w-16 mx-auto mb-4 text-default-300" />
                                    <h3 className="text-lg font-medium mb-2">No tienes rutinas asignadas</h3>
                                    <p className="text-default-500">Contacta a tu entrenador para que te asigne una rutina</p>
                                </div>
                            ) : (
                                <Table removeWrapper aria-label="Mis rutinas">
                                    <TableHeader>
                                        <TableColumn>NOMBRE</TableColumn>
                                        <TableColumn>ENFOQUE</TableColumn>
                                        <TableColumn>ESTADO</TableColumn>
                                        <TableColumn>INICIO</TableColumn>
                                        <TableColumn>FIN</TableColumn>
                                        <TableColumn>ACCIONES</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {routines.map((routine) => (
                                            <TableRow key={routine.id}>
                                                <TableCell className="font-medium">{routine.nombre}</TableCell>
                                                <TableCell>
                                                    <Chip color={getEnfoqueColor(routine.enfoque)} size="sm">
                                                        {routine.enfoque}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={routine.estado === 'Activa' ? 'success' : 'default'}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {routine.estado}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>{formatDate(routine.fechaInicio)}</TableCell>
                                                <TableCell>{formatDate(routine.fechaFin)}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        to={`/rutinas/${routine.id}`}
                                                        className="text-primary-500 hover:text-primary-600 flex items-center gap-1"
                                                    >
                                                        <Icon icon="lucide:eye" className="h-4 w-4" />
                                                        Ver
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
};
