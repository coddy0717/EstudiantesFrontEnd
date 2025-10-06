// src/services/estudianteService.ts

import api from '../api/api'; // Usa alias si tienes configurado tsconfig
import type { Estudiante } from '../app/types/models';

export const estudianteService = {
  // Obtener todos los estudiantes
  getAll: async (): Promise<Estudiante[]> => {
    const response = await api.get('/estudiante/');
    return response.data;
  },

  // Obtener estudiante por ID
  getById: async (id: number): Promise<Estudiante> => {
    const response = await api.get(`/estudiante/${id}/`);
    return response.data;
  },

  // Obtener perfil del estudiante autenticado
  getPerfil: async (): Promise<Estudiante> => {
    const response = await api.get('/perfil/');
    return response.data;
  },

  // Crear estudiante
  create: async (estudiante: Estudiante): Promise<Estudiante> => {
    const response = await api.post('/estudiante/', estudiante);
    return response.data;
  },

  // Actualizar estudiante (PUT)
  update: async (id: number, estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    const response = await api.put(`/estudiante/${id}/`, estudiante);
    return response.data;
  },

  // Actualizar parcial (PATCH)
  patch: async (id: number, estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    const response = await api.patch(`/estudiante/${id}/`, estudiante);
    return response.data;
  },

  // Eliminar estudiante
  delete: async (id: number): Promise<void> => {
    await api.delete(`/estudiante/${id}/`);
  },
};
