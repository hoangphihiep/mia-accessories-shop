import { useState } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OrderTracking() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { showToast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/orders/track?phone=${phone.trim()}`);
      setOrders(response.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      showToast('Không tìm thấy đơn hàng hoặc có lỗi xảy ra.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-center">Tra cứu đơn hàng</h1>
        <p className="text-gray-500 text-center mb-8">Nhập số điện thoại của bạn để xem tình trạng đơn hàng.</p>
        
        <form onSubmit={handleSearch} className="relative mb-12">
          <input 
            type="tel" 
            placeholder="Nhập số điện thoại..." 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border-2 border-gray-200 p-4 pr-12 focus:border-primary focus:outline-none text-lg"
          />
          <button type="submit" disabled={loading} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-black transition-colors">
            {loading ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div> : <Search size={24} />}
          </button>
        </form>

        {hasSearched && orders.length === 0 && (
          <div className="text-center text-gray-500">
            Không tìm thấy đơn hàng nào với số điện thoại này.
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="border p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <span className="font-bold uppercase tracking-widest text-sm">Đơn hàng #{order.id}</span>
                    <p className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">{order.status}</span>
                </div>
                
                <div className="mb-4 text-sm text-gray-600">
                  <p><strong>Người nhận:</strong> {order.customerName}</p>
                  <p><strong>Giao đến:</strong> {order.shippingAddress}</p>
                  <p><strong>Thanh toán:</strong> {order.paymentMethod} - {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                </div>

                {(order.expectedCompletionDate || order.expectedDeliveryDate || order.trackingCode) && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-100 text-sm">
                    <h4 className="font-bold text-amber-900 mb-2 uppercase tracking-widest text-xs">Tiến độ dự kiến</h4>
                    {order.expectedCompletionDate && (
                      <p className="text-amber-800">Dự kiến hoàn thành: <span className="font-bold">{new Date(order.expectedCompletionDate).toLocaleDateString('vi-VN')}</span></p>
                    )}
                    {order.expectedDeliveryDate && (
                      <p className="text-amber-800">Dự kiến giao hàng: <span className="font-bold">{new Date(order.expectedDeliveryDate).toLocaleDateString('vi-VN')}</span></p>
                    )}
                    {order.trackingCode && (
                      <div className="text-amber-800 mt-2 pt-2 border-t border-amber-200/50 flex justify-between">
                        <span>Mã vận đơn:</span>
                        <span className="font-black tracking-wider">{order.trackingCode}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {order.orderDetails?.map((detail: any) => (
                    <div key={detail.id} className="flex justify-between text-sm">
                      <span>{detail.quantity}x {detail.productVariant?.productName || 'Sản phẩm'} - {detail.productVariant?.name || 'Phân loại'}</span>
                      <span className="text-gray-500">{(detail.price * detail.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Tạm tính (Tiền hàng)</span>
                    <span>{(order.totalAmount - (order.shippingFee || 0)).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>Phí vận chuyển</span>
                    <span>{(order.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-dashed border-gray-200 pt-3">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
