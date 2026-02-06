
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile, SkillLevel } from "../types";

// Helper to prevent infinite loading if Firestore is blocked
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
};

export const authService = {
  // --- Standard Email/Password Auth ---
  
  signUp: async (email: string, password: string, name: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await sendEmailVerification(auth.currentUser);
      }
      return userCredential.user;
    } catch (error: any) {
      console.error("Sign Up Error:", error);
      throw error;
    }
  },

  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Sign In Error:", error);
      throw error;
    }
  },

  // --- Google Auth ---
  signInWithGoogle: async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        console.error(`FIREBASE CONFIG ERROR: The domain "${window.location.hostname}" is not authorized.`);
        console.error(`ACTION REQUIRED: Go to Firebase Console > Authentication > Settings > Authorized Domains and add: ${window.location.hostname}`);
      }
      console.error("Google Auth Error:", error);
      throw error;
    }
  },

  // --- Password Management ---
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  },

  resendVerification: async (user: User) => {
    if (user) {
        await sendEmailVerification(user);
    }
  },

  logout: async () => {
      await signOut(auth);
  },

  // --- Profile Management ---
  
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    return withTimeout(
      (async () => {
        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              return docSnap.data() as UserProfile;
          }
          return null;
        } catch (error: any) {
          console.warn("Firestore access failed. Using basic Auth profile.");
          return null; 
        }
      })(),
      3000, 
      null
    );
  },

  saveUserProfile: async (user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> => {
    const userData: UserProfile = {
      id: user.uid,
      name: additionalData?.name || user.displayName || 'Builder',
      email: user.email || null,
      phoneNumber: user.phoneNumber || null,
      country: additionalData?.country || 'Unknown',
      skillLevel: additionalData?.skillLevel || SkillLevel.BEGINNER,
      joinedDate: new Date().toISOString(),
      color: additionalData?.color || 'bg-blue-600',
      ...additionalData
    };

    try {
      await withTimeout(
          setDoc(doc(db, "users", user.uid), userData, { merge: true }),
          3000,
          null
      );
    } catch (error) {
      console.error("Error saving profile to Firestore:", error);
    }
    
    return userData;
  }
};
