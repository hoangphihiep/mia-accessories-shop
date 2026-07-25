import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, LogOut, X, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '../../services/user.service';

export default function Header() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => UserService.getMe(),
    enabled: isAuthenticated,
  });

  const displayUser = profile || user;

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border-b border-gray-100' : 'bg-white/70 backdrop-blur-sm border-b border-transparent'}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-24'}`}>
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-900 hover:text-gray-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-3xl font-black tracking-tighter uppercase text-gray-900 flex-shrink-0 relative group">
            MIA<span className="text-gray-400">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-12">
            <Link to="/shop" className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors relative group py-2">
              Cửa hàng
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/collections" className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors relative group py-2">
              Bộ sưu tập
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors relative group py-2">
              Về chúng tôi
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-6">
            {location.pathname !== '/shop' && (
              <form onSubmit={handleSearch} className="relative hidden md:block group">
                <div className="flex items-center border-b border-gray-300 hover:border-gray-900 transition-colors duration-300 focus-within:border-gray-900 w-48 focus-within:w-64 ease-out">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  />
                  <button type="submit" className="text-gray-400 group-hover:text-gray-900 transition-colors py-1 pl-2">
                    <Search size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </form>
            )}

            {/* Mobile Search Icon */}
            {location.pathname !== '/shop' && (
              <button className="md:hidden text-gray-900 hover:text-gray-500 transition-colors" onClick={() => navigate('/shop')}>
                <Search size={22} strokeWidth={1.5} />
              </button>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link to="/cart" className="text-gray-900 hover:text-gray-500 transition-all relative group" title="Giỏ hàng">
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative group hidden sm:block">
                  <Link to="/profile" className="text-gray-900 hover:text-gray-500 transition-all flex items-center cursor-pointer py-2">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold tracking-widest ring-2 ring-transparent group-hover:ring-gray-200 transition-all overflow-hidden">
                      {displayUser?.avatar || (displayUser as any)?.avatarUrl ? (
                        <img src={displayUser?.avatar || (displayUser as any)?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(displayUser?.fullName)
                      )}
                    </div>
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl w-56 py-3 flex flex-col overflow-hidden relative before:content-[''] before:absolute before:-top-2 before:right-3 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-gray-100">
                      <div className="px-5 py-3 border-b border-gray-50 mb-2 relative z-10 bg-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center text-sm font-bold border border-gray-100 overflow-hidden">
                          {displayUser?.avatar || (displayUser as any)?.avatarUrl ? (
                            <img src={displayUser?.avatar || (displayUser as any)?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(displayUser?.fullName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{displayUser?.fullName}</p>
                          <p className="text-[10px] text-gray-400 truncate">{displayUser?.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" className="px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 relative z-10 transition-colors">
                          <LayoutDashboard size={16} strokeWidth={2} /> Trang quản trị
                        </Link>
                      )}
                      <Link to="/profile" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 relative z-10 transition-colors">
                        <User size={16} strokeWidth={2} /> Hồ sơ cá nhân
                      </Link>
                      <Link to="/profile?tab=orders" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 relative z-10 transition-colors">
                        <Package size={16} strokeWidth={2} /> Đơn hàng
                      </Link>
                      <div className="h-px bg-gray-50 my-2 relative z-10"></div>
                      <button onClick={logout} className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 text-left w-full relative z-10 transition-colors">
                        <LogOut size={16} strokeWidth={2} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex text-gray-900 hover:text-gray-500 transition-colors items-center gap-2 group py-2" title="Đăng nhập">
                <span className="text-[11px] font-bold uppercase tracking-widest hidden lg:block">Đăng nhập</span>
                <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">MIA<span className="text-gray-300">.</span></span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
              {/* Mobile Search inside Menu */}
              {location.pathname !== '/shop' && (
                <form onSubmit={handleSearch} className="relative w-full">
                  <div className="flex items-center border-b-2 border-gray-200 focus-within:border-gray-900 transition-colors">
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none py-3 text-sm focus:outline-none focus:ring-0"
                    />
                    <button type="submit" className="text-gray-900">
                      <Search size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </form>
              )}

              <nav className="flex flex-col space-y-6">
                <Link to="/shop" className="text-lg font-black uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors">
                  Cửa hàng
                </Link>
                <Link to="/collections" className="text-lg font-black uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors">
                  Bộ sưu tập
                </Link>
                <Link to="/about" className="text-lg font-black uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors">
                  Về chúng tôi
                </Link>
              </nav>

              <hr className="border-gray-100" />

              {/* Mobile Auth Links */}
              <div className="flex flex-col space-y-6">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-4 text-blue-600 hover:text-blue-700 font-bold">
                        <LayoutDashboard size={22} strokeWidth={1.5} /> Trang quản trị
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-4 text-gray-700 hover:text-gray-900 font-bold">
                      <User size={22} strokeWidth={1.5} /> Hồ sơ của tôi
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 text-red-600 hover:text-red-700 font-bold text-left">
                      <LogOut size={22} strokeWidth={1.5} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-4 text-gray-700 hover:text-gray-900 font-bold">
                    <User size={22} strokeWidth={1.5} /> Đăng nhập / Đăng ký
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
