import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaymentResult from './pages/PaymentResult';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import About from './pages/About';

// Admin Pages
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCollections from './pages/admin/AdminCollections';
import AdminMaterials from './pages/admin/AdminMaterials';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminPOS from './pages/admin/AdminPOS';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
        <Router>
          <Routes>
            {/* Storefront Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="collections" element={<Collections />} />
              <Route path="collections/:slug" element={<CollectionDetail />} />
              <Route path="about" element={<About />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify" element={<VerifyEmail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="track-order" element={<OrderTracking />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="payment-result" element={<PaymentResult />} />
              <Route path="payment-success" element={<div className="container mx-auto px-4 py-24 text-center"><h1 className="text-4xl font-black uppercase text-green-600 mb-4">Đặt hàng thành công!</h1><p>Cảm ơn bạn đã đặt hàng.</p></div>} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="pos" element={<AdminPOS />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="collections" element={<AdminCollections />} />
                <Route path="materials" element={<AdminMaterials />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
