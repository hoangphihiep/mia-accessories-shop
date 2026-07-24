import api from './api';

export const UserService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateMe: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  getAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },
  addAddress: async (data: any) => {
    const response = await api.post('/addresses', data);
    return response.data;
  },
  updateAddress: async (id: number, data: any) => {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },
  deleteAddress: async (id: number) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await api.put('/users/me/password', data);
    return response.data;
  }
};
