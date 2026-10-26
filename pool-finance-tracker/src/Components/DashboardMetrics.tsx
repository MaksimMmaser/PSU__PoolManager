import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, Tooltip
} from 'recharts';
import { Plus, UserPlus, FileText, Loader2 } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { API_BASE } from '../config';
import { AddClientModal } from './AddClientModal';
import { ReportsModal } from './ReportsModal';

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

const SERVICE_COLORS = ['#1e40af', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8'];

const MEMBER_TRANSLATIONS: Record<string, string> = {
  'Students PGU': 'Студенты ПГУ',
  'Staff PGU': 'Преподаватели / Сотрудники',
  'External': 'Внешние посетители',
};

const MEMBER_COLORS: Record<string, string> = {
  'Students PGU': '#1e40af',
  'Staff PGU': '#0284c7',
  'External': '#94a3b8',
};

export const DashboardMetrics: React.FC = () => {
  const { openModal, transactions } = useTransactions();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/summary`, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true'
        }
      });
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

  useEffect(() => {
    fetchSummary();
  }, [transactions.length]);

  if (loading && !summary) {
    return (
      <div className="h-56 sm:h-64 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center text-slate-400 gap-3 shadow-sm">
        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-sky-600" />
        <span className="text-xs sm:text-sm">Загрузка финансовой аналитики...</span>
      </div>
    );
  }

  const totalRev = summary?.totalRevenue ?? 0;
  const weeklyRev = summary?.weeklyRevenue ?? 0;
  const totalMemb = summary?.totalMembers ?? 0;
  const incomeList = summary?.incomeStructure?.length ? summary.incomeStructure : [{ name: 'Нет данных', value: 100, amount: 0 }];
  const memberList = summary?.memberCategories?.length ? summary.memberCategories : [{ name: 'External', value: 100, count: 0 }];
  const dailyList = summary?.dailyRevenue?.length ? summary.dailyRevenue : [];

  const trendData = dailyList.map(d => ({ val: d.amount }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5">
        
        {/* КАРТОЧКА 1: Общая выручка */}
        <div className="md:col-span-1 lg:col-span-6 xl:col-span-4 min-w-0 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <span className="text-xs sm:text-sm font-medium text-slate-500">Общая выручка кассы</span>
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-2.5 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                €{totalRev.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
                Данные из базы PostgreSQL
              </span>
            </div>

            <div className="h-12 sm:h-14 -mx-4 sm:-mx-5 mt-2">
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

          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block mb-2.5">
              Структура выручки (по тарифам)
            </span>
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-3 sm:gap-4">
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

              <div className="w-full sm:flex-1 space-y-1.5 text-xs max-h-28 overflow-y-auto pr-1">
                {incomeList.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: SERVICE_COLORS[idx % SERVICE_COLORS.length] }} 
                      />
                      <span className="text-slate-600 truncate text-[11px] sm:text-xs">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 shrink-0 text-[11px] sm:text-xs">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* КАРТОЧКА 2: Выручка за неделю */}
        <div className="md:col-span-1 lg:col-span-6 xl:col-span-3 min-w-0 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-sm font-medium text-slate-500">Выручка за неделю</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                €{weeklyRev.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">За 7 дней</span>
            </div>

            <div className="mt-3 sm:mt-4">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Динамика по дням
              </span>
              <div className="h-20 w-full min-w-0">
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

          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Популярные категории
            </span>
            <div className="space-y-2">
              {incomeList.slice(0, 3).map((item, idx) => (
                <div key={item.name}>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-600">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="font-medium text-slate-700 shrink-0">€{item.amount.toFixed(2)}</span>
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

        {/* КАРТОЧКА 3: Активные клиенты */}
        <div className="md:col-span-1 lg:col-span-6 xl:col-span-3 min-w-0 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-sm font-medium text-slate-500">Активная база клиентов</span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{totalMemb} чел.</span>
            </div>

            <div className="mt-3 sm:mt-4">
              <span className="text-xs font-semibold text-slate-600 block mb-2.5">
                Категории посетителей
              </span>
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-3 sm:gap-4">
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

                <div className="w-full sm:flex-1 space-y-2 text-xs">
                  {memberList.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: MEMBER_COLORS[item.name] || '#64748b' }} 
                        />
                        <span className="text-slate-600 truncate text-[11px] sm:text-xs">
                          {MEMBER_TRANSLATIONS[item.name] || item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800 shrink-0 text-[11px] sm:text-xs">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* КАРТОЧКА 4: Быстрые действия */}
        <div className="md:col-span-1 lg:col-span-6 xl:col-span-2 min-w-0 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 block mb-3 sm:mb-4">Быстрые действия</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-2.5 sm:gap-3">
              <button 
                onClick={() => openModal()}
                className="w-full bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="truncate">Новая транзакция</span>
              </button>

              <button 
                onClick={() => setIsAddClientModalOpen(true)}
                className="w-full bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all text-center cursor-pointer"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span className="truncate">Новый клиент</span>
              </button>

              <button 
                onClick={() => setIsReportsModalOpen(true)}
                className="w-full bg-sky-700 hover:bg-sky-800 active:scale-[0.98] text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all text-center cursor-pointer"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span className="truncate">Отчёт директора</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <AddClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
        onClientCreated={fetchSummary} 
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        summary={summary}
        transactions={transactions}
      />
    </>
  );
};