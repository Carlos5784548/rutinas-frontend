import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  Button,
  Spinner,
  Checkbox,
  addToast,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { authApi, getUserRole } from '../../services/api';

import logoRutinasFull from '../../assets/logo-rutinas-pro-full.png';

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Si ya está autenticado
  React.useEffect(() => {
    const role = getUserRole();
    if (role) {
      switch (role) {
        case 'ADMIN':
          navigate('/admin', { replace: true });
          break;
        case 'ENTRENADOR':
          navigate('/entrenador', { replace: true });
          break;
        case 'CLIENTE':
          navigate('/cliente', { replace: true });
          break;
      }
    }
  }, [navigate]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      await authApi.login(data.email, data.password);

      const role = getUserRole();

      addToast({
        title: 'Sesión iniciada',
        description: 'Bienvenido de nuevo',
        severity: 'success',
      });

      switch (role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'ENTRENADOR':
          navigate('/entrenador');
          break;
        case 'CLIENTE':
          navigate('/cliente');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data || 'Credenciales inválidas. Por favor intenta nuevamente.';

      addToast({
        title: 'Error de acceso',
        description: typeof errorMessage === 'string' ? errorMessage : 'Error al iniciar sesión',
        severity: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />

      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl shadow-black/20 border border-white/20 p-8 relative overflow-hidden z-10">

        {/* Subtle top decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-secondary/80" />

        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={logoRutinasFull}
            alt="Rutinas Pro"
            className="h-12 w-auto object-contain mb-6"
          />
          <h1 className="text-xl font-bold text-foreground">
            Entrá a Rutinas Pro
          </h1>
          <p className="text-default-500 text-sm mt-1">
            Accede a tus entrenamientos personalizados
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* EMAIL */}
          <div className="space-y-1.5">
            <Controller
              name="email"
              control={control}
              rules={{ required: 'El email es requerido' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  type="email"
                  label="Correo Electrónico"
                  placeholder="nombre@ejemplo.com"
                  variant="bordered"
                  labelPlacement="outside"
                  classNames={{
                    inputWrapper: "bg-default-50/50 group-data-[focus=true]:bg-white transition-colors border-default-200",
                    label: "font-medium text-default-700 text-sm",
                    input: "text-sm"
                  }}
                  startContent={<Icon icon="mdi:email-outline" className="text-default-400 pointer-events-none flex-shrink-0" width={18} />}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <Controller
              name="password"
              control={control}
              rules={{ required: 'La contraseña es requerida' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Contraseña"
                  placeholder="••••••••"
                  variant="bordered"
                  labelPlacement="outside"
                  classNames={{
                    inputWrapper: "bg-default-50/50 group-data-[focus=true]:bg-white transition-colors border-default-200",
                    label: "font-medium text-default-700 text-sm",
                    input: "text-sm"
                  }}
                  type={showPassword ? 'text' : 'password'}
                  startContent={<Icon icon="mdi:lock-outline" className="text-default-400 pointer-events-none flex-shrink-0" width={18} />}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none text-default-400 hover:text-default-600 transition-colors"
                    >
                      <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width={18} />
                    </button>
                  }
                />
              )}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-1">
            {/* Removed Remember Me to clean up UI as per minimalist request, 
                 or keeping it very subtle if needed. 
                 Request said: "Email, Password, Button, Link, Optional Footer"
                 I'll keep "Remember me" but make it minimal as distinct from forgot password 
             */}
            {/* Actually user request list didn't explicitly forbid 'Remember', 
             but typically cleaner forms might hide it or keep it small. 
             I'll Include it small for UX standard. */}

            <Controller
              name="remember"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${value ? 'bg-primary border-primary text-white' : 'border-default-400 bg-transparent group-hover:border-default-500'}`}>
                    {value && <Icon icon="mdi:check" width={12} />}
                    <input type="checkbox" className="hidden" onChange={onChange} checked={value} {...field} />
                  </div>
                  <span className="text-xs text-default-500 group-hover:text-default-700 font-medium select-none">Recordarme</span>
                </label>
              )}
            />

            <Link
              to="/reset-password"
              className="text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              ¿Olvidaste tu clave?
            </Link>
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            color="primary"
            size="md"
            className="w-full font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all text-sm h-11"
            isLoading={loading}
            spinner={<Spinner size="sm" color="current" />}
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center pt-6 border-t border-dashed border-default-100">
          <p className="text-default-400 text-xs">
            ¿Querés empezar a entrenar?{' '}
            <a href="#" className="text-foreground font-semibold hover:underline block mt-1 sm:inline sm:mt-0">
              Contactá a un entrenador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
