import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { UserProfile } from '@/types';
import { safeStorage } from '@/utils/safeStorage';

const LOCAL_USER_KEY = 'knowbase_active_user';

export const authService = {
  // Listen to auth state
  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    if (!isFirebaseConfigured || !auth) {
      // Local fallback
      const saved = safeStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        try {
          callback(JSON.parse(saved));
        } catch {
          callback(null);
        }
      } else {
        // Return default demo user
        const demoUser: UserProfile = {
          id: 'user_default',
          email: 'alex@acme.ai',
          displayName: 'Alex Morgan',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentWorkspaceId: 'ws_demo_enterprise',
          themePreference: 'light'
        };
        safeStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
        callback(demoUser);
      }
      return () => {};
    }

    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        callback(null);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          callback(userDocSnap.data() as UserProfile);
        } else {
          // Create initial user doc
          const newProfile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
            photoURL: fbUser.photoURL || undefined,
            emailVerified: fbUser.emailVerified,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            themePreference: 'light',
          };
          await setDoc(userDocRef, newProfile);
          callback(newProfile);
        }
      } catch (err) {
        console.error('Error fetching user profile from Firestore:', err);
        // Fallback user object
        callback({
          id: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Member',
          photoURL: fbUser.photoURL || undefined,
          emailVerified: fbUser.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  },

  async login(email: string, pass: string): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth) {
      const demoUser: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentWorkspaceId: 'ws_demo_enterprise',
        themePreference: 'light',
      };
      safeStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    const profile: UserProfile = {
      id: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || email.split('@')[0],
      emailVerified: cred.user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, profile);
    return profile;
  },

  async signup(email: string, pass: string, fullName: string): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth) {
      const newUser: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: fullName,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        themePreference: 'light',
      };
      safeStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      return newUser;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Could not send email verification automatically:', e);
      }
    }

    const profile: UserProfile = {
      id: cred.user.uid,
      email,
      displayName: fullName,
      emailVerified: cred.user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth) {
      const googleUser: UserProfile = {
        id: 'user_google_' + Math.random().toString(36).substring(2, 9),
        email: 'founder@startup.io',
        displayName: 'Startup Founder',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentWorkspaceId: 'ws_demo_enterprise',
        themePreference: 'light',
      };
      safeStorage.setItem(LOCAL_USER_KEY, JSON.stringify(googleUser));
      return googleUser;
    }

    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const profile: UserProfile = {
      id: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || 'Google User',
      photoURL: cred.user.photoURL || undefined,
      emailVerified: cred.user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, profile);
    return profile;
  },

  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      return;
    }
    await sendPasswordResetEmail(auth, email);
  },

  async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    safeStorage.removeItem(LOCAL_USER_KEY);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } else {
      const saved = safeStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        const updated = { ...u, ...updates, updatedAt: new Date().toISOString() };
        safeStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
    }
  }
};
