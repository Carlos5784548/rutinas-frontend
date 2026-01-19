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

                const routinesList = Array.isArray(allRoutines) ? allRoutines : [];
                const foundRoutine = routinesList.find((r: RutinaResponseDTO) => r.id === parseInt(id));
                setRoutine(foundRoutine || null);

                const exercisesList = Array.isArray(exercisesData) ? exercisesData : [];
                setExercises(exercisesList);

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
                        className="bg-primary text-white font-bold shadow-lg shadow-primary/30"
                        radius="full"
                        size="sm"
                        isDisabled={dailyExercises.length === 0}
                        onPress={() => navigate(`/cliente-app/training/${routine.id}/${selectedDay}`)}
                        startContent={<Icon icon="lucide:play" width={16} />}
                    >
                        Iniciar
                    </Button>
                }
            />

            <div className="p-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-8 border-none shadow-md rounded-3xl overflow-hidden">
                        <CardBody className="p-0">
                            <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                                <img
                                    src="/gym-hero.jpg"
                                    alt="Training Hero"
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                variant="solid"
                                                classNames={{
                                                    base: "bg-success/90 backdrop-blur-md",
                                                    content: "text-white font-bold text-[10px] tracking-wider uppercase px-1"
                                                }}
                                            >
                                                {routine.estado}
                                            </Chip>
                                            <Chip
                                                size="sm"
                                                variant="solid"
                                                classNames={{
                                                    base: "bg-white/20 backdrop-blur-md border border-white/30",
                                                    content: "text-white font-bold text-[10px] tracking-wider uppercase px-1"
                                                }}
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
                                className="bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                size="md"
                                radius="full"
                                isDisabled={dailyExercises.length === 0}
                                onPress={() => navigate(`/cliente-app/training/${routine.id}/${selectedDay}`)}
                                startContent={<Icon icon="lucide:play" width={20} className="fill-current" />}
                            >
                                INICIAR ENTRENAMIENTO
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {(() => {
                                const sortedExercises = [...dailyExercises].sort((a, b) => {
                                    const groupA = a.esBiSerie ? (a.biSerieGrupo || 0) : 999;
                                    const groupB = b.esBiSerie ? (b.biSerieGrupo || 0) : 999;
                                    if (groupA !== groupB) return groupA - groupB;
                                    return (a.id || 0) - (b.id || 0);
                                });

                                const groupedExercises: { isBiSerie: boolean; biSerieGrupo?: number; exercises: RutinaEjercicioResponseDTO[] }[] = [];

                                sortedExercises.forEach(ex => {
                                    const lastGroup = groupedExercises[groupedExercises.length - 1];
                                    const isBiSerie = ex.esBiSerie;
                                    const biSerieGrupo = ex.biSerieGrupo;

                                    if (lastGroup && lastGroup.isBiSerie && isBiSerie && lastGroup.biSerieGrupo === biSerieGrupo) {
                                        lastGroup.exercises.push(ex);
                                    } else {
                                        groupedExercises.push({
                                            isBiSerie: !!isBiSerie,
                                            biSerieGrupo: biSerieGrupo || undefined,
                                            exercises: [ex]
                                        });
                                    }
                                });

                                return groupedExercises.map((group, groupIndex) => {
                                    if (group.isBiSerie) {
                                        return (
                                            <div key={`group-${group.biSerieGrupo}-${groupIndex}`} className="mb-4 p-3 sm:p-4 border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                                <div className="flex items-center gap-2 mb-3 ml-1">
                                                    <Icon icon="mdi:link-variant" className="text-primary" width={18} />
                                                    <span className="text-xs font-black uppercase tracking-widest text-primary">Bi-serie Grupo {group.biSerieGrupo}</span>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    {group.exercises.map((exercise, index) => (
                                                        <ExerciseCard
                                                            key={exercise.id}
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
                                                            isLastInGroup={index === group.exercises.length - 1}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return group.exercises.map((exercise, index) => (
                                            <ExerciseCard
                                                key={exercise.id}
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
                                                isLastInGroup={true}
                                            />
                                        ));
                                    }
                                });
                            })()}

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