import api from './api';

export const AdminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  getRecentOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  }
};
