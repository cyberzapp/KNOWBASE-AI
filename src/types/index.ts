export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type DocumentStatus = 
  | 'uploading' 
  | 'uploaded' 
  | 'queued' 
  | 'extracting' 
  | 'chunking' 
  | 'embedding' 
  | 'indexed' 
  | 'failed';

export type FileType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'pptx';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  currentWorkspaceId?: string;
  themePreference?: 'light' | 'dark' | 'system';
}

export interface WorkspaceSettings {
  defaultCollectionId?: string;
  allowPublicSharing: boolean;
  aiModel: 'gemini-3.8-flash' | 'gemini-3.5-flash-lite';
  retrievalLimit: number;
  similarityThreshold: number;
  autoSummarizeNewDocs: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoURL?: string;
  organizationType: string;
  teamSize: string;
  mainPurpose: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  email: string;
  displayName: string;
  photoURL?: string;
  joinedAt: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface Collection {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DocumentItem {
  id: string;
  workspaceId: string;
  collectionId?: string | null;
  name: string;
  originalName: string;
  fileType: FileType;
  fileSize: number;
  storagePath: string;
  downloadURL?: string;
  status: DocumentStatus;
  errorMessage?: string;
  chunkCount: number;
  tokenCount: number;
  summary?: string;
  keyTopics?: string[];
  suggestedQuestions?: string[];
  extractedTextPreview?: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  workspaceId: string;
  chunkIndex: number;
  text: string;
  pageNumber?: number;
  sectionHeading?: string;
  tokenCount: number;
  embedding?: number[];
  createdAt: string;
}

export interface Citation {
  documentId: string;
  documentName: string;
  chunkId: string;
  pageNumber?: number;
  sectionHeading?: string;
  excerpt: string;
  relevanceScore: number;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  title: string;
  collectionId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastMessagePreview?: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  workspaceId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  createdAt: string;
  isHelpful?: boolean | null;
  model?: string;
  error?: boolean;
}

export interface ActivityItem {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  action: 
    | 'document_uploaded'
    | 'document_indexed'
    | 'document_deleted'
    | 'collection_created'
    | 'member_invited'
    | 'member_joined'
    | 'role_updated'
    | 'chat_asked'
    | 'settings_updated';
  details: string;
  targetId?: string;
  targetType?: 'document' | 'collection' | 'user' | 'conversation' | 'workspace';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export type SubscriptionPlanId = 'free' | 'pro' | 'business';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  priceMonthlyINR: number;
  priceAnnualINR: number;
  documentLimit: number;
  storageLimitMB: number;
  questionsPerMonth: number;
  teamMembersLimit: number;
  features: string[];
}

export interface WorkspaceUsage {
  workspaceId: string;
  periodId: string; // format YYYY-MM
  documentsCount: number;
  documentsLimit: number;
  storageBytes: number;
  storageLimitBytes: number;
  questionsAsked: number;
  questionsLimit: number;
  plan: SubscriptionPlanId;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  razorpaySubscriptionId?: string;
  currentPeriodEnd?: string;
  updatedAt: string;
}

export interface RazorpayOrderPayload {
  orderId: string;
  amount: number;
  currency: string;
  planId: SubscriptionPlanId;
  keyId: string;
}

