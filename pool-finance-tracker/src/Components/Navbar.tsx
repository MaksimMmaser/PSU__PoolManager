import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  Briefcase, 
  ChevronDown, 
  User, 
  LogOut, 
  X, 
  Tag 
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout, openProfile } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(API_BASE + '/api/clients', {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    })
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(() => {});

    fetch(API_BASE + '/api/services', {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    })
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(() => {});
  }, []);

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
    `flex items-center gap-2 font-medium transition py-5 border-b-2 -mb-[1px] whitespace-nowrap ${
      isActive
        ? 'border-sky-600 text-sky-600 font-semibold'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (window.confirm('Вы действительно хотите выйти из учётной записи администратора?')) {
      logout();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      
      {/* Левая часть: Название и Поиск */}
      <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 flex-1 min-w-0 mr-2 sm:mr-4">
        <NavLink 
          to="/" 
          className="font-bold text-slate-800 tracking-wider text-xs sm:text-sm lg:text-base uppercase whitespace-nowrap shrink-0 transition hover:text-sky-600"
        >
          <span className="hidden sm:inline">Бассейн ПолесГУ • Учёт</span>
          <span className="inline sm:hidden font-extrabold text-sky-600">Бассейн ПГУ</span>
        </NavLink>

        {/* Контейнер глобального поиска */}
        <div className="relative flex-1 max-w-[170px] xs:max-w-[210px] sm:max-w-xs md:max-w-sm lg:max-w-md" ref={searchRef}>
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          
          <input 
            type="text" 
            placeholder="Поиск клиентов, операций, тарифов..." 
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />

          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Результаты поиска */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-[-2rem] xs:left-0 mt-2 w-[calc(100vw-1.5rem)] xs:w-[320px] sm:w-[380px] md:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in duration-150 max-h-[75vh] overflow-y-auto">
              
              {!hasResults ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  По запросу <strong className="text-slate-700">«{searchQuery}»</strong> ничего не найдено
                </div>
              ) : (
                <div className="space-y-3 text-xs">
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
                            <div className="flex items-center gap-2 truncate pr-2">
                              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {c.fullName.charAt(0)}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-slate-800 group-hover:text-sky-700 truncate">{c.fullName}</p>
                                <span className="text-[10px] text-slate-400">{c.category}</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md shrink-0">
                              {c.visitsLeft} визитов
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingTransactions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5 mb-1">
                        <ArrowLeftRight className="w-3 h-3 text-emerald-600" />
                        Операции кассы ({matchingTransactions.length})
                      </span>
                      <div className="space-y-1">
                        {matchingTransactions.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => handleSelectResult('/transactions')}
                            className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition group"
                          >
                            <div className="truncate pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-slate-400">#{t.id}</span>
                                <span className="font-semibold text-slate-700 group-hover:text-sky-700 truncate">{t.clientName}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate block">{t.serviceItem}</span>
                            </div>
                            <span className="font-bold text-slate-800 shrink-0">
                              €{t.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                            <span className="font-semibold text-slate-700 group-hover:text-indigo-700 truncate pr-2">{s.title}</span>
                            <span className="font-bold text-slate-800 shrink-0">€{s.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between px-2">
                <span>Нажмите для быстрого перехода</span>
                <kbd className="hidden sm:inline bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-mono">ESC</kbd>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Правая часть: Вкладки и Профиль */}
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 shrink-0">
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Дашборд</span>
          </NavLink>
          
          <NavLink to="/transactions" className={navLinkClass}>
            <ArrowLeftRight className="w-4 h-4" />
            <span>Транзакции</span>
          </NavLink>

          <NavLink to="/clients" className={navLinkClass}>
            <Users className="w-4 h-4" />
            <span>Клиенты</span>
          </NavLink>

          <NavLink to="/services" className={navLinkClass}>
            <Briefcase className="w-4 h-4" />
            <span>Услуги и тарифы</span>
          </NavLink>
        </nav>

        {/* Профиль администратора */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-4 border-l border-slate-200 cursor-pointer group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200 group-hover:bg-sky-200 transition shrink-0">
              {user?.avatar || 'АД'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">
                {user?.name.split(' ')[0] || 'Администратор'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">Главная касса</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-sky-600' : 'group-hover:text-slate-600'}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in duration-150 select-none">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Администратор'}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email || 'admin@poolfinance.org'}</p>
              </div>

              <div className="py-1 text-xs">
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openProfile();
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Мой профиль</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти из системы</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};