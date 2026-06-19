import { Link } from 'react-router-dom';

export default function Checkout() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Checkout</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Contact Information</h2>
            <input type="email" placeholder="Email Address" className="w-full border border-gray-300 p-4 mb-4 focus:outline-none focus:border-primary transition-colors" />
            <label className="flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" className="accent-primary" />
              <span>Email me with news and offers</span>
            </label>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="First Name" className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" />
              <input type="text" placeholder="Last Name" className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <input type="text" placeholder="Address" className="w-full border border-gray-300 p-4 mb-4 focus:outline-none focus:border-primary transition-colors" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="City" className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" />
              <input type="text" placeholder="Postal Code" className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <input type="tel" placeholder="Phone" className="w-full border border-gray-300 p-4 focus:outline-none focus:border-primary transition-colors" />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Payment Method</h2>
            <div className="border border-gray-300 divide-y divide-gray-300">
              <label className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="payment" value="cod" className="accent-primary w-4 h-4" defaultChecked />
                <span className="font-bold">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="payment" value="vnpay" className="accent-primary w-4 h-4" />
                <span className="font-bold text-blue-600">Thanh toán qua VNPAY</span>
              </label>
            </div>
          </div>

          <button className="w-full h-16 bg-primary text-white font-bold uppercase tracking-widest text-lg hover:bg-gray-800 transition-colors">
            Complete Order
          </button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 p-8 sticky top-24">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Order Items</h2>
            
            <div className="space-y-4 mb-6 border-b pb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=200" className="w-16 h-20 object-cover" />
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Minimalist Silver Ring</h4>
                  <p className="text-xs text-gray-500">Silver</p>
                </div>
                <span className="font-bold text-sm">450,000đ</span>
              </div>
            </div>

            <div className="space-y-4 text-sm mb-6 border-b pb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">450,000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold">30,000đ</span>
              </div>
            </div>
            
            <div className="flex justify-between text-2xl font-black mb-8">
              <span>Total</span>
              <span>480,000đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
