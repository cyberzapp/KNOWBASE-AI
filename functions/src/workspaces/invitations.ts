import { db } from '../config';

export async function createMemberInvitation(params: {
  workspaceId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedBy: string;
  invitedByName: string;
}) {
  const { workspaceId, email, role, invitedBy, invitedByName } = params;

  // Validate caller permissions
  const callerMember = await db.doc(`workspaces/${workspaceId}/members/${invitedBy}`).get();
  if (!callerMember.exists) {
    throw new Error('Caller is not a member of this workspace.');
  }

  const callerRole = callerMember.data()?.role;
  if (callerRole !== 'owner' && callerRole !== 'admin') {
    throw new Error('Only Workspace Owners and Admins can invite team members.');
  }

  const invitationId = 'inv_' + Math.random().toString(36).substring(2, 10);
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

  const invitation = {
    id: invitationId,
    workspaceId,
    email: email.toLowerCase().trim(),
    role,
    invitedBy,
    invitedByName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  await db.doc(`workspaces/${workspaceId}/invitations/${invitationId}`).set(invitation);

  return invitation;
}

export async function acceptMemberInvitation(params: {
  workspaceId: string;
  invitationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto?: string;
}) {
  const { workspaceId, invitationId, userId, userEmail, userName, userPhoto } = params;

  const invRef = db.doc(`workspaces/${workspaceId}/invitations/${invitationId}`);
  const invSnap = await invRef.get();

  if (!invSnap.exists) {
    throw new Error('Invitation not found.');
  }

  const invData = invSnap.data();
  if (invData?.status !== 'pending') {
    throw new Error(`Invitation is already ${invData?.status}.`);
  }

  if (new Date(invData.expiresAt).getTime() < Date.now()) {
    await invRef.update({ status: 'expired' });
    throw new Error('This invitation has expired.');
  }

  // Add member
  const member = {
    workspaceId,
    userId,
    role: invData.role,
    email: userEmail,
    displayName: userName,
    photoURL: userPhoto || null,
    joinedAt: new Date().toISOString(),
  };

  await db.doc(`workspaces/${workspaceId}/members/${userId}`).set(member);
  await db.doc(`workspace_members/${workspaceId}_${userId}`).set(member);
  await invRef.update({ status: 'accepted' });

  // Log activity
  const actId = 'act_' + Math.random().toString(36).substring(2, 9);
  await db.doc(`workspaces/${workspaceId}/activity/${actId}`).set({
    id: actId,
    workspaceId,
    userId,
    userName,
    action: 'member_joined',
    details: `${userName} accepted invitation and joined as ${invData.role}`,
    createdAt: new Date().toISOString(),
  });

  return member;
}

