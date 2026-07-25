import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile, useUpdateProfile, useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useMyOrders, useChangePassword, useCancelOrder } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Trash2, User, MapPin, Package, LogOut, CheckCircle2, Home, Navigation, Map, ShieldCheck, ChevronRight, Lock, Edit2, XCircle, Camera } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên không được để trống'),
  phone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại không hợp lệ (10-11 số)'),
  address: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  avatar: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const addressSchema = z.object({
  receiverName: z.string().min(2, 'Tên người nhận không được để trống'),
  phone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại không hợp lệ (10-11 số)'),
  streetAddress: z.string().min(5, 'Số nhà/Đường không được để trống'),
  city: z.string().min(2, 'Vui lòng nhập Tỉnh/Thành phố'),
  district: z.string().min(2, 'Vui lòng nhập Quận/Huyện'),
  ward: z.string().min(2, 'Vui lòng nhập Phường/Xã'),
  isDefault: z.boolean().default(false)
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function Profile() {
  const { isAuthenticated, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: addresses = [] } = useAddresses();
  const { data: orders = [] } = useMyOrders();
  
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState('ALL');

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutateAsync: addAddress, isPending: isAddingAddress } = useAddAddress();
  const { mutateAsync: updateAddress, isPending: isUpdatingAddress } = useUpdateAddress();
  const { mutateAsync: deleteAddress, isPending: isDeletingAddress } = useDeleteAddress();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutateAsync: cancelOrder, isPending: isCancelingOrder } = useCancelOrder();
  
  const { showToast } = useToast();

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const { register: registerAddress, handleSubmit: handleSubmitAddress, reset: resetAddress, formState: { errors: addressErrors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (profile) {
      resetProfile({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        gender: profile.gender || '',
        dob: profile.dob || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile, resetProfile]);

  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      showToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật hồ sơ', 'error');
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    try {
      await changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
      resetPassword();
      showToast('Đổi mật khẩu thành công!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Mật khẩu cũ không chính xác', 'error');
    }
  };

  const onAddAddress = async (data: AddressFormValues) => {
    try {
      if (editingAddressId) {
        await updateAddress({ id: editingAddressId, data });
        setEditingAddressId(null);
        showToast('Cập nhật địa chỉ thành công!', 'success');
      } else {
        await addAddress(data);
        showToast('Thêm địa chỉ thành công!', 'success');
      }
      resetAddress({ isDefault: false });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi lưu địa chỉ', 'error');
    }
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    resetAddress({
      receiverName: addr.receiverName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      district: addr.district,
      ward: addr.ward,
      isDefault: addr.isDefault
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await deleteAddress(id);
        if (editingAddressId === id) {
          setEditingAddressId(null);
          resetAddress({ isDefault: false });
        }
        showToast('Đã xóa địa chỉ', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Lỗi xóa địa chỉ', 'error');
      }
    }
  };

  const handleCancelOrder = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await cancelOrder(id);
        showToast('Đã hủy đơn hàng thành công', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Lỗi hủy đơn hàng', 'error');
      }
    }
  };

  if (isProfileLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gray-50/50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'SHIPPING': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = orderFilter === 'ALL' 
    ? orders 
    : orders.filter((o: any) => o.status.toUpperCase() === orderFilter);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-tr from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg overflow-hidden relative group">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.fullName?.charAt(0)?.toUpperCase() || 'U'
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg truncate max-w-[150px]" title={profile?.fullName}>{profile?.fullName}</h2>
                <p className="text-sm text-gray-500 truncate max-w-[150px]" title={profile?.email}>{profile?.email}</p>
              </div>
            </div>

            <ul className="space-y-2 font-medium">
              <li>
                <button 
                  onClick={() => handleTabChange('info')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'info' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <User size={18} />
                  <span>Hồ sơ cá nhân</span>
                  <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === 'info' ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('address')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'address' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <MapPin size={18} />
                  <span>Sổ địa chỉ</span>
                  <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === 'address' ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('orders')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Package size={18} />
                  <span>Lịch sử đơn hàng</span>
                  <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === 'orders' ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabChange('security')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'security' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <ShieldCheck size={18} />
                  <span>Bảo mật</span>
                  <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === 'security' ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
                </button>
              </li>
              <li className="pt-6 mt-6 border-t border-gray-100">
                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full lg:w-3/4">
          {activeTab === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900">Thông tin cá nhân</h3>
                  <p className="text-gray-500 mt-2">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>

                <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="max-w-xl space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        {...registerProfile('fullName')}
                        className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all duration-200 ${profileErrors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} 
                      />
                      {profileErrors.fullName && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1"><ShieldCheck size={14}/> {profileErrors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                      <input 
                        type="text" 
                        {...registerProfile('phone')}
                        className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all duration-200 ${profileErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} 
                      />
                      {profileErrors.phone && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1"><ShieldCheck size={14}/> {profileErrors.phone.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                        <select 
                          {...registerProfile('gender')}
                          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                        >
                          <option value="">Chưa cập nhật</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                        <input 
                          type="date" 
                          {...registerProfile('dob')}
                          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="bg-gray-900 text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                    >
                      {isUpdatingProfile ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang lưu...</>
                      ) : (
                        <><CheckCircle2 size={18} /> Lưu thay đổi</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900">Bảo mật tài khoản</h3>
                  <p className="text-gray-500 mt-2">Thay đổi mật khẩu để bảo vệ tài khoản của bạn</p>
                </div>

                <form onSubmit={handleSubmitPassword(onChangePassword)} className="max-w-xl space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu cũ</label>
                      <input 
                        type="password" 
                        {...registerPassword('oldPassword')}
                        className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all duration-200 ${passwordErrors.oldPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} 
                      />
                      {passwordErrors.oldPassword && <p className="text-red-500 text-sm mt-1.5">{passwordErrors.oldPassword.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        {...registerPassword('newPassword')}
                        className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all duration-200 ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} 
                      />
                      {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1.5">{passwordErrors.newPassword.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <input 
                        type="password" 
                        {...registerPassword('confirmPassword')}
                        className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all duration-200 ${passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} 
                      />
                      {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1.5">{passwordErrors.confirmPassword.message}</p>}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="bg-gray-900 text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                    >
                      {isChangingPassword ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang lưu...</>
                      ) : (
                        <><Lock size={18} /> Đổi mật khẩu</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900">Sổ địa chỉ</h3>
                    <p className="text-gray-500 mt-2">Quản lý các địa chỉ nhận hàng của bạn</p>
                  </div>
                  {editingAddressId && (
                    <button 
                      onClick={() => {
                        setEditingAddressId(null);
                        resetAddress({ isDefault: false });
                      }}
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={16} /> Thêm địa chỉ mới
                    </button>
                  )}
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Bạn chưa có địa chỉ nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr: any) => (
                      <div key={addr.id} className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white ${addr.isDefault ? 'border-gray-900' : 'border-gray-100 hover:border-gray-200'} ${editingAddressId === addr.id ? 'ring-4 ring-gray-100' : ''}`}>
                        {addr.isDefault && (
                          <div className="absolute top-4 right-4 bg-gray-900 text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <CheckCircle2 size={12} /> Mặc định
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full shrink-0 ${addr.isDefault ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors'}`}>
                            <Home size={24} />
                          </div>
                          <div className="pb-8">
                            <p className="font-bold text-gray-900 text-lg mb-1">{addr.receiverName}</p>
                            <p className="text-gray-500 font-medium mb-3">{addr.phone}</p>
                            
                            <div className="space-y-1.5 text-sm text-gray-600">
                              <p className="flex items-start gap-2"><Navigation size={14} className="mt-0.5 shrink-0 text-gray-400" /> <span>{addr.streetAddress}</span></p>
                              <p className="flex items-start gap-2"><Map size={14} className="mt-0.5 shrink-0 text-gray-400" /> <span>{addr.ward}, {addr.district}, {addr.city}</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditAddress(addr)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-all duration-200"
                            title="Sửa địa chỉ"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(addr.id)}
                            disabled={isDeletingAddress}
                            className="p-2 text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" id="address-form">
                <h4 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-6">
                  {editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                </h4>
                <form onSubmit={handleSubmitAddress(onAddAddress)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tên người nhận</label>
                      <input type="text" {...registerAddress('receiverName')} className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${addressErrors.receiverName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} />
                      {addressErrors.receiverName && <p className="text-red-500 text-xs mt-1.5">{addressErrors.receiverName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                      <input type="text" {...registerAddress('phone')} className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${addressErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} />
                      {addressErrors.phone && <p className="text-red-500 text-xs mt-1.5">{addressErrors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số nhà/Đường</label>
                    <input type="text" {...registerAddress('streetAddress')} className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${addressErrors.streetAddress ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} />
                    {addressErrors.streetAddress && <p className="text-red-500 text-xs mt-1.5">{addressErrors.streetAddress.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Phường/Xã</label>
                      <input type="text" {...registerAddress('ward')} className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${addressErrors.ward ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} />
                      {addressErrors.ward && <p className="text-red-500 text-xs mt-1.5">{addressErrors.ward.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Quận/Huyện</label>
                      <input type="text" {...registerAddress('district')} className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${addressErrors.district ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} />
                      {addressErrors.district && <p className="text-red-500 text-xs mt-1.5">{addressErrors.district.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tỉnh/Thành phố</label>
                      <input type="text" {...registerAddress('city')} className={`w-full bg-gray-50 border px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${addressErrors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-200'}`} />
                      {addressErrors.city && <p className="text-red-500 text-xs mt-1.5">{addressErrors.city.message}</p>}
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 pt-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" {...registerAddress('isDefault')} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-gray-900 checked:border-gray-900 transition-all cursor-pointer" />
                      <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Đặt làm địa chỉ mặc định</span>
                  </label>
                  
                  <div className="pt-2 flex gap-3">
                    <button 
                      type="submit" 
                      disabled={isAddingAddress || isUpdatingAddress}
                      className="bg-gray-900 text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                    >
                      {isAddingAddress || isUpdatingAddress ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang lưu...</>
                      ) : (
                        <><MapPin size={18} /> {editingAddressId ? 'Cập nhật' : 'Thêm địa chỉ'}</>
                      )}
                    </button>
                    {editingAddressId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          resetAddress({ isDefault: false });
                        }}
                        className="bg-gray-100 text-gray-700 font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-300"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>

            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900">Lịch sử đơn hàng</h3>
                  <p className="text-gray-500 mt-2">Theo dõi trạng thái các đơn hàng của bạn</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'PENDING', label: 'Chờ xác nhận' },
                    { id: 'SHIPPING', label: 'Đang giao' },
                    { id: 'COMPLETED', label: 'Thành công' },
                    { id: 'CANCELLED', label: 'Đã hủy' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilter(tab.id)}
                      className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${
                        orderFilter === tab.id 
                          ? 'bg-gray-900 text-white shadow-md' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-lg">Bạn chưa có đơn hàng nào.</p>
                    <a href="/shop" className="inline-block mt-4 text-gray-900 font-bold hover:underline">Tiếp tục mua sắm &rarr;</a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map((order: any) => (
                      <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300 relative group">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                          <div>
                            <span className="font-black text-gray-900 uppercase tracking-widest">Đơn hàng #{order.id}</span>
                            <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-4">
                          {order.orderDetails?.map((detail: any) => (
                            <div key={detail.id} className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
                                {/* Hình ảnh mẫu (nếu có) hoặc ảnh đại diện sản phẩm */}
                                {detail.productVariant?.imageUrl || detail.productVariant?.product?.images?.[0]?.imageUrl ? (
                                  <img src={detail.productVariant?.imageUrl || detail.productVariant?.product?.images?.[0]?.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package size={24} className="text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{detail.productVariant?.product?.name || 'Sản phẩm'} - {detail.productVariant?.name || 'Phân loại'}</h4>
                                <p className="text-gray-500 text-sm mt-1">Số lượng: <span className="font-bold">{detail.quantity}</span></p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-gray-900">{(detail.price * detail.quantity).toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer & Actions */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                          <div className="text-sm text-gray-500">
                            <p className="flex items-center gap-2"><MapPin size={14}/> {order.shippingAddress || 'Không có địa chỉ'}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-gray-500 font-medium uppercase tracking-wider text-sm mr-2">Tổng cộng:</span>
                              <span className="text-xl font-black text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            
                            {order.status.toUpperCase() === 'PENDING' && (
                              <button 
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={isCancelingOrder}
                                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2"
                              >
                                <XCircle size={16} /> Hủy đơn
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
