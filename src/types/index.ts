// User entity
export interface User {
  id?: number;
  nombre: string;
  apellido?: string; // Added to match likely backend extension
  email: string;
  password?: string;
  rol: 'ADMIN' | 'CLIENTE' | 'ENTRENADOR';
}

// Nueva entidad base Persona
export interface Persona {
  id?: number;
  nombre: string;
  apellido: string; // Added field
  email: string;
  telefono: string;
  edad: number;
}

// Client entity - ahora hereda de Persona
export interface Client extends Persona {
  // Solo mantiene los campos específicos de Cliente
  usuario?: User;
  usuarioId?: number;
  objetivo?: string; // Added field
  rutinas?: Routine[];
}

// Routine entity
export interface Routine {
  id?: number;
  nombre: string;
  enfoque: 'Tonificar' | 'Volumen' | 'Resistencia' | string; // Relaxed type to match string in DTO
  fechaInicio: string;
  fechaFin: string;
  clienteId: number;
  estado: string;
  monto?: number; // Added field
  cliente?: Client;
  ejercicios?: RoutineExercise[];
  descripcionDias?: string;
}

// Exercise entity
export interface Exercise {
  id?: number;
  nombre: string;
  grupoMuscular: string;
  descripcion: string;
  videoUrl?: string;
}

// RoutineExercise entity
export interface RoutineExercise {
  id?: number;
  rutinaId?: number;
  ejercicioId?: number;
  ejercicioNombre?: string;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  dia: number; // 1-7
  esBiSerie?: boolean;
  biSerieGrupo?: number | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// DTOs / Requests matching Backend

export interface ClienteRequestDTO {
  nombre: string;
  apellido: string;
  telefono: string;
  edad: number;
  objetivo?: string;
  email?: string;
  password?: string;
}

export interface EjercicioRequestDTO {
  nombre: string;
  grupoMuscular: string;
  descripcion: string;
  videoUrl?: string;
}

export interface EntrenadorRegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  edad: number;
  especialidad: string;
}

export interface EntrenadorRequestDTO {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono: string;
  edad: number;
  especialidad?: string;
}

export interface EntrenadorResponseDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  edad: number;
  especialidad?: string;
  usuarioId?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  rol: string;
}

export interface RutinaEjercicioRequestDTO {
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  dia: number; // 1-7
  ejercicioId: number;
  esBiSerie?: boolean;
  biSerieGrupo?: number | null;
}

export interface RutinaRequestDTO {
  nombre: string;
  enfoque: string;
  fechaInicio: string; // LocalDate as string
  fechaFin: string; // LocalDate as string
  clienteId: number;
  estado: string;
  monto?: number; // BigDecimal as number
  descripcionDias?: string; // Format: "1:Pecho;2:Espalda"
  ejercicios?: RutinaEjercicioRequestDTO[]; // Bulk create
}

export interface RutinaResponseDTO {
  id: number;
  nombre: string;
  enfoque: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  monto?: number;
  clienteId: number;
  descripcionDias?: string;
}

export interface RutinaEjercicioResponseDTO {
  id: number;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  dia: number;
  ejercicioId: number;
  ejercicioNombre: string;
  rutinaId: number;
  esBiSerie?: boolean;
  biSerieGrupo?: number | null;
}

export interface ProgresoEjercicioRequestDTO {
  fecha: string; // YYYY-MM-DD
  kg: number;
  serieNumero: number;
  completado: boolean;
  dia: number;
  rutinaEjercicioId: number;
  clienteId: number;
  repeticionesRealizadas?: number; // Opcional por si se requiere en el futuro, aunque no se mencionó en el body básico
  comentarios?: string;
}

export interface ProgresoEjercicioResponseDTO {
  id: number;
  fecha: string;
  peso?: number;
  kg?: number;
  serieNumero: number;
  repeticionesRealizadas: number;
  comentarios?: string;
  rutinaEjercicioId: number;
  ejercicioNombre: string; // Backend should add this
  completado?: boolean;    // Added from backend JSON
  dia?: number;           // Added from backend JSON
  clienteId?: number;     // Added from backend JSON
}

export interface RutinaResumenResponseDTO {
  rutinaId: number;
  nombreRutina: string;
  diasEntrenadosSemana: number;
  diasPlanificadosSemana: number;
  rachaActualDias: number;
  rutinasAsignadas: number;
  pesoPromedioSemana: number;
  pesoPromedioSemanaAnterior: number;
}

// Filter types
export interface UserFilter {
  rol?: 'ADMIN' | 'CLIENTE' | 'ENTRENADOR';
  search?: string;
}

export interface ExerciseFilter {
  grupoMuscular?: string;
  search?: string;
}

export interface RoutineFilter {
  enfoque?: string;
  clienteId?: number;
  search?: string;
}
