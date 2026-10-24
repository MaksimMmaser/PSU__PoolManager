import React, { useState } from 'react';
import { X } from 'lucide-react';
import { API_BASE } from '../config';

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
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Students PGU');
  const [phone, setPhone] = useState('+373 ');
  const [visitsLeft, setVisitsLeft] = useState(8);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
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
        setFullName('');
        setPhone('+373 ');
        setVisitsLeft(8);
        onClose();
        if (onClientCreated) {
          onClientCreated(); // Перерисовываем графики/списки
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
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">Add New Member</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Регистрация посетителя бассейна</p>
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
              className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition cursor-pointer"
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
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition active:scale-[0.98] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'Сохранение...' : 'Сохранить в базу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};