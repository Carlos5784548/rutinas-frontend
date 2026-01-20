import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { routineApi, clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { RutinaRequestDTO, Client } from '../../types';
import { addToast } from '@heroui/react';

export const RoutineCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clientIdParam = queryParams.get('clienteId');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);
  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RutinaRequestDTO>({
    defaultValues: {
      nombre: '',
      enfoque: 'Tonificar',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clienteId: clientIdParam ? parseInt(clientIdParam) : undefined,
      estado: 'ACTIVA', // Valor por defecto para el estado, usando valor backend
      monto: 0,
      descripcionDias: ''
    }
  });

  const [numDays, setNumDays] = React.useState<number>(0);
  const [dayNames, setDayNames] = React.useState<string[]>([]);

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

    // Construct the descripcionDias string: "1:Pecho;2:Espalda"
    const desc = newNames
      .map((name, i) => `${i + 1}:${name}`)
      .filter(part => part.split(':')[1].trim() !== '')
      .join(';');
    setValue('descripcionDias', desc);
  };

  React.useEffect(() => {
    fetchClients();
  }, []);

  React.useEffect(() => {
    if (clientIdParam) {
      setValue('clienteId', parseInt(clientIdParam));
    }
  }, [clientIdParam, setValue]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      let data: Client[] = [];

      if (isTrainerUser && entrenadorId) {
        // Trainer: get only their clients
        data = await trainerApi.getMyClients(entrenadorId);
      } else {
        // Admin or others: get all clients
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

  const onSubmit = async (data: RutinaRequestDTO) => {
    try {
      setIsSubmitting(true);

      // Create a copy of the data to avoid modifying the form data directly
      await routineApi.create(data);

      // Show success toast before navigation
      addToast({
        title: 'Rutina creada',
        description: 'La rutina ha sido creada correctamente',
        severity: 'success'
      });

      // Use setTimeout with a longer delay to ensure the toast is displayed before navigation
      // and to prevent React DOM manipulation errors
      setTimeout(() => {
        navigate('/rutinas');
      }, 300);
    } catch (error) {
      console.error('Error creating routine:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo crear la rutina',
        severity: 'danger'
      });
      setIsSubmitting(false);
    }
  };

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = React.useMemo(() => (
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
            <SelectItem key="Fuerza">Fuerza</SelectItem>
            <SelectItem key="Hipertrofia">Hipertrofia</SelectItem>
            <SelectItem key="Pérdida de Peso">Pérdida de Peso</SelectItem>
            <SelectItem key="Funcional">Funcional</SelectItem>
            <SelectItem key="Definición">Definición</SelectItem>
            <SelectItem key="Mantenimiento">Mantenimiento</SelectItem>
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

      <div className="space-y-4 p-5 bg-default-50 rounded-2xl border border-default-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base text-foreground">Configuración de Días</p>
            <p className="text-small text-default-500">Define el nombre de cada día de entrenamiento</p>
          </div>
          <Select
            label="Días por semana"
            placeholder="Seleccione"
            className="max-w-[180px]"
            size="sm"
            selectedKeys={numDays ? [String(numDays)] : []}
            onChange={(e) => setNumDays(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <SelectItem key={String(n)}>{String(n)} {n === 1 ? 'Día' : 'Días'}</SelectItem>
            ))}
          </Select>
        </div>

        {numDays > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-default-100">
            {dayNames.map((name, index) => (
              <Input
                key={index}
                label={`Día ${index + 1}`}
                placeholder="Ej: Pecho y Bíceps"
                value={name}
                onValueChange={(val) => handleDayNameChange(index, val)}
                variant="flat"
                className="bg-content1"
                startContent={<Icon icon="lucide:dumbbell" className="text-default-400" />}
              />
            ))}
          </div>
        )}
      </div>

      <Controller
        name="clienteId"
        control={control}
        rules={{ required: 'El cliente es obligatorio' }}
        render={({ field }) => {
          const selectedClient = (clients || []).find(c => c.id === field.value);
          return (
            <Select
              label="Cliente"
              placeholder="Seleccione un cliente"
              selectedKeys={field.value !== undefined ? new Set([String(field.value)]) : new Set()}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                if (selectedKey) {
                  field.onChange(Number(selectedKey));
                }
              }}
              renderValue={() => {
                if (selectedClient) {
                  return <span>{selectedClient.nombre} {selectedClient.apellido || ''}</span>;
                }
                return null;
              }}
              isRequired
              isInvalid={!!errors.clienteId}
              errorMessage={errors.clienteId?.message}
            >
              {(clients || [])
                .filter(client => client?.id !== undefined)
                .map((client) => (
                  <SelectItem key={String(client.id)}>
                    {client.nombre} {client.apellido || ''}
                  </SelectItem>
                ))
              }
            </Select>
          );
        }}
      />

      <Controller
        name="estado"
        control={control}
        rules={{ required: 'El estado es obligatorio' }}
        render={({ field }) => (
          <Select
            label="Estado"
            placeholder="Seleccione un estado"
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value)}
            isRequired
            isInvalid={!!errors.estado}
            errorMessage={errors.estado?.message}
            className="mb-4"
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
          Guardar
        </Button>
      </div>
    </form>
  ), [control, errors, handleSubmit, isSubmitting, navigate, onSubmit, clients]);

  // Memoize the loading spinner to prevent unnecessary re-renders
  const loadingSpinner = React.useMemo(() => (
    <div className="flex justify-center items-center h-40">
      <Spinner size="lg" color="primary" />
    </div>
  ), []);

  return (
    <div>
      <PageHeader
        title="Crear Rutina"
        description="Añade una nueva rutina de entrenamiento"
        backLink="/rutinas"
      />

      <Card className="max-w-xl mx-auto">
        <CardBody className="p-6">
          {/* Use a stable rendering pattern with key prop */}
          {loadingClients ? loadingSpinner : formContent}
        </CardBody>
      </Card>
    </div>
  );
};