import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, HeadphonesIcon, Mail } from 'lucide-react';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import ProductCard from '../components/ui/ProductCard';
export default function Home() {
  const { data: featuredData, isLoading, isError } = useFeaturedProducts(4);
  const featuredProducts = featuredData?.content || [];
  
  const { settings } = useSettings();
  const heroTitle = settings.HERO_TITLE || 'BỘ SƯU TẬP THIẾT YẾU';
  const heroSubtitle = settings.HERO_SUBTITLE || 'Nâng tầm phong cách mỗi ngày với bộ sưu tập phụ kiện tinh tế, tối giản và mang đậm dấu ấn cá nhân.';
  const heroBgImage = settings.HERO_BG_IMAGE || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=2000';
  const newsletterTitle = settings.NEWSLETTER_TITLE || 'Nhận ưu đãi độc quyền';
  const newsletterDesc = settings.NEWSLETTER_DESC || 'Đăng ký email để trở thành người đầu tiên biết về các bộ sưu tập mới và nhận mã giảm giá 10% cho đơn hàng đầu tiên.';

  // Trust Indicators
  const trust1Title = settings.TRUST_1_TITLE || 'Miễn phí giao hàng';
  const trust1Desc = settings.TRUST_1_DESC || 'Cho mọi đơn hàng từ 500k';
  const trust2Title = settings.TRUST_2_TITLE || 'Cam kết chất lượng';
  const trust2Desc = settings.TRUST_2_DESC || 'Bạc 925 & Đá tự nhiên 100%';
  const trust3Title = settings.TRUST_3_TITLE || 'Bảo hành 1 đổi 1';
  const trust3Desc = settings.TRUST_3_DESC || 'Trong vòng 30 ngày';
  const trust4Title = settings.TRUST_4_TITLE || 'Hỗ trợ 24/7';
  const trust4Desc = settings.TRUST_4_DESC || 'Luôn sẵn sàng phục vụ';

  // Category Bento
  const bento1Title = settings.BENTO_1_TITLE || 'Tâm linh';
  const bento1Subtitle = settings.BENTO_1_SUBTITLE || 'Bình an & Thư thái';
  const bento1Image = settings.BENTO_1_IMAGE || 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=1200';
  const bento1Link = settings.BENTO_1_LINK || '/shop?category=Tâm linh';

  const bento2Title = settings.BENTO_2_TITLE || 'Phong thủy';
  const bento2Subtitle = settings.BENTO_2_SUBTITLE || 'Tài lộc & May mắn';
  const bento2Image = settings.BENTO_2_IMAGE || 'https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=800';
  const bento2Link = settings.BENTO_2_LINK || '/shop?category=Phong thủy';

  return (
    <div className="w-full bg-white font-sans selection:bg-gray-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <img 
          src={heroBgImage} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover object-center animate-in zoom-in duration-[2000ms] fill-mode-both"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
        
        <div className="relative z-10 text-center text-white px-4 flex flex-col items-center mt-12 max-w-4xl mx-auto backdrop-blur-sm bg-black/10 p-8 md:p-16 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <span className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-6 text-gray-300 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-gray-400"></span>
            Bộ sưu tập mùa hè
            <span className="w-12 h-[1px] bg-gray-400"></span>
          </span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
            {heroTitle.split('\\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)}
          </h1>
          
          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto font-light text-gray-200/90 leading-relaxed">
            {heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/shop" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white text-gray-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 group">
              <span>Mua sắm ngay</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/shop?sort=newest" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-transparent border border-white/30 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white transition-all duration-300">
              <span>Khám phá hàng mới</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-gray-100 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 pt-4 md:pt-0">
              <Truck size={36} className="text-gray-900 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[13px]">{trust1Title}</h4>
              <p className="text-gray-500 text-sm">{trust1Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 pt-4 md:pt-0">
              <ShieldCheck size={36} className="text-gray-900 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[13px]">{trust2Title}</h4>
              <p className="text-gray-500 text-sm">{trust2Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pt-8 md:pt-0">
              <RefreshCcw size={36} className="text-gray-900 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[13px]">{trust3Title}</h4>
              <p className="text-gray-500 text-sm">{trust3Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 pt-8 md:pt-0">
              <HeadphonesIcon size={36} className="text-gray-900 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[13px]">{trust4Title}</h4>
              <p className="text-gray-500 text-sm">{trust4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-gray-50 rounded-full blur-3xl -z-10 opacity-50"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-gray-900">Hàng mới về</h2>
            <p className="text-gray-500 text-lg">Những tuyệt tác tối giản vừa được cập bến.</p>
          </div>
          <Link to="/shop" className="group hidden md:flex items-center text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-gray-500 transition-colors animate-in fade-in slide-in-from-right-8 duration-700">
            Xem tất cả <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col rounded-3xl overflow-hidden border border-gray-100 bg-white animate-pulse shadow-sm">
                <div className="aspect-[4/5] bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-600 font-medium">Không thể tải sản phẩm nổi bật lúc này. Vui lòng thử lại sau.</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
            <p className="text-gray-400 font-medium tracking-wide">Hiện tại chưa có sản phẩm nổi bật nào được cập nhật.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                style={{ animationDuration: '700ms', animationDelay: `${index * 150}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center md:hidden">
          <Link to="/shop" className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>
      
      {/* Category Bento Box Banners */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-gray-900">Bộ sưu tập</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Mỗi món phụ kiện là một câu chuyện độc đáo, tôn vinh vẻ đẹp tối giản và tinh tế của bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:h-[600px]">
            {/* Bento 1: Large left */}
            <Link to={bento1Link} className="relative group overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-700 md:col-span-2 lg:h-full h-[400px]">
                <img src={bento1Image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
                    <span className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-gray-300">{bento1Subtitle}</span>
                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4">{bento1Title}</h3>
                    <div className="overflow-hidden">
                      <span className="inline-flex items-center gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 font-bold uppercase tracking-wider text-sm border-b border-white pb-1">
                        Khám phá ngay <ArrowRight size={16} />
                      </span>
                    </div>
                </div>
            </Link>

            {/* Bento Right Column */}
            <div className="flex flex-col gap-4 md:gap-6 md:col-span-1 lg:h-full">
              {/* Bento 2: Top Right */}
              <Link to={bento2Link} className="relative group overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-700 flex-1 h-[250px] lg:h-auto">
                  <img src={bento2Image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                      <span className="text-xs font-bold tracking-[0.2em] uppercase mb-2 text-gray-300">{bento2Subtitle}</span>
                      <h3 className="text-3xl font-black uppercase tracking-widest mb-3">{bento2Title}</h3>
                      <div className="overflow-hidden">
                        <span className="inline-flex items-center gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 font-bold uppercase tracking-wider text-xs border-b border-white pb-1">
                          Mua sắm <ArrowRight size={14} />
                        </span>
                      </div>
                  </div>
              </Link>
              
              {/* Bento 3: Bottom Right */}
              <Link to="/shop" className="relative group overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-700 flex-1 bg-gray-900 h-[250px] lg:h-auto flex items-center justify-center text-center p-8 border border-gray-800">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-white w-full">
                      <span className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <ArrowRight size={24} />
                      </span>
                      <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Tất cả sản phẩm</h3>
                      <p className="text-gray-400 text-sm font-medium">Hơn 100+ mẫu mã độc quyền</p>
                  </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Mail size={48} className="mx-auto text-gray-400 mb-8" strokeWidth={1} />
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6 text-white">
            {newsletterTitle}
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            {newsletterDesc}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký!'); }}>
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn..." 
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 px-8 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/10 transition-all font-light"
              required
            />
            <button 
              type="submit" 
              className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
