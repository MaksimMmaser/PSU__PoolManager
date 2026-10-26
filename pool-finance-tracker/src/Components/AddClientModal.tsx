import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, ShoppingCart } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { API_BASE } from '../config';

interface ServiceItem {
  id: number;
  title: string;
  price: number;
  visitsLimit: number;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated?: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ 
  isOpen, 
  onClose, 
  onClientCreated 
}) => {
  const { addTransaction } = useTransactions();

  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Students PGU');
  const [phone, setPhone] = useState('+373 ');
  const [loading, setLoading] = useState(false);

  // Список тарифов из базы данных
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | 'none'>('none');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash'>('Card');

  // Загрузка услуг
  useEffect(() => {
    if (isOpen) {
      fetch(API_BASE + '/api/services', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      })
        .then(res => res.json())
        .then((data: ServiceItem[]) => {
          setServices(data);
          const sub8 = data.find(s => s.visitsLimit === 8);
          if (sub8) {
            setSelectedServiceId(sub8.id);
          } else if (data.length > 0) {
            setSelectedServiceId(data[0].id);
          }
        })
        .catch(err => console.error('Ошибка загрузки тарифов:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    try {
      // 1. Вычисляем количество визитов на основе выбранного тарифа
      const initialVisits = currentService ? currentService.visitsLimit : 0;

      // 2. Создаем клиента в PostgreSQL
      const response = await fetch(API_BASE + '/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          fullName,
          category,
          phone,
          visitsLeft: initialVisits,
        }),
      });

      if (response.ok) {
        // 3. Автоматическая транзакция: если тариф платный, пробиваем оплату в кассе
        if (currentService && currentService.price > 0) {
          await addTransaction({
            clientName: fullName.trim(),
            serviceItem: currentService.title,
            amount: currentService.price,
            paymentMethod,
          });
        }

        // Сброс и закрытие
        setFullName('');
        setPhone('+373 ');
        onClose();
        if (onClientCreated) {
          onClientCreated();
        }
      } else {
        alert('Ошибка создания клиента');
      }
    } catch (err) {
      console.error('Ошибка создания клиента:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        
        {/* Шапка модалки */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">Новый посетитель</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Регистрация клиента и оформление абонемента</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleCreateClient} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">ФИО Клиента</label>
            <input
              type="text"
              required
              placeholder="Например: Смирнов Михаил Сергеевич"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition cursor-pointer"
              >
                <option value="Students PGU">Студенты ПГУ</option>
                <option value="Staff PGU">Преподаватели / Сотрудники</option>
                <option value="External">Внешние посетители</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Телефон</label>
              <input
                type="text"
                placeholder="+373 777 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* ПОКУПКА АБОНЕМЕНТА ПРИ РЕГИСТРАЦИИ */}
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
            <div>
              <label className="block font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
                <span>Оформление абонемента / тарифа</span>
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedServiceId(val === 'none' ? 'none' : Number(val));
                }}
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 transition cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — €{s.price.toFixed(2)} ({s.visitsLimit} визитов)
                  </option>
                ))}
                <option value="none">Без абонемента (€0.00 / 0 занятий)</option>
              </select>
            </div>

            {/* СПОСОБ ОПЛАТЫ */}
            {currentService && currentService.price > 0 && (
              <div>
                <span className="block font-semibold text-slate-700 text-[11px] mb-1.5">
                  Способ оплаты чека на €{currentService.price.toFixed(2)}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition active:scale-95 cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'border-sky-600 bg-sky-600 text-white shadow-xs font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Карта</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition active:scale-95 cursor-pointer ${
                      paymentMethod === 'Cash'
                        ? 'border-sky-600 bg-sky-600 text-white shadow-xs font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Наличные</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition active:scale-[0.98] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Оформление...' : currentService && currentService.price > 0 ? `Оформить и оплатить (€${currentService.price.toFixed(2)})` : 'Зарегистрировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};