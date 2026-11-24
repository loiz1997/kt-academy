const initials = (n?: string | null) => (n || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";

// Round badge with photo or initials, same look as the first version (class "av").
export default function Av({ name, src, className = "av", style }: { name?: string | null; src?: string | null; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" /> : initials(name)}
    </div>
  );
}
