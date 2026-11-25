// The small page shown in the new tab while Google or GitHub is being opened.
// Same look as the app's own sign-in screen (dark gradient, rings, logo), so it never flashes white.
export function oauthTabHtml(name: string): string {
  const n = name.replace(/[^\w ]/g, "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signing in with ${n} · KT Academy</title><style>
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{display:grid;place-items:center;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;overflow:hidden;
background:radial-gradient(60% 50% at 20% 10%,rgba(109,94,252,.55),transparent 60%),radial-gradient(55% 55% at 85% 90%,rgba(20,200,180,.40),transparent 60%),#0b1030}
body:before{content:"";position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:44px 44px;-webkit-mask-image:radial-gradient(circle at 50% 50%,#000,transparent 75%);mask-image:radial-gradient(circle at 50% 50%,#000,transparent 75%)}
.box{position:relative;width:min(360px,88vw);padding:34px 26px 26px;text-align:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);box-shadow:0 30px 70px -20px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.15);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);display:grid;justify-items:center;gap:8px}
.orb{position:relative;width:120px;height:120px;display:grid;place-items:center;margin-bottom:8px}
.r{position:absolute;inset:0;border-radius:50%;border:2px dashed rgba(255,255,255,.28);animation:rot 9s linear infinite}
.r2{inset:12px;border-style:solid;border-color:rgba(255,255,255,.12) transparent rgba(20,200,180,.8) transparent;animation-duration:2.2s}
.r3{inset:-8px;border:2px solid transparent;border-top-color:#8b5cf6;border-bottom-color:#6d5efc;animation-duration:3.4s;animation-direction:reverse}
svg{position:relative;filter:drop-shadow(0 10px 20px rgba(109,94,252,.7));animation:fl 2.4s ease-in-out infinite}
b{font:800 20px Sora,Inter,sans-serif;letter-spacing:.2px}
span{font-size:13.5px;color:rgba(255,255,255,.72)}
.bar{width:100%;height:5px;margin-top:12px;background:rgba(255,255,255,.14);overflow:hidden}
.bar i{display:block;height:100%;width:40%;background:linear-gradient(90deg,#6d5efc,#14c8b4);animation:bar 1.3s ease-in-out infinite}
@keyframes rot{to{transform:rotate(360deg)}}@keyframes bar{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@media (prefers-reduced-motion:reduce){.r,svg,.bar i{animation:none}}
</style></head><body><div class="box" role="status"><div class="orb" aria-hidden="true"><i class="r r3"></i><i class="r"></i><i class="r r2"></i>
<svg viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7bff"/><stop offset="1" stop-color="#14c8b4"/></linearGradient></defs><polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="rgba(255,255,255,.08)" stroke="url(#g)" stroke-width="3.5" stroke-linejoin="round"/><path d="M21 33 L29 41 L44 25" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<b>Opening ${n}…</b><span>One moment, taking you to a secure sign-in</span><div class="bar"><i></i></div></div></body></html>`;
}
