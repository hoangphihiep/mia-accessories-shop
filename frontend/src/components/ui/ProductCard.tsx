import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { ProductResponse } from '../../types';

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800';
  const mainImage = product.images && product.images.length > 0 ? product.images[0].imageUrl : fallbackImage;
  
  // Check stock
  const totalStock = product.variants ? product.variants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) : 0;
  const isOutOfStock = totalStock === 0;
  const price = product.variants && product.variants.length > 0 ? product.variants[0].price : 0;

  return (
    <Link to={`/product/${product.slug || product.id}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 border border-gray-100">
      {/* Image Box */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={mainImage} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
        />
        
        {/* Overlay Button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
          <span className="bg-white/95 backdrop-blur-md text-gray-900 px-6 py-3 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <Eye size={16} /> Xem chi tiết
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="bg-red-50/90 backdrop-blur-sm text-red-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm border border-red-100">
              Hết hàng
            </span>
          )}
          {!isOutOfStock && product.isNew && (
             <span className="bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
               Mới
             </span>
          )}
          {!isOutOfStock && product.isFeatured && (
             <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
               Nổi bật
             </span>
          )}
        </div>
      </div>
      
      {/* Info Box */}
      <div className="p-6 md:p-8 flex flex-col flex-1 bg-white relative z-10">
        <span className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">
          {product.category?.name || 'Accessories'}
        </span>
        <h3 className="font-bold text-gray-900 text-lg md:text-xl line-clamp-2 mb-4 group-hover:text-gray-500 transition-colors leading-tight">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
            {price ? price.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}
          </p>
        </div>
      </div>
    </Link>
  );
}
