import { useState, useEffect } from 'react';
import { Check, X, Star, MessageSquare, ChevronLeft, ChevronRight, User, Package, MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/admin/reviews?page=${page}&size=10`);
      setReviews(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

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

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  // Calculate some simple metrics for the dashboard header based on current page data
  const pageAverage = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const hiddenCount = reviews.filter(r => !r.isActive).length;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col space-y-6">
      
      {/* Dashboard Mini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Tổng Đánh Giá</p>
            <h3 className="text-3xl font-black text-gray-900">{totalElements}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
            <MessageCircle size={24} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Điểm TB (Trang này)</p>
            <h3 className="text-3xl font-black text-gray-900">{pageAverage} <span className="text-lg text-yellow-400">⭐</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
            <Star size={24} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Cần xử lý / Đã ẩn</p>
            <h3 className="text-3xl font-black text-rose-600">{hiddenCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <X size={24} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Review Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-black uppercase tracking-widest text-lg text-gray-800">Dòng thời gian (Feed)</h2>
        </div>

        <div className="p-6 flex-1 bg-gray-50/30 overflow-y-auto">
          {reviews.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Chưa có đánh giá nào.</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {reviews.map((review) => {
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
                    <div className="pl-13 ml-13">
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
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

                      {/* Product Tag */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-100 mb-4">
                        <Package size={14} className="text-gray-400" />
                        {review.product?.name || 'Sản phẩm đã xóa'}
                        {review.variantName && <span className="text-gray-400 border-l border-gray-300 pl-1.5 ml-0.5">{review.variantName}</span>}
                      </div>

                      {/* Admin Reply Section */}
                      {review.adminReply ? (
                        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 ml-4 mb-4 relative before:absolute before:left-[-1px] before:top-4 before:bottom-4 before:w-1 before:bg-sky-400 before:rounded-full">
                          <p className="text-[10px] font-black uppercase text-sky-600 mb-1.5 flex items-center gap-1">
                            <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-sky-600"><User size={10} /></span>
                            Shop Phản Hồi
                          </p>
                          <p className="text-sm text-gray-700 pl-6">{review.adminReply}</p>
                        </div>
                      ) : null}

                      {/* Reply Form */}
                      {replyingId === review.id && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 ml-4 mb-4">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full text-sm p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-none"
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
                              className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 font-bold shadow-sm transition-all"
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
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
            <span className="text-sm text-gray-500 font-medium">Trang {page + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold text-sm text-gray-700 transition-colors"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold text-sm text-gray-700 transition-colors"
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
