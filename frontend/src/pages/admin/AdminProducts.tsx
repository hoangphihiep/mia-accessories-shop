import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-black uppercase tracking-widest text-xl">Danh mục Sản phẩm</h2>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
            <Plus size={16} />
            <span>Thêm SP</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
              <th className="p-4 font-bold border-b w-16">ID</th>
              <th className="p-4 font-bold border-b">Tên sản phẩm</th>
              <th className="p-4 font-bold border-b">Danh mục</th>
              <th className="p-4 font-bold border-b">Giá thấp nhất</th>
              <th className="p-4 font-bold border-b">Kho (Tổng)</th>
              <th className="p-4 font-bold border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProducts.map((product) => {
              const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0;
              const minPrice = product.variants?.length > 0 
                ? Math.min(...product.variants.map((v: any) => v.price))
                : 0;

              return (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">#{product.id}</td>
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 text-gray-500">{product.category?.name || '---'}</td>
                  <td className="p-4">{minPrice.toLocaleString('vi-VN')}đ</td>
                  <td className="p-4">
                    <span className={`font-bold ${totalStock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
