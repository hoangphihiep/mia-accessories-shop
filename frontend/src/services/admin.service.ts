import api from './api';

export const AdminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  getUsers: async (page = 0, size = 10, keyword = '') => {
    const response = await api.get(`/admin/users?page=${page}&size=${size}&keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  createStaff: async (data: any) => {
    const response = await api.post('/admin/users/staff', data);
    return response.data;
  },
  getCustomers: async (page = 0, size = 10, keyword = '') => {
    const response = await api.get(`/admin/customers?page=${page}&size=${size}&keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  toggleCustomerStatus: async (id: number) => {
    const response = await api.put(`/admin/customers/${id}/status`);
    return response.data;
  },
  getRecentOrders: async () => {
    const response = await api.get('/admin/dashboard/recent-orders');
    return response.data;
  },
  getDailyRevenue: async () => {
    const response = await api.get('/admin/dashboard/daily-revenue');
    return response.data;
  },
  getTopProducts: async () => {
    const response = await api.get('/admin/dashboard/top-products');
    return response.data;
  }
};
