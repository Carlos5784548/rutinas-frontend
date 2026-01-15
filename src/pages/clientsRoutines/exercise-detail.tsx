import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Header } from '../../components/clientes-components/header';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { exerciseApi, clientApi, getClienteId } from '../../services/api';
import { Exercise, ProgresoEjercicioResponseDTO } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MediaRenderer = ({ url, alt }: { url: string; alt: string }) => {
    const [error, setError] = React.useState(false);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-default-100/50 text-foreground-400">
                <Icon icon="lucide:image-off" className="text-4xl mb-2 opacity-50" />
                <p className="text-xs font-medium">No se pudo cargar la vista previa</p>
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
                    src={`https://www.youtube.com/embed/${youtubeId}`}
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
                controls
                className="w-full max-h-[500px]"
                playsInline
                onError={() => setError(true)}
            />
        );
    } else {
        return (
            <img
                src={url}
                alt={alt}
                className="w-full h-auto max-h-[500px] object-contain"
                onError={() => setError(true)}
            />
        );
    }
};

const ExerciseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exercise, setExercise] = React.useState<Exercise | null>(null);
    const [weightHistory, setWeightHistory] = React.useState<{ fecha: string, peso: number }[]>([]);
    const [loading, setLoading] = React.useState(true);

    const muscleGroupColors: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
        'Pecho': 'primary',
        'Espalda': 'secondary',
        'Piernas': 'success',
        'Hombros': 'warning',
        'Brazos': 'danger',
        'Abdomen': 'default',
        'Cuerpo Completo': 'primary'
    };

    React.useEffect(() => {
        const fetchData = async () => {
            const clienteId = getClienteId();
            if (!id || !clienteId) {
                setLoading(false);
                return;
            }

            try {
                const [exerciseData, progressData] = await Promise.all([
                    exerciseApi.getById(parseInt(id)),
                    clientApi.getMyProgress(clienteId)
                ]);

                setExercise(exerciseData);

                // Filtrar progreso por este ejercicio y mapear para el gráfico
                const exerciseProgress = progressData
                    .filter(p => p.rutinaEjercicioId === parseInt(id) || p.ejercicioNombre === exerciseData.nombre)
                    .map(p => ({
                        fecha: p.fecha,
                        peso: p.kg || p.peso || 0
                    }))
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

                setWeightHistory(exerciseProgress);
            } catch (error) {
                console.error("Error fetching exercise details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <Spinner label="Cargando ejercicio..." />
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-4">
                <Icon icon="lucide:alert-circle" className="text-4xl text-danger mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ejercicio no encontrado</h2>
                <Button color="primary" onPress={() => navigate('/cliente-app/exercises')}>
                    Ver todos los ejercicios
                </Button>
            </div>
        );
    }

    return (
        <PageTransition>
            <Header title={exercise.nombre} showBackButton />

            <div className="p-4">
                <div className="max-w-lg mx-auto">
                    {exercise.videoUrl ? (
                        <Card className="mb-6">
                            <CardBody className="p-0 overflow-hidden">
                                <div className="bg-black flex items-center justify-center min-h-[200px]">
                                    <MediaRenderer url={exercise.videoUrl} alt={exercise.nombre} />
                                </div>
                                <div className="p-3 bg-content1">
                                    <p className="text-small font-semibold">Demostración</p>
                                    <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-tiny text-primary hover:underline flex items-center gap-1">
                                        <Icon icon="lucide:external-link" width={12} />
                                        Abrir enlace original
                                    </a>
                                </div>
                            </CardBody>
                        </Card>
                    ) : (
                        <Card className="mb-6 overflow-hidden">
                            <CardBody className="p-0">
                                <div className="relative h-64 bg-primary/10 flex items-center justify-center">
                                    <Icon icon="lucide:dumbbell" className="text-primary/40" width={120} />
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    <Card className="mb-6">
                        <CardBody>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">{exercise.nombre}</h2>
                                <Chip
                                    color={muscleGroupColors[exercise.grupoMuscular] || 'default'}
                                >
                                    {exercise.grupoMuscular}
                                </Chip>
                            </div>

                            <p className="text-foreground-500 mb-4">
                                {exercise.descripcion || "Sin descripción disponible."}
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="mb-6">
                        <CardBody>
                            <h3 className="font-semibold mb-4 text-center">Progreso Histórico (kg)</h3>
                            <div className="h-48">
                                {weightHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weightHistory}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--heroui-divider)" />
                                            <XAxis dataKey="fecha" tick={{ fontSize: 10 }} stroke="var(--heroui-foreground-400)" />
                                            <YAxis tick={{ fontSize: 10 }} stroke="var(--heroui-foreground-400)" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--heroui-content1)', border: '1px solid var(--heroui-divider)', borderRadius: '8px' }}
                                                formatter={(value) => [`${value} kg`, 'Peso']}
                                            />
                                            <Line type="monotone" dataKey="peso" stroke="var(--heroui-primary)" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-foreground-500 text-small">No hay registros de peso para este ejercicio.</p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>


                </div>
            </div>
        </PageTransition>
    );
};

export default ExerciseDetailPage;