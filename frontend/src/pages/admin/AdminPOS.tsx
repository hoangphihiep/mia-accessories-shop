import { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, CreditCard, Banknote, User, Phone, PackageOpen, Printer, X, Bookmark, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminPOS() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountGiven, setAmountGiven] = useState<string>('');

  // CRM State
  const [customerTier, setCustomerTier] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipSearchRef = useRef(false);

  // Hold Order State
  const [heldOrders, setHeldOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('pos_held_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHeldOrders, setShowHeldOrders] = useState(false);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?size=100'), 
          api.get('/categories')
        ]);
        setProducts(prodRes.data.content || prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (customerName.trim().length === 0 && customerPhone.trim().length === 0) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      setCustomerTier('');
      return;
    }

    const keyword = customerPhone.trim() || customerName.trim();
    
    if (keyword.length >= 2) {
      const delay = setTimeout(async () => {
        setIsSearchingCustomer(true);
        try {
          const res = await api.get(`/admin/customers?keyword=${keyword}`);
          const results = res.data.content || res.data;
          
          if (results && results.length > 0) {
            setCustomerSuggestions(results);
            setShowSuggestions(true);
            
            const exactMatch = results.find((c: any) => c.phone === customerPhone.trim());
            if (exactMatch && exactMatch.customerTier) {
              setCustomerTier(exactMatch.customerTier);
            } else {
              setCustomerTier('');
            }
          } else {
            setCustomerSuggestions([]);
            setShowSuggestions(false);
            setCustomerTier('');
          }
        } catch (e) {
          setCustomerSuggestions([]);
          setShowSuggestions(false);
          setCustomerTier('');
        } finally {
          setIsSearchingCustomer(false);
        }
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      setCustomerTier('');
    }
  }, [customerName, customerPhone]);

  const handleSelectCustomer = (customer: any) => {
    skipSearchRef.current = true;
    setCustomerName(customer.fullName || '');
    setCustomerPhone(customer.phone || '');
    setCustomerTier(customer.customerTier || 'MEMBER');
    setShowSuggestions(false);
  };

  const variants = useMemo(() => {
    return products
      .filter(p => selectedCategory === 'all' || p.category.id.toString() === selectedCategory)
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      .flatMap(p => p.variants.map((v: any) => ({ ...v, productName: p.name, productImage: p.images?.[0]?.imageUrl })));
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (variant: any) => {
    if (variant.stockQuantity <= 0) return alert('Sản phẩm đã hết hàng!');
    
    setCart(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stockQuantity) {
          alert('Không đủ tồn kho!');
          return prev;
        }
        return prev.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        variantId: variant.id, 
        name: variant.name && variant.name.toLowerCase() !== 'default' && variant.name !== variant.productName ? `${variant.productName} - ${variant.name}` : variant.productName,
        price: variant.price, 
        quantity: 1,
        stock: variant.stockQuantity,
        image: variant.productImage
      }];
    });
  };

  const updateQuantity = (variantId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
          alert('Không đủ tồn kho!');
          return item;
        }
        if (newQ < 1) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (variantId: number) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto-calculate change
  const numericAmountGiven = parseInt(amountGiven.replace(/[^0-9]/g, '')) || 0;
  const change = paymentMethod === 'CASH' ? Math.max(0, numericAmountGiven - totalAmount) : 0;

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      customerName,
      customerPhone
    };
    const updated = [newHold, ...heldOrders];
    setHeldOrders(updated);
    localStorage.setItem('pos_held_orders', JSON.stringify(updated));
    
    // Reset form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setAmountGiven('');
    setCustomerTier('');
  };

  const handleRestoreOrder = (orderId: string) => {
    const held = heldOrders.find(o => o.id === orderId);
    if (!held) return;
    
    if (cart.length > 0) {
      if (!window.confirm('Giỏ hàng hiện tại đang có sản phẩm. Bạn có muốn ghi đè không?')) return;
    }
    
    setCart(held.cart);
    setCustomerName(held.customerName || '');
    setCustomerPhone(held.customerPhone || '');
    setAmountGiven('');
    setCustomerTier('');
    
    const updated = heldOrders.filter(o => o.id !== orderId);
    setHeldOrders(updated);
    localStorage.setItem('pos_held_orders', JSON.stringify(updated));
    setShowHeldOrders(false);
  };
  
  const handleRemoveHeldOrder = (orderId: string) => {
    const updated = heldOrders.filter(o => o.id !== orderId);
    setHeldOrders(updated);
    localStorage.setItem('pos_held_orders', JSON.stringify(updated));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Giỏ hàng trống!');
    if (paymentMethod === 'CASH' && numericAmountGiven > 0 && numericAmountGiven < totalAmount) {
      return alert('Tiền khách đưa không đủ!');
    }

    try {
      const payload = {
        customerName: customerName.trim() || 'Khách vãng lai',
        customerPhone: customerPhone.trim(),
        paymentMethod: paymentMethod,
        items: cart.map(item => ({ variantId: item.variantId, quantity: item.quantity }))
      };
      await api.post('/admin/orders/pos', payload);
      
      // Save order for receipt
      setLastOrder({
        cart: [...cart],
        customerName: customerName.trim() || 'Khách vãng lai',
        customerPhone: customerPhone.trim(),
        paymentMethod,
        totalAmount,
        amountGiven: paymentMethod === 'CASH' ? (numericAmountGiven || totalAmount) : totalAmount,
        change,
        date: new Date().toLocaleString('vi-VN')
      });
      setShowReceipt(true);
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setAmountGiven('');
      setCustomerTier('');
      
      const prodRes = await api.get('/products?size=100');
      setProducts(prodRes.data.content || prodRes.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-6 font-sans print:hidden">
        {/* Left Pane - Products */}
        <div className="flex-1">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full md:w-56 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-sm font-medium"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
            {variants.map(variant => (
              <div 
                key={variant.id} 
                onClick={() => addToCart(variant)}
                className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col ${variant.stockQuantity > 0 ? '' : 'opacity-50 grayscale'}`}
              >
                <div className="h-48 relative bg-gray-100">
                  <img src={variant.productImage || 'https://via.placeholder.com/150'} alt={variant.productName} className="w-full h-full object-cover" />
                  {variant.stockQuantity <= 0 ? (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-bold text-red-600 text-sm uppercase tracking-wide">
                      Hết hàng
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-white/95 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                      Kho: {variant.stockQuantity}
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight mb-1">{variant.productName}</h3>
                  {variant.name && variant.name.toLowerCase() !== 'default' && variant.name !== variant.productName && (
                    <p className="text-xs text-gray-500 mb-2 bg-gray-100 self-start px-2 py-0.5 rounded font-medium">{variant.name}</p>
                  )}
                  <div className="mt-auto font-bold text-lg text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                  </div>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400">
                <PackageOpen size={48} className="mb-3 opacity-50 text-gray-300" />
                <p className="font-medium text-gray-500">Không tìm thấy sản phẩm</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Cart (Sticky) */}
        <div className="w-full xl:w-[420px] shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl shrink-0">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" /> Giỏ hàng
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowHeldOrders(true)} className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-xs font-bold shadow-sm">
                  <Bookmark size={14} /> Treo ({heldOrders.length})
                </button>
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/20">
                  {cart.reduce((a, b) => a + b.quantity, 0)} món
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-8">
                  <ShoppingCart size={56} className="opacity-10 text-gray-300" />
                  <p className="font-medium text-sm text-gray-500">Chưa có sản phẩm nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.variantId} className="flex gap-3 pb-4 border-b border-dashed border-gray-200 last:border-0 last:pb-0">
                      <img src={item.image || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 object-cover rounded-md border border-gray-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.variantId)} className="text-gray-400 hover:text-red-500 shrink-0">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-end justify-between mt-2">
                          <div className="font-bold text-primary text-sm">
                            {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                          </div>
                          <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1 border border-gray-200">
                            <button onClick={() => updateQuantity(item.variantId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary border border-gray-100"><Minus size={14} /></button>
                            <span className="text-sm font-semibold w-6 text-center text-gray-800">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variantId, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary border border-gray-100"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-200 rounded-b-xl shrink-0">
              <div className="space-y-3 mb-4">
                <div className="flex gap-3 relative">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Tên khách" value={customerName} onChange={e => { setCustomerName(e.target.value); setShowSuggestions(true); }} onFocus={() => customerSuggestions.length > 0 && setShowSuggestions(true)} className={`w-full pl-9 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${customerTier && customerTier !== 'MEMBER' ? 'pr-16' : 'pr-3'}`} />
                    {customerTier && customerTier !== 'MEMBER' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm">{customerTier}</span>}
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Số điện thoại" value={customerPhone} onChange={e => { setCustomerPhone(e.target.value); setShowSuggestions(true); }} onFocus={() => customerSuggestions.length > 0 && setShowSuggestions(true)} className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                    {isSearchingCustomer && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-primary" size={14} />}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && customerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                      {customerSuggestions.map((cust: any) => (
                        <div key={cust.id} onMouseDown={() => handleSelectCustomer(cust)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors">
                          <div>
                            <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                              {cust.fullName}
                              {cust.customerTier && cust.customerTier !== 'MEMBER' && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1 py-0.5 rounded-sm">{cust.customerTier}</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Phone size={10}/> {cust.phone}</div>
                          </div>
                          <div className="text-xs text-gray-400">Chọn ↵</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => setPaymentMethod('CASH')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all border-2 ${paymentMethod === 'CASH' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <Banknote size={18} /> Tiền mặt
                  </button>
                  <button onClick={() => setPaymentMethod('TRANSFER')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all border-2 ${paymentMethod === 'TRANSFER' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <CreditCard size={18} /> Chuyển khoản
                  </button>
                </div>

                {paymentMethod === 'CASH' && (
                  <div className="relative bg-white border border-gray-300 rounded-lg p-2.5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Tiền khách đưa:</span>
                      <input 
                        type="text" 
                        placeholder="0" 
                        value={amountGiven}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setAmountGiven(val ? new Intl.NumberFormat('vi-VN').format(parseInt(val)) : '');
                        }}
                        className="w-32 text-right font-bold text-primary focus:outline-none text-base bg-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[100000, 200000, 500000].map(amt => (
                        <button key={amt} onClick={() => setAmountGiven(new Intl.NumberFormat('vi-VN').format(amt))} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700 transition-colors">
                          {amt / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 pt-4 pb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-sm uppercase">Tổng cộng</span>
                  <span className="text-2xl font-black text-gray-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                  </span>
                </div>
                {paymentMethod === 'CASH' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm">Tiền thối</span>
                    <span className={`text-lg font-bold ${change > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(change)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleHoldOrder}
                  disabled={cart.length === 0}
                  className="w-1/3 py-3.5 rounded-lg bg-amber-500 text-white font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-amber-600 shadow-md shadow-amber-500/20"
                >
                  <Bookmark size={18} />
                  Treo
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-2/3 py-3.5 rounded-lg bg-primary text-white font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  <CheckCircle size={20} />
                  Thanh Toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Receipt Modal - Kept unchanged for functionality */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center print:static print:block print:bg-white bg-black/60 backdrop-blur-sm print:backdrop-blur-none transition-all">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md print:w-full print:max-w-none print:shadow-none print:rounded-none print:p-0 relative animate-in zoom-in-95 duration-300 print:animate-none">
            <button onClick={() => setShowReceipt(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 print:hidden text-gray-500 transition-colors">
              <X size={20} />
            </button>

            {/* Receipt Content */}
            <div className="text-center font-mono">
              <h2 className="text-2xl font-black mb-1">MIA ACCESSORIES</h2>
              <p className="text-sm text-gray-500 mb-4">123 Đường Fashion, Quận 1, TP.HCM</p>
              <div className="border-t border-dashed border-gray-400 my-4"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest my-2">Hóa Đơn Bán Hàng</h3>
              <p className="text-xs text-gray-500 mb-4">Ngày: {lastOrder.date}</p>
              
              <div className="text-left text-sm mb-4 space-y-1">
                <p><span className="font-bold">Khách hàng:</span> {lastOrder.customerName}</p>
                {lastOrder.customerPhone && <p><span className="font-bold">SĐT:</span> {lastOrder.customerPhone}</p>}
                <p><span className="font-bold">Thanh toán:</span> {lastOrder.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
              </div>

              <div className="border-t border-dashed border-gray-400 my-4"></div>
              
              {/* Items */}
              <div className="text-left text-sm space-y-3">
                {lastOrder.cart.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <div className="pr-4">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-gray-500">{item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)}</p>
                    </div>
                    <div className="font-bold text-right whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 my-4"></div>

              {/* Totals */}
              <div className="text-right space-y-2 text-sm">
                <div className="flex justify-between text-lg font-black">
                  <span>TỔNG TIỀN:</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lastOrder.totalAmount)}</span>
                </div>
                {lastOrder.paymentMethod === 'CASH' && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Khách đưa:</span>
                      <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lastOrder.amountGiven)}</span>
                    </div>
                    <div className="flex justify-between text-gray-800 font-bold">
                      <span>Tiền thối:</span>
                      <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lastOrder.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-gray-400 my-4"></div>
              <p className="text-sm font-bold mt-4">Cảm ơn quý khách và hẹn gặp lại!</p>
              <p className="text-xs text-gray-400 mt-1">Xin quý khách giữ hóa đơn để đổi trả trong 7 ngày</p>
            </div>

            <div className="mt-8 flex gap-4 print:hidden">
              <button 
                onClick={handlePrint}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-xl shadow-gray-900/20"
              >
                <Printer size={20} />
                In Hóa Đơn
              </button>
              <button 
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Orders Modal */}
      {showHeldOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4">
          <div className="bg-white p-0 rounded-2xl shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Bookmark size={20} className="text-amber-500" /> Danh sách đơn treo
              </h2>
              <button onClick={() => setShowHeldOrders(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {heldOrders.length === 0 ? (
                <div className="py-10 text-center text-gray-400 font-medium">Không có đơn hàng nào đang treo</div>
              ) : (
                heldOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-3 flex justify-between items-center bg-white hover:border-amber-300 transition-colors shadow-sm group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{order.customerName || 'Khách vãng lai'}</span>
                        {order.customerPhone && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{order.customerPhone}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> {order.time}</span>
                        <span>• {order.cart.reduce((a: any, b: any) => a + b.quantity, 0)} sản phẩm</span>
                        <span className="font-bold text-primary">• {new Intl.NumberFormat('vi-VN').format(order.cart.reduce((a: any, b: any) => a + b.price * b.quantity, 0))}đ</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleRestoreOrder(order.id)} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-200">
                        Phục hồi
                      </button>
                      <button onClick={() => handleRemoveHeldOrder(order.id)} className="bg-red-50 text-red-500 p-1.5 rounded-lg hover:bg-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
