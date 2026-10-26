import React from 'react';
import { X, Printer, Waves, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../Types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrintReceipt = () => {
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
          <title>Кассовый чек #${transaction.id}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 6mm 2mm; 
              color: #000; 
              font-size: 11px; 
              line-height: 1.3;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 6px 0; }
            .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 28px; text-align: center; letter-spacing: 4px; margin: 8px 0 2px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 13px;">СПОРТКОМПЛЕКС "БАССЕЙН ПГУ"</div>
          <div class="center" style="font-size: 10px;">Республика Беларусь, г. Минск</div>
          <div class="center" style="font-size: 10px;">УНП: 100234567 | КАССА №1</div>
          
          <div class="divider"></div>
          
          <div class="center bold">КАССОВЫЙ ЧЕК / ТАЛОН ВХОДА</div>
          <div class="center">Чек №${transaction.id}</div>
          <div class="row"><span>Дата/Время:</span><span>${transaction.dateTime}</span></div>
          <div class="row"><span>Кассир:</span><span>Администратор</span></div>
          <div class="row"><span>Клиент:</span><span>${transaction.clientName}</span></div>
          
          <div class="divider"></div>
          
          <div class="row bold">
            <span>УСЛУГА</span>
            <span>ИТОГО</span>
          </div>
          <div class="row">
            <span>${transaction.serviceItem}</span>
            <span>${(transaction.amount || 0).toFixed(2)} руб.</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="total-row">
            <span>ИТОГО К ОПЛАТЕ:</span>
            <span>${(transaction.amount || 0).toFixed(2)} руб.</span>
          </div>
          <div class="row">
            <span>Вид оплаты:</span>
            <span>${transaction.paymentMethod === 'Card' ? 'Безналичными (Карта)' : 'Наличными'}</span>
          </div>
          <div class="row">
            <span>Статус:</span>
            <span>ОПЛАЧЕНО (Успешно)</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="center bold" style="font-size: 10px; margin-top: 6px;">ШТРИХКОД ДЛЯ ТУРНИКЕТА:</div>
          <div class="barcode">||| | |||| | ||| || |||</div>
          <div class="center" style="font-size: 9px;">*PSU-${transaction.id}-PASS*</div>
          
          <div class="divider"></div>
          <div class="center" style="font-size: 10px; margin-top: 4px;">Спасибо за визит! Приятного плавания!</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-sm tracking-wide">Фискальный чек #{transaction.id}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg active:scale-95 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 bg-slate-50 border-b border-dashed border-slate-300 font-mono text-xs text-slate-700 space-y-3">
          
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase">Бассейн ПГУ</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Спортивно-оздоровительный комплекс</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full mt-1.5 font-sans font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Оплата подтверждена
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Чек:</span>
              <span className="font-bold text-slate-800">#{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Дата:</span>
              <span>{transaction.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Клиент:</span>
              <span className="font-semibold text-slate-800">{transaction.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Оплата:</span>
              <span>{transaction.paymentMethod === 'Card' ? 'Банковская карта' : 'Наличные'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-slate-300">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>{transaction.serviceItem}</span>
              <span>{(transaction.amount || 0).toFixed(2)} BYN</span>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline font-sans">
            <span className="text-xs font-bold text-slate-700 uppercase">Итого:</span>
            <span className="text-xl font-black text-slate-900">{(transaction.amount || 0).toFixed(2)} BYN</span>
          </div>

          <div className="pt-3 border-t border-dashed border-slate-300 text-center">
            <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1 font-sans">Код прохода через турникет</p>
            <div className="bg-white p-2 rounded-xl border border-slate-200 inline-block">
              <div className="font-mono text-xl tracking-[6px] font-bold text-slate-900 select-all">
                |||| | ||| || |||
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">ID-{transaction.id}-AUTH</p>
          </div>

        </div>

        <div className="p-4 bg-white flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition active:scale-[0.98] cursor-pointer"
          >
            Закрыть
          </button>
          <button
            onClick={handlePrintReceipt}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Печать чека</span>
          </button>
        </div>

      </div>
    </div>
  );
};