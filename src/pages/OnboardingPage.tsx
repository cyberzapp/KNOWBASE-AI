import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Building, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Bot, 
  FolderTree,
  Check
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const OnboardingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createWorkspace } = useWorkspaceStore();
  const { uploadDocument } = useDocumentStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [wsName, setWsName] = useState('');
  const [orgType, setOrgType] = useState('SaaS / Tech Startup');
  const [teamSize, setTeamSize] = useState('10-25');
  const [mainPurpose, setMainPurpose] = useState('Internal company knowledge & documentation');
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const purposeOptions = [
    { title: 'Internal Company Knowledge', desc: 'SOPs, employee handbooks, onboarding guides, and team playbooks' },
    { title: 'Customer Support & Runbooks', desc: 'Troubleshooting runbooks, SLA commitments, refund policies, FAQs' },
    { title: 'Technical & Architecture Docs', desc: 'API specs, deployment runbooks, security compliance and whitepapers' },
    { title: 'HR, Policies & Compliance', desc: 'Benefits, time off, payroll schedules, and SOC2 / GDPR requirements' },
  ];

  const handleCreateWorkspace = async () => {
    if (!wsName.trim() || !user) return;
    try {
      const ws = await createWorkspace({
        name: wsName.trim(),
        organizationType: orgType,
        teamSize,
        mainPurpose,
        ownerId: user.id,
        ownerEmail: user.email,
        ownerName: user.displayName || 'Founder',
      });
      setCreatedWorkspaceId(ws.id);
      setStep(4);
    } catch {
      toast.error('Error', 'Failed to create workspace.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !createdWorkspaceId || !user) return;
    const file = e.target.files[0];
    try {
      toast.info('Indexing Document', `Processing "${file.name}"...`);
      await uploadDocument(file, createdWorkspaceId, null, user.id, user.displayName);
      setUploadedDocName(file.name);
      toast.success('Document Ready', 'Indexed and vectorized.');
    } catch {
      toast.error('Processing Error', 'Could not index file.');
    }
  };

  const handleFinish = () => {
    setIsFinishing(true);
    // Fire confetti celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6857E8', '#16A36A', '#E9A23B', '#9F7AEA'],
    });

    setTimeout(() => {
      navigate(`/app/workspaces/${createdWorkspaceId || 'ws_demo_enterprise'}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FC] dark:bg-[#0E1117] text-left">
      <div className="w-full max-w-xl bg-white dark:bg-[#161A23] rounded-3xl border border-[#E9EAF0] dark:border-[#232838] p-8 shadow-2xl relative overflow-hidden">
        {/* Step Progress Dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-[#6857E8]'
                    : s < step
                    ? 'w-4 bg-[#16A36A]'
                    : 'w-4 bg-[#E9EAF0] dark:bg-[#232838]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#777D8A]">Step {step} of 5</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171923] dark:text-white tracking-tight">
                Let's build your intelligent knowledge workspace
              </h1>
              <p className="text-xs sm:text-sm text-[#777D8A] dark:text-[#9BA1B0] max-w-md mx-auto leading-relaxed">
                In just a few steps, we'll configure your workspace, ingest your first documents, and enable AI grounded citations.
              </p>
            </div>
            <div className="pt-4">
              <Button size="lg" className="w-full" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Workspace Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#171923] dark:text-white">Workspace Information</h2>
              <p className="text-xs text-[#777D8A]">Name your company workspace and organization details.</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Workspace Name"
                placeholder="e.g. Acme Technologies"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                required
                autoFocus
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                  Organization Type
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
                >
                  <option value="SaaS / Tech Startup">SaaS / Tech Startup</option>
                  <option value="Software Development Agency">Software Development Agency</option>
                  <option value="Operations & HR">Operations & HR</option>
                  <option value="Consulting & Advisory">Consulting & Advisory</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                  Team Size
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
                >
                  <option value="1-5">1 - 5 members</option>
                  <option value="5-15">5 - 15 members</option>
                  <option value="15-50">15 - 50 members</option>
                  <option value="50+">50+ members</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button disabled={!wsName.trim()} onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Main Purpose */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#171923] dark:text-white">What is your primary use case?</h2>
              <p className="text-xs text-[#777D8A]">This helps tailor default collections and AI search parameters.</p>
            </div>

            <div className="space-y-2.5">
              {purposeOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setMainPurpose(opt.title)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    mainPurpose === opt.title
                      ? 'border-[#6857E8] bg-[#F0EDFF]/50 dark:bg-[#201C3E] shadow-xs'
                      : 'border-[#E9EAF0] dark:border-[#232838] hover:border-[#6857E8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#171923] dark:text-white">{opt.title}</p>
                    {mainPurpose === opt.title && <Check className="w-4 h-4 text-[#6857E8]" />}
                  </div>
                  <p className="text-xs text-[#777D8A] mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={handleCreateWorkspace} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Provision Workspace
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: First Document Upload */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#171923] dark:text-white">Upload your first document</h2>
              <p className="text-xs text-[#777D8A]">Add a PDF, handbook, or policy document to test vector search.</p>
            </div>

            <div className="border-2 border-dashed border-[#E9EAF0] dark:border-[#232838] rounded-2xl p-8 text-center bg-[#F8F9FC] dark:bg-[#161A23]">
              {uploadedDocName ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-[#16A36A] mx-auto" />
                  <p className="text-sm font-bold text-[#171923] dark:text-white">{uploadedDocName}</p>
                  <p className="text-xs text-[#16A36A] font-medium">Successfully processed & ready for AI</p>
                </div>
              ) : (
                <label className="cursor-pointer space-y-3 block">
                  <Upload className="w-10 h-10 text-[#6857E8] mx-auto" />
                  <div>
                    <span className="text-sm font-bold text-[#6857E8] hover:underline">Click to upload document</span>
                    <p className="text-xs text-[#777D8A] mt-1">PDF, DOCX, Markdown, or TXT up to 50 MB</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.csv,.pptx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(5)}>
                Skip for now
              </Button>
              <Button onClick={() => setStep(5)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Completed */}
        {step === 5 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#16A36A] dark:bg-[#064E3B]/30 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
                Your workspace is ready!
              </h2>
              <p className="text-xs sm:text-sm text-[#777D8A] max-w-sm mx-auto leading-relaxed">
                Welcome to <span className="font-semibold text-[#171923] dark:text-white">{wsName || 'your workspace'}</span>. You can now chat with your documents, organize collections, and invite team members.
              </p>
            </div>

            <div className="pt-4">
              <Button size="lg" className="w-full" isLoading={isFinishing} onClick={handleFinish} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Workspace Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

