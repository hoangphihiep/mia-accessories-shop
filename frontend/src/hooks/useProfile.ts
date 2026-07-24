import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import { OrderService } from '../services/order.service';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => UserService.getMe(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => UserService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => UserService.getAddresses(),
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => UserService.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => UserService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => UserService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: any) => UserService.changePassword(data)
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => OrderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    }
  });
};

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['myOrders'],
    queryFn: () => OrderService.getMyOrders(),
  });
};
