import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_rankers_live';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rankers_secret_sim_key_2025';

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function createRazorpayOrderReference(amountInRupees: number, receiptId: string) {
  // Generate valid Razorpay compatible Order ID format
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const razorpayOrderId = `order_${receiptId.replace(/[^a-zA-Z0-9]/g, '').slice(-10)}_${randomSuffix}`;

  return {
    id: razorpayOrderId,
    entity: 'order',
    amount: Math.round(amountInRupees * 100), // In Paise
    amount_paid: 0,
    amount_due: Math.round(amountInRupees * 100),
    currency: 'INR',
    receipt: receiptId,
    status: 'created',
    key_id: RAZORPAY_KEY_ID
  };
}

export function generatePaymentSignature(orderId: string, paymentId: string): string {
  return crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): { success: boolean; error?: string } {
  if (!orderId || !paymentId || !signature) {
    return { success: false, error: 'Incomplete payment verification parameters' };
  }

  try {
    const expectedSignature = generatePaymentSignature(orderId, paymentId);
    
    // Constant time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== actualBuffer.length) {
      return { success: false, error: 'Cryptographic signature length mismatch' };
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    if (!isValid) {
      return { success: false, error: 'Invalid payment signature. Verification failed on server.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Signature verification exception: ${err?.message || 'unknown error'}` };
  }
}
