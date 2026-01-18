import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Progress, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { clientApi, getClienteId, decodeToken, authApi } from '../../services/api';
import { RutinaResponseDTO, ProgresoEjercicioResponseDTO, RutinaEjercicioResponseDTO, RutinaResumenResponseDTO } from '../../types';
import { Header } from '../../components/clientes-components/header';

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = React.useState("Usuario");
    const [todayRoutine, setTodayRoutine] = React.useState<RutinaResponseDTO | null>(null);
    const [summary, setSummary] = React.useState<RutinaResumenResponseDTO | null>(null);
    const [allRoutines, setAllRoutines] = React.useState<RutinaResponseDTO[]>([]);
    const [progressList, setProgressList] = React.useState<ProgresoEjercicioResponseDTO[]>([]);
    const [actualDay, setActualDay] = React.useState<number>(1);
    const [loading, setLoading] = React.useState(true);

    const [stats, setStats] = React.useState({
        completedWorkouts: 0,
        totalExercises: 0,
        averageWeight: 0,
        streakDays: 0
    });

    React.useEffect(() => {
        const fetchData = async () => {
            const clienteId = getClienteId();
            const token = decodeToken();
            if (token && token.sub) {
                setUserName(token.sub.split('@')[0]);
            }

            if (!clienteId) {
                setLoading(false);
                return;
            }

            try {
                const [routinesData, allProgressData, day, routineSummary] = await Promise.all([
                    clientApi.getMyRoutines(clienteId),
                    clientApi.getMyProgress(clienteId),
                    clientApi.getActualDay(clienteId),
                    clientApi.getRutinaActualResumen(clienteId).catch(() => null)
                ]);

                // 1. Filtrar rutinas validas
                const filteredRoutines = routinesData.filter(r =>
                    r.estado !== 'CANCELADA' && r.estado !== 'PENDIENTE_PAGO'
                );

                setAllRoutines(filteredRoutines);
                setActualDay(day);
                setSummary(routineSummary);

                // Configurar rutina actual basada en el resumen
                if (routineSummary) {
                    const tempRoutine: RutinaResponseDTO = {
                        id: routineSummary.rutinaId,
                        nombre: routineSummary.nombreRutina,
                        fechaInicio: "",
                        fechaFin: "",
                        estado: "Activa",
                        clienteId: clienteId,
                        enfoque: ""
                    };
                    setTodayRoutine(tempRoutine);
                } else {
                    setTodayRoutine(null);
                }

                const validRoutineIds = filteredRoutines.map(r => r.id);
                const routinesExercisesPromises = validRoutineIds.map(rid =>
                    clientApi.getRoutineExercises(clienteId, rid)
                );
                const routinesExercisesResults = await Promise.all(routinesExercisesPromises);

                const validRutinaEjercicioIds = new Set<number>();
                routinesExercisesResults.flat().forEach(ex => {
                    if (ex && ex.id) {
                        validRutinaEjercicioIds.add(ex.id);
                    }
                });

                const filteredProgress = allProgressData.filter(p =>
                    validRutinaEjercicioIds.has(p.rutinaEjercicioId)
                );

                setProgressList(filteredProgress);

                const uniqueDates = new Set(filteredProgress.map(p => p.fecha));
                const totalEx = filteredProgress.length;
                const avgW = filteredProgress.length > 0
                    ? (filteredProgress.reduce((acc, curr) => acc + (curr.peso || curr.kg || 0), 0) / filteredProgress.length).toFixed(1)
                    : 0;

                setStats({
                    completedWorkouts: uniqueDates.size,
                    totalExercises: totalEx,
                    averageWeight: Number(avgW),
                    streakDays: routineSummary?.rachaActualDias || 0
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Preparar datos para el gráfico de peso (últimos 10 registros)
    const chartData = progressList
        .slice(-10)
        .map(p => ({
            date: new Date(p.fecha).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
            peso: p.peso || 0
        }));

    const getLoadProgress = () => {
        if (!summary) return null;
        const diff = summary.pesoPromedioSemana - summary.pesoPromedioSemanaAnterior;
        if (diff > 0) return {
            text: "Estás levantando más peso que la semana pasada",
            icon: "lucide:trending-up",
            color: "text-success",
            bg: "bg-success/10",
            border: "border-success/20"
        };
        if (diff < 0) return {
            text: "Levantaste un poco menos de peso esta semana",
            icon: "lucide:trending-down",
            color: "text-warning",
            bg: "bg-warning/10",
            border: "border-warning/20"
        };
        return {
            text: "Mantuviste tu nivel de fuerza estable",
            icon: "lucide:minus",
            color: "text-foreground-500",
            bg: "bg-default-100",
            border: "border-divider"
        };
    };

    const loadInfo = getLoadProgress();

    return (
        <PageTransition>
            <Header title={`¡Hola, ${userName}!`} />

            {/* Main Action Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-8 px-4 border-b border-divider/50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                                Tu entrenamiento <br />
                                <span className="text-primary italic">está listo para hoy.</span>
                            </h2>
                            {todayRoutine ? (
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-4 bg-white/40 dark:bg-content1/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
                                        <div className="bg-primary/20 p-3 rounded-xl">
                                            <Icon icon="lucide:calendar" className="text-primary text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-tiny font-bold text-foreground-400 uppercase tracking-widest">Día {actualDay} • Sugerido para hoy</p>
                                            <h3 className="font-bold text-xl">{todayRoutine.nombre}</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            color="primary"
                                            size="lg"
                                            onPress={() => navigate(`/cliente-app/routines/${todayRoutine.id}`)}
                                            endContent={<Icon icon="lucide:play" className="ml-1" />}
                                            className="font-bold shadow-xl shadow-primary/30 h-14 px-8"
                                        >
                                            Empezar ahora
                                        </Button>
                                        <Button
                                            variant="bordered"
                                            size="lg"
                                            color="default"
                                            startContent={<Icon icon="lucide:arrow-left" width={18} />}
                                            onPress={() => navigate('/cliente-app/routines')}
                                            className="font-semibold h-14 px-6 border-divider"
                                        >
                                            Ver todas
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-content1/50 backdrop-blur-sm rounded-2xl border border-divider">
                                    <p className="text-foreground-600 font-medium">¡Hoy toca descansar! Aprovechá para recuperarte bien. 💪</p>
                                </div>
                            )}
                        </div>

                        {/* Weekly Load Card */}
                        <div className="w-full md:w-80 shrink-0">
                            <Card className="bg-content1/40 backdrop-blur-xl shadow-2xl border-white/20 dark:border-white/5">
                                <CardBody className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg">Tu Carga</h3>
                                        <Icon icon="lucide:activity" className="text-primary text-xl" />
                                    </div>

                                    {loadInfo && (
                                        <div className={`p-4 rounded-2xl ${loadInfo.bg} ${loadInfo.border} border border-dashed text-center space-y-2`}>
                                            <Icon icon={loadInfo.icon} className={`mx-auto text-2xl ${loadInfo.color}`} />
                                            <p className={`text-sm font-bold leading-tight ${loadInfo.color}`}>
                                                {loadInfo.text}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-tiny font-bold uppercase tracking-wider text-foreground-400 font-mono">Meta Semanal</span>
                                            <span className="text-tiny font-black text-primary">
                                                {summary ? Math.min(100, Math.round((summary.diasEntrenadosSemana / summary.diasPlanificadosSemana) * 100)) : 0}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={summary ? (summary.diasEntrenadosSemana / summary.diasPlanificadosSemana) * 100 : 0}
                                            color="primary"
                                            size="sm"
                                            className="h-2"
                                            aria-label="Meta semanal"
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-10 px-4">
                <div className="max-w-5xl mx-auto space-y-10">

                    {/* Top 3 Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-content1 shadow-sm border-divider">
                            <CardBody className="p-6 flex flex-row items-center gap-5">
                                <div className="bg-success/10 p-4 rounded-2xl flex items-center justify-center">
                                    <Icon icon="lucide:calendar-days" className="text-success text-2xl" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-tiny font-bold text-foreground-500 uppercase tracking-widest">Constancia</p>
                                    <p className="text-2xl font-black">
                                        {summary?.diasEntrenadosSemana || 0} <span className="text-foreground-300 font-medium">/ {summary?.diasPlanificadosSemana || 0}</span>
                                    </p>
                                    <p className="text-tiny text-foreground-400 font-medium">días entrenados</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-content1 shadow-sm border-divider">
                            <CardBody className="p-6 flex flex-row items-center gap-5">
                                <div className="bg-danger/10 p-4 rounded-2xl flex items-center justify-center">
                                    <Icon icon="lucide:flame" className="text-danger text-2xl" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-tiny font-bold text-foreground-500 uppercase tracking-widest">Racha Actual</p>
                                    <p className="text-2xl font-black">{summary?.rachaActualDias || 0} <span className="text-foreground-300 font-medium">días</span></p>
                                    <p className="text-tiny text-foreground-400 font-medium">¡Seguí así! 🔥</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-content1 shadow-sm border-divider">
                            <CardBody className="p-6 flex flex-row items-center gap-5">
                                <div className="bg-primary/10 p-4 rounded-2xl flex items-center justify-center">
                                    <Icon icon="lucide:dumbbell" className="text-primary text-2xl" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-tiny font-bold text-foreground-500 uppercase tracking-widest">Rutinas</p>
                                    <p className="text-2xl font-black">{summary?.rutinasAsignadas || 0} <span className="text-foreground-300 font-medium">activas</span></p>
                                    <p className="text-tiny text-foreground-400 font-medium">en tu plan actual</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Progress Charts & History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* History List */}
                        <Card className="bg-content1/60 border-divider">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Últimos logrados</h3>
                                    <Button size="sm" variant="light" color="primary" onPress={() => navigate('/cliente-app/history')}>
                                        Ver todo
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {progressList.length > 0 ? (
                                        progressList.slice(-5).reverse().map((exercise, index) => (
                                            <div key={index} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-default-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <Icon icon="lucide:check-circle-2" className="text-success text-xl" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{exercise.ejercicioNombre}</p>
                                                        <p className="text-tiny text-foreground-400">
                                                            {(() => {
                                                                const [year, month, day] = exercise.fecha.split('-');
                                                                return `${day}/${month}/${year}`;
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Chip size="sm" variant="shadow" color="primary" className="font-bold">
                                                    {exercise.peso || exercise.kg || 0} kg
                                                </Chip>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center space-y-2">
                                            <Icon icon="lucide:info" className="mx-auto text-3xl text-foreground-300" />
                                            <p className="text-foreground-400 font-medium">Aún no registraste ejercicios esta semana.</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Weight Chart */}
                        <Card className="bg-content1/60 border-divider">
                            <CardBody className="p-6">
                                <h3 className="text-lg font-bold mb-6">Tendencia de Fuerza</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData.length > 0 ? chartData : [{ date: '...', peso: 0 }]}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--heroui-divider)" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10, fill: 'var(--heroui-foreground-400)' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: 'var(--heroui-foreground-400)' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'var(--heroui-content2)', opacity: 0.5 }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--heroui-content1)',
                                                    border: '1px solid var(--heroui-divider)',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                                }}
                                            />
                                            <Bar
                                                dataKey="peso"
                                                fill="var(--heroui-primary)"
                                                radius={[6, 6, 6, 6]}
                                                barSize={32}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-divider">
                                    <div className="text-center">
                                        <p className="text-tiny font-bold text-foreground-400 uppercase">Actual</p>
                                        <p className="text-lg font-black">{summary?.pesoPromedioSemana?.toFixed(1) || 0} kg</p>
                                    </div>
                                    <div className="h-8 w-px bg-divider"></div>
                                    <div className="text-center">
                                        <p className="text-tiny font-bold text-foreground-400 uppercase">Anterior</p>
                                        <p className="text-lg font-black text-foreground-400">{summary?.pesoPromedioSemanaAnterior?.toFixed(1) || 0} kg</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Card className="bg-content1 mb-8">
                        <CardBody className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Próximos entrenamientos</h3>
                                <Button
                                    variant="flat"
                                    color="primary"
                                    size="sm"
                                    endContent={<Icon icon="lucide:calendar" />}
                                    onPress={() => navigate('/cliente-app/calendar')}
                                    className="font-semibold"
                                >
                                    Ver calendario
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {allRoutines.slice(0, 3).map((routine, index) => (
                                    <Card
                                        key={index}
                                        isPressable
                                        onPress={() => navigate(`/cliente-app/routines/${routine.id}`)}
                                        className="border border-divider shadow-sm hover:border-primary/50 transition-colors"
                                    >
                                        <CardBody className="p-0">
                                            <div className="flex items-center">
                                                <div className="w-16 h-16 shrink-0 bg-primary/10 flex items-center justify-center">
                                                    <Icon icon="lucide:dumbbell" className="text-primary text-xl" />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-bold text-small">{routine.nombre}</h4>
                                                    <p className="text-tiny text-foreground-500 font-medium uppercase tracking-tighter">{routine.enfoque}</p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>

                            <Card className="bg-primary shadow-xl shadow-primary/20 border-none overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-white font-black text-xl">Lleva tu entrenamiento al siguiente nivel</h3>
                                            <p className="text-white/80 font-medium">Accede a planes profesionales diseñados para tus metas.</p>
                                        </div>
                                        <Button
                                            className="bg-white text-primary font-black px-8 h-12 shadow-lg hover:scale-105 transition-transform"
                                            radius="full"
                                            onPress={() => window.open('https://wa.me/your-number', '_blank')}
                                        >
                                            PAGAR RUTINA
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </CardBody>
                    </Card>
                </div>
            </section>
        </PageTransition>
    );
};

export default HomePage;