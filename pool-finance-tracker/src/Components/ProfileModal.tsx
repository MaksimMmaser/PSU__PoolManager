import React from 'react';
import { X, Shield, Mail, UserCheck, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileModal: React.FC = () => {
  const { user, isProfileOpen, closeProfile } = useAuth();

  if (!isProfileOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-5 animate-in zoom-in-95 duration-150">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Профиль администратора</h3>
          <button 
            onClick={closeProfile}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:scale-95 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Аватар и статус */}
        <div className="py-5 text-center flex flex-col items-center border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 font-bold text-xl flex items-center justify-center border-2 border-sky-300 shadow-xs mb-2.5">
            {user.avatar}
          </div>
          <h4 className="font-bold text-slate-800 text-base">{user.name}</h4>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1.5">
            <Shield className="w-3 h-3 text-emerald-600" />
            {user.role}
          </span>
        </div>

        {/* Данные учетной записи */}
        <div className="py-4 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" /> Эл. почта
            </span>
            <span className="font-mono text-slate-800">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="flex items-center gap-1.5 text-slate-400">
              <UserCheck className="w-3.5 h-3.5" /> Смена кассы
            </span>
            <span className="font-semibold text-slate-700">08:00 — 20:00 (Активна)</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Award className="w-3.5 h-3.5" /> Уровень доступа
            </span>
            <span className="font-semibold text-sky-600">Полный (Касса, База, Дорожки)</span>
          </div>
        </div>

        <button
          onClick={closeProfile}
          className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition active:scale-[0.98] cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};