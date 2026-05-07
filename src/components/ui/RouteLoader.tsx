import React from 'react';

/**
 * RouteLoader — Suspense fallback elegante
 * Usa tokens Clean Pro (slate palette). Zero dependências externas.
 */
export const RouteLoader: React.FC = () => (
  <div className="flex flex-col gap-5 p-5 animate-pulse">

    {/* Cabeçalho skeleton */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-200 flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3.5 w-40 rounded-full bg-slate-200" />
        <div className="h-2.5 w-24 rounded-full bg-slate-100" />
      </div>
    </div>

    {/* KPI row skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[100, 72, 88, 60].map((w, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2"
        >
          <div className="h-2 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
          <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
          <div className="h-2 w-1/2 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>

    {/* Content area skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
        <div className="h-3 w-32 rounded-full bg-slate-200" />
        <div className="h-[180px] rounded-xl bg-slate-100" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
        <div className="h-3 w-40 rounded-full bg-slate-200" />
        <div className="space-y-2.5 pt-1">
          {[90, 75, 60, 82, 55].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="h-2.5 rounded-full bg-slate-100 flex-1" style={{ width: `${w}%` }} />
              <div className="h-2.5 w-12 rounded-full bg-slate-200 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Wide card skeleton */}
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-36 rounded-full bg-slate-200" />
        <div className="h-6 w-20 rounded-lg bg-slate-100" />
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100" />
      <div className="h-2 w-5/6 rounded-full bg-slate-100" />
      <div className="h-2 w-4/6 rounded-full bg-slate-100" />
    </div>
  </div>
);
