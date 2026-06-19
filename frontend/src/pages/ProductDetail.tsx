import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import api from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
        if (response.data.images && response.data.images.length > 0) {
          setActiveImage(response.data.images[0].url);
        } else {
          setActiveImage('https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }

  const fallbackImages = ['https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800'];
  const images = product.images?.length > 0 ? product.images.map((img: any) => img.url) : fallbackImages;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-8 uppercase tracking-widest font-bold">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-primary">{product.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Images */}
        <div className="w-full md:w-1/2 flex gap-4">
          <div className="flex flex-col gap-4 w-20 flex-shrink-0">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(img)}
                className={`aspect-[4/5] border-2 ${activeImage === img ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[4/5] bg-gray-100">
            <img src={activeImage} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">{product.name}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-primary">
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" className="text-gray-300" />
            </div>
            <span className="text-sm text-gray-500 font-bold">4.8 Rating</span>
          </div>

          <p className="text-2xl font-light mb-8">
            {selectedVariant ? selectedVariant.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">{product.description || 'No description available.'}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Mẫu sản phẩm</h3>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-3 border text-sm font-bold uppercase tracking-wider transition-colors ${
                      selectedVariant?.id === variant.id ? 'border-primary bg-primary text-white' : 'border-gray-300 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {variant.name} (Tồn: {variant.stockQuantity})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-300 h-14">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-gray-500 hover:text-primary transition-colors">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-gray-500 hover:text-primary transition-colors">
                <Plus size={16} />
              </button>
            </div>
            
            <button className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>

          <div className="border-t pt-8 text-sm text-gray-500 space-y-2">
            <p><strong className="text-primary uppercase">SKU:</strong> MIA-{product.id}</p>
            <p><strong className="text-primary uppercase">Category:</strong> {product.category?.name || 'N/A'}</p>
            <p><strong className="text-primary uppercase">Material:</strong> {product.material?.name || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
