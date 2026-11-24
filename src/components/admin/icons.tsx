// Small line icons (same set as the standalone site).
const P: Record<string, string[]> = {
  inbox: ["M22 12h-6l-2 3h-4l-2-3H2", "M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"],
  clock: ["M12 7v5l3 2"],
  check: ["m5 12.5 4.5 4.5L19 7.5"],
  alert: ["M12 8v5", "M12 16.5v.01"],
  users: ["M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6", "M17 14c2.6.2 4.5 2 4.5 5"],
  trend: ["M3 17l6-6 4 4 8-9", "M15 6h6v6"],
  book: ["M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z", "M4 21.5A2.5 2.5 0 0 1 6.5 19H20"],
  award: ["M8.5 14 7 22l5-3 5 3-1.5-8"],
};
const C: Record<string, [number, number, number][]> = {
  clock: [[12, 12, 9]], alert: [[12, 12, 9]], users: [[9, 8, 3.5], [17.5, 9, 2.5]], award: [[12, 9, 6]],
};
export default function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {(C[name] ?? []).map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      {(P[name] ?? []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
