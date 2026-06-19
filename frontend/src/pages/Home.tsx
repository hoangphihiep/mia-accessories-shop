import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FEATURED_PRODUCTS = [
  { id: 1, name: 'Minimalist Silver Ring', price: '450,000đ', image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Classic Gold Chain', price: '850,000đ', image: 'https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Pearl Drop Earrings', price: '320,000đ', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Engraved Cuff Bracelet', price: '550,000đ', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800' },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase">Essentials <br/> Collection</h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg mx-auto font-light">Elevate your everyday look with our curated selection of premium, minimalist accessories.</p>
          <Link to="/shop" className="inline-flex items-center space-x-2 bg-white text-primary px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
            <span>Shop Now</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">New Arrivals</h2>
            <p className="text-gray-500">The latest additions to our signature collection.</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider hover:text-gray-500 transition-colors mt-4">
            View All <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_PRODUCTS.map(product => (
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
        
        <div className="mt-8 text-center md:hidden">
          <Link to="/shop" className="inline-flex items-center text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1">
            View All Products
          </Link>
        </div>
      </section>
      
      {/* Category Banners */}
      <section className="py-12 bg-accent">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/shop?category=rings" className="relative h-96 group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-3xl font-black uppercase tracking-widest border-2 border-white px-8 py-4">Rings</h3>
                </div>
            </Link>
            <Link to="/shop?category=necklaces" className="relative h-96 group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-3xl font-black uppercase tracking-widest border-2 border-white px-8 py-4">Necklaces</h3>
                </div>
            </Link>
        </div>
      </section>
    </div>
  );
}
