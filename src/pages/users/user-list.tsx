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
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { clientApi } from '../../services/api';
import { Client } from '../../types';
import { addToast } from '@heroui/react';
import { ErrorAlert } from '../../components/ui/error-alert';

export const UserList: React.FC = () => {
  // ahora manejamos clientes en lugar de usuarios genéricos
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<UserFilter>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  
  const rowsPerPage = 10;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  const filteredUsers = React.useMemo(() => {
    return clients.filter(user => {
      const matchesRole = !filter.rol || user.rol === filter.rol;
      const matchesSearch = !searchQuery || 
        user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesRole && matchesSearch;
    });
  }, [clients, filter, searchQuery]);
  
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  
  React.useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const data = await clientApi.getAll();
        setClients(data);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);
  
  const handleFilterChange = (key: keyof UserFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };
  
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete?.id) return;
    
    try {
      setIsDeleting(true);
      await userApi.delete(userToDelete.id);
      setClients(clients.filter(user => user.id !== userToDelete.id));
      addToast({
        title: 'Usuario eliminado',
        description: `El usuario ${userToDelete.nombre} ha sido eliminado correctamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        severity: 'danger'
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };
  
  const roleColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    ADMIN: 'danger',
    CLIENTE: 'success',
    ENTRENADOR: 'primary'
  };
  
  const renderRoleChip = (role: string) => {
    return (
      <Chip color={roleColorMap[role] || 'default'} size="sm">
        {role}
      </Chip>
    );
  };
  
  return (
    <div>
      <PageHeader 
        title="Usuarios" 
        description="Gestiona los usuarios del sistema" 
        actionLabel="Crear Usuario"
        actionPath="/usuarios/crear"
      />
      
      {error && (
        <ErrorAlert 
          error={error} 
          onRetry={fetchUsers} 
          onDismiss={() => setError(null)} 
        />
      )}
      
      <div className="bg-content1 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por nombre o email..."
            startContent={<Icon icon="lucide:search" className="h-4 w-4 text-default-400" />}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="sm:max-w-xs"
          />
          
          <Select
            placeholder="Filtrar por rol"
            selectedKeys={filter.rol ? [filter.rol] : []}
            onSelectionChange={(keys) => {
              const selectedKeys = Array.from(keys);
              handleFilterChange('rol', selectedKeys[0] || undefined);
            }}
            className="sm:max-w-xs"
          >
            <SelectItem key="ADMIN" value="ADMIN">Administrador</SelectItem>
            <SelectItem key="CLIENTE" value="CLIENTE">Cliente</SelectItem>
            <SelectItem key="ENTRENADOR" value="ENTRENADOR">Entrenador</SelectItem>
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
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No hay usuarios"
            description="No se encontraron usuarios con los filtros aplicados."
            icon="lucide:users"
            actionLabel="Crear Usuario"
            actionPath="/usuarios/crear"
          />
        ) : (
          <>
            <Table removeWrapper aria-label="Tabla de usuarios">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROL</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderRoleChip(user.rol)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Acciones de usuario">
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" className="h-4 w-4" />}
                            >
                              Ver detalles
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Icon icon="lucide:pencil" className="h-4 w-4" />}
                            >
                              Editar
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash" className="h-4 w-4" />}
                              onPress={() => handleDeleteClick(user)}
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
                Mostrando {Math.min(filteredUsers.length, startIndex + 1)}-{Math.min(filteredUsers.length, endIndex)} de {filteredUsers.length} usuarios
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
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};