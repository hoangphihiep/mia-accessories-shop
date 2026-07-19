import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../types';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: (data) => {
      login(data.token, data.user);
    }
  });
};

export const useRegister = () => {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    onSuccess: (data) => {
      login(data.token, data.user);
    }
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
