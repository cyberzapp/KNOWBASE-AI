import * as crypto from 'crypto';
import { db, razorpay } from '../config';

export async function createRazorpayOrder(params: {
  workspaceId: string;
  planId: string;
  billingCycle: 'monthly' | 'annual';
  amountINR: number;
}) {
  const { workspaceId, planId, billingCycle, amountINR } = params;

  const options = {
    amount: amountINR * 100, // in paise
    currency: 'INR',
    receipt: `rcpt_${workspaceId}_${Date.now()}`,
    notes: {
      workspaceId,
      planId,
      billingCycle,
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    throw new Error(err.message || 'Failed to create Razorpay order');
  }
}

export async function verifyRazorpayPayment(params: {
  workspaceId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  planId: string;
}) {
  const { workspaceId, orderId, paymentId, signature, planId } = params;
  const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

  // Compute expected HMAC SHA256 signature
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  const isValid = expectedSignature === signature;

  if (!isValid && process.env.NODE_ENV === 'production') {
    throw new Error('Invalid Razorpay signature verification.');
  }

  // Update subscription in Firestore
  const periodId = new Date().toISOString().substring(0, 7);
  const planLimits: Record<string, { docs: number; storageMB: number; queries: number }> = {
    free: { docs: 25, storageMB: 100, queries: 30 },
    pro: { docs: 250, storageMB: 10240, queries: 1500 },
    business: { docs: 2500, storageMB: 102400, queries: 10000 },
  };

  const selected = planLimits[planId] || planLimits.pro;

  await db.doc(`workspaces/${workspaceId}/usage/${periodId}`).set({
    plan: planId,
    documentsLimit: selected.docs,
    storageLimitBytes: selected.storageMB * 1024 * 1024,
    questionsLimit: selected.queries,
    subscriptionStatus: 'active',
    razorpaySubscriptionId: paymentId,
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return { verified: true, planId };
}

