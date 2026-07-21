import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '../hooks/useAuthMutations';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Định dạng email không hợp lệ'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [apiMessage, setApiMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const { mutateAsync: forgotPasswordMutation, isPending: loading } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setApiError('');
      setApiMessage('');
      const res = await forgotPasswordMutation(data.email);
      setApiMessage(res.message || 'Đã gửi link khôi phục mật khẩu.');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-black tracking-tighter uppercase">Khôi phục mật khẩu</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>
        
        {apiMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium border border-green-200">
            {apiMessage}
          </div>
        )}
        
        {apiError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/login" className="font-bold text-sm text-primary hover:text-gray-900 transition-colors uppercase tracking-wider underline decoration-2 underline-offset-4">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
