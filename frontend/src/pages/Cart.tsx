import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';

const MOCK_CART = [
  { id: 1, name: 'Minimalist Silver Ring', price: 450000, quantity: 1, variant: 'Silver', image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=200' },
  { id: 2, name: 'Classic Gold Chain', price: 850000, quantity: 2, variant: 'Gold', image: 'https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=200' },
];

export default function Cart() {
  const navigate = useNavigate();
  const subtotal = MOCK_CART.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Your Cart</h1>
      
      {MOCK_CART.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-500 mb-8">Your cart is currently empty.</p>
          <Link to="/shop" className="bg-primary text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="border-t border-b py-4 mb-4 hidden md:flex text-sm font-bold uppercase tracking-widest text-gray-400">
              <div className="w-1/2">Product</div>
              <div className="w-1/6 text-center">Quantity</div>
              <div className="w-1/6 text-right">Price</div>
              <div className="w-1/6 text-right">Total</div>
            </div>
            
            {MOCK_CART.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row items-center py-6 border-b gap-4">
                <div className="w-full md:w-1/2 flex items-center gap-4">
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                  <img src={item.image} alt={item.name} className="w-24 h-30 object-cover bg-gray-100" />
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">Color: {item.variant}</p>
                    <p className="md:hidden text-primary mt-2">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
                
                <div className="w-full md:w-1/6 flex justify-center">
                  <div className="flex items-center border border-gray-300 h-10">
                    <button className="px-3 text-gray-500 hover:text-primary transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button className="px-3 text-gray-500 hover:text-primary transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
                
                <div className="hidden md:block w-1/6 text-right text-gray-500">
                  {item.price.toLocaleString('vi-VN')}đ
                </div>
                
                <div className="w-full md:w-1/6 text-right font-bold text-lg md:text-base flex justify-between md:block">
                  <span className="md:hidden text-gray-500 font-normal">Total:</span>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-8">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6 border-b pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between text-xl font-black mb-8">
                <span>Total</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Checkout
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
