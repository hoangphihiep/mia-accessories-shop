import api from './api';
import type { ProductResponse, PageResponse } from '../types';

export const ProductService = {
  getProducts: async (params?: Record<string, any>): Promise<PageResponse<ProductResponse>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: number | string): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug: string): Promise<ProductResponse> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  getFeaturedProducts: async (size: number = 4): Promise<PageResponse<ProductResponse>> => {
    const response = await api.get('/products', { params: { page: 0, size, isFeatured: true, sort: 'createdAt,desc' } });
    return response.data;
  },

  getMaxPrice: async (): Promise<number> => {
    const response = await api.get('/products/max-price');
    return response.data;
  }
};
