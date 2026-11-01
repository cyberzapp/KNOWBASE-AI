import { SubscriptionPlan, SubscriptionPlanId, WorkspaceUsage } from '@/types';
import { workspaceService } from './workspaceService';
import { safeStorage } from '@/utils/safeStorage';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    priceMonthlyINR: 0,
    priceAnnualINR: 0,
    documentLimit: 25,
    storageLimitMB: 100,
    questionsPerMonth: 30,
    teamMembersLimit: 2,
    features: [
      'Up to 25 indexed documents',
      '100 MB Cloud Storage',
      '30 AI questions / month',
      'Basic source citations',
      '1 workspace member',
      'Standard community support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    badge: 'Most Popular',
    priceMonthlyINR: 2499,
    priceAnnualINR: 23990,
    documentLimit: 250,
    storageLimitMB: 10240, // 10 GB
    questionsPerMonth: 1500,
    teamMembersLimit: 10,
    features: [
      'Up to 250 indexed documents',
      '10 GB encrypted Cloud Storage',
      '1,500 AI questions / month',
      'Advanced multi-document RAG',
      'Unlimited knowledge collections',
      'Up to 10 team members with RBAC',
      'Export chat transcripts & summaries',
      'Priority document processing queue',
      'Email support (24hr SLA)'
    ]
  },
  {
    id: 'business',
    name: 'Enterprise / Scale',
    priceMonthlyINR: 7999,
    priceAnnualINR: 76790,
    documentLimit: 2500,
    storageLimitMB: 102400, // 100 GB
    questionsPerMonth: 10000,
    teamMembersLimit: 50,
    features: [
      'Up to 2,500 indexed documents',
      '100 GB enterprise storage',
      '10,000 AI questions / month',
      'Custom LLM models (Gemini 3.8 Flash & Argon)',
      'Up to 50 team members',
      'Complete audit log & compliance trails',
      'Dedicated Customer Success Manager',
      'Enterprise SLA (15 min response time)',
      'Custom Razorpay invoices & GST support'
    ]
  }
];

export const billingService = {
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  },

  getPlanById(planId: SubscriptionPlanId): SubscriptionPlan {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
  },

  async checkUsageLimits(workspaceId: string): Promise<{
    canUpload: boolean;
    canAskQuestion: boolean;
    usage: WorkspaceUsage;
    docLimitReached: boolean;
    storageLimitReached: boolean;
    questionLimitReached: boolean;
  }> {
    const usage = await workspaceService.getUsage(workspaceId);
    const plan = this.getPlanById(usage.plan);

    const docLimitReached = usage.documentsCount >= plan.documentLimit;
    const storageLimitReached = (usage.storageBytes / (1024 * 1024)) >= plan.storageLimitMB;
    const questionLimitReached = usage.questionsAsked >= plan.questionsPerMonth;

    return {
      canUpload: !docLimitReached && !storageLimitReached,
      canAskQuestion: !questionLimitReached,
      usage,
      docLimitReached,
      storageLimitReached,
      questionLimitReached,
    };
  },

  // Razorpay order creation helper
  async createRazorpayOrder(planId: SubscriptionPlanId, billingCycle: 'monthly' | 'annual'): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    isTestMode: boolean;
  }> {
    const plan = this.getPlanById(planId);
    const amount = billingCycle === 'annual' ? plan.priceAnnualINR : plan.priceMonthlyINR;

    // Check if live Razorpay key is present in environment
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const isTestMode = !keyId || keyId.startsWith('rzp_test');

    return {
      orderId: 'order_' + Math.random().toString(36).substring(2, 12),
      amount: amount * 100, // paise
      currency: 'INR',
      keyId: keyId || 'rzp_test_knowbase_dev',
      isTestMode: true,
    };
  },

  async verifyAndApplySubscription(
    workspaceId: string,
    planId: SubscriptionPlanId,
    paymentDetails: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      isTestSimulated?: boolean;
    }
  ): Promise<WorkspaceUsage> {
    const plan = this.getPlanById(planId);
    const currentUsage = await workspaceService.getUsage(workspaceId);

    const updatedUsage: WorkspaceUsage = {
      ...currentUsage,
      plan: planId,
      documentsLimit: plan.documentLimit,
      storageLimitBytes: plan.storageLimitMB * 1024 * 1024,
      questionsLimit: plan.questionsPerMonth,
      subscriptionStatus: 'active',
      razorpaySubscriptionId: paymentDetails.razorpayPaymentId || 'sub_simulated_' + Date.now(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storedUsage = safeStorage.getItem('knowbase_usage');
    const usageMap = storedUsage ? JSON.parse(storedUsage) : {};
    usageMap[workspaceId] = updatedUsage;
    safeStorage.setItem('knowbase_usage', JSON.stringify(usageMap));

    return updatedUsage;
  }
};
