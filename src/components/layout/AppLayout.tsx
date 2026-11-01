import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  FolderTree, 
  FileText, 
  Search, 
  Users, 
  Activity, 
  Settings, 
  CreditCard, 
  Bell, 
  ChevronDown, 
  Plus, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Database,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { isFirebaseConfigured } from '@/services/firebase/config';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { 
    currentWorkspace, 
    workspaces, 
    switchWorkspace, 
    createWorkspace, 
    unreadNotificationCount 
  } = useWorkspaceStore();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFirebaseInfoOpen, setIsFirebaseInfoOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // New Workspace form state
  const [wsName, setWsName] = useState('');
  const [wsOrgType, setWsOrgType] = useState('SaaS / Tech Startup');
  const [wsTeamSize, setWsTeamSize] = useState('10-25');
  const [wsPurpose, setWsPurpose] = useState('Company policies, technical docs & product research');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeWsId = currentWorkspace?.id || workspaceId || 'ws_demo_enterprise';

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim() || !user) return;
    setIsCreatingWs(true);
    try {
      const newWs = await createWorkspace({
        name: wsName.trim(),
        organizationType: wsOrgType,
        teamSize: wsTeamSize,
        mainPurpose: wsPurpose,
        ownerId: user.id,
        ownerEmail: user.email,
        ownerName: user.displayName,
      });
      toast.success('Workspace Created', `Switched to "${newWs.name}" successfully.`);
      setIsCreateWsOpen(false);
      setWsName('');
      navigate(`/app/workspaces/${newWs.id}`);
    } catch {
      toast.error('Error', 'Failed to create workspace.');
    } finally {
      setIsCreatingWs(false);
    }
  };

  const navLinks = [
    { to: `/app/workspaces/${activeWsId}`, label: 'Overview', icon: LayoutDashboard },
    { to: `/app/workspaces/${activeWsId}/chat`, label: 'AI Assistant', icon: Bot, badge: 'RAG' },
    { to: `/app/workspaces/${activeWsId}/knowledge`, label: 'Knowledge Base', icon: FolderTree },
    { to: `/app/workspaces/${activeWsId}/documents`, label: 'Documents', icon: FileText },
    { to: `/app/workspaces/${activeWsId}/members`, label: 'Team Members', icon: Users },
    { to: `/app/activity`, label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0E1117] flex">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#13161F] border-r border-[#E9EAF0] dark:border-[#232838]
        flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Workspace Switcher */}
        <div className="p-3.5 border-b border-[#E9EAF0] dark:border-[#232838] relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F9FC] dark:hover:bg-[#1C202C] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#6857E8] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                {currentWorkspace?.name ? currentWorkspace.name.charAt(0).toUpperCase() : 'K'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#171923] dark:text-white truncate">
                  {currentWorkspace?.name || 'Knowbase Workspace'}
                </p>
                <p className="text-[11px] text-[#777D8A] dark:text-[#9BA1B0] truncate">
                  {currentWorkspace?.slug || 'workspace'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#777D8A] shrink-0 ml-1" />
          </button>

          {/* Workspace Dropdown */}
          {isWorkspaceMenuOpen && (
            <div className="absolute top-16 left-3 right-3 bg-white dark:bg-[#161A23] rounded-xl border border-[#E9EAF0] dark:border-[#232838] shadow-xl p-2 z-50">
              <p className="text-[10px] uppercase font-bold text-[#777D8A] px-2 py-1 tracking-wider">Your Workspaces</p>
              <div className="space-y-1 max-h-48 overflow-y-auto my-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      if (user) switchWorkspace(ws.id, user.id);
                      setIsWorkspaceMenuOpen(false);
                      navigate(`/app/workspaces/${ws.id}`);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      ws.id === currentWorkspace?.id
                        ? 'bg-[#F0EDFF] text-[#6857E8] font-semibold dark:bg-[#2B2754]'
                        : 'text-[#171923] dark:text-[#E2E8F0] hover:bg-[#F8F9FC] dark:hover:bg-[#1E2330]'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === currentWorkspace?.id && <span className="w-1.5 h-1.5 rounded-full bg-[#6857E8]" />}
                  </button>
                ))}
              </div>
              <div className="pt-1 border-t border-[#E9EAF0] dark:border-[#232838] mt-1">
                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    setIsCreateWsOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6857E8] hover:bg-[#F0EDFF] dark:hover:bg-[#2B2754] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search Button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F0F2F7] dark:bg-[#1C202C] text-[#777D8A] dark:text-[#9BA1B0] hover:text-[#171923] dark:hover:text-white hover:bg-[#EAECEF] dark:hover:bg-[#252A3A] transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search workspace...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#13161F] text-[10px] border border-[#D0D4DF] dark:border-[#2D3345] font-mono shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to.includes('/chat') && location.pathname.includes('/chat'));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#6857E8] text-white shadow-sm shadow-[#6857E8]/25'
                    : 'text-[#777D8A] dark:text-[#9BA1B0] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-current'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Backend & Deployment Diagnostic Pill */}
        <div className="px-3 py-2">
          <button
            onClick={() => setIsFirebaseInfoOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F8F9FC] dark:bg-[#181C26] border border-[#E9EAF0] dark:border-[#232838] text-[11px] hover:border-[#6857E8] transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-[#16A36A] animate-pulse' : 'bg-[#E9A23B]'}`} />
              <span className="font-semibold text-[#171923] dark:text-[#E2E8F0] truncate">
                {isFirebaseConfigured ? 'Firebase Active' : 'Offline / Demo Engine'}
              </span>
            </div>
            <span className="text-[#6857E8] font-bold text-[10px]">Info</span>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#E9EAF0] dark:border-[#232838] space-y-1">
          <NavLink
            to={`/app/notifications`}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#777D8A] dark:text-[#9BA1B0] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {unreadNotificationCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#6857E8] text-white text-[10px] flex items-center justify-center font-bold">
                {unreadNotificationCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to={`/app/billing`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#777D8A] dark:text-[#9BA1B0] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C] transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Usage</span>
          </NavLink>

          <NavLink
            to={`/app/workspaces/${activeWsId}/settings`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#777D8A] dark:text-[#9BA1B0] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C] transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Workspace Settings</span>
          </NavLink>

          {/* User profile row */}
          <div className="pt-2 border-t border-[#E9EAF0] dark:border-[#232838] flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || 'User'}&backgroundColor=6857e8`}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-[#E9EAF0] dark:border-[#232838]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#171923] dark:text-white truncate">
                  {user?.displayName || 'Alex Morgan'}
                </p>
                <p className="text-[10px] text-[#777D8A] dark:text-[#9BA1B0] truncate">
                  {user?.email || 'alex@acme.ai'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C] transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#E05252] hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#13161F] border-b border-[#E9EAF0] dark:border-[#232838]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#777D8A] hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#6857E8] text-white flex items-center justify-center font-bold text-xs">
                K
              </div>
              <span className="font-bold text-sm tracking-tight text-[#171923] dark:text-white">
                Knowbase AI
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg text-[#777D8A] hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C]"
          >
            <Search className="w-4 h-4" />
          </button>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        title="Create New Workspace"
        description="Workspaces provide complete data isolation, team permissions, and dedicated knowledge index."
      >
        <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Acme Corp, Tech Innovations"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
              Organization Type
            </label>
            <select
              value={wsOrgType}
              onChange={(e) => setWsOrgType(e.target.value)}
              className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
            >
              <option value="SaaS / Tech Startup">SaaS / Tech Startup</option>
              <option value="Software Development Agency">Software Development Agency</option>
              <option value="HR & Operations">HR & Operations</option>
              <option value="Consulting & Advisory">Consulting & Advisory</option>
              <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
              Team Size
            </label>
            <select
              value={wsTeamSize}
              onChange={(e) => setWsTeamSize(e.target.value)}
              className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
            >
              <option value="1-5">1 - 5 members</option>
              <option value="5-15">5 - 15 members</option>
              <option value="15-50">15 - 50 members</option>
              <option value="50+">50+ enterprise members</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateWsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingWs}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Search Command Palette */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        workspaceId={activeWsId}
      />

      {/* Firebase Status & Diagnostics Modal */}
      <Modal
        isOpen={isFirebaseInfoOpen}
        onClose={() => setIsFirebaseInfoOpen(false)}
        title="Firebase & Backend Architecture Status"
        description="Knowbase AI uses Firebase Cloud Firestore, Authentication, Storage, and Cloud Functions."
      >
        <div className="space-y-4 text-xs">
          <div className={`p-4 rounded-xl border ${
            isFirebaseConfigured 
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' 
              : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
          }`}>
            <p className="font-bold text-sm">
              {isFirebaseConfigured ? 'Connected to Live Firebase Project' : 'Running in Offline / Development Mode'}
            </p>
            <p className="mt-1">
              {isFirebaseConfigured 
                ? 'All documents, vector chunks, chat history, and permissions are being synced directly to your Cloud Firestore database.'
                : 'All documents, chunking, semantic RAG search, citation tracking, and team management are currently running through the reactive high-performance local adapter. When you provide your Firebase credentials in `.env`, the app automatically connects to live Firebase services.'}
            </p>
          </div>

          <div className="bg-[#F8F9FC] dark:bg-[#1C202C] p-3 rounded-xl border border-[#E9EAF0] dark:border-[#232838] space-y-2">
            <p className="font-semibold text-[#171923] dark:text-white">Environment Configuration Keys:</p>
            <ul className="space-y-1 font-mono text-[11px] text-[#777D8A] dark:text-[#9BA1B0]">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>VITE_FIREBASE_APP_ID</li>
              <li>GEMINI_API_KEY (for Cloud Functions)</li>
              <li>RAZORPAY_KEY_ID (for Subscriptions)</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setIsFirebaseInfoOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

