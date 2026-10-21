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
  LogOut,
  X,
  Tag,
  ArrowRight
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
 import { API_BASE } from '../config';

interface ClientItem {
  id: number;
  fullName: string;
  category: string;
  visitsLeft: number;
}

interface ServiceItem {
  id: number;
  title: string;
  price: number;
}

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();

  // Состояние меню профиля
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Состояние глобального поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // 1. Подгружаем клиентов и услуги для глобального поиска
  useEffect(() => {
    fetch(`${API_BASE}/api/clients`)
fetch(`${API_BASE}/api/services`)
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(() => {});

    fetch('${API_BASE}/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(() => {});
  }, []);

  // 2. Закрытие окон при клике снаружи и по Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 3. Фильтрация данных по поисковому запросу
  const query = searchQuery.toLowerCase().trim();

  const matchingClients = query ? clients.filter(c => 
    c.fullName.toLowerCase().includes(query) || 
    c.category.toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingTransactions = query ? transactions.filter(t => 
    t.clientName.toLowerCase().includes(query) || 
    t.serviceItem.toLowerCase().includes(query) ||
    t.id.toString().includes(query)
  ).slice(0, 4) : [];

  const matchingServices = query ? services.filter(s => 
    s.title.toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const hasResults = matchingClients.length > 0 || matchingTransactions.length > 0 || matchingServices.length > 0;

  const handleSelectResult = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
      
      {/* Левая часть: Название и Умный поиск */}
      <div className="flex items-center gap-6">
        <NavLink to="/" className="font-bold text-slate-800 tracking-wider text-sm lg:text-base uppercase whitespace-nowrap">
          Pool Finance Tracker
        </NavLink>

        {/* КОНТЕЙНЕР ГЛОБАЛЬНОГО ПОИСКА */}
        <div className="relative w-72 lg:w-96" ref={searchRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          
          <input 
            type="text" 
            placeholder="Search clients, transactions, services..." 
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />

          {/* Кнопка быстрой очистки поля */}
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* ВЫПАДАЮЩЕЕ ОКНО РЕЗУЛЬТАТОВ ПОИСКА */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in duration-150 max-h-[480px] overflow-y-auto">
              
              {!hasResults ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  По запросу <strong className="text-slate-700">«{searchQuery}»</strong> ничего не найдено
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  
                  {/* Блок 1: Найденные клиенты */}
                  {matchingClients.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                        <Users className="w-3 h-3 text-sky-600" />
                        Клиенты ({matchingClients.length})
                      </span>
                      <div className="space-y-1">
                        {matchingClients.map(c => (
                          <div 
                            key={c.id}
                            onClick={() => handleSelectResult('/clients')}
                            className="p-2 rounded-xl hover:bg-sky-50 flex items-center justify-between cursor-pointer transition group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center">
                                {c.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 group-hover:text-sky-700">{c.fullName}</p>
                                <span className="text-[10px] text-slate-400">{c.category}</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                              {c.visitsLeft} визитов
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Блок 2: Найденные транзакции */}
                  {matchingTransactions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                        <ArrowLeftRight className="w-3 h-3 text-emerald-600" />
                        Транзакции ({matchingTransactions.length})
                      </span>
                      <div className="space-y-1">
                        {matchingTransactions.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => handleSelectResult('/transactions')}
                            className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition group"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-slate-400">#{t.id}</span>
                                <span className="font-semibold text-slate-700 group-hover:text-sky-700">{t.clientName}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{t.serviceItem}</span>
                            </div>
                            <span className="font-bold text-slate-800">
                              €{t.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Блок 3: Найденные услуги / тарифы */}
                  {matchingServices.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                        <Tag className="w-3 h-3 text-indigo-600" />
                        Услуги и тарифы ({matchingServices.length})
                      </span>
                      <div className="space-y-1">
                        {matchingServices.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => handleSelectResult('/services')}
                            className="p-2 rounded-xl hover:bg-indigo-50 flex items-center justify-between cursor-pointer transition group"
                          >
                            <span className="font-semibold text-slate-700 group-hover:text-indigo-700">{s.title}</span>
                            <span className="font-bold text-slate-800">€{s.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Подвал подсказки */}
              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between px-2">
                <span>Нажмите на результат для перехода</span>
                <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-mono">ESC для закрытия</kbd>
              </div>

            </div>
          )}
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

        {/* Меню профиля администратора */}
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

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Admin Account</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">admin@poolfinance.org</p>
              </div>

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