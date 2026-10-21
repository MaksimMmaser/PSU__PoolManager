import React, { createContext, useContext, useState, useEffect } from 'react';
import type {ReactNode} from 'react';
import type { Transaction } from '../Types';
import { API_BASE } from '../config';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'dateTime' | 'status'>) => Promise<void>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// URL нашего C# бэкенда
const API_URL = `${API_BASE}/api/transactions`;

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 1. Загрузка транзакций
  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true', // Пропуск ошибки 511!
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки транзакций с C# бэкенда:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Добавление транзакции
  const addTransaction = async (newTxData: Omit<Transaction, 'id' | 'dateTime' | 'status'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true', // Пропуск ошибки 511!
        },
        body: JSON.stringify(newTxData),
      });

      if (response.ok) {
        const createdTransaction = await response.json();
        setTransactions(prev => [createdTransaction, ...prev]);
      }
    } catch (error) {
      console.error('Ошибка создания транзакции:', error);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, isModalOpen, openModal, closeModal, loading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};