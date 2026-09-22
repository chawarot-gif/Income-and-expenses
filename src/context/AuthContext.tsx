import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthError(error: unknown): string {
  if (!(error instanceof Error)) return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

  const errStr = error.message;
  if (errStr.includes('popup-closed-by-user')) {
    return 'หน้าต่างเข้าสู่ระบบถูกปิด กรุณาลองใหม่อีกครั้ง';
  }
  if (errStr.includes('popup-blocked')) {
    return 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับหน้านี้';
  }
  if (errStr.includes('user-not-found')) {
    return 'ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกใหม่';
  }
  if (errStr.includes('wrong-password') || errStr.includes('invalid-credential')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
  }
  if (errStr.includes('email-already-in-use')) {
    return 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยอีเมลนี้';
  }
  if (errStr.includes('weak-password')) {
    return 'รหัสผ่านสั้นเกินไป ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  if (errStr.includes('invalid-email')) {
    return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
  }
  if (errStr.includes('operation-not-allowed')) {
    return 'ยังไม่ได้เปิดใช้งาน Email/Password ใน Firebase Console (Authentication > Sign-in method > Email/Password)';
  }
  if (errStr.includes('too-many-requests')) {
    return 'มีความพยายามเข้าใช้งานหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่';
  }
  return error.message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error('Google login error:', error);
      setAuthError(mapAuthError(error));
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error: unknown) {
      console.error('Email login error:', error);
      const msg = mapAuthError(error);
      setAuthError(msg);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName && displayName.trim() && cred.user) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
    } catch (error: unknown) {
      console.error('Email sign up error:', error);
      const msg = mapAuthError(error);
      setAuthError(msg);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      const msg = mapAuthError(error);
      setAuthError(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

