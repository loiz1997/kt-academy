"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Thin bar at the top. Starts when the user clicks an internal link, stops when the new page arrives.
export default function RouteProgress() {
  const path = usePathname();
  const [on, setOn] = useState(false);

  useEffect(() => { setOn(false); }, [path]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      setOn(true);
      clearTimeout(t);
      t = setTimeout(() => setOn(false), 10000); // safety: never hang
    };
    document.addEventListener("click", click, true);
    return () => { document.removeEventListener("click", click, true); clearTimeout(t); };
  }, []);

  return <div className={`rpbar ${on ? "on" : ""}`} aria-hidden="true" data-testid="route-progress"><i /></div>;
}
