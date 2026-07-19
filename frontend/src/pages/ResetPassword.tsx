import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../hooks/useAuthMutations';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync: resetPassword, isPending: loading } = useResetPassword();

  if (!token) {
    return <div className="p-12 text-center text-red-500">Token không hợp lệ. Vui lòng kiểm tra lại email.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }
    setError('');

    try {
      const res = await resetPassword({ token, newPassword });
      setMessage(res.data || 'Đã cập nhật mật khẩu.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi đặt lại mật khẩu');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-black tracking-tighter uppercase">Đặt lại mật khẩu</h2>
        </div>
        
        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium">
            {message} <br/> Hệ thống sẽ chuyển hướng về trang đăng nhập trong 3 giây...
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
              placeholder="Mật khẩu mới"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
              placeholder="Xác nhận mật khẩu mới"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!message}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
