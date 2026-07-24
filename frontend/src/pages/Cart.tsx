import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../hooks/useSettings';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để xem giỏ hàng!', 'warning');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const freeShippingThreshold = Number(settings?.FREE_SHIPPING_THRESHOLD || 500000);
  const remainingForFreeShipping = freeShippingThreshold - cartTotal;
  const isFreeShipping = remainingForFreeShipping <= 0;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={32} className="text-primary" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Giỏ hàng của bạn</h1>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Chưa có sản phẩm nào trong giỏ hàng của bạn. Hãy tiếp tục khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-8 h-14 bg-gray-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items Column */}
            <div className="flex-1 space-y-4">
              {/* Shipping Progress Bar */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFreeShipping ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    {isFreeShipping ? (
                      <h3 className="font-bold text-green-600">Chúc mừng! Bạn đã được Miễn phí vận chuyển.</h3>
                    ) : (
                      <h3 className="font-bold text-gray-900">
                        Mua thêm <span className="text-primary">{remainingForFreeShipping.toLocaleString('vi-VN')}đ</span> để được Freeship!
                      </h3>
                    )}
                  </div>
                </div>
                {!isFreeShipping && (
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((cartTotal / freeShippingThreshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {cartItems.map(item => (
                <div key={item.variantId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                  
                  {/* Image & Info */}
                  <div className="flex-1 flex items-center gap-6 w-full">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl border border-gray-100 bg-gray-50" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Phân loại: {item.variantName}</p>
                      <p className="text-primary font-bold mt-2 md:hidden">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                  
                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-8">
                    
                    {/* Quantity Control */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-10 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)} 
                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            if (item.quantity >= item.stockQuantity) {
                              showToast(`Chỉ còn ${item.stockQuantity} sản phẩm trong kho!`, 'warning');
                            } else {
                              updateQuantity(item.variantId, item.quantity + 1);
                            }
                          }} 
                          className={`w-10 h-full flex items-center justify-center transition-colors ${item.quantity >= item.stockQuantity ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                          disabled={item.quantity >= item.stockQuantity}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {item.quantity >= item.stockQuantity && (
                         <span className="text-xs text-red-500 font-medium">Đạt giới hạn tồn kho</span>
                      )}
                    </div>
                    
                    {/* Desktop Price */}
                    <div className="hidden md:block text-right w-28">
                      <div className="text-sm text-gray-500 line-through hidden">Giá cũ</div>
                      <div className="font-bold text-lg text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.variantId)} 
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Column */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                <h2 className="text-xl font-black uppercase tracking-widest mb-6 border-b pb-4 text-gray-900">Tổng đơn hàng</h2>
                
                <div className="space-y-4 text-sm mb-6 border-b pb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-bold text-gray-900">{cartTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Phí vận chuyển</span>
                    <span className="text-gray-500">Tính khi thanh toán</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold text-gray-500 uppercase tracking-widest">Tổng cộng</span>
                  <span className="text-3xl font-black text-primary">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full h-16 bg-gray-900 text-white font-bold uppercase tracking-widest text-lg rounded-xl hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Tiến hành thanh toán
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
