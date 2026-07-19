import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="border-b border-gray-100/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="md:hidden text-gray-900 hover:text-gray-600 transition-colors">
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="text-3xl font-black tracking-tighter uppercase text-gray-900 flex-shrink-0">
          MIA.
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-10">
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors relative group">
            Shop
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/collections" className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors relative group">
            Collections
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Icons & Actions */}
        <div className="flex items-center space-x-6">
          {location.pathname !== '/shop' && (
            <form onSubmit={handleSearch} className="relative hidden md:block w-64">
              <input 
                type="text" 
                placeholder="Search products..." 
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
              <Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-colors relative group" title="Cart">
                <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors group" title="Profile">
                <User size={22} className="group-hover:scale-110 transition-transform" />
              </Link>
              <button onClick={logout} className="text-gray-600 hover:text-red-600 transition-colors group" title="Logout">
                <LogOut size={22} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 group" title="Login">
              <User size={22} className="group-hover:scale-110 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
