// services/materiaService.ts
import api from '../api/api';
import type { Materia } from '../app/types/models';

export const materiaService = {
  getAll: async (): Promise<Materia[]> => {
    const response = await api.get('/materias/');
    return response.data;
  },

  getById: async (id: number): Promise<Materia> => {
    const response = await api.get(`/materias/${id}/`);
    return response.data;
  },

  create: async (materia: Materia): Promise<Materia> => {
    const response = await api.post('/materias/', materia);
    return response.data;
  },

  update: async (id: number, materia: Partial<Materia>): Promise<Materia> => {
    const response = await api.put(`/materias/${id}/`, materia);
    return response.data;
  },

  patch: async (id: number, materia: Partial<Materia>): Promise<Materia> => {
    const response = await api.patch(`/materias/${id}/`, materia);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/materias/${id}/`);
  },

  getByNivel: async (nivelId: number): Promise<Materia[]> => {
    const response = await api.get(`/materias/?nivel=${nivelId}`);
    return response.data;
  },
};