import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/services/firebase/billingService';
import { Button } from '@/components/ui/Button';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const faqs = [
    {
      q: 'How does vector chunking and semantic search work?',
      a: 'When you upload documents, our Firebase pipeline extracts text, splits it into overlapping semantic chunks preserving page numbers and section headers, generates dense embeddings with Google Gemini, and indexes them in Cloud Firestore for millisecond retrieval.'
    },
    {
      q: 'Are our confidential documents used to train AI models?',
      a: 'Never. All uploaded documents, embeddings, and chat transcripts are strictly isolated to your workspace and encrypted at rest with AES-256. Google Gemini models are accessed via enterprise API endpoints that guarantee zero data retention for training.'
    },
    {
      q: 'What payment methods do you support for Indian teams?',
      a: 'We support all major Indian credit cards, debit cards, UPI (Google Pay, PhonePe, Paytm), and Net Banking through our secure Razorpay integration with GST compliant invoicing.'
    },
    {
      q: 'Can I invite my team with different access roles?',
      a: 'Yes. Knowbase AI includes 4 role tiers: Owner, Admin, Editor, and Viewer. You can control exactly who has permission to upload documents or change workspace settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0E1117] text-[#171923] dark:text-[#F0F2F5] text-left selection:bg-[#6857E8]/20 selection:text-[#6857E8]">
      {/* Header */}
      <header className="border-b border-[#E9EAF0] dark:border-[#232838] glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6857E8] text-white flex items-center justify-center font-extrabold text-base">
              K
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#171923] dark:text-white">
              Knowbase AI
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E] text-xs font-semibold border border-[#DDD6FE] dark:border-[#383163]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing for Startups and Growing Teams</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171923] dark:text-white">
          Predictable plans for every stage
        </h1>
        <p className="text-base text-[#777D8A] dark:text-[#9BA1B0] max-w-xl mx-auto leading-relaxed">
          Start for free with 25 documents. Upgrade seamlessly as your company documentation grows.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-[#171923] dark:text-white' : 'text-[#777D8A]'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 rounded-full bg-[#E9EAF0] dark:bg-[#232838] p-1 flex items-center transition-colors"
          >
            <div className={`w-4 h-4 rounded-full bg-[#6857E8] transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-[#171923] dark:text-white' : 'text-[#777D8A]'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] bg-[#ECFDF5] text-[#16A36A] px-2 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnualINR : plan.priceMonthlyINR;
            const isPopular = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`p-8 rounded-3xl bg-white dark:bg-[#161A23] border transition-all flex flex-col justify-between relative ${
                  isPopular
                    ? 'border-[#6857E8] ring-2 ring-[#6857E8]/20 shadow-xl'
                    : 'border-[#E9EAF0] dark:border-[#232838] shadow-xs'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-[#6857E8] text-white text-[11px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-[#171923] dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-5">
                    <span className="text-4xl font-extrabold text-[#171923] dark:text-white">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#777D8A]">
                      {billingCycle === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>

                  <ul className="space-y-3 my-6 text-xs text-[#171923] dark:text-[#E2E8F0]">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/signup" className="mt-6">
                  <Button
                    variant={isPopular ? 'primary' : 'outline'}
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started with {plan.name}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-[#E9EAF0] dark:border-[#232838] bg-white dark:bg-[#13161F] px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#777D8A]">Everything you need to know about subscriptions, security, and RAG.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#F8F9FC] dark:bg-[#1A1F2C] border border-[#E9EAF0] dark:border-[#232838] space-y-2">
                <h3 className="text-sm font-bold text-[#171923] dark:text-white">{f.q}</h3>
                <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

