import { useState, useEffect } from 'react';
import { Check, X, Star } from 'lucide-react';
import api from '../../services/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/admin/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
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
      fetchReviews();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái đánh giá');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-black uppercase tracking-widest text-xl">Quản lý Đánh giá</h2>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
              <th className="p-4 font-bold border-b">Ngày</th>
              <th className="p-4 font-bold border-b">Người dùng</th>
              <th className="p-4 font-bold border-b w-1/4">Sản phẩm</th>
              <th className="p-4 font-bold border-b w-1/3">Nội dung đánh giá</th>
              <th className="p-4 font-bold border-b">Trạng thái</th>
              <th className="p-4 font-bold border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reviews.map((review) => (
              <tr key={review.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 font-bold">{review.user.fullName || review.user.email}</td>
                <td className="p-4 text-gray-500">{review.product.name}</td>
                <td className="p-4">
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${review.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {review.isActive ? 'Hiển thị' : 'Bị ẩn'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {!review.isActive ? (
                    <button onClick={() => handleToggleStatus(review.id, true)} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="Duyệt (Hiển thị)">
                      <Check size={16} />
                    </button>
                  ) : (
                    <button onClick={() => handleToggleStatus(review.id, false)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" title="Ẩn đánh giá">
                      <X size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">Chưa có đánh giá nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
