import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Plus, X, Phone, Mail, Award, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Состояние модалки добавления клиента
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Students PGU');
  const [phone, setPhone] = useState('+373 ');
  const [visitsLeft, setVisitsLeft] = useState(8);

  // 1. Загрузка клиентов из PostgreSQL
  const fetchClients = async () => {
    try {
      const response = await fetch('${API_BASE}/api/clients и ${API_BASE}/api/clients/${clientId}/check-in');
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

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. Создание клиента в базе
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      const response = await fetch('http://localhost:5205/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`http://localhost:5205/api/clients/${clientId}/check-in`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedClient = await response.json();
        // Обновляем клиента в списке локально
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
      } else {
        const err = await response.json();
        alert(err.message || 'Ошибка списания визита');
      }
    } catch (err) {
      console.error('Ошибка чек-ина:', err);
    }
  };

  // Фильтрация по поиску
  const filteredClients = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clients & Members</h2>
          <p className="text-sm text-slate-500 mt-1">База посетителей бассейна и списание визитов на ресепшене</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Таблица клиентов */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Поиск */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Всего клиентов в базе: <strong className="text-slate-800">{clients.length}</strong>
          </span>
        </div>

        {/* Список */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Client</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Visits Left</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Turnstile Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      {c.fullName.charAt(0)}
                    </div>
                    <div>
                      <p>{c.fullName}</p>
                      <span className="text-[10px] text-slate-400 font-normal">ID: #{c.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{c.phone || '—'}</td>
                  <td className="py-3.5 px-5">
                    <span className={`font-bold text-sm ${c.visitsLeft > 0 ? 'text-sky-600' : 'text-rose-500'}`}>
                      {c.visitsLeft}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1">занятий</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      c.visitsLeft > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {c.visitsLeft > 0 ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleCheckIn(c.id)}
                      disabled={c.visitsLeft <= 0}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ КЛИЕНТА */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Add New Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Регистрация посетителя бассейна</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">ФИО Клиента</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Mikhail Smirnov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm transition"
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