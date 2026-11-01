import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ToastProvider } from '@/components/ui/Toast';

// Layout
import { AppLayout } from '@/components/layout/AppLayout';

// Public Pages
import { LandingPage } from '@/pages/LandingPage';
import { PricingPage } from '@/pages/PricingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PrivacyPage, TermsPage } from '@/pages/LegalPages';

// Authenticated Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { DocumentDetailsPage } from '@/pages/DocumentDetailsPage';
import { ChatPage } from '@/pages/ChatPage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { MembersPage } from '@/pages/MembersPage';
import { BillingPage } from '@/pages/BillingPage';
import { WorkspaceSettingsPage } from '@/pages/WorkspaceSettingsPage';
import { PersonalSettingsPage } from '@/pages/PersonalSettingsPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { NotificationsPage } from '@/pages/NotificationsPage';

// Redirect helper component
const AppRedirect: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const targetId = currentWorkspace?.id || 'ws_demo_enterprise';
  return <Navigate to={`/app/workspaces/${targetId}`} replace />;
};

export const App: React.FC = () => {
  const { user, initAuth, isLoading: isAuthLoading } = useAuthStore();
  const { currentWorkspace, initWorkspace } = useWorkspaceStore();

  useEffect(() => {
    const unsub = initAuth();
    return () => unsub();
  }, [initAuth]);

  useEffect(() => {
    if (user) {
      initWorkspace(user.id, user.currentWorkspaceId);
    }
  }, [user, initWorkspace]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Authenticated Workspace Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<AppRedirect />} />
            <Route path="workspaces" element={<AppRedirect />} />
            <Route path="workspaces/:workspaceId" element={<DashboardPage />} />
            <Route path="workspaces/:workspaceId/knowledge" element={<KnowledgePage />} />
            <Route path="workspaces/:workspaceId/documents" element={<DocumentsPage />} />
            <Route path="workspaces/:workspaceId/documents/:documentId" element={<DocumentDetailsPage />} />
            <Route path="workspaces/:workspaceId/chat" element={<ChatPage />} />
            <Route path="workspaces/:workspaceId/chat/:conversationId" element={<ChatPage />} />
            <Route path="workspaces/:workspaceId/members" element={<MembersPage />} />
            <Route path="workspaces/:workspaceId/settings" element={<WorkspaceSettingsPage />} />
            <Route path="search" element={<AppRedirect />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<PersonalSettingsPage />} />
            <Route path="billing" element={<BillingPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;

