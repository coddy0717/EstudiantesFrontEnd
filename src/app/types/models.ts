// types/models.ts

export interface Estudiante {
  id?: number;
  cedula: string;
  nombre: string;
  estado: boolean;
  password?: string; // Solo para crear/actualizar
}

export interface Carrera {
  id?: number;
  nombre: string;
  duracion_semestre?: number;
  estado: boolean;
}

export interface Nivel {
  id?: number;
  id_carrera: number; // FK
  numero_nivel: number;
  estado: boolean;
}

export interface Materia {
  id?: number;
  id_nivel: number; // FK
  nombre: string;
  creditos: number;
  horas_semana: number;
  tipo: string;
  estado: boolean;
}

export interface Paralelo {
  id?: number;
  id_materia: number; // FK
  materia?: Materia;   // ← Agregar esta línea
  numero_paralelo: number;
  cupo_maximo: number;
  aula: string;
  estado: boolean;
}

// Inscripción con datos completos (para mostrar)
export interface Inscripcion {
  id_Inscripcion: number;
  id_Estudiante: number;
  carrera?: Carrera; // objeto completo
  nivel?: Nivel; // objeto completo
  paralelo?: Paralelo; // objeto completo
  fecha_inscripcion?: string;
  calificacion?: number;
  estado?: boolean;
}
// Inscripción para crear/editar (solo IDs)
export interface InscripcionCreate {
  id_Inscripcion?: number;
  id_Estudiante: number;
  id_Paralelo?: number;
  id_Carrera: number;
  id_Nivel?: number;
  fecha_inscripcion?: string;
  calificacion: number;
  estado?: boolean;

}

// Tipos para respuestas con datos poblados (opcional)
export interface EstudianteDetalle extends Estudiante {
  inscripciones?: Inscripcion[];
}

export interface InscripcionDetalle extends Inscripcion {
  estudiante_data?: Estudiante;
  paralelo_data?: Paralelo;
}
// types/chat.ts
export type MessageType = 'text' | 'image' | 'audio' | 'system';

