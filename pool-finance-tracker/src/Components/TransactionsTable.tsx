import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUpDown, 
  ArrowDown,
  Download,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import type { Transaction } from '../Types';
import { ReceiptModal } from './ReceiptModal';
import { TransactionRowSkeleton, TransactionCardSkeleton, Skeleton } from './Skeleton';

export const TransactionsTable: React.FC = () => {
  // Достаем loading из контекста
  const { transactions, loading } = useTransactions();
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week' | 'This Month' | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние выбранной транзакции для печати чека
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // 1. Фильтрация дат
  const filterByDate = (tx: Transaction) => {
    const rawDate = tx.createdAt ? new Date(tx.createdAt) : new Date(tx.dateTime);
    const txTime = rawDate.getTime();
    
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
    return true;
  };

  // 2. Итоговый список
  const filteredTransactions = transactions
    .filter(filterByDate)
    .filter(t => 
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm)
    );

  const totalAmountFiltered = filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  // 3. Экспорт в CSV
  const handleExportCSV = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;

    if (dataToExport.length === 0) {
      alert('В базе данных пока нет транзакций для выгрузки');
      return;
    }

    const headers = ['ID', 'Date_Time', 'Client', 'Service', 'Amount_EUR', 'Payment_Method', 'Status'];
    const rows = dataToExport.map(t => [
      t.id,
      `"${t.dateTime || ''}"`,
      `"${t.clientName || ''}"`,
      `"${t.serviceItem || ''}"`,
      (t.amount || 0).toFixed(2),
      `"${t.paymentMethod || ''}"`,
      `"${t.status || ''}"`
    ]);

    const csvContent = '\uFEFFsep=;\n' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pool_report_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. Сводная печать таблицы
  const handlePrint = () => {
    const dataToPrint = filteredTransactions.length > 0 ? filteredTransactions : transactions;

    if (dataToPrint.length === 0) {
      alert('Нет данных для печати');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Отчет кассы бассейна</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
            .meta { text-align: right; font-size: 11px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #f1f5f9; color: #475569; text-align: left; padding: 8px 10px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) td { background-color: #f8fafc; }
            .amount { font-weight: bold; color: #0f172a; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #dcfce7; color: #15803d; }
            .total-box { margin-top: 20px; display: flex; justify-content: flex-end; }
            .total-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 8px; text-align: right; }
            .total-val { font-size: 16px; font-weight: bold; color: #0284c7; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Pool Finance Tracker</h1>
              <p class="subtitle">Официальный финансовый реестр операций бассейна</p>
            </div>
            <div class="meta">
              <p>Выборка: <strong>${activeTab}</strong></p>
              <p>Дата печати: <strong>${new Date().toLocaleString()}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата и время</th>
                <th>Клиент</th>
                <th>Услуга</th>
                <th>Сумма</th>
                <th>Оплата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              ${dataToPrint.map(t => `
                <tr>
                  <td>#${t.id}</td>
                  <td>${t.dateTime}</td>
                  <td><strong>${t.clientName}</strong></td>
                  <td>${t.serviceItem}</td>
                  <td class="amount">€${(t.amount || 0).toFixed(2)}</td>
                  <td>${t.paymentMethod}</td>
                  <td><span class="badge">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-card">
              <div style="font-size: 11px; color: #64748b;">Итого по отчету (${dataToPrint.length} транз.):</div>
              <div class="total-val">€${dataToPrint.reduce((acc, t) => acc + (t.amount || 0), 0).toFixed(2)}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 150);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* 1. ПАНЕЛЬ ФИЛЬТРОВ И ПОИСКА */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Transactions</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              Показано записей:{' '}
              {loading ? (
                <Skeleton className="w-5 h-3 inline-block" />
              ) : (
                <strong className="text-slate-700">{filteredTransactions.length}</strong>
              )}{' '}
              на сумму{' '}
              {loading ? (
                <Skeleton className="w-12 h-3 inline-block" />
              ) : (
                <strong className="text-sky-600">€{totalAmountFiltered.toFixed(2)}</strong>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="relative w-full sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 overflow-x-auto max-w-full shrink-0">
              {(['Today', 'This Week', 'This Month', 'All'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    activeTab === tab
                      ? 'bg-white text-slate-800 shadow-xs font-semibold'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                >
                  {tab === 'All' ? 'Custom Range' : tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button 
                onClick={handleExportCSV}
                title="Экспорт в Excel (CSV)"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button 
                onClick={handlePrint}
                title="Распечатать реестр"
                className="p-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border-r border-slate-200 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. МОБИЛЬНЫЙ ВИД */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <TransactionCardSkeleton count={3} />
          ) : filteredTransactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              За выбранный период транзакций не найдено
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition active:bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">#{tx.id}</span>
                    <span className="font-bold text-slate-800 text-sm truncate">{tx.clientName}</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 shrink-0">
                    €{(tx.amount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 truncate">{tx.serviceItem}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                    {tx.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                  <span>{tx.dateTime}</span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tx.paymentMethod === 'Card' ? (
                        <CreditCard className="w-3 h-3 text-sky-600" />
                      ) : (
                        <Banknote className="w-3 h-3 text-emerald-600" />
                      )}
                      {tx.paymentMethod}
                    </span>
                    <button
                      onClick={() => setSelectedTxForReceipt(tx)}
                      title="Печать чека"
                      className="px-2 py-0.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Чек</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase">Итого за период:</span>
            <span className="text-sm font-extrabold text-sky-600">
              {loading ? <Skeleton className="w-14 h-4 inline-block" /> : `€${totalAmountFiltered.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* 3. ДЕСКТОПНЫЙ ВИД */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold select-none">
                <th className="py-3 px-3 sm:px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>Date/Time</span>
                    <ArrowDown className="w-3 h-3 text-sky-600" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>Client</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>Service/Item</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>Payment Method</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <TransactionRowSkeleton rows={5} />
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    За выбранный период транзакций не найдено
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-3 sm:px-4">
                      <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono font-medium text-slate-800">#{tx.id}</td>
                    <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">{tx.dateTime}</td>
                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-700">{tx.clientName}</td>
                    <td className="py-3.5 px-3 sm:px-4">{tx.serviceItem}</td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">€{(tx.amount || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-3 sm:px-4">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => setSelectedTxForReceipt(tx)}
                        title="Распечатать чек клиенту"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition active:scale-95 cursor-pointer font-medium"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Чек</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-800">
                <td className="py-3 px-3 sm:px-4"></td>
                <td colSpan={4} className="py-3 px-3 sm:px-4 text-slate-600 uppercase text-[11px] tracking-wider">
                  Итого по выбранному периоду:
                </td>
                <td className="py-3 px-3 sm:px-4 text-sky-700 font-extrabold text-sm whitespace-nowrap">
                  {loading ? <Skeleton className="w-16 h-4 inline-block" /> : `€${totalAmountFiltered.toFixed(2)}`}
                </td>
                <td colSpan={3} className="py-3 px-3 sm:px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ReceiptModal
        isOpen={selectedTxForReceipt !== null}
        onClose={() => setSelectedTxForReceipt(null)}
        transaction={selectedTxForReceipt}
      />
    </>
  );
};