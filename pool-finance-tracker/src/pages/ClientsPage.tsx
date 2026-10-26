import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Plus, RotateCcw } from 'lucide-react';
import { API_BASE } from '../config';
import { AddClientModal } from '../Components/AddClientModal';
import { TableRowSkeleton, MobileCardSkeleton, Skeleton } from '../Components/Skeleton';
import { useTransactions } from '../context/TransactionContext';
import { useToast } from '../context/ToastContext';

interface Client {
  id: number;
  fullName: string;
  category: string;
  phone?: string;
  email?: string;
  visitsLeft: number;
  createdAt: string;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'Students PGU': return 'Студент ПГУ';
    case 'Staff PGU': return 'Сотрудник ПГУ';
    case 'External': return 'Внешний';
    default: return category;
  }
};

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { openModal, transactions } = useTransactions();
  const { showToast } = useToast();

  // 1. Бесшумное фоновое обновление (без моргания экрана!)
  const fetchClients = async () => {
    try {
      // Скелетон включаем ТОЛЬКО если таблица совсем пустая при первом открытии
      if (clients.length === 0) {
        setLoading(true);
      }

      const response = await fetch(API_BASE + '/api/clients', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Перезагружаем клиентов при изменении транзакций (тихо в фоне)
  useEffect(() => {
    fetchClients();
  }, [transactions.length]);

  const handleCheckIn = async (clientId: number, clientName: string) => {
    try {
      const response = await fetch(API_BASE + '/api/clients/' + clientId + '/check-in', {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });

      if (response.ok) {
        const updatedClient = await response.json();
        // Мгновенное обновление строки на месте без перерисовок
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
        showToast(`Визит списан у ${clientName}! Осталось: ${updatedClient.visitsLeft} зан.`, 'success');
      } else {
        const err = await response.json();
        showToast(err.message || 'Ошибка списания визита', 'error');
      }
    } catch (err) {
      console.error('Ошибка чек-ина:', err);
      showToast('Ошибка сервера', 'error');
    }
  };

  const filteredClients = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Клиенты и абонементы
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            База посетителей бассейна, списание визитов и продление абонементов
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Новый клиент</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Поиск */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по имени или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium self-end sm:self-auto flex items-center gap-1.5">
            Всего в базе:{' '}
            {loading && clients.length === 0 ? (
              <Skeleton className="w-6 h-4 inline-block" />
            ) : (
              <strong className="text-slate-800 font-bold">{clients.length}</strong>
            )}
          </span>
        </div>

        {/* 1. МОБИЛЬНЫЙ ВИД */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading && clients.length === 0 ? (
            <MobileCardSkeleton count={3} />
          ) : filteredClients.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              По вашему запросу клиентов не найдено
            </div>
          ) : (
            filteredClients.map((c) => (
              <div key={c.id} className="p-3.5 space-y-3 hover:bg-slate-50/60 transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {c.fullName.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-sm truncate">{c.fullName}</p>
                      <span className="text-[10px] text-slate-400 font-normal">ID: #{c.id}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    c.visitsLeft > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {c.visitsLeft > 0 ? 'Активен' : 'Истёк'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                      {getCategoryLabel(c.category)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-1">{c.phone || '—'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold text-base ${c.visitsLeft > 0 ? 'text-sky-600' : 'text-rose-500'}`}>
                      {c.visitsLeft}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">занятий</span>
                  </div>
                </div>

                {c.visitsLeft > 0 ? (
                  <button
                    onClick={() => handleCheckIn(c.id, c.fullName)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Отметить визит (-1)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openModal(c.fullName)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Продлить абонемент (пополнить)</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 2. ДЕСКТОПНЫЙ ВИД */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold select-none">
                <th className="py-3 px-5">Клиент</th>
                <th className="py-3 px-5">Категория</th>
                <th className="py-3 px-5">Телефон</th>
                <th className="py-3 px-5">Остаток визитов</th>
                <th className="py-3 px-5">Статус</th>
                <th className="py-3 px-5 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {/* Скелетоны показываются ТОЛЬКО если таблица пуста при первой загрузке */}
              {loading && clients.length === 0 ? (
                <TableRowSkeleton rows={5} />
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    По вашему запросу клиентов не найдено
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.fullName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="truncate">{c.fullName}</p>
                        <span className="text-[10px] text-slate-400 font-normal">ID: #{c.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {getCategoryLabel(c.category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`font-bold text-sm ${c.visitsLeft > 0 ? 'text-sky-600' : 'text-rose-500'}`}>
                        {c.visitsLeft}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1">занятий</span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        c.visitsLeft > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {c.visitsLeft > 0 ? 'Активен' : 'Истёк'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {c.visitsLeft > 0 ? (
                        <button
                          onClick={() => handleCheckIn(c.id, c.fullName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white cursor-pointer"
                          title="Списать 1 занятие"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Отметить визит (-1)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(c.fullName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white cursor-pointer"
                          title="Пополнить абонемент"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Продлить абонемент</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClientCreated={fetchClients} 
      />
    </div>
  );
};