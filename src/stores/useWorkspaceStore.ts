import { create } from 'zustand';
import { Workspace, WorkspaceMember, WorkspaceRole, Collection, WorkspaceUsage, ActivityItem, NotificationItem } from '@/types';
import { workspaceService } from '@/services/firebase/workspaceService';
import { SEED_WORKSPACE } from '@/services/firebase/mockData';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  currentRole: WorkspaceRole;
  members: WorkspaceMember[];
  collections: Collection[];
  usage: WorkspaceUsage | null;
  activities: ActivityItem[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  isLoading: boolean;
  error: string | null;

  initWorkspace: (userId: string, preferredWorkspaceId?: string) => Promise<void>;
  switchWorkspace: (workspaceId: string, userId: string) => Promise<void>;
  createWorkspace: (data: { name: string; organizationType: string; teamSize: string; mainPurpose: string; ownerId: string; ownerEmail: string; ownerName: string }) => Promise<Workspace>;
  updateWorkspaceSettings: (updates: Partial<Workspace>) => Promise<void>;
  
  fetchCollections: () => Promise<void>;
  createCollection: (name: string, description: string, icon: string, color: string, userId: string) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;

  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: WorkspaceRole, invitedBy: string, invitedByName: string) => Promise<void>;
  updateMemberRole: (userId: string, role: WorkspaceRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;

  fetchUsage: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchNotifications: (userId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentWorkspace: null,
  workspaces: [],
  currentRole: 'owner',
  members: [],
  collections: [],
  usage: null,
  activities: [],
  notifications: [],
  unreadNotificationCount: 0,
  isLoading: false,
  error: null,

  initWorkspace: async (userId: string, preferredWorkspaceId?: string) => {
    set({ isLoading: true });
    try {
      const workspaces = await workspaceService.getUserWorkspaces(userId);
      const safeWorkspaces = workspaces.length > 0 ? workspaces : [SEED_WORKSPACE];
      
      const targetWorkspace = preferredWorkspaceId
        ? safeWorkspaces.find(w => w.id === preferredWorkspaceId) || safeWorkspaces[0]
        : safeWorkspaces[0];

      set({ 
        workspaces: safeWorkspaces, 
        currentWorkspace: targetWorkspace,
        isLoading: false 
      });

      if (targetWorkspace) {
        await Promise.all([
          get().fetchCollections(),
          get().fetchMembers(),
          get().fetchUsage(),
          get().fetchActivities(),
          get().fetchNotifications(userId),
        ]);
      }
    } catch (err: any) {
      console.error('Error initializing workspace:', err);
      set({ isLoading: false, currentWorkspace: SEED_WORKSPACE, workspaces: [SEED_WORKSPACE] });
    }
  },

  switchWorkspace: async (workspaceId: string, userId: string) => {
    const ws = get().workspaces.find(w => w.id === workspaceId);
    if (!ws) {
      const fetched = await workspaceService.getWorkspaceById(workspaceId);
      if (fetched) {
        set({ currentWorkspace: fetched });
      }
    } else {
      set({ currentWorkspace: ws });
    }

    await Promise.all([
      get().fetchCollections(),
      get().fetchMembers(),
      get().fetchUsage(),
      get().fetchActivities(),
      get().fetchNotifications(userId),
    ]);
  },

  createWorkspace: async (data) => {
    set({ isLoading: true });
    try {
      const newWs = await workspaceService.createWorkspace(data);
      const updatedList = [...get().workspaces, newWs];
      set({ 
        workspaces: updatedList, 
        currentWorkspace: newWs, 
        currentRole: 'owner',
        isLoading: false 
      });
      await Promise.all([
        get().fetchCollections(),
        get().fetchMembers(),
        get().fetchUsage(),
      ]);
      return newWs;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateWorkspaceSettings: async (updates) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    await workspaceService.updateWorkspace(ws.id, updates);
    set({ currentWorkspace: { ...ws, ...updates } });
  },

  fetchCollections: async () => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const collections = await workspaceService.getCollections(ws.id);
    set({ collections });
  },

  createCollection: async (name, description, icon, color, userId) => {
    const ws = get().currentWorkspace;
    if (!ws) throw new Error('No active workspace');
    const newCol = await workspaceService.createCollection(ws.id, { name, description, icon, color, userId });
    set({ collections: [...get().collections, newCol] });
    return newCol;
  },

  deleteCollection: async (id) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    await workspaceService.deleteCollection(ws.id, id);
    set({ collections: get().collections.filter(c => c.id !== id) });
  },

  fetchMembers: async () => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const members = await workspaceService.getMembers(ws.id);
    set({ members });
  },

  inviteMember: async (email, role, invitedBy, invitedByName) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    await workspaceService.inviteMember(ws.id, email, role, invitedBy, invitedByName);
    await get().fetchMembers();
  },

  updateMemberRole: async (userId, role) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    await workspaceService.updateMemberRole(ws.id, userId, role);
    set({
      members: get().members.map(m => m.userId === userId ? { ...m, role } : m)
    });
  },

  removeMember: async (userId) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    await workspaceService.removeMember(ws.id, userId);
    set({
      members: get().members.filter(m => m.userId !== userId)
    });
  },

  fetchUsage: async () => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const usage = await workspaceService.getUsage(ws.id);
    set({ usage });
  },

  fetchActivities: async () => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const activities = await workspaceService.getActivities(ws.id);
    set({ activities });
  },

  fetchNotifications: async (userId: string) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const notifications = await workspaceService.getNotifications(ws.id, userId);
    const unreadNotificationCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadNotificationCount });
  },

  markNotificationRead: async (id: string) => {
    await workspaceService.markNotificationAsRead(id);
    const notifications = get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    set({ 
      notifications, 
      unreadNotificationCount: notifications.filter(n => !n.isRead).length 
    });
  },

  markAllNotificationsRead: async () => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    await workspaceService.markAllNotificationsRead(ws.id);
    const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
    set({ notifications, unreadNotificationCount: 0 });
  }
}));

