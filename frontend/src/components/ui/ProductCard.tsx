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
    <Link to={`/product/${product.id}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100/60">
      {/* Image Box */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={mainImage} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
        />
        
        {/* Overlay Button */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={16} /> Xem chi tiết
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-red-100">
              Hết hàng
            </span>
          )}
          {!isOutOfStock && product.id > 2 && ( // Logic tượng trưng cho badge Mới
             <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
               Mới
             </span>
          )}
        </div>
      </div>
      
      {/* Info Box */}
      <div className="p-6 flex flex-col flex-1">
        <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
          {product.category?.name || 'Accessories'}
        </span>
        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-3 group-hover:text-gray-600 transition-colors leading-tight">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-extrabold text-gray-900">
            {price ? price.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}
          </p>
        </div>
      </div>
    </Link>
  );
}
