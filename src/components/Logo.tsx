import { useId } from "react";

// KT Academy hexagon mark + wordmark. `light` = white text for dark backgrounds.
export default function Logo({ size = 38, light = false, tagline = true }: { size?: number; light?: boolean; tagline?: boolean }) {
  const g = "lg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className="inline-flex items-center gap-2.5" data-testid="logo">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6d5efc" /><stop offset="1" stopColor="#14c8b4" /></linearGradient>
        </defs>
        <path d="M24 2.5 43 13.5v21L24 45.5 5 34.5v-21z" fill={`url(#${g})`} stroke="#fff" strokeOpacity=".3" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M16 14v20M16 25l14-11" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="m21.5 27.5 4.5 4.5 9-10.5" stroke="#ffd166" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className={`font-extrabold leading-none tracking-tight ${light ? "text-white" : "text-slate-900"}`} style={{ fontSize: Math.round(size * 0.55) }}>
        <i className="bg-gradient-to-r bg-clip-text not-italic text-transparent" style={{ backgroundImage: light ? "linear-gradient(90deg,#c3bbff,#7ee8d9)" : "linear-gradient(90deg,#6d5efc,#14c8b4)" }}>KT</i> Academy
        {tagline && <small className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[.24em] opacity-65">Katalon Learning Hub</small>}
      </span>
    </span>
  );
}
