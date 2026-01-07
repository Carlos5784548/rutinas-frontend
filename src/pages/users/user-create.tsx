import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { userApi, clientApi } from '../../services/api';
import { User, ClienteRequestDTO } from '../../types';
import { addToast } from '@heroui/react';

// Define form data interface locally as UserFormData assumes old structure
interface UserCreateForm {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'CLIENTE' | 'ENTRENADOR';
  // Client specific fields
  telefono?: string;
  edad?: number;
  objetivo?: string;
}

export const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<UserCreateForm>({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'CLIENTE',
      telefono: '',
      edad: 18,
      objetivo: ''
    }
  });

  const selectedRole = watch('rol');
  const showClientFields = selectedRole === 'CLIENTE';

  const onSubmit = async (data: UserCreateForm) => {
    try {
      setIsSubmitting(true);

      if (data.rol === 'CLIENTE') {
        const clientData: ClienteRequestDTO = {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          telefono: data.telefono || '',
          edad: data.edad || 18,
          objetivo: data.objetivo
        };
        await clientApi.create(clientData);
      } else {
        const userData: User = {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          rol: data.rol
        };
        await userApi.create(userData);
      }

      addToast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado correctamente',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/usuarios');
      }, 300);
    } catch (error) {
      console.error('Error creating user:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo crear el usuario',
        severity: 'danger'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Crear Usuario"
        description="Añade un nuevo usuario al sistema"
        backLink="/usuarios"
      />

      <Card className="max-w-xl mx-auto">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-medium">Información de Usuario</h3>

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

            <Controller
              name="rol"
              control={control}
              rules={{ required: 'El rol es obligatorio' }}
              render={({ field }) => (
                <Select
                  label="Rol"
                  placeholder="Seleccione un rol"
                  selectedKeys={[field.value]}
                  onChange={(e) => field.onChange(e.target.value)}
                  isRequired
                  isInvalid={!!errors.rol}
                  errorMessage={errors.rol?.message}
                >
                  <SelectItem key="ADMIN">Administrador</SelectItem>
                  <SelectItem key="CLIENTE">Cliente</SelectItem>
                  <SelectItem key="ENTRENADOR">Entrenador</SelectItem>
                </Select>
              )}
            />

            {showClientFields && (
              <>
                <Divider className="my-4" />
                <h3 className="text-lg font-medium">Información Adicional del Cliente</h3>

                <Controller
                  name="telefono"
                  control={control}
                  rules={{
                    required: 'El teléfono es obligatorio para clientes',
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
                      required: 'La edad es obligatoria para clientes',
                      min: { value: 1, message: 'La edad debe ser mayor a 0' },
                      max: { value: 120, message: 'La edad debe ser menor a 120' }
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        label="Edad"
                        placeholder="Ingrese la edad"
                        isRequired
                        isInvalid={!!errors.edad}
                        errorMessage={errors.edad?.message}
                        value={field.value?.toString() || ''}
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
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="flat"
                onPress={() => navigate('/usuarios')}
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