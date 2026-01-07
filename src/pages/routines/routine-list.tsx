import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Spinner,
  Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { routineApi, clientApi, getEntrenadorId, isTrainer } from '../../services/api';
import { Routine, Client, RoutineFilter } from '../../types';
import { addToast } from '@heroui/react';
import { ErrorAlert } from '../../components/ui/error-alert';

export const RoutineList: React.FC = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = React.useState<Routine[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<RoutineFilter>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [routineToDelete, setRoutineToDelete] = React.useState<Routine | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();

  const rowsPerPage = 10;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const filteredRoutines = React.useMemo(() => {
    return routines.filter(routine => {
      const matchesEnfoque = !filter.enfoque || routine.enfoque === filter.enfoque;
      const matchesClient = !filter.clienteId || routine.clienteId === filter.clienteId;
      const matchesSearch = !searchQuery ||
        routine.nombre.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesEnfoque && matchesClient && matchesSearch;
    });
  }, [routines, filter, searchQuery]);

  const paginatedRoutines = filteredRoutines.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredRoutines.length / rowsPerPage);

  React.useEffect(() => {
    fetchRoutines();
    fetchClients();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routineApi.getAll();
      setRoutines(data.filter(r => r.estado !== 'CANCELADA'));
    } catch (error) {
      console.error('Error fetching routines:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await clientApi.getAll(entrenadorId || undefined);
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleFilterChange = (key: keyof RoutineFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDeleteClick = (routine: Routine) => {
    setRoutineToDelete(routine);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!routineToDelete?.id) return;

    try {
      setIsDeleting(true);
      await routineApi.delete(routineToDelete.id);
      setRoutines(routines.filter(routine => routine.id !== routineToDelete.id));
      addToast({
        title: 'Rutina cancelada',
        description: `La rutina ${routineToDelete.nombre} ha sido cancelada correctamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting routine:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo eliminar la rutina',
        severity: 'danger'
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setRoutineToDelete(null);
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

  const getClientName = (clienteId: number) => {
    const client = clients.find(c => c.id === clienteId);
    return client ? client.nombre : 'Cliente no encontrado';
  };

  // Añadir función para obtener el color del estado
  const getEstadoColor = (estado: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (estado) {
      case 'ACTIVA':
      case 'Activa':
        return 'success';
      case 'PENDIENTE_DE_PAGO':
        return 'warning';
      case 'FINALIZADA':
      case 'Completada':
        return 'primary';
      case 'CANCELADA':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <PageHeader
        title="Rutinas"
        description="Gestiona las rutinas de entrenamiento"
        actionLabel="Crear Rutina"
        actionPath="/rutinas/crear"
      />

      {error && (
        <ErrorAlert
          error={error}
          onRetry={fetchRoutines}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="bg-content1 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-4 flex-wrap">
          <Input
            placeholder="Buscar por nombre..."
            startContent={<Icon icon="lucide:search" className="h-4 w-4 text-default-400" />}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="sm:max-w-xs"
          />

          <Select
            placeholder="Filtrar por enfoque"
            selectedKeys={filter.enfoque ? [filter.enfoque] : []}
            onSelectionChange={(keys) => {
              const selectedKeys = Array.from(keys);
              handleFilterChange('enfoque', selectedKeys[0] || undefined);
            }}
            className="sm:max-w-xs"
          >
            <SelectItem key="Tonificar">Tonificar</SelectItem>
            <SelectItem key="Volumen">Volumen</SelectItem>
            <SelectItem key="Resistencia">Resistencia</SelectItem>
          </Select>

          <Select
            placeholder="Filtrar por cliente"
            selectedKeys={filter.clienteId ? [filter.clienteId.toString()] : []}
            onSelectionChange={(keys) => {
              const selectedKeys = Array.from(keys);
              handleFilterChange('clienteId', selectedKeys[0] ? parseInt(selectedKeys[0] as string) : undefined);
            }}
            className="sm:max-w-xs"
          >
            {clients.map((client) => (
              <SelectItem key={client.id?.toString()}>
                {client.nombre}
              </SelectItem>
            ))}
          </Select>

          <Button
            variant="flat"
            color="primary"
            onPress={() => {
              setFilter({});
              setSearchQuery('');
              setPage(1);
            }}
            startContent={<Icon icon="lucide:refresh-cw" className="h-4 w-4" />}
            className="sm:ml-auto"
          >
            Reiniciar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : filteredRoutines.length === 0 ? (
          <EmptyState
            title="No hay rutinas"
            description="No se encontraron rutinas con los filtros aplicados."
            icon="lucide:clipboard-list"
            actionLabel="Crear Rutina"
            actionPath="/rutinas/crear"
          />
        ) : (
          <>
            <Table removeWrapper aria-label="Tabla de rutinas">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>CLIENTE</TableColumn>
                <TableColumn>ENFOQUE</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>FECHA INICIO</TableColumn>
                <TableColumn>FECHA FIN</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedRoutines.map((routine) => (
                  <TableRow key={routine.id}>
                    <TableCell>{routine.nombre}</TableCell>
                    <TableCell>{getClientName(routine.clienteId)}</TableCell>
                    <TableCell>
                      <Chip color={getEnfoqueColor(routine.enfoque)} size="sm">
                        {routine.enfoque}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={getEstadoColor(routine.estado)} size="sm">
                        {routine.estado}
                      </Chip>
                    </TableCell>
                    <TableCell>{formatDate(routine.fechaInicio)}</TableCell>
                    <TableCell>{formatDate(routine.fechaFin)}</TableCell>
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

                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Acciones de rutina">
                            <DropdownItem
                              key="view"
                              onPress={() => navigate(`/rutinas/${routine.id}`)}
                              startContent={<Icon icon="lucide:eye" className="h-4 w-4" />}
                            >
                              Ver detalles
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              onPress={() => navigate(`/rutinas/${routine.id}/editar`)}
                              startContent={<Icon icon="lucide:pencil" className="h-4 w-4" />}
                            >
                              Editar
                            </DropdownItem>
                            <DropdownItem
                              key="add-exercise"
                              onPress={() => navigate(`/rutinas/${routine.id}`)}
                              startContent={<Icon icon="lucide:plus" className="h-4 w-4" />}
                            >
                              Añadir Ejercicios
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:ban" className="h-4 w-4" />}
                              onPress={() => handleDeleteClick(routine)}
                            >
                              Cancelar Rutina
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center p-4">
              <p className="text-sm text-default-500">
                Mostrando {Math.min(filteredRoutines.length, startIndex + 1)}-{Math.min(filteredRoutines.length, endIndex)} de {filteredRoutines.length} rutinas
              </p>

              <Pagination
                total={totalPages}
                initialPage={1}
                page={page}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Cancelar Rutina"
        message={`¿Estás seguro de que deseas cancelar la rutina ${routineToDelete?.nombre}? El cliente ya no podrá verla.`}
        confirmLabel="Confirmar Cancelación"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};