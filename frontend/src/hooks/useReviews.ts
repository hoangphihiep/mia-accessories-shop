import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewService } from '../services/review.service';

export const useProductReviews = (productId: number | string) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: () => ReviewService.getReviewsByProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number | string, data: { rating: number, comment: string } }) => 
      ReviewService.createReview(productId, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', variables.productId] });
    },
  });
};
