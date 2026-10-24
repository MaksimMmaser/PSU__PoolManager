import React from 'react';

// Базовый пульсирующий блок
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />
);

// 1. Скелетон строк для клиентов (Десктоп)
export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={idx} className="animate-pulse">
        <td className="py-3.5 px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
              <div className="h-2.5 w-14 bg-slate-200/60 rounded" />
            </div>
          </div>
        </td>
        <td className="py-3.5 px-5"><div className="h-5 w-20 bg-slate-200 rounded-md" /></td>
        <td className="py-3.5 px-5"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-5"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-5"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
        <td className="py-3.5 px-5 text-right"><div className="h-7 w-28 bg-slate-200 rounded-lg ml-auto" /></td>
      </tr>
    ))}
  </>
);

// 2. Скелетон карточек для клиентов (Мобилка) — ВОТ ОН!
export const MobileCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="divide-y divide-slate-100">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="p-3.5 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="w-28 h-3.5 bg-slate-200 rounded" />
              <div className="w-16 h-2.5 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-14 h-5 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-16 h-4 bg-slate-200 rounded" />
        </div>
        <div className="w-full h-9 bg-slate-200 rounded-xl" />
      </div>
    ))}
  </div>
);

// 3. Скелетон строк для транзакций (Десктоп)
export const TransactionRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={idx} className="animate-pulse">
        <td className="py-3.5 px-4"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-3.5 w-12 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-3.5 w-28 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-3.5 w-28 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-3.5 w-14 bg-slate-200 rounded" /></td>
        <td className="py-3.5 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
        <td className="py-3.5 px-4 text-right"><div className="h-6 w-14 bg-slate-200 rounded-lg ml-auto" /></td>
      </tr>
    ))}
  </>
);

// 4. Скелетон карточек транзакций (Мобилка)
export const TransactionCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="divide-y divide-slate-100">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="p-3.5 space-y-2.5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-slate-200 rounded" />
            <div className="w-28 h-4 bg-slate-200 rounded" />
          </div>
          <div className="w-14 h-4 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-24 h-3 bg-slate-200 rounded" />
          <div className="w-14 h-4 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="w-20 h-3 bg-slate-200 rounded" />
          <div className="w-16 h-4 bg-slate-200 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

// 5. Скелетон сетки дорожек (Десктоп)
export const ScheduleDesktopSkeleton: React.FC = () => (
  <tbody>
    {Array.from({ length: 6 }).map((_, laneIdx) => (
      <tr key={laneIdx} className="animate-pulse">
        <td className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200" />
            <div className="space-y-1">
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
              <div className="h-2.5 w-24 bg-slate-200/60 rounded" />
            </div>
          </div>
        </td>
        {Array.from({ length: 5 }).map((_, colIdx) => (
          <td key={colIdx} className="p-2 w-48 h-20 align-top">
            <div className="h-16 w-full rounded-xl bg-slate-100 border border-slate-200/60 p-2.5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-6 bg-slate-200 rounded" />
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full" />
            </div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// 6. Скелетон дорожек (Мобилка)
export const ScheduleMobileSkeleton: React.FC = () => (
  <div className="space-y-3.5">
    {Array.from({ length: 3 }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-3.5 space-y-2.5 animate-pulse">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-200" />
            <div className="h-3.5 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-2.5 w-24 bg-slate-200/60 rounded" />
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, sIdx) => (
            <div key={sIdx} className="h-11 rounded-xl bg-slate-100 border border-slate-200/60 p-2.5 flex items-center justify-between">
              <div className="h-3 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);