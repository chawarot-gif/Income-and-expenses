import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onSuccessNavigate?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessNavigate }) => {
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    logout,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalMessage(null);

    if (!email.trim()) {
      setLocalMessage({ text: 'กรุณากรอกอีเมล', type: 'error' });
      return;
    }

    if (mode === 'reset') {
      setIsLoading(true);
      try {
        await sendPasswordReset(email.trim());
        setLocalMessage({
          text: `ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${email} แล้ว กรุณาตรวจสอบในกล่องจดหมายของคุณ`,
          type: 'success',
        });
      } catch (err) {
        // AuthContext sets authError
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setLocalMessage({ text: 'กรุณากรอกรหัสผ่าน', type: 'error' });
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setLocalMessage({ text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', type: 'error' });
        return;
      }
      if (password !== confirmPassword) {
        setLocalMessage({ text: 'รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', type: 'error' });
        return;
      }

      setIsLoading(true);
      try {
        await signUpWithEmail(email, password, displayName);
        setLocalMessage({ text: 'สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...', type: 'success' });
        if (onSuccessNavigate) onSuccessNavigate();
      } catch (err) {
        // handled in context
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login mode
      setIsLoading(true);
      try {
        await signInWithEmail(email, password);
        if (onSuccessNavigate) onSuccessNavigate();
      } catch (err) {
        // handled in context
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    clearAuthError();
    setLocalMessage(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccessNavigate) onSuccessNavigate();
    } catch (err) {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, show user profile overview
  if (user) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-xs ring-4 ring-emerald-50">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                (user.displayName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {user.displayName || 'ผู้ใช้งาน'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 mt-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบเรียบร้อยแล้ว (Firebase Auth)</span>
            </div>
          </div>

          <div className="py-6 space-y-3">
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
              <span className="text-slate-500">UID (รหัสผู้ใช้):</span>
              <span className="font-mono text-slate-700 max-w-[220px] truncate">{user.uid}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
              <span className="text-slate-500">ผู้ให้บริการล็อกอิน:</span>
              <span className="font-semibold text-slate-700">
                {user.providerData[0]?.providerId === 'password'
                  ? 'อีเมลและรหัสผ่าน (Email/Password)'
                  : user.providerData[0]?.providerId === 'google.com'
                  ? 'Google Account'
                  : 'Firebase Provider'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="text-slate-500">สถานะฐานข้อมูล Firestore:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> ซิงค์เรียลไทม์
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onSuccessNavigate && onSuccessNavigate()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>ไปยังแดชบอร์ดรายรับรายจ่าย</span>
            </button>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {mode === 'login'
              ? 'เข้าสู่ระบบด้วยอีเมล'
              : mode === 'signup'
              ? 'สมัครสมาชิกใหม่'
              : 'รีเซ็ตรหัสผ่าน'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานบัญชีของคุณ'
              : mode === 'signup'
              ? 'สร้างบัญชีเพื่อบันทึกรายรับรายจ่ายของคุณบนคลาวด์'
              : 'ระบุอีเมลที่ใช้ลงทะเบียนเพื่อรับลิงก์ตั้งรหัสผ่านใหม่'}
          </p>
        </div>

        {/* Tab switch between Login and Signup */}
        {mode !== 'reset' && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearAuthError();
                setLocalMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearAuthError();
                setLocalMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Alerts & Messages */}
        {(authError || (localMessage && localMessage.type === 'error')) && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{localMessage?.text || authError}</span>
              {(authError?.includes('Firebase Console') || authError?.includes('operation-not-allowed')) && (
                <div className="mt-1 text-[11px] text-rose-700 bg-white/60 p-2 rounded-lg border border-rose-200">
                  💡 <strong>คำแนะนำ:</strong> ในหน้าต่าง Firebase Console ไปที่เมนู <strong>Authentication &gt; Sign-in method &gt; Email/Password</strong> แล้วกดเลือก <strong>Enable</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {localMessage && localMessage.type === 'success' && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{localMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (Only in signup mode) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อหรือชื่อเรียก (ระบุหรือไม่ก็ได้)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="เช่น สมชาย, มานี"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ที่อยู่อีเมล <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Password input (not in reset mode) */}
          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      clearAuthError();
                      setLocalMessage(null);
                    }}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Only in signup mode) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วยอีเมล</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>สร้างบัญชีผู้ใช้งาน</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>ส่งอีเมลรีเซ็ตรหัสผ่าน</span>
              </>
            )}
          </button>

          {/* Back button when in reset mode */}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearAuthError();
                setLocalMessage(null);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          )}
        </form>

        {/* Social / Alternative Divider */}
        {mode !== 'reset' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">หรือ</span>
              </div>
            </div>

            {/* Google Sign In Option */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </>
        )}

        {/* Demo Mode Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onSuccessNavigate && onSuccessNavigate()}
            className="text-xs text-slate-500 hover:text-emerald-600 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>ทดลองใช้งานในโหมดสาธิต (Demo)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Security info footer */}
      <div className="mt-6 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ข้อมูลปลอดภัยด้วย Firebase Authentication & Firestore Rules</span>
        </p>
      </div>
    </div>
  );
};
