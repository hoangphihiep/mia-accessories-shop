import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Star, ArrowDownToLine, LogOut, Users, Tags, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard },
    { name: 'Bán hàng (POS)', href: '/admin/pos', icon: ShoppingBag },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Nhập kho', href: '/admin/inventory', icon: ArrowDownToLine },
    { name: 'Đánh giá', href: '/admin/reviews', icon: Star },
  ];

  // Các chức năng chỉ dành cho ADMIN
  if (user?.role?.name === 'ROLE_ADMIN') {
    navigation.splice(1, 0, { name: 'Nhân sự', href: '/admin/users', icon: Users });
    navigation.splice(2, 0, { name: 'Khách hàng', href: '/admin/customers', icon: Users });
    navigation.splice(5, 0, { name: 'Danh mục', href: '/admin/categories', icon: Tags });
    navigation.splice(7, 0, { name: 'Nhà cung cấp', href: '/admin/suppliers', icon: Building2 });
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-gray-900 selection:bg-primary selection:text-white">
      {/* Sidebar - Premium Dark Mode */}
      <aside className="w-64 bg-[#0a0a0a] flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link to="/" className="text-2xl font-black tracking-widest text-white flex items-center gap-2 hover:scale-105 transition-transform">
            MIA<span className="text-gray-500">.</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Menu quản trị</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-inner translate-x-1' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon className={`mr-4 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 text-gray-500 group-hover:text-gray-300'}`} size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="mr-4 group-hover:scale-110 transition-transform" size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative flex flex-col">
        {/* Glassmorphism Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 flex items-center px-10 justify-between sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black uppercase tracking-widest text-gray-800">
              {navigation.find(n => n.href === location.pathname)?.name || 'Bảng điều khiển'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col text-right">
                <span className="text-sm font-black text-gray-800">{user?.fullName || 'Admin'}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{user?.role?.name === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-inner border-2 border-white">
                {user?.fullName?.substring(0, 2) || 'AD'}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
