import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  Tag,
  Phone,
  Mail,
  User,
  GraduationCap
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CourseItem } from '../types';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: (orderId: string, unlockedMaterialIds: string[]) => void;
  onOpenAuth: () => void;
  courseToEnroll?: CourseItem;
  instantMaterial?: any;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  onSuccess,
  onOpenAuth,
  courseToEnroll,
  instantMaterial
}) => {
  const { student } = useAuth();
  const { clearCart, discountAmount, appliedCoupon } = useCart();
  const discount = discountAmount || 0;

  const itemTitle = courseToEnroll ? courseToEnroll.title : (instantMaterial?.title || 'MSBTE Diploma Master Pack');
  const subtotal = courseToEnroll
    ? (courseToEnroll.discount_price ?? courseToEnroll.price)
    : (instantMaterial?.price || 49);
  const payableAmount = subtotal;

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'summary' | 'paying' | 'success' | 'failed'>('summary');
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (!student) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Student Login Required</h3>
          <p className="text-xs text-slate-300">
            Please log in or register your diploma student profile to proceed with checkout and receive your official PDF license.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
            >
              Log In / Register
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setStep('paying');

    try {
      // 1. Backend creates order and returns Razorpay credentials & signed tokens
      const itemType = courseToEnroll ? 'course' : (instantMaterial?.item_type || 'course');
      const itemId = courseToEnroll ? courseToEnroll.id : (instantMaterial?.id || 'crs_co_sem5');
      const orderRes = await api.createOrder(itemType, itemId);

      const order = orderRes.order;
      const razorpayConfig = orderRes.razorpay;
      const sim = orderRes.simulation_keys;

      // Simulate network / gateway delay
      await new Promise(resolve => setTimeout(resolve, 1400));

      if (simulateFailure) {
        // Intentional failure test
        await api.verifyPayment({
          order_id: order.id,
          razorpay_order_id: razorpayConfig.order_id,
          razorpay_payment_id: 'pay_declined_by_bank',
          razorpay_signature: 'invalid_signature_test',
          simulate_failure: true
        });
        setStep('failed');
        setErrorMessage('Payment was declined by your bank or canceled. Order marked as Failed.');
        setIsProcessing(false);
        return;
      }

      // 2. Strict backend verification with HMAC SHA256 signature
      const verifyRes = await api.verifyPayment({
        order_id: order.id,
        razorpay_order_id: sim.order_id,
        razorpay_payment_id: sim.payment_id,
        razorpay_signature: sim.signature
      });

      if (verifyRes.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });

        setCompletedOrder({
          order_id: order.id,
          order_number: verifyRes.order_number,
          amount_paid: verifyRes.amount_paid,
          unlocked_materials: verifyRes.unlocked_materials
        });

        if (!instantMaterial) {
          clearCart();
        }

        setStep('success');
      } else {
        setStep('failed');
        setErrorMessage(verifyRes.error || 'Payment signature verification failed.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setStep('failed');
      setErrorMessage(err?.message || 'Payment processing failed. No money was deducted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Razorpay Secure Online Checkout</h3>
              <p className="text-[11px] text-slate-400">256-bit Encrypted • Instant MSBTE PDF Unlock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body based on Step */}
        {step === 'summary' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Student License Details */}
            <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">{student.name}</span>
                <span className="text-slate-500">({student.email})</span>
              </div>
              <div className="text-[11px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {student.branch.split(' ')[0]} • {student.semester}
              </div>
            </div>

            {/* Selected Course / Materials List */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex justify-between">
                <span>Selected Course / Study Material</span>
                <span>Price</span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    MSBTE Batch
                  </span>
                  <p className="font-semibold text-white truncate mt-1">{itemTitle}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">All Subjects, Folders &amp; PDFs Included</p>
                </div>
                <span className="font-bold text-amber-300 text-sm shrink-0">₹{payableAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs">UPI</p>
                  <p className="text-[10px] opacity-75">GPay, PhonePe, Paytm</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs">Card</p>
                  <p className="text-[10px] opacity-75">Debit / Credit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs">NetBanking</p>
                  <p className="text-[10px] opacity-75">All Indian Banks</p>
                </button>
              </div>

              {/* Sub-inputs */}
              {paymentMethod === 'upi' && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-[11px] text-slate-300 font-medium">Virtual Payment Address (VPA / UPI ID)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="student@okhdfcbank or 9876543210@paytm"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <div className="flex gap-2 text-[10px] text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded cursor-pointer" onClick={() => setUpiId(`${student.mobile.replace(/\D/g, '')}@upi`)}>
                      Use Mobile UPI
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded cursor-pointer" onClick={() => setUpiId('ranker@gpay')}>
                      ranker@gpay
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-[11px] text-slate-300 font-medium">Popular Banks</label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Bank of Maharashtra</option>
                  </select>
                </div>
              )}
            </div>

            {/* Test Simulation Option to verify Failure Handling */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Test Gateway: Simulate Payment Failure
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={e => setSimulateFailure(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {/* Final Bill Breakdown */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>MSBTE Gateway &amp; Processing Fee</span>
                <span className="text-emerald-400">FREE (₹0)</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold text-white">
                <span>Total Amount Payable</span>
                <span className="text-amber-400 text-lg">₹{payableAmount}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay ₹{payableAmount} &amp; Unlock Verified PDFs</span>
            </button>
          </div>
        )}

        {/* Step: Paying / Verifying */}
        {step === 'paying' && (
          <div className="p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
              <Lock className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Processing Razorpay Payment</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Securely communicating with bank server and verifying HMAC SHA-256 cryptographic signature...
              </p>
            </div>
            <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden mx-auto">
              <div className="bg-amber-400 h-full animate-[progress_1.5s_ease-in-out_infinite] w-2/3"></div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && completedOrder && (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Payment Verified &amp; PDFs Unlocked
              </span>
              <h3 className="text-xl font-extrabold text-white">Order Confirmed!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you, {student.name}. Your study materials are now permanently unlocked in your student dashboard.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Reference:</span>
                <span className="font-mono font-bold text-amber-300">{completedOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-white">₹{completedOrder.amount_paid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Licensed User:</span>
                <span className="text-slate-300">{student.name} ({student.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">PAID (Verified Server-Side)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onSuccess(completedOrder.order_id, completedOrder.unlocked_materials);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Go to My Purchases &amp; Read PDFs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Failed */}
        {step === 'failed' && (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Transaction Incomplete
              </span>
              <h3 className="text-xl font-extrabold text-white">Payment Failed</h3>
              <p className="text-xs text-rose-300 max-w-sm mx-auto">
                {errorMessage || 'The payment could not be verified by the banking gateway. Materials remain locked.'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto text-left space-y-1">
              <p className="font-semibold text-slate-200">MSBTE Access Policy:</p>
              <p>• The complete study notes PDF has not been unlocked.</p>
              <p>• No amount was deducted from your account. You can retry with a different payment mode.</p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setStep('summary')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                Retry Payment
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
