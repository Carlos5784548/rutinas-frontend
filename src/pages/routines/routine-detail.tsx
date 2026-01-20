import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Accordion,
  AccordionItem,
  Switch,
  Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { EmptyState } from '../../components/ui/empty-state';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { Routine, Exercise, RoutineExercise, RutinaEjercicioRequestDTO, ProgresoEjercicioRequestDTO } from '../../types';
import { routineApi, exerciseApi } from '../../services/api';
import { addToast } from '@heroui/react';

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getEnfoqueColor = (enfoque: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
  switch (enfoque) {
    case 'Tonificar':
      return 'success';
    case 'Volumen':
      return 'primary';
    case 'Resistencia':
      return 'warning';
    default:
      return 'default';
  }
};

const getExerciseName = (ejercicioNombre?: string) => {
  return ejercicioNombre && ejercicioNombre.trim() !== ''
    ? ejercicioNombre
    : 'Nombre no disponible';
};

const getDayName = (day: number, descripcionDias?: string): string => {
  if (descripcionDias) {
    const parts = descripcionDias.split(';');
    const dayPart = (parts || []).find(p => p.startsWith(`${day}:`));
    if (dayPart) {
      const customName = dayPart.split(':')[1];
      return `Día ${day} - ${customName}`;
    }
  }
  const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days[day] ? `Día ${day} - ${days[day]}` : `Día ${day}`;
};

