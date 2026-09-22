/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AuthView } from './components/AuthView';
import { TransactionModal } from './components/TransactionModal';
import { Transaction, TransactionType } from './types';
import {
  subscribeUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './services/transactionService';
import { generateSampleTransactions } from './utils/sampleData';
import {
  Sparkles,
  Cloud,
  CheckCircle,
  AlertCircle,
  Layers,
  Database,
  Info,
} from 'lucide-react';

function MainApp() {
  const { user, signInWithGoogle, authError, clearAuthError } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );
  const [isImporting, setIsImporting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Switch demo mode based on auth
  useEffect(() => {
    if (user) {
      setIsDemoMode(false);
      setLoadingTransactions(true);

      // Subscribe to real-time updates from Firestore
      const unsubscribe = subscribeUserTransactions(
        user.uid,
        (data) => {
          setTransactions(data);
          setLoadingTransactions(false);
        },
        (error) => {
          console.error('Realtime subscription error:', error);
          setLoadingTransactions(false);
          showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Firestore', 'error');
        }
      );

      return () => unsubscribe();
    } else {
      setIsDemoMode(true);
      // Load initial demo transactions for immediate visual experience
      setTransactions(generateSampleTransactions('demo_user'));
      setLoadingTransactions(false);
    }
  }, [user]);

  // Handle Create or Update
  const handleSaveTransaction = async (dto: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => {
    if (user && !isDemoMode) {
      if (editingTransaction) {
        await updateTransaction(user.uid, editingTransaction.id, dto);
        showToast('แก้ไขรายการสำเร็จ');
      } else {
        await createTransaction(user.uid, dto);
        showToast('บันทึกรายการสำเร็จ ข้อมูลซิงค์เรียลไทม์แล้ว');
      }
    } else {
      // Demo mode local update
      if (editingTransaction) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === editingTransaction.id
              ? {
                  ...t,
                  ...dto,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
        showToast('แก้ไขรายการในโหมดสาธิตแล้ว');
      } else {
        const newTx: Transaction = {
          id: `demo-${Date.now()}`,
          userId: 'demo_user',
          ...dto,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newTx, ...prev]);
        showToast('บันทึกรายการในโหมดสาธิตแล้ว');
      }
    }
    setEditingTransaction(null);
  };

  // Handle Delete
  const handleDeleteTransaction = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteTransaction(user.uid, id);
      showToast('ลบรายการออกจาก Firestore เรียบร้อยแล้ว');
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('ลบรายการในโหมดสาธิตแล้ว');
    }
  };

  // Import starter sample data into real Firestore for the logged-in user
  const handleImportSampleData = async () => {
    if (!user) return;
    setIsImporting(true);
    try {
      const samples = generateSampleTransactions(user.uid);
      for (const sample of samples) {
        await createTransaction(user.uid, {
          type: sample.type,
          amount: sample.amount,
          category: sample.category,
          date: sample.date,
          note: sample.note,
        });
      }
      showToast('นำเข้าข้อมูลตัวอย่างเริ่มต้นเข้า Firestore สำเร็จ');
    } catch (err) {
      console.error('Failed to import starter data:', err);
      showToast('เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />

      {/* Auth Error Banner */}
      {authError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearAuthError}
              className="text-rose-600 hover:text-rose-900 font-semibold underline cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Guest / Demo Notice Banner */}
      {!user && activeTab !== 'auth' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 animate-pulse" />
              <span>
                <strong>โหมดแสดงตัวอย่าง (Demo Preview):</strong> เชื่อมต่อ Firebase Firestore เรียบร้อยแล้ว
                เข้าสู่ระบบด้วยอีเมลเพื่อบันทึกข้อมูลส่วนตัวแบบเรียลไทม์
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('auth')}
                className="bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-lg font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>เข้าสู่ระบบด้วยอีเมล</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Database Prompt for Logged-In User */}
      {user && !loadingTransactions && transactions.length === 0 && activeTab !== 'auth' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  ฐานข้อมูล Firestore ส่วนตัวของคุณพร้อมใช้งานแล้ว
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  ยังไม่มีข้อมูลรายรับรายจ่ายในระบบ คุณสามารถเริ่มบันทึกรายการแรก หรือนำเข้าข้อมูลเริ่มต้น
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleImportSampleData}
                disabled={isImporting}
                className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูลตัวอย่าง'}
              </button>
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
              >
                + บันทึกรายการแรก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingTransactions ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-700">
              กำลังเชื่อมต่อฐานข้อมูล Firestore เรียลไทม์...
            </p>
            <p className="text-xs text-slate-400 mt-1">กรุณารอสักครู่</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                transactions={transactions}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                onSelectTransactionTab={() => setActiveTab('transactions')}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                onEditTransaction={(tx) => {
                  setEditingTransaction(tx);
                  setIsAddModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView transactions={transactions} />
            )}

            {activeTab === 'auth' && (
              <AuthView onSuccessNavigate={() => setActiveTab('dashboard')} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Income and Expenses</span>
            <span>•</span>
            <span>Firebase Firestore Realtime Storage</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              พร้อมซิงค์ข้อมูลเรียลไทม์
            </span>
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
