const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

// Round badge with the person's initials (photos come in a later step).
export default function Avatar({ name, size = 44, ring }: { name: string; size?: number; ring?: string }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 font-bold text-white"
      style={{ width: size, height: size, fontSize: size / 3.2, boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${ring}` : undefined }}
    >
      {initials(name)}
    </span>
  );
}
