import React from 'react';
import { 
  Home, 
  Layers, 
  Users, 
  Calendar, 
  Wallet, 
  Settings, 
  HelpCircle, 
  LogOut,
  Waves
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Layers, label: 'Services & Tariffs', path: '/services' },
  { icon: Users, label: 'Clients & Members', path: '/clients' },
  { icon: Calendar, label: 'Pool Schedule', path: '/schedule' },
  { icon: Wallet, label: 'Transactions', path: '/transactions' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из системы администратора?')) {
      alert('Сессия завершена');
    }
  };

  return (
    <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-5 justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Верхний блок: Логотип и навигация */}
      <div className="flex flex-col items-center gap-7 w-full">
        {/* Логотип бассейна */}
        <NavLink 
          to="/" 
          title="Pool Finance Tracker"
          className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 hover:bg-sky-100 transition shadow-sm"
        >
          <Waves className="w-6 h-6 stroke-[2.2]" />
        </NavLink>

        {/* Навигационные иконки */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-100/80 text-sky-600 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />

                    {/* Тултип при наведении */}
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

      {/* Нижний блок: Помощь и выход */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button 
          title="Помощь и документация" 
          onClick={() => alert('Справка: Система учета работы бассейна v1.0\nТехподдержка: support@pooltracker.com')}
          className="group relative w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
        >
          <HelpCircle className="w-5 h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Help & Docs
          </span>
        </button>

        <button 
          title="Выйти" 
          onClick={handleLogout}
          className="group relative w-11 h-11 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
        >
          <LogOut className="w-5 h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};