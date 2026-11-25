// Line graph of average progress per tribe (same drawing as the standalone site).
export type TribeGroup = { t: string; n: number; a: number; c: number; col: string };

export default function LineChart({ g }: { g: TribeGroup[] }) {
  const W = 760, H = 330, L = 44, R = 18, T = 18, B = 84;
  const bw = (W - L - R) / g.length, iw = H - T - B;
  const X = (i: number) => L + (i + 0.5) * bw;
  const Y = (v: number) => T + iw * (1 - v / 100);
  const segs: number[][][] = [];
  let cur: number[][] = [];
  g.forEach((r, i) => {
    if (r.n) cur.push([X(i), Y(r.a)]);
    else { if (cur.length) segs.push(cur); cur = []; }
  });
  if (cur.length) segs.push(cur);
  const multi = segs.filter((s) => s.length > 1);
  const wrap = (t: string) => {
    const lines: string[] = [];
    let l = "";
    t.split(" ").forEach((w) => { if ((l + " " + w).trim().length > 12 && l) { lines.push(l); l = w; } else l = (l + " " + w).trim(); });
    lines.push(l);
    return lines;
  };
  return (
    <svg data-testid="admin-tribe-line-chart" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 560, display: "block" }} role="img" aria-label="Line graph of average training progress per tribe">
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d5efc" stopOpacity=".25" />
          <stop offset="1" stopColor="#6d5efc" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--br)" strokeDasharray={v ? "3 4" : "0"} />
          <text x={L - 8} y={Y(v)} textAnchor="end" dy=".35em" style={{ fill: "var(--mu)", font: "600 11px var(--font-inter), sans-serif" }}>{v}%</text>
        </g>
      ))}
      {multi.map((s, i) => <path key={"a" + i} d={`M${s[0][0]},${Y(0)} L${s.map((p) => p.join(",")).join(" L")} L${s[s.length - 1][0]},${Y(0)}Z`} fill="url(#lcg)" />)}
      {multi.map((s, i) => <path key={"l" + i} d={`M${s.map((p) => p.join(",")).join(" L")}`} fill="none" stroke="#6d5efc" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />)}
      {g.map((r, i) => {
        const lines = wrap(r.t);
        const lab = (
          <text textAnchor="middle" style={{ fill: "var(--tx)", font: "600 11.5px var(--font-inter), sans-serif" }}>
            {lines.map((x, k) => <tspan key={k} x={X(i)} y={H - B + 22 + k * 14}>{x}</tspan>)}
            <tspan x={X(i)} y={H - B + 22 + lines.length * 14} style={{ fill: "var(--mu)", fontWeight: 400, fontSize: "10.5px" }}>{r.n ? `${r.n} ${r.n === 1 ? "trainee" : "trainees"}` : "none yet"}</tspan>
          </text>
        );
        return r.n ? (
          <g key={r.t}>
            {lab}
            <text x={X(i)} y={Y(r.a) - 12} textAnchor="middle" style={{ fill: "var(--tx)", font: "800 12px var(--font-sora), sans-serif" }}>{r.a}%</text>
            <circle cx={X(i)} cy={Y(r.a)} r="6" fill={r.col} stroke="var(--card)" strokeWidth="2.5"><title>{`${r.t}: ${r.a}% · ${r.n} trainee${r.n === 1 ? "" : "s"} · ${r.c} certificate${r.c === 1 ? "" : "s"}`}</title></circle>
          </g>
        ) : (
          <g key={r.t}>
            {lab}
            <circle cx={X(i)} cy={Y(0)} r="4" fill="var(--card)" stroke="var(--br)" strokeWidth="2"><title>{`${r.t}: no trainees yet`}</title></circle>
          </g>
        );
      })}
    </svg>
  );
}
