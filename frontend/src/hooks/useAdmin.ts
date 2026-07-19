import { useQuery } from '@tanstack/react-query';
import { AdminService } from '../services/admin.service';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => AdminService.getDashboardStats(),
  });
};

export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['adminRecentOrders'],
    queryFn: () => AdminService.getRecentOrders(),
  });
};
