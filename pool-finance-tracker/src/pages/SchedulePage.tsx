import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Thermometer, 
  Users, 
  Clock, 
  Plus, 
  X, 
  UserPlus, 
  Trash2, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { API_BASE } from '../config';
import { ScheduleDesktopSkeleton, ScheduleMobileSkeleton, Skeleton } from '../Components/Skeleton';
import { ConfirmModal } from '../Components/ConfirmModal';

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

interface ClientItem {
  id: number;
  fullName: string;
  category: string;
  visitsLeft: number;
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

// Дни недели: английский ключ для C# бэкенда, русское название для пользователя
const DAYS = [
  { key: 'Monday', label: 'Понедельник' },
  { key: 'Tuesday', label: 'Вторник' },
  { key: 'Wednesday', label: 'Среда' },
  { key: 'Thursday', label: 'Четверг' },
  { key: 'Friday', label: 'Пятница' },
  { key: 'Saturday', label: 'Суббота' },
  { key: 'Sunday', label: 'Воскресенье' },
];

export const SchedulePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Список всех клиентов
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Модалка просмотра / записи на сеанс
  const [selectedSlot, setSelectedSlot] = useState<PoolSession | null>(null);

  // Модалка удаления сеанса
  const [sessionToDelete, setSessionToDelete] = useState<PoolSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Модалка создания нового сеанса
  const [creatingSlot, setCreatingSlot] = useState<{ lane: number; time: string } | null>(null);
  const [newActivity, setNewActivity] = useState('FreeSwim');
  const [newCapacity, setNewCapacity] = useState(8);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 1. Загрузка расписания
  const fetchSchedule = async (day: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/api/schedule?day=' + day, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
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

  // 2. Загрузка клиентов из базы
  const fetchClientsList = async () => {
    try {
      const res = await fetch(API_BASE + '/api/clients', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (res.ok) {
        const data: ClientItem[] = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err);
    }
  };

  useEffect(() => {
    fetchClientsList();
  }, []);

  useEffect(() => {
    fetchSchedule(selectedDay);
  }, [selectedDay]);

  // Клиенты строго с > 0 визитов
  const eligibleClients = clients.filter(c => c.visitsLeft > 0);

  useEffect(() => {
    if (eligibleClients.length > 0) {
      if (!selectedClientId || !eligibleClients.some(c => c.id === selectedClientId)) {
        setSelectedClientId(eligibleClients[0].id);
      }
    } else {
      setSelectedClientId(null);
    }
  }, [clients, selectedClientId]);

  // 3. Запись клиента на дорожку
  const handleBookClient = async (sessionId: number) => {
    if (!selectedClientId) return;
    setBookingError(null);

    const clientToBook = clients.find(c => c.id === selectedClientId);
    if (!clientToBook) return;

    try {
      const res = await fetch(API_BASE + '/api/schedule/' + sessionId + '/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true' 
        },
        body: JSON.stringify({ 
          clientId: clientToBook.id,
          clientName: clientToBook.fullName 
        })
      });

      if (res.ok) {
        const updated: PoolSession = await res.json();
        setSelectedSlot(updated);
        
        setScheduleData(prev => prev ? {
          ...prev,
          totalSwimmersInWater: prev.totalSwimmersInWater + 1,
          sessions: prev.sessions.map(s => s.id === sessionId ? updated : s)
        } : null);

        setClients(prev => prev.map(c => 
          c.id === clientToBook.id 
            ? { ...c, visitsLeft: Math.max(0, c.visitsLeft - 1) } 
            : c
        ));
      } else {
        const err = await res.json();
        setBookingError(err.message || 'Ошибка записи на дорожку');
      }
    } catch (err) {
      console.error('Ошибка бронирования:', err);
      setBookingError('Ошибка связи с сервером');
    }
  };

  // 4. Снятие клиента с дорожки
  const handleCancelClient = async (sessionId: number, clientName: string) => {
    setBookingError(null);
    try {
      const res = await fetch(API_BASE + '/api/schedule/' + sessionId + '/cancel-booking', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true' 
        },
        body: JSON.stringify({ clientName })
      });

