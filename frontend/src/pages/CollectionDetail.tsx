import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCollection } from '../hooks/useCollections';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: collection, isLoading, isError } = useCollection(slug || '');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (product.variants && product.variants.length > 0) {
      // Navigate to product detail if it has variants to let user choose
      navigate(`/product/${product.id}`);
    } else {
      addToCart({ productId: product.id, quantity: 1 });
    }
  };

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
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-serif italic">
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
              <Link key={product.id} to={`/product/${product.id}`} className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-50">
                <div className="aspect-[4/5] relative bg-gray-100 overflow-hidden">
                  <img 
                    src={product.images && product.images.length > 0 ? `http://localhost:8080/api/v1/files/${product.images[0].url}` : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop'} 
                    alt={product.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.images && product.images.length > 1 && (
                    <img 
                      src={`http://localhost:8080/api/v1/files/${product.images[1].url}`}
                      alt={product.name} 
                      className="object-cover w-full h-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  )}
                  
                  {/* Quick Add to Cart */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/60 to-transparent">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full bg-white text-gray-900 font-bold uppercase tracking-widest text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      <ShoppingBag size={14} /> Thêm vào giỏ
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900">{(product.variants?.[0]?.price || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
