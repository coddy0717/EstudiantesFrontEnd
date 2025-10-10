// types/chatbot.ts
export interface UserContext {
  nombre?: string;
  isLoggedIn: boolean;
  token?: string; // ← Añadir esta propiedad
  academicData?: AcademicData;
  timestamp: string;
}

export interface AcademicData {
  perfil?: StudentProfile;
  inscripciones?: Enrollment[];
  materias?: Subject[];
}

export interface StudentProfile {
  nombre: string;
  cedula?: string;
  id_Estudiante?: string;
}

export interface Enrollment {
  id_Inscripcion?: number;
  paralelo?: {
    id_Paralelo?: number;
    materia?: {
      nombre: string;
    };
    numero_paralelo?: string;
    aula?: string;
  };
  calificacion?: number;
}

export interface Subject {
  nombre: string;
  paralelo?: string;
  aula?: string;
  calificacion?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  success: boolean;
  response?: string;
  error?: string;
}