export const RoutineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [routine, setRoutine] = React.useState<Routine | null>(null);
  const [routineExercises, setRoutineExercises] = React.useState<RoutineExercise[]>([]);
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [exercisesLoading, setExercisesLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [exerciseToDelete, setExerciseToDelete] = React.useState<RoutineExercise | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isOrdering, setIsOrdering] = React.useState(false);

  const [editingExercise, setEditingExercise] = React.useState<RoutineExercise | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<RutinaEjercicioRequestDTO>({
    defaultValues: {
      ejercicioId: 0,
      series: 3,
      repeticiones: 12,
      descansoSegundos: 60,
      dia: 1,
      esBiSerie: false,
      biSerieGrupo: 1
    }
  });

  const esBiSerie = watch('esBiSerie');



  React.useEffect(() => {
    if (id) {
      const routineId = parseInt(id);
      fetchRoutine(routineId);
      fetchExercises();
    }
  }, [id]);

  React.useEffect(() => {
    if (id && routine?.clienteId) {
      fetchRoutineExercises(parseInt(id));
    }
  }, [id, routine?.clienteId]);

  const fetchRoutine = React.useCallback(async (routineId: number) => {
    try {
      setLoading(true);
      const data = await routineApi.getById(routineId);
      setRoutine(data);
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
  }, []);

  const fetchRoutineExercises = React.useCallback(async (routineId: number) => {
    try {
      const data = await routineApi.getExercises(routineId);
      // Map RutinaEjercicioResponseDTO to RoutineExercise if fields differ
      setRoutineExercises(data.map(item => ({
        id: item.id,
        rutinaId: item.rutinaId,
        ejercicioId: item.ejercicioId,
        ejercicioNombre: item.ejercicioNombre,
        series: item.series,
        repeticiones: item.repeticiones,
        descansoSegundos: item.descansoSegundos,
        dia: item.dia,
        esBiSerie: item.esBiSerie,
        biSerieGrupo: item.biSerieGrupo
      })));
    } catch (error) {
      console.error('Error fetching routine exercises:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron cargar los ejercicios de la rutina',
        severity: 'danger'
      });
    }
  }, []);

  const fetchExercises = React.useCallback(async () => {
    try {
      setExercisesLoading(true);
      const data = await exerciseApi.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setExercisesLoading(false);
    }
  }, []);

  const handleEditExercise = React.useCallback((re: RoutineExercise) => {
    setEditingExercise(re);
    reset({
      ejercicioId: re.ejercicioId,
      series: re.series,
      repeticiones: re.repeticiones,
      descansoSegundos: re.descansoSegundos,
      dia: re.dia,
      esBiSerie: !!re.esBiSerie,
      biSerieGrupo: re.biSerieGrupo || 1
    });
    onOpen();
  }, [onOpen, reset]);

  const clearEditing = React.useCallback(() => {
    setEditingExercise(null);
    reset({
      ejercicioId: 0,
      series: 3,
      repeticiones: 12,
      descansoSegundos: 60,
      dia: 1,
      esBiSerie: false,
      biSerieGrupo: 1
    });
  }, [reset]);

  const handleAddExerciseToDay = React.useCallback((day: number) => {
    reset({
      ejercicioId: 0,
      series: 3,
      repeticiones: 12,
      descansoSegundos: 60,
      dia: day,
      esBiSerie: false,
      biSerieGrupo: 1
    });
    onOpen();
  }, [onOpen, reset]);

  const onSubmit = React.useCallback(async (data: RutinaEjercicioRequestDTO) => {
    if (!id) return;
    const routineId = parseInt(id, 10);
    try {
      setIsSubmitting(true);

      // Ensure values are properly typed and defaults are handled
      const esBiSerie = !!data.esBiSerie;
      const biSerieGrupo = esBiSerie ? (Number(data.biSerieGrupo) || 1) : null;

      const payload: RutinaEjercicioRequestDTO = {
        ...data,
        esBiSerie,
        biSerieGrupo,
        // Ensure other numbers are actually numbers
        series: Number(data.series),
        repeticiones: Number(data.repeticiones),
        descansoSegundos: Number(data.descansoSegundos),
        dia: Number(data.dia),
        ejercicioId: Number(data.ejercicioId),
        orden: editingExercise ? editingExercise.orden : (routineExercises || []).filter(ex => ex.dia === Number(data.dia)).length
      };

      if (editingExercise) {
        await routineApi.removeExercise(routineId, editingExercise.id!);
      }
      await routineApi.addExercise(routineId, payload);
      await fetchRoutineExercises(routineId);
      addToast({
        title: editingExercise ? 'Ejercicio actualizado' : 'Ejercicio añadido',
        description: editingExercise ? 'Se actualizó el ejercicio de la rutina.' : 'Se añadió el ejercicio a la rutina.',
        severity: 'success'
      });
      clearEditing();
      onClose();
    } catch (err) {
      console.error('Error saving routine exercise:', err);
      addToast({
        title: 'Error',
        description: 'No se pudo guardar el ejercicio de la rutina.',
        severity: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [id, editingExercise, fetchRoutineExercises, onClose, reset, clearEditing]);

  const handleMoveExercise = React.useCallback(async (direction: 'up' | 'down', currentEx: RoutineExercise, dayExercises: RoutineExercise[]) => {
    if (!id) return;
    const routineId = parseInt(id);
    const currentIndex = (dayExercises || []).findIndex(ex => ex.id === currentEx.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= dayExercises.length) return;

    const targetEx = dayExercises[targetIndex];

    try {
      setIsOrdering(true);

      // Assign or swap order
      // If we don't have a bulk update, we have to do it sequentially
      // For now, let's assume we can at least send the 'orden' in the addExercise
      // and since the detail page "edits" by remove + add, we could do something similar
      // but it's better to just swap and notify the user about the backend needs.

      const updatedCurrent = { ...currentEx, orden: targetIndex };
      const updatedTarget = { ...targetEx, orden: currentIndex };

      // Since we don't have a proper update endpoint for routine-exercise,
      // and the current 'edit' logic is remove+add, we'll follow that pattern
      // but only if really necessary. For now, let's just swap locally and
      // ask the user to implement the backend part for persistence.

      // SIMULATION of persistence if backend supported update:
      // await routineApi.updateRoutineExercise(routineId, updatedCurrent);
      // await routineApi.updateRoutineExercise(routineId, updatedTarget);

      // Let's use the current remove/add pattern (not ideal but consistent)
      await routineApi.removeExercise(routineId, currentEx.id!);
      await routineApi.removeExercise(routineId, targetEx.id!);

      await routineApi.addExercise(routineId, {
        ejercicioId: updatedCurrent.ejercicioId!,
        series: updatedCurrent.series,
        repeticiones: updatedCurrent.repeticiones,
        descansoSegundos: updatedCurrent.descansoSegundos,
        dia: updatedCurrent.dia,
        esBiSerie: updatedCurrent.esBiSerie,
        biSerieGrupo: updatedCurrent.biSerieGrupo,
        orden: updatedCurrent.orden
      } as any);

      await routineApi.addExercise(routineId, {
        ejercicioId: updatedTarget.ejercicioId!,
        series: updatedTarget.series,
        repeticiones: updatedTarget.repeticiones,
        descansoSegundos: updatedTarget.descansoSegundos,
        dia: updatedTarget.dia,
        esBiSerie: updatedTarget.esBiSerie,
        biSerieGrupo: updatedTarget.biSerieGrupo,
        orden: updatedTarget.orden
      } as any);

      await fetchRoutineExercises(routineId);

      addToast({
        title: 'Orden actualizado',
        description: 'Se ha cambiado el orden del ejercicio.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error reordering exercises:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo actualizar el orden.',
        severity: 'danger'
      });
    } finally {
      setIsOrdering(false);
    }
  }, [id, fetchRoutineExercises]);




  const modalContent = React.useMemo(() => {
    return (
      <Modal isOpen={isOpen} onOpenChange={(open) => !open && (onClose(), clearEditing())}>
        <ModalContent key="exercise-modal-content">
          {(onCloseModal) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">
                {editingExercise ? 'Editar' : 'Añadir'} Ejercicio a la Rutina
              </ModalHeader>
              <ModalBody>
                {exercisesLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Controller
                      name="ejercicioId"
                      control={control}
                      rules={{
                        required: 'El ejercicio es obligatorio',
                        validate: value => value > 0 || 'Debe seleccionar un ejercicio'
                      }}
                      render={({ field }) => (
                        <Select
                          label="Ejercicio"
                          placeholder="Seleccione un ejercicio"
                          selectedKeys={field.value ? new Set([field.value.toString()]) : new Set()}
                          onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0];
                            if (val) field.onChange(parseInt(val as string));
                          }}
                          isRequired
                          isInvalid={!!errors.ejercicioId}
                          errorMessage={errors.ejercicioId?.message}
                        >
                          {(exercises || []).map((exercise) => (
                            <SelectItem
                              key={exercise.id?.toString()}
                              textValue={`${exercise.nombre} - ${exercise.grupoMuscular}`}
                            >
                              <span className="text-foreground">
                                {exercise.nombre} - {exercise.grupoMuscular}
                              </span>
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="dia"
                      control={control}
                      rules={{
                        required: 'El día es obligatorio',
                        min: { value: 1, message: 'El día debe ser entre 1 y 7' },
                        max: { value: 7, message: 'El día debe ser entre 1 y 7' }
                      }}
                      render={({ field }) => (
                        <Select
                          label="Día"
                          placeholder="Seleccione un día"
                          selectedKeys={new Set([field.value.toString()])}
                          onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0];
                            if (val) field.onChange(parseInt(val as string));
                          }}
                          isRequired
                          isInvalid={!!errors.dia}
                          errorMessage={errors.dia?.message}
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <SelectItem key={d.toString()}>
                              {getDayName(d, routine?.descripcionDias)}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="series"
                      control={control}
                      rules={{
                        required: 'El número de series es obligatorio',
                        min: { value: 1, message: 'Mínimo 1' },
                        max: { value: 20, message: 'Máximo 20' }
                      }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          label="Series"
                          placeholder="Ingrese el número de series"
                          isRequired
                          isInvalid={!!errors.series}
                          errorMessage={errors.series?.message}
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="repeticiones"
                      control={control}
                      rules={{
                        required: 'Obligatorio',
                        min: { value: 1, message: 'Mínimo 1' },
                        max: { value: 100, message: 'Máximo 100' }
                      }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          label="Repeticiones"
                          isRequired
                          isInvalid={!!errors.repeticiones}
                          errorMessage={errors.repeticiones?.message}
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="descansoSegundos"
                      control={control}
                      rules={{
                        required: 'Obligatorio',
                        min: { value: 10, message: 'Mínimo 10s' }
                      }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          label="Descanso (segundos)"
                          isRequired
                          isInvalid={!!errors.descansoSegundos}
                          errorMessage={errors.descansoSegundos?.message}
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                    <div className="pt-2">
                      <Controller
                        name="esBiSerie"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-default-50 border border-default-100">
                            <div className="flex flex-col">
                              <span className="text-small font-medium">Bi-serie</span>
                              <span className="text-tiny text-default-500">¿Forma parte de una bi-serie?</span>
                            </div>
                            <Switch
                              isSelected={!!field.value}
                              onValueChange={field.onChange}
                              size="sm"
                            />
                          </div>
                        )}
                      />
                    </div>

                    <Controller
                      name="biSerieGrupo"
                      control={control}
                      render={({ field }) => (
                        <div className={watch('esBiSerie') ? "block" : "hidden"}>
                          <Input
                            type="number"
                            label="Grupo de Bi-serie"
                            placeholder="Ej: 1"
                            description="Usa el mismo número para agrupar ejercicios"
                            value={field.value?.toString()}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            size="sm"
                          />
                        </div>
                      )}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onCloseModal} isDisabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  {editingExercise ? 'Actualizar' : 'Añadir'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    );
  }, [isOpen, exercises, exercisesLoading, errors, control, handleSubmit, isSubmitting, onSubmit, editingExercise, onClose, clearEditing, esBiSerie]);

  const handleDeleteClick = (exercise: RoutineExercise) => {
    setExerciseToDelete(exercise);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id || !exerciseToDelete?.id) return;

    try {
      setIsDeleting(true);
      await routineApi.removeExercise(parseInt(id), exerciseToDelete.id);
      setRoutineExercises((routineExercises || []).filter(ex => ex.id !== exerciseToDelete.id));
      addToast({
        title: 'Ejercicio eliminado',
        description: 'El ejercicio ha sido eliminado de la rutina correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing exercise from routine:', error);
      addToast({
        title: 'Error',
        description: 'No se pudo eliminar el ejercicio de la rutina',
        severity: 'danger'
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setExerciseToDelete(null);
    }
  };


  const groupedExercises = React.useMemo(() => {
    const groups: Record<number, RoutineExercise[]> = {};

    // Initialize groups based on descripcionDias if available
    if (routine?.descripcionDias) {
      const parts = routine.descripcionDias.split(';');
      parts.forEach(part => {
        const day = parseInt(part.split(':')[0]);
        if (!isNaN(day)) {
          groups[day] = [];
        }
      });
    }

    // Fill groups with existing exercises
    (routineExercises || []).forEach((ex) => {
      const day = ex.dia || 1;
      if (!groups[day]) groups[day] = [];
      groups[day].push(ex);
    });

    // If no descricaoDias and no exercises, default to day 1
    if (Object.keys(groups).length === 0) {
      groups[1] = [];
    }

    // Sort days
    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([day, exercises]) => ({
        day: parseInt(day),
        exercises: exercises.sort((a, b) => {
          // Primero agrupar por si son bi-series
          const groupA = a.esBiSerie ? (a.biSerieGrupo || 0) : 999;
          const groupB = b.esBiSerie ? (b.biSerieGrupo || 0) : 999;

          if (groupA !== groupB) return groupA - groupB;

          // Si tienen orden definido, usarlo
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }

          // Fallback al orden original por ID
          return (a.id || 0) - (b.id || 0);
        })
      }));
  }, [routineExercises, routine?.descripcionDias]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title={routine?.nombre || 'Detalle de la Rutina'}
          backLink="/rutinas"
        />
        <Button
          color="primary"
          onPress={onOpen}
          className="shadow-lg"
          startContent={<Icon icon="mdi:plus" width={20} />}
        >
          Añadir Ejercicio
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" label="Cargando rutina..." />
        </div>
      ) : routine ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Exercises grouped by day */}
          <div className="lg:col-span-2 space-y-6">
            <Card shadow="sm" className="border-none bg-content1">
              <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Icon icon="mdi:calendar-clock" className="text-primary" />
                  Organización por Días
                </h2>
                <p className="text-small text-default-500">Visualiza y gestiona los ejercicios agrupados por día de entrenamiento.</p>
              </CardHeader>
              <CardBody className="px-6 py-4">
                {routineExercises.length === 0 ? (
                  <EmptyState
                    title="No hay ejercicios en esta rutina"
                    description="Comienza agregando ejercicios para organizar el plan de entrenamiento."
                    icon="mdi:weight-lifter"
                    actionLabel="Añadir Primer Ejercicio"
                    onActionClick={onOpen}
                  />
                ) : (
                  <Accordion
                    variant="splitted"
                    className="px-0"
                    itemClasses={{
                      base: "py-0 w-full mb-3 shadow-sm border border-default-100",
                      title: "font-semibold text-lg",
                      trigger: "px-4 py-3 data-[hover=true]:bg-default-50 transition-colors",
                      indicator: "text-primary",
                      content: "px-4 pb-4 pt-1"
                    }}
                    selectionMode="multiple"
                    defaultExpandedKeys={groupedExercises.length > 0 ? [groupedExercises[0].day.toString()] : []}
                  >
                    {groupedExercises.map(({ day, exercises }) => (
                      <AccordionItem
                        key={day.toString()}
                        aria-label={getDayName(day, routine?.descripcionDias)}
                        title={
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span>{getDayName(day, routine?.descripcionDias)}</span>
                              <Chip size="sm" variant="flat" color="primary" className="ml-2">
                                {exercises.length} {exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                              </Chip>
                            </div>
                          </div>
                        }
                      >
                        <div className="space-y-4">
                          {exercises.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-default-200 rounded-2xl bg-default-50/50">
                              <p className="text-default-500 text-small mb-3">No hay ejercicios para este día</p>
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="lucide:plus" />}
                                onPress={() => handleAddExerciseToDay(day)}
                              >
                                Añadir Ejercicio
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 gap-4">
                                {exercises.map((re, index) => {
                                  const isBiSerieNext = exercises[index + 1]?.esBiSerie && exercises[index + 1]?.biSerieGrupo === re.biSerieGrupo;
                                  const isBiSeriePrev = exercises[index - 1]?.esBiSerie && exercises[index - 1]?.biSerieGrupo === re.biSerieGrupo;
                                  const isInBiSerie = re.esBiSerie;

                                  return (
                                    <div key={re.id} className="relative">
                                      {isInBiSerie && !isBiSeriePrev && (
                                        <div className="flex items-center gap-2 mb-2 ml-1">
                                          <Icon icon="mdi:link-variant" className="text-primary" width={14} />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Bi-serie Grupo {re.biSerieGrupo}</span>
                                        </div>
                                      )}
                                      {isInBiSerie && isBiSerieNext && (
                                        <div className="absolute -left-3 top-10 bottom-0 w-1 rounded-full bg-primary/20 z-0" />
                                      )}
                                      <Card
                                        isHoverable
                                        className={`border border-default-100 shadow-none overflow-visible ${isInBiSerie ? 'border-l-4 border-l-primary bg-primary/5' : 'bg-default-50/50'}`}
                                      >
                                        <CardBody className="p-4">
                                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex gap-4">
                                              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isInBiSerie ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary'}`}>
                                                <Icon icon={isInBiSerie ? "mdi:layers-triple" : "mdi:weight-lifter"} width={24} />
                                              </div>
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <h4 className="font-bold text-base leading-tight">
                                                    {getExerciseName(re.ejercicioNombre)}
                                                  </h4>
                                                  {isInBiSerie && (
                                                    <Chip size="sm" color="primary" variant="flat" className="h-4 text-[10px] uppercase font-bold">
                                                      Bi-serie {re.biSerieGrupo}
                                                    </Chip>
                                                  )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                  <div className="flex items-center gap-1 text-small text-default-500">
                                                    <Icon icon="mdi:repeat" />
                                                    <span>{re.series} x {re.repeticiones}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1 text-small text-default-500">
                                                    <Icon icon="mdi:timer-outline" />
                                                    <span>{re.descansoSegundos}s desc.</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex sm:flex-col justify-end gap-2">
                                              <div className="flex gap-2">
                                                <div className="flex flex-col gap-1 mr-2">
                                                  <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    isDisabled={index === 0 || isOrdering}
                                                    onPress={() => handleMoveExercise('up', re, exercises)}
                                                    className="h-6 w-6"
                                                  >
                                                    <Icon icon="lucide:chevron-up" width={16} />
                                                  </Button>
                                                  <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    isDisabled={index === exercises.length - 1 || isOrdering}
                                                    onPress={() => handleMoveExercise('down', re, exercises)}
                                                    className="h-6 w-6"
                                                  >
                                                    <Icon icon="lucide:chevron-down" width={16} />
                                                  </Button>
                                                </div>

                                                <Button
                                                  isIconOnly
                                                  size="sm"
                                                  variant="flat"
                                                  color="primary"
                                                  onPress={() => handleEditExercise(re)}
                                                  title="Editar"
                                                >
                                                  <Icon icon="mdi:pencil" width={18} />
                                                </Button>
                                                <Button
                                                  isIconOnly
                                                  size="sm"
                                                  variant="flat"
                                                  color="danger"
                                                  onPress={() => handleDeleteClick(re)}
                                                  title="Eliminar"
                                                >
                                                  <Icon icon="mdi:trash-can" width={18} />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-center mt-2">
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="primary"
                                  startContent={<Icon icon="lucide:plus" />}
                                  onPress={() => handleAddExerciseToDay(day)}
                                >
                                  Añadir otro ejercicio
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar: Routine Information */}
          <div className="space-y-6">
            <Card shadow="sm" className="border-none bg-content1">
              <CardHeader className="px-6 pt-6 pb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Icon icon="mdi:information-outline" className="text-primary" />
                  Información General
                </h2>
              </CardHeader>
              <CardBody className="px-6 py-4 space-y-6">
                <div className="space-y-1">
                  <span className="text-tiny uppercase font-bold text-default-400 tracking-wider">Nombre de la Rutina</span>
                  <p className="text-lg font-medium">{routine.nombre}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-tiny uppercase font-bold text-default-400 tracking-wider">Enfoque / Objetivo</span>
                  <div>
                    <Chip
                      color={getEnfoqueColor(routine.enfoque)}
                      variant="flat"
                      className="font-medium"
                    >
                      {routine.enfoque}
                    </Chip>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-tiny uppercase font-bold text-default-400 tracking-wider">Costo</span>
                    <p className="text-lg font-bold text-success">${routine.monto || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-tiny uppercase font-bold text-default-400 tracking-wider">Fecha Inicio</span>
                    <p className="text-default-700">
                      {routine.fechaInicio ? formatDate(routine.fechaInicio) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-default-100">
                  <Button
                    as={Link}
                    to="/rutinas"
                    variant="light"
                    color="default"
                    fullWidth
                    startContent={<Icon icon="mdi:arrow-left" />}
                  >
                    Volver al Listado
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Rutina no encontrada"
          description="No pudimos localizar la rutina. Puede que haya sido eliminada."
          icon="mdi:alert-circle-outline"
          actionLabel="Volver a Rutinas"
          actionPath="/rutinas"
        />
      )}

      {modalContent}



      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Eliminar Ejercicio"
        message="¿Estás seguro de que deseas eliminar este ejercicio de la rutina? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isDanger
      />
    </div >
  );
};