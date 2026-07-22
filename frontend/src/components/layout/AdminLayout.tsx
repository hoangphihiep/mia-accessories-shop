import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Star, ArrowDownToLine, LogOut, Users, Tags, Building2, Layers, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = navRef.current;
      setShowScrollIndicator(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 5);
    }
  };

  useEffect(() => {
    // Check initially and slightly after mount to ensure DOM is ready
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

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
    navigation.splice(6, 0, { name: 'Chất liệu', href: '/admin/materials', icon: Layers });
    navigation.splice(8, 0, { name: 'Nhà cung cấp', href: '/admin/suppliers', icon: Building2 });
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-gray-900 selection:bg-primary selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Premium Dark Mode */}
      <aside className={`print:hidden w-64 bg-[#0a0a0a] flex flex-col fixed h-full z-50 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link to="/" className="text-2xl font-black tracking-widest text-white flex items-center gap-2 hover:scale-105 transition-transform">
            MIA<span className="text-gray-500">.</span>
          </Link>
        </div>
        
        <nav ref={navRef} onScroll={checkScroll} className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar relative">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Menu quản trị</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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
        
        {/* Scroll Indicator */}
        <div className={`absolute bottom-[76px] left-0 w-full h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent flex items-end justify-center pb-2 pointer-events-none transition-opacity duration-300 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
          <ChevronDown className="text-gray-400 animate-bounce" size={20} />
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/20 z-10 relative">
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
      <main className="flex-1 print:ml-0 lg:ml-64 min-h-screen relative flex flex-col print:bg-white print:min-h-0 w-full max-w-full overflow-hidden transition-[margin] duration-300">
        {/* Glassmorphism Header */}
        <header className="print:hidden h-20 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 flex items-center px-4 lg:px-10 justify-between sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-black uppercase tracking-widest text-gray-800 hidden sm:block">
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
        
        <div key={location.pathname} className="print:p-0 print:block p-8 flex-1 animate-page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
