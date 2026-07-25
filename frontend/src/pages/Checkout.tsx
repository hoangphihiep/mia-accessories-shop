import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, MapPin, Phone, Truck, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../hooks/useSettings';
import { useProfile, useAddresses } from '../hooks/useProfile';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Tên quá ngắn'),
  lastName: z.string().min(2, 'Họ quá ngắn'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ (10-11 số)'),
  address: z.string().min(5, 'Địa chỉ quá ngắn'),
  city: z.string().min(2, 'Vui lòng nhập Tỉnh/Thành phố'),
  paymentMethod: z.enum(['COD', 'VNPAY'])
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { data: profile } = useProfile();
  const { data: addresses } = useAddresses();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'COD'
    }
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để đặt hàng!', 'warning');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setValue('email', profile.email || '');
    }
    
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        const nameParts = defaultAddr.receiverName?.trim().split(' ') || [];
        const lastName = nameParts.length > 0 ? nameParts[0] : '';
        const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (nameParts.length === 1 ? ' ' : '');
        
        setValue('lastName', lastName);
        setValue('firstName', firstName);
        setValue('phone', defaultAddr.phone || profile?.phone || '');
        setValue('address', `${defaultAddr.streetAddress}, ${defaultAddr.ward}, ${defaultAddr.district}`);
        setValue('city', defaultAddr.city || '');
      }
    } else if (profile) {
       setValue('phone', profile.phone || '');
       if (profile.fullName) {
          const nameParts = profile.fullName.trim().split(' ');
          setValue('lastName', nameParts.length > 0 ? nameParts[0] : '');
          setValue('firstName', nameParts.length > 1 ? nameParts.slice(1).join(' ') : (nameParts.length === 1 ? ' ' : ''));
       }
    }
  }, [profile, addresses, setValue]);

  if (!isAuthenticated) return null;

  const defaultShippingFee = Number(settings?.SHIPPING_FEE_DEFAULT || 30000);
  const freeShippingThreshold = Number(settings?.FREE_SHIPPING_THRESHOLD || 500000);
  
  const subtotal = cartTotal;
  const shipping = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
  const total = subtotal + shipping;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const isFreeShipping = remainingForFreeShipping <= 0;

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        customerName: `${data.lastName} ${data.firstName}`,
        customerPhone: data.phone,
        shippingAddress: `${data.address}, ${data.city}`,
        paymentMethod: data.paymentMethod,
        shippingFee: shipping,
        items: cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };

      const orderResponse = await api.post('/orders', orderData);
      
      if (data.paymentMethod === 'VNPAY') {
        const paymentResponse = await api.post('/payments/create-vnpay', {
          orderId: orderResponse.data.id,
          amount: total,
          bankCode: ''
        });
        // Redirect to VNPAY
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        clearCart();
        showToast('Đặt hàng thành công!', 'success');
        navigate('/payment-result?method=COD'); // Tái sử dụng trang PaymentResult cho mượt
      }
    } catch (error: any) {
      console.error('Lỗi khi đặt hàng:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi đặt hàng, vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb / Stepper */}
        <div className="flex items-center text-sm mb-8 text-gray-500 font-medium">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/cart')}>Giỏ hàng</span>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900">Thanh toán</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Form */}
          <div className="flex-1 space-y-8">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Thanh toán</h1>
            
            {/* Contact Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Mail className="text-primary" size={24} />
                Thông tin liên hệ
              </h2>
              
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Địa chỉ Email"
                    {...register('email')}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-2 ml-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-primary" size={24} />
                Địa chỉ giao hàng
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Họ"
                        {...register('lastName')}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-sm mt-2 ml-1">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Tên"
                        {...register('firstName')}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-sm mt-2 ml-1">{errors.firstName.message}</p>}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin size={20} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Số nhà, Tên đường, Phường/Xã"
                      {...register('address')}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-2 ml-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Thành phố / Tỉnh"
                      {...register('city')}
                      className={`w-full px-4 py-4 rounded-xl border ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-2 ml-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone size={20} className="text-gray-400" />
                      </div>
                      <input 
                        type="tel" 
                        placeholder="Số điện thoại"
                        {...register('phone')}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-2 ml-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-primary" size={24} />
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-4">
                {/* COD Option */}
                <div 
                  onClick={() => setValue('paymentMethod', 'COD')}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all ${
                    paymentMethod === 'COD' 
                      ? 'border-gray-900 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-gray-900' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-3 h-3 rounded-full bg-gray-900" />}
                    </div>
                    <Truck size={28} className={paymentMethod === 'COD' ? 'text-gray-900' : 'text-gray-500'} />
                    <div>
                      <h3 className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</h3>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi giao hàng</p>
                    </div>
                  </div>
                </div>

                {/* VNPAY Option */}
                <div 
                  onClick={() => setValue('paymentMethod', 'VNPAY')}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all ${
                    paymentMethod === 'VNPAY' 
                      ? 'border-[#005BAA] bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'VNPAY' ? 'border-[#005BAA]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'VNPAY' && <div className="w-3 h-3 rounded-full bg-[#005BAA]" />}
                    </div>
                    <div className="font-black text-[#005BAA] text-xl px-1">VNPAY</div>
                    <div>
                      <h3 className="font-bold text-gray-900">Thanh toán qua VNPAY</h3>
                      <p className="text-sm text-gray-500">Thanh toán an toàn qua ví điện tử / thẻ ngân hàng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-black uppercase tracking-widest mb-4 border-b pb-4">Đơn hàng của bạn</h2>
              
              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <Truck size={20} className={isFreeShipping ? 'text-green-500' : 'text-gray-400'} />
                <div>
                  {isFreeShipping ? (
                    <span className="text-sm font-bold text-green-600">Tuyệt vời! Bạn được Freeship.</span>
                  ) : (
                    <span className="text-sm text-gray-600">
                      Mua thêm <span className="font-bold text-primary">{remainingForFreeShipping.toLocaleString('vi-VN')}đ</span> để được Miễn phí vận chuyển.
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {cartItems.map(item => (
                  <div key={item.variantId} className="flex items-start gap-4">
                    <div className="relative">
                      <img src={item.image} className="w-16 h-20 object-cover rounded-lg border border-gray-100 shadow-sm" />
                      <span className="absolute -top-2 -right-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Phân loại: {item.variantName}</p>
                    </div>
                    <span className="font-bold text-sm text-gray-900 py-1">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm mb-6 border-y py-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Tạm tính</span>
                  <span className="font-bold text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Phí vận chuyển</span>
                  <span className="font-bold text-gray-900">{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-500 uppercase tracking-widest">Tổng cộng</span>
                <span className="text-3xl font-black text-primary">{total.toLocaleString('vi-VN')}đ</span>
              </div>

              <button 
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full h-16 bg-gray-900 text-white font-bold uppercase tracking-widest text-lg rounded-xl hover:bg-black hover:shadow-lg transition-all disabled:bg-gray-300 disabled:hover:shadow-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Hoàn tất đặt hàng'
                )}
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Bằng cách đặt hàng, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của MIA.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
