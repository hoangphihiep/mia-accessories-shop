import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminInventory() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Receipt State
  const [supplier, setSupplier] = useState('');
  const [details, setDetails] = useState([{ variantId: '', quantity: 1, unitPrice: 0 }]);

  const fetchData = async () => {
    try {
      const [recRes, prodRes] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/products') // Assuming /products returns products with variants
      ]);
      setReceipts(recRes.data);
      
      const allProducts = prodRes.data;
      
      const allVariants = allProducts.flatMap((p: any) => 
        (p.variants || []).map((v: any) => ({ ...v, productName: p.name }))
      );
      setVariants(allVariants);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDetail = () => {
    setDetails([...details, { variantId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...details];
    (newDetails[index] as any)[field] = value;
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) return alert('Vui lòng nhập tên nhà cung cấp');
    
    const validDetails = details.filter(d => d.variantId && d.quantity > 0 && d.unitPrice > 0);
    if (validDetails.length === 0) return alert('Vui lòng thêm ít nhất 1 sản phẩm với đầy đủ thông tin');

    try {
      await api.post('/admin/inventory', {
        supplier,
        details: validDetails
      });
      alert('Nhập kho thành công!');
      setShowModal(false);
      setSupplier('');
      setDetails([{ variantId: '', quantity: 1, unitPrice: 0 }]);
      fetchData();
    } catch (error) {
      alert('Lỗi khi nhập kho');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-black uppercase tracking-widest text-xl">Lịch sử Nhập kho</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          <span>Tạo Phiếu Nhập</span>
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
              <th className="p-4 font-bold border-b">Mã Phiếu</th>
              <th className="p-4 font-bold border-b">Ngày nhập</th>
              <th className="p-4 font-bold border-b">Nhà cung cấp</th>
              <th className="p-4 font-bold border-b">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">#{receipt.id}</td>
                <td className="p-4 text-gray-500">{new Date(receipt.createdAt).toLocaleString('vi-VN')}</td>
                <td className="p-4">{receipt.supplier}</td>
                <td className="p-4 font-bold text-green-600">+{receipt.totalCost.toLocaleString('vi-VN')}đ</td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">Chưa có dữ liệu nhập kho.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nhập kho */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black uppercase">Tạo Phiếu Nhập Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                <X size={24} /> {/* Error: X not imported, let's fix below */}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Nhà cung cấp</label>
                <input 
                  type="text" 
                  required
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                  placeholder="Ví dụ: Xưởng gia công ABC"
                />
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm uppercase">Danh sách Sản phẩm</h4>
                  <button type="button" onClick={handleAddDetail} className="text-primary text-sm font-bold flex items-center hover:underline">
                    <Plus size={14} className="mr-1" /> Thêm dòng
                  </button>
                </div>
                
                {details.map((detail, index) => (
                  <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex-1">
                      <select 
                        required
                        value={detail.variantId}
                        onChange={e => handleDetailChange(index, 'variantId', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded text-sm"
                      >
                        <option value="">-- Chọn biến thể sản phẩm --</option>
                        {variants.map(v => (
                          <option key={v.id} value={v.id}>{v.productName} - {v.name} (Tồn: {v.stockQuantity})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={detail.quantity}
                        onChange={e => handleDetailChange(index, 'quantity', parseInt(e.target.value))}
                        placeholder="SL"
                        className="w-full border border-gray-300 p-2 rounded text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={detail.unitPrice}
                        onChange={e => handleDetailChange(index, 'unitPrice', parseFloat(e.target.value))}
                        placeholder="Giá nhập"
                        className="w-full border border-gray-300 p-2 rounded text-sm"
                      />
                    </div>
                    <button type="button" onClick={() => handleRemoveDetail(index)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 rounded mr-4 font-bold text-gray-600 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-gray-800 flex items-center gap-2">
                  <Save size={16} />
                  Lưu Phiếu Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
