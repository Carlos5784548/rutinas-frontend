// src/pages/clients/ClientEdit.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { Client, ClienteRequestDTO } from '../../types';
import { addToast } from '@heroui/react';

export const ClientEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ClienteRequestDTO>({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      edad: 18,
      objetivo: '',
      password: ''
    }
  });

  React.useEffect(() => {
    if (id) {
      fetchClient(parseInt(id));
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
      reset({
        nombre: data.nombre,
        apellido: data.apellido || '',
        email: data.email,
        telefono: data.telefono,
        edad: data.edad,
        objetivo: data.objetivo || '',
        password: '' // No se muestra la contraseña actual
      });
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

  const onSubmit = async (data: ClienteRequestDTO) => {
    if (!id || !client) return;

    try {
      setIsSubmitting(true);

      // Update uses the entity structure properly constructed from the form data
      // For api call we use DTO or explicit fields
      const updateData: ClienteRequestDTO = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        edad: data.edad,
        objetivo: data.objetivo
        // password not included in update usually unless changed
      };

      if (isTrainerUser && entrenadorId) {
        await trainerApi.updateClient(entrenadorId, parseInt(id), updateData);
      } else {
        // Create a Client object for compatibility with old update signature if needed, 
        // but clientApi.update in api.ts takes Client which extends Persona.
        // However, api.ts implementation of update constructs payload from the Client object.
        // Let's create a partial Client object
        const clientToUpdate: Client = {
          ...client,
          ...updateData
        }
        await clientApi.update(parseInt(id), clientToUpdate);
      }

      addToast({
        title: 'Cliente actualizado',
        description: 'El cliente ha sido actualizado correctamente',
        severity: 'success'
      });
      navigate('/clientes');
    } catch (error) {
      console.error('Error updating client:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo actualizar el cliente',
        severity: 'danger'
      });
    } finally {
      setIsSubmitting(false);
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
        icon="lucide:user"
        actionLabel="Volver a Clientes"
        actionPath="/clientes"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar Cliente: ${client.nombre} ${client.apellido || ''}`}
        description="Modifica la información del cliente"
        backLink="/clientes"
      />

      <Card className="max-w-xl mx-auto">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Ingrese el nombre"
                    isRequired
                    isInvalid={!!errors.nombre}
                    errorMessage={errors.nombre?.message}
                  />
                )}
              />

              <Controller
                name="apellido"
                control={control}
                rules={{
                  required: 'El apellido es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'El apellido debe tener al menos 3 caracteres'
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Apellido"
                    placeholder="Ingrese el apellido"
                    isRequired
                    isInvalid={!!errors.apellido}
                    errorMessage={errors.apellido?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Ingrese un email válido'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  label="Email"
                  placeholder="ejemplo@correo.com"
                  isRequired
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              name="telefono"
              control={control}
              rules={{
                required: 'El teléfono es obligatorio',
                pattern: {
                  value: /^[0-9]{9,15}$/,
                  message: 'Ingrese un número de teléfono válido'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Teléfono"
                  placeholder="Ingrese el número de teléfono"
                  isRequired
                  isInvalid={!!errors.telefono}
                  errorMessage={errors.telefono?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="edad"
                control={control}
                rules={{
                  required: 'La edad es obligatoria',
                  min: { value: 12, message: 'La edad mínima es 12 años' },
                  max: { value: 100, message: 'La edad máxima es 100 años' }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Edad"
                    placeholder="Ingrese la edad"
                    isRequired
                    isInvalid={!!errors.edad}
                    errorMessage={errors.edad?.message}
                    value={field.value.toString()}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />

              <Controller
                name="objetivo"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Objetivo"
                    placeholder="Ej. Ganar masa muscular"
                    value={field.value || ''}
                  />
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="flat"
                onPress={() => navigate('/clientes')}
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
