import { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Sparkles, Gem, ArrowRight, Edit3, Save, X, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageUploadInput from '../components/ui/ImageUploadInput';

export default function About() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'ROLE_ADMIN';
  const toast = useToast();
  
  const { settings = {}, updateSettings, isUpdating } = useSettings();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localSettings, setLocalSettings] = useState<any>({});

  useEffect(() => {
    if (isEditMode && settings) {
      setLocalSettings(settings);
    }
  }, [isEditMode, settings]);

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      toast.showToast('Cập nhật giao diện thành công!', 'success');
      setIsEditMode(false);
    } catch (e) {
      toast.showToast('Có lỗi xảy ra khi lưu.', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setLocalSettings({});
  };

  const handleChange = (key: string, value: string) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const getVal = (key: string, defaultVal: string) => {
    return isEditMode ? (localSettings[key] ?? settings[key] ?? defaultVal) : (settings[key] || defaultVal);
  };

  const heroBgImage = getVal('ABOUT_HERO_BG', 'https://images.unsplash.com/photo-1573408301145-b98c4af010f1?q=80&w=2000&auto=format&fit=crop');
  const heroSubtitle = getVal('ABOUT_HERO_SUBTITLE', 'Our Story');
  const heroTitle = getVal('ABOUT_HERO_TITLE', 'MIA Accessories');
  const heroQuote = getVal('ABOUT_HERO_QUOTE', '"Đánh thức vẻ đẹp tiềm ẩn và sự tự tin bên trong mỗi người phụ nữ."');

  const philSub = getVal('ABOUT_PHIL_SUB', 'Triết lý thiết kế');
  const philTitle = getVal('ABOUT_PHIL_TITLE', 'Tôn Vinh Vẻ Đẹp\\nNguyên Bản');
  const philDesc1 = getVal('ABOUT_PHIL_DESC1', 'Tại MIA, chúng tôi tin rằng trang sức không chỉ là vật tô điểm bên ngoài, mà còn là ngôn ngữ không lời thể hiện cá tính và câu chuyện riêng của bạn.');
  const philDesc2 = getVal('ABOUT_PHIL_DESC2', 'Mỗi thiết kế đều được tinh giản hóa để giữ lại những đường nét thuần khiết nhất, kết hợp cùng chất liệu cao cấp để tạo nên những món phụ kiện vượt thời gian, đồng hành cùng bạn trong mọi khoảnh khắc.');

  const philImg = getVal('ABOUT_PHIL_IMG', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop');

  const craftTitle = getVal('ABOUT_CRAFT_TITLE', 'Chất liệu & Chế tác');
  const craftSub = getVal('ABOUT_CRAFT_SUB', 'Cam kết mang đến sự an tâm tuyệt đối cho làn da nhạy cảm nhất.');

  const mat1Title = getVal('ABOUT_MAT1_TITLE', 'Titanium Không Gỉ');
  const mat1Desc = getVal('ABOUT_MAT1_DESC', 'Chất liệu Titanium Y tế siêu bền, chống nước tuyệt đối, không đen, không gỉ sét. Thoải mái đeo hàng ngày, kể cả khi tắm hay vận động.');
  const mat2Title = getVal('ABOUT_MAT2_TITLE', 'Bạc Ý S925 Cao Cấp');
  const mat2Desc = getVal('ABOUT_MAT2_DESC', 'Hàm lượng bạc nguyên chất 92.5% kết hợp lớp phủ Platinum sang trọng. Đặc biệt an toàn, không gây kích ứng hay mẩn đỏ cho da nhạy cảm.');
  const mat3Title = getVal('ABOUT_MAT3_TITLE', 'Đá Zirconia Lấp Lánh');
  const mat3Desc = getVal('ABOUT_MAT3_DESC', 'Đá Cubic Zirconia (CZ) được cắt giác tinh xảo chuẩn kim cương, bắt sáng hoàn hảo, mang lại vẻ đẹp lộng lẫy và sang trọng.');

  const valueTitle = getVal('ABOUT_VALUE_TITLE', 'Món Quà Từ Trái Tim');
  const valueDesc = getVal('ABOUT_VALUE_DESC', 'Mỗi đơn hàng tại MIA đều được đóng gói thủ công tỉ mỉ trong hộp quà cao cấp, kèm theo thiệp viết tay và dải ruy băng lụa. Dù là tự thưởng cho bản thân hay gửi tặng người thương, cảm giác khi mở hộp chắc chắn sẽ là một niềm vui trọn vẹn.');
  const valueImg = getVal('ABOUT_VALUE_IMG', 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full bg-gray-900 overflow-hidden">
        <img 
          src={heroBgImage} 
          alt="MIA Accessories"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        {isEditMode && (
          <div className="absolute top-4 left-4 z-50 w-72">
            <ImageUploadInput 
              value={heroBgImage}
              onChange={(url) => handleChange('ABOUT_HERO_BG', url)}
              placeholder="Nhập URL ảnh nền..."
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {isEditMode ? (
            <input
              value={heroSubtitle}
              onChange={(e) => handleChange('ABOUT_HERO_SUBTITLE', e.target.value)}
              className="text-white/90 uppercase tracking-[0.5em] font-bold mb-6 text-center bg-transparent border-b border-dashed border-white/50 outline-none"
            />
          ) : (
            <p className="text-white/90 uppercase tracking-[0.5em] font-bold mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">{heroSubtitle}</p>
          )}

          {isEditMode ? (
            <input
              value={heroTitle}
              onChange={(e) => handleChange('ABOUT_HERO_TITLE', e.target.value)}
              className="text-5xl md:text-7xl font-black uppercase tracking-widest text-white mb-8 text-center bg-transparent border-b border-dashed border-white/50 outline-none w-full max-w-4xl"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-white mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              {heroTitle}
            </h1>
          )}

          {isEditMode ? (
            <textarea
              value={heroQuote}
              onChange={(e) => handleChange('ABOUT_HERO_QUOTE', e.target.value)}
              className="text-xl md:text-2xl text-gray-200 font-serif italic max-w-2xl text-center bg-transparent border border-dashed border-white/50 outline-none w-full rounded"
              rows={2}
            />
          ) : (
            <p className="text-xl md:text-2xl text-gray-200 font-serif italic max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              {heroQuote}
            </p>
          )}
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src={philImg} 
                  alt="Philosophy"
                  className="w-full h-full object-cover"
                />
                {isEditMode && (
                  <div className="absolute top-4 left-4 right-4 z-50">
                    <ImageUploadInput 
                      value={philImg}
                      onChange={(url) => handleChange('ABOUT_PHIL_IMG', url)}
                      placeholder="URL ảnh triết lý..."
                    />
                  </div>
                )}
                <div className="absolute inset-0 border-4 border-white/20 m-4 rounded-2xl pointer-events-none"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <div className="flex flex-col">
                {isEditMode ? (
                  <input
                    value={philSub}
                    onChange={(e) => handleChange('ABOUT_PHIL_SUB', e.target.value)}
                    className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 bg-transparent border-b border-dashed border-gray-300 outline-none"
                  />
                ) : (
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{philSub}</p>
                )}

                {isEditMode ? (
                  <textarea
                    value={philTitle}
                    onChange={(e) => handleChange('ABOUT_PHIL_TITLE', e.target.value)}
                    className="text-4xl font-black text-gray-900 mb-6 leading-tight bg-transparent border border-dashed border-gray-300 outline-none w-full rounded p-2"
                    rows={2}
                  />
                ) : (
                  <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                    {philTitle.split('\\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)}
                  </h2>
                )}
                <div className="w-16 h-1 bg-gray-900 mb-8"></div>
                
                {isEditMode ? (
                  <>
                    <textarea
                      value={philDesc1}
                      onChange={(e) => handleChange('ABOUT_PHIL_DESC1', e.target.value)}
                      className="text-gray-600 leading-relaxed text-lg mb-6 bg-transparent border border-dashed border-gray-300 outline-none w-full rounded p-2"
                      rows={3}
                    />
                    <textarea
                      value={philDesc2}
                      onChange={(e) => handleChange('ABOUT_PHIL_DESC2', e.target.value)}
                      className="text-gray-600 leading-relaxed text-lg bg-transparent border border-dashed border-gray-300 outline-none w-full rounded p-2"
                      rows={3}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 leading-relaxed text-lg mb-6">{philDesc1}</p>
                    <p className="text-gray-600 leading-relaxed text-lg">{philDesc2}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Craftsmanship Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 flex flex-col items-center">
            {isEditMode ? (
              <>
                <input
                  value={craftTitle}
                  onChange={(e) => handleChange('ABOUT_CRAFT_TITLE', e.target.value)}
                  className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-4 text-center bg-transparent border-b border-dashed border-gray-400 outline-none w-full max-w-xl"
                />
                <input
                  value={craftSub}
                  onChange={(e) => handleChange('ABOUT_CRAFT_SUB', e.target.value)}
                  className="text-gray-500 max-w-2xl mx-auto font-medium text-center bg-transparent border-b border-dashed border-gray-400 outline-none w-full"
                />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-4">{craftTitle}</h2>
                <p className="text-gray-500 max-w-2xl mx-auto font-medium">{craftSub}</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, titleKey: 'ABOUT_MAT1_TITLE', descKey: 'ABOUT_MAT1_DESC', title: mat1Title, desc: mat1Desc },
              { icon: Sparkles, titleKey: 'ABOUT_MAT2_TITLE', descKey: 'ABOUT_MAT2_DESC', title: mat2Title, desc: mat2Desc },
              { icon: Gem, titleKey: 'ABOUT_MAT3_TITLE', descKey: 'ABOUT_MAT3_DESC', title: mat3Title, desc: mat3Desc }
            ].map((item, index) => (
              <div key={index} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group flex flex-col items-start">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                  <item.icon size={32} />
                </div>
                {isEditMode ? (
                  <>
                    <input
                      value={item.title}
                      onChange={(e) => handleChange(item.titleKey, e.target.value)}
                      className="text-xl font-bold text-gray-900 mb-4 bg-transparent border-b border-dashed border-gray-400 outline-none w-full"
                    />
                    <textarea
                      value={item.desc}
                      onChange={(e) => handleChange(item.descKey, e.target.value)}
                      className="text-gray-600 leading-relaxed bg-transparent border border-dashed border-gray-400 outline-none w-full rounded p-2 flex-1"
                      rows={4}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values / Banner */}
      <div className="relative py-32 bg-gray-900 text-white flex flex-col items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={valueImg} 
            alt="Jewelry making" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay grayscale"
          />
          {isEditMode && (
            <div className="absolute top-4 left-4 z-50 w-72">
              <ImageUploadInput 
                value={valueImg}
                onChange={(url) => handleChange('ABOUT_VALUE_IMG', url)}
                placeholder="Nhập URL ảnh nền (Dark)..."
              />
            </div>
          )}
        </div>
        <div className="relative container mx-auto px-4 text-center max-w-4xl flex flex-col items-center">
          <Heart size={48} className="mx-auto mb-8 text-white/80" />
          {isEditMode ? (
            <>
              <input
                value={valueTitle}
                onChange={(e) => handleChange('ABOUT_VALUE_TITLE', e.target.value)}
                className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-8 leading-tight text-center bg-transparent border-b border-dashed border-white/50 outline-none w-full"
              />
              <textarea
                value={valueDesc}
                onChange={(e) => handleChange('ABOUT_VALUE_DESC', e.target.value)}
                className="text-lg md:text-xl text-gray-300 leading-relaxed mb-12 text-center bg-transparent border border-dashed border-white/50 outline-none w-full rounded p-2"
                rows={3}
              />
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-8 leading-tight">{valueTitle}</h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-12">{valueDesc}</p>
            </>
          )}
          
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold uppercase tracking-widest px-10 py-4 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300">
            Khám phá Cửa hàng <ArrowRight size={20} />
          </Link>
        </div>
      </div>
      
      {isSuperAdmin && (
        <div className="fixed bottom-8 right-8 z-50 flex gap-3">
          {isEditMode ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 font-bold tracking-wider text-sm transition-all"
              >
                <X size={18} /> HỦY
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-black font-bold tracking-wider text-sm hover:scale-105 transition-all disabled:opacity-70"
              >
                <Save size={18} /> {isUpdating ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] border border-gray-100 hover:bg-gray-50 font-bold tracking-wider text-sm hover:scale-105 transition-all"
            >
              <Edit3 size={18} /> CHỈNH SỬA TRANG
            </button>
          )}
        </div>
      )}
    </div>
  );
}
