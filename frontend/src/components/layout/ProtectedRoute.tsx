import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Nếu đăng nhập rồi nhưng không phải Admin, chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
