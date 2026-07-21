import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Giỏ hàng của bạn</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-500 mb-8">Giỏ hàng của bạn hiện đang trống.</p>
          <Link to="/shop" className="bg-primary text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="border-t border-b py-4 mb-4 hidden md:flex text-sm font-bold uppercase tracking-widest text-gray-400">
              <div className="w-1/2">Sản phẩm</div>
              <div className="w-1/6 text-center">Số lượng</div>
              <div className="w-1/6 text-right">Đơn giá</div>
              <div className="w-1/6 text-right">Tổng cộng</div>
            </div>
            
            {cartItems.map(item => (
              <div key={item.variantId} className="flex flex-col md:flex-row items-center py-6 border-b gap-4">
                <div className="w-full md:w-1/2 flex items-center gap-4">
                  <button onClick={() => removeFromCart(item.variantId)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                  <img src={item.image} alt={item.name} className="w-24 h-30 object-cover bg-gray-100" />
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">Mẫu/Size: {item.variantName}</p>
                    <p className="md:hidden text-primary mt-2">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
                
                <div className="w-full md:w-1/6 flex justify-center">
                  <div className="flex items-center border border-gray-300 h-10">
                    <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="px-3 text-gray-500 hover:text-primary transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="px-3 text-gray-500 hover:text-primary transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
                
                <div className="hidden md:block w-1/6 text-right text-gray-500">
                  {item.price.toLocaleString('vi-VN')}đ
                </div>
                
                <div className="w-full md:w-1/6 text-right font-bold text-lg md:text-base flex justify-between md:block">
                  <span className="md:hidden text-gray-500 font-normal">Tổng:</span>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-8">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6">Tổng đơn hàng</h2>
              
              <div className="space-y-4 text-sm mb-6 border-b pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-bold">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span>Tính khi thanh toán</span>
                </div>
              </div>
              
              <div className="flex justify-between text-xl font-black mb-8">
                <span>Tổng cộng</span>
                <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Tiến hành thanh toán
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
