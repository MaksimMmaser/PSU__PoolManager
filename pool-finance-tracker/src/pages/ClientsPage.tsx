import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Plus, X } from 'lucide-react';
import { API_BASE } from '../config';

interface Client {
  id: number;
  fullName: string;
  category: string;
  phone?: string;
  email?: string;
  visitsLeft: number;
  createdAt: string;
}

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Students PGU');
  const [phone, setPhone] = useState('+373 ');
  const [visitsLeft, setVisitsLeft] = useState(8);

  // 1. Загрузка клиентов из PostgreSQL
  const fetchClients = async () => {
    try {
      const response = await fetch(API_BASE + '/api/clients', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. Создание клиента в базе
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
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
          visitsLeft: Number(visitsLeft),
        }),
      });

      if (response.ok) {
        const newClient = await response.json();
        setClients(prev => [newClient, ...prev]);
        setIsModalOpen(false);
        setFullName('');
      }
    } catch (err) {
      console.error('Ошибка создания клиента:', err);
    }
  };

  // 3. Отметка визита (списание занятия в базе)
  const handleCheckIn = async (clientId: number) => {
    try {
      const response = await fetch(API_BASE + '/api/clients/' + clientId + '/check-in', {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });

      if (response.ok) {
        const updatedClient = await response.json();
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
      } else {
        const err = await response.json();
        alert(err.message || 'Ошибка списания визита');
      }
    } catch (err) {
      console.error('Ошибка чек-ина:', err);
    }
  };

  const filteredClients = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Шапка страницы и кнопка добавления */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Clients & Members</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            База посетителей бассейна и списание визитов на ресепшене
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Контейнер списка клиентов */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Поиск и счетчик */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium self-end sm:self-auto">
            Всего в базе: <strong className="text-slate-800 font-bold">{clients.length}</strong>
          </span>
        </div>

        {/* 1. МОБИЛЬНЫЙ ВИД: КАРТОЧКИ (Без горизонтальной прокрутки, < md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredClients.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              По вашему запросу клиентов не найдено
            </div>
          ) : (
            filteredClients.map((c) => (
              <div key={c.id} className="p-3.5 space-y-3 hover:bg-slate-50/60 transition">
                {/* Строка 1: Аватар + Имя + Статус */}
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
                    {c.visitsLeft > 0 ? 'Active' : 'Expired'}
                  </span>
                </div>

                {/* Строка 2: Категория + Телефон + Остаток занятий */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                      {c.category}
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

                {/* Строка 3: Кнопка отметки визита на всю ширину под палец */}
                <button
                  onClick={() => handleCheckIn(c.id)}
                  disabled={c.visitsLeft <= 0}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all ${
                    c.visitsLeft > 0
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Отметить визит (-1)</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* 2. ДЕСКТОПНЫЙ ВИД: КЛАССИЧЕСКАЯ ТАБЛИЦА (md: 768px+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold select-none">
                <th className="py-3 px-5">Client</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Phone</th>
                <th className="py-3 px-5">Visits Left</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Turnstile Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredClients.length === 0 ? (
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
                        {c.category}
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
                        {c.visitsLeft > 0 ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleCheckIn(c.id)}
                        disabled={c.visitsLeft <= 0}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 ${
                          c.visitsLeft > 0
                            ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                        title={c.visitsLeft <= 0 ? 'Закончились посещения' : 'Списать 1 занятие'}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Отметить визит (-1)</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ КЛИЕНТА */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">Add New Member</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Регистрация посетителя бассейна</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">ФИО Клиента</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Mikhail Smirnov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                >
                  <option value="Students PGU">Students PGU (Студенты)</option>
                  <option value="Staff PGU">Staff PGU (Преподаватели/Сотрудники)</option>
                  <option value="External">External (Внешние клиенты)</option>
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Стартовое число посещений</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={visitsLeft}
                  onChange={(e) => setVisitsLeft(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 sm:pt-4 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition active:scale-[0.98]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm transition active:scale-[0.98]"
                >
                  Сохранить в базу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};