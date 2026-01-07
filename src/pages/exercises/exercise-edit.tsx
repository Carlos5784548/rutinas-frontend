import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Textarea,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { exerciseApi } from '../../services/api';
import { Exercise, EjercicioRequestDTO } from '../../types';
import { addToast } from '@heroui/react';

export const ExerciseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = React.useState<Exercise | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EjercicioRequestDTO>({
    defaultValues: {
      nombre: '',
      grupoMuscular: '',
      descripcion: '',
      videoUrl: ''
    }
  });

  React.useEffect(() => {
    if (id) {
      fetchExercise(parseInt(id));
    }
  }, [id]);

  const fetchExercise = async (exerciseId: number) => {
    try {
      setLoading(true);
      const data = await exerciseApi.getById(exerciseId);
      setExercise(data);
      reset({
        nombre: data.nombre,
        grupoMuscular: data.grupoMuscular,
        descripcion: data.descripcion,
        videoUrl: data.videoUrl || ''
      });
    } catch (error) {
      console.error('Error fetching exercise:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo cargar la información del ejercicio',
        severity: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EjercicioRequestDTO) => {
    if (!id || !exercise) return;

    try {
      setIsSubmitting(true);
      await exerciseApi.update(parseInt(id), {
        nombre: data.nombre,
        grupoMuscular: data.grupoMuscular,
        descripcion: data.descripcion,
        videoUrl: data.videoUrl
      });

      addToast({
        title: 'Ejercicio actualizado',
        description: 'El ejercicio ha sido actualizado correctamente',
        severity: 'success'
      });
      navigate('/ejercicios');
    } catch (error) {
      console.error('Error updating exercise:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo actualizar el ejercicio',
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

  if (!exercise) {
    return (
      <EmptyState
        title="Ejercicio no encontrado"
        description="El ejercicio que estás buscando no existe o ha sido eliminado."
        icon="lucide:dumbbell"
        actionLabel="Volver a Ejercicios"
        actionPath="/ejercicios"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar Ejercicio: ${exercise.nombre}`}
        description="Modifica la información del ejercicio"
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
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};