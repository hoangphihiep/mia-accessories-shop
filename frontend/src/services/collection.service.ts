import api from './api';

export const CollectionService = {
  getAll: async () => {
    const response = await api.get('/collections/active');
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/collections/${slug}`);
    return response.data;
  }
};
