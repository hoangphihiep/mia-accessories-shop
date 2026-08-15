import { useState, useEffect } from 'react';
import { Check, X, Star, MessageSquare, User, Package, MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminReviews() {
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/admin/reviews?page=0&size=1000`);
      setAllReviews(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      showToast('Lỗi khi tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { isActive });
      showToast('Cập nhật trạng thái đánh giá thành công', 'success');
      fetchReviews();
    } catch (error) {
      showToast('Lỗi cập nhật trạng thái đánh giá', 'error');
    }
  };

  const handleReply = async (id: number) => {
    if (!replyText.trim()) {
      showToast('Vui lòng nhập nội dung phản hồi', 'error');
      return;
    }
    try {
      await api.put(`/admin/reviews/${id}/reply`, { reply: replyText });
      showToast('Gửi phản hồi thành công', 'success');
      setReplyingId(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      showToast('Lỗi khi gửi phản hồi', 'error');
    }
  };

  // Group reviews by product
  const productMap = new Map<number, { id: number, name: string, reviews: any[], avgRating: number }>();
  
  allReviews.forEach(r => {
    if (r.product) {
      if (!productMap.has(r.product.id)) {
        productMap.set(r.product.id, { id: r.product.id, name: r.product.name, reviews: [], avgRating: 0 });
      }
      productMap.get(r.product.id)!.reviews.push(r);
    }
  });

  const products = Array.from(productMap.values()).map(p => {
    const totalRating = p.reviews.reduce((acc, r) => acc + r.rating, 0);
    p.avgRating = p.reviews.length > 0 ? totalRating / p.reviews.length : 0;
    return p;
  });

  // Select first product by default if none selected
  useEffect(() => {
    if (products.length > 0 && selectedProductId === null) {
      setSelectedProductId(products[0].id);
    }
  }, [products.length, selectedProductId]);

  // Reset filter when product changes
  useEffect(() => {
    setRatingFilter('all');
  }, [selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const displayReviews = selectedProduct 
    ? selectedProduct.reviews.filter(r => ratingFilter === 'all' || Math.round(r.rating) === ratingFilter) 
    : [];

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex-1">
        <h2 className="text-2xl font-black mb-2 text-gray-900">Tất cả đánh giá</h2>
        <p className="text-sm text-gray-500 mb-8">Quản lý và theo dõi tất cả các đánh giá sản phẩm từ người dùng.</p>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Product List */}
          <div className="w-full md:w-1/3 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4">Danh sách sản phẩm</h3>
            <div className="space-y-3 overflow-y-auto pr-2 max-h-[800px] custom-scrollbar">
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có sản phẩm nào có đánh giá.</p>
              ) : (
                products.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedProductId === p.id ? 'border-sky-200 bg-sky-50 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-gray-900 pr-2 line-clamp-2">{p.name}</div>
                      <div className="text-sm font-bold text-sky-600 shrink-0">{p.avgRating.toFixed(1)}</div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.round(p.avgRating) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{p.reviews.length} đánh giá</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Selected Product Details & Reviews */}
          <div className="w-full md:w-2/3 flex flex-col">
            {selectedProduct ? (
              <>
                {/* Product Header */}
                <div className="mb-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">{selectedProduct.name}</h2>
                  <div className="flex gap-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Điểm sản phẩm</p>
                      <p className="text-3xl font-black text-sky-600">{selectedProduct.avgRating.toFixed(1)}<span className="text-lg text-gray-400 font-bold">/5</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Đánh giá</p>
                      <p className="text-3xl font-black text-gray-900">{selectedProduct.reviews.length}</p>
                    </div>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button 
                    onClick={() => setRatingFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${ratingFilter === 'all' ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    Tất cả
                  </button>
                  {[5, 4, 3, 2, 1].map(star => (
                    <button 
                      key={star}
                      onClick={() => setRatingFilter(star)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center gap-1.5 ${ratingFilter === star ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {star} Sao <Star size={14} className={ratingFilter === star ? 'fill-sky-700 text-sky-700' : 'fill-gray-400 text-gray-400'} />
                    </button>
                  ))}
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {displayReviews.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <MessageSquare size={48} className="mb-4 opacity-20" />
                      <p className="font-medium">Sản phẩm này chưa có đánh giá nào.</p>
                    </div>
                  ) : (
                    displayReviews.map((review) => {
                      const userName = review.user?.fullName || review.user?.email || 'Người dùng đã xóa';
                      const initial = userName.charAt(0).toUpperCase();

                      return (
                        <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          {/* Header: User & Status */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                                {initial}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{userName}</h4>
                                <p className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                                ${review.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {review.isActive ? 'Đang hiển thị' : 'Đang bị ẩn'}
                              </span>
                            </div>
                          </div>

                          {/* Content: Rating & Comment */}
                          <div className="pl-13 md:ml-13">
                            <div className="flex text-yellow-400 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                              ))}
                              <span className="ml-2 text-sm font-bold text-gray-700">{review.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed mb-4">
                              {review.comment}
                            </p>

                            {/* Images */}
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {review.images.map((img: string, idx: number) => (
                                  <img key={idx} src={img} alt="Feedback" className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" />
                                ))}
                              </div>
                            )}

                            {/* Variant Info */}
                            {review.variantName && (
                               <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-100 mb-4">
                                 <Package size={14} className="text-gray-400" />
                                 Phân loại: <span className="font-bold text-gray-800">{review.variantName}</span>
                               </div>
                            )}

                            {/* Admin Reply Section */}
                            {review.adminReply ? (
                              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 ml-0 md:ml-4 mb-4 relative before:absolute before:left-[-1px] before:top-4 before:bottom-4 before:w-1 before:bg-sky-400 before:rounded-full">
                                <p className="text-[10px] font-black uppercase text-sky-600 mb-1.5 flex items-center gap-1">
                                  <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-sky-600"><User size={10} /></span>
                                  Shop Phản Hồi
                                </p>
                                <p className="text-sm text-gray-700 pl-6">{review.adminReply}</p>
                              </div>
                            ) : null}

                            {/* Reply Form */}
                            {replyingId === review.id && (
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 ml-0 md:ml-4 mb-4">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="w-full text-sm p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all resize-none"
                                  placeholder="Nhập nội dung phản hồi của Shop..."
                                  rows={3}
                                />
                                <div className="flex gap-2 justify-end mt-3">
                                  <button 
                                    onClick={() => { setReplyingId(null); setReplyText(''); }} 
                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    Hủy
                                  </button>
                                  <button 
                                    onClick={() => handleReply(review.id)} 
                                    className="px-4 py-2 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-bold shadow-sm transition-all"
                                  >
                                    Gửi Phản Hồi
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actions Bar */}
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                              <button 
                                onClick={() => {
                                  setReplyingId(replyingId === review.id ? null : review.id);
                                  setReplyText(review.adminReply || '');
                                }} 
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                              >
                                <MessageSquare size={14} /> {review.adminReply ? 'Sửa phản hồi' : 'Trả lời'}
                              </button>

                              <div className="flex-1"></div>

                              {!review.isActive ? (
                                <button onClick={() => handleToggleStatus(review.id, true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                  <Check size={14} /> Duyệt hiển thị
                                </button>
                              ) : (
                                <button onClick={() => handleToggleStatus(review.id, false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                                  <X size={14} /> Ẩn đánh giá
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                Chọn một sản phẩm để xem đánh giá
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
