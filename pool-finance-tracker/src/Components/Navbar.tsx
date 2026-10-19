import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  Briefcase, 
  ChevronDown, 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие выпадающего меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 font-medium transition py-5 border-b-2 -mb-[1px] ${
      isActive
        ? 'border-sky-600 text-sky-600'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (window.confirm('Выйти из учетной записи администратора?')) {
      alert('Вы успешно вышли');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Левая часть: Название и Поиск */}
      <div className="flex items-center gap-6">
        <NavLink to="/" className="font-bold text-slate-800 tracking-wider text-sm lg:text-base uppercase whitespace-nowrap">
          Pool Finance Tracker
        </NavLink>

        <div className="relative w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search transactions, clients..." 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>
      </div>

      {/* Правая часть: Вкладки и Профиль */}
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/transactions" className={navLinkClass}>
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transactions</span>
          </NavLink>

          <NavLink to="/clients" className={navLinkClass}>
            <Users className="w-4 h-4" />
            <span>Clients</span>
          </NavLink>

          <NavLink to="/services" className={navLinkClass}>
            <Briefcase className="w-4 h-4" />
            <span>Services</span>
          </NavLink>
        </nav>

        {/* Профиль администратора с выпадающим меню */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 pl-4 border-l border-slate-200 cursor-pointer group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200 group-hover:bg-sky-200 transition">
              AD
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">
                Admin
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">Manager</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-sky-600' : 'group-hover:text-slate-600'}`} />
          </button>

          {/* Само выпадающее меню */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Шапка меню с почтой */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Admin Account</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">admin@poolfinance.org</p>
              </div>

              {/* Пункты меню */}
              <div className="py-1 text-xs">
                <button 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <NavLink 
                  to="/settings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </NavLink>

                <button 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Security & Roles</span>
                </button>
              </div>

              {/* Разделитель и выход */}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};