import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useProducts, useMaxPrice } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL Params
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'All';
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlSort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Fetch dynamic max price from backend
  const { data: fetchedMaxPrice } = useMaxPrice();
  const maxLimit = fetchedMaxPrice || 2000000;

  // Local state for debouncing
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [localMinPrice, setLocalMinPrice] = useState(urlMinPrice ? parseInt(urlMinPrice) : 0);
  const [localMaxPrice, setLocalMaxPrice] = useState(urlMaxPrice ? parseInt(urlMaxPrice) : maxLimit);

  // Sync back to local state if URL changes externally or maxLimit loads
  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setLocalMinPrice(urlMinPrice ? parseInt(urlMinPrice) : 0);
    setLocalMaxPrice(urlMaxPrice ? parseInt(urlMaxPrice) : maxLimit);
  }, [urlMinPrice, urlMaxPrice, maxLimit]);

  // Debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== urlSearch) {
        updateParams({ search: localSearch, page: '0' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Debounce logic for price slider
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localMinPrice !== (urlMinPrice ? parseInt(urlMinPrice) : 0) || 
          localMaxPrice !== (urlMaxPrice ? parseInt(urlMaxPrice) : maxLimit)) {
        
        const newParams: Record<string, string> = { page: '0' };
        
        if (localMinPrice > 0) newParams.minPrice = localMinPrice.toString();
        else newParams.minPrice = ''; // clear from URL
        
        if (localMaxPrice < maxLimit) newParams.maxPrice = localMaxPrice.toString();
        else newParams.maxPrice = ''; // clear from URL
        
        updateParams(newParams);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localMinPrice, localMaxPrice]);

  // Helper to update URL params
  const updateParams = (newParams: Record<string, string>) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const merged = { ...currentParams, ...newParams };
    
    // Clean up empty params
    Object.keys(merged).forEach(key => {
      if (merged[key] === '' || merged[key] === 'All') {
        delete merged[key];
      }
    });
    
    setSearchParams(merged);
  };

  const queryParams: Record<string, any> = {
    page,
    size: 12,
  };
  
  if (urlSearch) queryParams.search = urlSearch;
  if (urlCategory !== 'All') queryParams.category = urlCategory;
  if (urlMinPrice) queryParams.minPrice = parseInt(urlMinPrice, 10);
  if (urlMaxPrice) queryParams.maxPrice = parseInt(urlMaxPrice, 10);
  
  if (urlSort === 'newest') queryParams.sort = 'createdAt,desc';
  if (urlSort === 'price-asc') queryParams.sort = 'minPrice,asc';
  if (urlSort === 'price-desc') queryParams.sort = 'minPrice,desc';

  const { data: productData, isLoading: loading } = useProducts(queryParams);
  const products = productData?.content || [];
  const totalPages = productData?.totalPages || 0;
  const totalElements = productData?.totalElements || 0;

  const { data: categoryData } = useCategories();
  
  const orderedCategories = useMemo(() => {
    const allOpt = { id: 'All', name: 'Tất cả', slug: 'All', depth: 0 };
    if (!categoryData) return [allOpt];
    
    const result: any[] = [allOpt];
    
    // Đệ quy để xếp danh mục theo N cấp
    const buildTree = (parentId: number | null | undefined, depth: number) => {
      const children = categoryData.filter(c => c.parentId === parentId || (!c.parentId && !parentId));
      children.forEach(child => {
        result.push({ ...child, depth });
        buildTree(child.id, depth + 1);
      });
    };
    
    buildTree(null, 0); // Bắt đầu từ danh mục gốc
    buildTree(undefined, 0); // Dự phòng nếu parentId là undefined thay vì null
    
    // Lọc lại kết quả để loại bỏ trùng lặp (nếu null và undefined bị trùng)
    const uniqueResult = Array.from(new Map(result.map(item => [item.id, item])).values());
    
    // Đưa vào những danh mục bị mồ côi (nếu có lỗi dữ liệu)
    const processedIds = new Set(uniqueResult.map(r => r.id));
    categoryData.forEach(c => {
      if (!processedIds.has(c.id)) {
        uniqueResult.push({ ...c, depth: 0 });
      }
    });
    
    return uniqueResult;
  }, [categoryData]);

  const clearFilters = () => {
    setSearchParams({});
    setLocalSearch('');
  };

  const hasActiveFilters = urlCategory !== 'All' || urlMinPrice !== '' || urlMaxPrice !== '' || urlSort !== 'newest' || urlSearch !== '';

  const setPage = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 selection:bg-gray-900 selection:text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900 transition-colors">Trang chủ</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <span className="text-gray-900">Cửa hàng</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
              Cửa hàng
            </h1>
            <p className="text-gray-500 text-lg">Khám phá bộ sưu tập phụ kiện tinh tế nhất.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-5 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-6 text-gray-900">
                <SlidersHorizontal size={20} />
                <h2 className="text-lg font-bold">Bộ lọc</h2>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Danh mục</h3>
                <div className="flex flex-col gap-2">
                  {orderedCategories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => updateParams({ category: cat.slug === 'All' ? 'All' : cat.slug, page: '0' })}
                      className={`flex items-center justify-between py-2 rounded-xl text-sm transition-all ${
                        (urlCategory === cat.slug || (urlCategory === 'All' && cat.slug === 'All'))
                          ? 'bg-gray-900 text-white shadow-md font-bold pr-3' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium pr-3'
                      } ${cat.depth > 0 ? 'text-[13px] border-l-2 border-gray-200 rounded-l-none' : ''}`}
                      style={{ paddingLeft: cat.depth > 0 ? `${cat.depth * 16 + 12}px` : '12px' }}
                    >
                      <span className="text-left">{cat.name}</span>
                      {(urlCategory === cat.slug || (urlCategory === 'All' && cat.slug === 'All')) && <ChevronRight size={14} className="opacity-70 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Mức giá</h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    {localMinPrice === 0 && localMaxPrice === maxLimit ? 'Tất cả' : 'Tùy chỉnh'}
                  </span>
                </div>
                
                <div className="px-2">
                  <div className="relative h-2 bg-gray-200 rounded-full mb-6">
                    <div 
                      className="absolute h-full bg-gray-900 rounded-full" 
                      style={{ 
                        left: `${(localMinPrice / maxLimit) * 100}%`, 
                        right: `${100 - (localMaxPrice / maxLimit) * 100}%` 
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxLimit}
                      step={50000}
                      value={localMinPrice}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), localMaxPrice - 50000);
                        setLocalMinPrice(val);
                      }}
                      className="absolute w-full -top-1.5 h-5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:rounded-full cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxLimit}
                      step={50000}
                      value={localMaxPrice}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), localMinPrice + 50000);
                        setLocalMaxPrice(val);
                      }}
                      className="absolute w-full -top-1.5 h-5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:rounded-full cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="bg-gray-50 border border-gray-200 px-1 py-1.5 rounded-lg text-gray-700 font-bold flex-1 text-center">
                      {localMinPrice.toLocaleString('vi-VN')}đ
                    </div>
                    <span className="text-gray-400 font-bold mx-2">-</span>
                    <div className="bg-gray-50 border border-gray-200 px-1 py-1.5 rounded-lg text-gray-700 font-bold flex-1 text-center">
                      {`${localMaxPrice.toLocaleString('vi-VN')}đ`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Sắp xếp theo</h3>
                <div className="relative">
                  <select 
                    value={urlSort}
                    onChange={(e) => updateParams({ sort: e.target.value, page: '0' })}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-sm transition-all"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center text-sm font-medium">
              <span className="text-gray-500">
                Hiển thị <span className="text-gray-900">{totalElements}</span> sản phẩm
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Rất tiếc, không có sản phẩm nào khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa hoặc xóa bớt bộ lọc.
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && (
              <Pagination 
                page={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
