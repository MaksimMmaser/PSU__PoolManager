import React from 'react';
import { X, Printer, CreditCard, Award, BarChart3 } from 'lucide-react';
import type { Transaction } from '../Types';

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

interface DashboardSummary {
  totalRevenue: number;
  weeklyRevenue: number;
  incomeStructure: IncomeItem[];
  totalMembers: number;
  memberCategories: MemberItem[];
}

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DashboardSummary | null;
  transactions: Transaction[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  summary,
  transactions,
}) => {
  if (!isOpen) return null;

  // 1. Расчет бизнес-показателей
  const totalRev = summary?.totalRevenue ?? 0;
  const totalTxCount = transactions.length;
  const avgCheck = totalTxCount > 0 ? totalRev / totalTxCount : 0;

  // Расчет оплат картой / наличными
  const cardTotal = transactions
    .filter((t) => t.paymentMethod === 'Card')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const cashTotal = transactions
    .filter((t) => t.paymentMethod === 'Cash')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const cardPercent = totalRev > 0 ? Math.round((cardTotal / totalRev) * 100) : 0;
  const cashPercent = totalRev > 0 ? 100 - cardPercent : 0;

  // Самый прибыльный тариф
  const topService = summary?.incomeStructure && summary.incomeStructure.length > 0
    ? [...summary.incomeStructure].sort((a, b) => b.amount - a.amount)[0]
    : null;

  // 2. Изолированная печать официального бланка для руководства
  const handlePrintExecutiveReport = () => {
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
          <title>Финансовый отчёт руководителя — Бассейн ПГУ</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; }
            .meta { font-size: 11px; color: #64748b; text-align: right; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
            .card-val { font-size: 20px; font-weight: 800; color: #0284c7; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { text-align: left; background: #f1f5f9; padding: 8px 12px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
            td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; }
            .sig-line { border-bottom: 1px solid #0f172a; width: 180px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Сводный финансовый отчёт комплекса</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">Спортивно-оздоровительный плавательный бассейн ПГУ</p>
            </div>
            <div class="meta">
              <p style="margin:0;">Дата: <strong>${new Date().toLocaleDateString('ru-RU')}</strong></p>
              <p style="margin:4px 0 0;">Статус: <strong>Утверждён</strong></p>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Общая выручка кассы</div>
              <div class="card-val">€${totalRev.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Средний чек операции</div>
              <div class="card-val">€${avgCheck.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Проведено операций</div>
              <div class="card-val">${totalTxCount} шт.</div>
            </div>
            <div class="card">
              <div class="card-title">Активная база клиентов</div>
              <div class="card-val">${summary?.totalMembers ?? 0} чел.</div>
            </div>
          </div>

          <h3 style="font-size: 14px; margin-bottom: 8px;">Выручка в разрезе тарифов</h3>
          <table>
            <thead>
              <tr>
                <th>Услуга / Тариф</th>
                <th>Сумма (€)</th>
                <th>Доля (%)</th>
              </tr>
            </thead>
            <tbody>
              ${(summary?.incomeStructure || []).map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td><strong>€${item.amount.toFixed(2)}</strong></td>
                  <td>${item.value}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div>
              <div>Руководитель комплекса:</div>
              <div class="sig-line"></div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">(Подпись / ФИО)</div>
            </div>
            <div>
              <div>Главный бухгалтер / Кассир:</div>
              <div class="sig-line"></div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">(Подпись / ФИО)</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        
        {/* Шапка модалки */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Отчёт руководителя</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Сводная финансовая аналитика бассейна</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Контент отчета */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Сетка показателей */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Выручка</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800">€{totalRev.toFixed(2)}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ср. чек</span>
              <span className="text-base sm:text-lg font-extrabold text-sky-600">€{avgCheck.toFixed(2)}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Транзакций</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800">{totalTxCount}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Клиентов</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800">{summary?.totalMembers ?? 0}</span>
            </div>
          </div>

          {/* Платежные методы */}
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                Безналичный расчет (Карта)
              </span>
              <span>{cardPercent}% (€{cardTotal.toFixed(2)})</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
              <div className="bg-sky-600 h-2 transition-all duration-500" style={{ width: `${cardPercent}%` }} />
              <div className="bg-emerald-500 h-2 transition-all duration-500" style={{ width: `${cashPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Карта: {cardPercent}%</span>
              <span>Наличные: {cashPercent}% (€{cashTotal.toFixed(2)})</span>
            </div>
          </div>

          {/* Самый прибыльный тариф */}
          {topService && (
            <div className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-700 block">Флагманский тариф</span>
                  <span className="text-xs font-bold text-slate-800">{topService.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-sky-700">€{topService.amount.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block">{topService.value}% от выручки</span>
              </div>
            </div>
          )}

          {/* Таблица структуры */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-2">Детализация продаж по услугам:</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2 px-3">Услуга</th>
                    <th className="py-2 px-3 text-right">Сумма</th>
                    <th className="py-2 px-3 text-right">Доля</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {(summary?.incomeStructure || []).map((item) => (
                    <tr key={item.name} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800">{item.name}</td>
                      <td className="py-2 px-3 text-right font-semibold">€{item.amount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold text-sky-600">{item.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Подвал */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition cursor-pointer"
          >
            Закрыть
          </button>
          <button
            onClick={handlePrintExecutiveReport}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Печать отчёта для руководства</span>
          </button>
        </div>

      </div>
    </div>
  );
};