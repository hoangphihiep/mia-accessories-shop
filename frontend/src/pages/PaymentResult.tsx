import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paramsString = searchParams.toString();
        if (!paramsString) {
          setStatus('error');
          setMessage('Không có dữ liệu thanh toán.');
          return;
        }

        const response = await api.get(`/payments/vnpay-return?${paramsString}`);
        
        if (response.data.status === 'success') {
          setStatus('success');
          clearCart(); // Chỉ xóa giỏ hàng khi thanh toán thành công
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Thanh toán không thành công.');
        }
      } catch (error: any) {
        console.error('Lỗi khi xác thực thanh toán:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực.');
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 size={64} className="text-gray-900 animate-spin mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Đang xác thực...</h2>
            <p className="text-gray-500">Vui lòng chờ trong giây lát. Không đóng trình duyệt lúc này.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-green-600 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-8">Đơn hàng của bạn đã được ghi nhận. Cảm ơn bạn đã mua sắm tại MIA.</p>
            <div className="flex flex-col gap-3 w-full">
              <Link to="/track-order" className="w-full py-4 bg-gray-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                Theo dõi đơn hàng
              </Link>
              <Link to="/" className="w-full py-4 bg-gray-100 text-gray-900 font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors">
                Trở về trang chủ
              </Link>
            </div>
          </div>
        )}

        {(status === 'failed' || status === 'error') && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <XCircle size={80} className="text-red-500 mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-red-600 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="flex flex-col gap-3 w-full">
              <Link to="/checkout" className="w-full py-4 bg-gray-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                Thử thanh toán lại
              </Link>
              <Link to="/cart" className="w-full py-4 bg-gray-100 text-gray-900 font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors">
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
