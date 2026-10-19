import React from 'react';
import { Plus, Tag } from 'lucide-react';

const MOCK_SERVICES = [
  { id: 1, title: 'Single Entry', price: '€7.50', duration: '45 min', description: 'Разовое посещение бассейна в свободное время' },
  { id: 2, title: '8 Visits Subscription', price: '€45.00', duration: '1 month', description: 'Абонемент на 8 посещений (действует 30 дней)' },
  { id: 3, title: 'AquaAerobics Session', price: '€12.00', duration: '60 min', description: 'Групповое занятие с сертифицированным тренером' },
  { id: 4, title: 'Pool Lane Hire', price: '€35.00', duration: '60 min', description: 'Индивидуальная аренда плавательной дорожки' },
];

export const ServicesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Services & Pricing</h2>
          <p className="text-sm text-slate-500 mt-1">Управление тарифами, абонементами и доп. услугами</p>
        </div>
        <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {MOCK_SERVICES.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.description}</p>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800">{s.price}</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{s.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};