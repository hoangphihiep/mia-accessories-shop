import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '../hooks/useAuthMutations';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useFacebookLogin } from '../hooks/useFacebookLogin';
import { AuthService } from '../services/auth.service';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập tên').max(50),
  lastName: z.string().min(1, 'Vui lòng nhập họ').max(50),
  email: z.string().min(1, 'Vui lòng nhập email').email('Định dạng email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: registerMutation, isPending } = useRegister();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { login: fbLogin } = useFacebookLogin(import.meta.env.VITE_FACEBOOK_APP_ID || 'dummy-app-id');

  const handleOAuthSuccess = async (provider: 'google' | 'facebook', token: string) => {
    try {
      setApiError('');
      const response = await (provider === 'google' 
        ? AuthService.oauth2Google(token) 
        : AuthService.oauth2Facebook(token));
        
      login(response.token, response.refreshToken, response.user, true);
      
      if (response.user?.role?.name === 'ROLE_ADMIN' || response.user?.role?.name === 'ROLE_STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || `Đăng ký ${provider} thất bại`);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleOAuthSuccess('google', tokenResponse.access_token),
    onError: () => setApiError('Đăng ký Google thất bại'),
  });

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
      setIsSuccess(true);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6 border border-green-100 animate-in zoom-in duration-500 delay-150">
            <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Đăng ký thành công!</h2>
          <p className="text-gray-500 text-base mb-8 leading-relaxed">
            Vui lòng kiểm tra email của bạn để kích hoạt tài khoản. Bạn không thể đăng nhập cho đến khi xác thực thành công.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-xl text-white bg-primary hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
          >
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full animate-in fade-in duration-700">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Diamonds and Rings"
          className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[10s] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-16 left-16 text-white max-w-lg">
          <h2 className="text-4xl font-serif mb-4 leading-tight">Dành riêng<br/>cho bạn.</h2>
          <p className="text-lg text-gray-200/90 leading-relaxed font-light">
            Tạo tài khoản để lưu các sản phẩm yêu thích, theo dõi đơn hàng và nhận các ưu đãi độc quyền.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 bg-white relative">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-3">
              Tạo tài khoản
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-gray-900 transition-colors underline decoration-2 underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100/50 flex items-center justify-center animate-in slide-in-from-top-2">
                {apiError}
              </div>
            )}
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name Input */}
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      placeholder=" "
                      {...register('firstName')}
                      className={`peer block w-full pl-11 pr-4 pt-5 pb-2 rounded-xl border ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} bg-white text-gray-900 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm hover:border-gray-300`}
                    />
                    <label 
                      htmlFor="firstName" 
                      className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text ${errors.firstName ? 'text-red-500' : 'text-gray-500 peer-focus:text-primary font-medium'}`}
                    >
                      Tên
                    </label>
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1.5 font-medium pl-1 animate-in fade-in">{errors.firstName.message}</p>}
                </div>

                {/* Last Name Input */}
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="lastName"
                      placeholder=" "
                      {...register('lastName')}
                      className={`peer block w-full pl-11 pr-4 pt-5 pb-2 rounded-xl border ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} bg-white text-gray-900 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm hover:border-gray-300`}
                    />
                    <label 
                      htmlFor="lastName" 
                      className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text ${errors.lastName ? 'text-red-500' : 'text-gray-500 peer-focus:text-primary font-medium'}`}
                    >
                      Họ
                    </label>
                  </div>
                  {errors.lastName && <p className="text-red-500 text-xs mt-1.5 font-medium pl-1 animate-in fade-in">{errors.lastName.message}</p>}
                </div>
              </div>
              
              {/* Floating Email Input */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    {...register('email')}
                    className={`peer block w-full pl-11 pr-4 pt-5 pb-2 rounded-xl border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} bg-white text-gray-900 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm hover:border-gray-300`}
                  />
                  <label 
                    htmlFor="email" 
                    className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text ${errors.email ? 'text-red-500' : 'text-gray-500 peer-focus:text-primary font-medium'}`}
                  >
                    Địa chỉ Email
                  </label>
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium pl-1 animate-in fade-in">{errors.email.message}</p>}
              </div>
              
              {/* Floating Password Input */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder=" "
                    {...register('password')}
                    className={`peer block w-full pl-11 pr-12 pt-5 pb-2 rounded-xl border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} bg-white text-gray-900 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm hover:border-gray-300`}
                  />
                  <label 
                    htmlFor="password" 
                    className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text ${errors.password ? 'text-red-500' : 'text-gray-500 peer-focus:text-primary font-medium'}`}
                  >
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium pl-1 animate-in fade-in">{errors.password.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-xl text-white bg-primary hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/80"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium uppercase tracking-widest text-xs">
                  Hoặc đăng ký bằng
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl shadow-sm bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  fbLogin((response: any) => {
                    if (response?.accessToken) {
                      handleOAuthSuccess('facebook', response.accessToken);
                    } else {
                      setApiError('Đăng ký Facebook thất bại');
                    }
                  });
                }}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl shadow-sm bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5 mr-2.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
