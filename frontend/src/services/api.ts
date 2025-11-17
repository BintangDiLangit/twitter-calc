import axios from 'axios';
import { User, CalculationTree, Calculation, CreateCalculationRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  },
};

// Calculation API
export const calculationAPI = {
  getAllTrees: async (): Promise<CalculationTree[]> => {
    const response = await api.get('/calculations/trees');
    return response.data.trees;
  },

  getTreeById: async (id: number): Promise<CalculationTree> => {
    const response = await api.get(`/calculations/trees/${id}`);
    return response.data.tree;
  },

  getRoots: async (): Promise<Calculation[]> => {
    const response = await api.get('/calculations/roots');
    return response.data.calculations;
  },

  getChildren: async (id: number): Promise<Calculation[]> => {
    const response = await api.get(`/calculations/${id}/children`);
    return response.data.calculations;
  },

  createCalculation: async (data: CreateCalculationRequest): Promise<Calculation> => {
    const response = await api.post('/calculations', data);
    return response.data.calculation;
  },

  deleteCalculation: async (id: number): Promise<void> => {
    await api.delete(`/calculations/${id}`);
  },
};

export default api;

