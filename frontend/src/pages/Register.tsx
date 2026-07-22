import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '../hooks/useAuthMutations';
import { useToast } from '../context/ToastContext';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập tên').max(50),
  lastName: z.string().min(1, 'Vui lòng nhập họ').max(50),
  email: z.string().min(1, 'Vui lòng nhập email').email('Định dạng email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [apiError, setApiError] = useState('');
  const { mutateAsync: registerMutation, isPending } = useRegister();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setApiError('');
      await registerMutation({ 
        fullName: `${data.firstName} ${data.lastName}`.trim(), 
        email: data.email, 
        password: data.password 
      });
      navigate('/');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Diamonds and Rings"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        <div className="absolute bottom-12 left-12 text-white max-w-lg">
          <h2 className="text-4xl font-serif mb-4">Dành riêng cho bạn.</h2>
          <p className="text-lg text-gray-200">
            Tạo tài khoản để lưu các sản phẩm yêu thích, theo dõi đơn hàng và nhận các ưu đãi độc quyền.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black uppercase tracking-widest text-gray-900">
              Tạo tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-gray-900 transition-colors underline decoration-2 underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200 text-center">
                  {apiError}
                </div>
              )}
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                    <input
                      type="text"
                      {...register('firstName')}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
                      placeholder="VD: Nam"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                    <input
                      type="text"
                      {...register('lastName')}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
                      placeholder="VD: Nguyễn"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
                    placeholder="Nhập email của bạn"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    {...register('password')}
                    className={`block w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} bg-gray-50 text-gray-900 focus:bg-white focus:outline-none transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-primary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isPending ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 uppercase tracking-widest text-xs">Hoặc đăng ký bằng</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => showToast('Tính năng đang phát triển', 'info')}
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Tính năng đang phát triển', 'info')}
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
