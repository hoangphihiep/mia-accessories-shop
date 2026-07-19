import api from './api';

export const ReviewService = {
  getReviewsByProduct: async (productId: number | string) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },
  
  createReview: async (productId: number | string, data: { rating: number, comment: string }) => {
    const response = await api.post(`/reviews/product/${productId}`, data);
    return response.data;
  }
};
