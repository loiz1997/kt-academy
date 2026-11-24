import { DEMO } from "@/lib/demo";

// A thin bar shown on every page of the public demo only.
export default function DemoBanner() {
  if (!DEMO) return null;
  return (
    <div className="demo-bar" role="note" data-testid="demo-banner">
      <b>🧪 Live demo</b> · Sample data shared by every visitor. It resets regularly, so feel free to explore.
    </div>
  );
}
