import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, User, UserPlus } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { API_BASE } from '../config';

interface ServiceItem {
  id: number;
  title: string;
  price: number;
  visitsLimit: number;
}

interface ClientItem {
  id: number;
  fullName: string;
  category: string;
}

export const NewTransactionModal: React.FC = () => {
  const { isModalOpen, closeModal, addTransaction } = useTransactions();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  
  // Режим выбора: из базы или новый клиент вручную
  const [isManualClient, setIsManualClient] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [manualClientName, setManualClientName] = useState('');

  const [serviceItem, setServiceItem] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash'>('Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем услуги И клиентов из PostgreSQL
  useEffect(() => {
    if (isModalOpen) {
      // 1. Загрузка услуг
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
        .catch(err => console.error('Ошибка загрузки услуг:', err));

      // 2. Загрузка клиентов
      fetch(API_BASE + '/api/clients', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      })
        .then(res => res.json())
        .then((data: ClientItem[]) => {
          setClients(data);
          if (data && data.length > 0) {
            setSelectedClientName(data[0].fullName);
          } else {
            setIsManualClient(true);
          }
        })
        .catch(err => console.error('Ошибка загрузки клиентов:', err));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalClientName = isManualClient ? manualClientName.trim() : selectedClientName;
    if (!finalClientName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedService = services.find(s => s.title === serviceItem);

      // 1. АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ: если клиента ввели вручную — сохраняем его в базу!
      if (isManualClient) {
        const clientAlreadyExists = clients.some(
          c => c.fullName.toLowerCase() === finalClientName.toLowerCase()
        );

        if (!clientAlreadyExists) {
          const initialVisits = selectedService ? selectedService.visitsLimit : 1;
          
          await fetch(API_BASE + '/api/clients', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify({
              fullName: finalClientName,
              category: 'External', // по умолчанию регистрируем как внешнего клиента
              visitsLeft: initialVisits,
              phone: '+373 '
            })
          });
        }
      }

      // 2. Проводим саму финансовую транзакцию
      await addTransaction({
        clientName: finalClientName,
        serviceItem,
        amount: Number(amount),
        paymentMethod,
      });

      // 3. Закрываем и сбрасываем поля
      closeModal();
      setManualClientName('');
      setIsManualClient(false);
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        
        {/* Шапка модалки */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">New Transaction</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Оформление оплаты билета или абонемента</p>
          </div>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {/* ВЫБОР КЛИЕНТА (ИЗ БАЗЫ ИЛИ ВРУЧНУЮ) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 text-xs">Клиент</label>
              <button
                type="button"
                onClick={() => setIsManualClient(!isManualClient)}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition cursor-pointer flex items-center gap-1"
              >
                {isManualClient ? (
                  <>
                    <User className="w-3 h-3" />
                    <span>Выбрать из базы</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Ввести нового вручную</span>
                  </>
                )}
              </button>
            </div>

            {isManualClient ? (
              <input
                type="text"
                required
                value={manualClientName}
                onChange={(e) => setManualClientName(e.target.value)}
                placeholder="Введите ФИО нового клиента"
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            ) : (
              <select
                value={selectedClientName}
                onChange={(e) => setSelectedClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.fullName}>
                    {c.fullName} ({c.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ВЫБОР УСЛУГИ ИЗ БАЗЫ */}
          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1.5">Услуга / Абонемент</label>
            <select
              value={serviceItem}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition cursor-pointer"
            >
              {services.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title} — €{s.price.toFixed(2)} ({s.visitsLimit} визитов)
                </option>
              ))}
            </select>
          </div>

          {/* СУММА */}
          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1.5">Сумма к оплате (€)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          {/* СПОСОБ ОПЛАТЫ */}
          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1.5">Способ оплаты</label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
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
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
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

          {/* КНОПКИ ДЕЙСТВИЯ */}
          <div className="pt-3 sm:pt-4 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium transition active:scale-[0.98] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Проведение...' : 'Провести оплату'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};