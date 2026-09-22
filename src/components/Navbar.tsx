import React from 'react';
import {
  Wallet,
  Plus,
  LogIn,
  LogOut,
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Cloud,
  CheckCircle2,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'transactions' | 'analytics' | 'auth';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Income & Expenses
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Realtime
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                ระบบจัดการรายรับรายจ่าย พร้อมกราฟสรุปยอด
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="tab-dashboard-btn"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              แดชบอร์ด
            </button>
            <button
              id="tab-transactions-btn"
              onClick={() => onTabChange('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ReceiptText className="w-4 h-4 text-blue-600" />
              รายการทั้งหมด
            </button>
            <button
              id="tab-analytics-btn"
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4 text-indigo-600" />
              กราฟวิเคราะห์
            </button>
            <button
              id="tab-auth-btn"
              onClick={() => onTabChange('auth')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'auth'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4 text-amber-600" />
              {user ? 'ข้อมูลบัญชี' : 'ล็อกอินด้วยอีเมล'}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="add-transaction-nav-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">บันทึกรายการ</span>
              <span className="sm:hidden">เพิ่ม</span>
            </button>

            {/* Auth section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => onTabChange('auth')}
                  title="ดูข้อมูลบัญชี"
                  className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน'}
                    </div>
                    <div className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                      <Cloud className="w-2.5 h-2.5" /> ซิงค์คลาวด์
                    </div>
                  </div>
                </button>
                <button
                  id="logout-btn"
                  onClick={() => logout()}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="email-login-nav-btn"
                  onClick={() => onTabChange('auth')}
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'auth'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>เข้าสู่ระบบด้วยอีเมล</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile bottom nav strip */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>แดชบอร์ด</span>
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'transactions' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>รายการ</span>
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>กราฟสถิติ</span>
          </button>
          <button
            onClick={() => onTabChange('auth')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'auth' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{user ? 'บัญชี' : 'เข้าสู่ระบบ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

