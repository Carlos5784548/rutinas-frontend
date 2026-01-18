import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  User,
  Client,
  Routine,
  Exercise,
  RoutineExercise,
  UserFilter,
  ExerciseFilter,
  RoutineFilter,
  PaginatedResponse,
  ClienteRequestDTO,
  RutinaRequestDTO,
  EjercicioRequestDTO,
  RutinaEjercicioRequestDTO,
  EntrenadorRequestDTO,
  EntrenadorResponseDTO,
  RutinaResponseDTO,
  RutinaEjercicioResponseDTO,
  ProgresoEjercicioRequestDTO,
  ProgresoEjercicioResponseDTO,
  RutinaResumenResponseDTO
} from '../types';
import { addToast } from '@heroui/react';
import { pagosApi } from './pagos.service';

export { pagosApi };

const API_URL = 'https://rutinas-backend.onrender.com/api';
const AUTH_URL = 'https://rutinas-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const apiClient = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Error handling interceptor for main api
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage = 'Ha ocurrido un error desconocido';
    let errorTitle = 'Error';
    let errorDetails = '';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          errorTitle = 'Error de validación';
          errorMessage = data.message || 'Los datos enviados no son válidos';
          if (data.errors && Array.isArray(data.errors)) {
            errorDetails = data.errors.map((err: any) => err.defaultMessage || err.message).join(', ');
          }
          break;
        case 401:
          errorTitle = 'No autorizado';
          errorMessage = 'No tiene permisos para realizar esta acción';
          setAuthToken(undefined);
          window.location.href = '/login';
          break;
        case 403:
          errorTitle = 'Acceso denegado';
          errorMessage = 'No tiene permisos suficientes para acceder a este recurso';
          break;
        case 404:
          errorTitle = 'No encontrado';
          errorMessage = 'El recurso solicitado no existe';
          break;
        case 409:
          errorTitle = 'Conflicto';
          errorMessage = data.message || 'Ya existe un recurso con estos datos';
          break;
        case 500:
          errorTitle = 'Error del servidor';
          errorMessage = 'Ha ocurrido un error en el servidor';
          break;
        default:
          errorTitle = `Error ${status}`;
          errorMessage = data.message || 'Ha ocurrido un error en la solicitud';
      }
    } else if (error.request) {
      errorTitle = 'Error de conexión';
      errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else {
      errorTitle = 'Error de solicitud';
      errorMessage = error.message || 'Error al procesar la solicitud';
    }

    console.error('API Error:', {
      title: errorTitle,
      message: errorMessage,
      details: errorDetails,
      originalError: error
    });

    if (error.code === 'ECONNABORTED' || !error.response) {
      addToast({
        title: errorTitle,
        description: errorMessage,
        severity: 'danger'
      });
    }

    return Promise.reject({
      title: errorTitle,
      message: errorMessage,
      details: errorDetails,
      originalError: error,
      status: error.response?.status
    });
  }
);

