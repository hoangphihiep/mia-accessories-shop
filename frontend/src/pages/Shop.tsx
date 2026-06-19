import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Minimalist Silver Ring', price: '450,000đ', category: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Classic Gold Chain', price: '850,000đ', category: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Pearl Drop Earrings', price: '320,000đ', category: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Engraved Cuff Bracelet', price: '550,000đ', category: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'Geometric Studs', price: '250,000đ', category: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800' },
  { id: 6, name: 'Chunky Signet Ring', price: '500,000đ', category: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800' },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">All Products</h1>
          <p className="text-gray-500 font-light">Explore our complete collection of minimalist accessories.</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-6 md:mt-0">
          <button className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider hover:text-gray-600 transition-colors">
            <span>Sort By</span>
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider hover:text-gray-600 transition-colors md:hidden">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="font-bold uppercase tracking-widest text-sm mb-6">Categories</h3>
            <ul className="space-y-4">
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm hover:text-primary transition-colors ${activeCategory === cat ? 'text-primary font-bold' : 'text-gray-500'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="font-bold uppercase tracking-widest text-sm mb-6 mt-12">Price Range</h3>
            <div className="space-y-4">
              {['Under 300k', '300k - 500k', 'Over 500k'].map(price => (
                <label key={price} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-primary border-gray-300 rounded-none cursor-pointer" />
                  <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">{price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full bg-white text-primary py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors">
                      Quick Add
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-500">{product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
