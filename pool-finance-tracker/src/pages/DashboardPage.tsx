import React from 'react';
import { DashboardMetrics } from '../Components/DashboardMetrics';
import { TransactionsTable } from '../Components/TransactionsTable';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Финансовый дашборд
        </h2>
      </div>

      {/* Аналитический блок карточек и графиков */}
      <DashboardMetrics />

      {/* Таблица транзакций */}
      <TransactionsTable />
    </div>
  );
};