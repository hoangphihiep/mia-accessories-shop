import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFeaturedProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
export default function Home() {
  const { data: featuredData } = useFeaturedProducts(4);
  const featuredProducts = featuredData?.content || [];

  return (
    <div className="w-full bg-white font-sans selection:bg-gray-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4 flex flex-col items-center mt-10">
          <span className="text-sm font-bold tracking-[0.3em] uppercase mb-6 text-white/80">Bộ sưu tập mùa hè</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter uppercase leading-tight">
            BỘ SƯU TẬP <br/> THIẾT YẾU
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-lg mx-auto font-light text-white/90">
            Nâng tầm phong cách mỗi ngày với bộ sưu tập phụ kiện tinh tế, tối giản và sang trọng.
          </p>
          <Link to="/shop" className="inline-flex items-center space-x-3 bg-white text-gray-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
            <span>Mua sắm ngay</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-gray-900">Hàng mới về</h2>
            <p className="text-gray-500 text-lg">Những tuyệt tác mới nhất vừa được cập bến.</p>
          </div>
          <Link to="/shop" className="group hidden md:flex items-center text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-gray-600 transition-colors">
            Xem tất cả <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link to="/shop" className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-1">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>
      
      {/* Category Banners */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/shop?category=Tâm linh" className="relative h-[450px] group overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500">
                <img src="https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"/>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-4xl font-black uppercase tracking-widest mb-4">Tâm linh</h3>
                    <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border-b border-white pb-1 font-medium">Khám phá ngay</span>
                </div>
            </Link>
            <Link to="/shop?category=Phong thủy" className="relative h-[450px] group overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500">
                <img src="https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"/>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-4xl font-black uppercase tracking-widest mb-4">Phong thủy</h3>
                    <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border-b border-white pb-1 font-medium">Khám phá ngay</span>
                </div>
            </Link>
        </div>
      </section>
    </div>
  );
}
