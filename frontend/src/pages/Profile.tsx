import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // form state for profile
  const [editProfile, setEditProfile] = useState({ fullName: '', phone: '', address: '' });
  const [newAddress, setNewAddress] = useState({ street: '', city: '', phone: '', isDefault: false });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const [profRes, addrRes, orderRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/addresses'),
          api.get('/orders/my-orders')
        ]);
        setProfile(profRes.data);
        setEditProfile({ 
          fullName: profRes.data.fullName || '', 
          phone: profRes.data.phone || '', 
          address: profRes.data.address || '' 
        });
        setAddresses(addrRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/me', editProfile);
      setProfile(res.data);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      alert('Lỗi cập nhật hồ sơ');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      setAddresses([...addresses, res.data]);
      setNewAddress({ street: '', city: '', phone: '', isDefault: false });
      alert('Thêm địa chỉ thành công!');
    } catch (err) {
      alert('Lỗi thêm địa chỉ');
    }
  };

  if (!profile) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <h2 className="text-2xl font-black uppercase tracking-widest mb-6">Tài khoản</h2>
        <ul className="space-y-4 font-bold uppercase tracking-widest text-sm">
          <li>
            <button onClick={() => setActiveTab('info')} className={`hover:text-primary transition-colors ${activeTab === 'info' ? 'text-primary' : 'text-gray-500'}`}>Thông tin cá nhân</button>
          </li>
          <li>
            <button onClick={() => setActiveTab('address')} className={`hover:text-primary transition-colors ${activeTab === 'address' ? 'text-primary' : 'text-gray-500'}`}>Sổ địa chỉ</button>
          </li>
          <li>
            <button onClick={() => setActiveTab('orders')} className={`hover:text-primary transition-colors ${activeTab === 'orders' ? 'text-primary' : 'text-gray-500'}`}>Lịch sử đơn hàng</button>
          </li>
          <li className="pt-4 border-t">
            <button onClick={logout} className="text-red-500 hover:text-red-700 transition-colors">Đăng xuất</button>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="w-full md:w-3/4">
        {activeTab === 'info' && (
          <div>
            <h3 className="text-xl font-bold uppercase mb-6">Thông tin cá nhân</h3>
            <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  value={editProfile.fullName} 
                  onChange={e => setEditProfile({...editProfile, fullName: e.target.value})}
                  className="w-full border p-3 focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Số điện thoại</label>
                <input 
                  type="text" 
                  value={editProfile.phone} 
                  onChange={e => setEditProfile({...editProfile, phone: e.target.value})}
                  className="w-full border p-3 focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Địa chỉ mặc định</label>
                <input 
                  type="text" 
                  value={editProfile.address} 
                  onChange={e => setEditProfile({...editProfile, address: e.target.value})}
                  className="w-full border p-3 focus:border-primary focus:outline-none" 
                />
              </div>
              <button type="submit" className="bg-primary text-white font-bold uppercase px-6 py-3 hover:bg-gray-800 transition-colors">
                Lưu thay đổi
              </button>
            </form>
          </div>
        )}

        {activeTab === 'address' && (
          <div>
            <h3 className="text-xl font-bold uppercase mb-6">Sổ địa chỉ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {addresses.map(addr => (
                <div key={addr.id} className="border p-6 relative">
                  {addr.isDefault && <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-1 font-bold">Mặc định</span>}
                  <p className="font-bold">{addr.street}</p>
                  <p className="text-gray-500">{addr.city}</p>
                  <p className="text-gray-500">{addr.phone}</p>
                </div>
              ))}
            </div>
            
            <h4 className="font-bold uppercase mb-4">Thêm địa chỉ mới</h4>
            <form onSubmit={handleAddAddress} className="max-w-md space-y-4">
              <input type="text" placeholder="Đường/Phố" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full border p-3" />
              <input type="text" placeholder="Thành phố" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full border p-3" />
              <input type="text" placeholder="Số điện thoại" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full border p-3" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="accent-primary w-4 h-4" />
                <span>Đặt làm mặc định</span>
              </label>
              <button type="submit" className="bg-primary text-white font-bold uppercase px-6 py-3 hover:bg-gray-800">Thêm</button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xl font-bold uppercase mb-6">Lịch sử đơn hàng</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border p-6">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                      <div>
                        <span className="font-bold uppercase tracking-widest text-sm">Đơn hàng #{order.id}</span>
                        <p className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-widest">{order.status}</span>
                    </div>
                    <div className="space-y-3">
                      {order.orderDetails?.map((detail: any) => (
                        <div key={detail.id} className="flex justify-between text-sm">
                          <span>{detail.quantity}x {detail.productVariant?.name || 'Sản phẩm'}</span>
                          <span className="text-gray-500">{(detail.price * detail.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                      <span>Tổng tiền</span>
                      <span>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
