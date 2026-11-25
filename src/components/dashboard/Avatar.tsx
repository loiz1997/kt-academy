const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

// Round badge: the person's photo if they added one, otherwise their initials.
export default function Avatar({ name, size = 44, ring, src }: { name: string; size?: number; ring?: string; src?: string | null }) {
  const style = { width: size, height: size, fontSize: size / 3.2, boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${ring}` : undefined };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-testid="avatar-image" src={src} alt="" className="inline-block shrink-0 rounded-full object-cover" style={style} />;
  }
  return (
    <span className="inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 font-bold text-white" style={style}>
      {initials(name)}
    </span>
  );
}
