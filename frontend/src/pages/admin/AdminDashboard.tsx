import { DollarSign, ShoppingBag, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useRecentOrders, useDailyRevenue, useTopProducts } from '../../hooks/useAdmin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function AdminDashboard() {
  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useDashboardStats();
  const { data: ordersData = [], isLoading: isOrdersLoading, isError: isOrdersError } = useRecentOrders();
  const { data: revenueData = [], isLoading: isRevenueLoading } = useDailyRevenue();
  const { data: topProductsData = [], isLoading: isProductsLoading } = useTopProducts();

  const stats = {
    revenueThisMonth: statsData?.revenueThisMonth || 0,
    ordersThisMonth: statsData?.ordersThisMonth || 0,
    revenueTrend: statsData?.revenueTrend || 0,
    ordersTrend: statsData?.ordersTrend || 0,
    pendingOrders: statsData?.pendingOrders || 0,
    lowStockItems: statsData?.lowStockItems || 0
  };

  const recentOrders = ordersData || [];

  if (isStatsError || isOrdersError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-rose-100 shadow-sm p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops! Mất kết nối máy chủ</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Không thể tải dữ liệu bảng điều khiển lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị viên hệ thống.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
        >
          Thử lại ngay
        </button>
      </div>
    );
  }

  if (isStatsLoading || isOrdersLoading || isRevenueLoading || isProductsLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );

  const STATS_CARDS = [
    { 
      name: 'Doanh Thu Tháng Này', 
      value: `${stats.revenueThisMonth.toLocaleString('vi-VN')}đ`, 
      icon: DollarSign, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100',
      trend: stats.revenueTrend
    },
    { 
      name: 'Đơn Hàng Tháng Này', 
      value: stats.ordersThisMonth.toString(), 
      icon: ShoppingBag, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100',
      trend: stats.ordersTrend
    },
    { 
      name: 'Đơn Chờ Xử Lý', 
      value: stats.pendingOrders.toString(), 
      icon: AlertCircle, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50', 
      border: 'border-amber-100'
    },
    { 
      name: 'Sản Phẩm Sắp Hết', 
      value: stats.lowStockItems.toString(), 
      icon: AlertCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50', 
      border: 'border-rose-100'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat, i) => (
          <div key={stat.name} 
               className={`bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group ${stat.value !== '0' && stat.name === 'Đơn Chờ Xử Lý' ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
              <stat.icon size={100} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 shadow-sm border ${stat.border}`}>
                  <stat.icon size={28} className={stat.color} />
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</h3>
                <p className="text-3xl font-black tracking-tighter text-gray-900">{stat.value}</p>
              </div>
              
              {stat.trend !== undefined && (
                <div className="mt-4 flex items-center gap-1.5">
                  <div className={`flex items-center text-[11px] font-black tracking-wider px-2 py-1 rounded-full ${stat.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {stat.trend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                    {Math.abs(stat.trend)}%
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 tracking-wider">SO VỚI THÁNG TRƯỚC</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-xl">
            <div>
              <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-2">
                <TrendingUp size={24} className="text-emerald-500" />
                Biểu đồ Doanh thu
              </h2>
              <p className="text-gray-400 text-sm mt-1">Biến động doanh thu theo từng ngày trong tháng</p>
            </div>
          </div>
          <div className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  tickFormatter={(value) => `${value / 1000000}M`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-xl">
            <div>
              <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-2">
                <Trophy size={24} className="text-amber-500" />
                Top Bán Chạy
              </h2>
              <p className="text-gray-400 text-sm mt-1">5 sản phẩm hot nhất tháng</p>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4">
            {topProductsData.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm
                  ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                    index === 1 ? 'bg-gray-100 text-gray-600' : 
                    index === 2 ? 'bg-orange-100 text-orange-600' : 
                    'bg-slate-50 text-slate-400'}`}>
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{item.productName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">{item.totalSold} <span className="text-xs text-gray-400 font-medium">sp</span></div>
                </div>
              </div>
            ))}
            {topProductsData.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                <Trophy size={48} className="mb-4 text-gray-200" />
                <p className="font-bold text-gray-500">Chưa có dữ liệu</p>
                <p className="text-sm text-center mt-1">Chưa có sản phẩm nào được bán ra trong tháng này.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-xl">
          <div>
            <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Đơn hàng gần đây</h2>
            <p className="text-gray-400 text-sm mt-1">Các giao dịch mới nhất trên hệ thống</p>
          </div>
          <Link to="/admin/orders" className="flex items-center gap-2 text-sm font-bold text-primary hover:text-gray-600 transition-colors uppercase tracking-wider bg-gray-50 px-5 py-2.5 rounded-full hover:bg-gray-100">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
                <th className="p-5 pl-8 border-b border-gray-100">Mã Đơn</th>
                <th className="p-5 border-b border-gray-100">Khách hàng</th>
                <th className="p-5 border-b border-gray-100">Ngày đặt</th>
                <th className="p-5 border-b border-gray-100">Tổng tiền</th>
                <th className="p-5 pr-8 border-b border-gray-100">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                  <td className="p-5 pl-8 font-bold text-gray-900">#{order.id}</td>
                  <td className="p-5 font-medium text-gray-600">{order.customerName}</td>
                  <td className="p-5 text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-5 font-black text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                  <td className="p-5 pr-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                      ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        'bg-sky-50 text-sky-600 border-sky-100'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ShoppingBag size={48} className="mb-4 text-gray-200" />
                      <p className="font-bold text-lg text-gray-500">Chưa có đơn hàng nào.</p>
                      <p className="text-sm">Các đơn hàng mới sẽ xuất hiện ở đây.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
