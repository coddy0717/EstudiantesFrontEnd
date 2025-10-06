// services/nivelService.ts
import api from '../api/api';
import type { Nivel } from '../app/types/models';

export const nivelService = {
  getAll: async (): Promise<Nivel[]> => {
    const response = await api.get('/niveles/');
    return response.data;
  },

  getById: async (id: number): Promise<Nivel> => {
    const response = await api.get(`/niveles/${id}/`);
    return response.data;
  },

  create: async (nivel: Nivel): Promise<Nivel> => {
    const response = await api.post('/niveles/', nivel);
    return response.data;
  },

  update: async (id: number, nivel: Partial<Nivel>): Promise<Nivel> => {
    const response = await api.put(`/niveles/${id}/`, nivel);
    return response.data;
  },

  patch: async (id: number, nivel: Partial<Nivel>): Promise<Nivel> => {
    const response = await api.patch(`/niveles/${id}/`, nivel);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/niveles/${id}/`);
  },
  }
