export type Theme = "light" | "dark";
const KEY = "kt-theme";

// Reads the saved theme (light is the default).
export function savedTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

// Switches the whole site and remembers the choice on this device.
export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {}
  window.dispatchEvent(new Event("kt-theme"));
}

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
