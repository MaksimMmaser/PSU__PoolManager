import React from 'react';
import { 
  Home, 
  Layers, 
  Users, 
  Calendar, 
  Wallet, 
  HelpCircle, 
  LogOut,
  Waves
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Главная', path: '/' },
  { icon: Layers, label: 'Тарифы', path: '/services' },
  { icon: Users, label: 'Клиенты', path: '/clients' },
  { icon: Calendar, label: 'Дорожки', path: '/schedule' },
  { icon: Wallet, label: 'Касса', path: '/transactions' },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из системы администратора?')) {
      logout();
    }
  };

  return (
    <>
      {/* 1. ДЕСКТОПНЫЙ ВЕРТИКАЛЬНЫЙ САЙДБАР (Экраны md: 768px+) */}
      <aside className="hidden md:flex w-16 bg-white border-r border-slate-200/90 flex-col items-center py-5 justify-between shrink-0 h-screen sticky top-0 z-30 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Верхний блок: Логотип и навигация */}
        <div className="flex flex-col items-center gap-6 xl:gap-7 w-full">
          {/* Логотип бассейна */}
          <NavLink 
            to="/" 
            title="Бассейн ПГУ • Финансовый учёт"
            className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 hover:bg-sky-100 transition shadow-xs active:scale-95"
          >
            <Waves className="w-6 h-6 stroke-[2.2]" />
          </NavLink>

          {/* Навигационные иконки */}
          <nav className="flex flex-col items-center gap-2.5 xl:gap-3 w-full px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    `group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-sky-100/80 text-sky-600 shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />

                      {/* Тултип на русском языке */}
                      <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Нижний блок: Справка и выход */}
        <div className="flex flex-col items-center gap-2.5 w-full px-2">
          <button 
            title="Справка" 
            onClick={() => alert('Справка: Система учёта работы бассейна ПГУ v1.0\nТехподдержка: support@pooltracker.org')}
            className="group relative w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Справка
            </span>
          </button>

          <button 
            title="Выход" 
            onClick={handleLogout}
            className="group relative w-11 h-11 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-5 h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Выход
            </span>
          </button>
        </div>
      </aside>

      {/* 2. МОБИЛЬНЫЙ НИЖНИЙ НАВБАР (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 flex items-center justify-around px-2 select-none shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all active:scale-90 ${
                  isActive
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-50' : ''}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};