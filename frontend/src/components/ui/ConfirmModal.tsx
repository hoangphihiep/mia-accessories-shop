import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = "Xác nhận hành động",
  message,
  onConfirm,
  onCancel,
  confirmText = "Đồng ý",
  cancelText = "Hủy bỏ",
  isDestructive = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="p-6">
          <div className={`flex items-center justify-center w-14 h-14 rounded-full mb-5 mx-auto ${isDestructive ? 'bg-rose-50' : 'bg-emerald-50'}`}>
            <AlertTriangle className={isDestructive ? 'text-rose-500' : 'text-emerald-500'} size={28} />
          </div>
          <h3 className="text-xl font-black text-center text-gray-900 mb-2 uppercase tracking-widest">{title}</h3>
          <p className="text-center text-gray-500 text-sm font-medium leading-relaxed px-2">
            {message}
          </p>
        </div>
        <div className="flex border-t border-gray-100">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100 uppercase tracking-widest"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 py-4 text-sm font-black transition-colors uppercase tracking-widest ${isDestructive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
