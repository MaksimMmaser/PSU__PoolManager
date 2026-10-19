import React from 'react';
import { DashboardMetrics } from '../Components/DashboardMetrics';
import { TransactionsTable } from '../Components/TransactionsTable';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Financial Dashboard</h2>
      <DashboardMetrics />
      <TransactionsTable />
    </div>
  );
};