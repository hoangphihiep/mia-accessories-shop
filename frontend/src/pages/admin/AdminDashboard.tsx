import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const STATS = [
  { name: 'Total Revenue', value: '45,231,000đ', change: '+12%', icon: DollarSign, trend: 'up' },
  { name: 'Total Orders', value: '156', change: '+8%', icon: ShoppingBag, trend: 'up' },
  { name: 'Active Customers', value: '2,405', change: '+4%', icon: Users, trend: 'up' },
  { name: 'Conversion Rate', value: '3.2%', change: '-1%', icon: TrendingUp, trend: 'down' },
];

const RECENT_ORDERS = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', total: '450,000đ', status: 'PENDING', date: '2026-06-19' },
  { id: 'ORD-002', customer: 'Trần Thị B', total: '1,200,000đ', status: 'COMPLETED', date: '2026-06-18' },
  { id: 'ORD-003', customer: 'Lê Văn C', total: '320,000đ', status: 'SHIPPING', date: '2026-06-18' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.name} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-primary">
                <stat.icon size={24} />
              </div>
              <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.name}</h3>
            <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-black uppercase tracking-widest text-lg">Recent Orders</h2>
          <button className="text-sm font-bold text-primary hover:text-gray-500 transition-colors uppercase tracking-wider">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                <th className="p-4 font-bold border-b">Order ID</th>
                <th className="p-4 font-bold border-b">Customer</th>
                <th className="p-4 font-bold border-b">Date</th>
                <th className="p-4 font-bold border-b">Total</th>
                <th className="p-4 font-bold border-b">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold">{order.id}</td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4 text-gray-500">{order.date}</td>
                  <td className="p-4 font-bold">{order.total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
