import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MaterialItem } from '../types';
import { api } from '../services/api';

interface AppliedCoupon {
  code: string;
  discount_amount: number;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (material: MaterialItem) => boolean;
  removeFromCart: (materialId: string) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dr_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('dr_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dr_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('dr_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('dr_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (material: MaterialItem): boolean => {
    // Check if already in cart
    if (items.some(it => it.material_id === material.id)) {
      setIsCartOpen(true);
      return false;
    }

    const price = material.discount_price !== undefined ? material.discount_price : material.price;
    const newItem: CartItem = {
      material_id: material.id,
      title: material.title,
      subject_code: material.subject_code,
      price,
      original_price: material.price,
      category_id: material.category_id,
      total_pages: material.total_pages
    };

    setItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (materialId: string) => {
    setItems(prev => prev.filter(it => it.material_id !== materialId));
    // If cart becomes empty, remove coupon
    if (items.length <= 1) {
      setAppliedCoupon(null);
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((sum, it) => sum + it.price, 0);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) return { success: false, message: 'Please enter a coupon code' };
    if (items.length === 0) return { success: false, message: 'Your cart is empty' };

    try {
      const res = await api.validateCoupon(code.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discount_amount: res.discount_amount,
          message: res.message
        });
        return { success: true, message: res.message };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon ? Math.min(appliedCoupon.discount_amount, subtotal) : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        totalAmount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
