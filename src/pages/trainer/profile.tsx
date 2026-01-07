import React from 'react';
import {
    Card,
    CardBody,
    Input,
    Button,
    Spinner,
    Tabs,
    Tab
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../../components/ui/page-header';
import { trainerApi, getEntrenadorId } from '../../services/api';
import { addToast } from '@heroui/react';
import { data } from 'framer-motion/client';

export const TrainerProfile: React.FC = () => {
    const trainerId = getEntrenadorId();
    const [loading, setLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            edad: 0,
            especialidad: '',
            password: ''
        }
    });

    React.useEffect(() => {
        if (trainerId) {
            fetchProfile();
        }
    }, [trainerId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await trainerApi.getProfile(trainerId!);
            reset({
                nombre: data.nombre || '',
                apellido: data.apellido || '',
                email: data.email || '',
                telefono: data.telefono || '',
                edad: data.edad || 0,
                especialidad: data.especialidad || '',
                password: '' // Keep empty initially
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo cargar la información del perfil',
                severity: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        if (!trainerId) return;

        try {
            setIsSubmitting(true);

            // The backend needs all fields including password
            // If password is empty, we should probably handle it or let the user know it's required
            if (!data.password) {
                // If the user didn't change the password, what should be sent?
                // The request says "Campo para contraseña (puede estar vacío inicialmente, pero se requiere enviar valor al backend)."
                // This implies if they don't change it, they must still send some value (maybe the current one or a placeholder)
                // However, usually passwords aren't sent back from GET.
                // I'll assume they need to type their current password or a new one.
            }

            await trainerApi.updateProfile(trainerId, data);

            addToast({
                title: 'Perfil actualizado',
                description: 'Tus cambios han sido guardados correctamente',
                severity: 'success'
            });

            // Clear password field after success
            reset({ ...data, password: '' });

        } catch (error: any) {
            console.error('Error updating profile:', error);
            addToast({
                title: 'Error',
                description: error.message || 'No se pudo actualizar el perfil. Verifique si el email ya existe.',
                severity: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" label="Cargando perfil..." />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader
                title="Mi Perfil"
                description="Gestiona tu información personal y profesional"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card className="md:col-span-1">
                    <CardBody className="flex flex-col items-center p-6 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <Icon icon="lucide:user" width={28} />
                            </div>
                            <p className="text-default-500 text-xs">Entrenador</p>
                        </div>
                        <div className="mt-2 w-full space-y-1">
                            {/* contenido del espacio */}
                        </div>
                    </CardBody>
                </Card>

                <Card className="md:col-span-2">
                    <CardBody className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Controller
                                    name="nombre"
                                    control={control}
                                    rules={{ required: 'El nombre es obligatorio' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Nombre"
                                            placeholder="Tu nombre"
                                            isInvalid={!!errors.nombre}
                                            errorMessage={errors.nombre?.message as string}
                                        />
                                    )}
                                />
                                <Controller
                                    name="apellido"
                                    control={control}
                                    rules={{ required: 'El apellido es obligatorio' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Apellido"
                                            placeholder="Tu apellido"
                                            isInvalid={!!errors.apellido}
                                            errorMessage={errors.apellido?.message as string}
                                        />
                                    )}
                                />
                            </div>

                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: 'El email es obligatorio',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Email inválido"
                                    }
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Email"
                                        placeholder="tu@email.com"
                                        type="email"
                                        isInvalid={!!errors.email}
                                        errorMessage={errors.email?.message as string}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Controller
                                    name="telefono"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Teléfono"
                                            placeholder="Ej: 123456789"
                                        />
                                    )}
                                />
                                <Controller
                                    name="edad"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Edad"
                                            type="number"
                                            placeholder="Tu edad"
                                            value={field.value.toString()}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    )}
                                />
                            </div>

                            <Controller
                                name="especialidad"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Especialidad"
                                        placeholder="Ej: Crossfit, Musculación..."
                                    />
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: 'La contraseña es requerida para guardar cambios' }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Contraseña"
                                        description="Ingrese su contraseña actual o una nueva para confirmar los cambios"
                                        type="password"
                                        isInvalid={!!errors.password}
                                        errorMessage={errors.password?.message as string}
                                        placeholder="********"
                                    />
                                )}
                            />

                            <div className="flex justify-end pt-4">
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
        </div>
    );
};
