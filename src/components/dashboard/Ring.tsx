// Progress ring on the dark hero (white text, glowing teal arc).
export default function Ring({ percent, size = 132 }: { percent: number; size?: number }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${percent}% complete`} data-testid="progress-ring">
      <defs>
        <linearGradient id="urg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#5eead4" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={9} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#urg)" strokeWidth={9} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: "drop-shadow(0 0 8px rgba(94,234,212,.7))" }}
      />
      <text x="50%" y="46%" textAnchor="middle" dy=".35em" fill="#fff" fontSize={Math.round(size / 4.6)} fontWeight={800} fontFamily="var(--font-sora), sans-serif">{percent}%</text>
      <text x="50%" y="66%" textAnchor="middle" fill="#fff" opacity={0.7} fontSize={11} fontFamily="var(--font-inter), sans-serif">overall</text>
    </svg>
  );
}
