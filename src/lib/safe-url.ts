// Only web links (http or https) are allowed in href attributes.
// Anything else, such as javascript: or data:, is turned into a harmless "#".
export const isWebUrl = (u: unknown): u is string => {
  if (typeof u !== "string") return false;
  try {
    const p = new URL(u.trim());
    return p.protocol === "https:" || p.protocol === "http:";
  } catch {
    return false;
  }
};
export const safeHref = (u: unknown) => (isWebUrl(u) ? (u as string).trim() : "#");
