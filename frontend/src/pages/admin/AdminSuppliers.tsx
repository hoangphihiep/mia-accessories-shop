import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Building2, Search, Phone, Mail, FileWarning, Wallet, History, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../services/api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'receipts' | 'payments'>('info');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    cccd: '',
    taxCode: '',
    legalRepresentative: '',
    directContactPerson: ''
  });
  const [supplierDebt, setSupplierDebt] = useState<number>(0);

  // Lịch sử data
  const [receipts, setReceipts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Thanh toán
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payNote, setPayNote] = useState<string>('');

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

  const fetchSupplierHistory = async (supplierId: number) => {
    setLoadingHistory(true);
    try {
      const [recRes, payRes] = await Promise.all([
        api.get(`/admin/suppliers/${supplierId}/receipts`),
        api.get(`/admin/suppliers/${supplierId}/payments`)
      ]);
      setReceipts(recRes.data);
      setPayments(payRes.data);
    } catch (error) {
      console.error('Lỗi tải lịch sử:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm)) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/suppliers/${editingId}`, formData);
      } else {
        await api.post('/admin/suppliers', formData);
      }

      setShowDrawer(false);
      showToast(editingId ? 'Cập nhật thành công' : 'Thêm mới thành công', 'success');
      fetchSuppliers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      await api.post(`/admin/suppliers/${editingId}/pay`, {
        amount: Number(payAmount),
        note: payNote
      });

      showToast('Thanh toán công nợ thành công', 'success');
      setShowPayModal(false);
      setPayAmount('');
      setPayNote('');
      fetchSupplierHistory(editingId);
      fetchSuppliers();
      setSupplierDebt(prev => prev - Number(payAmount));
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi thanh toán nợ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/suppliers/${id}`);
      showToast('Xóa nhà cung cấp thành công', 'success');
      fetchSuppliers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể xóa nhà cung cấp', 'error');
    }
  };

  const openDrawer = (supplier: any = null) => {
    setActiveTab('info');
    if (supplier) {
      setEditingId(supplier.id);
      setSupplierDebt(supplier.debt);
      setFormData({
        name: supplier.name,
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        cccd: supplier.cccd || '',
        taxCode: supplier.taxCode || '',
        legalRepresentative: supplier.legalRepresentative || '',
        directContactPerson: supplier.directContactPerson || ''
      });
      fetchSupplierHistory(supplier.id);
    } else {
      setEditingId(null);
      setSupplierDebt(0);
      setFormData({ name: '', phone: '', email: '', address: '', cccd: '', taxCode: '', legalRepresentative: '', directContactPerson: '' });
      setReceipts([]);
      setPayments([]);
    }
    setShowDrawer(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-[calc(100vh-9rem)] flex flex-col overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/50 backdrop-blur-xl shrink-0 z-10 relative">
          <div>
            <h2 className="font-black uppercase tracking-widest text-xl text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 size={20} />
              </div>
              Quản lý Nhà cung cấp
            </h2>
            <p className="text-gray-400 text-sm mt-2 ml-13">Danh sách đối tác, xưởng và công nợ</p>
          </div>

          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <button
              onClick={() => openDrawer()}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Thêm Đối Tác</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar relative z-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] sticky top-0 backdrop-blur-sm z-10">
                <th className="p-5 pl-8 border-b border-gray-100">Nhà cung cấp</th>
                <th className="p-5 border-b border-gray-100 hidden md:table-cell">Liên hệ</th>
                <th className="p-5 border-b border-gray-100 text-right">Công nợ hiện tại</th>
                <th className="p-5 pr-8 border-b border-gray-100 text-right w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group cursor-pointer" onClick={() => openDrawer(sup)}>
                  <td className="p-5 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-black text-sm uppercase shadow-inner">
                        {sup.name?.substring(0, 2) || 'NC'}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-base block mb-0.5">{sup.name}</span>
                        {sup.address && (
                          <span className="text-[11px] font-medium text-gray-400 truncate max-w-[200px] block" title={sup.address}>
                            {sup.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                        <Phone size={14} className="text-gray-400" />
                        {sup.phone || <span className="text-gray-400 font-normal italic">Chưa cập nhật SĐT</span>}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-[12px] font-medium tracking-wide">
                        <Mail size={14} className="text-gray-400" />
                        {sup.email || <span className="text-gray-400 font-normal italic">Chưa có Email</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border
                    ${sup.debt > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {sup.debt > 0 ? formatCurrency(sup.debt) : 'Không có nợ'}
                    </span>
                  </td>
                  <td className="p-5 pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openDrawer(sup); }} className="p-2.5 text-sky-600 hover:bg-sky-50 rounded-xl transition-all border border-transparent hover:border-sky-100 hover:shadow-sm" title="Chi tiết">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(sup.id); }} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 hover:shadow-sm" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-0">
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                      <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                        <FileWarning size={40} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy nhà cung cấp nào</h3>
                      <p className="text-gray-500 max-w-sm mb-8">
                        {searchTerm ? 'Thử tìm kiếm bằng từ khóa khác hoặc kiểm tra lại lỗi chính tả.' : 'Bạn chưa có nhà cung cấp nào trong hệ thống. Hãy thêm đối tác đầu tiên để bắt đầu nhập kho.'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => openDrawer()}
                          className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all flex items-center gap-2"
                        >
                          <Plus size={18} /> Thêm Nhà cung cấp
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
          className={`fixed top-0 right-0 bottom-0 w-full lg:w-[500px] bg-white shadow-2xl border-l border-gray-100 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${showDrawer ? 'translate-x-0' : 'translate-x-[110%]'
            }`}
        >
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl">
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">
              {editingId ? formData.name || 'Chi tiết Đối tác' : 'Thêm Đối Tác Mới'}
            </h3>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs for Editing Mode */}
          {editingId && (
            <div className="flex px-4 pt-2 border-b border-gray-100 bg-gray-50/30">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Building2 size={16} /> Thông tin
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'receipts' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <FileText size={16} /> LS Nhập hàng
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <History size={16} /> LS Trả nợ
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* TAB: THÔNG TIN (INFO) */}
            {(activeTab === 'info' || !editingId) && (
              <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {editingId && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl mb-8 flex justify-between items-center shadow-inner border border-gray-100">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Công nợ hiện tại</p>
                      <p className={`text-2xl font-black ${supplierDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(supplierDebt)}
                      </p>
                    </div>
                    {supplierDebt > 0 && (
                      <button
                        onClick={() => setShowPayModal(true)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black hover:shadow-lg transition-all"
                      >
                        <Wallet size={16} /> Trả nợ
                      </button>
                    )}
                  </div>
                )}

                <form id="supplierForm" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      Tên Xưởng / Công ty <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                      placeholder="Ví dụ: Xưởng Bạc 925 Quảng Châu"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        pattern="^(0[35789])([0-9]{8})$"
                        title="Số điện thoại phải có 10 chữ số và bắt đầu bằng đầu số hợp lệ (VD: 09, 03...)"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                        placeholder="0987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                        placeholder="contact@xuongbac.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Người đại diện pháp lý
                      </label>
                      <input
                        type="text"
                        value={formData.legalRepresentative}
                        onChange={e => setFormData({ ...formData, legalRepresentative: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                        placeholder="Giám đốc / Chủ cơ sở"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Người làm việc trực tiếp
                      </label>
                      <input
                        type="text"
                        value={formData.directContactPerson}
                        onChange={e => setFormData({ ...formData, directContactPerson: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                        placeholder="Nhân viên sales, kế toán..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Căn cước công dân
                      </label>
                      <input
                        type="text"
                        value={formData.cccd}
                        onChange={e => setFormData({ ...formData, cccd: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                        placeholder="Số CCCD của người đại diện"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                        Mã số thuế
                      </label>
                      <input
                        type="text"
                        value={formData.taxCode}
                        onChange={e => setFormData({ ...formData, taxCode: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                        placeholder="Mã số thuế doanh nghiệp/hộ KD"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      Địa chỉ chi tiết
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium min-h-[120px] resize-none"
                      placeholder="Nhập địa chỉ chi tiết, kho xuất hàng..."
                    />
                  </div>
                </form>
              </div>
            )}

            {/* TAB: LỊCH SỬ NHẬP KHO */}
            {activeTab === 'receipts' && editingId && (
              <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {loadingHistory ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
                ) : receipts.length === 0 ? (
                  <div className="text-center p-12 text-gray-500">Chưa có lịch sử nhập hàng nào.</div>
                ) : (
                  <div className="space-y-4">
                    {receipts.map(rec => (
                      <div key={rec.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <ArrowDownLeft size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900">Nhập kho #{rec.id}</span>
                            <span className="font-black text-rose-600">+{formatCurrency(rec.totalCost)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatDate(rec.createdAt)}</span>
                            <span>Người nhập: {typeof rec.createdBy === 'object' ? rec.createdBy?.fullName : rec.createdBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: LỊCH SỬ TRẢ NỢ */}
            {activeTab === 'payments' && editingId && (
              <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {loadingHistory ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
                ) : payments.length === 0 ? (
                  <div className="text-center p-12 text-gray-500">Chưa có lịch sử thanh toán nợ nào.</div>
                ) : (
                  <div className="space-y-4">
                    {payments.map(pay => (
                      <div key={pay.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <ArrowUpRight size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900">Trả nợ</span>
                            <span className="font-black text-emerald-600">-{formatCurrency(pay.amount)}</span>
                          </div>
                          {pay.note && <p className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded-lg">{pay.note}</p>}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatDate(pay.createdAt)}</span>
                            <span>Người trả: {typeof pay.createdBy === 'object' ? pay.createdBy?.fullName : pay.createdBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab === 'info' && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 mt-auto">
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                form="supplierForm"
                type="submit"
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save size={18} />}
                {isSubmitting ? 'Đang xử lý...' : (editingId ? 'Cập nhật' : 'Lưu lại')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pay Debt Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <form onSubmit={handlePayDebt} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Wallet size={20} className="text-primary" /> Thanh toán công nợ
              </h3>
              <button type="button" onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl flex justify-between items-center border border-rose-100">
                <span className="font-bold text-sm">Nợ cần trả:</span>
                <span className="font-black text-lg">{formatCurrency(supplierDebt)}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số tiền thanh toán (VNĐ) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1000"
                  max={supplierDebt}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold text-lg"
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú (Không bắt buộc)</label>
                <textarea
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none h-24"
                  placeholder="Ví dụ: Chuyển khoản Vietcombank cho xưởng..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                disabled={isSubmitting || !payAmount}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận trả nợ'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Xóa nhà cung cấp"
        message="Bạn có chắc chắn muốn xóa nhà cung cấp này? Các phiếu nhập liên quan có thể bị ảnh hưởng!"
        confirmText="Xóa nhà cung cấp"
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
