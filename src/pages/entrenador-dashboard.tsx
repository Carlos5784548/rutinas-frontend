import React from 'react';
import { Card, CardBody, CardHeader, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/page-header';
import { trainerApi, routineApi, exerciseApi, getEntrenadorId } from '../services/api';
import { Client } from '../types';

export const EntrenadorDashboard: React.FC = () => {
    const entrenadorId = getEntrenadorId();
    const [stats, setStats] = React.useState({
        clients: 0,
        routines: 0,
        exercises: 0
    });
    const [recentClients, setRecentClients] = React.useState<Client[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            if (!entrenadorId) return;

            try {
                setLoading(true);
                const [clients, routines, exercises] = await Promise.all([
                    trainerApi.getMyClients(entrenadorId),
                    routineApi.getAll(),
                    exerciseApi.getAll()
                ]);

                setStats({
                    clients: clients.length,
                    routines: routines.length,
                    exercises: exercises.length
                });

                // Get most recent clients (last 5)
                setRecentClients(clients.slice(-5).reverse());
            } catch (error) {
                console.error('Error fetching trainer dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [entrenadorId]);

    const statCards = [
        {
            title: 'Mis Clientes',
            value: stats.clients,
            icon: 'lucide:users',
            color: 'bg-success-100 text-success-600',
            path: '/clientes'
        },
        {
            title: 'Rutinas Totales',
            value: stats.routines,
            icon: 'lucide:clipboard-list',
            color: 'bg-warning-100 text-warning-600',
            path: '/rutinas'
        },
        {
            title: 'Ejercicios Disponibles',
            value: stats.exercises,
            icon: 'lucide:dumbbell',
            color: 'bg-secondary-100 text-secondary-600',
            path: '/ejercicios'
        }
    ];

    return (
        <div>
            <PageHeader
                title="Dashboard Entrenador"
                description="Gestiona tus clientes y rutinas de entrenamiento"
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        {statCards.map((stat) => (
                            <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
                                <CardBody className="flex items-center gap-4 p-6">
                                    <div className={`rounded-full p-3 ${stat.color}`}>
                                        <Icon icon={stat.icon} className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-default-600 text-sm">{stat.title}</p>
                                        <h3 className="text-2xl font-semibold">{stat.value}</h3>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-sm">
                            <CardHeader className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Accesos Rápidos</h2>
                            </CardHeader>
                            <CardBody className="grid grid-cols-1 gap-4">
                                <Link to="/clientes/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
                                    <div className="bg-success-100 rounded-full p-2">
                                        <Icon icon="lucide:user-plus" className="h-5 w-5 text-success-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Añadir Cliente</h3>
                                        <p className="text-sm text-default-600">Registrar un nuevo cliente</p>
                                    </div>
                                </Link>

                                <Link to="/rutinas/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
                                    <div className="bg-warning-100 rounded-full p-2">
                                        <Icon icon="lucide:clipboard-plus" className="h-5 w-5 text-warning-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Crear Rutina</h3>
                                        <p className="text-sm text-default-600">Diseñar nueva rutina de entrenamiento</p>
                                    </div>
                                </Link>

                                <Link to="/ejercicios/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
                                    <div className="bg-secondary-100 rounded-full p-2">
                                        <Icon icon="lucide:plus-circle" className="h-5 w-5 text-secondary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Crear Ejercicio</h3>
                                        <p className="text-sm text-default-600">Añadir nuevo ejercicio</p>
                                    </div>
                                </Link>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Clientes Recientes</h2>
                                <Link to="/clientes" className="text-sm text-primary-500 hover:text-primary-600">
                                    Ver todos
                                </Link>
                            </CardHeader>
                            <CardBody>
                                {recentClients.length === 0 ? (
                                    <div className="text-center py-8 text-default-500">
                                        <Icon icon="lucide:users" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No hay clientes registrados aún</p>
                                    </div>
                                ) : (
                                    <Table removeWrapper aria-label="Clientes recientes">
                                        <TableHeader>
                                            <TableColumn>NOMBRE</TableColumn>
                                            <TableColumn>EMAIL</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {recentClients.map((client) => (
                                                <TableRow key={client.id}>
                                                    <TableCell>
                                                        <Link to={`/clientes/${client.id}`} className="text-primary-500 hover:text-primary-600">
                                                            {client.nombre} {client.apellido}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{client.email}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};
