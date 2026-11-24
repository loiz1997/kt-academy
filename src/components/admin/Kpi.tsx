// Small statistic card: icon, label, big number, optional progress bar and a hint line.
export default function Kpi({ id, icon, tint, label, value, hint, percent }: { id: string; icon: string; tint: string; label: string; value: string | number; hint: string; percent?: number }) {
  return (
    <div className="border border-slate-200 bg-white p-4 shadow-md" data-testid={id}>
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center text-lg ${tint}`} aria-hidden="true">{icon}</span>
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900" data-testid={`${id}-value`}>{value}</div>
      {percent != null && (
        <div className="mt-1.5 h-1.5 bg-slate-100"><div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, percent)}%` }} /></div>
      )}
      <div className="mt-1.5 text-xs text-slate-500">{hint}</div>
    </div>
  );
}
