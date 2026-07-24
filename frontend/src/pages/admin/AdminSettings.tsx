import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle, LayoutDashboard, LayoutGrid, ShieldCheck, Mail, ImageIcon, Truck } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../context/ToastContext';

const settingsSchema = z.object({
  HERO_TITLE: z.string().min(1, 'Không được để trống'),
  HERO_SUBTITLE: z.string().optional(),
  HERO_BG_IMAGE: z.string().url('Phải là đường dẫn URL hợp lệ'),
  NEWSLETTER_TITLE: z.string().optional(),
  NEWSLETTER_DESC: z.string().optional(),
  TRUST_1_TITLE: z.string().optional(),
  TRUST_1_DESC: z.string().optional(),
  TRUST_2_TITLE: z.string().optional(),
  TRUST_2_DESC: z.string().optional(),
  TRUST_3_TITLE: z.string().optional(),
  TRUST_3_DESC: z.string().optional(),
  TRUST_4_TITLE: z.string().optional(),
  TRUST_4_DESC: z.string().optional(),
  BENTO_1_TITLE: z.string().optional(),
  BENTO_1_SUBTITLE: z.string().optional(),
  BENTO_1_IMAGE: z.string().url('Phải là đường dẫn URL hợp lệ').or(z.literal('')),
  BENTO_1_LINK: z.string().optional(),
  BENTO_2_TITLE: z.string().optional(),
  BENTO_2_SUBTITLE: z.string().optional(),
  BENTO_2_IMAGE: z.string().url('Phải là đường dẫn URL hợp lệ').or(z.literal('')),
  BENTO_2_LINK: z.string().optional(),
  SHIPPING_FEE_DEFAULT: z.string().regex(/^\d+$/, 'Phải là số'),
  FREE_SHIPPING_THRESHOLD: z.string().regex(/^\d+$/, 'Phải là số'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type TabType = 'hero' | 'bento' | 'trust' | 'newsletter' | 'shipping';

const ImagePreview = ({ url, alt }: { url?: string, alt: string }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (!url || error) {
    return (
      <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 mt-2">
        <ImageIcon size={32} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">Chưa có ảnh hoặc link hỏng</span>
      </div>
    );
  }

  return (
    <div className="mt-2 w-full h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
      <img 
        src={url} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setError(true)}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-sm font-medium">Bản xem trước</span>
      </div>
    </div>
  );
};

export default function AdminSettings() {
  const { settings, isLoading, isError, updateSettings, isUpdating } = useSettings();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      HERO_TITLE: settings?.HERO_TITLE || 'BỘ SƯU TẬP THIẾT YẾU',
      HERO_SUBTITLE: settings?.HERO_SUBTITLE || 'Nâng tầm phong cách mỗi ngày với bộ sưu tập phụ kiện tinh tế...',
      HERO_BG_IMAGE: settings?.HERO_BG_IMAGE || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=2000',
      NEWSLETTER_TITLE: settings?.NEWSLETTER_TITLE || 'Nhận ưu đãi độc quyền',
      NEWSLETTER_DESC: settings?.NEWSLETTER_DESC || 'Đăng ký email để trở thành người đầu tiên biết về các bộ sưu tập mới...',
      
      TRUST_1_TITLE: settings?.TRUST_1_TITLE || 'Miễn phí giao hàng',
      TRUST_1_DESC: settings?.TRUST_1_DESC || 'Cho mọi đơn hàng từ 500k',
      TRUST_2_TITLE: settings?.TRUST_2_TITLE || 'Cam kết chất lượng',
      TRUST_2_DESC: settings?.TRUST_2_DESC || 'Bạc 925 & Đá tự nhiên 100%',
      TRUST_3_TITLE: settings?.TRUST_3_TITLE || 'Bảo hành 1 đổi 1',
      TRUST_3_DESC: settings?.TRUST_3_DESC || 'Trong vòng 30 ngày',
      TRUST_4_TITLE: settings?.TRUST_4_TITLE || 'Hỗ trợ 24/7',
      TRUST_4_DESC: settings?.TRUST_4_DESC || 'Luôn sẵn sàng phục vụ',
      
      BENTO_1_TITLE: settings?.BENTO_1_TITLE || 'Tâm linh',
      BENTO_1_SUBTITLE: settings?.BENTO_1_SUBTITLE || 'Bình an & Thư thái',
      BENTO_1_IMAGE: settings?.BENTO_1_IMAGE || 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=1200',
      BENTO_1_LINK: settings?.BENTO_1_LINK || '/shop?category=Tâm linh',
      
      BENTO_2_TITLE: settings?.BENTO_2_TITLE || 'Phong thủy',
      BENTO_2_SUBTITLE: settings?.BENTO_2_SUBTITLE || 'Tài lộc & May mắn',
      BENTO_2_IMAGE: settings?.BENTO_2_IMAGE || 'https://images.unsplash.com/photo-1599643478514-4a4e0f1523bb?auto=format&fit=crop&q=80&w=800',
      BENTO_2_LINK: settings?.BENTO_2_LINK || '/shop?category=Phong thủy',
      
      SHIPPING_FEE_DEFAULT: settings?.SHIPPING_FEE_DEFAULT || '30000',
      FREE_SHIPPING_THRESHOLD: settings?.FREE_SHIPPING_THRESHOLD || '500000',
    },
  });

  const watchHeroImage = watch('HERO_BG_IMAGE');
  const watchBento1Image = watch('BENTO_1_IMAGE');
  const watchBento2Image = watch('BENTO_2_IMAGE');

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      toast.success('Cập nhật cấu hình thành công!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
      console.error(error);
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'hero', label: 'Hero Banner', icon: LayoutDashboard },
    { id: 'bento', label: 'Bento Box', icon: LayoutGrid },
    { id: 'trust', label: 'Cam kết', icon: ShieldCheck },
    { id: 'newsletter', label: 'Nhận tin', icon: Mail },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg"></div>)}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl h-[400px]">
          <div className="space-y-6">
            <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
            <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
            <div className="h-48 w-full bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) return <div className="p-8 text-red-500 bg-red-50 rounded-lg border border-red-100">Lỗi khi tải cấu hình. Vui lòng thử lại!</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cấu hình Giao diện</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nội dung và hình ảnh hiển thị trên website</p>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isUpdating}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm font-medium"
        >
          <Save size={18} />
          {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'border-gray-900 text-gray-900 bg-gray-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 max-w-4xl">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Hero Section */}
          <div className={activeTab === 'hero' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tiêu đề lớn</label>
                <input
                  type="text"
                  {...register('HERO_TITLE')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
                {errors.HERO_TITLE && <p className="text-red-500 text-sm mt-1.5">{errors.HERO_TITLE.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mô tả ngắn</label>
                <textarea
                  {...register('HERO_SUBTITLE')}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Link Ảnh Nền (URL)</label>
                <input
                  type="text"
                  {...register('HERO_BG_IMAGE')}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors ${errors.HERO_BG_IMAGE ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'}`}
                />
                {errors.HERO_BG_IMAGE && <p className="text-red-500 text-sm mt-1.5">{errors.HERO_BG_IMAGE.message}</p>}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 bg-blue-50 text-blue-700 p-2 rounded-md">
                  <AlertCircle size={14} className="shrink-0" /> Khuyên dùng ảnh chất lượng cao ngang (tỷ lệ 16:9 hoặc siêu rộng) từ Unsplash hoặc Imgur.
                </p>
                <ImagePreview url={watchHeroImage} alt="Hero preview" />
              </div>
            </div>
          </div>

          {/* Bento Section */}
          <div className={activeTab === 'bento' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
            <div className="space-y-8">
              {[1, 2].map((num) => (
                <div key={num} className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-5">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{num}</span>
                    Bộ sưu tập {num}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tiêu đề (VD: Tâm linh)</label>
                      <input
                        type="text"
                        {...register(`BENTO_${num}_TITLE` as keyof SettingsFormValues)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tiêu đề phụ</label>
                      <input
                        type="text"
                        {...register(`BENTO_${num}_SUBTITLE` as keyof SettingsFormValues)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Đường dẫn khi click (URL nội bộ)</label>
                      <input
                        type="text"
                        {...register(`BENTO_${num}_LINK` as keyof SettingsFormValues)}
                        placeholder="/shop?category=..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Link Ảnh Cover (URL)</label>
                      <input
                        type="text"
                        {...register(`BENTO_${num}_IMAGE` as keyof SettingsFormValues)}
                        className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-gray-900 text-sm transition-colors ${errors[`BENTO_${num}_IMAGE` as keyof typeof errors] ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {errors[`BENTO_${num}_IMAGE` as keyof typeof errors] && <p className="text-red-500 text-xs mt-1.5">{errors[`BENTO_${num}_IMAGE` as keyof typeof errors]?.message}</p>}
                      <ImagePreview url={num === 1 ? watchBento1Image : watchBento2Image} alt={`Bento ${num} preview`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators Section */}
          <div className={activeTab === 'trust' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4 hover:border-gray-300 transition-colors">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ShieldCheck size={16} className="text-gray-400" />
                    Cam kết {num}
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề chính</label>
                    <input
                      type="text"
                      {...register(`TRUST_${num}_TITLE` as keyof SettingsFormValues)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả ngắn gọn</label>
                    <input
                      type="text"
                      {...register(`TRUST_${num}_DESC` as keyof SettingsFormValues)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className={activeTab === 'newsletter' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tiêu đề Form Đăng ký</label>
                <input
                  type="text"
                  {...register('NEWSLETTER_TITLE')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Đoạn văn miêu tả lợi ích</label>
                <textarea
                  {...register('NEWSLETTER_DESC')}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Shipping Section */}
          <div className={activeTab === 'shipping' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <AlertCircle size={24} className="text-blue-500 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">Thiết lập Phí Vận Chuyển Động</p>
                  <p>Hệ thống sẽ tự động miễn phí vận chuyển nếu Tổng giá trị đơn hàng bằng hoặc lớn hơn <strong>Ngưỡng Freeship</strong>. Nếu chưa đạt ngưỡng, khách hàng sẽ thanh toán mức <strong>Phí ship mặc định</strong>.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phí ship mặc định (VND)</label>
                  <input
                    type="number"
                    {...register('SHIPPING_FEE_DEFAULT')}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors"
                  />
                  {errors.SHIPPING_FEE_DEFAULT && <p className="text-red-500 text-sm mt-1.5">{errors.SHIPPING_FEE_DEFAULT.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ngưỡng Freeship (VND)</label>
                  <input
                    type="number"
                    {...register('FREE_SHIPPING_THRESHOLD')}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors"
                  />
                  {errors.FREE_SHIPPING_THRESHOLD && <p className="text-red-500 text-sm mt-1.5">{errors.FREE_SHIPPING_THRESHOLD.message}</p>}
                </div>
              </div>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}
