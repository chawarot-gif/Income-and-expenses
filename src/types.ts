import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface CategoryItem {
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
  { name: 'เงินเดือน', icon: 'Briefcase', color: '#10b981' },
  { name: 'ธุรกิจ/ค้าขาย', icon: 'Store', color: '#059669' },
  { name: 'โบนัส/ค่าคอม', icon: 'Award', color: '#34d399' },
  { name: 'การลงทุน/ปันผล', icon: 'TrendingUp', color: '#14b8a6' },
  { name: 'รายได้เสริม', icon: 'Zap', color: '#06b6d4' },
  { name: 'ของขวัญ/รางวัล', icon: 'Gift', color: '#6366f1' },
  { name: 'รายรับอื่นๆ', icon: 'PlusCircle', color: '#8b5cf6' },
];

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { name: 'อาหารและเครื่องดื่ม', icon: 'Utensils', color: '#f43f5e' },
  { name: 'การเดินทาง/น้ำมัน', icon: 'Car', color: '#fb923c' },
  { name: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ', icon: 'Home', color: '#eab308' },
  { name: 'ช้อปปิ้ง/ของใช้', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'สุขภาพ/ยา', icon: 'HeartPulse', color: '#06b6d4' },
  { name: 'การศึกษา', icon: 'GraduationCap', color: '#3b82f6' },
  { name: 'บันเทิง/สังสรรค์', icon: 'Film', color: '#8b5cf6' },
  { name: 'ครอบครัว/พ่อแม่', icon: 'Users', color: '#a855f7' },
  { name: 'หนี้สิน/สินเชื่อ', icon: 'CreditCard', color: '#ef4444' },
  { name: 'รายจ่ายอื่นๆ', icon: 'MoreHorizontal', color: '#64748b' },
];

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}
