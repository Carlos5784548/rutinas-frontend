import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardBody, Input, Button, Spinner } from '@heroui/react';
import { addToast } from '@heroui/react';
import { userApi } from '../../services/api';
import { PageHeader } from '../../components/ui/page-header';

type FormValues = {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  especialidad?: string;
};

const TrainerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: { nombre: '', email: '', password: '', telefono: '', especialidad: '' }
  });
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      // Envia rol fijo 'ENTRENADOR' al backend protegido (usa token ADMIN)
      await userApi.create({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        especialidad: data.especialidad,
        rol: 'ENTRENADOR'
      } as any);
      addToast({ title: 'Registro completado', description: 'Entrenador registrado correctamente', severity: 'success' });
      reset();
      navigate('/'); // o la ruta que prefieras
    } catch (err: any) {
      console.error('Error registering trainer:', err);
      addToast({ title: 'Error', description: err?.response?.data || 'No se pudo registrar', severity: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Registro Entrenador" description="Crear cuenta de entrenador (solo ADMIN)" />
      <Card className="max-w-md mx-auto">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: 'Nombre requerido' }}
              render={({ field }) => <Input placeholder="Nombre" {...field} />}
            />
            <div className="h-3" />
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Email requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } }}
              render={({ field }) => <Input placeholder="Email" {...field} />}
            />
            <div className="h-3" />
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Contraseña requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
              render={({ field }) => <Input type="password" placeholder="Contraseña" {...field} />}
            />
            <div className="h-3" />
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => <Input placeholder="Teléfono (opcional)" {...field} />}
            />
            <div className="h-3" />
            <Controller
              name="especialidad"
              control={control}
              render={({ field }) => <Input placeholder="Especialidad (opcional)" {...field} />}
            />
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={submitting} color="primary">
                {submitting ? <Spinner size="sm" /> : 'Registrar Entrenador'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default TrainerRegister;