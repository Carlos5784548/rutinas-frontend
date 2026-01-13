import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NotFound } from './pages/NotFound';
import { MainLayout } from './components/layout/main-layout';
import { Dashboard } from './pages/dashboard';
import { AdminDashboard } from './pages/admin-dashboard';
import { EntrenadorDashboard } from './pages/entrenador-dashboard';
import { ClienteDashboard } from './pages/cliente-dashboard';
import { UserList } from './pages/users/user-list';
import { UserCreate } from './pages/users/user-create';
import { ClientList } from './pages/clients/client-list';
import { ClientCreate } from './pages/clients/client-create';
import { ClientEdit } from './pages/clients/ClientEdit';
import { ClientDetail } from './pages/clients/client-detail';
import { RoutineList } from './pages/routines/routine-list';
import { RoutineCreate } from './pages/routines/routine-create';
import { RoutineDetail } from './pages/routines/routine-detail';
import { ExerciseList } from './pages/exercises/exercise-list';
import { ExerciseCreate } from './pages/exercises/exercise-create';
import { ExerciseEdit } from './pages/exercises/exercise-edit';
import { Login } from './pages/auth/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getUserRole, checkBackendHealth } from './services/api';
import { ServerStartup } from './components/startup/ServerStartup';
import { TrainerProfile } from './pages/trainer/profile';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// New Client Interface pages
import HomePage from './pages/clientsRoutines/home';
import RoutinesPage from './pages/clientsRoutines/routines';
import RoutineDetailPage from './pages/clientsRoutines/routine-detail';
import TrainingModePage from './pages/clientsRoutines/training-mode';
import ExerciseLibraryPage from './pages/clientsRoutines/exercise-library';
import ExerciseDetailPage from './pages/clientsRoutines/exercise-detail';
import HistoryPage from './pages/clientsRoutines/history';
import CalendarPage from './pages/clientsRoutines/calendar';
import { BottomNavigation } from './components/clientes-components/bottom-navigation';
import { RoutineEdit } from './pages/routines/RoutineEdit';
import PaymentSuccessPage from './pages/clientsRoutines/payment-success';
import { PagoList } from './pages/pagos/pago-list';
import { BankDetailsSettings } from './components/pagos/BankDetailsSettings';

// Component to redirect to role-specific dashboard
const RoleBasedDashboard: React.FC = () => {
  const role = getUserRole();

  console.log('RoleBasedDashboard - Detected role:', role); // Debug log

  // If no valid role is detected, clear any invalid token and redirect to login
  if (!role) {
    console.log('No valid role found, clearing auth and redirecting to login'); // Debug log
    // Clear invalid token
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const isPaymentRedirect = queryParams.has('collection_status') || queryParams.has('payment_id');

  switch (role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'ENTRENADOR':
      return <Navigate to="/entrenador" replace />;
    case 'CLIENTE':
      if (isPaymentRedirect) {
        return <Navigate to={{ pathname: "/cliente-app/payment-success", search }} replace />;
      }
      return <Navigate to="/cliente-app" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const TrainerRegister: React.FC = () => {
  return <div>Registro de entrenador (componente provisional)</div>;
};

function App() {
  const [isServerReady, setIsServerReady] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: any;

    const checkServer = async () => {
      const start = Date.now();

      // If server doesn't respond in 500ms, show the wakeup screen
      // This prevents flashing the screen for users with warm servers
      timer = setTimeout(() => {
        setShowLoading(true);
      }, 500);

      await checkBackendHealth();

      clearTimeout(timer);

      const elapsed = Date.now() - start;

      // Add a small delay for smooth transition if it was showing
      if (elapsed > 500) {
        setTimeout(() => setIsServerReady(true), 500);
      } else {
        setIsServerReady(true);
      }
    };

    checkServer();
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  if (!isServerReady) {
    if (showLoading) return <ServerStartup />;
    return <div className="min-h-screen bg-zinc-950" />; // Empty dark screen while checking < 500ms
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Role-specific dashboard routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
      </Route>

      <Route path="/entrenador" element={
        <ProtectedRoute allowedRoles={['ENTRENADOR']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<EntrenadorDashboard />} />
        <Route path="perfil" element={<TrainerProfile />} />
      </Route>

      <Route path="/cliente" element={<Navigate to="/cliente-app" replace />} />

      {/* New Client Mobile-friendly interface */}
      <Route path="/cliente-app/*" element={
        <ProtectedRoute allowedRoles={['CLIENTE']}>
          <ClientApp />
        </ProtectedRoute>
      } />

      {/* Protected shared routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<RoleBasedDashboard />} />

        {/* User management - Admin only */}
        <Route path="usuarios">
          <Route index element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserList />
            </ProtectedRoute>
          } />
          <Route path="crear" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserCreate />
            </ProtectedRoute>
          } />
        </Route>

        {/* Payments - Admin and Entrenador */}
        <Route path="pagos">
          <Route index element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <PagoList />
            </ProtectedRoute>
          } />
        </Route>

        {/* Bank Details Settings - Entrenador */}
        <Route path="ajustes-pago">
          <Route index element={
            <ProtectedRoute allowedRoles={['ENTRENADOR']}>
              <div className="p-4 md:p-8">
                <BankDetailsSettings />
              </div>
            </ProtectedRoute>
          } />
        </Route>

        {/* Client management - Admin and Entrenador */}
        <Route path="clientes">
          <Route index element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ClientList />
            </ProtectedRoute>
          } />
          <Route path="crear" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ClientCreate />
            </ProtectedRoute>
          } />
          <Route path=":id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ClientDetail />
            </ProtectedRoute>
          } />
          <Route path=":id/editar" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ClientEdit />
            </ProtectedRoute>
          } />
        </Route>

        {/* Routines - Admin, Entrenador, and Cliente can view */}
        <Route path="rutinas">
          <Route index element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR', 'CLIENTE']}>
              <RoutineList />
            </ProtectedRoute>
          } />
          <Route path="crear" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <RoutineCreate />
            </ProtectedRoute>
          } />
          <Route path=":id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR', 'CLIENTE']}>
              <RoutineDetail />
            </ProtectedRoute>
          } />
          <Route path=":id/editar" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <RoutineEdit />
            </ProtectedRoute>
          } />
        </Route>

        {/* Exercises - Admin and Entrenador */}
        <Route path="ejercicios">
          <Route index element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ExerciseList />
            </ProtectedRoute>
          } />
          <Route path="crear" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ExerciseCreate />
            </ProtectedRoute>
          } />
          <Route path=":id/editar" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']}>
              <ExerciseEdit />
            </ProtectedRoute>
          } />
        </Route>

        <Route
          path="/clientes/entrenadores"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TrainerRegister />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// Wrapper for the new client interface
const ClientApp: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route index element={<HomePage />} />
            <Route path="routines" element={<RoutinesPage />} />
            <Route path="routines/:id" element={<RoutineDetailPage />} />
            <Route path="training/:routineId/:dayId" element={<TrainingModePage />} />
            <Route path="exercises" element={<ExerciseLibraryPage />} />
            <Route path="exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default App;