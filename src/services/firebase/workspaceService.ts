import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { 
  Workspace, 
  WorkspaceMember, 
  WorkspaceRole, 
  WorkspaceInvitation, 
  Collection, 
  ActivityItem, 
  NotificationItem,
  WorkspaceUsage
} from '@/types';
import { 
  SEED_WORKSPACE, 
  SEED_COLLECTIONS, 
  SEED_MEMBERS, 
  SEED_USAGE, 
  SEED_ACTIVITIES, 
  SEED_NOTIFICATIONS 
} from './mockData';
import { safeStorage } from '@/utils/safeStorage';

const STORAGE_KEYS = {
  WORKSPACES: 'knowbase_workspaces',
  COLLECTIONS: 'knowbase_collections',
  MEMBERS: 'knowbase_members',
  INVITATIONS: 'knowbase_invitations',
  ACTIVITIES: 'knowbase_activities',
  NOTIFICATIONS: 'knowbase_notifications',
  USAGE: 'knowbase_usage',
};

// Initialize storage fallback with seed data if empty
function initMockStorage() {
  if (!safeStorage.getItem(STORAGE_KEYS.WORKSPACES)) {
    safeStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify([SEED_WORKSPACE]));
  }
  if (!safeStorage.getItem(STORAGE_KEYS.COLLECTIONS)) {
    safeStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(SEED_COLLECTIONS));
  }
  if (!safeStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    safeStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(SEED_MEMBERS));
  }
  if (!safeStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    safeStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
  }
  if (!safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!safeStorage.getItem(STORAGE_KEYS.USAGE)) {
    safeStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify({ [SEED_WORKSPACE.id]: SEED_USAGE }));
  }
}

initMockStorage();

