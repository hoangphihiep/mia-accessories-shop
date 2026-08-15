import { DollarSign, ShoppingBag, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useRecentOrders, useDailyProductSales, useTopProducts, useProductStats } from '../../hooks/useAdmin';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts';

import { useState } from 'react';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productChartType, setProductChartType] = useState<'quantity' | 'revenue'>('quantity');
  
  // Use debounced or direct values depending on user action. For simplicity, pass directly.
  const queryStartDate = timeRange === 'custom' && startDate && endDate ? startDate : undefined;
  const queryEndDate = timeRange === 'custom' && startDate && endDate ? endDate : undefined;

  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useDashboardStats(timeRange, queryStartDate, queryEndDate);
  const { data: ordersData = [], isLoading: isOrdersLoading, isError: isOrdersError } = useRecentOrders();
  const { data: salesData = [], isLoading: isSalesLoading } = useDailyProductSales(timeRange, queryStartDate, queryEndDate);
  const { data: topProductsData = [], isLoading: isProductsLoading } = useTopProducts(timeRange, queryStartDate, queryEndDate);
  const { data: productStatsData = [], isLoading: isProductStatsLoading } = useProductStats(timeRange, queryStartDate, queryEndDate);

  const scatterData: any[] = [];
  salesData.forEach((day: any) => {
    if (day.productsData) {
      day.productsData.forEach((p: any) => {
        scatterData.push({
          date: day.date,
          productName: p.name,
          quantity: p.quantity,
          revenue: p.revenue,
          z: productChartType === 'quantity' ? p.quantity : p.revenue
        });
      });
    }
  });

  const getTimeLabel = () => {
    switch (timeRange) {
      case 'thisWeek': return 'Tuần Này';
      case 'lastMonth': return 'Tháng Trước';
      case 'thisYear': return 'Năm Nay';
      case 'custom': return 'Tùy Chỉnh';
      case 'thisMonth':
      default: return 'Tháng Này';
    }
  };

  const getCompareLabel = () => {
    switch (timeRange) {
      case 'thisWeek': return 'SO VỚI TUẦN TRƯỚC';
      case 'lastMonth': return 'SO VỚI THÁNG KỀ TRƯỚC';
      case 'thisYear': return 'SO VỚI NĂM TRƯỚC';
      case 'custom': return 'SO VỚI KỲ TRƯỚC';
      case 'thisMonth':
      default: return 'SO VỚI THÁNG TRƯỚC';
    }
  };

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

  if (isStatsLoading || isOrdersLoading || isSalesLoading || isProductsLoading || isProductStatsLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );

  const STATS_CARDS = [
    {
      name: `Doanh Thu ${getTimeLabel()}`,
      value: `${stats.revenueThisMonth.toLocaleString('vi-VN')}đ`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      trend: stats.revenueTrend
    },
    {
      name: `Đơn Hàng ${getTimeLabel()}`,
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
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Bảng Điều Khiển</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng quan tình hình kinh doanh của bạn</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            <button 
              onClick={() => setTimeRange('thisWeek')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'thisWeek' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Tuần này
            </button>
            <button 
              onClick={() => setTimeRange('thisMonth')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'thisMonth' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Tháng này
            </button>
            <button 
              onClick={() => setTimeRange('lastMonth')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'lastMonth' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Tháng trước
            </button>
            <button 
              onClick={() => setTimeRange('thisYear')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'thisYear' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Năm nay
            </button>
            <button 
              onClick={() => setTimeRange('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'custom' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Tùy chỉnh
            </button>
          </div>
          
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary" 
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat) => (
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
                  <span className="text-[11px] font-bold text-gray-400 tracking-wider">{getCompareLabel()}</span>
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
                Sản lượng bán ra
              </h2>
              <p className="text-gray-400 text-sm mt-1">Số lượng sản phẩm và các mặt hàng được mua theo kỳ</p>
            </div>
          </div>
          <div className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                          <p className="font-black text-gray-900 mb-2">{label}</p>
                          <p className="text-emerald-600 font-bold mb-1">
                            Tổng SP: {data.totalQuantity}
                          </p>
                          {data.productsDetail && (
                            <div className="text-xs text-gray-500 mt-2 border-t pt-2 max-w-[200px]">
                              <span className="font-bold text-gray-700 block mb-1">Mặt hàng:</span>
                              {data.productsDetail}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="totalQuantity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
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
              <p className="text-gray-400 text-sm mt-1">5 sản phẩm hot nhất kỳ</p>
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
                  <h4 className="font-bold text-gray-900 truncate" title={item.productName}>{item.productName}</h4>
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
                <p className="text-sm text-center mt-1">Chưa có sản phẩm nào được bán ra trong thời gian này.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Product Stats Line Charts Row */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Combined Product Stats Line Chart */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-xl">
            <div>
              <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-2">
                {productChartType === 'quantity' ? <ShoppingBag size={24} className="text-blue-500" /> : <DollarSign size={24} className="text-amber-500" />}
                Thống kê Tất cả Sản phẩm
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {productChartType === 'quantity' ? 'Tổng số lượng bán ra của mỗi mặt hàng trong kỳ' : 'Tổng doanh thu mang lại của mỗi mặt hàng trong kỳ'}
              </p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() => setProductChartType('quantity')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${productChartType === 'quantity' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Theo Số Lượng
              </button>
              <button
                onClick={() => setProductChartType('revenue')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${productChartType === 'revenue' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Theo Doanh Thu
              </button>
            </div>
          </div>
          <div className="p-6 h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  type="category" 
                  dataKey="date" 
                  name="Ngày" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  type="category" 
                  dataKey="productName" 
                  name="Sản phẩm" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }} 
                  dx={-10} 
                  tickFormatter={(value) => value.substring(0, 15) + (value.length > 15 ? '...' : '')}
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  range={[50, 400]} 
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                          <p className="font-black text-gray-900 mb-1">{data.date}</p>
                          <p className="text-gray-600 text-sm mb-2 font-medium">{data.productName}</p>
                          {productChartType === 'quantity' ? (
                            <p className="text-blue-600 font-bold">Bán ra: {data.quantity} sp</p>
                          ) : (
                            <p className="text-amber-600 font-bold">Doanh thu: {data.revenue.toLocaleString('vi-VN')}đ</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Sản phẩm" 
                  data={scatterData} 
                  fill={productChartType === 'quantity' ? '#3b82f6' : '#f59e0b'} 
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
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
                      {order.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                       order.status === 'PENDING' ? 'CHỜ XỬ LÝ' :
                       order.status === 'CANCELLED' ? 'ĐÃ HỦY' :
                       order.status === 'SHIPPING' ? 'ĐANG GIAO' : order.status}
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
