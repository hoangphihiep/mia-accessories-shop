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

export const useDailyRevenue = () => {
  return useQuery({
    queryKey: ['adminDailyRevenue'],
    queryFn: () => AdminService.getDailyRevenue(),
  });
};

export const useDailyProductSales = () => {
  return useQuery({
    queryKey: ['adminDailyProductSales'],
    queryFn: () => AdminService.getDailyProductSales(),
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['adminTopProducts'],
    queryFn: () => AdminService.getTopProducts(),
  });
};

export const useUsers = (page: number, size: number, keyword: string) => {
  return useQuery({
    queryKey: ['adminUsers', page, size, keyword],
    queryFn: () => AdminService.getUsers(page, size, keyword),
  });
};

export const useCustomers = (page: number, size: number, keyword: string) => {
  return useQuery({
    queryKey: ['adminCustomers', page, size, keyword],
    queryFn: () => AdminService.getCustomers(page, size, keyword),
  });
};
