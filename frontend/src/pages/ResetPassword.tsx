import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPassword } from '../hooks/useAuthMutations';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [apiMessage, setApiMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const { mutateAsync: resetPasswordMutation, isPending: loading } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  if (!token) {
    return <div className="p-12 text-center text-red-500 font-medium">Token không hợp lệ. Vui lòng kiểm tra lại email.</div>;
  }

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setApiError('');
      setApiMessage('');
      const res = await resetPasswordMutation({ token, newPassword: data.newPassword });
      setApiMessage(res.message || 'Đã cập nhật mật khẩu.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Lỗi đặt lại mật khẩu');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-black tracking-tighter uppercase">Đặt lại mật khẩu</h2>
        </div>
        
        {apiMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium border border-green-200">
            {apiMessage} <br/> Hệ thống sẽ chuyển hướng về trang đăng nhập trong 3 giây...
          </div>
        )}
        {apiError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                {...register('newPassword')}
                className={`block w-full px-4 py-3 rounded-lg border ${errors.newPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
                placeholder="Mật khẩu mới"
              />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={`block w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
                placeholder="Xác nhận mật khẩu mới"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!apiMessage}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
