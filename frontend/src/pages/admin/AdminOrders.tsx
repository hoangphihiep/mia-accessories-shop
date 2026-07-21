import { useState, useEffect } from 'react';
import { Search, Check, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = ['All', 'PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      fetchOrders(); // Refresh
    } catch (error) {
      alert('Lỗi cập nhật trạng thái đơn hàng');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab;
    const matchSearch = o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        o.customerPhone?.includes(searchTerm) ||
                        o.id.toString().includes(searchTerm);
    return matchTab && matchSearch;
  });

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[calc(100vh-9rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex flex-col gap-6 bg-white/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Đơn hàng</h2>
            <p className="text-gray-400 text-sm mt-1">Theo dõi và xử lý các đơn hàng trên hệ thống</p>
          </div>
          
          <div className="relative flex-1 md:max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm đơn hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
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
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <th className="p-5 pl-8 border-b border-gray-100 w-24">Mã Đơn</th>
              <th className="p-5 border-b border-gray-100">Ngày đặt</th>
              <th className="p-5 border-b border-gray-100">Khách hàng</th>
              <th className="p-5 border-b border-gray-100">Tổng tiền</th>
              <th className="p-5 border-b border-gray-100">Trạng thái</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                <td className="p-5 pl-8 font-bold text-gray-400">#{order.id}</td>
                <td className="p-5 text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="p-5">
                  <div className="font-bold text-gray-900">{order.customerName}</div>
                  <div className="text-[11px] font-bold tracking-wider text-gray-400 mt-0.5">{order.customerPhone}</div>
                  <div className="text-xs text-gray-400 max-w-xs truncate mt-0.5" title={order.shippingAddress}>{order.shippingAddress}</div>
                </td>
                <td className="p-5 font-black text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                <td className="p-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                    ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      'bg-sky-50 text-sky-600 border-sky-100'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-5 pr-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {order.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(order.id, 'SHIPPING')} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Giao hàng">
                        <Check size={18} />
                      </button>
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Hủy đơn">
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {order.status === 'SHIPPING' && (
                    <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100" title="Đã giao xong">
                      <Check size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                  Không tìm thấy đơn hàng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