export const userApi = {
  getAll: async (filter?: UserFilter): Promise<User[]> => {
    const params = filter ? { ...filter } : {};
    const response: AxiosResponse<User[]> = await api.get('/usuarios', { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (user: User): Promise<User> => {
    const response: AxiosResponse<User> = await api.post('/usuarios', user);
    return response.data;
  },

  update: async (id: number, user: User): Promise<User> => {
    const response: AxiosResponse<User> = await api.put(`/usuarios/${id}`, user);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  }
};

export const clientApi = {
  getAll: async (trainerId?: number): Promise<Client[]> => {
    if (trainerId === undefined || trainerId === null) {
      console.warn('clientApi.getAll called without trainerId. Falling back to /clientes if possible or providing empty list.');
      try {
        const response = await api.get('/clientes', { params: { size: 1000 } });
        // Handle Page response if /clientes is also paginated (likely)
        if (response.data && response.data.content) {
          return response.data.content;
        }
        return response.data;
      } catch (e) {
        console.error('Failed to fetch from /clientes as fallback:', e);
        return [];
      }
    }
    // Fetch with large size to emulate "all" for existing list views until they are paginated
    const response = await api.get(`/entrenadores/${trainerId}/clientes`, { params: { size: 1000 } });
    if (response.data && response.data.content) {
      return response.data.content;
    }
    return response.data;
  },

  getRecent: async (trainerId: number): Promise<Client[]> => {
    // Optimized fetch for dashboard: only 5 recent clients
    const response = await api.get(`/entrenadores/${trainerId}/clientes`, {
      params: {
        page: 0,
        size: 5,
        sort: 'id,desc'
      }
    });
    if (response.data && response.data.content) {
      return response.data.content;
    }
    return Array.isArray(response.data) ? response.data.slice(0, 5) : [];
  },

  getById: async (id: number): Promise<Client> => {
    const response: AxiosResponse<Client> = await api.get(`/clientes/${id}`);
    return response.data;
  },

  create: async (client: ClienteRequestDTO): Promise<Client> => {
    const response: AxiosResponse<Client> = await api.post('/clientes', client);
    return response.data;
  },

  update: async (id: number, client: Client): Promise<Client> => {
    const response: AxiosResponse<Client> = await api.put(`/clientes/${id}`, {
      nombre: client.nombre,
      apellido: client.apellido,
      email: client.email,
      telefono: client.telefono,
      edad: client.edad,
      objetivo: client.objetivo
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },

  getRoutines: async (id: number): Promise<Routine[]> => {
    const response: AxiosResponse<Routine[]> = await api.get(`/clientes/${id}/rutinas`);
    return response.data;
  },

  // New methods based on user provided endpoints
  getMyRoutines: async (clienteId: number): Promise<RutinaResponseDTO[]> => {
    const response: AxiosResponse<RutinaResponseDTO[]> = await api.get(`/clientes/${clienteId}/mis-rutinas`);
    return response.data;
  },

  getRoutineExercises: async (clienteId: number, rutinaId: number): Promise<RutinaEjercicioResponseDTO[]> => {
    const response: AxiosResponse<RutinaEjercicioResponseDTO[]> = await api.get(`/clientes/${clienteId}/rutinas/${rutinaId}/ejercicios`);
    return response.data;
  },

  registerProgress: async (clienteId: number, rutinaEjercicioId: number, progress: ProgresoEjercicioRequestDTO): Promise<ProgresoEjercicioResponseDTO> => {
    const response: AxiosResponse<ProgresoEjercicioResponseDTO> = await api.post(`/clientes/${clienteId}/rutina-ejercicio/${rutinaEjercicioId}/progreso`, progress);
    return response.data;
  },

  getMyProgress: async (clienteId: number): Promise<ProgresoEjercicioResponseDTO[]> => {
    const response: AxiosResponse<ProgresoEjercicioResponseDTO[]> = await api.get(`/clientes/${clienteId}/progreso`);
    return response.data;
  },

  getProgressByExercise: async (clienteId: number, rutinaEjId: number): Promise<ProgresoEjercicioResponseDTO[]> => {
    const response: AxiosResponse<ProgresoEjercicioResponseDTO[]> = await api.get(`/clientes/${clienteId}/progreso/ejercicio/${rutinaEjId}`);
    return response.data;
  },

  getActualDay: async (clienteId: number): Promise<number> => {
    const response: AxiosResponse<number> = await api.get(`/clientes/${clienteId}/dia-actual`);
    return response.data;
  },

  getRutinaActualResumen: async (clienteId: number): Promise<RutinaResumenResponseDTO> => {
    const response: AxiosResponse<RutinaResumenResponseDTO> = await api.get(`/clientes/${clienteId}/rutina-actual/resumen`);
    return response.data;
  },

  initiatePayment: async (rutinaId: number, clienteId: number): Promise<{ initPoint: string, pagoId: number, estado: string }> => {
    const response: AxiosResponse<{ initPoint: string, pagoId: number, estado: string }> = await api.post('/pagos/iniciar', { rutinaId, clienteId });
    return response.data;
  },

  initiateTransferPayment: async (rutinaId: number, clienteId: number): Promise<any> => {
    const response: AxiosResponse<any> = await api.post('/pagos/transferencia/iniciar', { rutinaId, clienteId });
    return response.data;
  },

  confirmTransferPayment: async (pagoId: number): Promise<void> => {
    await api.post(`/pagos/transferencia/${pagoId}/confirmar`);
  }
};

export const trainerApi = {
  // Create a client for a specific trainer
  createClient: async (trainerId: number, client: ClienteRequestDTO): Promise<Client> => {
    const response: AxiosResponse<Client> = await api.post(`/entrenadores/${trainerId}/clientes`, client);
    return response.data;
  },

  // List all clients for a specific trainer
  getMyClients: async (trainerId: number): Promise<Client[]> => {
    const response: AxiosResponse<Client[]> = await api.get(`/entrenadores/${trainerId}/clientes`);
    return response.data;
  },

  // Get details of a specific client of a trainer
  getClient: async (trainerId: number, clientId: number): Promise<Client> => {
    const response: AxiosResponse<Client> = await api.get(`/entrenadores/${trainerId}/clientes/${clientId}`);
    return response.data;
  },

  // Update a client of a trainer
  updateClient: async (trainerId: number, clientId: number, client: ClienteRequestDTO): Promise<Client> => {
    const response: AxiosResponse<Client> = await api.put(`/entrenadores/${trainerId}/clientes/${clientId}`, client);
    return response.data;
  },

  // Delete a client of a trainer
  deleteClient: async (trainerId: number, clientId: number): Promise<void> => {
    await api.delete(`/entrenadores/${trainerId}/clientes/${clientId}`);
  },

  // Get trainer profile
  getProfile: async (trainerId: number): Promise<any> => {
    const response: AxiosResponse<any> = await api.get(`/entrenadores/${trainerId}/perfil`);
    return response.data;
  },

  // Update trainer profile
  updateProfile: async (trainerId: number, profileData: any): Promise<any> => {
    const response: AxiosResponse<any> = await api.put(`/entrenadores/${trainerId}/perfil`, profileData);
    return response.data;
  },

  // Get client progress
  getClientProgress: async (trainerId: number, clientId: number): Promise<ProgresoEjercicioResponseDTO[]> => {
    const response: AxiosResponse<ProgresoEjercicioResponseDTO[]> = await api.get(`/entrenadores/${trainerId}/clientes/${clientId}/progreso`);
    return response.data;
  }
};

export const adminApi = {
  // List all trainers
  listarEntrenadores: async (): Promise<EntrenadorResponseDTO[]> => {
    const response: AxiosResponse<EntrenadorResponseDTO[]> = await api.get('/admin/entrenadores');
    return response.data;
  },

  // Create a new trainer
  crearEntrenador: async (entrenador: EntrenadorRequestDTO): Promise<EntrenadorResponseDTO> => {
    const response: AxiosResponse<EntrenadorResponseDTO> = await api.post('/admin/entrenadores', entrenador);
    return response.data;
  }
};

export const routineApi = {
  getAll: async (filter?: RoutineFilter): Promise<Routine[]> => {
    const params = filter ? { ...filter } : {};
    const response: AxiosResponse<Routine[]> = await api.get('/rutinas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Routine> => {
    const response: AxiosResponse<Routine> = await api.get(`/rutinas/${id}`);
    return response.data;
  },

  create: async (routine: RutinaRequestDTO): Promise<Routine> => {
    const response: AxiosResponse<Routine> = await api.post('/rutinas', routine);
    return response.data;
  },

  update: async (id: number, routine: RutinaRequestDTO): Promise<RutinaResponseDTO> => {
    const response: AxiosResponse<RutinaResponseDTO> = await api.put(`/rutinas/${id}`, routine);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/rutinas/${id}`);
  },

  addExercise: async (routineId: number, routineExercise: RutinaEjercicioRequestDTO): Promise<RoutineExercise> => {
    const requestData = {
      series: routineExercise.series,
      repeticiones: routineExercise.repeticiones,
      descansoSegundos: routineExercise.descansoSegundos,
      ejercicioId: routineExercise.ejercicioId,
      dia: routineExercise.dia,
      esBiSerie: routineExercise.esBiSerie,
      biSerieGrupo: routineExercise.biSerieGrupo,
      orden: routineExercise.orden
    };

    const response: AxiosResponse<RoutineExercise> = await api.post(`/rutinas/${routineId}/ejercicios`, requestData);
    return response.data;
  },

  getExercises: async (routineId: number): Promise<RoutineExercise[]> => {
    const response: AxiosResponse<RoutineExercise[]> = await api.get(`/rutinas/${routineId}/ejercicios`);
    return response.data;
  },

  removeExercise: async (routineId: number, rutinaEjercicioId: number): Promise<void> => {
    await api.delete(`/rutinas/${routineId}/ejercicios/${rutinaEjercicioId}`);
  }
};

export const exerciseApi = {
  getAll: async (filter?: ExerciseFilter): Promise<Exercise[]> => {
    const params = filter ? { ...filter, size: 1000 } : { size: 1000 };
    const response = await api.get('/ejercicios', { params });
    if (response.data && response.data.content) {
      return response.data.content;
    }
    return response.data;
  },

  getCount: async (): Promise<number> => {
    // Optimized fetch: size=1 just to get totalElements
    const response = await api.get('/ejercicios', { params: { size: 1 } });
    if (response.data && typeof response.data.totalElements === 'number') {
      return response.data.totalElements;
    }
    // Fallback if not paginated
    return Array.isArray(response.data) ? response.data.length : 0;
  },

  getById: async (id: number): Promise<Exercise> => {
    const response: AxiosResponse<Exercise> = await api.get(`/ejercicios/${id}`);
    return response.data;
  },

  create: async (exercise: EjercicioRequestDTO): Promise<Exercise> => {
    const response: AxiosResponse<Exercise> = await api.post('/ejercicios', exercise);
    return response.data;
  },

  update: async (id: number, exercise: EjercicioRequestDTO): Promise<Exercise> => {
    const response: AxiosResponse<Exercise> = await api.put(`/ejercicios/${id}`, exercise);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ejercicios/${id}`);
  },

  getMuscleGroups: async (): Promise<string[]> => {
    const response: AxiosResponse<string[]> = await api.get('/ejercicios/grupos-musculares');
    return response.data;
  }
};

export const setAuthToken = (token?: string) => {
  if (token) {
    localStorage.setItem('token', token);
    const authHeader = `Bearer ${token}`;
    api.defaults.headers.common['Authorization'] = authHeader;
    apiClient.defaults.headers.common['Authorization'] = authHeader;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getStoredToken = (): string | null => localStorage.getItem('token');

// Initialize token from storage on app load
const storedToken = getStoredToken();
if (storedToken) {
  setAuthToken(storedToken);
}

export const decodeToken = (token?: string) => {
  try {
    const t = token ?? getStoredToken();
    if (!t) return null;
    const payload = t.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const isAdmin = () => {
  const payload = decodeToken();
  if (!payload) return false;
  return payload.rol === 'ADMIN' || (Array.isArray(payload.roles) && payload.roles.includes('ADMIN'));
};

export const isTrainer = () => {
  const payload = decodeToken();
  if (!payload) return false;
  return payload.rol === 'ENTRENADOR' || (Array.isArray(payload.roles) && payload.roles.includes('ENTRENADOR'));
};

export const getUserId = (): number | null => {
  const payload = decodeToken();
  if (!payload) return null;
  // backend now sends userId in token
  const id = payload.userId || payload.id || payload.sub;
  if (!id) return null;
  return typeof id === 'string' ? parseInt(id) : id;
};

export const getEntrenadorId = (): number | null => {
  const payload = decodeToken();
  if (!payload || payload.rol !== 'ENTRENADOR') return null;
  // Use entrenadorId from JWT token
  const id = payload.entrenadorId;
  if (!id) return null;
  return typeof id === 'string' ? parseInt(id) : id;
};

export const getClienteId = (): number | null => {
  const payload = decodeToken();
  if (!payload || payload.rol !== 'CLIENTE') return null;
  const id = payload.clienteId;
  if (!id) return null;
  return typeof id === 'string' ? parseInt(id) : id;
};

export const getUserRole = (): 'ADMIN' | 'ENTRENADOR' | 'CLIENTE' | null => {
  const payload = decodeToken();
  return payload?.rol || null;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const token = res.data?.token ?? res.data;
    if (token) setAuthToken(token);
    return token;
  },
  logout: () => setAuthToken(undefined)
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Attempt to connect to the root URL. 
    // Render free tier pauses the server after inactivity. The first request will hang until the server boots (30-60s).
    // We set a long timeout to allow for this wake-up period.
    await apiClient.get('/', { timeout: 60000 });
    return true;
  } catch (error: any) {
    // If we get a response (even 404, 401, 500), the server is UP.
    if (error.response) {
      return true;
    }
    // If we get a network error or timeout (after 60s), it's likely down or unreachable.
    console.error('Wake up check failed:', error);
    return false;
  }
};
