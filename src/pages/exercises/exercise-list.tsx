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
import { exerciseApi } from '../../services/api';
import { Exercise, ExerciseFilter } from '../../types';
import { addToast } from '@heroui/react';
import { ErrorAlert } from '../../components/ui/error-alert';

export const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<ExerciseFilter>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [exerciseToDelete, setExerciseToDelete] = React.useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  
  const rowsPerPage = 10;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  const filteredExercises = React.useMemo(() => {
    return exercises.filter(exercise => {
      const matchesMuscleGroup = !filter.grupoMuscular || exercise.grupoMuscular === filter.grupoMuscular;
      const matchesSearch = !searchQuery || 
        exercise.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesMuscleGroup && matchesSearch;
    });
  }, [exercises, filter, searchQuery]);
  
  const paginatedExercises = filteredExercises.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredExercises.length / rowsPerPage);
  
  React.useEffect(() => {
    fetchExercises();
    fetchMuscleGroups();
  }, []);
  
  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseApi.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMuscleGroups = async () => {
    try {
      // This is a mock implementation since the API endpoint might not exist
      // In a real application, you would call the API endpoint to get the muscle groups
      const uniqueMuscleGroups = new Set<string>();
      exercises.forEach(exercise => {
        if (exercise.grupoMuscular) {
          uniqueMuscleGroups.add(exercise.grupoMuscular);
        }
      });
      setMuscleGroups(Array.from(uniqueMuscleGroups));
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
    }
  };
  
  React.useEffect(() => {
    const uniqueMuscleGroups = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise.grupoMuscular) {
        uniqueMuscleGroups.add(exercise.grupoMuscular);
      }
    });
    setMuscleGroups(Array.from(uniqueMuscleGroups));
  }, [exercises]);
  
  const handleFilterChange = (key: keyof ExerciseFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };
  
  const handleDeleteClick = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!exerciseToDelete?.id) return;
    
    try {
      setIsDeleting(true);
      await exerciseApi.delete(exerciseToDelete.id);
      setExercises(exercises.filter(exercise => exercise.id !== exerciseToDelete.id));
      addToast({
        title: 'Ejercicio eliminado',
        description: `El ejercicio ${exerciseToDelete.nombre} ha sido eliminado correctamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo eliminar el ejercicio',
        severity: 'danger'
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setExerciseToDelete(null);
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Ejercicios" 
        description="Gestiona los ejercicios disponibles" 
        actionLabel="Crear Ejercicio"
        actionPath="/ejercicios/crear"
      />
      
      {error && (
        <ErrorAlert 
          error={error} 
          onRetry={fetchExercises} 
          onDismiss={() => setError(null)} 
        />
      )}
      
      <div className="bg-content1 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por nombre o descripción..."
            startContent={<Icon icon="lucide:search" className="h-4 w-4 text-default-400" />}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="sm:max-w-xs"
          />
          
          <Select
            placeholder="Filtrar por grupo muscular"
            selectedKeys={filter.grupoMuscular ? [filter.grupoMuscular] : []}
            onSelectionChange={(keys) => {
              const selectedKeys = Array.from(keys);
              handleFilterChange('grupoMuscular', selectedKeys[0] || undefined);
            }}
            className="sm:max-w-xs"
          >
            {muscleGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
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
        ) : filteredExercises.length === 0 ? (
          <EmptyState
            title="No hay ejercicios"
            description="No se encontraron ejercicios con los filtros aplicados."
            icon="lucide:dumbbell"
            actionLabel="Crear Ejercicio"
            actionPath="/ejercicios/crear"
          />
        ) : (
          <>
            <Table removeWrapper aria-label="Tabla de ejercicios">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>GRUPO MUSCULAR</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn>VIDEO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>{exercise.nombre}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {exercise.grupoMuscular}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {exercise.descripcion}
                      </div>
                    </TableCell>
                    <TableCell>
                      {exercise.videoUrl ? (
                        <Button
                          as="a"
                          href={exercise.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          variant="flat"
                          color="secondary"
                          startContent={<Icon icon="lucide:video" className="h-4 w-4" />}
                        >
                          Ver Video
                        </Button>
                      ) : (
                        <span className="text-default-400 text-sm">No disponible</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          as={Link}
                          to={`/ejercicios/${exercise.id}/editar`}
                          size="sm"
                          variant="flat"
                          color="primary"
                          isIconOnly
                        >
                          <Icon icon="lucide:pencil" className="h-4 w-4" />
                        </Button>
                        
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Acciones de ejercicio">
                            <DropdownItem
                              key="edit"
                              as={Link}
                              to={`/ejercicios/${exercise.id}/editar`}
                              startContent={<Icon icon="lucide:pencil" className="h-4 w-4" />}
                            >
                              Editar
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash" className="h-4 w-4" />}
                              onPress={() => handleDeleteClick(exercise)}
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
                Mostrando {Math.min(filteredExercises.length, startIndex + 1)}-{Math.min(filteredExercises.length, endIndex)} de {filteredExercises.length} ejercicios
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
        title="Eliminar Ejercicio"
        message={`¿Estás seguro de que deseas eliminar el ejercicio ${exerciseToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};