import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary">
            MIA.
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/shop" className="text-sm font-semibold hover:text-gray-600 transition-colors uppercase tracking-wider">
            All Products
          </Link>
          <Link to="/shop?category=rings" className="text-sm font-semibold hover:text-gray-600 transition-colors uppercase tracking-wider">
            Rings
          </Link>
          <Link to="/shop?category=necklaces" className="text-sm font-semibold hover:text-gray-600 transition-colors uppercase tracking-wider">
            Necklaces
          </Link>
          <Link to="/shop?category=earrings" className="text-sm font-semibold hover:text-gray-600 transition-colors uppercase tracking-wider">
            Earrings
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-5">
          <button className="text-primary hover:text-gray-600 transition-colors">
            <Search size={20} />
          </button>
          <Link to="/profile" className="text-primary hover:text-gray-600 transition-colors">
            <User size={20} />
          </Link>
          <Link to="/cart" className="text-primary hover:text-gray-600 transition-colors relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
