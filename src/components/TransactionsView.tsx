import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from '../types';
import { formatCurrency, formatThaiDate, exportToCSV } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract all unique categories present in the data
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered list
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = t.note ? t.note.toLowerCase().includes(query) : false;
        const catMatch = t.category.toLowerCase().includes(query);
        const amountMatch = String(t.amount).includes(query);
        if (!noteMatch && !catMatch && !amountMatch) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Totals for the filtered results
  const { filteredIncome, filteredExpense, filteredBalance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filtered.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return {
      filteredIncome: inc,
      filteredExpense: exp,
      filteredBalance: inc - exp,
    };
  }, [filtered]);

  const handleExportCSV = () => {
    const rows = filtered.map((t) => ({
      วันที่: t.date,
      ประเภท: t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      หมวดหมู่: t.category,
      จำนวนเงิน: t.amount,
      บันทึก: t.note || '',
    }));
    exportToCSV(`รายรับรายจ่าย_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await onDeleteTransaction(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>ประวัติและรายการทั้งหมด</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              จัดการ ค้นหา และส่งออกข้อมูลรายรับรายจ่ายของคุณ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ส่งออก CSV (Excel)</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่, บันทึกช่วยจำ หรือจำนวนเงิน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-4 flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-700"
            >
              <option value="all">หมวดหมู่ทั้งหมด</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            พบทั้งหมด <span className="font-semibold text-slate-800">{filtered.length}</span> รายการ
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-medium">
              รายรับ: <span className="font-bold">+{formatCurrency(filteredIncome)}</span>
            </span>
            <span className="text-rose-700 font-medium">
              รายจ่าย: <span className="font-bold">-{formatCurrency(filteredExpense)}</span>
            </span>
            <span className="text-slate-700 font-semibold border-l border-slate-200 pl-3">
              สุทธิ: {formatCurrency(filteredBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-400 mt-1">
              ลองเปลี่ยนคำค้นหาหรือตัวกรอง หรือเพิ่มรายการใหม่
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              บันทึกรายการ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'income';
              const catDef = (isIncome ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES).find(
                (c) => c.name === tx.category
              );

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Left: Category Icon & Details */}
                  <div className="flex items-center gap-3.5">
                    <CategoryIcon
                      iconName={catDef?.icon}
                      color={catDef?.color || (isIncome ? '#10b981' : '#f43f5e')}
                      className="w-11 h-11 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{tx.category}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isIncome ? 'รายรับ' : 'รายจ่าย'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatThaiDate(tx.date)}
                        </span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 max-w-[280px] truncate">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-base font-bold ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        title="แก้ไข"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        title="ลบรายการ"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">
              ยืนยันการลบรายการนี้?
            </h3>
            <p className="text-xs text-center text-slate-500 mt-1">
              ข้อมูลนี้จะถูกลบออกจาก Firebase Firestore อย่างถาวรและไม่สามารถกู้คืนได้
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
