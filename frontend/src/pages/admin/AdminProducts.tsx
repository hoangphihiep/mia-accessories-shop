import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, AlertCircle, Package, LayoutGrid, List, Image as ImageIcon, UploadCloud, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../services/api';
import { generateSlug } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function AdminProducts() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'ROLE_ADMIN';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [rawMaterialsList, setRawMaterialsList] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Drawer state
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    materialId: '',
    isActive: true,
    isFeatured: false,
    isNew: false,
    slug: '',
    productionType: 'IMPORTED',
    electricityCost: 0,
    machineCost: 0,
    variants: [{ id: null as number | null, name: '', sku: '', price: 0, compareAtPrice: '' as number | string, imageUrl: '', costPrice: 0, machineHours: 0, rawMaterials: [] as any[], stockQuantity: 0 as number | string, displayQuantity: 0 as number | string }],
    images: [] as string[],
    technicalSpecifications: ''
  });

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes, matRes] = await Promise.all([
        api.get('/products?size=1000&sort=id,desc&includeInactive=true'),
        api.get('/categories'),
        api.get('/materials')
      ]);
      const allProducts = prodRes.data.content || prodRes.data;
      setProducts(allProducts);
      setCategories(catRes.data);
      setMaterials(matRes.data);

      const allVariants = allProducts.flatMap((p: any) =>
        (p.variants || []).map((v: any) => ({ ...v, productName: p.name }))
      );
      setRawMaterialsList(allVariants);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      showToast('Xóa sản phẩm thành công', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Lỗi xóa sản phẩm', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVariant = false, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/upload/image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const url = response.data.url;

      if (isVariant && index !== undefined) {
        handleVariantChange(index, 'imageUrl', url);
      } else {
        setFormData((prev: any) => ({ ...prev, images: [...prev.images, url] }));
      }
      showToast('Tải ảnh lên thành công', 'success');
    } catch (error) {
      showToast('Lỗi tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setFormData({
      name: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id.toString() : '',
      materialId: materials.length > 0 ? materials[0].id.toString() : '',
      isActive: true,
      isFeatured: false,
      isNew: false,
      slug: '',
      productionType: 'IMPORTED',
      electricityCost: 0,
      machineCost: 0,
      variants: [{ id: null, name: '', sku: '', price: 0, compareAtPrice: '', imageUrl: '', costPrice: 0, machineHours: 0, rawMaterials: [], stockQuantity: 0, displayQuantity: 0 }],
      images: [],
      technicalSpecifications: ''
    });
    setShowDrawer(true);
  };

  const openEditDrawer = (product: any) => {
    setDrawerMode('edit');
    setCurrentId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      categoryId: product.category?.id?.toString() || '',
      materialId: product.material?.id?.toString() || '',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isNew: product.isNew ?? false,
      slug: product.slug || '',
      productionType: product.productionType || 'IMPORTED',
      electricityCost: product.electricityCost || 0,
      machineCost: product.machineCost || 0,
      variants: product.variants?.length > 0 ? product.variants.map((v: any) => ({
        id: v.id,
        name: v.name || '',
        sku: v.sku || '',
        price: v.price || 0,
        compareAtPrice: v.compareAtPrice || '',
        imageUrl: v.imageUrl || '',
        costPrice: v.costPrice || 0,
        depreciationCost: v.depreciationCost || 0,
        productionCost: v.productionCost || 0,
        machineHours: v.machineHours || 0,
        rawMaterials: v.rawMaterials ? v.rawMaterials.map((rm: any) => ({
          materialVariantId: rm.materialVariant?.id,
          quantity: rm.quantity
        })) : [],
        stockQuantity: v.stockQuantity || 0,
        displayQuantity: v.displayQuantity ?? (v.stockQuantity || 0)
      })) : [{ id: null, name: '', sku: '', price: 0, compareAtPrice: '', imageUrl: '', costPrice: 0, depreciationCost: 0, productionCost: 0, machineHours: 0, rawMaterials: [], stockQuantity: 0, displayQuantity: 0 }],
      images: product.images?.length > 0 ? product.images.map((img: any) => img.imageUrl) : [],
      technicalSpecifications: product.technicalSpecifications || ''
    });
    setShowDrawer(true);
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { id: null, name: '', sku: '', price: 0, compareAtPrice: '', imageUrl: '', costPrice: 0, machineHours: 0, rawMaterials: [], stockQuantity: 0, displayQuantity: 0 }]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.variants.length === 0) {
      showToast('Phải có ít nhất 1 mẫu mã', 'error');
      return;
    }

    if (!formData.categoryId || !formData.materialId) {
      showToast('Vui lòng chọn Danh mục và Chất liệu', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        materialId: parseInt(formData.materialId),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        productionType: formData.productionType,
        electricityCost: formData.electricityCost,
        machineCost: formData.machineCost,
        technicalSpecifications: formData.technicalSpecifications,
        variants: formData.variants.map(v => ({
          ...v,
          compareAtPrice: v.compareAtPrice === '' ? null : v.compareAtPrice
        })),
        images: formData.images
      };

      if (drawerMode === 'create') {
        await api.post('/products', payload);
        showToast('Thêm sản phẩm thành công', 'success');
      } else {
        await api.put(`/products/${currentId}`, payload);
        showToast('Cập nhật sản phẩm thành công', 'success');
      }

      setShowDrawer(false);
      fetchProducts();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errorMsgs = Object.values(error.response.data.errors).join(", ");
        showToast(errorMsgs, 'error');
      } else {
        showToast(error.response?.data?.message || 'Lỗi lưu sản phẩm', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory ? p.category?.id?.toString() === filterCategory : true;

    let matchStock = true;
    if (filterStock === 'in-stock') {
      const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0;
      matchStock = totalStock > 0;
    } else if (filterStock === 'out-of-stock') {
      const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0;
      matchStock = totalStock === 0;
    }

    return matchSearch && matchCategory && matchStock;
  }) : [];

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-[calc(100vh-9rem)] flex flex-col overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl shrink-0 z-10 relative">
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
            <div className="shrink-0">
              <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-3 whitespace-nowrap">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Package size={20} />
                </div>
                Danh mục Sản phẩm
              </h2>
              <p className="text-gray-400 text-sm mt-2 ml-13 whitespace-nowrap">Quản lý kho hàng và thông tin sản phẩm, vật liệu</p>
            </div>
          </div>
        </div>


          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-xl shrink-0 z-10 relative">
            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
              <div className="relative flex-1 w-full md:w-64 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>

              <div className="flex bg-gray-50/80 p-1 rounded-full backdrop-blur-sm w-fit self-start sm:self-center">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-gray-50/80 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none min-w-[150px] outline-none"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                value={filterStock}
                onChange={e => setFilterStock(e.target.value)}
                className="px-4 py-3 bg-gray-50/80 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px] outline-none"
              >
                <option value="all">Tất cả kho</option>
                <option value="in-stock">Còn hàng</option>
                <option value="out-of-stock">Hết hàng</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
              {isSuperAdmin && (
                <button onClick={openCreateDrawer} className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto whitespace-nowrap">
                  <Plus size={18} />
                  <span>Thêm Mới</span>
                </button>
              )}
            </div>
          </div>

          <div className={`flex-1 ${viewMode === 'table' ? 'overflow-x-auto custom-scrollbar' : 'overflow-y-auto custom-scrollbar bg-gray-50/30'}`}>
            {viewMode === 'table' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
                    <th className="p-4 md:p-5 pl-4 md:pl-8 border-b border-gray-100 w-16 md:w-20 hidden lg:table-cell">ID</th>
                    <th className="p-4 md:p-5 border-b border-gray-100">Sản phẩm</th>
                    <th className="p-4 md:p-5 border-b border-gray-100 hidden sm:table-cell">Danh mục</th>
                    <th className="p-4 md:p-5 border-b border-gray-100 hidden md:table-cell">Giá thấp nhất</th>
                    <th className="p-4 md:p-5 border-b border-gray-100 text-center hidden lg:table-cell">Kho (Tổng)</th>
                    {isSuperAdmin && <th className="p-4 md:p-5 pr-4 md:pr-8 border-b border-gray-100 text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0;
                    const minPrice = product.variants?.length > 0
                      ? Math.min(...product.variants.map((v: any) => v.price))
                      : 0;

                    return (
                      <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                        <td className="p-4 md:p-5 pl-4 md:pl-8 font-bold text-gray-400 hidden lg:table-cell">#{product.id}</td>
                        <td className="p-4 md:p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {product.images && product.images[0] ? (
                                <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-xs">IMG</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 line-clamp-2">{product.name}</span>
                              <div className="flex items-center gap-2 mt-1 md:hidden">
                                <span className="font-black text-primary text-xs">{minPrice.toLocaleString('vi-VN')}đ</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase
                                ${totalStock === 0 ? 'bg-red-50 text-red-600' :
                                    totalStock < 10 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  Kho: {totalStock}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 md:p-5 hidden sm:table-cell">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                            {product.category?.name || '---'}
                          </span>
                        </td>
                        <td className="p-4 md:p-5 font-black text-gray-900 hidden md:table-cell">{minPrice.toLocaleString('vi-VN')}đ</td>
                        <td className="p-4 md:p-5 text-center hidden lg:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-black
                          ${totalStock === 0 ? 'bg-red-50 text-red-600' :
                              totalStock < 10 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {totalStock}
                          </span>
                        </td>
                        {isSuperAdmin && (
                          <td className="p-4 md:p-5 pr-4 md:pr-8 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => openEditDrawer(product)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Sửa">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(product.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={isSuperAdmin ? 6 : 5} className="p-12 text-center text-gray-400 font-medium">
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredProducts.map(product => {
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0;
                  const minPrice = product.variants?.length > 0 ? Math.min(...product.variants.map((v: any) => v.price)) : 0;
                  const maxCompareAtPrice = product.variants?.length > 0 ? Math.max(...product.variants.map((v: any) => v.compareAtPrice || 0)) : 0;
                  const primaryImage = product.images?.length > 0 ? (product.images.find((img: any) => img.isPrimary)?.imageUrl || product.images[0].imageUrl) : null;

                  return (
                    <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden flex flex-col">
                      <div className="relative aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden">
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                          {product.isFeatured && <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm">🔥 Hot</span>}
                          {product.isNew && <span className="bg-sky-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm">✨ New</span>}
                        </div>
                        {primaryImage ? (
                          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="text-gray-300 flex flex-col items-center gap-2">
                            <ImageIcon size={32} strokeWidth={1.5} />
                          </div>
                        )}

                        {isSuperAdmin && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button onClick={() => openEditDrawer(product)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sky-600 hover:bg-sky-50 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(product.id)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                            {product.category?.name || '---'}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${totalStock === 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            Kho: {totalStock}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                        <div className="mt-auto pt-3 flex justify-between items-end">
                          <div className="flex flex-col">
                            {maxCompareAtPrice > 0 && maxCompareAtPrice > minPrice && (
                              <div className="text-[10px] font-bold text-gray-400 line-through mb-0.5">
                                {maxCompareAtPrice.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                            <div className="text-sm font-black text-primary">
                              {minPrice.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                          <div className="text-xs font-bold text-gray-400">
                            {product.variants?.length || 0} mẫu
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Không tìm thấy sản phẩm nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        <ConfirmModal
          isOpen={deleteConfirmId !== null}
          title="Xóa sản phẩm"
          message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
          confirmText="Xóa sản phẩm"
          onConfirm={() => {
            if (deleteConfirmId) handleDelete(deleteConfirmId);
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
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
        className={`fixed top-0 right-0 bottom-0 w-full lg:w-[600px] bg-white shadow-2xl border-l border-gray-100 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${showDrawer ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
      >
        <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-xl shrink-0">
          <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
            <Package className="text-primary" />
            {drawerMode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}
          </h2>
          <button
            onClick={() => setShowDrawer(false)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all rotate-0 hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 relative">
          <form id="product-form" onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Hình ảnh sản phẩm */}
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3">1. Hình ảnh sản phẩm</h3>

              <div className="flex gap-4 overflow-x-auto py-2 custom-scrollbar">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0 group">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImgs = [...formData.images];
                        newImgs.splice(idx, 1);
                        setFormData({ ...formData, images: newImgs });
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Ảnh bìa</span>}
                  </div>
                ))}

                <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors shrink-0 bg-gray-50 hover:bg-sky-50 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e)}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <UploadCloud size={20} />
                  )}
                  <span className="text-[10px] font-bold">{isUploading ? 'Đang tải...' : 'Thêm ảnh'}</span>
                </label>
              </div>
            </div>

            {/* Thông tin chung */}
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3">2. Thông tin chung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        slug: drawerMode === 'create' ? generateSlug(newName) : formData.slug
                      });
                    }}
                    className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                    placeholder="VD: Nhẫn Bát Nhã Tâm Kinh"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Đường dẫn SEO (Tùy chọn)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                    placeholder="VD: nhan-bat-nha-tam-kinh"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white group-hover:border-orange-500'}`}>
                    {formData.isFeatured && <Check size={14} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-orange-500 transition-colors">🔥 Sản phẩm Nổi bật</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isNew ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-300 bg-white group-hover:border-sky-500'}`}>
                    {formData.isNew && <Check size={14} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.isNew}
                    onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-sky-500 transition-colors">✨ Hàng mới về</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Chất liệu *</label>
                  <select
                    required
                    value={formData.materialId}
                    onChange={e => setFormData({ ...formData, materialId: e.target.value })}
                    className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                  >
                    <option value="">-- Chọn chất liệu --</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Nguồn gốc *</label>
                  <select
                    required
                    value={formData.productionType}
                    onChange={e => setFormData({ ...formData, productionType: e.target.value })}
                    className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                  >
                    <option value="IMPORTED">Nhập thành phẩm</option>
                    <option value="MANUFACTURED">Tự sản xuất</option>
                  </select>
                </div>
                {formData.productionType === 'MANUFACTURED' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Giá điện chung / SP (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.electricityCost || ''}
                        onChange={e => setFormData({ ...formData, electricityCost: Number(e.target.value) })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Giá trị Máy móc chung (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.machineCost || ''}
                        onChange={e => setFormData({ ...formData, machineCost: Number(e.target.value) })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Mô tả chi tiết</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium resize-none"
                  placeholder="Viết mô tả cho sản phẩm..."
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Thông số kĩ thuật</label>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.technicalSpecifications} 
                    onChange={(content) => setFormData({ ...formData, technicalSpecifications: content })}
                    className="h-64"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                  <div className="h-10"></div>
                </div>
              </div>
            </div>

            {/* Danh sách Mẫu mã */}
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">3. Danh sách Mẫu mã (Variants) *</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Thêm mẫu
                </button>
              </div>

              {drawerMode === 'create' && (
                <div className="flex gap-3 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium items-start">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <p>Bạn có thể nhập <strong>Số lượng ban đầu (Kho thật)</strong> khi tạo mẫu mới. Số lượng này sẽ là số lượng thực tế tồn kho. Khách hàng sẽ thấy <strong>SL hiển thị Web (Ảo)</strong>.</p>
                </div>
              )}

              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-4 relative group">
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="absolute -top-3 -right-3 bg-white text-rose-500 hover:text-white hover:bg-rose-500 p-2 rounded-full border border-gray-100 shadow-md transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa mẫu này"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-32 shrink-0">
                        {variant.imageUrl ? (
                          <div className="relative w-full aspect-square rounded-xl border border-gray-200 overflow-hidden group/img">
                            <img src={variant.imageUrl} alt="Variant" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleVariantChange(index, 'imageUrl', '')}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className={`w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors bg-white cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, true, index)}
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                            <span className="text-[9px] font-bold text-center">{isUploading ? 'Đang tải...' : 'Ảnh phân loại'}</span>
                          </label>
                        )}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                          <div className="col-span-2 lg:col-span-3 flex flex-col">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tên mẫu mã *</label>
                            <input
                              type="text"
                              required
                              value={variant.name}
                              onChange={e => handleVariantChange(index, 'name', e.target.value)}
                              className="w-full bg-white border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-medium mt-auto"
                              placeholder="VD: Màu Đỏ - Size M"
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-3 flex flex-col">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Mã SKU</label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                              className="w-full bg-white border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-medium uppercase mt-auto"
                              placeholder="Mã vạch (nếu có)"
                            />
                          </div>

                          <div className="col-span-1 lg:col-span-2 flex flex-col">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">SL ban đầu (Kho thật)</label>
                            <input
                              type="number"
                              min="0"
                              value={variant.stockQuantity}
                              onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                              disabled={variant.id !== null}
                              className={`w-full border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-bold mt-auto ${variant.id !== null ? 'bg-gray-200/50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                              placeholder="0"
                              title={variant.id !== null ? 'Chỉ được nhập SL ban đầu khi tạo mẫu mới' : ''}
                            />
                          </div>

                          <div className="col-span-1 lg:col-span-2 flex flex-col">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-primary mb-2">SL hiển thị Web (Ảo)</label>
                            <input
                              type="number"
                              min="0"
                              value={variant.displayQuantity}
                              onChange={e => handleVariantChange(index, 'displayQuantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="w-full bg-white border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-bold text-gray-900 mt-auto"
                              placeholder="0"
                              title="Số lượng ảo hiển thị cho khách hàng xem"
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-2 flex flex-col">
                            {(() => {
                              const isManufactured = formData.productionType === 'MANUFACTURED';
                              const calculatedDepreciation = isManufactured ? ((formData.machineCost || 0) / 3000) * (variant.machineHours || 0) : 0;
                              const calculatedProductionCost = isManufactured ? (formData.electricityCost || 0) + calculatedDepreciation : 0;
                              return (
                                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                                  Giá vốn
                                  {isManufactured && (
                                    <span className="block mt-1 text-[9px] font-medium text-gray-500 normal-case">
                                      (Khấu hao: {calculatedDepreciation.toLocaleString('vi-VN')}đ - Tổng CP: <span className="text-primary">{calculatedProductionCost.toLocaleString('vi-VN')}đ</span>)
                                    </span>
                                  )}
                                </label>
                              );
                            })()}
                            <div className="relative mt-auto">
                                {(() => {
                                  const isManufactured = formData.productionType === 'MANUFACTURED';
                                  const calculatedDepreciation = isManufactured ? ((formData.machineCost || 0) / 3000) * (variant.machineHours || 0) : 0;
                                  const calculatedProductionCost = isManufactured ? (formData.electricityCost || 0) + calculatedDepreciation : 0;
                                  const displayCostPrice = isManufactured ? calculatedProductionCost : (drawerMode === 'create' ? 0 : (variant.costPrice || 0));

                                return (
                                  <>
                                    <input
                                      type="text"
                                      readOnly
                                      value={`${displayCostPrice.toLocaleString('vi-VN')}đ`}
                                      className="w-full bg-gray-200/50 border-none p-3 rounded-lg text-sm font-bold text-gray-500 cursor-not-allowed"
                                      title={isManufactured ? "Tự động tính dựa trên Định mức" : "Tự động tính khi nhập kho"}
                                    />
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="col-span-1 lg:col-span-3 flex flex-col">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Giá gốc (VNĐ)</label>
                            <input
                              type="number"
                              min="0"
                              value={variant.compareAtPrice}
                              onChange={e => handleVariantChange(index, 'compareAtPrice', e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="w-full bg-white border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-medium text-gray-400 line-through mt-auto"
                              placeholder="0"
                            />
                          </div>

                          <div className="col-span-1 lg:col-span-3 flex flex-col">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Giá bán (VNĐ) *</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={variant.price}
                              onChange={e => handleVariantChange(index, 'price', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-bold text-emerald-600"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.productionType === 'MANUFACTURED' && (
                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4 w-full">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-2">
                          Định mức Sản xuất
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Số giờ</label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={variant.machineHours || ''}
                              onChange={e => handleVariantChange(index, 'machineHours', Number(e.target.value))}
                              className="w-full bg-gray-50 border-none p-3 rounded-lg focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                              placeholder="0.0"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                              <span>Vật liệu tiêu hao (BOM)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentRawMaterials = variant.rawMaterials || [];
                                  handleVariantChange(index, 'rawMaterials', [...currentRawMaterials, { materialVariantId: '', quantity: 1 }]);
                                }}
                                className="text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-2 py-1 rounded transition-colors"
                              >
                                <Plus size={12} strokeWidth={3} /> Thêm vật liệu
                              </button>
                            </label>
                            <div className="space-y-2">
                              {(!variant.rawMaterials || variant.rawMaterials.length === 0) ? (
                                <div className="text-xs text-gray-400 italic py-2 text-center bg-gray-50 rounded-lg">Chưa có vật liệu tiêu hao</div>
                              ) : (
                                variant.rawMaterials.map((rm: any, rmIndex: number) => (
                                  <div key={rmIndex} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                                    <select
                                      className="flex-1 min-w-0 bg-white border-none p-2 rounded-md text-sm font-medium focus:ring-2 focus:ring-primary outline-none truncate"
                                      value={rm.materialVariantId}
                                      onChange={(e) => {
                                        const newRms = [...variant.rawMaterials];
                                        newRms[rmIndex].materialVariantId = e.target.value;
                                        handleVariantChange(index, 'rawMaterials', newRms);
                                      }}
                                    >
                                      <option value="">Chọn mẫu mã thành phần...</option>
                                      {rawMaterialsList.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.productName} - {m.name}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      placeholder="SL"
                                      value={rm.quantity}
                                      onChange={e => {
                                        const newRms = [...variant.rawMaterials];
                                        newRms[rmIndex].quantity = e.target.value === '' ? '' : Number(e.target.value);
                                        handleVariantChange(index, 'rawMaterials', newRms);
                                      }}
                                      className="w-20 bg-white border-none p-2 rounded-md text-sm font-bold text-center focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newRms = variant.rawMaterials.filter((_: any, i: number) => i !== rmIndex);
                                        handleVariantChange(index, 'rawMaterials', newRms);
                                      }}
                                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-3 cursor-pointer group w-max p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${formData.isActive ? 'bg-primary' : 'bg-gray-200'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Cho phép hiển thị & Bán hàng</span>
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex gap-4">
          <button
            type="button"
            onClick={() => setShowDrawer(false)}
            className="flex-1 bg-gray-50 text-gray-700 font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="flex-1 bg-gray-900 text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Lưu Sản Phẩm'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
