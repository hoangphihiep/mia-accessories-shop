import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-3xl font-black text-red-500 uppercase">Rất tiếc!</h1>
            <p className="text-gray-600 font-medium">Đã có lỗi xảy ra. Chúng tôi đang nỗ lực khắc phục.</p>
            <p className="text-sm text-gray-400 truncate bg-gray-50 p-2 rounded">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-primary text-white font-bold uppercase px-6 py-3 rounded hover:bg-gray-800 transition-colors"
            >
              Về Trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
