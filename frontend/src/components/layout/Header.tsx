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
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-1 border border-gray-300 text-sm focus:outline-none focus:border-black"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
              <Search size={16} />
            </button>
          </form>

          {/* Mobile Search Icon (simplification: shows on mobile but real input is hidden, for MVP just keeping the layout clean) */}
          <button className="md:hidden hover:text-gray-500 transition-colors">
            <Search size={20} />
          </button>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="hover:text-gray-500 transition-colors relative" title="Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="hover:text-gray-500 transition-colors" title="Profile">
                <User size={20} />
              </Link>
              <button onClick={logout} className="hover:text-gray-500 transition-colors" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-gray-500 transition-colors flex items-center gap-1" title="Login">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
