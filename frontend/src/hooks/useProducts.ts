import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/product.service';

// Custom Hook lấy danh sách sản phẩm (có phân trang/lọc)
export const useProducts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => ProductService.getProducts(params),
    placeholderData: (previousData) => previousData, // Giữ data cũ trong lúc fetch data mới (tránh nháy UI)
  });
};

// Custom Hook lấy chi tiết sản phẩm
export const useProduct = (id: number | string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProductById(id),
    enabled: !!id, // Chỉ gọi API khi id tồn tại
  });
};

// Custom Hook lấy sản phẩm nổi bật
export const useFeaturedProducts = (size: number = 4) => {
  return useQuery({
    queryKey: ['products', 'featured', size],
    queryFn: () => ProductService.getFeaturedProducts(size),
  });
};
