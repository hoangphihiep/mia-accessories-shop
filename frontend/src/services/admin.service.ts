import api from './api';

export const AdminService = {
  getDashboardStats: async (timeRange = 'thisMonth', startDate?: string, endDate?: string) => {
    let url = `/admin/dashboard/stats?timeRange=${timeRange}`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
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
  getDailyRevenue: async (timeRange = 'thisMonth', startDate?: string, endDate?: string) => {
    let url = `/admin/dashboard/daily-revenue?timeRange=${timeRange}`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  },
  getTopProducts: async (timeRange = 'thisMonth', startDate?: string, endDate?: string) => {
    let url = `/admin/dashboard/top-products?timeRange=${timeRange}`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  },
  getDailyProductSales: async (timeRange = 'thisMonth', startDate?: string, endDate?: string) => {
    let url = `/admin/dashboard/daily-product-sales?timeRange=${timeRange}`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  },
  getProductStats: async (timeRange = 'thisMonth', startDate?: string, endDate?: string) => {
    let url = `/admin/dashboard/product-stats?timeRange=${timeRange}`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  }
};
