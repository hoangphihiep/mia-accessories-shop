import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import api from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '' });

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      
      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error: any) {
      alert('Không thể xóa danh mục đang có sản phẩm!');
    }
  };

  const openModal = (category: any = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, slug: category.slug, parentId: category.parentId || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', parentId: '' });
    }
    setShowModal(true);
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[calc(100vh-9rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl">
        <div>
          <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Danh mục</h2>
          <p className="text-gray-400 text-sm mt-1">Sắp xếp và phân loại sản phẩm</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
        >
          <Plus size={18} />
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <th className="p-5 pl-8 border-b border-gray-100 w-24">ID</th>
              <th className="p-5 border-b border-gray-100">Tên danh mục</th>
              <th className="p-5 border-b border-gray-100">Đường dẫn (Slug)</th>
              <th className="p-5 border-b border-gray-100">Danh mục cha</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                <td className="p-5 pl-8 font-bold text-gray-400">#{cat.id}</td>
                <td className="p-5 font-bold text-gray-900">{cat.name}</td>
                <td className="p-5">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px] font-bold tracking-wider">
                    {cat.slug}
                  </span>
                </td>
                <td className="p-5 font-medium text-gray-600">
                  {cat.parentId ? categories.find(c => c.id === cat.parentId)?.name || cat.parentId : '-'}
                </td>
                <td className="p-5 pr-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(cat)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Sửa">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Xóa">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Tên danh mục</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                  placeholder="Ví dụ: Nhẫn bạc"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Đường dẫn (Slug)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                  placeholder="Để trống tự động tạo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Danh mục cha</label>
                <select 
                  value={formData.parentId}
                  onChange={e => setFormData({...formData, parentId: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                >
                  <option value="">-- Không có --</option>
                  {categories.filter(c => c.id !== editingId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 rounded mr-4 font-bold text-gray-600 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-gray-800 flex items-center gap-2">
                  <Save size={16} />
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
