import { Diamond, ShieldCheck, Heart, Sparkles, Gem, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full bg-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1573408301145-b98c4af010f1?q=80&w=2000&auto=format&fit=crop" 
          alt="MIA Accessories"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <p className="text-white/90 uppercase tracking-[0.5em] font-bold mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-white mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            MIA Accessories
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-serif italic max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            "Đánh thức vẻ đẹp tiềm ẩn và sự tự tin bên trong mỗi người phụ nữ."
          </p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop" 
                  alt="Philosophy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-white/20 m-4 rounded-2xl"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Triết lý thiết kế</p>
                <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">Tôn Vinh Vẻ Đẹp<br/>Nguyên Bản</h2>
                <div className="w-16 h-1 bg-gray-900 mb-8"></div>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Tại MIA, chúng tôi tin rằng trang sức không chỉ là vật tô điểm bên ngoài, mà còn là ngôn ngữ không lời thể hiện cá tính và câu chuyện riêng của bạn.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Mỗi thiết kế đều được tinh giản hóa để giữ lại những đường nét thuần khiết nhất, kết hợp cùng chất liệu cao cấp để tạo nên những món phụ kiện vượt thời gian, đồng hành cùng bạn trong mọi khoảnh khắc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Craftsmanship Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-4">Chất liệu & Chế tác</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">Cam kết mang đến sự an tâm tuyệt đối cho làn da nhạy cảm nhất.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Titanium Không Gỉ</h3>
              <p className="text-gray-600 leading-relaxed">
                Chất liệu Titanium Y tế siêu bền, chống nước tuyệt đối, không đen, không gỉ sét. Thoải mái đeo hàng ngày, kể cả khi tắm hay vận động.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bạc Ý S925 Cao Cấp</h3>
              <p className="text-gray-600 leading-relaxed">
                Hàm lượng bạc nguyên chất 92.5% kết hợp lớp phủ Platinum sang trọng. Đặc biệt an toàn, không gây kích ứng hay mẩn đỏ cho da nhạy cảm.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                <Gem size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Đá Zirconia Lấp Lánh</h3>
              <p className="text-gray-600 leading-relaxed">
                Đá Cubic Zirconia (CZ) được cắt giác tinh xảo chuẩn kim cương, bắt sáng hoàn hảo, mang lại vẻ đẹp lộng lẫy và sang trọng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values / Banner */}
      <div className="relative py-32 bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop" 
            alt="Jewelry making" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay grayscale"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          <Heart size={48} className="mx-auto mb-8 text-white/80" />
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-8 leading-tight">Món Quà Từ Trái Tim</h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-12">
            Mỗi đơn hàng tại MIA đều được đóng gói thủ công tỉ mỉ trong hộp quà cao cấp, kèm theo thiệp viết tay và dải ruy băng lụa. Dù là tự thưởng cho bản thân hay gửi tặng người thương, cảm giác khi mở hộp chắc chắn sẽ là một niềm vui trọn vẹn.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold uppercase tracking-widest px-10 py-4 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300">
            Khám phá Cửa hàng <ArrowRight size={20} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
