import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Search, Package, Box, FileText, Eye, User, Building2, FileWarning } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminInventory() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'view'>('create');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // New Receipt State
  const [supplierId, setSupplierId] = useState('');
  const [details, setDetails] = useState([{ variantId: '', quantity: 1, unitPrice: 0 }]);

  const fetchData = async () => {
    try {
      const [recRes, prodRes, supRes] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/products?size=1000'), 
        api.get('/admin/suppliers')
      ]);
      // Sort receipts by ID desc to show newest first
      const sortedReceipts = recRes.data.sort((a: any, b: any) => b.id - a.id);
      setReceipts(sortedReceipts);
      setSuppliers(supRes.data);
      
      const allProducts = prodRes.data.content || prodRes.data;
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

  // Calculate total for create form
  const totalCreateCost = details.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      showToast('Vui lòng chọn nhà cung cấp', 'error');
      return;
    }
    
    const validDetails = details.filter(d => d.variantId && d.quantity > 0 && d.unitPrice >= 0);
    if (validDetails.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 sản phẩm hợp lệ', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/inventory', {
        supplierId: parseInt(supplierId),
        details: validDetails
      });
      showToast('Nhập kho thành công!', 'success');
      setShowDrawer(false);
      setSupplierId('');
      setDetails([{ variantId: '', quantity: 1, unitPrice: 0 }]);
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 403) {
        showToast('Bạn không có quyền thực hiện chức năng này!', 'error');
      } else {
        showToast(error.response?.data?.message || 'Lỗi khi nhập kho', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setSupplierId('');
    setDetails([{ variantId: '', quantity: 1, unitPrice: 0 }]);
    setShowDrawer(true);
  };

  const openViewDrawer = (receipt: any) => {
    setDrawerMode('view');
    setSelectedReceipt(receipt);
    setShowDrawer(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredReceipts = receipts.filter(r => 
    r.id.toString().includes(searchTerm) ||
    r.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="relative flex w-full h-[calc(100vh-6rem)] overflow-hidden">
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/50 backdrop-blur-xl shrink-0 z-10 relative">
        <div>
          <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package size={20} />
            </div>
            Lịch sử Nhập kho
          </h2>
          <p className="text-gray-400 text-sm mt-2 ml-13">Quản lý và theo dõi các phiếu nhập hàng</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4">
          <div className="relative w-full sm:w-72">
            <input 
              type="text"
              placeholder="Tìm mã phiếu, nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-gray-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          {user?.role?.name === 'ROLE_ADMIN' && (
            <button 
              onClick={openCreateDrawer}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Tạo Phiếu Nhập</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar relative z-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] sticky top-0 backdrop-blur-sm z-10">
              <th className="p-5 pl-8 border-b border-gray-100 w-32">Mã Phiếu</th>
              <th className="p-5 border-b border-gray-100">Ngày nhập</th>
              <th className="p-5 border-b border-gray-100">Nhà cung cấp</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right">Tổng tiền</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id} onClick={() => openViewDrawer(receipt)} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group cursor-pointer">
                <td className="p-5 pl-8 font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-300" />
                    #{receipt.id}
                  </div>
                </td>
                <td className="p-5 text-gray-500 font-medium">{new Date(receipt.createdAt).toLocaleString('vi-VN')}</td>
                <td className="p-5 font-bold text-gray-900">{receipt.supplier}</td>
                <td className="p-5 pr-8 font-black text-emerald-600 text-right">+{formatCurrency(receipt.totalCost)}</td>
                <td className="p-5 pr-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-end gap-1 w-full">
                    <Eye size={14} /> Xem
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredReceipts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-0">
                  <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                      <Box size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có phiếu nhập kho nào</h3>
                    <p className="text-gray-500 max-w-sm mb-8">
                      {searchTerm ? 'Không tìm thấy kết quả phù hợp với từ khóa của bạn.' : 'Tạo phiếu nhập đầu tiên để cập nhật số lượng tồn kho cho các sản phẩm.'}
                    </p>
                  </div>
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

      {/* Side Drawer Content */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full lg:w-[600px] bg-white shadow-2xl border-l border-gray-100 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          showDrawer ? 'translate-x-0' : 'translate-x-[110%]'
        }`}
      >
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl">
          <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            {drawerMode === 'create' ? (
              <><Plus size={20} className="text-primary" /> Tạo Phiếu Nhập Mới</>
            ) : (
              <><FileText size={20} className="text-primary" /> Chi tiết phiếu nhập #{selectedReceipt?.id}</>
            )}
          </h3>
          <button 
            onClick={() => setShowDrawer(false)} 
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        {drawerMode === 'create' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="p-8 space-y-6 flex-1">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <select 
                  required
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                >
                  <option value="">-- Chọn Nhà cung cấp --</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><FileWarning size={12}/> Chưa có nhà cung cấp nào.</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500">
                    Danh sách Sản phẩm nhập <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={handleAddDetail} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Thêm dòng
                  </button>
                </div>
                
                <div className="space-y-3">
                  {details.map((detail, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <select 
                            required
                            value={detail.variantId}
                            onChange={e => handleDetailChange(index, 'variantId', e.target.value)}
                            className="w-full bg-gray-50 border-none p-3 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium truncate"
                          >
                            <option value="">-- Chọn mẫu sản phẩm --</option>
                            {variants.map(v => (
                              <option key={v.id} value={v.id}>{v.productName} - {v.name} (Tồn hiện tại: {v.stockQuantity})</option>
                            ))}
                          </select>
                        </div>
                        <button type="button" onClick={() => handleRemoveDetail(index)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-all shrink-0" title="Xóa dòng này">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Số lượng</label>
                          <input 
                            type="number" 
                            min="1"
                            required
                            value={detail.quantity}
                            onChange={e => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-50 border-none p-3 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Đơn giá (VNĐ)</label>
                          <input 
                            type="number" 
                            min="0"
                            required
                            value={detail.unitPrice}
                            onChange={e => handleDetailChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-50 border-none p-3 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Thành tiền</label>
                          <div className="w-full bg-gray-100/50 text-gray-600 p-3 rounded-lg text-sm font-bold text-right border border-transparent truncate">
                            {formatCurrency((detail.quantity || 0) * (detail.unitPrice || 0))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {details.length === 0 && (
                    <div className="text-center p-6 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
                      Chưa có sản phẩm nào. Hãy bấm "Thêm dòng" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Footer & Tổng tiền */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/80">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-xs">Tổng tiền phiếu nhập:</span>
                <span className="text-2xl font-black text-rose-600">{formatCurrency(totalCreateCost)}</span>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDrawer(false)} 
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save size={18} />}
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Nhập kho'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-8">
            {/* View Details Mode */}
            {selectedReceipt && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Tổng tiền hóa đơn</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {formatCurrency(selectedReceipt.totalCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Thời gian nhập</p>
                    <p className="font-bold text-gray-900">{new Date(selectedReceipt.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      <Building2 size={14} /> Nhà cung cấp
                    </div>
                    <p className="font-bold text-gray-900">{selectedReceipt.supplier}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      <User size={14} /> Người lập phiếu
                    </div>
                    <p className="font-bold text-gray-900">{selectedReceipt.createdBy?.fullName || 'Hệ thống'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-6">Chi tiết mặt hàng ({selectedReceipt.details?.length || 0})</h4>
                  <div className="space-y-3">
                    {selectedReceipt.details?.map((detail: any) => (
                      <div key={detail.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-gray-900 mb-1 leading-tight">{detail.productVariant?.productName}</p>
                          <p className="text-xs text-gray-500">Mẫu/Phân loại: <span className="font-bold text-gray-700">{detail.productVariant?.name}</span></p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-sm">{detail.quantity} <span className="text-gray-400 text-[10px] font-normal mx-1">x</span> {formatCurrency(detail.unitPrice)}</p>
                          <p className="text-sm font-black text-emerald-600 mt-1">={formatCurrency(detail.quantity * detail.unitPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
