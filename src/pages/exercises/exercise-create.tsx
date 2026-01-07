import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Textarea
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { exerciseApi } from '../../services/api';
import { EjercicioRequestDTO } from '../../types';
import { addToast } from '@heroui/react';

export const ExerciseCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<EjercicioRequestDTO>({
    defaultValues: {
      nombre: '',
      grupoMuscular: '',
      descripcion: '',
      videoUrl: ''
    }
  });

  const onSubmit = async (data: EjercicioRequestDTO) => {
    try {
      setIsSubmitting(true);

      // Create a copy of the data to avoid modifying the form data directly
      const exerciseData = {
        nombre: data.nombre,
        grupoMuscular: data.grupoMuscular,
        descripcion: data.descripcion,
        videoUrl: data.videoUrl
      };

      await exerciseApi.create(exerciseData);

      // Show success toast before navigation
      addToast({
        title: 'Ejercicio creado',
        description: 'El ejercicio ha sido creado correctamente',
        severity: 'success'
      });

      // Use setTimeout with a longer delay to ensure the toast is displayed before navigation
      // and to prevent React DOM manipulation errors
      setTimeout(() => {
        navigate('/ejercicios');
      }, 300);
    } catch (error) {
      console.error('Error creating exercise:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo crear el ejercicio',
        severity: 'danger'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Crear Ejercicio"
        description="Añade un nuevo ejercicio al sistema"
        backLink="/ejercicios"
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
                  placeholder="Ingrese el nombre del ejercicio"
                  isRequired
                  isInvalid={!!errors.nombre}
                  errorMessage={errors.nombre?.message}
                />
              )}
            />

            <Controller
              name="grupoMuscular"
              control={control}
              rules={{
                required: 'El grupo muscular es obligatorio',
                minLength: {
                  value: 3,
                  message: 'El grupo muscular debe tener al menos 3 caracteres'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Grupo Muscular"
                  placeholder="Ej: Pecho, Espalda, Piernas, etc."
                  isRequired
                  isInvalid={!!errors.grupoMuscular}
                  errorMessage={errors.grupoMuscular?.message}
                />
              )}
            />

            <Controller
              name="descripcion"
              control={control}
              rules={{
                required: 'La descripción es obligatoria',
                minLength: {
                  value: 10,
                  message: 'La descripción debe tener al menos 10 caracteres'
                }
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Descripción"
                  placeholder="Ingrese una descripción detallada del ejercicio"
                  isRequired
                  isInvalid={!!errors.descripcion}
                  errorMessage={errors.descripcion?.message}
                  minRows={4}
                />
              )}
            />

            <Controller
              name="videoUrl"
              control={control}
              rules={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                  message: 'Ingrese una URL válida de YouTube'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="URL del Video (opcional)"
                  placeholder="https://www.youtube.com/watch?v=..."
                  isInvalid={!!errors.videoUrl}
                  errorMessage={errors.videoUrl?.message}
                />
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="flat"
                onPress={() => navigate('/ejercicios')}
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