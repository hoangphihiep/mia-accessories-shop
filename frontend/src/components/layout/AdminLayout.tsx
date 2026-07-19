import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Star, ArrowDownToLine, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Nhập kho', href: '/admin/inventory', icon: ArrowDownToLine },
    { name: 'Đánh giá', href: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary">
            MIA. ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <item.icon className="mr-3 flex-shrink-0" size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-3 py-3 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-xl font-black uppercase tracking-widest text-primary">Control Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500">Welcome, Admin</span>
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        </header>
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
