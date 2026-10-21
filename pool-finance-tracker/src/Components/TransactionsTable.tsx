import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUpDown, 
  ArrowDown,
  Download
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import type { Transaction } from '../Types';

export const TransactionsTable: React.FC = () => {
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week' | 'This Month' | 'All'>('This Week');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Фильтрация по датам
  // 1. Математически точная фильтрация дат
  const filterByDate = (tx: Transaction) => {
    // Берем ISO дату от бэкенда либо парсим строку
    const rawDate = tx.createdAt ? new Date(tx.createdAt) : new Date(tx.dateTime);
    const txTime = rawDate.getTime();
    
    // Если дата не спарсилась — показываем
    if (isNaN(txTime)) return true;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    if (activeTab === 'Today') {
      return txTime >= startOfToday;
    }
    if (activeTab === 'This Week') {
      return txTime >= oneWeekAgo;
    }
    if (activeTab === 'This Month') {
      return txTime >= startOfMonth;
    }
    return true; // 'All'
  };

  // 2. Итоговый список с поиском и фильтром по периоду
  const filteredTransactions = transactions
    .filter(filterByDate)
    .filter(t => 
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm)
    );

  // Считаем итоговую сумму по отфильтрованным строкам
  const totalAmountFiltered = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  // 3. Экспорт в CSV (Excel)
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const headers = ['ID', 'Date/Time', 'Client', 'Service', 'Amount (EUR)', 'Payment Method', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.id,
      `"${t.dateTime}"`,
      `"${t.clientName}"`,
      `"${t.serviceItem}"`,
      t.amount.toFixed(2),
      t.paymentMethod,
      t.status
    ]);

    // \uFEFF - UTF-8 BOM, чтобы Excel корректно понимал русские буквы
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pool_transactions_${activeTab.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Печать отчета
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Заголовок для печатной версии (скрыт на экране, виден на бумаге) */}
      <div className="hidden print:block p-6 border-b border-slate-300">
        <h1 className="text-xl font-bold uppercase tracking-wider">Pool Finance Tracker — Отчет по транзакциям</h1>
        <p className="text-xs text-slate-500 mt-1">
          Период: <strong>{activeTab}</strong> | Сформирован: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Панель управления (скрывается при печати) */}
      <div className="no-print p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Показано записей: <strong className="text-slate-700">{filteredTransactions.length}</strong> на сумму{' '}
            <strong className="text-sky-600">€{totalAmountFiltered.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Поле поиска */}
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

          {/* Табы периодов */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {(['Today', 'This Week', 'This Month', 'All'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'hover:text-slate-900 text-slate-500'
                }`}
              >
                {tab === 'All' ? 'Custom Range' : tab}
              </button>
            ))}
          </div>

          {/* Кнопка экспорта в CSV и Печать */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              title="Экспорт в Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button 
              onClick={handlePrint}
              title="Распечатать отчет"
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
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

      {/* Таблица транзакций */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
              <th className="py-3 px-4 w-10 no-print">
                <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>Date/Time</span>
                  <ArrowDown className="w-3 h-3 text-sky-600" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>Client</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>Service/Item</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>Amount</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>Payment Method</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  За выбранный период транзакций не найдено
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 no-print">
                    <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800">{tx.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{tx.dateTime}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{tx.clientName}</td>
                  <td className="py-3.5 px-4">{tx.serviceItem}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">€{tx.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4">{tx.paymentMethod}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Итоговая строчка в таблице */}
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-800">
              <td className="py-3 px-4 no-print"></td>
              <td colSpan={4} className="py-3 px-4 text-slate-600 uppercase text-[11px] tracking-wider">
                Итого по выбранному периоду:
              </td>
              <td className="py-3 px-4 text-sky-700 font-extrabold text-sm">
                €{totalAmountFiltered.toFixed(2)}
              </td>
              <td colSpan={2} className="py-3 px-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};