      if (res.ok) {
        const updated: PoolSession = await res.json();
        setSelectedSlot(updated);

        setScheduleData(prev => prev ? {
          ...prev,
          totalSwimmersInWater: Math.max(0, prev.totalSwimmersInWater - 1),
          sessions: prev.sessions.map(s => s.id === sessionId ? updated : s)
        } : null);

        setClients(prev => prev.map(c => 
          c.fullName.trim().toLowerCase() === clientName.trim().toLowerCase() 
            ? { ...c, visitsLeft: c.visitsLeft + 1 } 
            : c
        ));
      }
    } catch (err) {
      console.error('Ошибка отмены записи:', err);
    }
  };

  // 5. Живое изменение вместимости дорожки
  const handleUpdateCapacity = async (sessionId: number, newCapacity: number) => {
    setBookingError(null);
    try {
      const res = await fetch(API_BASE + '/api/schedule/' + sessionId + '/capacity', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ maxCapacity: newCapacity })
      });

      if (res.ok) {
        const updated: PoolSession = await res.json();
        setSelectedSlot(updated);
        
        setScheduleData(prev => prev ? {
          ...prev,
          sessions: prev.sessions.map(s => s.id === sessionId ? updated : s)
        } : null);
      } else {
        const err = await res.json();
        setBookingError(err.message || 'Ошибка изменения вместимости');
      }
    } catch (err) {
      console.error('Ошибка обновления лимита мест:', err);
      setBookingError('Ошибка связи с сервером');
    }
  };

  // 6. Бесшовное создание сеанса
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingSlot || isCreating) return;

    setCreateError(null);
    setIsCreating(true);

    try {
      const res = await fetch(API_BASE + '/api/schedule', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true' 
        },
        body: JSON.stringify({
          laneNumber: creatingSlot.lane,
          dayOfWeek: selectedDay,
          timeSlot: creatingSlot.time,
          activity: newActivity,
          maxCapacity: Number(newCapacity),
        }),
      });

      if (res.ok) {
        const newSession: PoolSession = await res.json();
        
        setScheduleData(prev => prev ? {
          ...prev,
          sessions: [...prev.sessions, newSession]
        } : null);

        setCreatingSlot(null);
        setSelectedSlot(newSession);
        setBookingError(null);
      } else {
        const err = await res.json();
        setCreateError(err.message || 'Ошибка создания сеанса');
      }
    } catch (err) {
      console.error('Ошибка создания сеанса:', err);
      setCreateError('Ошибка связи с сервером');
    } finally {
      setIsCreating(false);
    }
  };

  // 7. Подтвержденное удаление сеанса
  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(API_BASE + '/api/schedule/' + sessionToDelete.id, {
        method: 'DELETE',
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (res.ok) {
        setScheduleData(prev => prev ? {
          ...prev,
          totalSwimmersInWater: Math.max(0, prev.totalSwimmersInWater - sessionToDelete.occupancy),
          sessions: prev.sessions.filter(s => s.id !== sessionToDelete.id)
        } : null);

        setSessionToDelete(null);
        setSelectedSlot(null);
        fetchClientsList();
      }
    } catch (err) {
      console.error('Ошибка удаления сеанса:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getActivityConfig = (activity: string) => {
    return {
      'FreeSwim': { bg: 'bg-sky-50 border-sky-200 text-sky-800', badge: 'bg-sky-200/60 text-sky-700', label: 'Свободное плавание' },
      'AquaAerobics': { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-200/60 text-emerald-700', label: 'Аквааэробика' },
      'SportsClub': { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', badge: 'bg-indigo-200/60 text-indigo-700', label: 'Спортивная секция' },
      'PrivateHire': { bg: 'bg-amber-50 border-amber-200 text-amber-800', badge: 'bg-amber-200/60 text-amber-700', label: 'Аренда дорожки' },
    }[activity] || { bg: 'bg-slate-50 border-slate-200 text-slate-800', badge: 'bg-slate-200 text-slate-700', label: activity };
  };

  const renderSlotCell = (laneNum: number, time: string) => {
    const session = scheduleData?.sessions.find(s => s.laneNumber === laneNum && s.timeSlot === time);

    if (!session) {
      return (
        <button
          onClick={() => {
            setCreatingSlot({ lane: laneNum, time });
            setNewCapacity(8);
            setNewActivity('FreeSwim');
            setCreateError(null);
          }}
          title="Назначить сеанс на дорожку"
          className="h-full w-full min-h-[74px] rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition flex items-center justify-center text-slate-300 hover:text-sky-600 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      );
    }

    const colorConfig = getActivityConfig(session.activity);
    const attendeesList = session.trainer ? session.trainer.split(', ') : [];

    return (
      <div 
        onClick={() => {
          setSelectedSlot(session);
          setBookingError(null);
        }}
        className={`h-full w-full p-2.5 rounded-xl border ${colorConfig.bg} transition hover:shadow-md active:scale-[0.98] cursor-pointer flex flex-col justify-between select-none`}
      >
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-[11px] truncate leading-tight">{colorConfig.label}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${colorConfig.badge}`}>
              {session.occupancy}/{session.maxCapacity}
            </span>
          </div>
          {attendeesList.length > 0 && (
            <p className="text-[10px] opacity-80 mt-1 truncate">
              {attendeesList[0]} {attendeesList.length > 1 ? `+${attendeesList.length - 1}` : ''}
            </p>
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

  const bookedAttendees = selectedSlot?.trainer ? selectedSlot.trainer.split(', ') : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Шапка и сенсоры */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Расписание плавательных дорожек</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Управление загрузкой 6 дорожек и посещаемостью (Данные PostgreSQL)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex items-center gap-2 sm:gap-3">
          <div className="bg-white border border-slate-200/90 px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block leading-none">Темп. воды</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">27.4 °C</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block leading-none">Сейчас в воде</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {loading ? <Skeleton className="w-10 h-4 inline-block" /> : `${scheduleData?.totalSwimmersInWater ?? 0} чел.`}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/90 px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block leading-none">Характеристики</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">25м / 6 дорожек</span>
            </div>
          </div>
        </div>
      </div>

      {/* Дни недели на русском языке */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit text-xs font-semibold overflow-x-auto max-w-full shrink-0">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              selectedDay === day.key
                ? 'bg-white text-slate-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* 1. МОБИЛЬНЫЙ ВИД */}
      <div className="block lg:hidden space-y-3.5">
        {loading ? (
          <ScheduleMobileSkeleton />
        ) : (
          LANES.map((laneNum) => (
            <div key={laneNum} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {laneNum}
                  </div>
                  <span className="font-bold text-slate-800 text-sm">Дорожка {laneNum}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {laneNum === 1 ? 'Мелкая зона (1.2м)' : laneNum === 6 ? 'Глубокая зона (2.2м)' : 'Стандарт (1.8м)'}
                </span>
              </div>

              <div className="space-y-1.5">
                {TIME_COLUMNS.map((time) => {
                  const session = scheduleData?.sessions.find(s => s.laneNumber === laneNum && s.timeSlot === time);

                  if (!session) {
                    return (
                      <div 
                        key={time}
                        onClick={() => {
                          setCreatingSlot({ lane: laneNum, time });
                          setNewCapacity(8);
                          setNewActivity('FreeSwim');
                          setCreateError(null);
                        }}
                        className="p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400 hover:text-sky-600 hover:border-sky-300 transition active:scale-[0.99] cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-medium text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {time}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Plus className="w-3.5 h-3.5" />
                          Свободно (назначить сеанс)
                        </span>
                      </div>
                    );
                  }

                  const colorConfig = getActivityConfig(session.activity);
                  const attendees = session.trainer ? session.trainer.split(', ') : [];

                  return (
                    <div
                      key={time}
                      onClick={() => {
                        setSelectedSlot(session);
                        setBookingError(null);
                      }}
                      className={`p-2.5 rounded-xl border ${colorConfig.bg} flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] transition`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {time}
                        </span>
                        <span className="font-bold text-xs truncate">{colorConfig.label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {attendees.length > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline truncate max-w-[100px]">
                            {attendees[0]}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colorConfig.badge}`}>
                          {session.occupancy}/{session.maxCapacity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. ДЕСКТОПНЫЙ ВИД */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto relative">
        <table className="w-full border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 select-none">
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
          {loading ? (
            <ScheduleDesktopSkeleton />
          ) : (
            <tbody className="divide-y divide-slate-100 text-xs">
              {LANES.map((laneNum) => (
                <tr key={laneNum} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-slate-800 select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xs shrink-0">
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
          )}
        </table>
      </div>

      {/* МОДАЛКА: Просмотр сеанса + Живое изменение вместимости */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden p-5 animate-in zoom-in-95 duration-150 select-none">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Дорожка #{selectedSlot.laneNumber}</h3>
                <p className="text-[11px] text-slate-400">
                  {DAYS.find(d => d.key === selectedSlot.dayOfWeek)?.label || selectedSlot.dayOfWeek}, {selectedSlot.timeSlot}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:scale-95 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3.5 space-y-4 text-xs overflow-y-auto flex-1">
              
              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Параметры сеанса */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Тип активности:</span>
                  <span className="font-bold text-sky-700">{getActivityConfig(selectedSlot.activity).label}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Заполненность:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedSlot.occupancy} из {selectedSlot.maxCapacity} мест
                  </span>
                </div>

                {/* Редактирование вместимости */}
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-700 font-bold block">Лимит дорожки:</span>
                    <span className="text-[10px] text-slate-400">Свободно мест: {Math.max(0, selectedSlot.maxCapacity - selectedSlot.occupancy)}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateCapacity(selectedSlot.id, selectedSlot.maxCapacity - 1)}
                      disabled={selectedSlot.maxCapacity <= selectedSlot.occupancy || selectedSlot.maxCapacity <= 1}
                      title="Уменьшить лимит мест"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center font-extrabold text-sm transition active:scale-90 cursor-pointer disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="px-2 text-xs font-black text-slate-800 min-w-[24px] text-center">
                      {selectedSlot.maxCapacity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateCapacity(selectedSlot.id, selectedSlot.maxCapacity + 1)}
                      disabled={selectedSlot.maxCapacity >= 30}
                      title="Увеличить лимит мест"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center font-extrabold text-sm transition active:scale-90 cursor-pointer disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-1.5 bg-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (selectedSlot.occupancy / selectedSlot.maxCapacity) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Список записанных пловцов */}
              <div>
                <span className="font-bold text-slate-700 block mb-2 text-xs">
                  Записанные посетители ({bookedAttendees.length}):
                </span>

                {bookedAttendees.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    На этой дорожке пока нет записанных посетителей
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {bookedAttendees.map((name, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded-xl bg-sky-50/60 border border-sky-100 text-slate-800"
                      >
                        <span className="font-semibold text-xs truncate pr-2 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          {name}
                        </span>
                        <button
                          onClick={() => handleCancelClient(selectedSlot.id, name)}
                          title="Снять с дорожки и вернуть визит"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition active:scale-90 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Выбор клиента */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-700 text-xs">
                  Записать клиента из базы:
                </label>
                
                {eligibleClients.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>В базе нет клиентов с доступными визитами (у всех 0 занятий). Пополните абонемент клиенту!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={selectedClientId ?? ''}
                      onChange={(e) => {
                        setSelectedClientId(Number(e.target.value));
                        setBookingError(null);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      {eligibleClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.visitsLeft} визитов)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleBookClient(selectedSlot.id)}
                      disabled={selectedSlot.occupancy >= selectedSlot.maxCapacity || !selectedClientId}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Записать</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setSessionToDelete(selectedSlot)}
                className="w-full py-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Освободить дорожку (удалить сеанс)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* МОДАЛКА 2: Назначение сеанса */}
      {creatingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden p-4 sm:p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Назначить сеанс на дорожку</h3>
                <p className="text-[11px] text-slate-400">Дорожка #{creatingSlot.lane} • {creatingSlot.time}</p>
              </div>
              <button 
                onClick={() => setCreatingSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:scale-95 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSession} className="py-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
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
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="FreeSwim">Свободное плавание (8 мест)</option>
                  <option value="AquaAerobics">Аквааэробика (12 мест)</option>
                  <option value="SportsClub">Спортивная секция (8 мест)</option>
                  <option value="PrivateHire">Аренда дорожки (1 место)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Лимит мест (чел.)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreatingSlot(null)}
                  disabled={isCreating}
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition active:scale-[0.98] cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Создание...' : 'Сохранить сеанс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка удаления сеанса */}
      <ConfirmModal
        isOpen={sessionToDelete !== null}
        title={`Освободить дорожку #${sessionToDelete?.laneNumber}?`}
        message={`Вы уверены, что хотите удалить сеанс (${sessionToDelete?.timeSlot})? Все текущие бронирования будут аннулированы, а дорожка станет свободной.`}
        confirmText="Да, освободить"
        cancelText="Отмена"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteSession}
        onClose={() => setSessionToDelete(null)}
      />

    </div>
  );
};