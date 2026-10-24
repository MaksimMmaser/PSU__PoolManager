import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Clock, CheckCircle, X } from 'lucide-react';
import { API_BASE } from '../config';
import { ConfirmModal } from '../Components/ConfirmModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(15.00);
  const [duration, setDuration] = useState('45 min');
  const [visitsLimit, setVisitsLimit] = useState<number>(1);
  const [description, setDescription] = useState('');

  // Состояние для красивого удаления
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Загрузка услуг
  const fetchServices = async () => {
    try {
      const response = await fetch(API_BASE + '/api/services', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 2. Создание новой услуги
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API_BASE + '/api/services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
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
        setTitle('');
        setDescription('');
        setPrice(15.00);
      }
    } catch (err) {
      console.error('Ошибка создания услуги:', err);
    }
  };

  // 3. Профессиональное подтвержденное удаление услуги
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(API_BASE + '/api/services/' + serviceToDelete.id, {
        method: 'DELETE',
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });

      if (response.ok) {
        setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
        setServiceToDelete(null);
      }
    } catch (err) {
      console.error('Ошибка удаления услуги:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Шапка страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Services & Pricing</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Управление тарифами бассейна, разовыми билетами и абонементами
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Service</span>
        </button>
      </div>

      {/* Адаптивная сетка тарифов (1 -> 2 -> 3 -> 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {services.map((s) => (
          <div 
            key={s.id} 
            className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                {/* Вместо вызова alert просто передаем выбранный тариф в стейт */}
                <button
                  onClick={() => setServiceToDelete(s)}
                  title="Удалить тариф"
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 active:scale-90 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 sm:mt-2 line-clamp-2">
                {s.description || 'Стандартное посещение плавательного бассейна.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-600 font-medium">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {s.duration}
                </span>
                <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-sky-500" />
                  {s.visitsLimit === 1 ? '1 занятие' : s.visitsLimit + ' занятий'}
                </span>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-slate-800">€{s.price.toFixed(2)}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">Add New Tariff / Service</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Создание новой платной услуги бассейна</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Название тарифа</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Аквааэробика (Вечер)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Стоимость (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition"
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
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
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
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Описание (опционально)</label>
                <textarea
                  rows={2}
                  placeholder="Краткое описание условий..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition resize-none"
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
                  Добавить в прайс-лист
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ПРОФЕССИОНАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ */}
      <ConfirmModal
        isOpen={serviceToDelete !== null}
        title={`Удалить тариф "${serviceToDelete?.title}"?`}
        message="Это действие необратимо. Тариф будет полностью удален из базы данных и пропадет из списка доступных для оплаты."
        confirmText="Да, удалить"
        cancelText="Отмена"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setServiceToDelete(null)}
      />
    </div>
  );
};