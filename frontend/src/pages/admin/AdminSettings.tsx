import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Truck } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../context/ToastContext';

const settingsSchema = z.object({
  SHIPPING_FEE_DEFAULT: z.string().regex(/^\d+$/, 'Phải là số'),
  FREE_SHIPPING_THRESHOLD: z.string().regex(/^\d+$/, 'Phải là số'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      SHIPPING_FEE_DEFAULT: '30000',
      FREE_SHIPPING_THRESHOLD: '500000',
    },
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      reset({
        SHIPPING_FEE_DEFAULT: settings.SHIPPING_FEE_DEFAULT || '30000',
        FREE_SHIPPING_THRESHOLD: settings.FREE_SHIPPING_THRESHOLD || '500000',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      toast.showToast('Cập nhật cấu hình thành công!', 'success');
    } catch (error: any) {
      toast.showToast(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.', 'error');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình Hệ thống</h1>
        <p className="text-gray-500">Quản lý phí vận chuyển và các thông số kỹ thuật khác</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 max-w-4xl">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Shipping Section */}
          <div className="block animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Truck size={20} className="text-gray-400" />
              Cấu hình Vận chuyển
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phí vận chuyển mặc định (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('SHIPPING_FEE_DEFAULT')}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400 font-medium">đ</span>
                </div>
                {errors.SHIPPING_FEE_DEFAULT && <p className="text-red-500 text-xs mt-1.5">{errors.SHIPPING_FEE_DEFAULT.message}</p>}
                <p className="text-xs text-gray-500 mt-2">Phí ship áp dụng cho đơn hàng thông thường.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ngưỡng miễn phí vận chuyển (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('FREE_SHIPPING_THRESHOLD')}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400 font-medium">đ</span>
                </div>
                {errors.FREE_SHIPPING_THRESHOLD && <p className="text-red-500 text-xs mt-1.5">{errors.FREE_SHIPPING_THRESHOLD.message}</p>}
                <p className="text-xs text-gray-500 mt-2">Đơn hàng có tổng tiền lớn hơn hoặc bằng mức này sẽ được freeship.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
