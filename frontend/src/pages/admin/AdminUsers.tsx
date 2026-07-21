import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Ban, CheckCircle, Search, AlertCircle, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';
import { AdminService } from '../../services/admin.service';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  // Create Staff Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStaffForm, setCreateStaffForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [isCreating, setIsCreating] = useState(false);

  // Confirm Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
    type: 'warning'
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: pageData, isLoading, isError } = useUsers(page, size, debouncedSearch);
  const users = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await AdminService.createStaff(createStaffForm);
      setCreateStaffForm({ fullName: '', email: '', phone: '', password: '' });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhân viên');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    setModalConfig({
      isOpen: true,
      title: currentStatus ? 'Khóa Tài Khoản' : 'Mở Khóa Tài Khoản',
      message: currentStatus 
        ? 'Tài khoản này sẽ không thể đăng nhập vào hệ thống nữa. Bạn chắc chắn chứ?' 
        : 'Tài khoản sẽ được cấp lại quyền truy cập hệ thống. Xác nhận mở khóa?',
      type: currentStatus ? 'danger' : 'warning',
      action: async () => {
        try {
          await api.put(`/admin/users/${id}/status`);
          queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        } catch (error: any) {
          alert(error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
        }
      }
    });
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-rose-100 shadow-sm p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops! Mất kết nối máy chủ</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Không thể tải danh sách nhân sự lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị viên hệ thống.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
        >
          Thử lại ngay
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[calc(100vh-9rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Search */}
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-xl">
        <div>
          <h2 className="font-black uppercase tracking-widest text-xl text-gray-900">Quản lý Nhân sự</h2>
          <p className="text-gray-400 text-sm mt-1">Quản lý tài khoản và khóa truy cập</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm theo email, tên, sđt..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:h-11 bg-primary text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-900 transition-colors shadow-lg shadow-primary/30"
          >
            <Plus size={20} className="md:mr-2" />
            <span className="hidden md:inline">Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto custom-scrollbar relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <th className="p-5 pl-8 border-b border-gray-100">Người dùng</th>
              <th className="p-5 border-b border-gray-100">SĐT</th>
              <th className="p-5 border-b border-gray-100">Vai trò</th>
              <th className="p-5 border-b border-gray-100">Ngày vào làm</th>
              <th className="p-5 border-b border-gray-100">Trạng thái</th>
              <th className="p-5 pr-8 border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                <td className="p-5 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center text-white font-black text-xs uppercase shadow-sm">
                      {u.fullName?.substring(0, 2) || 'US'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{u.fullName}</div>
                      <div className="text-[11px] font-bold tracking-wider text-gray-400 mt-0.5">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-gray-500 font-medium">{u.phone || '-'}</td>
                <td className="p-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                    ${u.role.name === 'ROLE_ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                      u.role.name === 'ROLE_STAFF' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {u.role.name.replace('ROLE_', '')}
                  </span>
                </td>
                <td className="p-5 text-gray-500 font-medium">
                  {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: vi }) : '-'}
                </td>
                <td className="p-5">
                  {u.isActive ? (
                    <span className="flex items-center text-emerald-600 font-bold text-xs"><CheckCircle size={14} className="mr-1" /> Hoạt động</span>
                  ) : (
                    <span className="flex items-center text-rose-600 font-bold text-xs"><Ban size={14} className="mr-1" /> Bị khóa</span>
                  )}
                </td>
                <td className="p-5 pr-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {u.role.name !== 'ROLE_ADMIN' && currentUser?.email !== u.email && (
                    <button 
                      onClick={() => toggleStatus(u.id, u.isActive)} 
                      className={`p-2 rounded-lg transition-colors border border-transparent ${u.isActive ? 'text-rose-600 hover:bg-rose-50 hover:border-rose-100' : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'}`} 
                      title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {u.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                    </button>
                  )}
                  {u.role.name === 'ROLE_ADMIN' && (
                    <span className="text-gray-400 text-[11px] font-bold tracking-wider uppercase">Không thể can thiệp</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                  Không tìm thấy tài khoản nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <span className="text-sm text-gray-500 font-medium">
            Trang <span className="font-black text-gray-900">{page + 1}</span> / {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-900">Tạo Nhân Viên</h3>
                <p className="text-gray-400 text-sm mt-1">Cấp tài khoản có sẵn quyền quản trị</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateStaff}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Họ & Tên</label>
                  <input 
                    type="text" 
                    required
                    value={createStaffForm.fullName}
                    onChange={e => setCreateStaffForm({...createStaffForm, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Email Đăng nhập</label>
                  <input 
                    type="email" 
                    required
                    value={createStaffForm.email}
                    onChange={e => setCreateStaffForm({...createStaffForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="nhanvien@shop.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Số điện thoại</label>
                  <input 
                    type="tel" 
                    required
                    value={createStaffForm.phone}
                    onChange={e => setCreateStaffForm({...createStaffForm, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Mật khẩu khởi tạo</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={createStaffForm.password}
                    onChange={e => setCreateStaffForm({...createStaffForm, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="******"
                  />
                </div>
              </div>
              
              <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 rounded-full text-sm font-bold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-3 rounded-full text-sm font-bold text-white bg-primary hover:bg-gray-900 shadow-lg shadow-primary/30 transition-all disabled:opacity-50 flex items-center"
                >
                  {isCreating ? (
                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div> Đang tạo...</>
                  ) : 'Xác nhận tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${modalConfig.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                  <AlertCircle size={24} />
                </div>
                <button onClick={() => setModalConfig(prev => ({...prev, isOpen: false}))} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{modalConfig.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{modalConfig.message}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button 
                onClick={() => setModalConfig(prev => ({...prev, isOpen: false}))}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  await modalConfig.action();
                  setModalConfig(prev => ({...prev, isOpen: false}));
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg transition-colors ${
                  modalConfig.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
