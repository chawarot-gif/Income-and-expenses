import React, { useMemo } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
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

interface AnalyticsViewProps {
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions }) => {
  // Category Breakdown for expenses
  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
        total += t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => {
        const catDef = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.name === name);
        return {
          name,
          value,
          color: catDef?.color || '#f43f5e',
          percent: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Category Breakdown for income
  const incomeCategories = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
        total += t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => {
        const catDef = DEFAULT_INCOME_CATEGORIES.find((c) => c.name === name);
        return {
          name,
          value,
          color: catDef?.color || '#10b981',
          percent: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Cumulative Net Balance over time
  const cumulativeData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Group by date
    const dateMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      if (!t.date) return;
      if (!dateMap[t.date]) {
        dateMap[t.date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dateMap[t.date].income += t.amount;
      } else {
        dateMap[t.date].expense += t.amount;
      }
    });

    const sortedDates = Object.keys(dateMap).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    let runningBalance = 0;
    return sortedDates.map((date) => {
      const day = dateMap[date];
      runningBalance += day.income - day.expense;
      return {
        date,
        formattedDate: formatThaiDate(date),
        cumulativeBalance: runningBalance,
        dailyNet: day.income - day.expense,
      };
    });
  }, [transactions]);

  // Key metrics
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    const net = income - expense;
    const avgExpensePerDay =
      transactions.length > 0 ? expense / Math.max(1, new Set(transactions.map((t) => t.date)).size) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: net,
      avgDailyExpense: avgExpensePerDay,
      topExpenseCategory: expenseCategories[0] || null,
      topIncomeCategory: incomeCategories[0] || null,
    };
  }, [transactions, expenseCategories, incomeCategories]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>วิเคราะห์กราฟและสถิติการเงิน</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          มุมมองเชิงลึกเพื่อช่วยในการวางแผนและควบคุมค่าใช้จ่าย
        </p>
      </div>

      {/* 4 Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>ยอดใช้จ่ายเฉลี่ยต่อวัน</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(stats.avgDailyExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">คำนวณจากวันที่บันทึก</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Award className="w-4 h-4 text-rose-500" />
            <span>หมวดหมู่ที่จ่ายมากที่สุด</span>
          </div>
          <div className="text-xl font-bold text-rose-600 truncate">
            {stats.topExpenseCategory ? stats.topExpenseCategory.name : '-'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.topExpenseCategory
              ? `${formatCurrency(stats.topExpenseCategory.value)} (${stats.topExpenseCategory.percent}%)`
              : 'ยังไม่มีข้อมูล'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>หมวดหมู่รายรับหลัก</span>
          </div>
          <div className="text-xl font-bold text-emerald-600 truncate">
            {stats.topIncomeCategory ? stats.topIncomeCategory.name : '-'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.topIncomeCategory
              ? `${formatCurrency(stats.topIncomeCategory.value)} (${stats.topIncomeCategory.percent}%)`
              : 'ยังไม่มีข้อมูล'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <DollarSign className="w-4 h-4 text-teal-500" />
            <span>อัตราส่วนรายรับต่อรายจ่าย</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {stats.totalExpense > 0
              ? `${(stats.totalIncome / stats.totalExpense).toFixed(2)}x`
              : stats.totalIncome > 0
              ? 'ไม่จำกัด'
              : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.totalIncome >= stats.totalExpense ? 'อยู่ในเกณฑ์ดี' : 'รายจ่ายสูงกว่ารายรับ'}
          </div>
        </div>
      </div>

      {/* Cumulative Balance Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            กราฟการเติบโตของยอดเงินคงเหลือสะสม
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดงการเปลี่ยนแปลงของเงินคงเหลือสุทธิสะสมตามวัน
          </p>
        </div>

        <div className="h-72 w-full">
          {cumulativeData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <TrendingUp className="w-10 h-10 stroke-1" />
              <p className="text-xs">ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟสะสม</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'ยอดสะสม']}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeBalance"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Categories Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Detailed Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
              การกระจายตัวของรายจ่าย
            </h2>
            <span className="text-xs font-semibold text-rose-600">
              {formatCurrency(stats.totalExpense)}
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {expenseCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีข้อมูลรายจ่าย</p>
            ) : (
              expenseCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                      <span className="text-slate-400 w-10 text-right">{cat.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: cat.color,
                        width: `${cat.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Income Categories Detailed Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              การกระจายตัวของรายรับ
            </h2>
            <span className="text-xs font-semibold text-emerald-600">
              {formatCurrency(stats.totalIncome)}
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {incomeCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีข้อมูลรายรับ</p>
            ) : (
              incomeCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                      <span className="text-slate-400 w-10 text-right">{cat.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: cat.color,
                        width: `${cat.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
