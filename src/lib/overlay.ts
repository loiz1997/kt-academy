// Loading screen and toast messages (same behaviour as the first version of the site).
export type LoadingState = { title: string; sub: string; cancel?: () => void } | null;
export type ToastState = { title: string; msg: string; icon: string; cls: string } | null;

const bus = new EventTarget();
let shownAt = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const emit = (name: string, detail: unknown) => bus.dispatchEvent(new CustomEvent(name, { detail }));
export const onLoading = (fn: (s: LoadingState) => void) => {
  const h = (e: Event) => fn((e as CustomEvent).detail);
  bus.addEventListener("loading", h);
  return () => bus.removeEventListener("loading", h);
};
export const onToast = (fn: (s: ToastState) => void) => {
  const h = (e: Event) => fn((e as CustomEvent).detail);
  bus.addEventListener("toast", h);
  return () => bus.removeEventListener("toast", h);
};

// With a delay the screen only appears when the wait is longer than that.
export function showLoading(title: string, sub = "", delay = 0, cancel?: () => void) {
  if (timer) clearTimeout(timer);
  const go = () => { shownAt = Date.now(); emit("loading", { title, sub, cancel }); };
  if (delay) timer = setTimeout(go, delay);
  else go();
}

export function hideLoading() {
  if (timer) clearTimeout(timer);
  const wait = Math.max(0, 200 - (Date.now() - shownAt));
  setTimeout(() => emit("loading", null), wait);
}

export function toast(title: string, msg: string, icon = "🚧", cls = "") {
  if (toastTimer) clearTimeout(toastTimer);
  emit("toast", { title, msg, icon, cls });
  toastTimer = setTimeout(() => emit("toast", null), 5500);
}
export const closeToast = () => emit("toast", null);

export const soonToast = () =>
  toast("Lesson in development", "This lesson is still being prepared by your KT team. It will be available soon, so please check back later.");
