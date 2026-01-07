import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/clientes-components/header';
import { PageTransition } from '../../components/clientes-components/page-transition';
import { Card, CardBody, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { clientApi, getClienteId } from '../../services/api';
import { RutinaResponseDTO } from '../../types';

const CalendarPage = () => {
    const navigate = useNavigate();
    const [routines, setRoutines] = React.useState<RutinaResponseDTO[]>([]);
    const [loading, setLoading] = React.useState(true);

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    React.useEffect(() => {
        const fetchRoutines = async () => {
            const clienteId = getClienteId();
            if (!clienteId) return;
            try {
                const data = await clientApi.getMyRoutines(clienteId);
                const filteredRoutines = data.filter(r => r.estado !== 'CANCELADA');
                setRoutines(filteredRoutines);
            } catch (error) {
                console.error("Error fetching routines:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutines();
    }, []);

    return (
        <PageTransition>
            <Header title="Mi Calendario" showBackButton />
            <div className="p-4 max-w-4xl mx-auto pb-24">
                <div className="bg-content1/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-divider">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Icon icon="lucide:calendar-days" className="text-primary" />
                        Plan Semanal
                    </h3>

                    <div className="space-y-4">
                        {daysOfWeek.map((dayName, index) => {
                            // Find which routine and day number matches this weekday name
                            let matchedDay: { routine: RutinaResponseDTO, dayNum: number, customName: string } | null = null;

                            for (const routine of routines) {
                                if (routine.estado !== 'Activa' && routine.estado !== 'ACTIVA') continue;

                                const desc = routine.descripcionDias || "";
                                const dayMap: Record<number, string> = {};
                                desc.split(';').forEach(part => {
                                    const [d, n] = part.split(':');
                                    if (d && n) dayMap[parseInt(d)] = n.trim();
                                });

                                // Check if any custom name matches the day name (Lunes, Martes, etc.)
                                Object.entries(dayMap).forEach(([dNum, n]) => {
                                    if (n.toLowerCase().includes(dayName.toLowerCase()) ||
                                        n.toLowerCase().includes(dayName.substring(0, 3).toLowerCase()) || // match Lun, Mar...
                                        dayName.toLowerCase().includes(n.toLowerCase())) {
                                        matchedDay = { routine, dayNum: parseInt(dNum), customName: n };
                                    }
                                });

                                // Fallback: If it's Monday-Friday and we have a corresponding Day 1-5, and no weekday names were used at all in the map
                                if (!matchedDay && index >= 1 && index <= 5) {
                                    const hasAnyWeekdayName = Object.values(dayMap).some(n =>
                                        daysOfWeek.some(dw => n.toLowerCase().includes(dw.toLowerCase()))
                                    );
                                    if (!hasAnyWeekdayName && dayMap[index]) {
                                        matchedDay = { routine, dayNum: index, customName: dayMap[index] };
                                    }
                                }

                                if (matchedDay) break;
                            }

                            return (
                                <div key={dayName} className="flex gap-4">
                                    <div className="w-24 shrink-0 text-right">
                                        <p className={`font-bold ${index === new Date().getDay() ? 'text-primary' : 'text-foreground-500'}`}>{dayName}</p>
                                    </div>
                                    <div className="relative pb-4 flex-1">
                                        {index < 6 && <div className="absolute left-[calc(-0.5rem-1px)] top-2 bottom-0 w-0.5 bg-divider"></div>}
                                        <div className={`absolute left-[-1.25rem] top-1.5 w-3 h-3 rounded-full border-2 border-background ${index === new Date().getDay() ? 'bg-primary' : 'bg-divider'}`}></div>

                                        {matchedDay ? (
                                            <Card
                                                isPressable
                                                onPress={() => navigate(`/cliente-app/routines/${matchedDay!.routine.id}`)}
                                                className="border-none bg-primary/5 shadow-sm hover:bg-primary/10 transition-colors"
                                            >
                                                <CardBody className="p-3">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold text-sm text-primary">
                                                                {matchedDay.customName}
                                                            </p>
                                                            <p className="text-tiny text-foreground-500">
                                                                {matchedDay.routine.nombre}
                                                            </p>
                                                        </div>
                                                        <Icon icon="lucide:chevron-right" className="text-primary/40" />
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ) : (
                                            <div className="p-4 rounded-2xl border border-dashed border-divider bg-default-50/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-default-100 italic">
                                                        <Icon icon="lucide:coffee" className="text-foreground-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-small text-foreground-400 font-bold italic tracking-tight">Descanso o actividad libre</p>
                                                        <p className="text-[10px] text-foreground-300">Día de recuperación</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 p-6 bg-secondary/10 rounded-2xl border border-secondary/20">
                    <div className="flex items-start gap-4">
                        <div className="bg-secondary/20 p-2 rounded-lg">
                            <Icon icon="lucide:info" className="text-secondary" />
                        </div>
                        <div>
                            <p className="font-bold text-secondary-700">Nota del entrenador</p>
                            <p className="text-sm text-secondary-600 mt-1">Este calendario es una guía sugerida. Puedes ajustar los días según tu disponibilidad, pero intenta mantener el orden de las sesiones.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default CalendarPage;
