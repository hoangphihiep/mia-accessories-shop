import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../types';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: (data: LoginRequest & { rememberMe?: boolean }) => AuthService.login(data),
    onSuccess: (data, variables) => {
      login(data.token, data.refreshToken, data.user, variables.rememberMe);
    }
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    // Bỏ login() vì register giờ yêu cầu xác thực email trước
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email)
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string, newPassword: string }) => 
      AuthService.resetPassword(token, newPassword)
  });
};
