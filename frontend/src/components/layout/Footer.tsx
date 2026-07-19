import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
        <div className="md:col-span-1">
          <h3 className="text-3xl font-black tracking-tighter mb-6 uppercase">MIA.</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Phụ kiện cao cấp dành cho phong cách hiện đại. Được chế tác thủ công với sự tỉ mỉ và đam mê mãnh liệt.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-gray-200">Cửa hàng</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/shop" className="hover:text-white transition-colors">Tất cả sản phẩm</Link></li>
            <li><Link to="/shop?search=Rings" className="hover:text-white transition-colors">Nhẫn</Link></li>
            <li><Link to="/shop?search=Necklaces" className="hover:text-white transition-colors">Dây chuyền</Link></li>
            <li><Link to="/shop?search=Bracelets" className="hover:text-white transition-colors">Vòng tay</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-gray-200">Hỗ trợ khách hàng</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Vận chuyển & Hoàn trả</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn chọn size</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-gray-200">Cập nhật tin tức</h4>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">Đăng ký để nhận ưu đãi đặc biệt và thông tin về các bộ sưu tập mới nhất.</p>
          <div className="flex shadow-inner">
            <input 
              type="email" 
              placeholder="Nhập email của bạn" 
              className="bg-gray-900 border border-gray-800 border-r-0 px-5 py-3 text-sm w-full focus:outline-none focus:border-gray-600 transition-colors rounded-l-full placeholder-gray-500"
            />
            <button className="bg-white text-gray-900 px-5 py-3 text-sm font-bold hover:bg-gray-200 transition-colors rounded-r-full flex items-center justify-center group border border-white">
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
        <p>&copy; {new Date().getFullYear()} MIA Accessories Shop. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
          <a href="#" className="hover:text-white transition-colors">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
