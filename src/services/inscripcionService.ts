// services/inscripcionService.ts
import api from '../api/api';
import type { Inscripcion, InscripcionCreate } from '../app/types/models';

export const inscripcionService = {
  getAll: async (): Promise<Inscripcion[]> => {
    const response = await api.get('/inscripciones/');
    return response.data;
  },

  getById: async (id: number): Promise<Inscripcion> => {
    const response = await api.get(`/inscripciones/${id}/`);
    return response.data;
  },

  create: async (inscripcion: InscripcionCreate): Promise<Inscripcion> => {
    const response = await api.post('/inscripciones/', inscripcion);
    return response.data;
  },

  update: async (id: number, inscripcion: Partial<InscripcionCreate>): Promise<Inscripcion> => {
    const response = await api.put(`/inscripciones/${id}/`, inscripcion);
    return response.data;
  },

  patch: async (id: number, inscripcion: Partial<InscripcionCreate>): Promise<Inscripcion> => {
    const response = await api.patch(`/inscripciones/${id}/`, inscripcion);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/inscripciones/${id}/`);
  },

  // Métodos personalizados
  getByEstudiante: async (estudianteId: number): Promise<Inscripcion[]> => {
    const response = await api.get(`/inscripciones/?estudiante=${estudianteId}`);
    return response.data;
  },

  // Obtener inscripciones del estudiante autenticado
  getMisInscripciones: async (): Promise<Inscripcion[]> => {
    const response = await api.get('/mis-inscripciones/');
    return response.data;
  },
};