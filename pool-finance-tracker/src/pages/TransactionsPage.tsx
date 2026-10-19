import React from 'react';
import { TransactionsTable } from '../Components/TransactionsTable';

export const TransactionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transactions History</h2>
          <p className="text-sm text-slate-500 mt-1">Полный журнал всех финансовых операций бассейна</p>
        </div>
      </div>
      <TransactionsTable />
    </div>
  );
};