export const workspaceService = {
  // Get all workspaces user is a member of
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.WORKSPACES);
      return stored ? JSON.parse(stored) : [SEED_WORKSPACE];
    }

    try {
      // Find workspaces where user is a member
      const memberQuery = query(collection(db, 'workspace_members'), where('userId', '==', userId));
      const memberSnaps = await getDocs(memberQuery);
      const workspaceIds = memberSnaps.docs.map(d => d.data().workspaceId);

      if (workspaceIds.length === 0) {
        // Check if owner
        const ownerQuery = query(collection(db, 'workspaces'), where('ownerId', '==', userId));
        const ownerSnaps = await getDocs(ownerQuery);
        return ownerSnaps.docs.map(d => ({ id: d.id, ...d.data() } as Workspace));
      }

      const workspaces: Workspace[] = [];
      for (const wsId of workspaceIds) {
        const wsSnap = await getDoc(doc(db, 'workspaces', wsId));
        if (wsSnap.exists()) {
          workspaces.push({ id: wsSnap.id, ...wsSnap.data() } as Workspace);
        }
      }
      return workspaces;
    } catch (err) {
      console.warn('Error fetching workspaces from Firestore, fallback:', err);
      const stored = safeStorage.getItem(STORAGE_KEYS.WORKSPACES);
      return stored ? JSON.parse(stored) : [SEED_WORKSPACE];
    }
  },

  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.WORKSPACES);
      const list: Workspace[] = stored ? JSON.parse(stored) : [SEED_WORKSPACE];
      return list.find(w => w.id === workspaceId) || null;
    }

    try {
      const wsSnap = await getDoc(doc(db, 'workspaces', workspaceId));
      if (!wsSnap.exists()) return null;
      return { id: wsSnap.id, ...wsSnap.data() } as Workspace;
    } catch (err) {
      console.error('Error fetching workspace by id:', err);
      return null;
    }
  },

  async createWorkspace(data: {
    name: string;
    organizationType: string;
    teamSize: string;
    mainPurpose: string;
    ownerId: string;
    ownerEmail: string;
    ownerName: string;
  }): Promise<Workspace> {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'workspace';
    const workspaceId = 'ws_' + Math.random().toString(36).substring(2, 10);

    const newWorkspace: Workspace = {
      id: workspaceId,
      name: data.name,
      slug,
      organizationType: data.organizationType,
      teamSize: data.teamSize,
      mainPurpose: data.mainPurpose,
      ownerId: data.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        allowPublicSharing: false,
        aiModel: 'gemini-3.8-flash',
        retrievalLimit: 5,
        similarityThreshold: 0.65,
        autoSummarizeNewDocs: true,
      },
    };

    const initialMember: WorkspaceMember = {
      workspaceId,
      userId: data.ownerId,
      role: 'owner',
      email: data.ownerEmail,
      displayName: data.ownerName,
      joinedAt: new Date().toISOString(),
    };

    const initialUsage: WorkspaceUsage = {
      workspaceId,
      periodId: new Date().toISOString().substring(0, 7),
      documentsCount: 0,
      documentsLimit: 25,
      storageBytes: 0,
      storageLimitBytes: 104857600, // 100 MB
      questionsAsked: 0,
      questionsLimit: 30,
      plan: 'free',
      subscriptionStatus: 'active',
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'workspaces', workspaceId), newWorkspace);
        await setDoc(doc(db, `workspaces/${workspaceId}/members`, data.ownerId), initialMember);
        await setDoc(doc(db, 'workspace_members', `${workspaceId}_${data.ownerId}`), initialMember);
        await setDoc(doc(db, `workspaces/${workspaceId}/usage`, initialUsage.periodId), initialUsage);
      } catch (err) {
        console.error('Error saving new workspace to Firestore:', err);
      }
    }

    // Always update safe store
    const stored = safeStorage.getItem(STORAGE_KEYS.WORKSPACES);
    const list: Workspace[] = stored ? JSON.parse(stored) : [];
    list.push(newWorkspace);
    safeStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(list));

    const storedMembers = safeStorage.getItem(STORAGE_KEYS.MEMBERS);
    const memberList: WorkspaceMember[] = storedMembers ? JSON.parse(storedMembers) : [];
    memberList.push(initialMember);
    safeStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(memberList));

    const storedUsage = safeStorage.getItem(STORAGE_KEYS.USAGE);
    const usageMap = storedUsage ? JSON.parse(storedUsage) : {};
    usageMap[workspaceId] = initialUsage;
    safeStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usageMap));

    return newWorkspace;
  },

  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void> {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'workspaces', workspaceId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.WORKSPACES);
    if (stored) {
      const list: Workspace[] = JSON.parse(stored);
      const index = list.findIndex(w => w.id === workspaceId);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
        safeStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(list));
      }
    }
  },

  // Collections
  async getCollections(workspaceId: string): Promise<Collection[]> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      const list: Collection[] = stored ? JSON.parse(stored) : SEED_COLLECTIONS;
      return list.filter(c => c.workspaceId === workspaceId);
    }

    try {
      const snap = await getDocs(collection(db, `workspaces/${workspaceId}/collections`));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Collection));
    } catch {
      const stored = safeStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      const list: Collection[] = stored ? JSON.parse(stored) : SEED_COLLECTIONS;
      return list.filter(c => c.workspaceId === workspaceId);
    }
  },

  async createCollection(workspaceId: string, data: { name: string; description: string; icon: string; color: string; userId: string }): Promise<Collection> {
    const colId = 'col_' + Math.random().toString(36).substring(2, 9);
    const newCol: Collection = {
      id: colId,
      workspaceId,
      name: data.name,
      description: data.description,
      icon: data.icon || 'Folder',
      color: data.color || '#6857E8',
      documentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.userId,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, `workspaces/${workspaceId}/collections`, colId), newCol);
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    const list: Collection[] = stored ? JSON.parse(stored) : [];
    list.push(newCol);
    safeStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list));

    return newCol;
  },

  async deleteCollection(workspaceId: string, collectionId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, `workspaces/${workspaceId}/collections`, collectionId));
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    if (stored) {
      const list: Collection[] = JSON.parse(stored);
      safeStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list.filter(c => c.id !== collectionId)));
    }
  },

  // Members
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.MEMBERS);
      const list: WorkspaceMember[] = stored ? JSON.parse(stored) : SEED_MEMBERS;
      return list.filter(m => m.workspaceId === workspaceId);
    }

    try {
      const snap = await getDocs(collection(db, `workspaces/${workspaceId}/members`));
      return snap.docs.map(d => d.data() as WorkspaceMember);
    } catch {
      const stored = safeStorage.getItem(STORAGE_KEYS.MEMBERS);
      const list: WorkspaceMember[] = stored ? JSON.parse(stored) : SEED_MEMBERS;
      return list.filter(m => m.workspaceId === workspaceId);
    }
  },

  async inviteMember(workspaceId: string, email: string, role: WorkspaceRole, invitedBy: string, invitedByName: string): Promise<WorkspaceInvitation> {
    const invitationId = 'inv_' + Math.random().toString(36).substring(2, 9);
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    const invitation: WorkspaceInvitation = {
      id: invitationId,
      workspaceId,
      email,
      role,
      invitedBy,
      invitedByName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, `workspaces/${workspaceId}/invitations`, invitationId), invitation);
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.INVITATIONS);
    const list: WorkspaceInvitation[] = stored ? JSON.parse(stored) : [];
    list.push(invitation);
    safeStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(list));

    return invitation;
  },

  async updateMemberRole(workspaceId: string, userId: string, newRole: WorkspaceRole): Promise<void> {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, `workspaces/${workspaceId}/members`, userId), { role: newRole });
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (stored) {
      const list: WorkspaceMember[] = JSON.parse(stored);
      const member = list.find(m => m.workspaceId === workspaceId && m.userId === userId);
      if (member) {
        member.role = newRole;
        safeStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(list));
      }
    }
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, `workspaces/${workspaceId}/members`, userId));
      await deleteDoc(doc(db, 'workspace_members', `${workspaceId}_${userId}`));
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (stored) {
      const list: WorkspaceMember[] = JSON.parse(stored);
      safeStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(list.filter(m => !(m.workspaceId === workspaceId && m.userId === userId))));
    }
  },

  // Usage & Limits
  async getUsage(workspaceId: string): Promise<WorkspaceUsage> {
    const periodId = new Date().toISOString().substring(0, 7);
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.USAGE);
      const map = stored ? JSON.parse(stored) : {};
      return map[workspaceId] || { ...SEED_USAGE, workspaceId, periodId };
    }

    try {
      const snap = await getDoc(doc(db, `workspaces/${workspaceId}/usage`, periodId));
      if (snap.exists()) {
        return snap.data() as WorkspaceUsage;
      }
      return { ...SEED_USAGE, workspaceId, periodId };
    } catch {
      return { ...SEED_USAGE, workspaceId, periodId };
    }
  },

  // Activity Log
  async getActivities(workspaceId: string): Promise<ActivityItem[]> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const list: ActivityItem[] = stored ? JSON.parse(stored) : SEED_ACTIVITIES;
      return list.filter(a => a.workspaceId === workspaceId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      const snap = await getDocs(query(collection(db, `workspaces/${workspaceId}/activity`), orderBy('createdAt', 'desc'), limit(50)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityItem));
    } catch {
      const stored = safeStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return stored ? JSON.parse(stored) : SEED_ACTIVITIES;
    }
  },

  async logActivity(item: Omit<ActivityItem, 'id' | 'createdAt'>): Promise<void> {
    const activityId = 'act_' + Math.random().toString(36).substring(2, 9);
    const newActivity: ActivityItem = {
      id: activityId,
      ...item,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, `workspaces/${item.workspaceId}/activity`, activityId), newActivity);
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const list: ActivityItem[] = stored ? JSON.parse(stored) : [];
    list.unshift(newActivity);
    safeStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list.slice(0, 100)));
  },

  // Notifications
  async getNotifications(workspaceId: string, userId: string): Promise<NotificationItem[]> {
    const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: NotificationItem[] = stored ? JSON.parse(stored) : SEED_NOTIFICATIONS;
    return list.filter(n => n.workspaceId === workspaceId && (!n.userId || n.userId === userId));
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (stored) {
      const list: NotificationItem[] = JSON.parse(stored);
      const target = list.find(n => n.id === notificationId);
      if (target) {
        target.isRead = true;
        safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      }
    }
  },

  async markAllNotificationsRead(workspaceId: string): Promise<void> {
    const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (stored) {
      const list: NotificationItem[] = JSON.parse(stored);
      for (const n of list) {
        if (n.workspaceId === workspaceId) n.isRead = true;
      }
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  }
};

