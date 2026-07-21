import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      <header className="border-b border-gray-100/50 bg-white/80 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-900 hover:text-gray-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-3xl font-black tracking-tighter uppercase text-gray-900 flex-shrink-0">
            MIA.
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors relative group">
              Cửa hàng
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/collections" className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors relative group">
              Bộ sưu tập
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors relative group">
              Về chúng tôi
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-6">
            {location.pathname !== '/shop' && (
              <form onSubmit={handleSearch} className="relative hidden md:block w-64">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-100/80 border-transparent rounded-full pl-5 pr-10 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-inner"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                  <Search size={18} />
                </button>
              </form>
            )}

            {/* Mobile Search Icon */}
            {location.pathname !== '/shop' && (
              <button className="md:hidden text-gray-600 hover:text-gray-900 transition-colors" onClick={() => navigate('/shop')}>
                <Search size={22} />
              </button>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-5">
                <Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-all hover:scale-110 active:scale-95 relative group" title="Giỏ hàng">
                  <ShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="hidden sm:block text-gray-600 hover:text-gray-900 transition-all hover:scale-110 active:scale-95" title="Hồ sơ">
                  <User size={22} />
                </Link>
                <button onClick={logout} className="hidden sm:block text-gray-600 hover:text-red-600 transition-all hover:scale-110 active:scale-95" title="Đăng xuất">
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex text-gray-600 hover:text-gray-900 transition-colors items-center gap-1 group" title="Đăng nhập">
                <User size={22} className="group-hover:scale-110 transition-transform" />
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">MIA.</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
              {/* Mobile Search inside Menu */}
              {location.pathname !== '/shop' && (
                <form onSubmit={handleSearch} className="relative w-full mb-8">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 border-transparent rounded-xl pl-5 pr-10 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </button>
                </form>
              )}

              <nav className="flex flex-col space-y-5">
                <Link to="/shop" className="text-lg font-bold uppercase tracking-wider text-gray-900 hover:text-primary transition-colors">
                  Cửa hàng
                </Link>
                <Link to="/collections" className="text-lg font-bold uppercase tracking-wider text-gray-900 hover:text-primary transition-colors">
                  Bộ sưu tập
                </Link>
                <Link to="/about" className="text-lg font-bold uppercase tracking-wider text-gray-900 hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </nav>

              <hr className="border-gray-100" />

              {/* Mobile Auth Links */}
              <div className="flex flex-col space-y-5">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 font-medium">
                      <User size={20} /> Hồ sơ của tôi
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-red-600 hover:text-red-700 font-medium text-left">
                      <LogOut size={20} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 font-medium">
                    <User size={20} /> Đăng nhập / Đăng ký
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
