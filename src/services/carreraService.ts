// services/carreraService.ts
import api from '../api/api';
import type { Carrera } from '../app/types/models'

export const carreraService = {
  getAll: async (): Promise<Carrera[]> => {
    const response = await api.get('/carreras/');
    return response.data;
  },

  getById: async (id: number): Promise<Carrera> => {
    const response = await api.get(`/carreras/${id}/`);
    return response.data;
  },

  create: async (carrera: Carrera): Promise<Carrera> => {
    const response = await api.post('/carreras/', carrera);
    return response.data;
  },

  update: async (id: number, carrera: Partial<Carrera>): Promise<Carrera> => {
    const response = await api.put(`/carreras/${id}/`, carrera);
    return response.data;
  },

  patch: async (id: number, carrera: Partial<Carrera>): Promise<Carrera> => {
    const response = await api.patch(`/carreras/${id}/`, carrera);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/carreras/${id}/`);
  },
};
