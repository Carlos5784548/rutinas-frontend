import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Card, CardBody, Button, Chip, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Header } from '../../components/clientes-components/header';
import { ExerciseCard } from '../../components/clientes-components/exercise-card';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { clientApi, getClienteId, exerciseApi } from '../../services/api';
import { RutinaResponseDTO, RutinaEjercicioResponseDTO, Exercise } from '../../types';

const RoutineDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedDay, setSelectedDay] = React.useState<number>(1);
    const [routine, setRoutine] = React.useState<RutinaResponseDTO | null>(null);
    const [exercises, setExercises] = React.useState<RutinaEjercicioResponseDTO[]>([]);
    const [exercisesMap, setExercisesMap] = React.useState<Record<number, Exercise>>({});
    const [loading, setLoading] = React.useState(true);
    const [isPaying, setIsPaying] = React.useState(false);

    const parseDayNames = (desc: string | undefined): Record<number, string> => {
        if (!desc) return {};
        const map: Record<number, string> = {};
        desc.split(';').forEach(part => {
            const [day, name] = part.split(':');
            if (day && name) map[parseInt(day)] = name;
        });
        return map;
    };

    const dayNames = React.useMemo(() => parseDayNames(routine?.descripcionDias), [routine?.descripcionDias]);

    React.useEffect(() => {
        const fetchData = async () => {
            const clienteId = getClienteId();
            if (!clienteId || !id) {
                setLoading(false);
                return;
            }

            try {
                const [allRoutines, exercisesData, allExercises] = await Promise.all([
                    clientApi.getMyRoutines(clienteId),
                    clientApi.getRoutineExercises(clienteId, parseInt(id)),
                    exerciseApi.getAll()
                ]);

                const exMap: Record<number, Exercise> = {};
                allExercises.forEach(e => {
                    if (e.id) exMap[e.id] = e;
                });
                setExercisesMap(exMap);

                const foundRoutine = allRoutines.find(r => r.id === parseInt(id));
                setRoutine(foundRoutine || null);
                setExercises(exercisesData);

                const availableDays = [...new Set(exercisesData.map(e => e.dia))].sort((a, b) => a - b);
                if (availableDays.length > 0) {
                    setSelectedDay(availableDays[0]);
                }
            } catch (error) {
                console.error("Error fetching routine details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <Spinner label="Cargando detalles de rutina..." />
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-4">
                <Icon icon="lucide:alert-circle" className="text-4xl text-danger mb-4" />
                <h2 className="text-xl font-semibold mb-2">Rutina no encontrada</h2>
                <p className="text-foreground-500 text-center mb-6">
                    La rutina que estás buscando no existe o no tienes acceso.
                </p>
                <Button color="primary" onPress={() => navigate('/cliente-app/routines')}>
                    Ver todas las rutinas
                </Button>
            </div>
        );
    }

    if (routine.estado.includes('PENDIENTE')) {
        const handlePayment = async () => {
            setIsPaying(true);
            try {
                const clienteId = getClienteId();
                if (!clienteId) return;
                const data = await clientApi.initiatePayment(routine.id, clienteId);
                if (data && data.initPoint) {
                    window.location.href = data.initPoint;
                }
            } catch (error) {
                console.error("Error starting payment:", error);
            } finally {
                setIsPaying(false);
            }
        };

        return (
            <PageTransition>
                <Header title="Acceso Restringido" showBackButton />
                <div className="p-6 h-[70vh] flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center shadow-inner">
                        {isPaying ? <Spinner color="danger" size="lg" /> : <Icon icon="lucide:lock" className="text-danger text-5xl" />}
                    </div>
                    <div className="space-y-2 max-w-xs">
                        <h2 className="text-2xl font-black text-foreground">Pago Pendiente</h2>
                        <p className="text-foreground-500 font-medium">Esta rutina aún no ha sido abonada. Debes completar el pago para acceder a los ejercicios.</p>
                    </div>
                    <Button
                        color="primary"
                        size="lg"
                        className="font-bold w-full max-w-xs shadow-xl shadow-primary/30 h-14"
                        isLoading={isPaying}
                        onPress={handlePayment}
                    >
                        PAGAR AHORA
                    </Button>
                    <Button
                        variant="light"
                        onPress={() => navigate('/cliente-app/routines')}
                        className="font-medium"
                    >
                        Volver a mis rutinas
                    </Button>
                </div>
            </PageTransition>
        );
    }

    const dailyExercises = exercises.filter(e => e.dia === selectedDay);
    const availableDays = [...new Set(exercises.map(e => e.dia))].sort((a, b) => a - b);

    return (
        <PageTransition>
            <Header
                title={routine.nombre}
                showBackButton
                action={
                    <Button
                        color="primary"
                        size="sm"
                        isDisabled={dailyExercises.length === 0}
                        onPress={() => navigate(`/cliente-app/training/${routine.id}/${selectedDay}`)}
                        startContent={<Icon icon="lucide:play" />}
                    >
                        Iniciar
                    </Button>
                }
            />

            <div className="p-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-6">
                        <CardBody className="p-0">
                            <div className="relative h-48 bg-primary/10 flex items-center justify-center">
                                <Icon icon="lucide:dumbbell" className="text-primary/40" width={80} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                color="primary"
                                            >
                                                {routine.estado}
                                            </Chip>
                                            <Chip
                                                size="sm"
                                                color="secondary"
                                            >
                                                {routine.enfoque}
                                            </Chip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="mb-4">
                        <Tabs
                            aria-label="Días de entrenamiento"
                            selectedKey={selectedDay.toString()}
                            onSelectionChange={(key) => setSelectedDay(parseInt(key as string))}
                            variant="underlined"
                            color="primary"
                            classNames={{
                                tabList: "overflow-x-auto scrollbar-hidden",
                                cursor: "bg-primary"
                            }}
                        >
                            {availableDays.length > 0 ? (
                                availableDays.map((day) => (
                                    <Tab key={day.toString()} title={dayNames[day] || `Día ${day}`} />
                                ))
                            ) : (
                                <Tab key="1" title="Sin días" />
                            )}
                        </Tabs>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {dayNames[selectedDay] || `Día ${selectedDay}`}
                            </h3>
                            <Button
                                color="primary"
                                size="sm"
                                isDisabled={dailyExercises.length === 0}
                                onPress={() => navigate(`/cliente-app/training/${routine.id}/${selectedDay}`)}
                                startContent={<Icon icon="lucide:play" />}
                            >
                                Iniciar Entrenamiento
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {dailyExercises
                                .sort((a, b) => {
                                    const groupA = a.esBiSerie ? (a.biSerieGrupo || 0) : 999;
                                    const groupB = b.esBiSerie ? (b.biSerieGrupo || 0) : 999;
                                    if (groupA !== groupB) return groupA - groupB;
                                    return (a.id || 0) - (b.id || 0);
                                })
                                .map((exercise, index, array) => {
                                    const prevExercise = array[index - 1];
                                    const nextExercise = array[index + 1];
                                    const isFirstInGroup = exercise.esBiSerie && (!prevExercise || !prevExercise.esBiSerie || prevExercise.biSerieGrupo !== exercise.biSerieGrupo);
                                    const isLastInGroup = !exercise.esBiSerie ||
                                        !nextExercise ||
                                        !nextExercise.esBiSerie ||
                                        nextExercise.biSerieGrupo !== exercise.biSerieGrupo;

                                    return (
                                        <React.Fragment key={exercise.id}>
                                            {isFirstInGroup && (
                                                <div className="flex items-center gap-2 mb-1 ml-1 mt-2">
                                                    <Icon icon="mdi:link-variant" className="text-primary" width={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Bi-serie Grupo {exercise.biSerieGrupo}</span>
                                                </div>
                                            )}
                                            <ExerciseCard
                                                exercise={{
                                                    id: exercise.ejercicioId.toString(),
                                                    name: exercise.ejercicioNombre,
                                                    sets: exercise.series,
                                                    reps: exercise.repeticiones.toString(),
                                                    rest: exercise.descansoSegundos.toString() + 's',
                                                    image: exercisesMap[exercise.ejercicioId]?.videoUrl || "https://images.unsplash.com/photo-1534438327245-0451796ceb5d?w=200",
                                                    muscleGroup: "Varios",
                                                    esBiSerie: exercise.esBiSerie,
                                                    biSerieGrupo: exercise.biSerieGrupo
                                                }}
                                                index={index}
                                                isLastInGroup={isLastInGroup}
                                            />
                                        </React.Fragment>
                                    );
                                })}

                            {dailyExercises.length === 0 && (
                                <div className="text-center py-8">
                                    <Icon icon="lucide:calendar-x" className="text-4xl text-foreground-300 mb-2" />
                                    <p className="text-foreground-500">No hay ejercicios para este día</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default RoutineDetailPage;