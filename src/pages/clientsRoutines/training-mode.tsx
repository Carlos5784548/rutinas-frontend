import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Progress, Chip, Input, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/clientes-components/header';
import { Timer } from '../../components/clientes-components/timer';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { clientApi, getClienteId, exerciseApi } from '../../services/api';
import { RutinaEjercicioResponseDTO, ProgresoEjercicioRequestDTO } from '../../types';

const MediaRenderer = ({ url, alt }: { url: string; alt: string }) => {
    const [error, setError] = React.useState(false);

    if (error || !url) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-primary/10 text-primary/40">
                <Icon icon="lucide:dumbbell" width={80} />
            </div>
        );
    }

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(url);
    const isVideoFile = url.match(/\.(mp4|webm|ogg|mov)$/i);

    if (youtubeId) {
        return (
            <div className="w-full aspect-video">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    } else if (isVideoFile) {
        return (
            <video
                src={url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        );
    } else {
        return (
            <img
                src={url}
                alt={alt}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        );
    }
};

const TrainingModePage = () => {
    const { routineId, dayId } = useParams<{ routineId: string; dayId: string }>();
    const navigate = useNavigate();

    const [exercises, setExercises] = React.useState<RutinaEjercicioResponseDTO[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0);
    const [completedSets, setCompletedSets] = React.useState<Record<number, number>>({});
    const [weights, setWeights] = React.useState<Record<number, Record<number, number>>>({});
    const [showRest, setShowRest] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [registering, setRegistering] = React.useState(false);

    React.useEffect(() => {
        const fetchExercises = async () => {
            const clienteId = getClienteId();
            if (!clienteId || !routineId || !dayId) {
                setLoading(false);
                return;
            }

            try {
                const [exercisesData, allProgress, allExercisesLookup] = await Promise.all([
                    clientApi.getRoutineExercises(clienteId, parseInt(routineId)),
                    clientApi.getMyProgress(clienteId),
                    exerciseApi.getAll()
                ]);

                const exercisesList = Array.isArray(exercisesData) ? exercisesData : [];

                // Enriquecer con videoUrl del catálogo de ejercicios
                const enrichedExercises = exercisesList.map(re => {
                    const exerciseInfo = allExercisesLookup.find(e => e.id === re.ejercicioId);
                    return {
                        ...re,
                        videoUrl: exerciseInfo?.videoUrl
                    };
                });

                // Filtrar por el día seleccionado
                const dayExercises = enrichedExercises.filter(e => e.dia === parseInt(dayId));
                setExercises(dayExercises);

                // --- Reconstrucción del Estado Senior ---
                const today = new Date().toISOString().split('T')[0];
                const progressList = Array.isArray(allProgress) ? allProgress : [];
                const todayProgress = progressList.filter(p => p.fecha === today);

                const newCompletedSets: Record<number, number> = {};
                const newWeights: Record<number, Record<number, number>> = {};

                dayExercises.forEach(ex => {
                    if (!ex.id) return;
                    const exProgress = todayProgress.filter(p => p.rutinaEjercicioId === ex.id);
                    if (exProgress.length > 0) {
                        newCompletedSets[ex.id] = exProgress.length;
                        newWeights[ex.id] = {};
                        exProgress.forEach(p => {
                            newWeights[ex.id!][p.serieNumero - 1] = p.peso || p.kg || 0;
                        });
                    }
                });

                setCompletedSets(newCompletedSets);
                setWeights(newWeights);

                // Encontrar el primer ejercicio que no esté terminado
                const firstIncompleteIndex = dayExercises.findIndex(ex => (newCompletedSets[ex.id!] || 0) < ex.series);

                if (firstIncompleteIndex !== -1) {
                    setCurrentExerciseIndex(firstIncompleteIndex);
                } else if (dayExercises.length > 0) {
                    // Si todos están terminados, mostrar pantalla de finalización
                    setIsCompleted(true);
                }
                // ----------------------------------------

            } catch (error) {
                console.error("Error fetching exercises for training:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [routineId, dayId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <Spinner label="Preparando entrenamiento..." />
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-4">
                <Icon icon="lucide:alert-circle" className="text-4xl text-danger mb-4" />
                <h2 className="text-xl font-semibold mb-2">Sin ejercicios</h2>
                <p className="text-foreground-500 text-center mb-6">
                    No se encontraron ejercicios para este día de entrenamiento.
                </p>
                <Button color="primary" onPress={() => navigate(`/cliente-app/routines/${routineId}`)}>
                    Volver
                </Button>
            </div>
        );
    }

    const currentExercise = exercises[currentExerciseIndex];
    const totalExercises = exercises.length;
    const progress = (currentExerciseIndex / totalExercises) * 100;

    const handleSetComplete = async (setIndex: number) => {
        const clienteId = getClienteId();
        if (!clienteId || !currentExercise.id) return;

        setRegistering(true);
        try {
            const weight = weights[currentExercise.id]?.[setIndex] || 0;

            if (weight <= 0) {
                // validation error
                alert("kg: El peso debe ser mayor que 0");
                setRegistering(false);
                return;
            }

            const progressData: ProgresoEjercicioRequestDTO = {
                fecha: new Date().toISOString().split('T')[0],
                kg: weight,
                serieNumero: setIndex + 1,
                completado: true,
                dia: parseInt(dayId || "1"),
                rutinaEjercicioId: currentExercise.id,
                clienteId: clienteId
            };

            await clientApi.registerProgress(clienteId, currentExercise.id, progressData);

            const currentSets = completedSets[currentExercise.id] || 0;
            const newCompletedSets = { ...completedSets, [currentExercise.id]: currentSets + 1 };
            setCompletedSets(newCompletedSets);

            const shouldRest = (currentExercise.descansoSegundos || 0) > 5;

            if (newCompletedSets[currentExercise.id] >= currentExercise.series) {
                if (currentExerciseIndex < totalExercises - 1) {
                    if (shouldRest) {
                        setShowRest(true);
                    } else {
                        // Skip rest and go to next exercise
                        setCurrentExerciseIndex(prev => prev + 1);
                    }
                } else {
                    setIsCompleted(true);
                }
            } else {
                if (shouldRest) {
                    setShowRest(true);
                }
            }
        } catch (error) {
            console.error("Error registering progress:", error);
        } finally {
            setRegistering(false);
        }
    };

    const handleWeightChange = (setIndex: number, weight: number) => {
        const exerciseId = currentExercise.id;
        setWeights(prev => ({
            ...prev,
            [exerciseId]: {
                ...(prev[exerciseId] || {}),
                [setIndex]: weight
            }
        }));
    };

    const handleRestComplete = () => {
        setShowRest(false);
        const exerciseId = currentExercise.id;
        const currentSets = completedSets[exerciseId] || 0;

        if (currentSets >= currentExercise.series) {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    };

    const handleSkipExercise = () => {
        if (currentExerciseIndex < totalExercises - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setShowRest(false);
        } else {
            setIsCompleted(true);
        }
    };

    if (isCompleted) {
        return (
            <PageTransition>
                <Header title="Entrenamiento Completado" showBackButton />
                <div className="p-4 flex flex-col items-center justify-center min-h-[70vh]">
                    <div className="text-center max-w-md">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Icon icon="lucide:check" className="text-5xl text-success" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">¡Felicidades!</h2>
                        <p className="text-foreground-500 mb-8">
                            Has completado tu entrenamiento de hoy. Sigue así para alcanzar tus objetivos.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                color="primary"
                                onPress={() => navigate(`/cliente-app/routines/${routineId}`)}
                                startContent={<Icon icon="lucide:arrow-left" />}
                            >
                                Volver a la Rutina
                            </Button>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <Header
                title="Entrenamiento en Vivo"
                showBackButton
                action={
                    <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => navigate(`/cliente-app/routines/${routineId}`)}
                    >
                        Salir
                    </Button>
                }
            />
            <div className="p-4">
                <div className="max-w-lg mx-auto">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-small text-foreground-500">Progreso de la sesión</span>
                            <span className="text-small font-medium">{currentExerciseIndex + 1} de {totalExercises}</span>
                        </div>
                        <Progress
                            value={progress}
                            color="primary"
                            className="h-2"
                            aria-label="Progreso del entrenamiento"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {showRest ? (
                            <motion.div
                                key="rest"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6"
                            >
                                <Card>
                                    <CardBody className="flex flex-col items-center p-6">
                                        <div className="bg-warning/10 p-4 rounded-full mb-4">
                                            <Icon icon="lucide:timer" className="text-3xl text-warning" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-1">Tiempo de Descanso</h3>
                                        <p className="text-foreground-500 text-center mb-6">
                                            Tómate un momento para recuperarte.
                                        </p>
                                        <div className="flex flex-col w-full gap-3">
                                            <Button color="primary" onPress={handleRestComplete} startContent={<Icon icon="lucide:check" />}>
                                                Continuar ahora
                                            </Button>
                                            <Timer duration={currentExercise.descansoSegundos} onComplete={handleRestComplete} />
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="exercise"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="mb-6 overflow-hidden">
                                    <CardBody className="p-0">
                                        <div className="relative h-64 bg-black flex items-center justify-center">
                                            <MediaRenderer
                                                url={currentExercise.videoUrl || ""}
                                                alt={currentExercise.ejercicioNombre}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-xl font-semibold">{currentExercise.ejercicioNombre}</h3>
                                                    {currentExercise.esBiSerie && (
                                                        <div className="flex items-center gap-1">
                                                            <Chip color="primary" variant="flat" size="sm" className="h-4 text-[10px] uppercase font-bold">
                                                                Bi-serie {currentExercise.biSerieGrupo}
                                                            </Chip>
                                                            <span className="text-[10px] text-primary flex items-center gap-0.5">
                                                                <Icon icon="mdi:link-variant" width={10} />
                                                                Combo
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Chip color="primary" size="sm">Día {currentExercise.dia}</Chip>
                                            </div>
                                            <div className="flex gap-4 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Icon icon="lucide:repeat" className="text-foreground-500" />
                                                    <span className="text-small">{currentExercise.series} series</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Icon icon="lucide:activity" className="text-foreground-500" />
                                                    <span className="text-small">{currentExercise.repeticiones} reps</span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="font-medium mb-3">Registrar Series</h4>
                                                <div className="space-y-3">
                                                    {Array.from({ length: currentExercise.series }).map((_, index) => {
                                                        const isSetDone = (completedSets[currentExercise.id] || 0) > index;
                                                        const currentWeight = weights[currentExercise.id]?.[index] || 0;
                                                        return (
                                                            <Card key={index} className={`border ${isSetDone ? 'border-success/30 bg-success/5' : 'border-divider'}`}>
                                                                <CardBody className="py-3 px-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSetDone ? 'bg-success text-white' : 'bg-default-100'}`}>
                                                                                {isSetDone ? <Icon icon="lucide:check" width={14} /> : <span className="text-tiny">{index + 1}</span>}
                                                                            </div>
                                                                            <span className="font-medium">{currentExercise.repeticiones} reps</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <Input
                                                                                type="number"
                                                                                aria-label="Peso"
                                                                                placeholder="0"
                                                                                value={currentWeight.toString()}
                                                                                onValueChange={(value) => handleWeightChange(index, Number(value))}
                                                                                className="w-16 text-center"
                                                                                size="sm"
                                                                                endContent={<span className="text-small text-foreground-500">kg</span>}
                                                                                disabled={isSetDone || registering}
                                                                            />
                                                                            <Button
                                                                                isIconOnly
                                                                                color={isSetDone ? "success" : "primary"}
                                                                                variant={isSetDone ? "flat" : "solid"}
                                                                                onPress={() => !isSetDone && handleSetComplete(index)}
                                                                                isDisabled={isSetDone || registering}
                                                                                isLoading={registering && !isSetDone && (completedSets[currentExercise.id] || 0) === index}
                                                                                size="sm"
                                                                            >
                                                                                <Icon icon="lucide:check" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </CardBody>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <Button color="default" variant="flat" onPress={handleSkipExercise} startContent={<Icon icon="lucide:skip-forward" />}>
                                                Saltar Ejercicio
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
};

export default TrainingModePage;