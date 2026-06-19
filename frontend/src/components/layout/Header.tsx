import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="md:hidden">
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="text-3xl font-black tracking-tighter uppercase">
          MIA.
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Shop</Link>
          <Link to="/collections" className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Collections</Link>
          <Link to="/about" className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">About</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          <button className="hover:text-gray-500 transition-colors">
            <Search size={20} />
          </button>
          
          {isAuthenticated ? (
            <button onClick={logout} className="hover:text-gray-500 transition-colors flex items-center gap-1" title="Logout">
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/login" className="hover:text-gray-500 transition-colors flex items-center gap-1" title="Login">
              <User size={20} />
            </Link>
          )}

          <Link to="/cart" className="hover:text-gray-500 transition-colors relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
