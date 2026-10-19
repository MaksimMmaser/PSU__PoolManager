import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { 
  AreaChart, Area, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis 
} from 'recharts';
import { Plus, UserPlus, FileText } from 'lucide-react';

// Данные для спарклайна выручки
const revenueTrend = [
  { val: 8000 }, { val: 8500 }, { val: 8200 }, { val: 9500 }, 
  { val: 9000 }, { val: 11000 }, { val: 12750 }
];

// Структура выручки (Donut 1)
const incomeStructure = [
  { name: 'Subscriptions', value: 52, color: '#1e40af' },
  { name: 'Single Entry', value: 21, color: '#0284c7' },
  { name: 'AquaAerobics', value: 18, color: '#10b981' },
  { name: 'Other', value: 9, color: '#94a3b8' },
];

// Дни недели для объема (BarChart)
const dailyRevenueData = [
  { day: 'Mon', val: 380 },
  { day: 'Mon', val: 590 },
  { day: 'Tue', val: 420 },
  { day: 'Wed', val: 620 },
  { day: 'Thu', val: 410 },
  { day: 'Fri', val: 780 },
  { day: 'Sat', val: 510 },
];

// Категории клиентов (Donut 2)
const memberCategories = [
  { name: 'Students PGU', value: 45, color: '#1e40af' },
  { name: 'Staff PGU', value: 10, color: '#0284c7' },
  { name: 'External', value: 45, color: '#94a3b8' },
];

export const DashboardMetrics: React.FC = () => {
    const { openModal } = useTransactions();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
      
      {/* КАРТОЧКА 1: Monthly Revenue */}
      <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div>
          <span className="text-sm font-medium text-slate-500">Monthly Revenue</span>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">€12,750.80</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              +15.2% vs last month
            </span>
          </div>

          {/* Спарклайн выручки */}
          <div className="h-14 -mx-5 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  fill="url(#revenueGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Структура дохода */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 block mb-3">
            Monthly Income Structure (Oct)
          </span>
          <div className="flex items-center justify-between gap-4">
            <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
              <PieChart width={96} height={96}>
                <Pie
                  data={incomeStructure}
                  cx={43}
                  cy={43}
                  innerRadius={24}
                  outerRadius={44}
                  dataKey="value"
                  stroke="none"
                >
                  {incomeStructure.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div className="flex-1 space-y-1.5 text-xs">
              {incomeStructure.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
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
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">€3,410.20</span>
            <span className="text-xs text-slate-400 font-medium">Current week</span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Daily Revenue (Oct 08 - Oct 14)
            </span>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData} barSize={10}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <Bar dataKey="val" fill="#0284c7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Popular Services Progress bars */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 block mb-2.5">
            Popular Services
          </span>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1 text-slate-600">
                <span>Subscriptions</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-sky-600 h-1.5 rounded-full w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1 text-slate-600">
                <span>Single Entry</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-sky-600 h-1.5 rounded-full w-[55%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1 text-slate-600">
                <span>Pool Hire</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-sky-600 h-1.5 rounded-full w-[35%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* КАРТОЧКА 3: Active Members */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
        <div>
          <span className="text-sm font-medium text-slate-500">Active Members</span>
          <div className="mt-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">1,245</span>
          </div>

          <div className="mt-5">
            <span className="text-xs font-semibold text-slate-600 block mb-3">
              Member Categories
            </span>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
                <PieChart width={96} height={96}>
                  <Pie
                    data={memberCategories}
                    cx={43}
                    cy={43}
                    innerRadius={24}
                    outerRadius={44}
                    dataKey="value"
                    stroke="none"
                  >
                    {memberCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {memberCategories.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
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

            <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition">
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Client</span>
            </button>

            <button className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition">
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};