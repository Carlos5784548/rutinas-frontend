import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { clientApi, trainerApi, isTrainer, getEntrenadorId } from '../../services/api';
import { ClienteRequestDTO } from '../../types';
import { addToast } from '@heroui/react';

export const ClientCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isTrainerUser = isTrainer();
  const entrenadorId = getEntrenadorId();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ClienteRequestDTO>({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      objetivo: '',
      telefono: '',
      edad: 18,
      password: ''
    }
  });

  const onSubmit = async (data: ClienteRequestDTO) => {
    try {
      setIsSubmitting(true);

      const payload: ClienteRequestDTO = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        edad: data.edad,
        objetivo: data.objetivo,
        password: data.password
      };

      // Backend only has /api/entrenadores/{entrenadorId}/clientes endpoints
      // So we always need an entrenadorId
      if (!entrenadorId) {
        addToast({
          title: 'Error',
          description: 'No se puede crear el cliente. ID de entrenador no disponible.',
          severity: 'danger'
        });
        setIsSubmitting(false);
        return;
      }

      console.log(`Creando cliente para entrenador con ID: ${entrenadorId}`);
      await trainerApi.createClient(entrenadorId, payload);

      addToast({
        title: 'Cliente creado',
        description: 'El cliente ha sido creado correctamente',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/clientes');
      }, 300);
    } catch (error: any) {
      console.error('Error creating client:', error);
      // Extrae el mensaje de error del backend si existe (desde nuestro interceptor de api.ts)
      addToast({
        title: error.title || 'Error',
        description: error.message || 'No se pudo crear el cliente',
        severity: 'danger'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Crear Cliente"
        description={isTrainerUser ? "Añade un nuevo cliente a tu lista" : "Añade un nuevo cliente al sistema"}
        backLink="/clientes"
      />

      <Card className="max-w-xl mx-auto">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-medium">Información del Cliente</h3>

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
                  min: {
                    value: 12,
                    message: 'La edad mínima es 12 años'
                  },
                  max: {
                    value: 100,
                    message: 'La edad máxima es 100 años'
                  }
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

            <Divider className="my-4" />

            <h3 className="text-lg font-medium">Información de Acceso</h3>
            <p className="text-sm text-default-500 mb-4">Credenciales para acceder al sistema</p>

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  label="Contraseña"
                  placeholder="Ingrese una contraseña"
                  isRequired
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                />
              )}
            />

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
                Guardar
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};