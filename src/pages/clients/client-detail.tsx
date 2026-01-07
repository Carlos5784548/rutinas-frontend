import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  Tabs,
  Tab,
  Select,
  SelectItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { Client, Routine, RutinaResponseDTO, ProgresoEjercicioResponseDTO } from '../../types';
import { addToast } from '@heroui/react';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = React.useState<Client | null>(null);
  const [routines, setRoutines] = React.useState<RutinaResponseDTO[]>([]);
  const [progress, setProgress] = React.useState<ProgresoEjercicioResponseDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [routinesLoading, setRoutinesLoading] = React.useState(true);
  const [progressLoading, setProgressLoading] = React.useState(true);
  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();
  const [selectedExercise, setSelectedExercise] = React.useState<string>("");

  const uniqueExercises = React.useMemo(() => {
    const exercises = progress.map(p => p.ejercicioNombre);
    return Array.from(new Set(exercises)).sort();
  }, [progress]);

  const filteredProgress = React.useMemo(() => {
    if (!selectedExercise) return progress;
    return progress.filter(p => p.ejercicioNombre === selectedExercise);
  }, [progress, selectedExercise]);

  React.useEffect(() => {
    if (id) {
      const clientId = parseInt(id);
      fetchClient(clientId);
      fetchClientRoutines(clientId);
      fetchClientProgress(clientId);
    }
  }, [id]);

  const fetchClient = async (clientId: number) => {
    try {
      setLoading(true);
      let data: Client;

      if (isTrainerUser && entrenadorId) {
        data = await trainerApi.getClient(entrenadorId, clientId);
      } else {
        data = await clientApi.getById(clientId);
      }

      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo cargar la información del cliente',
        severity: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientRoutines = async (clientId: number) => {
    try {
      setRoutinesLoading(true);
      // Use the new endpoint provided by user
      const data = await clientApi.getMyRoutines(clientId);
      setRoutines(data);
    } catch (error) {
      console.error('Error fetching client routines:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron cargar las rutinas del cliente',
        severity: 'danger'
      });
    } finally {
      setRoutinesLoading(false);
    }
  };

  const fetchClientProgress = async (clientId: number) => {
    try {
      setProgressLoading(true);
      let data: ProgresoEjercicioResponseDTO[];

      if (isTrainerUser && entrenadorId) {
        data = await trainerApi.getClientProgress(entrenadorId, clientId);
      } else {
        data = await clientApi.getMyProgress(clientId);
      }

      setProgress(data);
    } catch (error) {
      console.error('Error fetching client progress:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo cargar el progreso del cliente',
        severity: 'danger'
      });
    } finally {
      setProgressLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="El cliente que estás buscando no existe o ha sido eliminado."
        icon="lucide:user-x"
        actionLabel="Volver a Clientes"
        actionPath="/clientes"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`Cliente: ${client.nombre} ${client.apellido || ''}`}
        backLink="/clientes"
        actionLabel="Editar Cliente"
        actionIcon="lucide:pencil"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Información Personal</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-default-500">Nombre Completo</p>
                <p className="font-medium">{client.nombre} {client.apellido}</p>
              </div>

              <div>
                <p className="text-sm text-default-500">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>

              <div>
                <p className="text-sm text-default-500">Teléfono</p>
                <p className="font-medium">{client.telefono}</p>
              </div>

              <div>
                <p className="text-sm text-default-500">Edad</p>
                <p className="font-medium">{client.edad} años</p>
              </div>

              {client.objetivo && (
                <div>
                  <p className="text-sm text-default-500">Objetivo</p>
                  <p className="font-medium">{client.objetivo}</p>
                </div>
              )}

              {client.usuario && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-default-500">Usuario Asociado</p>
                    <p className="font-medium">{client.usuario.nombre}</p>
                    <p className="text-sm text-default-500 mt-1">Email de Usuario</p>
                    <p className="font-medium">{client.usuario.email}</p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs aria-label="Gestión de cliente" color="primary" variant="underlined">
            <Tab
              key="rutinas"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="lucide:clipboard-list" />
                  <span>Rutinas</span>
                </div>
              }
            >
              <Card className="shadow-sm mt-4">
                <CardHeader className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Rutinas Asignadas</h2>
                  <Button
                    as={Link}
                    to={`/rutinas/crear?clienteId=${client.id}`}
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="lucide:plus" className="h-4 w-4" />}
                  >
                    Nueva Rutina
                  </Button>
                </CardHeader>
                <CardBody>
                  {routinesLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Spinner size="md" color="primary" />
                    </div>
                  ) : routines.length === 0 ? (
                    <EmptyState
                      title="Sin rutinas"
                      description="Este cliente aún no tiene rutinas asignadas."
                      icon="lucide:clipboard"
                      actionLabel="Crear Rutina"
                      actionPath={`/rutinas/crear?clienteId=${client.id}`}
                    />
                  ) : (
                    <Table removeWrapper aria-label="Rutinas del cliente">
                      <TableHeader>
                        <TableColumn>NOMBRE</TableColumn>
                        <TableColumn>ENFOQUE</TableColumn>
                        <TableColumn>FECHA INICIO</TableColumn>
                        <TableColumn>ESTADO</TableColumn>
                        <TableColumn>ACCIONES</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {routines.map((routine) => (
                          <TableRow key={routine.id}>
                            <TableCell className="font-medium">{routine.nombre}</TableCell>
                            <TableCell>
                              <Chip color={getEnfoqueColor(routine.enfoque)} size="sm" variant="flat">
                                {routine.enfoque}
                              </Chip>
                            </TableCell>
                            <TableCell>{formatDate(routine.fechaInicio)}</TableCell>
                            <TableCell>
                              <Chip color={routine.estado === 'Activa' ? 'success' : 'default'} size="sm" variant="dot">
                                {routine.estado}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  as={Link}
                                  to={`/rutinas/${routine.id}`}
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  isIconOnly
                                >
                                  <Icon icon="lucide:eye" className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="progreso"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="lucide:trending-up" />
                  <span>Progreso</span>
                </div>
              }
            >
              <Card className="shadow-sm mt-4">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-lg font-medium">Seguimiento de Ejercicios</h2>
                  <div className="w-full md:w-72">
                    <Select
                      label="Filtrar por ejercicio"
                      placeholder="Todos los ejercicios"
                      size="sm"
                      selectedKeys={selectedExercise ? [selectedExercise] : []}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                    >
                      {uniqueExercises.map((exercise) => (
                        <SelectItem key={exercise}>
                          {exercise}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </CardHeader>
                <CardBody>
                  {progressLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Spinner size="md" color="primary" />
                    </div>
                  ) : filteredProgress.length === 0 ? (
                    <div className="text-center py-10">
                      <Icon icon="lucide:line-chart" className="h-12 w-12 mx-auto text-default-300 mb-2" />
                      <p className="text-default-500">
                        {selectedExercise
                          ? `No hay registros para "${selectedExercise}"`
                          : "No hay registros de progreso para este cliente."}
                      </p>
                    </div>
                  ) : (
                    <Table removeWrapper aria-label="Progreso del cliente">
                      <TableHeader>
                        <TableColumn>FECHA</TableColumn>
                        <TableColumn>EJERCICIO</TableColumn>
                        <TableColumn>DÍA</TableColumn>
                        <TableColumn>SERIE</TableColumn>
                        <TableColumn>PESO</TableColumn>
                        <TableColumn>ESTADO</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {filteredProgress.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.fecha)}</TableCell>
                            <TableCell className="font-medium">{item.ejercicioNombre}</TableCell>
                            <TableCell>Día {item.dia || '-'}</TableCell>
                            <TableCell>Set {item.serieNumero || '-'}</TableCell>
                            <TableCell>{item.kg ?? item.peso ? `${item.kg ?? item.peso} kg` : '-'}</TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={item.completado ? "success" : "warning"}
                                startContent={item.completado ? <Icon icon="lucide:check" /> : <Icon icon="lucide:clock" />}
                              >
                                {item.completado ? "Completado" : "Pendiente"}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};