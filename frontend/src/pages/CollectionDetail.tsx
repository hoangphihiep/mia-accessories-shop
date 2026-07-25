import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCollection } from '../hooks/useCollections';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: collection, isLoading, isError } = useCollection(slug || '');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-3xl font-black mb-4">Không tìm thấy bộ sưu tập</h2>
        <p className="text-gray-500 mb-8">Bộ sưu tập bạn đang tìm kiếm không tồn tại hoặc đã bị ẩn.</p>
        <Link to="/collections" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Xem tất cả bộ sưu tập
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-[60vh] md:h-[80vh] w-full bg-gray-900 overflow-hidden">
        <img 
          src={collection.bannerImage || collection.coverImage} 
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <p className="text-white/80 uppercase tracking-[0.5em] font-bold mb-6 text-sm md:text-base animate-in fade-in slide-in-from-bottom-8 duration-1000">Bộ Sưu Tập</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-widest text-white mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            {collection.name}
          </h1>
          <div className="w-24 h-1 bg-white/30 animate-in fade-in zoom-in duration-1000 delay-300"></div>
        </div>

        <button 
          onClick={() => navigate('/collections')}
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold"
        >
          <ArrowLeft size={20} /> Trở lại
        </button>
      </div>

      {/* Storytelling Section */}
      <div className="py-24 bg-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900 mb-8">Cảm hứng thiết kế</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium italic">
            "{collection.description}"
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-24">
        <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-12 text-center">Khám phá các sản phẩm</h3>
        
        {(!collection.products || collection.products.length === 0) ? (
          <div className="text-center text-gray-500 py-12">
            Đang cập nhật sản phẩm cho bộ sưu tập này.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
            {collection.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
