import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-right-8 fade-in ${
              toast.type === 'success'
                ? 'bg-green-50/90 border-green-200 text-green-900'
                : toast.type === 'error'
                ? 'bg-red-50/90 border-red-200 text-red-900'
                : 'bg-white/90 border-gray-200 text-gray-900'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="text-green-600 flex-shrink-0" size={22} />}
            {toast.type === 'error' && <XCircle className="text-red-600 flex-shrink-0" size={22} />}
            {toast.type === 'info' && <Info className="text-blue-600 flex-shrink-0" size={22} />}
            
            <p className="text-sm font-semibold pr-8 leading-snug">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
