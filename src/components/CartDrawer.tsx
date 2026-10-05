import React, { useState } from 'react';
import {
  X,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingCart,
  Sparkles,
  BookOpen,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CartDrawerProps {
  onCheckout: () => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onOpenAuth }) => {
  const {
    items,
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
  } = useCart();
  const { student } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMsg(null);
    const result = await applyCoupon(couponInput.trim());
    setCouponLoading(false);

    if (result.success) {
      setCouponMsg({ text: result.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMsg({ text: result.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-white">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Study Cart</h3>
              <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Your study cart is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Browse verified MSBTE subject notes, previous year question papers and model answers to add.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                >
                  Browse Study Material
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>Materials in cart:</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-400 hover:underline flex items-center gap-1"
                  >
                    Clear all
                  </button>
                </div>

                {items.map(item => (
                  <div
                    key={item.material_id}
                    className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                          {item.subject_code}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {item.total_pages} Pages PDF
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-white leading-snug truncate">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-amber-300">₹{item.price}</span>
                        {item.original_price > item.price && (
                          <span className="text-xs text-slate-500 line-through">
                            ₹{item.original_price}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.material_id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Available Coupon Codes Prompt */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Active Student Discount Codes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => applyCoupon('RANKER20')}
                      className="text-[11px] font-mono font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded"
                    >
                      RANKER20 (20% OFF)
                    </button>
                    <button
                      onClick={() => applyCoupon('FIRST50')}
                      className="text-[11px] font-mono font-bold bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded"
                    >
                      FIRST50 (50% OFF)
                    </button>
                    <button
                      onClick={() => applyCoupon('EXAM10')}
                      className="text-[11px] font-mono font-bold bg-blue-400/10 hover:bg-blue-400/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded"
                    >
                      EXAM10 (₹10 OFF)
                    </button>
                  </div>
                </div>

                {/* Coupon Input Form */}
                <form onSubmit={handleApplyCoupon} className="pt-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {couponMsg && (
                    <p
                      className={`text-[11px] mt-1.5 ${
                        couponMsg.isError ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount_amount})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-slate-400 hover:text-rose-300 text-[11px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>PDF License &amp; Watermarking</span>
                  <span className="text-emerald-400">Included</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-extrabold text-white">
                  <span>Total Payable:</span>
                  <span className="text-amber-400 text-lg">₹{totalAmount}</span>
                </div>
              </div>

              {student ? (
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Log In to Complete Purchase</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
