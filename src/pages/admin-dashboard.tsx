import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Spinner,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/page-header';
import { clientApi, routineApi, exerciseApi, userApi, adminApi } from '../services/api';
import { EntrenadorResponseDTO, EntrenadorRequestDTO } from '../types';
import { useForm, Controller } from 'react-hook-form';

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = React.useState({
        users: 0,
        clients: 0,
        routines: 0,
        exercises: 0,
        trainers: 0
    });

    const [trainers, setTrainers] = React.useState<EntrenadorResponseDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { control, handleSubmit, reset } = useForm<EntrenadorRequestDTO>();
    const [submitting, setSubmitting] = React.useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [users, clients, routines, exercises, trainersList] = await Promise.all([
                userApi.getAll(),
                clientApi.getAll(),
                routineApi.getAll(),
                exerciseApi.getAll(),
                adminApi.listarEntrenadores()
            ]);

            console.log('API Response - Trainers:', trainersList); // Debug log

            setStats({
                users: users.length,
                clients: clients.length,
                routines: routines.length,
                exercises: exercises.length,
                trainers: Array.isArray(trainersList) ? trainersList.length : 0
            });

            const list = Array.isArray(trainersList) ? trainersList : [];
            setTrainers(list);
            console.log('Trainers state set to:', list);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            addToast({
                title: 'Error',
                description: 'No se pudieron cargar los datos del dashboard',
                severity: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: EntrenadorRequestDTO) => {
        try {
            setSubmitting(true);
            await adminApi.crearEntrenador(data);
            addToast({
                title: 'Éxito',
                description: 'Entrenador creado correctamente',
                severity: 'success'
            });
            reset();
            onOpenChange();
            fetchData(); // Refresh list and stats
        } catch (error: any) {
            console.error('Error creating trainer:', error);
            addToast({
                title: 'Error',
                description: error.message || 'No se pudo crear el entrenador',
                severity: 'danger'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const statCards = [
        {
            title: 'Usuarios',
            value: stats.users,
            icon: 'lucide:users',
            color: 'bg-primary-100 text-primary-600',
            path: '/usuarios'
        },
        {
            title: 'Entrenadores',
            value: stats.trainers,
            icon: 'lucide:award',
            color: 'bg-secondary-100 text-secondary-600',
            path: '#'
        },
        {
            title: 'Clientes',
            value: stats.clients,
            icon: 'lucide:user',
            color: 'bg-success-100 text-success-600',
            path: '/clientes'
        },
        {
            title: 'Rutinas',
            value: stats.routines,
            icon: 'lucide:clipboard-list',
            color: 'bg-warning-100 text-warning-600',
            path: '/rutinas'
        }
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                title="Dashboard Administrador"
                description="Gestión completa del sistema de entrenamiento"
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            )}

            <div className="grid grid-cols-1 gap-8">
                <Card className="shadow-sm">
                    <CardHeader className="flex justify-between items-center px-6 pt-6 pb-0">
                        <h2 className="text-xl font-semibold">Gestión de Entrenadores</h2>
                        <Button
                            color="primary"
                            startContent={<Icon icon="lucide:plus" />}
                            onPress={onOpen}
                        >
                            Nuevo Entrenador
                        </Button>
                    </CardHeader>
                    <CardBody className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Spinner />
                            </div>
                        ) : (
                            <Table aria-label="Lista de entrenadores" removeWrapper shadow="none">
                                <TableHeader>
                                    <TableColumn>NOMBRE</TableColumn>
                                    <TableColumn>EMAIL</TableColumn>
                                    <TableColumn>TELÉFONO</TableColumn>
                                    <TableColumn>EDAD</TableColumn>
                                    <TableColumn>ESPECIALIDAD</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No hay entrenadores registrados">
                                    {trainers.map((trainer, index) => {
                                        console.log('Rendering trainer:', trainer);
                                        return (
                                            <TableRow key={trainer.id || index}>
                                                <TableCell className="font-medium">{trainer.nombre} {trainer.apellido}</TableCell>
                                                <TableCell>{trainer.email}</TableCell>
                                                <TableCell>{trainer.telefono}</TableCell>
                                                <TableCell>{trainer.edad}</TableCell>
                                                <TableCell>{trainer.especialidad || 'General'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardBody>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <h2 className="text-lg font-medium">Accesos Rápidos</h2>
                        </CardHeader>
                        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/usuarios/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
                                <div className="bg-primary-100 rounded-full p-2">
                                    <Icon icon="lucide:user-plus" className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Crear Usuario</h3>
                                </div>
                            </Link>

                            <Link to="/clientes/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
                                <div className="bg-success-100 rounded-full p-2">
                                    <Icon icon="lucide:user-plus" className="h-5 w-5 text-success-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Crear Cliente</h3>
                                </div>
                            </Link>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <h2 className="text-lg font-medium">Sistema</h2>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-default-600">Estado</span>
                                <span className="text-success-600 font-medium">Conectado</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-default-600">Versión</span>
                                <span>1.0.0</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader className="flex flex-col gap-1">Registrar Nuevo Entrenador</ModalHeader>
                            <ModalBody className="gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="nombre"
                                        control={control}
                                        rules={{ required: 'El nombre es requerido' }}
                                        render={({ field, fieldState }) => (
                                            <Input
                                                label="Nombre"
                                                placeholder="Ej: Juan"
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="apellido"
                                        control={control}
                                        rules={{ required: 'El apellido es requerido' }}
                                        render={({ field, fieldState }) => (
                                            <Input
                                                label="Apellido"
                                                placeholder="Ej: Pérez"
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: 'El email es requerido',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email inválido"
                                        }
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="juan@ejemplo.com"
                                            isInvalid={!!fieldState.error}
                                            errorMessage={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{ required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label="Contraseña"
                                            type="password"
                                            placeholder="******"
                                            isInvalid={!!fieldState.error}
                                            errorMessage={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="telefono"
                                        control={control}
                                        rules={{ required: 'El teléfono es requerido' }}
                                        render={({ field, fieldState }) => (
                                            <Input
                                                label="Teléfono"
                                                placeholder="123456789"
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="edad"
                                        control={control}
                                        rules={{ required: 'La edad es requerida', min: { value: 18, message: 'Mínimo 18 años' } }}
                                        render={({ field, fieldState }) => (
                                            <Input
                                                label="Edad"
                                                type="number"
                                                placeholder="30"
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        )}
                                    />
                                </div>
                                <Controller
                                    name="especialidad"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Especialidad"
                                            placeholder="Ej: HIIT, Musculación, Yoga"
                                            {...field}
                                        />
                                    )}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" type="submit" isLoading={submitting}>
                                    Guardar
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};
