import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { processDocumentPipeline } from './documents/processDocument';
import { askWorkspaceAIPipeline } from './ai/rag';
import { createRazorpayOrder, verifyRazorpayPayment } from './billing/razorpay';
import { createMemberInvitation, acceptMemberInvitation } from './workspaces/invitations';

// 1. Cloud Storage Trigger on Document Upload
export const onDocumentUploaded = onObjectFinalized(
  { cpu: 1, memory: '1GiB', timeoutSeconds: 300 },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath || !filePath.includes('workspaces/')) return;

    // Pattern: workspaces/{workspaceId}/documents/{documentId}.{ext}
    const parts = filePath.split('/');
    if (parts.length >= 4 && parts[2] === 'documents') {
      const workspaceId = parts[1];
      const filename = parts[3];
      const dotIdx = filename.lastIndexOf('.');
      const documentId = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename;
      const fileType = dotIdx !== -1 ? filename.substring(dotIdx + 1).toLowerCase() : 'txt';

      console.log(`Starting automated ingestion for document ${documentId} in workspace ${workspaceId}`);
      try {
        await processDocumentPipeline({
          workspaceId,
          documentId,
          storagePath: filePath,
          fileType,
          documentName: filename,
        });
        console.log(`Successfully ingested and indexed document ${documentId}`);
      } catch (err) {
        console.error(`Failed to ingest document ${documentId}:`, err);
      }
    }
  }
);

// 2. Callable Trigger to manually re-process or retry document ingestion
export const processDocumentTask = onCall(
  { cpu: 1, memory: '1GiB', timeoutSeconds: 300 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { workspaceId, documentId, storagePath, fileType, documentName } = request.data;
    if (!workspaceId || !documentId || !storagePath) {
      throw new HttpsError('invalid-argument', 'Missing required document parameters.');
    }

    try {
      const result = await processDocumentPipeline({
        workspaceId,
        documentId,
        storagePath,
        fileType: fileType || 'txt',
        documentName: documentName || 'Document',
      });
      return { success: true, ...result };
    } catch (err: any) {
      throw new HttpsError('internal', err.message || 'Processing failed');
    }
  }
);

// 3. Callable RAG AI Query Endpoint
export const askWorkspaceAI = onCall(
  { cpu: 1, memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { workspaceId, conversationId, question, collectionId } = request.data;
    if (!workspaceId || !conversationId || !question) {
      throw new HttpsError('invalid-argument', 'Missing workspace, conversation, or question query.');
    }

    try {
      const result = await askWorkspaceAIPipeline({
        workspaceId,
        conversationId,
        question,
        userId: request.auth.uid,
        userName: request.auth.token.name || 'Member',
        collectionId,
      });
      return result;
    } catch (err: any) {
      throw new HttpsError('internal', err.message || 'RAG query failed');
    }
  }
);

// 4. Razorpay Order Creation Callable
export const createRazorpayOrderEndpoint = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { workspaceId, planId, billingCycle, amountINR } = request.data;
  if (!workspaceId || !planId || !amountINR) {
    throw new HttpsError('invalid-argument', 'Missing plan or payment details.');
  }

  try {
    const order = await createRazorpayOrder({
      workspaceId,
      planId,
      billingCycle: billingCycle || 'monthly',
      amountINR,
    });
    return order;
  } catch (err: any) {
    throw new HttpsError('internal', err.message);
  }
});

// 5. Razorpay Payment Verification Callable
export const verifyRazorpayPaymentEndpoint = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { workspaceId, orderId, paymentId, signature, planId } = request.data;
  if (!workspaceId || !orderId || !paymentId || !signature) {
    throw new HttpsError('invalid-argument', 'Missing signature verification tokens.');
  }

  try {
    const result = await verifyRazorpayPayment({
      workspaceId,
      orderId,
      paymentId,
      signature,
      planId: planId || 'pro',
    });
    return result;
  } catch (err: any) {
    throw new HttpsError('permission-denied', err.message);
  }
});

// 6. Team Invitation Callables
export const inviteWorkspaceMember = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { workspaceId, email, role } = request.data;
  if (!workspaceId || !email || !role) {
    throw new HttpsError('invalid-argument', 'Missing invitation details.');
  }

  try {
    const invitation = await createMemberInvitation({
      workspaceId,
      email,
      role,
      invitedBy: request.auth.uid,
      invitedByName: request.auth.token.name || 'Admin',
    });
    return invitation;
  } catch (err: any) {
    throw new HttpsError('permission-denied', err.message);
  }
});

export const acceptWorkspaceInvitation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { workspaceId, invitationId } = request.data;
  if (!workspaceId || !invitationId) {
    throw new HttpsError('invalid-argument', 'Missing acceptance tokens.');
  }

  try {
    const member = await acceptMemberInvitation({
      workspaceId,
      invitationId,
      userId: request.auth.uid,
      userEmail: request.auth.token.email || '',
      userName: request.auth.token.name || 'Member',
      userPhoto: request.auth.token.picture,
    });
    return member;
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message);
  }
});

