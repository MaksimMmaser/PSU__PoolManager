import React from 'react';
import { UserCheck, Search, Filter, Plus } from 'lucide-react';

const MOCK_CLIENTS = [
  { id: 1, name: 'Ivan Ivanov', category: 'Students PGU', visitsLeft: 6, totalSpent: '€180.00', status: 'Active' },
  { id: 2, name: 'Alex Petrov', category: 'External', visitsLeft: 1, totalSpent: '€45.00', status: 'Active' },
  { id: 3, name: 'Elena Smirnova', category: 'Staff PGU', visitsLeft: 8, totalSpent: '€240.00', status: 'Active' },
  { id: 4, name: 'Dmitry Kozlov', category: 'External', visitsLeft: 0, totalSpent: '€15.00', status: 'Expired' },
];

export const ClientsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clients & Members</h2>
          <p className="text-sm text-slate-500 mt-1">База посетителей и учет оставшихся посещений</p>
        </div>
        <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
              <th className="py-3 px-5">Name</th>
              <th className="py-3 px-5">Category</th>
              <th className="py-3 px-5">Remaining Visits</th>
              <th className="py-3 px-5">Total Paid</th>
              <th className="py-3 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {MOCK_CLIENTS.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[11px]">
                    {c.name.charAt(0)}
                  </div>
                  {c.name}
                </td>
                <td className="py-3.5 px-5">{c.category}</td>
                <td className="py-3.5 px-5 font-semibold text-slate-700">{c.visitsLeft} visits</td>
                <td className="py-3.5 px-5 font-medium">{c.totalSpent}</td>
                <td className="py-3.5 px-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};