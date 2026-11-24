// Circle that fills up to the given percent.
export default function Ring({ percent, size = 132 }: { percent: number; size?: number }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${percent}% complete`} data-testid="progress-ring">
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d5efc" />
          <stop offset="1" stopColor="#14c8b4" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(80,90,150,.16)" strokeWidth={9} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="46%" textAnchor="middle" dy=".35em" fontSize={size / 4.6} fontWeight={800} fill="#1b2433">
        {percent}%
      </text>
      <text x="50%" y="66%" textAnchor="middle" fontSize={11} fill="#66728a">
        overall
      </text>
    </svg>
  );
}
