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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-black uppercase tracking-widest text-xl mb-6">Quản lý Đơn hàng</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex space-x-2 border-b border-gray-200 w-full md:w-auto overflow-x-auto">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm đơn hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
              <th className="p-4 font-bold border-b">Mã Đơn</th>
              <th className="p-4 font-bold border-b">Ngày đặt</th>
              <th className="p-4 font-bold border-b">Khách hàng</th>
              <th className="p-4 font-bold border-b">Tổng tiền</th>
              <th className="p-4 font-bold border-b">Trạng thái</th>
              <th className="p-4 font-bold border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">#{order.id}</td>
                <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">
                  <div className="font-bold">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.customerPhone}</div>
                  <div className="text-xs text-gray-400 max-w-xs truncate" title={order.shippingAddress}>{order.shippingAddress}</div>
                </td>
                <td className="p-4 font-bold">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(order.id, 'SHIPPING')} className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" title="Giao hàng">
                        <Check size={16} />
                      </button>
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" title="Hủy đơn">
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {order.status === 'SHIPPING' && (
                    <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="Đã giao xong">
                      <Check size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Không tìm thấy đơn hàng nào.
          </div>
        )}
      </div>
    </div>
  );
}
