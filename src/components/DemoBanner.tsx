import { DEMO, ENV_LABEL } from "@/lib/demo";

// A thin bar on every page of the public demo, or of a labelled test site (for example QA).
export default function DemoBanner() {
  if (DEMO) {
    return (
      <div className="demo-bar" role="note" data-testid="demo-banner">
        <b>🧪 Live demo</b><span className="demo-long"> · Sample data shared by every visitor. It resets regularly, so feel free to explore.</span><span className="demo-short"> · Sample data, resets regularly</span>
      </div>
    );
  }
  if (!ENV_LABEL) return null;
  return (
    <div className="demo-bar qa" role="note" data-testid="env-banner">
      <b>🧪 {ENV_LABEL} environment</b><span className="demo-long"> · Test data only. Safe to break. Not the real site.</span><span className="demo-short"> · Test data only</span>
    </div>
  );
}
