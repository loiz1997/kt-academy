import type { Doc } from "./types";

// Lessons that are not ready yet. They are shown as "coming soon".
const SOON = ["TestOps: Test Plans", "Tools Cheat Sheet"];
export const isSoon = (d: Doc) => SOON.some((k) => d.t.startsWith(k));
export const activeDocs = (docs: Doc[]) => docs.filter((d) => !isSoon(d));

const d = (id: number, t: string, c: Doc["c"], l: string, b: string): Doc => ({ id, t, c, l, u: "", b });

// Lessons 5 to 16 live in the code (the first ones come from the database), same as the old site.
const NEWDOCS: Doc[] = [
  d(9005, "TestOps: Create Manual & Automated Test Cases", "TestOps", "Beginner", "Create a manual test case with steps in TestOps and see how automated tests from Katalon Studio are managed."),
  d(9006, "TestOps: Create Test Suites", "TestOps", "Beginner", "Group existing manual and automated test cases into a Test Suite in TestOps."),
  d(9007, "TestOps: Run with AI", "TestOps", "Beginner", "Run manual test cases with AI in Katalon TestOps and review the results and evidence."),
  d(9008, "Custom Keywords in Katalon Studio", "Local", "Intermediate", "Create a reusable Groovy keyword that checks text, then use it in a local Web UI test."),
  d(9009, "Test Listeners in Katalon Studio", "Local", "Intermediate", "Create a Test Listener that opens the browser before each test and closes it after, without repeating steps."),
  d(9010, "Checkpoints in Katalon Studio", "Local", "Intermediate", "Save expected database results in a Checkpoint and compare them with live data during a test."),
  d(9011, "Profiles and Global Variables in Katalon Studio", "Local", "Intermediate", "Use Execution Profiles and Global Variables to run one test with different settings."),
  d(9012, "Connecting Katalon Studio to GitHub", "Tools", "Advanced", "Connect a Katalon project to GitHub, use a feature branch, and safely commit, push and pull."),
  d(9013, "Run Tests Using Katalon Runtime Engine (KRE)", "Local", "Intermediate", "Run a Test Suite from the command line with KRE, then read its report without opening Studio."),
  d(9014, "ALM Integration: Jira and TestRail", "TestOps", "Advanced", "Connect Jira to Katalon True (TestOps) and TestRail Cloud to Katalon Studio, and know where each result goes."),
  d(9015, "Android Mobile Testing in Katalon Studio", "Local", "Advanced", "Set up an Android Emulator with Appium, record a mobile test, add a check and run it."),
  d(9016, "iOS Mobile Testing in Katalon Studio", "Local", "Advanced", "Set up an iOS Simulator with Appium, record a mobile test, add a check and run it."),
];

// Same rules as the old site's fixDocs(): rename one lesson, then insert the code lessons after
// "TestOps: Connect Katalon Studio…".
export function fixDocs(rows: Doc[]): Doc[] {
  const a = rows.map((x) => (x.t === "Katalon Studio: Install & First Project" ? { ...x, t: "Katalon Studio: Install & Setup" } : x));
  let at = a.findIndex((x) => x.t.startsWith("TestOps: Connect Katalon Studio"));
  at = at < 0 ? a.length : at + 1;
  for (const n of NEWDOCS) {
    if (!a.some((x) => x.t === n.t)) a.splice(at, 0, { ...n });
    at = a.findIndex((x) => x.t === n.t) + 1;
  }
  return a;
}
