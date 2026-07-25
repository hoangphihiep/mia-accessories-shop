import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, ToggleLeft, ToggleRight, ImageIcon, Search, Check, UploadCloud } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../services/api';
import { generateSlug } from '../../lib/utils';

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    bannerImage: '',
    isActive: true,
    productIds: [] as number[]
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'coverImage' | 'bannerImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    if (type === 'coverImage') setIsUploadingCover(true);
    else setIsUploadingBanner(true);

    try {
      const response = await api.post('/upload/image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, [type]: response.data.url }));
      showToast('Tải ảnh lên thành công', 'success');
    } catch (error) {
      showToast('Lỗi tải ảnh lên', 'error');
    } finally {
      if (type === 'coverImage') setIsUploadingCover(false);
      else setIsUploadingBanner(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [colRes, prodRes] = await Promise.all([
        api.get('/collections'),
        api.get('/products')
      ]);
      setCollections(colRes.data);
      setProducts(prodRes.data.content || prodRes.data); // Handle paginated or list response
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/collections/${editingId}`, formData);
      } else {
        await api.post('/collections', formData);
      }

      setShowDrawer(false);
      showToast(editingId ? 'Cập nhật bộ sưu tập thành công' : 'Thêm bộ sưu tập thành công', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/collections/${id}`);
      showToast('Xóa bộ sưu tập thành công', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể xóa bộ sưu tập này!', 'error');
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const collection = collections.find(c => c.id === id);
      if (!collection) return;

      const payload = {
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        coverImage: collection.coverImage,
        bannerImage: collection.bannerImage,
        isActive: !currentStatus,
        productIds: collection.products?.map((p: any) => p.id) || []
      };

      await api.put(`/collections/${id}`, payload);
      showToast(`Đã ${!currentStatus ? 'hiện' : 'ẩn'} bộ sưu tập thành công`, 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const openDrawer = (collection: any = null) => {
    if (collection) {
      setEditingId(collection.id);
      setFormData({
        name: collection.name,
        slug: collection.slug,
        description: collection.description || '',
        coverImage: collection.coverImage || '',
        bannerImage: collection.bannerImage || '',
        isActive: collection.isActive !== false,
        productIds: collection.products?.map((p: any) => p.id) || []
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        coverImage: '',
        bannerImage: '',
        isActive: true,
        productIds: []
      });
    }
    setSearchTerm('');
    setShowDrawer(true);
  };

  const toggleProductSelection = (productId: number) => {
    setFormData(prev => {
      const isSelected = prev.productIds.includes(productId);
      if (isSelected) {
        return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
      } else {
        return { ...prev, productIds: [...prev.productIds, productId] };
      }
    });
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString() === searchTerm
  ) : [];

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
            <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Bộ sưu tập</h2>
            <p className="text-gray-400 text-sm mt-1">Tạo các chiến dịch Lookbook và gom nhóm sản phẩm</p>
          </div>
          <button
            onClick={() => openDrawer()}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
          >
            <Plus size={18} />
            <span>Thêm Bộ Sưu Tập</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-5 pl-8 border-b border-gray-100 w-24">Hình ảnh</th>
                <th className="p-5 border-b border-gray-100">Tên Bộ Sưu Tập</th>
                <th className="p-5 border-b border-gray-100 text-center">Số sản phẩm</th>
                <th className="p-5 border-b border-gray-100 text-center">Trạng thái</th>
                <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {collections.map((col) => (
                <tr key={col.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                  <td className="p-5 pl-8">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {col.coverImage ? (
                        <img src={col.coverImage} alt={col.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="font-bold text-gray-900 block mb-1">{col.name}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold tracking-wider uppercase">
                      /{col.slug}
                    </span>
                  </td>
                  <td className="p-5 text-center font-bold text-gray-600">
                    {col.products?.length || 0}
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={(e) => toggleStatus(col.id, col.isActive, e)} className="inline-flex items-center">
                      {col.isActive !== false ? (
                        <ToggleRight size={28} className="text-emerald-500 hover:text-emerald-600 transition-colors" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300 hover:text-gray-400 transition-colors" />
                      )}
                    </button>
                  </td>
                  <td className="p-5 pr-8 text-right space-x-2">
                    <button onClick={() => openDrawer(col)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmId(col.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Chưa có bộ sưu tập nào.</p>
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
        className={`fixed top-0 right-0 bottom-0 w-full lg:w-[500px] bg-white shadow-2xl border-l border-gray-100 flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${showDrawer ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl shrink-0">
          <div>
            <h3 className="font-black text-xl text-gray-900">{editingId ? 'Sửa Bộ Sưu Tập' : 'Thêm Bộ Sưu Tập'}</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
              Thiết lập thông tin & chọn sản phẩm
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
          <form id="collectionForm" onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Thông tin chung</h4>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Tên BST <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => {
                    const newName = e.target.value;
                    setFormData({
                      ...formData,
                      name: newName,
                      slug: !editingId ? generateSlug(newName) : formData.slug
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  placeholder="VD: Valentine's Secret"
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
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Mô tả (Cảm hứng thiết kế)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  placeholder="Mô tả ý nghĩa bộ sưu tập..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Hình ảnh</h4>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Ảnh Bìa (Vuông)</label>
                <div className="flex gap-4">
                  {formData.coverImage ? (
                    <div className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0 group">
                      <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: '' })}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploadingCover ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'coverImage')} disabled={isUploadingCover} />
                      {isUploadingCover ? <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-900 rounded-full animate-spin" /> : <UploadCloud size={20} />}
                      <span className="text-[10px] font-bold">{isUploadingCover ? 'Đang tải...' : 'Tải ảnh bìa'}</span>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Ảnh Banner (Ngang)</label>
                <div className="flex gap-4">
                  {formData.bannerImage ? (
                    <div className="relative w-full h-32 rounded-xl border border-gray-200 overflow-hidden group">
                      <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bannerImage: '' })}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={`w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploadingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'bannerImage')} disabled={isUploadingBanner} />
                      {isUploadingBanner ? <div className="w-6 h-6 border-2 border-gray-400/30 border-t-gray-900 rounded-full animate-spin" /> : <UploadCloud size={24} />}
                      <span className="text-[11px] font-bold">{isUploadingBanner ? 'Đang tải...' : 'Bấm để tải ảnh banner'}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Danh sách Sản phẩm</h4>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="h-64 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-2 custom-scrollbar">
                {filteredProducts.map(product => {
                  const isSelected = formData.productIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors mb-1 ${isSelected ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-white overflow-hidden shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].imageUrl.startsWith('http') ? product.images[0].imageUrl : `http://localhost:8080/api/v1/files/${product.images[0].imageUrl}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-bold truncate max-w-[250px] ${isSelected ? 'text-white' : 'text-gray-900'}`} title={product.name}>{product.name}</p>
                          <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{(product.variants?.[0]?.price || 0).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-white' : 'border-gray-300'}`}>
                        {isSelected && <Check size={12} className="text-gray-900 font-bold" />}
                      </div>
                    </div>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="text-center p-4 text-sm text-gray-500">
                    Không tìm thấy sản phẩm.
                  </div>
                )}
              </div>
              <p className="text-xs font-bold text-gray-500">Đã chọn: <span className="text-gray-900">{formData.productIds.length}</span> sản phẩm</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-900">Trạng thái hoạt động</label>
                <p className="text-[10px] font-medium text-gray-500 mt-0.5">Tắt để ẩn bộ sưu tập khỏi cửa hàng</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className="focus:outline-none"
              >
                {formData.isActive ? (
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
            form="collectionForm"
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Save size={18} />
            <span>{editingId ? 'CẬP NHẬT BST' : 'LƯU BỘ SƯU TẬP'}</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Xóa bộ sưu tập"
        message="Bạn có chắc chắn muốn xóa bộ sưu tập này? Các sản phẩm bên trong sẽ không bị xóa."
        confirmText="Xóa bộ sưu tập"
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
