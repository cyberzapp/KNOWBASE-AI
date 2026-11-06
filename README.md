# Knowbase AI — Enterprise Knowledge Base & Document Workspace SaaS

[![React](https://img.shields.io/badge/React-18%2F19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage%20%7C%20Functions-orange.svg)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash%20%7C%20Embeddings-purple.svg)](https://ai.google.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com)

> **"Your company's knowledge, finally searchable and understandable."**

Knowbase AI is an AI-powered knowledge management and document workspace SaaS designed for startups, software agencies, HR departments, customer support teams, and enterprise businesses. 

Users upload their company documents (PDFs, DOCX, TXT, Markdown, CSV, PPTX) into isolated workspaces. The platform chunks, vectorizes, and indexes the information using Google Gemini embeddings and Cloud Firestore, allowing team members to ask natural language questions and receive **grounded answers with exact citations referencing original source documents and page numbers**.

---

## 1. Product Features

- **Grounded AI Assistant (RAG)**: Formulates answers strictly from verified document chunks. Zero hallucinations. Includes clickable source citation chips (`[1]`, `[2]`) that open the exact excerpt and page reference.
- **Document Management**: Drag-and-drop file ingestion for PDF, Word (.docx), Markdown (.md), Text (.txt), and CSV (.csv). Supports real-time pipeline status tickers (`Uploading` → `Extracting` → `Chunking` → `Embedding` → `Indexed`).
- **Knowledge Collections**: Categorize files into departmental repositories (HR Policies, Security & Compliance, Product Strategy, Customer Support).
- **Multi-Tenant Workspaces**: Complete data isolation across workspaces with strict role-based access control (Owner, Admin, Editor, Viewer).
- **Global Command Palette (`Ctrl + K`)**: Instant keyboard-driven semantic search across documents, collections, and past conversations.
- **Team Collaboration & Invitations**: Invite colleagues by email with role assignment, expiration tokens, and audit logging.
- **Analytics & Resource Meters**: Track document counts, storage consumption, questions asked, and plan limits.
- **Monetization Architecture**: Built-in pricing tiers (Free, Pro, Business) and Razorpay integration with HMAC-SHA256 signature verification.
- **Light & Dark Mode**: Professional, minimalist visual identity inspired by Linear, Notion, Raycast, and Stripe Dashboard.

---

## 2. Technology Stack & Architecture

### Frontend
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4, Inter font, custom micro-interactions
- **State Management**: Zustand + TanStack React Query
- **Routing**: React Router v6 (Public, Authenticated, and Guarded routes)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide Icons
- **Visuals**: Recharts for analytics, Framer Motion, canvas-confetti

### Backend (Firebase-First Architecture)
- **Firebase Authentication**: Email/Password, Google OAuth, Session Persistence, Email Verification
- **Cloud Firestore**:
  - `users/{userId}`: User profiles and preferences
  - `workspaces/{workspaceId}`: Workspace settings, AI model choices
  - `workspaces/{workspaceId}/members/{userId}`: RBAC membership
  - `workspaces/{workspaceId}/documents/{documentId}`: Metadata, status, summary, tokens
  - `workspaces/{workspaceId}/chunks/{chunkId}`: Vectorized chunks with embeddings and page numbers
  - `workspaces/{workspaceId}/conversations/{conversationId}/messages/{messageId}`: Chat history & citations
  - `workspaces/{workspaceId}/collections/{collectionId}`: Departmental groups
  - `workspaces/{workspaceId}/activity/{activityId}`: Audit logs
  - `workspaces/{workspaceId}/usage/{periodId}`: Monthly quotas
- **Firebase Cloud Storage**: Secure bucket storage under `workspaces/{workspaceId}/documents/` with 50MB file size limits and MIME validation.
- **Cloud Functions for Firebase (2nd Gen)**:
  - `onDocumentUploaded`: Background Storage trigger for text extraction (`pdf-parse`, `mammoth`), semantic chunking, and Gemini embeddings.
  - `askWorkspaceAI`: Secure server-side RAG retrieval and citation synthesis.
  - `processDocumentTask`: On-demand manual re-indexing callable.
  - `createRazorpayOrderEndpoint` & `verifyRazorpayPaymentEndpoint`: Server-verified payment transactions.

---

## 3. Directory Structure

```
KnowledgeBaseAI/
├── src/
│   ├── components/
│   │   ├── ui/               # Button, Input, Modal, Badge, Toast, Skeleton
│   │   ├── layout/           # AppLayout (Sidebar, Workspace Switcher, Navbar)
│   │   ├── search/           # GlobalSearchModal (Ctrl+K Command Palette)
│   │   ├── dashboard/        # Dashboard widgets and statistics
│   │   └── chat/             # Chat bubbles, citation drawer
│   ├── pages/
│   │   ├── LandingPage.tsx   # Marketing homepage
│   │   ├── PricingPage.tsx   # Subscription pricing & FAQ
│   │   ├── LoginPage.tsx     # Sign in with email & Google
│   │   ├── SignupPage.tsx    # Registration
│   │   ├── OnboardingPage.tsx# 5-step workspace setup wizard
│   │   ├── DashboardPage.tsx # Central workspace dashboard
│   │   ├── DocumentsPage.tsx # Document management & upload dropzone
│   │   ├── DocumentDetailsPage.tsx # Extracted text, chunk list, AI summary
│   │   ├── ChatPage.tsx      # Flagship 3-column AI research workspace
│   │   ├── KnowledgePage.tsx # Collections manager
│   │   ├── MembersPage.tsx   # Team collaboration & RBAC
│   │   ├── BillingPage.tsx   # Quotas & Razorpay checkout
│   │   └── WorkspaceSettingsPage.tsx # AI model & workspace configuration
│   ├── services/
│   │   └── firebase/         # Firebase SDK, Auth, Workspace, Document, RAG, Mock Store
│   ├── stores/               # Zustand state stores (useAuth, useWorkspace, useChat, useDoc)
│   ├── types/                # Strict TypeScript interfaces
│   └── utils/                # Formatters, CN helper, SafeStorage
├── functions/                # Firebase Cloud Functions (2nd Gen)
│   └── src/
│       ├── config.ts         # Firebase Admin, GoogleGenAI, Razorpay init
│       ├── ai/rag.ts         # Server-side RAG retrieval & grounded synthesis
│       ├── documents/        # Text extraction (PDF/DOCX/TXT) & vector chunking
│       ├── billing/          # Razorpay order creation & signature verification
│       └── workspaces/       # Secure invitation token lifecycle
├── firebase.json             # Hosting, Functions, Firestore, Storage configuration
├── firestore.rules           # Strict multi-tenant security rules
├── storage.rules             # File ownership & bucket security rules
├── firestore.indexes.json    # Composite query indexes
└── package.json
```

---

## 4. Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Clone & Install
```bash
git clone https://github.com/your-org/knowbase-ai.git
cd knowbase-ai

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...

# Cloud Functions Secrets
GEMINI_API_KEY=AIzaSy...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

*(Note: If you run the app without entering Firebase credentials, Knowbase AI automatically runs in its built-in reactive local engine, allowing you to test all features, uploads, collections, AI chat with citations, and billing immediately without friction).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Running Tests

Knowbase AI includes a comprehensive Vitest unit and integration test suite testing chunking, vector cosine similarity, cross-workspace isolation, role-based authorization, and subscription quota limits:

```bash
npm test
```

Sample output:
```
✓ src/__tests__/rbac.test.ts (4 tests)
✓ src/__tests__/billing.test.ts (3 tests)
✓ src/__tests__/rag.test.ts (4 tests)

Test Files  3 passed (3)
Tests       11 passed (11)
```

---

## 6. Deploying to Firebase

### 1. Build the Frontend
```bash
npm run build
```

### 2. Deploy Rules & Functions
```bash
# Set Cloud Function secrets in Google Cloud Secret Manager
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set RAZORPAY_KEY_SECRET

# Deploy all services
firebase deploy
```

---

## 7. Security Architecture

1. **Firestore Security Rules**: Only authenticated members of a specific workspace can read or query documents, chunks, or conversations in that workspace.
2. **Untrusted Content Sanitization**: Uploaded document content is strictly formatted as reference material in system prompts, neutralizing prompt injection attacks.
3. **No Frontend Secrets**: `GEMINI_API_KEY` and `RAZORPAY_KEY_SECRET` reside exclusively in Cloud Functions.
4. **Payment Integrity**: Subscriptions are never activated client-side. The server verifies HMAC-SHA256 signatures before updating Firestore quotas.

