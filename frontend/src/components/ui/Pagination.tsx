import { ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center space-x-2">
      <button 
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} className="rotate-180" />
      </button>
      
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
            page === i 
              ? 'bg-gray-900 text-white' 
              : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
