import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '../services/category.service';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
    staleTime: 1000 * 60 * 60, // Cache categories trong 1 tiếng (ít khi thay đổi)
  });
};
