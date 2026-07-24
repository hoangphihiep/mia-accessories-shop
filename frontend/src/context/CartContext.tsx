import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id?: number;
  variantId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  variantName: string;
  image: string;
  stockQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  updateQuantity: (variantId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      // Logic for Server-Side Cart Merging
      const localCart = JSON.parse(localStorage.getItem('mia_cart') || '[]');
      if (localCart.length > 0) {
        const payload = localCart.map((item: CartItem) => ({ variantId: item.variantId, quantity: item.quantity }));
        api.post('/cart/merge', payload)
          .then(res => {
            setCartItems(res.data);
            localStorage.removeItem('mia_cart'); // Clear local after successful merge
          })
          .catch(err => console.error('Failed to merge cart', err));
      } else {
        api.get('/cart')
          .then(res => setCartItems(res.data))
          .catch(err => console.error('Failed to fetch cart', err));
      }
    } else {
      // Load from Local Storage for Guest
      const saved = localStorage.getItem('mia_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    }
  }, [isAuthenticated]);

  // Sync to local storage only if guest
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('mia_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (newItem: CartItem) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/add', { variantId: newItem.variantId, quantity: newItem.quantity });
        setCartItems(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.variantId === newItem.variantId);
        if (existing) {
          const newQuantity = existing.quantity + newItem.quantity;
          const finalQuantity = newQuantity > existing.stockQuantity ? existing.stockQuantity : newQuantity;
          return prev.map(item =>
            item.variantId === newItem.variantId
              ? { ...item, quantity: finalQuantity, stockQuantity: newItem.stockQuantity }
              : item
          );
        }
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = async (variantId: number) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/remove/${variantId}`);
        setCartItems(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.variantId !== variantId));
    }
  };

  const updateQuantity = async (variantId: number, quantity: number) => {
    if (quantity < 1) return;
    
    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/update/${variantId}?quantity=${quantity}`);
        setCartItems(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems(prev =>
        prev.map(item => {
          if (item.variantId === variantId) {
            const finalQuantity = quantity > item.stockQuantity ? item.stockQuantity : quantity;
            return { ...item, quantity: finalQuantity };
          }
          return item;
        })
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart/clear');
        setCartItems([]);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('mia_cart');
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
