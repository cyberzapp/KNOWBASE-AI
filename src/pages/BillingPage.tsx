import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  HardDrive, 
  MessageSquare, 
  ExternalLink,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { billingService, SUBSCRIPTION_PLANS } from '@/services/firebase/billingService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatBytes } from '@/utils/formatters';
import { SubscriptionPlanId } from '@/types';

export const BillingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace, usage, fetchUsage } = useWorkspaceStore();
  const toast = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlanId | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const currentPlanId = usage?.plan || 'pro';
  const currentPlan = billingService.getPlanById(currentPlanId);

  // Compute usage percentages
  const docsLimit = usage?.documentsLimit || currentPlan.documentLimit;
  const docsCount = usage?.documentsCount || 0;
  const docsPercent = Math.min(100, Math.round((docsCount / docsLimit) * 100));

  const storageLimit = usage?.storageLimitBytes || (currentPlan.storageLimitMB * 1024 * 1024);
  const storageCount = usage?.storageBytes || 0;
  const storagePercent = Math.min(100, Math.round((storageCount / storageLimit) * 100));

  const questionsLimit = usage?.questionsLimit || currentPlan.questionsPerMonth;
  const questionsCount = usage?.questionsAsked || 0;
  const questionsPercent = Math.min(100, Math.round((questionsCount / questionsLimit) * 100));

  const handleStartUpgrade = (planId: SubscriptionPlanId) => {
    if (planId === currentPlanId) return;
    setSelectedPlanForUpgrade(planId);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlanForUpgrade || !currentWorkspace) return;
    setIsProcessingPayment(true);

    try {
      // Step 1: Create Order
      const order = await billingService.createRazorpayOrder(selectedPlanForUpgrade, billingCycle);

      // Step 2: Simulate Razorpay Checkout or trigger window.Razorpay if script loaded
      await new Promise(r => setTimeout(r, 1200));

      // Step 3: Verify and update subscription
      await billingService.verifyAndApplySubscription(
        currentWorkspace.id,
        selectedPlanForUpgrade,
        {
          razorpayOrderId: order.orderId,
          razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 10),
          isTestSimulated: true,
        }
      );

      await fetchUsage();
      toast.success('Subscription Upgraded!', `Your workspace has been upgraded to ${selectedPlanForUpgrade.toUpperCase()}.`);
      setSelectedPlanForUpgrade(null);
    } catch {
      toast.error('Payment Error', 'Could not complete transaction.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Billing & Resource Limits
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            Manage your subscription plan, vector capacity, and monthly AI query allocation.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center p-1 bg-[#F0F2F7] dark:bg-[#1E2330] rounded-xl border border-[#E2E5EE] dark:border-[#2D3345] self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-[#161A23] text-[#171923] dark:text-white shadow-xs'
                : 'text-[#777D8A]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-[#161A23] text-[#171923] dark:text-white shadow-xs'
                : 'text-[#777D8A]'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] bg-[#ECFDF5] text-[#16A36A] px-1.5 py-0.2 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Documents Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#777D8A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#6857E8]" />
              <span>Documents Capacity</span>
            </span>
            <span className="font-bold text-[#171923] dark:text-white">
              {docsCount} / {docsLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-[#F0F2F7] dark:bg-[#232838] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                docsPercent > 80 ? 'bg-[#E05252]' : 'bg-[#6857E8]'
              }`} 
              style={{ width: `${docsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#777D8A]">
            {docsLimit - docsCount} additional document slots available on {currentPlan.name}.
          </p>
        </div>

        {/* Storage Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#777D8A] flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#E9A23B]" />
              <span>Cloud Storage</span>
            </span>
            <span className="font-bold text-[#171923] dark:text-white">
              {formatBytes(storageCount)} / {formatBytes(storageLimit)}
            </span>
          </div>
          <div className="w-full h-2 bg-[#F0F2F7] dark:bg-[#232838] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#E9A23B] rounded-full transition-all duration-300" 
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#777D8A]">
            Encrypted storage bucket in Firebase Cloud Storage.
          </p>
        </div>

        {/* AI Queries Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#777D8A] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#16A36A]" />
              <span>AI Queries This Month</span>
            </span>
            <span className="font-bold text-[#171923] dark:text-white">
              {questionsCount} / {questionsLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-[#F0F2F7] dark:bg-[#232838] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#16A36A] rounded-full transition-all duration-300" 
              style={{ width: `${questionsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#777D8A]">
            Resets automatically on the 1st of next month.
          </p>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#171923] dark:text-white mb-4">
          Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const price = billingCycle === 'annual' ? plan.priceAnnualINR : plan.priceMonthlyINR;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl bg-white dark:bg-[#161A23] border transition-all flex flex-col justify-between relative ${
                  isCurrent
                    ? 'border-[#6857E8] ring-2 ring-[#6857E8]/20 shadow-md'
                    : 'border-[#E9EAF0] dark:border-[#232838] shadow-xs hover:border-[#6857E8]/50'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#6857E8] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-[#171923] dark:text-white">
                      {plan.name}
                    </h3>
                    {isCurrent && <Badge variant="purple" size="sm">Active Plan</Badge>}
                  </div>

                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl font-extrabold text-[#171923] dark:text-white tracking-tight">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#777D8A]">
                      {billingCycle === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>

                  <ul className="space-y-2.5 my-6 text-xs text-[#171923] dark:text-[#E2E8F0]">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isCurrent ? 'outline' : 'primary'}
                  disabled={isCurrent}
                  className="w-full mt-4"
                  onClick={() => handleStartUpgrade(plan.id)}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Razorpay Test Modal */}
      <Modal
        isOpen={Boolean(selectedPlanForUpgrade)}
        onClose={() => setSelectedPlanForUpgrade(null)}
        title="Complete Plan Upgrade"
        description="Secure checkout powered by Razorpay payment gateway."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E] space-y-1">
            <p className="font-bold text-sm">Selected Plan: {selectedPlanForUpgrade?.toUpperCase()}</p>
            <p>Billing Cycle: {billingCycle === 'annual' ? 'Annual (Billed Yearly)' : 'Monthly'}</p>
            <p className="font-bold text-base text-[#171923] dark:text-white pt-2">
              Amount to Pay: ₹{(billingCycle === 'annual' ? billingService.getPlanById(selectedPlanForUpgrade || 'pro').priceAnnualINR : billingService.getPlanById(selectedPlanForUpgrade || 'pro').priceMonthlyINR).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FC] dark:bg-[#161A23] rounded-xl border border-[#E9EAF0] dark:border-[#232838] space-y-1 text-[#777D8A]">
            <p className="font-semibold text-[#171923] dark:text-white">Razorpay Payment Integration</p>
            <p>
              This order will be created via Cloud Functions and verified through server-side HMAC-SHA256 signature verification before activating subscription quotas.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedPlanForUpgrade(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} isLoading={isProcessingPayment}>
              Authorize & Activate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

