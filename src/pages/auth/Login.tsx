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
import loginHero from '../../assets/images/login-hero.png';

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
      addToast({
        title: 'Error de acceso',
        description: err?.response?.data || 'Credenciales inválidas. Por favor intenta nuevamente.',
        severity: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Hero Image */}
      <div className="relative hidden lg:block h-full overflow-hidden bg-content1/50">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <img
          src={loginHero}
          alt="Fitness Training"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-10 left-10 z-20 max-w-lg">
          <blockquote className="text-3xl font-bold text-white leading-tight mb-4">
            "La única manera de definir tus límites es ir más allá de ellos."
          </blockquote>
          <p className="text-default-300 text-lg">
            Tu viaje hacia una mejor versión comienza aquí.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        {/* Decor for mobile/single column */}
        <div className="absolute top-0 right-0 p-8">
          {/* Logo placeholder or branding could go here */}
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              Bienvenido
            </h1>
            <p className="text-default-500 text-lg">
              Ingresa tus credenciales para acceder a tu panel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <Controller
                name="email"
                control={control}
                rules={{ required: 'El email es requerido' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Correo Electrónico"
                    placeholder="ejemplo@correo.com"
                    variant="bordered"
                    labelPlacement="outside"
                    classNames={{
                      inputWrapper: "bg-default-50 group-data-[focus=true]:bg-default-100",
                    }}
                    startContent={<Icon icon="mdi:email-outline" className="text-default-400 pointer-events-none flex-shrink-0" />}
                    isInvalid={fieldState.invalid}
                    errorMessage="Por favor ingresa un correo válido"
                  />
                )}
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
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
                      inputWrapper: "bg-default-50 group-data-[focus=true]:bg-default-100",
                    }}
                    type={showPassword ? 'text' : 'password'}
                    startContent={<Icon icon="mdi:lock-outline" className="text-default-400 pointer-events-none flex-shrink-0" />}
                    isInvalid={fieldState.invalid}
                    errorMessage="La contraseña es requerida"
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none text-default-400 hover:text-default-600"
                      >
                        {showPassword ? (
                          <Icon icon="mdi:eye-off" width={20} />
                        ) : (
                          <Icon icon="mdi:eye" width={20} />
                        )}
                      </button>
                    }
                  />
                )}
              />
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between pt-2">
              <Controller
                name="remember"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Checkbox
                    {...field}
                    isSelected={value}
                    onValueChange={onChange}
                    classNames={{ label: "text-small text-default-500" }}
                  >
                    Recordarme
                  </Checkbox>
                )}
              />

              <Link
                to="/reset-password"
                className="text-small font-medium text-primary hover:text-primary-600 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-primary/40"
              isLoading={loading}
              spinner={<Spinner size="sm" color="white" />}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* FOOTER */}
          <div className="pt-4 text-center">
            <p className="text-default-500 text-sm">
              ¿Aún no tienes cuenta?{' '}
              <span className="text-foreground font-medium">
                Contacta a tu entrenador.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
