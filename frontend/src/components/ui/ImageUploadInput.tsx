import React, { useRef, useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { UploadService } from '../../services/upload.service';
import { useToast } from '../../context/ToastContext';

interface Props {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  placeholder?: string;
}

export default function ImageUploadInput({ value, onChange, className = '', placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.showToast('Kích thước ảnh không được vượt quá 5MB', 'error');
      return;
    }
    
    try {
      setIsUploading(true);
      const url = await UploadService.uploadImage(file);
      onChange(url);
      toast.showToast('Tải ảnh lên thành công!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      toast.showToast('Lỗi khi tải ảnh lên. Vui lòng thử lại.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="relative flex-1 flex items-center w-full">
        <ImageIcon size={16} className="absolute left-3 text-gray-500" />
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "URL ảnh..."}
          className="w-full pl-9 pr-10 py-2 text-sm bg-white/90 border border-gray-300 rounded-lg focus:border-gray-900 focus:bg-white outline-none text-gray-900 transition-colors shadow-sm"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute right-1.5 p-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Tải ảnh từ máy tính"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        </button>
      </div>
    </div>
  );
}
