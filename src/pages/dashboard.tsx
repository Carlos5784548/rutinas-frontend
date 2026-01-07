import React from 'react';
import { Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/page-header';
import { clientApi, routineApi, exerciseApi, userApi } from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    users: 0,
    clients: 0,
    routines: 0,
    exercises: 0
  });
  
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [users, clients, routines, exercises] = await Promise.all([
          userApi.getAll(),
          clientApi.getAll(),
          routineApi.getAll(),
          exerciseApi.getAll()
        ]);
        
        setStats({
          users: users.length,
          clients: clients.length,
          routines: routines.length,
          exercises: exercises.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const statCards = [
    {
      title: 'Usuarios',
      value: stats.users,
      icon: 'lucide:users',
      color: 'bg-primary-100 text-primary-600',
      path: '/usuarios'
    },
    {
      title: 'Clientes',
      value: stats.clients,
      icon: 'lucide:user',
      color: 'bg-success-100 text-success-600',
      path: '/clientes'
    },
    {
      title: 'Rutinas',
      value: stats.routines,
      icon: 'lucide:clipboard-list',
      color: 'bg-warning-100 text-warning-600',
      path: '/rutinas'
    },
    {
      title: 'Ejercicios',
      value: stats.exercises,
      icon: 'lucide:dumbbell',
      color: 'bg-secondary-100 text-secondary-600',
      path: '/ejercicios'
    }
  ];
  
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Bienvenido al sistema de gestión de entrenamiento" 
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="flex items-center gap-4 p-6">
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <Icon icon={stat.icon} className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-default-600 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-semibold">{stat.value}</h3>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Accesos Rápidos</h2>
          </CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/usuarios/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
              <div className="bg-primary-100 rounded-full p-2">
                <Icon icon="lucide:user-plus" className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium">Crear Usuario</h3>
                <p className="text-sm text-default-600">Añadir nuevo usuario al sistema</p>
              </div>
            </Link>
            
            <Link to="/clientes/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
              <div className="bg-success-100 rounded-full p-2">
                <Icon icon="lucide:user-plus" className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <h3 className="font-medium">Crear Cliente</h3>
                <p className="text-sm text-default-600">Registrar nuevo cliente</p>
              </div>
            </Link>
            
            <Link to="/rutinas/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
              <div className="bg-warning-100 rounded-full p-2">
                <Icon icon="lucide:clipboard-plus" className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <h3 className="font-medium">Crear Rutina</h3>
                <p className="text-sm text-default-600">Diseñar nueva rutina de entrenamiento</p>
              </div>
            </Link>
            
            <Link to="/ejercicios/crear" className="flex items-center gap-3 p-4 rounded-md border border-default-200 hover:bg-default-50 transition-colors">
              <div className="bg-secondary-100 rounded-full p-2">
                <Icon icon="lucide:plus-circle" className="h-5 w-5 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-medium">Crear Ejercicio</h3>
                <p className="text-sm text-default-600">Añadir nuevo ejercicio</p>
              </div>
            </Link>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Información del Sistema</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3 p-2">
              <Icon icon="lucide:info" className="h-5 w-5 text-primary-500" />
              <div>
                <h3 className="font-medium">Sistema de Gestión de Entrenamiento</h3>
                <p className="text-sm text-default-600">Versión 1.0.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2">
              <Icon icon="lucide:check-circle" className="h-5 w-5 text-success-500" />
              <div>
                <h3 className="font-medium">Estado del Servidor</h3>
                <p className="text-sm text-success-600">Conectado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2">
              <Icon icon="lucide:calendar" className="h-5 w-5 text-default-600" />
              <div>
                <h3 className="font-medium">Fecha Actual</h3>
                <p className="text-sm text-default-600">{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};