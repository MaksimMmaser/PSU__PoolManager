import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Thermometer, 
  Users, 
  Clock, 
  Plus, 
  X, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Loader2 
} from 'lucide-react';

interface PoolSession {
  id: number;
  laneNumber: number;
  dayOfWeek: string;
  timeSlot: string;
  activity: string;
  occupancy: number;
  maxCapacity: number;
  trainer?: string;
}

interface ScheduleResponse {
  day: string;
  waterTemperature: number;
  totalSwimmersInWater: number;
  poolSpecs: string;
  sessions: PoolSession[];
}

const TIME_COLUMNS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '17:00 - 18:00'];
const LANES = [1, 2, 3, 4, 5, 6];

export const SchedulePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Модалка просмотра / записи на сеанс
  const [selectedSlot, setSelectedSlot] = useState<PoolSession | null>(null);

  // Модалка создания нового сеанса на пустом слоте
  const [creatingSlot, setCreatingSlot] = useState<{ lane: number; time: string } | null>(null);
  const [newActivity, setNewActivity] = useState('FreeSwim');
  const [newCapacity, setNewCapacity] = useState(8);
  const [newTrainer, setNewTrainer] = useState('');

  // 1. Загрузка данных расписания из PostgreSQL
  const fetchSchedule = async (day: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5205/api/schedule?day=${day}`);
      if (res.ok) {
        const data: ScheduleResponse = await res.json();
        setScheduleData(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDay);
  }, [selectedDay]);

  // 2. Записать посетителя на дорожку (+1 в базе)
  const handleBookSpot = async (sessionId: number) => {
    try {
      const res = await fetch(`http://localhost:5205/api/schedule/${sessionId}/book`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated: PoolSession = await res.json();
        setSelectedSlot(updated);
        // Обновляем локальное состояние
        setScheduleData(prev => prev ? {
          ...prev,
          totalSwimmersInWater: prev.totalSwimmersInWater + 1,
          sessions: prev.sessions.map(s => s.id === sessionId ? updated : s)
        } : null);
      } else {
        const err = await res.json();
        alert(err.message || 'Ошибка записи');
      }
    } catch (err) {
      console.error('Ошибка бронирования:', err);
    }
  };

  // 3. Отменить запись (-1 в базе)
  const handleCancelSpot = async (sessionId: number) => {
    try {
      const res = await fetch(`http://localhost:5205/api/schedule/${sessionId}/cancel-booking`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated: PoolSession = await res.json();
        setSelectedSlot(updated);
        setScheduleData(prev => prev ? {
          ...prev,
          totalSwimmersInWater: Math.max(0, prev.totalSwimmersInWater - 1),
          sessions: prev.sessions.map(s => s.id === sessionId ? updated : s)
        } : null);
      }
    } catch (err) {
      console.error('Ошибка отмены записи:', err);
    }
  };

  // 4. Создать сеанс на пустом слоте
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingSlot) return;

    try {
      const res = await fetch('http://localhost:5205/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          laneNumber: creatingSlot.lane,
          dayOfWeek: selectedDay,
          timeSlot: creatingSlot.time,
          activity: newActivity,
          maxCapacity: Number(newCapacity),
          trainer: newTrainer.trim() || undefined,
        }),
      });

      if (res.ok) {
        setCreatingSlot(null);
        setNewTrainer('');
        fetchSchedule(selectedDay); // перезагружаем из базы
      } else {
        const err = await res.json();
        alert(err.message || 'Ошибка создания сеанса');
      }
    } catch (err) {
      console.error('Ошибка создания сеанса:', err);
    }
  };

  // 5. Удалить сеанс с дорожки
  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm('Освободить эту дорожку от сеанса?')) return;
    try {
      const res = await fetch(`http://localhost:5205/api/schedule/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedSlot(null);
        fetchSchedule(selectedDay);
      }
    } catch (err) {
      console.error('Ошибка удаления сеанса:', err);
    }
  };

  // Отрисовка ячейки дорожки
  const renderSlotCell = (laneNum: number, time: string) => {
    const session = scheduleData?.sessions.find(s => s.laneNumber === laneNum && s.timeSlot === time);

    if (!session) {
      return (
        <button
          onClick={() => {
            setCreatingSlot({ lane: laneNum, time });
            setNewCapacity(8);
            setNewActivity('FreeSwim');
          }}
          title="Назначить сеанс на дорожку"
          className="h-full w-full min-h-[74px] rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition flex items-center justify-center text-slate-300 hover:text-sky-600 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      );
    }

    const colorConfig = {
      'FreeSwim': { bg: 'bg-sky-50 border-sky-200 text-sky-800', badge: 'bg-sky-200/60 text-sky-700', label: 'Свободное плавание' },
      'AquaAerobics': { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-200/60 text-emerald-700', label: 'Аквааэробика' },
      'SportsClub': { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', badge: 'bg-indigo-200/60 text-indigo-700', label: 'Спортивная секция' },
      'PrivateHire': { bg: 'bg-amber-50 border-amber-200 text-amber-800', badge: 'bg-amber-200/60 text-amber-700', label: 'Аренда дорожки' },
    }[session.activity] || { bg: 'bg-slate-50 border-slate-200 text-slate-800', badge: 'bg-slate-200 text-slate-700', label: session.activity };

    return (
      <div 
        onClick={() => setSelectedSlot(session)}
        className={`h-full w-full p-2.5 rounded-xl border ${colorConfig.bg} transition hover:shadow-md cursor-pointer flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-[11px] truncate leading-tight">{colorConfig.label}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${colorConfig.badge}`}>
              {session.occupancy}/{session.maxCapacity}
            </span>
          </div>
          {session.trainer && (
            <p className="text-[10px] opacity-75 mt-1 truncate">Инструктор: {session.trainer}</p>
          )}
        </div>

        <div className="w-full bg-black/10 rounded-full h-1 mt-2 overflow-hidden">
          <div 
            className="h-1 bg-current opacity-60 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(100, (session.occupancy / session.maxCapacity) * 100)}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Шапка и живые сенсоры бассейна из БД */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pool Lanes & Timetable</h2>
          <p className="text-sm text-slate-500 mt-1">
            Интерактивная загрузка 6 плавательных дорожек (Live из PostgreSQL)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Вода</span>
              <span className="text-sm font-bold text-slate-800">27.4 °C</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Записано на день</span>
              <span className="text-sm font-bold text-slate-800">
                {loading ? '...' : `${scheduleData?.totalSwimmersInWater ?? 0} чел.`}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Бассейн</span>
              <span className="text-sm font-bold text-slate-800">25м / 6 дорожек</span>
            </div>
          </div>
        </div>
      </div>

      {/* Переключатель дней недели */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit text-xs font-semibold overflow-x-auto max-w-full">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              selectedDay === day
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* ТАБЛИЦА СЕТКИ ДОРОЖЕК */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          </div>
        )}

        <table className="w-full border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
              <th className="p-4 text-left w-40">Дорожка</th>
              {TIME_COLUMNS.map((time) => (
                <th key={time} className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{time}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {LANES.map((laneNum) => (
              <tr key={laneNum} className="hover:bg-slate-50/50 transition">
                <td className="p-4 font-bold text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xs">
                      {laneNum}
                    </div>
                    <div>
                      <span>Дорожка {laneNum}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {laneNum === 1 ? 'Мелкая зона (1.2м)' : laneNum === 6 ? 'Глубокая зона (2.2м)' : 'Стандарт (1.8м)'}
                      </span>
                    </div>
                  </div>
                </td>

                {TIME_COLUMNS.map((time) => (
                  <td key={time} className="p-2 w-48 h-20 align-top">
                    {renderSlotCell(laneNum, time)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* МОДАЛКА 1: Просмотр сеанса + Запись / Отмена записи */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Дорожка #{selectedSlot.laneNumber}</h3>
                <p className="text-[11px] text-slate-400">{selectedSlot.dayOfWeek}, {selectedSlot.timeSlot}</p>
              </div>
              <button 
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Тип активности:</span>
                <span className="font-bold text-sky-700">{selectedSlot.activity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Заполненность:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedSlot.occupancy} из {selectedSlot.maxCapacity} чел.
                </span>
              </div>
              {selectedSlot.trainer && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Инструктор / Арендатор:</span>
                  <span className="font-semibold text-slate-800">{selectedSlot.trainer}</span>
                </div>
              )}
            </div>

            {/* Кнопки управления записью */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleBookSpot(selectedSlot.id)}
                disabled={selectedSlot.occupancy >= selectedSlot.maxCapacity}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Записать человека на дорожку (+1)</span>
              </button>

              <button
                onClick={() => handleCancelSpot(selectedSlot.id)}
                disabled={selectedSlot.occupancy <= 0}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserMinus className="w-4 h-4" />
                <span>Отменить запись (-1)</span>
              </button>

              <button
                onClick={() => handleDeleteSession(selectedSlot.id)}
                className="w-full py-1.5 text-rose-500 hover:text-rose-700 text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить сеанс с дорожки</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА 2: Назначение сеанса на пустую ячейку */}
      {creatingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Назначить сеанс</h3>
                <p className="text-[11px] text-slate-400">Дорожка #{creatingSlot.lane} • {creatingSlot.time}</p>
              </div>
              <button 
                onClick={() => setCreatingSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Тип активности</label>
                <select
                  value={newActivity}
                  onChange={(e) => {
                    setNewActivity(e.target.value);
                    if (e.target.value === 'PrivateHire') setNewCapacity(1);
                    else if (e.target.value === 'AquaAerobics') setNewCapacity(12);
                    else setNewCapacity(8);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="FreeSwim">Свободное плавание</option>
                  <option value="AquaAerobics">Аквааэробика</option>
                  <option value="SportsClub">Спортивная секция</option>
                  <option value="PrivateHire">Аренда дорожки</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Вместимость (чел.)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Инструктор / Название (опционально)</label>
                <input
                  type="text"
                  placeholder="Например: Иван Тренер"
                  value={newTrainer}
                  onChange={(e) => setNewTrainer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreatingSlot(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
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