import React, { createContext, useContext, useState } from 'react';
import type {ReactNode} from 'react';

interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

const DEFAULT_USER: User = {
  name: 'Максим (Администратор)',
  email: 'admin@poolfinance.org',
  role: 'Главный менеджер / Super Admin',
  avatar: 'AD'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Проверяем сессию в браузере, чтобы при F5 не выкидывало
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pool_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const login = (email: string, pass: string) => {
    if (email === 'admin@poolfinance.org' && pass === 'admin123') {
      setUser(DEFAULT_USER);
      localStorage.setItem('pool_auth_user', JSON.stringify(DEFAULT_USER));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pool_auth_user');
    setIsProfileOpen(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isProfileOpen, openProfile, closeProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};