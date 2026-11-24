import Icon from "./icons";

// Small statistic card (same look as the standalone site): icon, label, big number, optional bar, hint.
export default function Kpi({ id, icon, color, bg, label, value, hint, percent }: { id: string; icon: string; color: string; bg: string; label: string; value: string | number; hint: string; percent?: number }) {
  return (
    <div className="card kpi" data-testid={id}>
      <div className="kt">
        <div className="ki" style={{ background: bg, color }}><Icon name={icon} /></div>
        <div className="ks" style={{ fontWeight: 600 }}>{label}</div>
      </div>
      <div className="kv" data-testid={`${id}-value`}>{value}</div>
      {percent != null && <div className="bar" style={{ height: 6 }}><i style={{ width: `${Math.min(100, percent)}%`, background: color }} /></div>}
      <div className="ks">{hint}</div>
    </div>
  );
}
