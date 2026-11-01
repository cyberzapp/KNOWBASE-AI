import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  FolderTree, 
  FileText, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Users, 
  Lock, 
  Layers, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0E1117] text-[#171923] dark:text-[#F0F2F5] text-left selection:bg-[#6857E8]/20 selection:text-[#6857E8]">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-[#E9EAF0] dark:border-[#232838]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6857E8] text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-[#6857E8]/30">
              K
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#171923] dark:text-white">
              Knowbase AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#777D8A] dark:text-[#9BA1B0]">
            <a href="#features" className="hover:text-[#171923] dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#171923] dark:hover:text-white transition-colors">How It Works</a>
            <Link to="/pricing" className="hover:text-[#171923] dark:hover:text-white transition-colors">Pricing</Link>
            <a href="#security" className="hover:text-[#171923] dark:hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-[#171923] dark:hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E] text-xs font-semibold border border-[#DDD6FE] dark:border-[#383163] shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation AI Knowledge Workspace &bull; Powered by Firebase & Gemini</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#171923] dark:text-white leading-[1.12]">
          Your entire knowledge base. <br />
          <span className="bg-gradient-to-r from-[#6857E8] to-[#9F7AEA] bg-clip-text text-transparent">
            One intelligent AI.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#777D8A] dark:text-[#9BA1B0] max-w-2xl mx-auto leading-relaxed">
          Bring your documents, company policies, and scattered documentation into one unified intelligent workspace. Ask questions in natural language and receive grounded answers with exact source citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link to="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start for free &bull; Instant Access
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="outline" size="lg">
              Explore Demo Workspace
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-[#777D8A] dark:text-[#8E95A5] pt-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A]" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A]" /> Grounded RAG citations
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A]" /> End-to-end encrypted
          </span>
        </div>

        {/* Live Interactive Product UI Mockup */}
        <div className="mt-12 rounded-2xl border border-[#E9EAF0] dark:border-[#232838] bg-white dark:bg-[#13161F] shadow-2xl p-4 sm:p-6 text-left space-y-4">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between border-b border-[#E9EAF0] dark:border-[#232838] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E05252]" />
              <span className="w-3 h-3 rounded-full bg-[#E9A23B]" />
              <span className="w-3 h-3 rounded-full bg-[#16A36A]" />
              <span className="text-xs text-[#777D8A] font-mono ml-2">app.knowbase.ai/workspaces/acme-tech/chat</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#6857E8] bg-[#F0EDFF] dark:bg-[#201C3E] px-2 py-0.5 rounded-md">
              Live Verified AI Research
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Mock left docs */}
            <div className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1F2C] border border-[#E9EAF0] dark:border-[#232838] space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#777D8A]">Indexed Sources (4)</p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-[#13161F] border border-[#E9EAF0] dark:border-[#2D3345] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#6857E8]" />
                  <span className="font-semibold text-xs truncate">Acme Employee Handbook 2026.pdf</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#13161F] border border-[#E9EAF0] dark:border-[#2D3345] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span className="font-semibold text-xs truncate">SOC2 & Data Encryption Architecture.md</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#13161F] border border-[#E9EAF0] dark:border-[#2D3345] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#E9A23B]" />
                  <span className="font-semibold text-xs truncate">Customer Support Runbook & SLA Matrix.txt</span>
                </div>
              </div>
            </div>

            {/* Mock center chat query */}
            <div className="md:col-span-2 p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1F2C] border border-[#E9EAF0] dark:border-[#232838] space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#171923] text-white flex items-center justify-center font-bold text-[10px]">
                  A
                </div>
                <div className="p-3 rounded-xl bg-[#6857E8] text-white text-xs leading-relaxed max-w-md">
                  What is our annual allowance for remote work equipment and how is it reimbursed?
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#6857E8] text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#13161F] border border-[#E9EAF0] dark:border-[#2D3345] text-xs text-[#171923] dark:text-[#E2E8F0] leading-relaxed max-w-lg space-y-2">
                  <p>
                    According to the <strong>Acme Corp Employee Handbook 2026</strong> [1], all full-time team members receive an annual <strong>Remote Workspace Stipend of $1,200</strong>.
                  </p>
                  <p className="text-[11px] text-[#777D8A]">
                    Eligible purchases include standing desks, ergonomic chairs, monitors, and fiber internet. All expenses are submitted directly via Brex and automatically approved up to the threshold [1].
                  </p>
                  <div className="pt-2 border-t border-[#E9EAF0] dark:border-[#232838] flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6857E8] bg-[#F0EDFF] dark:bg-[#201C3E] px-2 py-0.5 rounded">
                      [1] Page 1 &bull; 96% Match
                    </span>
                    <span className="text-[10px] text-[#777D8A]">Grounded in verified document</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Designed for modern high-velocity teams
          </h2>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
            Eliminate hours lost searching through scattered Notion pages, Google Drive folders, and Slack threads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Chat with Documents</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
              Ask questions naturally in any language. The AI agent analyzes your documents and provides syntheses with exact citations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#16A36A] dark:bg-[#064E3B]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Zero Hallucinations</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
              Every answer is bound strictly to your uploaded content. If information does not exist in your files, the model explicitly tells you.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#E9A23B] dark:bg-[#78350F]/30 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Knowledge Collections</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
              Organize company documents into departmental collections: Engineering, HR, Legal, Customer Support, and Executive Strategy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A]/30 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Global Command Palette</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
              Search across your entire workspace in milliseconds with `Ctrl + K`. Jump directly to documents, chunks, or past conversations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Granular Team Roles</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
              Assign Owner, Admin, Editor, and Viewer roles. Protect sensitive compensation or board materials from unauthorized access.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#16A36A] dark:bg-[#064E3B]/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Enterprise Security</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] leading-relaxed">
              All documents and embeddings are isolated in Firestore and Cloud Storage with AES-256 encryption. Your data is never used to train public models.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Document Formats */}
      <section className="py-16 bg-white dark:bg-[#13161F] border-y border-[#E9EAF0] dark:border-[#232838] px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-2xl font-bold text-[#171923] dark:text-white">
            Supported Document Formats
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['PDF (.pdf)', 'Word (.docx)', 'Text (.txt)', 'Markdown (.md)', 'CSV (.csv)', 'PowerPoint (.pptx)'].map((fmt, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1F2C] border border-[#E9EAF0] dark:border-[#232838] text-xs font-semibold">
                <FileText className="w-4 h-4 text-[#6857E8]" />
                <span>{fmt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171923] dark:text-white tracking-tight">
          Ready to unlock your company's collective intelligence?
        </h2>
        <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] max-w-xl mx-auto">
          Join startups, agencies, and operations teams using Knowbase AI to empower their teams with instant answers.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create your workspace now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E9EAF0] dark:border-[#232838] py-8 px-6 text-xs text-[#777D8A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#6857E8] text-white flex items-center justify-center font-bold text-[10px]">
              K
            </div>
            <span className="font-bold text-[#171923] dark:text-white">Knowbase AI</span>
            <span>&bull;</span>
            <span>Your knowledge. One intelligent workspace.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="hover:text-[#171923] dark:hover:text-white">Pricing</Link>
            <Link to="/privacy" className="hover:text-[#171923] dark:hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#171923] dark:hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

