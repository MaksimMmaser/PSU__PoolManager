import React from 'react';
import { TransactionsTable } from '../Components/TransactionsTable';

export const TransactionsPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Transactions History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Полный журнал всех финансовых операций бассейна
          </p>
        </div>
      </div>

      {/* Адаптивная таблица транзакций */}
      <TransactionsTable />
    </div>
  );
};