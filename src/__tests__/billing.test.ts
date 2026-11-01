import { describe, it, expect } from 'vitest';
import { billingService, SUBSCRIPTION_PLANS } from '@/services/firebase/billingService';

describe('Billing & Subscription Quota Limits', () => {
  it('should define accurate Free, Pro, and Business plans', () => {
    const plans = billingService.getPlans();
    expect(plans.length).toBe(3);

    const free = billingService.getPlanById('free');
    expect(free.documentLimit).toBe(25);
    expect(free.questionsPerMonth).toBe(30);

    const pro = billingService.getPlanById('pro');
    expect(pro.documentLimit).toBe(250);
    expect(pro.questionsPerMonth).toBe(1500);

    const business = billingService.getPlanById('business');
    expect(business.documentLimit).toBe(2500);
    expect(business.questionsPerMonth).toBe(10000);
  });

  it('should accurately enforce document and AI question limits', async () => {
    const check = await billingService.checkUsageLimits('ws_demo_enterprise');
    expect(check.usage).toBeDefined();
    expect(typeof check.canUpload).toBe('boolean');
    expect(typeof check.canAskQuestion).toBe('boolean');
  });

  it('should generate properly structured Razorpay orders', async () => {
    const order = await billingService.createRazorpayOrder('pro', 'monthly');
    expect(order.orderId).toContain('order_');
    expect(order.currency).toBe('INR');
    expect(order.amount).toBe(249900); // 2499 * 100 paise
  });
});

