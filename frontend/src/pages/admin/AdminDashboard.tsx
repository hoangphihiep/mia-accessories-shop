import { DollarSign, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useRecentOrders } from '../../hooks/useAdmin';

export default function AdminDashboard() {
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
  const { data: ordersData = [], isLoading: isOrdersLoading } = useRecentOrders();

  const stats = {
    totalOrders: statsData?.totalOrders || 0,
    totalRevenue: statsData?.totalRevenue || 0,
    lowStockItems: statsData?.lowStockItems || 0
  };

  const recentOrders = [...ordersData]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isStatsLoading || isOrdersLoading) return <div className="p-12 text-center">Loading...</div>;

  const STATS_CARDS = [
    { name: 'Tổng Doanh Thu', value: `${stats.totalRevenue.toLocaleString('vi-VN')}đ`, icon: DollarSign, color: 'text-green-500' },
    { name: 'Tổng Đơn Hàng', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-500' },
    { name: 'Sản phẩm sắp hết', value: stats.lowStockItems.toString(), icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS_CARDS.map((stat) => (
          <div key={stat.name} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-primary">
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.name}</h3>
            <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-black uppercase tracking-widest text-lg">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-sm font-bold text-primary hover:text-gray-500 transition-colors uppercase tracking-wider">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                <th className="p-4 font-bold border-b">Mã Đơn</th>
                <th className="p-4 font-bold border-b">Khách hàng</th>
                <th className="p-4 font-bold border-b">Ngày đặt</th>
                <th className="p-4 font-bold border-b">Tổng tiền</th>
                <th className="p-4 font-bold border-b">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold">#{order.id}</td>
                  <td className="p-4">{order.customerName}</td>
                  <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
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
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
