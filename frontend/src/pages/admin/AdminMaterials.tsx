import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../services/api';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', careInstructions: '' });

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || '',
        careInstructions: formData.careInstructions || ''
      };

      if (editingId) {
        await api.put(`/materials/${editingId}`, payload);
      } else {
        await api.post('/materials', payload);
      }

      setShowDrawer(false);
      showToast(editingId ? 'Cập nhật chất liệu thành công' : 'Thêm chất liệu thành công', 'success');
      fetchMaterials();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/materials/${id}`);
      showToast('Xóa chất liệu thành công', 'success');
      fetchMaterials();
      setDeleteConfirmId(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể xóa chất liệu này (có thể do đang được sử dụng ở sản phẩm)!', 'error');
      setDeleteConfirmId(null);
    }
  };

  const openDrawer = (material: any = null) => {
    if (material) {
      setEditingId(material.id);
      setFormData({
        name: material.name,
        slug: material.slug,
        careInstructions: material.careInstructions || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', careInstructions: '' });
    }
    setShowDrawer(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)]">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-[calc(100vh-9rem)] flex flex-col overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl shrink-0">
          <div>
            <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Chất liệu</h2>
            <p className="text-gray-400 text-sm mt-1">Cấu hình loại chất liệu và hướng dẫn bảo quản cho sản phẩm</p>
          </div>
          <button
            onClick={() => openDrawer()}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
          >
            <Plus size={18} />
            <span>Thêm Chất Liệu</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-5 pl-8 border-b border-gray-100 w-24 hidden sm:table-cell">ID</th>
                <th className="p-5 border-b border-gray-100">Tên chất liệu</th>
                <th className="p-5 border-b border-gray-100 hidden md:table-cell">Đường dẫn (Slug)</th>
                <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {materials.map((mat) => (
                <tr key={mat.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                  <td className="p-5 pl-8 font-bold text-gray-400 hidden sm:table-cell">#{mat.id}</td>
                  <td className="p-5">
                    <span className="font-bold text-gray-900">{mat.name}</span>
                    {mat.careInstructions && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-sm" title={mat.careInstructions}>
                        Hướng dẫn: {mat.careInstructions}
                      </p>
                    )}
                    {/* Mobile slug & ID tag */}
                    <div className="flex items-center gap-2 mt-1 sm:hidden">
                      <span className="text-[10px] font-bold text-gray-400">#{mat.id}</span>
                      <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 rounded text-[9px] font-bold tracking-wider">
                        {mat.slug}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell">
                    <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-lg text-[11px] font-bold tracking-wider">
                      {mat.slug}
                    </span>
                  </td>
                  <td className="p-5 pr-8 text-right space-x-2">
                    <button onClick={() => openDrawer(mat)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmId(mat.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-400">
                    <Layers size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Chưa có chất liệu nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full lg:w-[400px] bg-white shadow-2xl border-l border-gray-100 flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${showDrawer ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl shrink-0">
          <div>
            <h3 className="font-black text-xl text-gray-900">{editingId ? 'Sửa Chất liệu' : 'Thêm Chất liệu'}</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
              Thiết lập thông tin
            </p>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="p-2 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all shadow-sm border border-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="materialForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Tên chất liệu <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                placeholder="VD: Bạc 925"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Đường dẫn (Slug)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                placeholder="Để trống tự động tạo"
              />
              <p className="text-[10px] text-gray-400 font-medium mt-2">Dùng để tạo link lọc sản phẩm. Ví dụ: bac-925</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Hướng dẫn bảo quản</label>
              <textarea
                value={formData.careInstructions}
                onChange={e => setFormData({ ...formData, careInstructions: e.target.value })}
                rows={5}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                placeholder="VD: Tránh tiếp xúc với hóa chất, chất tẩy rửa. Có thể làm sáng bằng khăn lau bạc chuyên dụng..."
              />
              <p className="text-[10px] text-gray-400 font-medium mt-2">Sẽ tự động hiển thị ở trang Chi tiết của tất cả sản phẩm dùng chất liệu này.</p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
          <button
            type="submit"
            form="materialForm"
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Save size={18} />
            <span>{editingId ? 'CẬP NHẬT' : 'LƯU CHẤT LIỆU'}</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Xóa chất liệu"
        message="Bạn có chắc chắn muốn xóa chất liệu này? Hành động này không thể hoàn tác."
        confirmText="Xóa chất liệu"
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
