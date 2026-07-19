import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, Search, X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';

export default function Shop() {

  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';
  const urlCategoryQuery = searchParams.get('category') || 'All';

  // Filter & Pagination States
  const [activeCategory, setActiveCategory] = useState(urlCategoryQuery);
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [localSearch, setLocalSearch] = useState(urlSearchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchQuery);
  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [activeCategory, priceRange, debouncedSearch, sortBy]);

  const queryParams: Record<string, any> = {
    page,
    size: 12,
  };
  
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (activeCategory !== 'All') queryParams.category = activeCategory;
  
  if (priceRange !== 'All') {
    if (priceRange === 'under-300') queryParams.maxPrice = 299999;
    if (priceRange === '300-500') {
      queryParams.minPrice = 300000;
      queryParams.maxPrice = 500000;
    }
    if (priceRange === 'over-500') queryParams.minPrice = 500001;
  }
  if (sortBy === 'newest') queryParams.sort = 'createdAt,desc';

  const { data: productData, isLoading: loading } = useProducts(queryParams);
  const products = productData?.content || [];
  const totalPages = productData?.totalPages || 0;
  const totalElements = productData?.totalElements || 0;

  // Update localSearch if URL changes (ví dụ user search từ Top Header)
  useEffect(() => {
    if (urlSearchQuery) {
      setLocalSearch(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  useEffect(() => {
    if (urlCategoryQuery) {
      setActiveCategory(urlCategoryQuery);
    }
  }, [urlCategoryQuery]);

  const { data: categoryData } = useCategories();
  const categories = [{ id: 'All', name: 'Tất cả' }, ...(categoryData || [])];
  const clearFilters = () => {
    setActiveCategory('All');
    setPriceRange('All');
    setSortBy('newest');
    setLocalSearch('');
  };

  const hasActiveFilters = activeCategory !== 'All' || priceRange !== 'All' || sortBy !== 'newest' || localSearch !== '';

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
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.name === 'Tất cả' ? 'All' : cat.name)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        (activeCategory === cat.name || (activeCategory === 'All' && cat.name === 'Tất cả'))
                          ? 'bg-gray-900 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {(activeCategory === cat.name || (activeCategory === 'All' && cat.name === 'Tất cả')) && <ChevronRight size={14} className="opacity-70" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Mức giá</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { id: 'All', label: 'Tất cả mức giá' },
                    { id: 'under-300', label: 'Dưới 300.000₫' },
                    { id: '300-500', label: '300.000₫ - 500.000₫' },
                    { id: 'over-500', label: 'Trên 500.000₫' },
                  ].map(price => (
                    <label 
                      key={price.id} 
                      onClick={() => setPriceRange(price.id)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        priceRange === price.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }`}>
                        {priceRange === price.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${priceRange === price.id ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {price.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Sắp xếp theo</h3>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
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
