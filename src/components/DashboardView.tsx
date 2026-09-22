import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Plus,
  Receipt,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Transaction, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onSelectTransactionTab: () => void;
}

type PeriodFilter = 'this_month' | 'last_30_days' | 'this_year' | 'all';

const EXPENSE_COLOR_PALETTE = [
  '#f43f5e',
  '#fb923c',
  '#eab308',
  '#ec4899',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#a855f7',
  '#ef4444',
  '#64748b',
];

const INCOME_COLOR_PALETTE = [
  '#10b981',
  '#059669',
  '#34d399',
  '#14b8a6',
  '#06b6d4',
  '#6366f1',
  '#8b5cf6',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onOpenAddModal,
  onSelectTransactionTab,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('this_month');

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((item) => {
      if (period === 'all') return true;
      if (!item.date) return false;

      const [y, m, d] = item.date.split('-').map(Number);
      const itemDate = new Date(y, m - 1, d);

      if (period === 'this_month') {
        return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
      }
      if (period === 'last_30_days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return itemDate >= thirtyDaysAgo && itemDate <= now;
      }
      if (period === 'this_year') {
        return itemDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [transactions, period]);

  // Calculations
  const { totalIncome, totalExpense, balance, savingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
      } else if (t.type === 'expense') {
        expense += t.amount;
      }
    });

    const bal = income - expense;
    const rate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: bal,
      savingsRate: rate,
    };
  }, [filteredTransactions]);

  // Expenses grouped by Category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value], index) => {
        const defaultCat = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.name === name);
        return {
          name,
          value,
          color: defaultCat?.color || EXPENSE_COLOR_PALETTE[index % EXPENSE_COLOR_PALETTE.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Incomes grouped by Category
  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value], index) => {
        const defaultCat = DEFAULT_INCOME_CATEGORIES.find((c) => c.name === name);
        return {
          name,
          value,
          color: defaultCat?.color || INCOME_COLOR_PALETTE[index % INCOME_COLOR_PALETTE.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Daily or Timeline trend for BarChart
  const timelineData = useMemo(() => {
    const dateMap: Record<string, { date: string; income: number; expense: number }> = {};

    filteredTransactions.forEach((t) => {
      if (!t.date) return;
      if (!dateMap[t.date]) {
        dateMap[t.date] = { date: t.date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dateMap[t.date].income += t.amount;
      } else {
        dateMap[t.date].expense += t.amount;
      }
    });

    const sorted = Object.values(dateMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Limit to latest 14 entries if too many dates
    return sorted.slice(-14).map((d) => ({
      ...d,
      formattedDate: formatThaiDate(d.date),
    }));
  }, [filteredTransactions]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const spentPercentage = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Filter & Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>แดชบอร์ดสรุปยอดภาพรวม</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              Live Firestore
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            วิเคราะห์แนวโน้มรายรับ-รายจ่าย บันทึกและคำนวณแบบเรียลไทม์
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'this_month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เดือนนี้
          </button>
          <button
            onClick={() => setPeriod('last_30_days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'last_30_days'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 วันล่าสุด
          </button>
          <button
            onClick={() => setPeriod('this_year')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'this_year'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ปีนี้
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Net Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ยอดคงเหลือสุทธิ
            </span>
            <div
              className={`p-2 rounded-xl ${
                balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl lg:text-3xl font-bold tracking-tight ${
                balance >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(balance)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  balance >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {balance >= 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" /> คงเหลือบวก
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" /> ติดลบ
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500">
                {totalIncome > 0 ? `ออมได้ ${savingsRate}%` : 'ยังไม่มีรายรับ'}
              </span>
            </div>
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${
              balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              รายรับรวม
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>
                {filteredTransactions.filter((t) => t.type === 'income').length} รายการ
              </span>
              {incomeByCategory.length > 0 && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[140px]">
                    สูงสุด: {incomeByCategory[0].name}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              รายจ่ายรวม
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-rose-600">
              {formatCurrency(totalExpense)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>
                {filteredTransactions.filter((t) => t.type === 'expense').length} รายการ
              </span>
              {expenseByCategory.length > 0 && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[140px]">
                    มากสุด: {expenseByCategory[0].name}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>
      </div>

      {/* Spending Health Progress Bar */}
      {totalIncome > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-semibold">สัดส่วนการใช้จ่ายต่อรายรับ:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold ${
                  spentPercentage > 90
                    ? 'bg-rose-100 text-rose-800'
                    : spentPercentage > 70
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {spentPercentage}%
              </span>
            </div>
            <span className="text-slate-500">
              {spentPercentage > 100
                ? 'ใช้จ่ายเกินรายรับ!'
                : `คงเหลือออมได้ ${100 - spentPercentage}%`}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                spentPercentage > 90
                  ? 'bg-rose-500'
                  : spentPercentage > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, spentPercentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Bar Chart: Income vs Expense */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                เปรียบเทียบรายรับและรายจ่าย
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบยอดตามช่วงเวลาในรายการล่าสุด
              </p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {timelineData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <BarChart3 className="w-10 h-10 stroke-1" />
                <p className="text-xs">ยังไม่มีข้อมูลรายการในช่วงเวลานี้</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `฿${val.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown, name: unknown) => [
                      formatCurrency(Number(val) || 0),
                      String(name) === 'income' ? 'รายรับ' : 'รายจ่าย',
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(val) => (val === 'income' ? 'รายรับ' : 'รายจ่าย')}
                  />
                  <Bar
                    dataKey="income"
                    name="income"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="expense"
                    name="expense"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-rose-500" />
                สัดส่วนรายจ่าย
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">แบ่งตามหมวดหมู่</p>
            </div>
          </div>

          <div className="h-56 w-full relative">
            {expenseByCategory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <PieChartIcon className="w-10 h-10 stroke-1" />
                <p className="text-xs">ยังไม่มีรายการรายจ่าย</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'ยอดรวม']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Categories List */}
          <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
            {expenseByCategory.slice(0, 4).map((cat) => {
              const percent =
                totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(cat.value)}
                    </span>
                    <span className="text-slate-400 w-8 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Income Category Donut Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Sources Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                แหล่งที่มาของรายรับ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">แบ่งตามประเภทรายได้</p>
            </div>
          </div>

          <div className="h-56 w-full relative">
            {incomeByCategory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <PieChartIcon className="w-10 h-10 stroke-1" />
                <p className="text-xs">ยังไม่มีรายการรายรับ</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell key={`income-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'ยอดรวม']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Income categories list */}
          <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
            {incomeByCategory.slice(0, 4).map((cat) => {
              const percent =
                totalIncome > 0 ? Math.round((cat.value / totalIncome) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(cat.value)}
                    </span>
                    <span className="text-slate-400 w-8 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                รายการล่าสุด
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">5 รายการบันทึกล่าสุด</p>
            </div>
            <button
              onClick={onSelectTransactionTab}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-60" />
                <p className="text-sm font-medium">ยังไม่มีรายการบันทึก</p>
                <button
                  onClick={onOpenAddModal}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มรายการแรก
                </button>
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const catDef = (isIncome ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES).find(
                  (c) => c.name === tx.category
                );

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        iconName={catDef?.icon}
                        color={catDef?.color || (isIncome ? '#10b981' : '#f43f5e')}
                        className="w-10 h-10"
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {tx.category}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{formatThaiDate(tx.date)}</span>
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[180px]">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </div>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {isIncome ? 'รายรับ' : 'รายจ่าย'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
