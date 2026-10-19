import React, { useState } from 'react';
import { Search, Printer, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsUpDown, ArrowDown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

export const TransactionsTable: React.FC = () => {
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week' | 'This Month' | 'Custom Range'>('This Week');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.serviceItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toString().includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Заголовок и фильтры */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Transactions</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {(['Today', 'This Week', 'This Month', 'Custom Range'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'hover:text-slate-900 text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
              <MoreHorizontal className="w-3.5 h-3.5" />
              <span>View More</span>
            </button>
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">
              <Printer className="w-4 h-4" />
            </button>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border-r border-slate-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
              <th className="py-3 px-4 w-10">
                <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>Date/Time</span>
                  <ArrowDown className="w-3 h-3 text-sky-600" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>Client</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>Service/Item</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>Amount</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>Payment Method</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/80 transition group animate-in fade-in duration-150">
                <td className="py-3.5 px-4">
                  <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{tx.id}</td>
                <td className="py-3.5 px-4">{tx.dateTime}</td>
                <td className="py-3.5 px-4 font-medium text-slate-700">{tx.clientName}</td>
                <td className="py-3.5 px-4">{tx.serviceItem}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">€{tx.amount.toFixed(2)}</td>
                <td className="py-3.5 px-4">{tx.paymentMethod}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                    {tx.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded transition">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};