import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    phone: '',
    paymentMethod: 'COD'
  });

  // Giả lập giỏ hàng (Trong thực tế sẽ lấy từ Context/Redux)
  const cartItems = [
    { id: 1, variantId: 1, name: 'Minimalist Silver Ring', price: 450000, quantity: 1, variant: 'Silver' }
  ];
  const subtotal = 450000;
  const shipping = 30000;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt hàng!');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}`,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };

      const orderResponse = await api.post('/orders', orderData);
      
      if (formData.paymentMethod === 'VNPAY') {
        const paymentResponse = await api.post('/payments/create-vnpay', {
          orderId: orderResponse.data.id,
          amount: total,
          bankCode: ''
        });
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        alert('Đặt hàng thành công!');
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Đã xảy ra lỗi khi đặt hàng, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Checkout</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Contact Information</h2>
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 p-4 mb-4 focus:outline-none focus:border-primary transition-colors" 
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="First Name" 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" 
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" 
              />
            </div>
            <input 
              type="text" 
              placeholder="Address" 
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 p-4 mb-4 focus:outline-none focus:border-primary transition-colors" 
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="City" 
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" 
              />
              <input 
                type="tel" 
                placeholder="Phone" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" 
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Payment Method</h2>
            <div className="border border-gray-300 divide-y divide-gray-300">
              <label className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="payment" 
                  value="COD" 
                  checked={formData.paymentMethod === 'COD'}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="accent-primary w-4 h-4" 
                />
                <span className="font-bold">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="payment" 
                  value="VNPAY" 
                  checked={formData.paymentMethod === 'VNPAY'}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="accent-primary w-4 h-4" 
                />
                <span className="font-bold text-blue-600">Thanh toán qua VNPAY</span>
              </label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-primary text-white font-bold uppercase tracking-widest text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Complete Order'}
          </button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 p-8 sticky top-24">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Order Items</h2>
            
            {cartItems.map(item => (
              <div key={item.id} className="space-y-4 mb-6 border-b pb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=200" className="w-16 h-20 object-cover" />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.variant}</p>
                  </div>
                  <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            ))}

            <div className="space-y-4 text-sm mb-6 border-b pb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold">{shipping.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            
            <div className="flex justify-between text-2xl font-black mb-8">
              <span>Total</span>
              <span>{total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
