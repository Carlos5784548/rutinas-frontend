// src/pages/routines/RoutineEdit.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { routineApi, clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { Routine, RutinaRequestDTO, Client } from '../../types';
import { addToast } from '@heroui/react';

export const RoutineEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [routine, setRoutine] = React.useState<Routine | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingClients, setLoadingClients] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<RutinaRequestDTO>({
    defaultValues: {
      nombre: '',
      enfoque: 'Tonificar',
      fechaInicio: '',
      fechaFin: '',
      clienteId: undefined,
      estado: 'ACTIVA',
      monto: 0,
      descripcionDias: ''
    }
  });

  const [numDays, setNumDays] = React.useState<number>(0);
  const [dayNames, setDayNames] = React.useState<string[]>([]);

  // Function to parse the days string
  const parseDaysString = (desc: string) => {
    if (!desc) return [];
    const parts = desc.split(';');
    const names: string[] = [];
    parts.forEach(part => {
      const [day, name] = part.split(':');
      if (day && name) {
        const dayIdx = parseInt(day) - 1;
        names[dayIdx] = name;
      }
    });
    // Ensure the array has the correct length and no holes
    const maxDay = parts.length > 0 ? Math.max(...parts.map(p => parseInt(p.split(':')[0]) || 0)) : 0;
    const finalNames = Array(maxDay).fill('');
    parts.forEach(part => {
      const [day, name] = part.split(':');
      if (day && name) {
        finalNames[parseInt(day) - 1] = name;
      }
    });
    return finalNames;
  };

  React.useEffect(() => {
    if (numDays > 0) {
      setDayNames(prev => {
        const newNames = [...prev];
        if (numDays > prev.length) {
          for (let i = prev.length; i < numDays; i++) {
            newNames.push('');
          }
        } else {
          return newNames.slice(0, numDays);
        }
        return newNames;
      });
    } else {
      setDayNames([]);
    }
  }, [numDays]);

  const handleDayNameChange = (index: number, value: string) => {
    const newNames = [...dayNames];
    newNames[index] = value;
    setDayNames(newNames);

    const desc = newNames
      .map((name, i) => `${i + 1}:${name}`)
      .filter(part => part.split(':')[1].trim() !== '')
      .join(';');
    setValue('descripcionDias', desc);
  };

  React.useEffect(() => {
    if (id) {
      fetchRoutine(parseInt(id));
      fetchClients();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      let data: Client[] = [];
      if (isTrainerUser && entrenadorId) {
        data = await trainerApi.getMyClients(entrenadorId);
      } else {
        data = await clientApi.getAll(entrenadorId || undefined);
      }
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        severity: 'danger'
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchRoutine = async (routineId: number) => {
    try {
      setLoading(true);
      const data = await routineApi.getById(routineId);
      setRoutine(data);
      reset({
        nombre: data.nombre,
        enfoque: data.enfoque,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : '',
        fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString().split('T')[0] : '',
        clienteId: (data as any).clienteId || (data.cliente?.id),
        estado: data.estado || 'ACTIVA',
        monto: data.monto || 0,
        descripcionDias: data.descripcionDias || '',
        ejercicios: data.ejercicios || []
      });

      if (data.descripcionDias) {
        const names = parseDaysString(data.descripcionDias);
        setDayNames(names);
        setNumDays(names.length);
      }
    } catch (error) {
      console.error('Error fetching routine:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo cargar la información de la rutina',
        severity: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RutinaRequestDTO) => {
    if (!id || !routine) return;

    try {
      setIsSubmitting(true);

      // Clean up the exercises data to match RutinaEjercicioRequestDTO if needed
      const requestData: RutinaRequestDTO = {
        ...data,
        ejercicios: data.ejercicios?.map(ex => ({
          series: ex.series,
          repeticiones: ex.repeticiones,
          descansoSegundos: ex.descansoSegundos,
          dia: ex.dia,
          ejercicioId: (ex as any).ejercicioId || (ex as any).ejercicio?.id,
          esBiSerie: ex.esBiSerie,
          biSerieGrupo: ex.biSerieGrupo
        }))
      };

      console.log('Datos a enviar al backend (limpios):', requestData);
      console.log('ID de la rutina:', id);

      const response = await routineApi.update(parseInt(id), requestData);
      console.log('Respuesta del backend:', response);

      addToast({
        title: 'Rutina actualizada',
        description: 'La rutina ha sido actualizada correctamente',
        severity: 'success'
      });
      navigate('/rutinas');
    } catch (error: any) {
      console.error('Error updating routine:', error);

      const errorMsg = error.response?.data?.message || error.message || 'No se pudo actualizar la rutina';
      const errorDetails = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';

      addToast({
        title: 'Error',
        description: `${errorMsg} ${errorDetails}`,
        severity: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingClients) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!routine) {
    return (
      <EmptyState
        title="Rutina no encontrada"
        description="La rutina que estás buscando no existe o ha sido eliminada."
        icon="lucide:clipboard-list"
        actionLabel="Volver a Rutinas"
        actionPath="/rutinas"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar Rutina: ${routine.nombre}`}
        description="Modifica la información de la rutina"
        backLink="/rutinas"
      />

      <Card className="max-w-xl mx-auto">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="nombre"
              control={control}
              rules={{
                required: 'El nombre es obligatorio',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nombre"
                  placeholder="Ingrese el nombre de la rutina"
                  isRequired
                  isInvalid={!!errors.nombre}
                  errorMessage={errors.nombre?.message}
                />
              )}
            />

            <Controller
              name="enfoque"
              control={control}
              rules={{ required: 'El enfoque es obligatorio' }}
              render={({ field }) => (
                <Select
                  label="Enfoque"
                  placeholder="Seleccione un enfoque"
                  selectedKeys={[field.value]}
                  onChange={(e) => field.onChange(e.target.value)}
                  isRequired
                  isInvalid={!!errors.enfoque}
                  errorMessage={errors.enfoque?.message}
                >
                  <SelectItem key="Tonificar">Tonificar</SelectItem>
                  <SelectItem key="Volumen">Volumen</SelectItem>
                  <SelectItem key="Resistencia">Resistencia</SelectItem>
                </Select>
              )}
            />

            <Controller
              name="fechaInicio"
              control={control}
              rules={{ required: 'La fecha de inicio es obligatoria' }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Fecha de Inicio"
                  isRequired
                  isInvalid={!!errors.fechaInicio}
                  errorMessage={errors.fechaInicio?.message}
                />
              )}
            />

            <Controller
              name="fechaFin"
              control={control}
              rules={{
                required: 'La fecha de fin es obligatoria',
                validate: (value, formValues) => {
                  if (new Date(value) <= new Date(formValues.fechaInicio)) {
                    return 'La fecha de fin debe ser posterior a la fecha de inicio';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Fecha de Fin"
                  isRequired
                  isInvalid={!!errors.fechaFin}
                  errorMessage={errors.fechaFin?.message}
                />
              )}
            />

            <Controller
              name="monto"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Monto"
                  placeholder="Ingrese el monto"
                  value={field.value?.toString()}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />

            <div className="space-y-4 p-4 bg-content2/50 rounded-2xl border border-divider">
              <div className="flex items-center justify-between">
                <p className="font-bold text-small uppercase tracking-wider text-foreground-500">Configuración de Días</p>
                <Select
                  label="Cantidad de días"
                  placeholder="Seleccione"
                  className="max-w-[150px]"
                  selectedKeys={numDays ? [String(numDays)] : []}
                  onChange={(e) => setNumDays(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <SelectItem key={String(n)}>{String(n)} {n === 1 ? 'Día' : 'Días'}</SelectItem>
                  ))}
                </Select>
              </div>

              {numDays > 0 && (
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {dayNames.map((name, index) => (
                    <Input
                      key={index}
                      label={`Nombre del Día ${index + 1}`}
                      placeholder="Ej: Pecho y Tríceps"
                      value={name}
                      onValueChange={(val) => handleDayNameChange(index, val)}
                      variant="bordered"
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <Controller
              name="clienteId"
              control={control}
              rules={{ required: 'El cliente es obligatorio' }}
              render={({ field }) => (
                <Select
                  label="Cliente"
                  placeholder="Seleccione un cliente"
                  selectedKeys={field.value ? [field.value.toString()] : []}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  isRequired
                  isInvalid={!!errors.clienteId}
                  errorMessage={errors.clienteId?.message}
                >
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id?.toString()}
                      textValue={`${client.nombre} ${client.apellido || ''}`}
                    >
                      <span className="text-foreground">
                        {client.nombre} {client.apellido || ''}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="estado"
              control={control}
              rules={{ required: 'El estado es obligatorio' }}
              render={({ field }) => (
                <Select
                  label="Estado"
                  placeholder="Seleccione un estado"
                  selectedKeys={[field.value]}
                  onChange={(e) => field.onChange(e.target.value)}
                  isRequired
                  isInvalid={!!errors.estado}
                  errorMessage={errors.estado?.message}
                >
                  <SelectItem key="PENDIENTE_DE_PAGO">Pendiente de Pago</SelectItem>
                  <SelectItem key="ACTIVA">Activa</SelectItem>
                  <SelectItem key="FINALIZADA">Finalizada</SelectItem>
                  <SelectItem key="CANCELADA">Cancelada</SelectItem>
                </Select>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="flat"
                onPress={() => navigate('/rutinas')}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                startContent={!isSubmitting && <Icon icon="lucide:save" className="h-4 w-4" />}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
