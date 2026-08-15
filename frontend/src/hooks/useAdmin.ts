import { useQuery } from '@tanstack/react-query';
import { AdminService } from '../services/admin.service';

export const useDashboardStats = (timeRange: string = 'thisMonth', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['adminDashboardStats', timeRange, startDate, endDate],
    queryFn: () => AdminService.getDashboardStats(timeRange, startDate, endDate),
  });
};

export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['adminRecentOrders'],
    queryFn: () => AdminService.getRecentOrders(),
  });
};

export const useDailyRevenue = (timeRange: string = 'thisMonth', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['adminDailyRevenue', timeRange, startDate, endDate],
    queryFn: () => AdminService.getDailyRevenue(timeRange, startDate, endDate),
  });
};

export const useDailyProductSales = (timeRange: string = 'thisMonth', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['adminDailyProductSales', timeRange, startDate, endDate],
    queryFn: () => AdminService.getDailyProductSales(timeRange, startDate, endDate),
  });
};

export const useTopProducts = (timeRange: string = 'thisMonth', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['adminTopProducts', timeRange, startDate, endDate],
    queryFn: () => AdminService.getTopProducts(timeRange, startDate, endDate),
  });
};

export const useProductStats = (timeRange: string = 'thisMonth', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['adminProductStats', timeRange, startDate, endDate],
    queryFn: () => AdminService.getProductStats(timeRange, startDate, endDate),
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
