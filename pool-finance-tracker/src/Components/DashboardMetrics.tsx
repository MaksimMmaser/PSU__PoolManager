import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, Tooltip
} from 'recharts';
import { Plus, UserPlus, FileText, Loader2 } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

interface IncomeItem {
  name: string;
  value: number;
  amount: number;
}

interface MemberItem {
  name: string;
  value: number;
  count: number;
}

interface DailyItem {
  day: string;
  amount: number;
}

interface DashboardSummary {
  totalRevenue: number;
  weeklyRevenue: number;
  incomeStructure: IncomeItem[];
  totalMembers: number;
  memberCategories: MemberItem[];
  dailyRevenue: DailyItem[];
}

// Цвета для услуг
const SERVICE_COLORS = ['#1e40af', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8'];
// Цвета для категорий клиентов
const MEMBER_COLORS: Record<string, string> = {
  'Students PGU': '#1e40af',
  'Staff PGU': '#0284c7',
  'External': '#94a3b8',
};

export const DashboardMetrics: React.FC = () => {
  const { openModal, transactions } = useTransactions();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Запрашиваем агрегированную аналитику из C#
  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:5205/api/dashboard/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки дашборда:', err);
    } finally {
      setLoading(false);
    }
  };

  // Пересчитываем аналитику при первой загрузке И при каждом добавлении новой транзакции!
  useEffect(() => {
    fetchSummary();
  }, [transactions.length]);

  if (loading && !summary) {
    return (
      <div className="h-64 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        <span>Загрузка финансовой аналитики...</span>
      </div>
    );
  }

  // Данные по умолчанию, если база пока пуста
  const totalRev = summary?.totalRevenue ?? 0;
  const weeklyRev = summary?.weeklyRevenue ?? 0;
  const totalMemb = summary?.totalMembers ?? 0;
  const incomeList = summary?.incomeStructure?.length ? summary.incomeStructure : [{ name: 'Нет данных', value: 100, amount: 0 }];
  const memberList = summary?.memberCategories?.length ? summary.memberCategories : [{ name: 'External', value: 100, count: 0 }];
  const dailyList = summary?.dailyRevenue?.length ? summary.dailyRevenue : [];

  // График тренда (спарклайн) на основе дневных доходов
  const trendData = dailyList.map(d => ({ val: d.amount }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
      
      {/* КАРТОЧКА 1: Monthly Revenue */}
      <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div>
          <span className="text-sm font-medium text-slate-500">Total Revenue</span>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">
              €{totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Live from PostgreSQL
            </span>
          </div>

          {/* Спарклайн */}
          <div className="h-14 -mx-5 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length ? trendData : [{ val: 10 }, { val: 25 }, { val: 40 }]}>
                <defs>
                  <linearGradient id="liveRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  fill="url(#liveRevGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Структура дохода */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 block mb-3">
            Income Structure (by Service)
          </span>
          <div className="flex items-center justify-between gap-4">
            <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
              <PieChart width={96} height={96}>
                <Pie
                  data={incomeList}
                  cx={43}
                  cy={43}
                  innerRadius={24}
                  outerRadius={44}
                  dataKey="value"
                  stroke="none"
                >
                  {incomeList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div className="flex-1 space-y-1.5 text-xs max-h-24 overflow-y-auto pr-1">
              {incomeList.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: SERVICE_COLORS[idx % SERVICE_COLORS.length] }} 
                    />
                    <span className="text-slate-600 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* КАРТОЧКА 2: Transaction Volume */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
        <div>
          <span className="text-sm font-medium text-slate-500">Transaction Volume</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">
              €{weeklyRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">Last 7 days</span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Daily Revenue
            </span>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyList} barSize={10}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    formatter={(val: any) => [`€${Number(val).toFixed(2)}`, 'Выручка']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="amount" fill="#0284c7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Popular Services Progress */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 block mb-2.5">
            Top Categories
          </span>
          <div className="space-y-2">
            {incomeList.slice(0, 3).map((item, idx) => (
              <div key={item.name}>
                <div className="flex justify-between text-[11px] mb-1 text-slate-600">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="font-medium text-slate-700">€{item.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.max(item.value, 8)}%`,
                      backgroundColor: SERVICE_COLORS[idx % SERVICE_COLORS.length]
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* КАРТОЧКА 3: Active Members */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
        <div>
          <span className="text-sm font-medium text-slate-500">Active Members</span>
          <div className="mt-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">{totalMemb}</span>
          </div>

          <div className="mt-5">
            <span className="text-xs font-semibold text-slate-600 block mb-3">
              Member Categories
            </span>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
                <PieChart width={96} height={96}>
                  <Pie
                    data={memberList}
                    cx={43}
                    cy={43}
                    innerRadius={24}
                    outerRadius={44}
                    dataKey="value"
                    stroke="none"
                  >
                    {memberList.map((entry) => (
                      <Cell key={entry.name} fill={MEMBER_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {memberList.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: MEMBER_COLORS[item.name] || '#64748b' }} 
                      />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* КАРТОЧКА 4: Quick Actions */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
        <div>
          <span className="text-sm font-semibold text-slate-800 block mb-4">Quick Actions</span>
          <div className="flex flex-col gap-3">
            <button 
              onClick={openModal}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Transaction</span>
            </button>

            <a 
              href="/clients"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition text-center"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Client</span>
            </a>

            <a 
              href="/transactions"
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition text-center"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>View Reports</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};