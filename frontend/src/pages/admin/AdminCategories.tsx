import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, CornerDownRight, ToggleLeft, ToggleRight, Tags } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { showToast } = useToast();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '', status: true });

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      setTreeData(buildCategoryTree(response.data));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (data: any[]) => {
    const lookup: any = {};
    const roots: any[] = [];
    
    // Deep copy and mapping
    data.forEach(cat => {
      lookup[cat.id] = { ...cat, children: [], level: 0 };
    });

    data.forEach(cat => {
      if (cat.parentId && lookup[cat.parentId]) {
        lookup[cat.id].level = lookup[cat.parentId].level + 1;
        lookup[cat.parentId].children.push(lookup[cat.id]);
      } else {
        roots.push(lookup[cat.id]);
      }
    });

    // Recursive flatten to preserve order
    const flatten = (nodes: any[]): any[] => {
      return nodes.reduce((acc: any[], node: any) => {
        return [...acc, node, ...flatten(node.children)];
      }, []);
    };

    return flatten(roots);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || '',
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        status: formData.status
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      
      setShowDrawer(false);
      showToast(editingId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      showToast('Xóa danh mục thành công', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể xóa danh mục này!', 'error');
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const category = categories.find(c => c.id === id);
      if (!category) return;
      await api.put(`/categories/${id}`, {
        ...category,
        status: !currentStatus
      });
      showToast(`Đã ${!currentStatus ? 'hiện' : 'ẩn'} danh mục thành công`, 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const openDrawer = (category: any = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ 
        name: category.name, 
        slug: category.slug, 
        parentId: category.parentId || '',
        status: category.status !== false 
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', parentId: '', status: true });
    }
    setShowDrawer(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)]">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative flex w-full h-[calc(100vh-6rem)] overflow-hidden">
      
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl shrink-0">
          <div>
            <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Danh mục</h2>
            <p className="text-gray-400 text-sm mt-1">Tổ chức và phân cấp cấu trúc sản phẩm</p>
          </div>
          <button 
            onClick={() => openDrawer()}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
          >
            <Plus size={18} />
            <span>Thêm Danh Mục</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-5 pl-8 border-b border-gray-100 w-24">ID</th>
                <th className="p-5 border-b border-gray-100">Tên danh mục (Phân cấp)</th>
                <th className="p-5 border-b border-gray-100">Đường dẫn (Slug)</th>
                <th className="p-5 border-b border-gray-100 text-center">Trạng thái</th>
                <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {treeData.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                  <td className="p-5 pl-8 font-bold text-gray-400">#{cat.id}</td>
                  <td className="p-5">
                    <div className="flex items-center">
                      {/* Indentation based on level */}
                      {Array.from({ length: cat.level }).map((_, i) => (
                        <div key={i} className="w-6 h-full flex items-center justify-center opacity-30">
                          <div className="w-px h-full bg-gray-300"></div>
                        </div>
                      ))}
                      {cat.level > 0 && <CornerDownRight size={16} className="text-gray-300 mr-2 shrink-0" />}
                      <span className={`font-bold ${cat.level === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-lg text-[11px] font-bold tracking-wider">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={(e) => toggleStatus(cat.id, cat.status, e)} className="inline-flex items-center">
                      {cat.status !== false ? (
                        <ToggleRight size={28} className="text-emerald-500 hover:text-emerald-600 transition-colors" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300 hover:text-gray-400 transition-colors" />
                      )}
                    </button>
                  </td>
                  <td className="p-5 pr-8 text-right opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                    <button onClick={() => openDrawer(cat)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmId(cat.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {treeData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400">
                    <Tags size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Chưa có danh mục nào.</p>
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
        className={`fixed top-0 right-0 h-screen w-full lg:w-[400px] bg-white shadow-2xl border-l border-gray-100 flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${
          showDrawer ? 'translate-x-0' : 'translate-x-[110%]'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl shrink-0">
          <div>
            <h3 className="font-black text-xl text-gray-900">{editingId ? 'Sửa Danh mục' : 'Thêm Danh mục'}</h3>
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
          <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Tên danh mục <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                placeholder="VD: Dây chuyền bạc"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Đường dẫn (Slug)</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                placeholder="Để trống tự động tạo"
              />
              <p className="text-[10px] text-gray-400 font-medium mt-2">Dùng để tạo link thân thiện SEO. Ví dụ: day-chuyen-bac</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Danh mục cha</label>
              <select 
                value={formData.parentId}
                onChange={e => setFormData({...formData, parentId: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all appearance-none"
              >
                <option value="">-- Không có (Danh mục gốc) --</option>
                {/* Prevent selecting itself or its children in a real complex scenario, but here we just hide itself */}
                {treeData.filter(c => c.id !== editingId).map(c => (
                  <option key={c.id} value={c.id}>
                    {'\u00A0\u00A0\u00A0'.repeat(c.level)} {c.level > 0 ? '↳ ' : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-900">Hiển thị danh mục</label>
                <p className="text-[10px] font-medium text-gray-500 mt-0.5">Tắt để ẩn danh mục khỏi cửa hàng</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, status: !formData.status})}
                className="focus:outline-none"
              >
                {formData.status ? (
                  <ToggleRight size={36} className="text-emerald-500 hover:text-emerald-600 transition-colors" />
                ) : (
                  <ToggleLeft size={36} className="text-gray-300 hover:text-gray-400 transition-colors" />
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
          <button 
            type="submit" 
            form="categoryForm"
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Save size={18} />
            <span>{editingId ? 'CẬP NHẬT' : 'LƯU DANH MỤC'}</span>
          </button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteConfirmId !== null}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        confirmText="Xóa danh mục"
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
