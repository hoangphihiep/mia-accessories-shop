import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Minimalist Silver Ring', category: 'Rings', price: '450,000đ', stock: 120, status: 'Active' },
  { id: 2, name: 'Classic Gold Chain', category: 'Necklaces', price: '850,000đ', stock: 45, status: 'Active' },
  { id: 3, name: 'Pearl Drop Earrings', category: 'Earrings', price: '320,000đ', stock: 0, status: 'Out of Stock' },
  { id: 4, name: 'Engraved Cuff Bracelet', category: 'Bracelets', price: '550,000đ', stock: 12, status: 'Active' },
];

export default function AdminProducts() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-black uppercase tracking-widest text-xl">Product Catalog</h2>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
              <th className="p-4 font-bold border-b w-16">ID</th>
              <th className="p-4 font-bold border-b">Product Name</th>
              <th className="p-4 font-bold border-b">Category</th>
              <th className="p-4 font-bold border-b">Price</th>
              <th className="p-4 font-bold border-b">Stock</th>
              <th className="p-4 font-bold border-b">Status</th>
              <th className="p-4 font-bold border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {MOCK_PRODUCTS.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{product.id}</td>
                <td className="p-4 font-bold">{product.name}</td>
                <td className="p-4 text-gray-500">{product.category}</td>
                <td className="p-4">{product.price}</td>
                <td className="p-4">
                  <span className={`font-bold ${product.stock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
