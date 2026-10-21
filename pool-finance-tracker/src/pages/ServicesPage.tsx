import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Clock, CheckCircle, X } from 'lucide-react';
import { API_BASE } from '../config';

interface Service {
  id: number;
  title: string;
  price: number;
  duration: string;
  description?: string;
  visitsLimit: number;
}

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Состояние модалки создания услуги
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(15.00);
  const [duration, setDuration] = useState('45 min');
  const [visitsLimit, setVisitsLimit] = useState<number>(1);
  const [description, setDescription] = useState('');

  // 1. Загрузка услуг из базы данных
  const fetchServices = async () => {
    try {
      const response = await fetch('${API_BASE}/api/services и ${API_BASE}/api/services/${id}');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 2. Создание новой услуги в PostgreSQL
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch('${API_BASE}/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: Number(price),
          duration,
          visitsLimit: Number(visitsLimit),
          description,
        }),
      });

      if (response.ok) {
        const newService = await response.json();
        setServices(prev => [...prev, newService]);
        setIsModalOpen(false);
        // Сброс формы
        setTitle('');
        setDescription('');
        setPrice(15.00);
      }
    } catch (err) {
      console.error('Ошибка создания услуги:', err);
    }
  };

  // 3. Удаление услуги
  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тариф?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Ошибка удаления услуги:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Services & Pricing</h2>
          <p className="text-sm text-slate-500 mt-1">Управление тарифами бассейна, разовыми билетами и абонементами</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Service</span>
        </button>
      </div>

      {/* Сетка тарифов */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {services.map((s) => (
          <div 
            key={s.id} 
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDeleteService(s.id)}
                  title="Удалить тариф"
                  className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-slate-800 text-base leading-snug">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {s.description || 'Стандартное посещение плавательного бассейна.'}
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {s.duration}
                </span>
                <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-sky-500" />
                  {s.visitsLimit === 1 ? '1 занятие' : `${s.visitsLimit} занятий`}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-800">€{s.price.toFixed(2)}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ УСЛУГИ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Add New Tariff / Service</h3>
                <p className="text-xs text-slate-500 mt-0.5">Создание новой платной услуги бассейна</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Название тарифа</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Аквааэробика (Вечер)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Стоимость (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Длительность</label>
                  <input
                    type="text"
                    required
                    placeholder="45 min или 1 month"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Число занятий в тарифе</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={visitsLimit}
                  onChange={(e) => setVisitsLimit(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Описание (опционально)</label>
                <textarea
                  rows={2}
                  placeholder="Краткое описание условий или времени действия..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition resize-none"
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
                  Добавить в прайс-лист
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};