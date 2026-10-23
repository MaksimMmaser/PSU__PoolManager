import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { API_BASE } from '../config';

interface ServiceItem {
  id: number;
  title: string;
  price: number;
}

export const NewTransactionModal: React.FC = () => {
  const { isModalOpen, closeModal, addTransaction } = useTransactions();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clientName, setClientName] = useState('Ivan Ivanov');
  const [serviceItem, setServiceItem] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash'>('Card');

  useEffect(() => {
    if (isModalOpen) {
      fetch(API_BASE + '/api/services', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      })
        .then(res => res.json())
        .then((data: ServiceItem[]) => {
          setServices(data);
          if (data && data.length > 0) {
            setServiceItem(data[0].title);
            setAmount(data[0].price);
          }
        })
        .catch(err => console.error('Ошибка загрузки списка услуг:', err));
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleServiceChange = (title: string) => {
    setServiceItem(title);
    const selected = services.find(s => s.title === title);
    if (selected) {
      setAmount(selected.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    addTransaction({
      clientName,
      serviceItem,
      amount: Number(amount),
      paymentMethod,
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* КАРТОЧКА МОДАЛЬНОГО ОКНА */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Шапка модалки */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">New Transaction</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Оформление оплаты билета или абонемента</p>
          </div>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело формы с поддержкой плавного скролла на мобилках */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block font-semibold text-slate-700 text-xs sm:text-xs mb-1.5">
              Клиент
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ФИО клиента"
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs sm:text-xs mb-1.5">
              Услуга / Абонемент
            </label>
            <select
              value={serviceItem}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
            >
              {services.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title} — €{s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs sm:text-xs mb-1.5">
              Сумма (€)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs sm:text-xs mb-1.5">
              Способ оплаты
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs sm:text-xs font-medium transition-all active:scale-[0.98] ${
                  paymentMethod === 'Card'
                    ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs sm:text-xs font-medium transition-all active:scale-[0.98] ${
                  paymentMethod === 'Cash'
                    ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>
            </div>
          </div>

          {/* Кнопки внизу */}
          <div className="pt-3 sm:pt-4 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium transition active:scale-[0.98]"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98]"
            >
              Создать транзакцию
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};