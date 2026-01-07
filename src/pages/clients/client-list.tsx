import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Spinner,
  Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { Client } from '../../types';
import { addToast } from '@heroui/react';
import { ErrorAlert } from '../../components/ui/error-alert';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<any>(null);

  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();

  const rowsPerPage = 10;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const filteredClients = React.useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = !searchQuery ||
        client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.telefono.includes(searchQuery);

      return matchesSearch;
    });
  }, [clients, searchQuery]);

  const paginatedClients = filteredClients.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Client[] = [];

      if (isTrainerUser && entrenadorId) {
        data = await trainerApi.getMyClients(entrenadorId);
      } else {
        data = await clientApi.getAll(entrenadorId);
      }
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete?.id) return;

    try {
      setIsDeleting(true);
      if (isTrainerUser && entrenadorId) {
        await trainerApi.deleteClient(entrenadorId, clientToDelete.id);
      } else {
        await clientApi.delete(clientToDelete.id);
      }

      setClients(clients.filter(client => client.id !== clientToDelete.id));
      addToast({
        title: 'Cliente eliminado',
        description: `El cliente ${clientToDelete.nombre} ha sido eliminado correctamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        severity: 'danger'
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={isTrainerUser ? "Mis Clientes" : "Clientes"}
        description={isTrainerUser ? "Gestiona tus clientes asignados" : "Gestiona los clientes del sistema"}
        actionLabel="Crear Cliente"
        actionPath="/clientes/crear"
      />

      {error && (
        <ErrorAlert
          error={error}
          onRetry={fetchClients}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="bg-content1 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            startContent={<Icon icon="lucide:search" className="h-4 w-4 text-default-400" />}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="sm:max-w-xs"
          />

          <Button
            variant="flat"
            color="primary"
            onPress={() => {
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
        ) : filteredClients.length === 0 ? (
          <EmptyState
            title="No hay clientes"
            description="No se encontraron clientes con los filtros aplicados."
            icon="lucide:user"
            actionLabel="Crear Cliente"
            actionPath="/clientes/crear"
          />
        ) : (
          <>
            <Table removeWrapper aria-label="Tabla de clientes">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>TELÉFONO</TableColumn>
                <TableColumn>EDAD</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.nombre} {client.apellido}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telefono}</TableCell>
                    <TableCell>{client.edad}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          as={Link}
                          to={`/clientes/${client.id}`}
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
                          <DropdownMenu aria-label="Acciones de cliente">
                            <DropdownItem
                              key="view"
                              as={Link}
                              to={`/clientes/${client.id}`}
                              startContent={<Icon icon="lucide:eye" className="h-4 w-4" />}
                            >
                              Ver detalles
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Icon icon="lucide:pencil" className="h-4 w-4" />}
                              onPress={() => navigate(`/clientes/${client.id}/editar`)}
                            >
                              Editar
                            </DropdownItem>
                            <DropdownItem
                              key="routines"
                              as={Link}
                              to={`/clientes/${client.id}`}
                              startContent={<Icon icon="lucide:clipboard-list" className="h-4 w-4" />}
                            >
                              Ver Rutinas
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash" className="h-4 w-4" />}
                              onPress={() => handleDeleteClick(client)}
                            >
                              Eliminar
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
                Mostrando {Math.min(filteredClients.length, startIndex + 1)}-{Math.min(filteredClients.length, endIndex)} de {filteredClients.length} clientes
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
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente ${clientToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};