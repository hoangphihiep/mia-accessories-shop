import { useState, useEffect } from 'react';
import { Search, Check, X, Printer, Package, MapPin, CreditCard, Phone, User, ChevronRight, ShoppingBag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const { showToast } = useToast();

  const tabs = ['All', 'PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
      
      // Update selectedOrder if it's currently open
      if (selectedOrder) {
        const updated = response.data.find((o: any) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
      fetchOrders();
    } catch (error) {
      showToast('Lỗi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab;
    const matchSearch = o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        o.customerPhone?.includes(searchTerm) ||
                        o.id.toString().includes(searchTerm);
    return matchTab && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'SHIPPING': return 'bg-sky-50 text-sky-600 border-sky-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'HOÀN THÀNH';
      case 'PENDING': return 'CHỜ XỬ LÝ';
      case 'CANCELLED': return 'ĐÃ HỦY';
      case 'SHIPPING': return 'ĐANG GIAO';
      default: return status;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)]">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      <div className="print:hidden relative flex w-full h-[calc(100vh-6rem)] overflow-hidden">
      
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col gap-6 bg-white/50 backdrop-blur-xl shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Đơn hàng</h2>
              <p className="text-gray-400 text-sm mt-1">Theo dõi và xử lý các đơn hàng trên hệ thống</p>
            </div>
            
            <div className="relative flex-1 md:max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm mã đơn, tên, SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-gray-100 w-full overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-t-lg'
                }`}
              >
                {tab === 'All' ? 'TẤT CẢ' : getStatusText(tab)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-5 pl-8 border-b border-gray-100 w-24">Mã Đơn</th>
                <th className="p-5 border-b border-gray-100">Khách hàng</th>
                <th className="p-5 border-b border-gray-100">Tổng tiền</th>
                <th className="p-5 border-b border-gray-100">Trạng thái</th>
                <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`border-b border-gray-50 transition-colors group cursor-pointer
                    ${selectedOrder?.id === order.id ? 'bg-gray-50/80' : 'hover:bg-gray-50/50'}`}
                >
                  <td className="p-5 pl-8">
                    <div className="font-black text-gray-900">#{order.id}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-gray-900">{order.customerName}</div>
                    <div className="text-[11px] font-bold tracking-wider text-gray-400 mt-0.5">{order.customerPhone}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-black text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                      {order.paymentMethod || 'CASH'} {order.isPaid ? '· ĐÃ THANH' : ''}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="p-5 pr-8 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button onClick={(e) => updateStatus(order.id, 'SHIPPING', e)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Giao hàng">
                            <Package size={16} />
                          </button>
                          <button onClick={(e) => updateStatus(order.id, 'CANCELLED', e)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Hủy đơn">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {order.status === 'SHIPPING' && (
                        <button onClick={(e) => updateStatus(order.id, 'COMPLETED', e)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100" title="Đã giao xong">
                          <Check size={16} />
                        </button>
                      )}
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors ml-2" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Không tìm thấy đơn hàng nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={() => setSelectedOrder(null)}
        />
      )}

      {/* Side Drawer */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full lg:w-[400px] bg-white shadow-2xl border-l border-gray-100 flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${
          selectedOrder ? 'translate-x-0' : 'translate-x-[110%]'
        }`}
      >
        {selectedOrder && (
          <>
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
              <div>
                <h3 className="font-black text-xl text-gray-900">Đơn hàng #{selectedOrder.id}</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all shadow-sm border border-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              
              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border ${getStatusBadge(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
                
                {selectedOrder.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(selectedOrder.id, 'SHIPPING')} className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      GIAO HÀNG
                    </button>
                    <button onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">
                      HỦY
                    </button>
                  </div>
                )}
                {selectedOrder.status === 'SHIPPING' && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'COMPLETED')} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">
                    ĐÃ HOÀN THÀNH
                  </button>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Thông tin Khách hàng</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-600">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-600 leading-relaxed">{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Staff Info (Cashier) */}
              {selectedOrder.createdBy && (
                <div className="bg-sky-50/50 rounded-2xl p-5 border border-sky-100">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-sky-500 mb-4">Nhân viên thu ngân</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-sky-500" />
                    <span className="font-bold text-sky-900">{selectedOrder.createdBy.fullName}</span>
                    <span className="text-sky-600 bg-sky-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-auto">STAFF</span>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Sản phẩm ({selectedOrder.orderDetails?.length || 0})</h4>
                <div className="space-y-4">
                  {selectedOrder.orderDetails?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.productVariant?.imageUrl ? (
                          <img src={item.productVariant.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="font-bold text-gray-900 text-sm line-clamp-2">
                          {item.productVariant?.productName || 'Sản phẩm'}
                        </div>
                        {item.productVariant?.name && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Phân loại: <span className="font-medium text-gray-700">{item.productVariant.name}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                          <span className="font-black text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-100 pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Tạm tính</span>
                    <span className="font-bold text-gray-900">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Phí vận chuyển</span>
                    <span className="font-bold text-gray-900">0đ</span>
                  </div>
                  <div className="pt-3 flex justify-between items-center border-t border-gray-100 border-dashed">
                    <span className="text-gray-900 font-black uppercase tracking-wider">Tổng cộng</span>
                    <span className="font-black text-xl text-primary">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-600">{selectedOrder.paymentMethod || 'CASH'}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedOrder.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                    {selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
              <button 
                onClick={() => window.print()}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                <span>In Hóa Đơn</span>
              </button>
            </div>
          </>
        )}
      </div>

      </div>

      {/* PRINT UI (Invoice) */}
      {selectedOrder && (
        <div className="hidden print:block print:static w-full text-black p-8 bg-white font-sans">
          <div className="text-center mb-8 border-b border-gray-300 pb-6">
            <h1 className="text-2xl font-black uppercase tracking-widest mb-2">MIA ACCESSORIES</h1>
            <p className="text-sm text-gray-600">HÓA ĐƠN BÁN HÀNG</p>
            <p className="text-sm font-bold mt-2">Mã đơn: #{selectedOrder.id}</p>
            <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Thông tin khách hàng</h2>
            <p className="text-sm"><span className="font-semibold">Khách hàng:</span> {selectedOrder.customerName}</p>
            <p className="text-sm"><span className="font-semibold">Điện thoại:</span> {selectedOrder.customerPhone}</p>
            <p className="text-sm"><span className="font-semibold">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
            {selectedOrder.createdBy && (
              <p className="text-sm mt-3 pt-3 border-t border-gray-100"><span className="font-semibold">Thu ngân:</span> {selectedOrder.createdBy.fullName}</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Chi tiết đơn hàng</h2>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2">Sản phẩm</th>
                  <th className="py-2 text-center">SL</th>
                  <th className="py-2 text-right">Đơn giá</th>
                  <th className="py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.orderDetails?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="font-medium">{item.productVariant?.productName || 'Sản phẩm'}</div>
                      {item.productVariant?.name && (
                        <div className="text-xs text-gray-500 mt-0.5">{item.productVariant.name}</div>
                      )}
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{item.price.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 text-right font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí ship:</span>
                <span>0đ</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Tổng cộng:</span>
                <span>{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-16 text-sm text-gray-500">
            <p>Cảm ơn quý khách đã mua sắm tại Mia Accessories!</p>
            <p>Hẹn gặp lại quý khách.</p>
          </div>
        </div>
      )}
    </>
  );
}
