import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
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
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week' | 'This Month' | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

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
    return true; // 'All'
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

  // 3. БЕЗОШИБОЧНЫЙ ЭКСПОРТ В EXCEL (CSV)
  const handleExportCSV = () => {
    // Если в текущем табе пусто — берем все транзакции, чтобы не отдавать пустой файл
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

    // \uFEFF - кодировка UTF-8 BOM (для русских букв)
    // sep=; - директива для Excel, гарантирующая правильную разбивку по колонкам
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

  // 4. МГНОВЕННАЯ ПЕЧАТЬ БЕЗ ЗАВИСАНИЙ (через изолированный фрейм)
  const handlePrint = () => {
    const dataToPrint = filteredTransactions.length > 0 ? filteredTransactions : transactions;

    if (dataToPrint.length === 0) {
      alert('Нет данных для печати');
      return;
    }

    // Создаем изолированный скрытый фрейм для печати (графики Recharts не мешают)
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

    // Запускаем печать через 150мс, когда разметка построена
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Удаляем фрейм после отправки на печать
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 150);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Панель управления */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Показано записей: <strong className="text-slate-700">{filteredTransactions.length}</strong> на сумму{' '}
            <strong className="text-sky-600">€{totalAmountFiltered.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Поиск */}
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
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'hover:text-slate-900 text-slate-500'
                }`}
              >
                {tab === 'All' ? 'Custom Range' : tab}
              </button>
            ))}
          </div>

          {/* Кнопки Экспорта и Печати */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              title="Экспорт в Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* <button 
              onClick={handlePrint}
              title="Распечатать отчет"
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
            </button> */}

            {/* <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border-r border-slate-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Таблица транзакций */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
              <th className="py-3 px-4 w-10">
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
                  <td className="py-3.5 px-4">
                    <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer" />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800">{tx.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{tx.dateTime}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{tx.clientName}</td>
                  <td className="py-3.5 px-4">{tx.serviceItem}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">€{(tx.amount || 0).toFixed(2)}</td>
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
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-800">
              <td className="py-3 px-4"></td>
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