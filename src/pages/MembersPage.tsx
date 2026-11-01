import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  MoreVertical, 
  Check, 
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/utils/formatters';
import { WorkspaceRole, WorkspaceMember } from '@/types';

export const MembersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    currentWorkspace, 
    members, 
    fetchMembers, 
    inviteMember, 
    updateMemberRole, 
    removeMember 
  } = useWorkspaceStore();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const toast = useToast();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');
  const [isInviting, setIsInviting] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);

  const activeWsId = currentWorkspace?.id || workspaceId || 'ws_demo_enterprise';

  useEffect(() => {
    if (activeWsId) {
      fetchMembers();
    }
  }, [activeWsId, fetchMembers]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user) return;
    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole, user.id, user.displayName);
      toast.success('Invitation Dispatched', `Invited ${inviteEmail} as ${inviteRole}.`);
      setIsInviteOpen(false);
      setInviteEmail('');
    } catch {
      toast.error('Invitation Failed', 'Could not send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberUserId: string, newRole: WorkspaceRole) => {
    try {
      await updateMemberRole(memberUserId, newRole);
      toast.success('Role Updated', `Member permissions updated to ${newRole}.`);
    } catch {
      toast.error('Error', 'Failed to update member role.');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember(memberToRemove.userId);
      toast.success('Member Removed', `${memberToRemove.displayName} has been removed from this workspace.`);
      setMemberToRemove(null);
    } catch {
      toast.error('Error', 'Could not remove member.');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Team Members & Access Control
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            Manage who has access to read, edit, or administer knowledge in <span className="font-semibold text-[#171923] dark:text-white">{currentWorkspace?.name}</span>.
          </p>
        </div>

        <Button
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Colleague
        </Button>
      </div>

      {/* Role explanation bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838]">
          <div className="flex items-center gap-2 mb-1">
            <Badge role="owner" size="sm" />
            <span className="text-xs font-bold text-[#171923] dark:text-white">Full Control</span>
          </div>
          <p className="text-[11px] text-[#777D8A] leading-relaxed">
            Billing management, delete workspace, transfer ownership, and full admin privileges.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838]">
          <div className="flex items-center gap-2 mb-1">
            <Badge role="admin" size="sm" />
            <span className="text-xs font-bold text-[#171923] dark:text-white">Administration</span>
          </div>
          <p className="text-[11px] text-[#777D8A] leading-relaxed">
            Manage members, adjust collections, upload documents, and configure workspace settings.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838]">
          <div className="flex items-center gap-2 mb-1">
            <Badge role="editor" size="sm" />
            <span className="text-xs font-bold text-[#171923] dark:text-white">Content Contributor</span>
          </div>
          <p className="text-[11px] text-[#777D8A] leading-relaxed">
            Upload new documents, create knowledge collections, and ask AI questions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838]">
          <div className="flex items-center gap-2 mb-1">
            <Badge role="viewer" size="sm" />
            <span className="text-xs font-bold text-[#171923] dark:text-white">Read-Only</span>
          </div>
          <p className="text-[11px] text-[#777D8A] leading-relaxed">
            Search documents, view verified source citations, and query the AI assistant.
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-[#161A23] rounded-2xl border border-[#E9EAF0] dark:border-[#232838] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8F9FC] dark:bg-[#1C202C] border-b border-[#E9EAF0] dark:border-[#232838] text-[#777D8A]">
              <th className="py-3 px-4 font-semibold">User</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Joined Date</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9EAF0] dark:divide-[#232838]">
            {members.map((member) => (
              <tr key={member.userId} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1A1F2C] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${member.displayName}&backgroundColor=6857e8`}
                      alt={member.displayName}
                      className="w-8 h-8 rounded-full object-cover border border-[#E9EAF0] dark:border-[#232838]"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#171923] dark:text-white">
                        {member.displayName}
                        {member.userId === user?.id && (
                          <span className="ml-2 text-[10px] text-[#6857E8] font-bold">(You)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-[#777D8A]">
                  {member.email}
                </td>

                <td className="py-3.5 px-4">
                  {member.role === 'owner' ? (
                    <Badge role="owner" size="sm" />
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.userId, e.target.value as WorkspaceRole)}
                      className="text-xs font-semibold bg-[#F8F9FC] dark:bg-[#1E2330] rounded-lg border border-[#E9EAF0] dark:border-[#2D3345] px-2 py-1 text-[#171923] dark:text-[#E2E8F0] focus:outline-none focus:border-[#6857E8]"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}
                </td>

                <td className="py-3.5 px-4 text-[#777D8A]">
                  {formatDate(member.joinedAt)}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {member.role !== 'owner' && member.userId !== user?.id && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#E05252] hover:bg-[#F0F2F7] dark:hover:bg-[#1E2330] transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Invited members will receive workspace access according to their assigned role."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            placeholder="colleague@yourcompany.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
              Assign Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
              className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
            >
              <option value="editor">Editor (Can upload docs & ask questions)</option>
              <option value="viewer">Viewer (Read and search only)</option>
              <option value="admin">Admin (Can manage workspace & members)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the workspace?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#777D8A] leading-relaxed">
            Removing <span className="font-bold text-[#171923] dark:text-white">{memberToRemove?.displayName}</span> will immediately revoke their access to all documents and conversations in this workspace.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRemoveConfirm}>
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

