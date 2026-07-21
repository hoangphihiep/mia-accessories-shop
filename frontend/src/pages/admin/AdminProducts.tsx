import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes, matRes] = await Promise.all([
        api.get('/products?size=1000'),
        api.get('/categories'),
        api.get('/materials')
      ]);
      setProducts(prodRes.data.content || prodRes.data);
      setCategories(catRes.data);
      setMaterials(matRes.data);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert('Lỗi xóa sản phẩm');
      }
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[calc(100vh-9rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl">
        <div>
          <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Danh mục Sản phẩm</h2>
          <p className="text-gray-400 text-sm mt-1">Quản lý kho hàng và thông tin sản phẩm</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto whitespace-nowrap">
            <Plus size={18} />
            <span>Thêm Sản Phẩm</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <th className="p-5 pl-8 border-b border-gray-100 w-20">ID</th>
              <th className="p-5 border-b border-gray-100">Sản phẩm</th>
              <th className="p-5 border-b border-gray-100">Danh mục</th>
              <th className="p-5 border-b border-gray-100">Giá thấp nhất</th>
              <th className="p-5 border-b border-gray-100 text-center">Kho (Tổng)</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProducts.map((product) => {
              const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0;
              const minPrice = product.variants?.length > 0 
                ? Math.min(...product.variants.map((v: any) => v.price))
                : 0;

              return (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                  <td className="p-5 pl-8 font-bold text-gray-400">#{product.id}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-xs">IMG</div>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 line-clamp-2">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                      {product.category?.name || '---'}
                    </span>
                  </td>
                  <td className="p-5 font-black text-gray-900">{minPrice.toLocaleString('vi-VN')}đ</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-black
                      ${totalStock === 0 ? 'bg-red-50 text-red-600' : 
                        totalStock < 10 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-5 pr-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Sửa">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
