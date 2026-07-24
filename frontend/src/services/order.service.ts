import api from './api';

export const OrderService = {
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
  cancelOrder: async (id: number) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  }
};
