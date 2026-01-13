import React from 'react';
import { Card, CardBody, CardHeader, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/page-header';
import { trainerApi, routineApi, exerciseApi, getEntrenadorId } from '../services/api';
import { Client } from '../types';
import { usePagoStats } from '../hooks/usePagoStats';

export const EntrenadorDashboard: React.FC = () => {
    const entrenadorId = getEntrenadorId();
    const { stats: paymentStats, loading: loadingPayments } = usePagoStats();
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
            value: paymentStats.cantidadClientesActivos,
            icon: 'lucide:users',
            color: 'bg-success-100 text-success-600',
            path: '/clientes'
        },
        {
            title: 'Rutinas Activas',
            value: paymentStats.rutinasActivas,
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

    const paymentCards = [
        {
            title: 'Pagos Pendientes',
            value: paymentStats.pagosPendientes,
            icon: 'lucide:clock',
            color: 'bg-warning-100 text-warning-600',
            path: '/pagos?estado=PENDIENTE'
        },
        {
            title: 'Recaudado (Mes)',
            value: `$${(paymentStats.ingresosMesActual || 0).toLocaleString()}`,
            icon: 'lucide:dollar-sign',
            color: 'bg-primary-100 text-primary-600',
            path: '/pagos'
        },
        {
            title: 'Ingresos Totales',
            value: `$${(paymentStats.ingresosTotales || 0).toLocaleString()}`,
            icon: 'lucide:trending-up',
            color: 'bg-success-100 text-success-600',
            path: '/pagos'
        }
    ];

    return (
        <div>
            <PageHeader
                title="Dashboard Entrenador"
                description="Gestiona tus clientes y rutinas de entrenamiento"
            />

            {(loading || loadingPayments) ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        {statCards.map((stat) => (
                            <Link to={stat.path} key={stat.title} className="block">
                                <Card className="shadow-none border border-default-200 hover:border-primary-500/50 hover:shadow-md transition-all duration-300 h-full group cursor-pointer bg-background/60 backdrop-blur-sm">
                                    <CardBody className="flex flex-row items-center justify-between p-6 overflow-hidden">
                                        <div className="flex flex-col gap-1 z-10">
                                            <p className="text-tiny font-bold text-default-500 uppercase tracking-wider">{stat.title}</p>
                                            <h3 className="text-4xl font-bold text-default-900 tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
                                        </div>
                                        <div className={`rounded-2xl p-3 ${stat.color.replace('bg-', 'bg-opacity-20 ')} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon icon={stat.icon} className="h-6 w-6" />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-default-900 flex items-center gap-2 mb-4">
                        <Icon icon="lucide:banknote" className="text-primary-500" />
                        Resumen de Pagos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        {paymentCards.map((stat) => (
                            <Link to={stat.path} key={stat.title} className="block">
                                <Card className="shadow-none border border-default-200 hover:border-primary-500/50 hover:shadow-md transition-all duration-300 h-full group cursor-pointer bg-background/60 backdrop-blur-sm">
                                    <CardBody className="flex flex-row items-center justify-between p-6 overflow-hidden">
                                        <div className="flex flex-col gap-1 z-10">
                                            <p className="text-tiny font-bold text-default-500 uppercase tracking-wider">{stat.title}</p>
                                            <h3 className="text-3xl font-bold text-default-900 tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
                                        </div>
                                        <div className={`rounded-2xl p-3 ${stat.color.replace('bg-', 'bg-opacity-20 ')} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon icon={stat.icon} className="h-6 w-6" />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold tracking-tight text-default-900 flex items-center gap-2">
                                <Icon icon="lucide:zap" className="text-warning-500" />
                                Accesos Rápidos
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <Link to="/clientes/crear">
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-default-200 bg-background hover:bg-default-50 hover:border-primary-200 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                                        <div className="bg-success-50 text-success-600 rounded-lg p-3 group-hover:bg-success-100 transition-colors">
                                            <Icon icon="lucide:user-plus" className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-default-900 group-hover:text-primary-600 transition-colors">Añadir Cliente</h3>
                                            <p className="text-sm text-default-500">Registrar un nuevo cliente en el sistema</p>
                                        </div>
                                        <Icon icon="lucide:chevron-right" className="ml-auto text-default-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <Link to="/rutinas/crear">
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-default-200 bg-background hover:bg-default-50 hover:border-primary-200 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                                        <div className="bg-warning-50 text-warning-600 rounded-lg p-3 group-hover:bg-warning-100 transition-colors">
                                            <Icon icon="lucide:clipboard-plus" className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-default-900 group-hover:text-primary-600 transition-colors">Crear Rutina</h3>
                                            <p className="text-sm text-default-500">Diseñar un nuevo plan de entrenamiento</p>
                                        </div>
                                        <Icon icon="lucide:chevron-right" className="ml-auto text-default-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <Link to="/ejercicios/crear">
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-default-200 bg-background hover:bg-default-50 hover:border-primary-200 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                                        <div className="bg-secondary-50 text-secondary-600 rounded-lg p-3 group-hover:bg-secondary-100 transition-colors">
                                            <Icon icon="lucide:dumbbell" className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-default-900 group-hover:text-primary-600 transition-colors">Crear Ejercicio</h3>
                                            <p className="text-sm text-default-500">Añadir un nuevo ejercicio al catálogo</p>
                                        </div>
                                        <Icon icon="lucide:chevron-right" className="ml-auto text-default-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <Card className="shadow-none border border-default-200 bg-background h-full">
                            <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                                <h2 className="text-xl font-bold tracking-tight text-default-900">Clientes Recientes</h2>
                                <Link to="/clientes" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-all">
                                    Ver todos
                                </Link>
                            </CardHeader>
                            <CardBody className="p-0">
                                {recentClients.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <div className="bg-default-50 p-4 rounded-full mb-3 border border-dashed border-default-200">
                                            <Icon icon="lucide:users" className="h-8 w-8 text-default-400" />
                                        </div>
                                        <h3 className="text-md font-semibold text-default-700">Sin actividad reciente</h3>
                                        <p className="text-small text-default-500 max-w-xs mt-1">
                                            Aún no has registrado clientes. Comienza añadiendo el primero.
                                        </p>
                                        <Button
                                            as={Link}
                                            to="/clientes/crear"
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                            className="mt-4 font-medium"
                                            startContent={<Icon icon="lucide:plus" width={16} />}
                                        >
                                            Añadir Cliente
                                        </Button>
                                    </div>
                                ) : (
                                    <Table
                                        removeWrapper
                                        aria-label="Clientes recientes"
                                        classNames={{
                                            th: "bg-default-50 text-default-500 text-xs font-semibold uppercase tracking-wider border-b border-default-100",
                                            td: "py-3 border-b border-default-50 last:border-0"
                                        }}
                                    >
                                        <TableHeader>
                                            <TableColumn>NOMBRE</TableColumn>
                                            <TableColumn>EMAIL</TableColumn>
                                            <TableColumn align="end">ACCIÓN</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {recentClients.map((client) => (
                                                <TableRow key={client.id} className="hover:bg-default-50/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                                                                {client.nombre.charAt(0).toUpperCase()}
                                                            </div>
                                                            <Link to={`/clientes/${client.id}`} className="font-medium text-default-900 hover:text-primary-600 transition-colors">
                                                                {client.nombre} {client.apellido}
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-default-500 text-sm">{client.email}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            as={Link}
                                                            to={`/clientes/${client.id}`}
                                                            className="text-default-400 hover:text-primary-500"
                                                        >
                                                            <Icon icon="lucide:chevron-right" width={18} />
                                                        </Button>
                                                    </TableCell>
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
