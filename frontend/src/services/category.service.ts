import api from './api';
import type { CategoryResponse } from '../types';

export const CategoryService = {
  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get('/categories');
    return response.data;
  }
};
