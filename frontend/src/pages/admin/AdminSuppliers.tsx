import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Building2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/admin/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/suppliers/${editingId}`, formData);
      } else {
        await api.post('/admin/suppliers', formData);
      }
      
      setShowModal(false);
      fetchSuppliers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này? Các phiếu nhập liên quan có thể bị ảnh hưởng!')) return;
    try {
      await api.delete(`/admin/suppliers/${id}`);
      fetchSuppliers();
    } catch (error: any) {
      alert('Không thể xóa nhà cung cấp đang có phát sinh giao dịch!');
    }
  };

  const openModal = (supplier: any = null) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({ 
        name: supplier.name, 
        phone: supplier.phone || '', 
        email: supplier.email || '', 
        address: supplier.address || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setShowModal(true);
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[calc(100vh-9rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl">
        <div>
          <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-2">
            <Building2 size={24} className="text-gray-400" /> 
            Quản lý Nhà cung cấp
          </h2>
          <p className="text-gray-400 text-sm mt-1">Danh sách đối tác, xưởng và công nợ</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
        >
          <Plus size={18} />
          <span>Thêm Đối Tác</span>
        </button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <th className="p-5 pl-8 border-b border-gray-100">Nhà cung cấp</th>
              <th className="p-5 border-b border-gray-100">Liên hệ</th>
              <th className="p-5 border-b border-gray-100 text-right">Công nợ hiện tại</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {suppliers.map((sup) => (
              <tr key={sup.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                <td className="p-5 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-xs uppercase">
                      {sup.name?.substring(0, 2) || 'NC'}
                    </div>
                    <span className="font-bold text-gray-900">{sup.name}</span>
                  </div>
                </td>
                <td className="p-5">
                  <div className="font-medium text-gray-600">{sup.phone || 'Chưa cập nhật SĐT'}</div>
                  <div className="text-[11px] font-bold tracking-wider text-gray-400 mt-0.5">{sup.email || ''}</div>
                </td>
                <td className="p-5 text-right">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                    ${sup.debt > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {sup.debt > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sup.debt) : 'Không có nợ'}
                  </span>
                </td>
                <td className="p-5 pr-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(sup)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Sửa">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(sup.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Xóa">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                  Chưa có nhà cung cấp nào.
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
              <h3 className="text-xl font-black uppercase">{editingId ? 'Sửa thông tin' : 'Thêm Nhà cung cấp'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Tên Xưởng / Công ty <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                  placeholder="Ví dụ: Xưởng Bạc 925 Quảng Châu"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Số điện thoại</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Địa chỉ</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary h-24"
                  placeholder="Địa chỉ kho xuất hàng..."
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 rounded mr-4 font-bold text-gray-600 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-gray-800 flex items-center gap-2">
                  <Save size={16} />
                  {editingId ? 'Cập nhật' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
