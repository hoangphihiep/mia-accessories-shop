import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, User, ChevronRight, Check } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useProductReviews, useCreateReview } from '../hooks/useReviews';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading: loading } = useProduct(id as string);
  const { data: reviewsData } = useProductReviews(id as string);
  const { mutateAsync: submitReview, isPending: submittingReview } = useCreateReview();

  const reviews = reviewsData || [];

  useEffect(() => {
    if (product) {
      if (product.variants?.length > 0 && !selectedVariant) {
        setSelectedVariant(product.variants[0]);
      }
      if (product.images?.length > 0 && !activeImage) {
        setActiveImage(product.images[0].imageUrl);
      } else if (!activeImage) {
        setActiveImage('https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800');
      }
    }
  }, [product, selectedVariant, activeImage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Không tìm thấy sản phẩm.</div>;
  }

  const fallbackImages = ['https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800'];
  const images = product.images?.length > 0 ? product.images.map((img: any) => img.imageUrl) : fallbackImages;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white pb-24">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium text-gray-500 mb-10">
          <Link to="/" className="hover:text-gray-900 transition-colors">Trang chủ</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <Link to="/shop" className="hover:text-gray-900 transition-colors">Cửa hàng</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left: Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse sm:flex-row gap-4 sm:gap-6">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-2 sm:pb-0 sm:w-24 flex-shrink-0">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-[4/5] rounded-xl overflow-hidden transition-all duration-300 ${
                    activeImage === img 
                      ? 'ring-2 ring-gray-900 ring-offset-2 opacity-100' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} thumbnail ${idx}`} />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 shadow-sm relative group">
              <img 
                src={activeImage} 
                className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" 
                alt={product.name}
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                {product.category?.name || 'Accessories'}
              </span>
              {selectedVariant?.stockQuantity === 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                  Hết hàng
                </span>
              )}
            </div>

            {/* Title & Price */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-gray-900 mb-6">
              {selectedVariant ? selectedVariant.price.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center text-gray-900">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < Math.round(reviews.length > 0 ? reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length : 5) ? "currentColor" : "none"} className={i < Math.round(reviews.length > 0 ? reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length : 5) ? "" : "text-gray-200"} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer underline decoration-gray-300 underline-offset-4">
                {reviews.length} đánh giá
              </span>
            </div>

            {/* Description */}
            <p className="text-base text-gray-600 leading-relaxed mb-10">
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </p>

            <hr className="border-gray-100 mb-10" />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Chọn mẫu / Kích cỡ</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((variant: any) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stockQuantity === 0;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          if (variant.imageUrl) setActiveImage(variant.imageUrl);
                        }}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-sm transition-all duration-300 ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md ring-1 ring-gray-900 ring-offset-1 scale-[1.02]'
                            : isOutOfStock
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">{variant.name}</span>
                        <span className={`text-xs mt-1 ${isSelected ? 'text-gray-300' : isOutOfStock ? 'text-gray-400' : 'text-gray-500'}`}>
                          {isOutOfStock ? 'Hết hàng' : `Còn ${variant.stockQuantity}`}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-white">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border border-gray-200 rounded-xl h-14 px-2 w-full sm:w-32 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-semibold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              {/* Add Button */}
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Vui lòng đăng nhập để sử dụng giỏ hàng!', 'info');
                    navigate('/login');
                    return;
                  }
                  if (!selectedVariant) {
                    showToast('Vui lòng chọn mẫu sản phẩm', 'error');
                    return;
                  }
                  if (selectedVariant.stockQuantity < quantity) {
                    showToast('Sản phẩm không đủ số lượng trong kho', 'error');
                    return;
                  }
                  addToCart({
                    variantId: selectedVariant.id,
                    productId: product.id,
                    name: product.name,
                    price: selectedVariant.price,
                    quantity: quantity,
                    variantName: selectedVariant.name,
                    image: activeImage
                  });
                  showToast('Đã thêm vào giỏ hàng!', 'success');
                }}
                disabled={selectedVariant?.stockQuantity === 0}
                className={`flex-1 h-14 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  selectedVariant?.stockQuantity === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                <ShoppingCart size={20} />
                <span>{selectedVariant?.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</span>
              </button>
            </div>

            {/* Meta Info */}
            <div className="flex flex-col gap-3 text-sm text-gray-500 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between">
                <span>Mã sản phẩm (SKU)</span>
                <span className="font-medium text-gray-900">MIA-{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Danh mục</span>
                <span className="font-medium text-gray-900">{product.category?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Chất liệu</span>
                <span className="font-medium text-gray-900">{product.material?.name || 'N/A'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="border-t border-gray-100 pt-16">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Reviews List */}
            <div className="w-full lg:w-2/3">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Đánh giá từ khách hàng</h2>
              <div className="space-y-8">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
                  </div>
                ) : (
                  reviews.map((rev: any) => (
                    <div key={rev.id} className="pb-8 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{rev.user?.fullName || 'Khách hàng'}</div>
                          <div className="flex text-gray-900 text-xs mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-200"} />
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto text-sm text-gray-400">
                          {Array.isArray(rev.createdAt) 
                            ? new Date(rev.createdAt[0], rev.createdAt[1] - 1, rev.createdAt[2]).toLocaleDateString('vi-VN')
                            : rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Mới nhất'}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed ml-14">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Review Form - Glassmorphism Card */}
            <div className="w-full lg:w-1/3">
              <div className="bg-gray-50/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 sticky top-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Viết đánh giá</h3>
                <p className="text-sm text-gray-500 mb-8">Chia sẻ trải nghiệm của bạn về sản phẩm này</p>
                
                {!isAuthenticated ? (
                  <div className="text-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600 mb-4">Vui lòng đăng nhập để gửi đánh giá.</p>
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await submitReview({
                        productId: id as string,
                        data: { rating, comment }
                      });
                      setComment('');
                      setRating(5);
                      showToast('Đã gửi đánh giá thành công!', 'success');
                    } catch (err: any) {
                      const errorMsg = err.response?.data;
                      showToast(typeof errorMsg === 'string' ? errorMsg : 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.', 'error');
                    }
                  }} className="space-y-6">
                    {/* Rating Select */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Chất lượng sản phẩm</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-gray-900 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star size={28} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "" : "text-gray-200"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Comment Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Nhận xét của bạn</label>
                      <textarea 
                        required
                        maxLength={500}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none text-sm resize-none"
                        placeholder="Sản phẩm rất đẹp, đóng gói cẩn thận..."
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
