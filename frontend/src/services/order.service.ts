import api from './api';

export const OrderService = {
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  }
};
