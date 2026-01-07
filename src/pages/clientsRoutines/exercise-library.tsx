import React from 'react';
import { Tabs, Tab, Input, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Header } from '../../components/clientes-components/header';
import { ExerciseCard } from '../../components/clientes-components/exercise-card';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { exerciseApi } from '../../services/api';
import { Exercise } from '../../types';

const ExerciseLibraryPage = () => {
    const [selectedMuscleGroup, setSelectedMuscleGroup] = React.useState<string>("all");
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [exercises, setExercises] = React.useState<Exercise[]>([]);
    const [muscleGroups, setMuscleGroups] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [exercisesData, groupsData] = await Promise.all([
                    exerciseApi.getAll(),
                    exerciseApi.getMuscleGroups()
                ]);
                setExercises(exercisesData);
                setMuscleGroups(groupsData);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredExercises = exercises.filter(exercise => {
        const matchesSearch = exercise.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.grupoMuscular.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMuscleGroup = selectedMuscleGroup === "all" || exercise.grupoMuscular === selectedMuscleGroup;

        return matchesSearch && matchesMuscleGroup;
    });

    return (
        <PageTransition>
            <Header title="Biblioteca de Ejercicios" />

            <div className="p-4 pb-20">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-content1 p-4 rounded-2xl shadow-sm border border-divider space-y-4">
                        <Input
                            placeholder="¿Qué músculo quieres entrenar hoy?"
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            startContent={<Icon icon="lucide:search" className="text-primary" />}
                            variant="flat"
                            radius="lg"
                            isClearable
                            className="max-w-full"
                        />
                        <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                            <Tabs
                                aria-label="Grupos Musculares"
                                selectedKey={selectedMuscleGroup}
                                onSelectionChange={(key) => setSelectedMuscleGroup(key as string)}
                                variant="light"
                                color="primary"
                                radius="full"
                                size="sm"
                                classNames={{
                                    tabList: "gap-2",
                                    tab: "px-4 h-8 font-bold",
                                    cursor: "shadow-none"
                                }}
                            >
                                <Tab key="all" title="Todos" />
                                {muscleGroups.map((group) => (
                                    <Tab key={group} title={group} />
                                ))}
                            </Tabs>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Spinner size="lg" color="primary" />
                            <p className="text-foreground-500 font-medium animate-pulse">Consultando biblioteca...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredExercises.length > 0 ? (
                                filteredExercises.map((exercise, index) => (
                                    <ExerciseCard
                                        key={exercise.id}
                                        exercise={{
                                            id: exercise.id?.toString() || "",
                                            name: exercise.nombre,
                                            muscleGroup: exercise.grupoMuscular,
                                            image: "https://images.unsplash.com/photo-1534438327245-0451796ceb5d?w=200", // Placeholder
                                            sets: 0,
                                            reps: "N/A",
                                            rest: "0s"
                                        }}
                                        index={index}
                                        showDetails={false}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-content1/30 rounded-3xl border-2 border-dashed border-divider">
                                    <Icon icon="lucide:search-x" className="mx-auto text-5xl text-foreground-300 mb-4" />
                                    <p className="text-foreground-500 font-bold">No encontramos ese ejercicio</p>
                                    <p className="text-tiny text-foreground-400">Intenta con otros términos o grupo muscular</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default ExerciseLibraryPage;