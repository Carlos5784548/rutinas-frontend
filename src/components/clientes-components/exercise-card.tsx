import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    image: string;
    description?: string;
    sets?: number;
    reps?: string;
    rest?: string;
    instructions?: string[];
    esBiSerie?: boolean;
    biSerieGrupo?: number | null;
}

interface ExerciseCardProps {
    exercise: Exercise;
    index: number;
    showDetails?: boolean;
    isLastInGroup?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    index,
    showDetails = true,
    isLastInGroup = false
}) => {
    const navigate = useNavigate();

    const muscleGroupColors = {
        'Pecho': 'primary',
        'Espalda': 'secondary',
        'Piernas': 'success',
        'Hombros': 'warning',
        'Brazos': 'danger',
        'Abdomen': 'default'
    } as const;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative"
        >
            {/* Visual connection line for bi-series */}
            {exercise.esBiSerie && !isLastInGroup && (
                <div className="absolute left-[2.5rem] top-[4rem] bottom-[-1rem] w-1 bg-primary/20 z-0 rounded-full" />
            )}

            <Card
                isPressable
                onPress={() => navigate(`/cliente-app/exercises/${exercise.id}`)}
                className={`overflow-hidden border ${exercise.esBiSerie ? 'border-primary/40 bg-primary/5' : 'border-divider bg-content2/30'} shadow-sm hover:border-primary/50 transition-all active:scale-[0.98]`}
            >
                <CardBody className="p-3">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-inner flex items-center justify-center ${exercise.esBiSerie ? 'bg-primary/20' : 'bg-primary/10'}`}>
                            {(() => {
                                const url = exercise.image;
                                if (!url) {
                                    return (
                                        <Icon
                                            icon={exercise.esBiSerie ? "mdi:layers-triple" : "lucide:dumbbell"}
                                            className="text-primary text-2xl"
                                        />
                                    );
                                }

                                const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);

                                if (isVideo) {
                                    return (
                                        <video
                                            src={url}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        />
                                    );
                                }

                                return (
                                    <img
                                        src={url}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('fallback-icon');
                                        }}
                                    />
                                );
                            })()}
                            {/* Fallback icon if image fails to load - handled via onError above but we need a backup element if we want strict replacement */}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base truncate">{exercise.name}</h3>
                                {exercise.esBiSerie && (
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        className="h-4 px-1 text-[8px] font-black uppercase"
                                    >
                                        B-S {exercise.biSerieGrupo}
                                    </Chip>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-${muscleGroupColors[exercise.muscleGroup as keyof typeof muscleGroupColors] || 'default'}/20 text-${muscleGroupColors[exercise.muscleGroup as keyof typeof muscleGroupColors] || 'default'}-600`}>
                                    {exercise.muscleGroup}
                                </span>
                                {exercise.esBiSerie && (
                                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                                        <Icon icon="mdi:link-variant" width={10} />
                                        Bi-serie
                                    </span>
                                )}
                            </div>

                            {showDetails && exercise.sets ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Icon icon="lucide:repeat" className="text-foreground-400" width={12} />
                                        <span className="text-[11px] font-bold text-foreground-600">{exercise.sets}×{exercise.reps}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Icon icon="lucide:clock" className="text-foreground-400" width={12} />
                                        <span className="text-[11px] font-bold text-foreground-600">{exercise.rest}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-tiny text-foreground-400 mt-1 font-medium italic">Toca para ver detalles</p>
                            )}
                        </div>
                        <div className="bg-primary/5 p-2 rounded-full">
                            <Icon icon="lucide:chevron-right" className="text-primary" width={16} />
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
};