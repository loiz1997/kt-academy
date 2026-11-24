// Loading state while a page fetches data: the KT hexagon draws itself, a check pops in,
// and soft placeholder cards shimmer underneath. Pure CSS/SVG, no images, no libraries.
export default function PageLoading() {
  return (
    <>
      <div className="rpbar on" aria-hidden="true"><i /></div>
      <main className="kl-page" role="status" aria-live="polite" aria-label="Loading" data-testid="page-loading">
        <div className="kl-wrap">
          <svg className="kl-logo" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
            <defs>
              <linearGradient id="klg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6d5efc" />
                <stop offset="1" stopColor="#14c8b4" />
              </linearGradient>
            </defs>
            <polygon className="kl-hexbg" points="32,4 56,18 56,46 32,60 8,46 8,18" />
            <polygon className="kl-hex" points="32,4 56,18 56,46 32,60 8,46 8,18" />
            <path className="kl-check" d="M21 33 L29 41 L44 25" />
          </svg>
          <div className="kl-dots" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </main>
    </>
  );
}
