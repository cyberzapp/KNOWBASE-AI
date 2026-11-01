import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0E1117] text-[#171923] dark:text-[#F0F2F5] text-left p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#777D8A] hover:text-[#6857E8]">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-[#777D8A]">Last Updated: November 2026</p>

        <div className="space-y-4 text-xs leading-relaxed text-[#777D8A] dark:text-[#9BA1B0] bg-white dark:bg-[#161A23] p-8 rounded-3xl border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <h2 className="text-sm font-bold text-[#171923] dark:text-white">1. Information We Collect</h2>
          <p>
            Knowbase AI collects information you provide directly to us when creating a workspace, registering an account, or uploading documents. This includes your name, work email address, company profile, and document files (PDFs, DOCX, TXT, Markdown, CSV).
          </p>

          <h2 className="text-sm font-bold text-[#171923] dark:text-white">2. AI Model Data Isolation</h2>
          <p>
            Your uploaded files, vector chunks, and search queries are stored exclusively in isolated Cloud Firestore and Cloud Storage partitions. We strictly prohibit the use of customer data for training public Large Language Models.
          </p>

          <h2 className="text-sm font-bold text-[#171923] dark:text-white">3. Data Retention & Deletion</h2>
          <p>
            When you delete a document or delete your workspace, all corresponding files, vector chunks, embeddings, and chat transcripts are permanently erased from Firestore and Firebase Cloud Storage.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0E1117] text-[#171923] dark:text-[#F0F2F5] text-left p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#777D8A] hover:text-[#6857E8]">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-[#777D8A]">Last Updated: November 2026</p>

        <div className="space-y-4 text-xs leading-relaxed text-[#777D8A] dark:text-[#9BA1B0] bg-white dark:bg-[#161A23] p-8 rounded-3xl border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <h2 className="text-sm font-bold text-[#171923] dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Knowbase AI, you agree to be bound by these Terms. If you are entering into these Terms on behalf of an entity, you represent that you have authority to bind such entity.
          </p>

          <h2 className="text-sm font-bold text-[#171923] dark:text-white">2. Subscriptions and Payments</h2>
          <p>
            Paid plans (Pro and Business) are billed in advance on a recurring monthly or annual basis via Razorpay. Subscriptions can be canceled at any time from your Billing settings.
          </p>

          <h2 className="text-sm font-bold text-[#171923] dark:text-white">3. Acceptable Use</h2>
          <p>
            You agree not to upload copyrighted content without authorization, malicious software, or documents violating applicable privacy laws.
          </p>
        </div>
      </div>
    </div>
  );
};

