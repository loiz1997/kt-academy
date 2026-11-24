import type { Doc, Profile } from "./types";
// Hints shown in "What should I include?" for each lesson (matched by the start of the lesson title).
const HINTS: [string, string][] = [
  ["Katalon Studio: Install", "A screenshot of Katalon Studio open on your project, and one of <b>Help \u25b8 About</b> showing the version."],
  ["Recording a Manual", "Your recorded test case in the <b>Manual</b> and <b>Script</b> tabs, the Object Repository, and the Log Viewer result."],
  ["Running Tests Locally", "The Log Viewer after your run, your report, and the test case you ran."],
  ["TestOps: Connect", "Screenshots of the connected project in Katalon Studio and in TestOps. Hide your API key!"],
  ["TestOps: Create Manual", "Your manual and automated test cases as shown in TestOps."],
  ["TestOps: Create Test Suites", "Your Test Suite in TestOps and the test cases inside it."],
  ["TestOps: Run with AI", "The AI run, its results and its evidence in TestOps."],
  ["Custom Keywords", "The keyword file (TextAssertions.groovy), your test case in <b>Manual</b> and <b>Script</b> tabs, and the Log Viewer."],
  ["Test Listeners", "BrowserListener.groovy, TC_Verify_CURA_Home in <b>Manual</b> and <b>Script</b> tabs, and the Log Viewer."],
  ["Checkpoints", "The Checkpoint settings (hide the password!), the test case with Verify Checkpoint, and the Log Viewer."],
  ["Profiles and Global", "The default and QA profiles, your script using GlobalVariable.baseUrl, and the Log Viewer for both runs."],
  ["Connecting Katalon Studio to GitHub", "Your GitHub repository on the feature branch showing your files, and your Terminal with git status and git log. Never show tokens!"],
  ["Run Tests Using Katalon Runtime", "Your KRE command (hide any secrets), the Terminal output, and the report from your Reports folder."],
  ["ALM Integration", "Your Jira connection showing Active, the synced requirement in Katalon True, and the TestRail plugin settings and mapped case (hide tokens!)."],
  ["Android Mobile", "Your emulator, the recorded test in <b>Manual</b> and <b>Script</b> tabs, the Log Viewer and the report."],
  ["iOS Mobile", "Your simulator, the recorded test in <b>Manual</b> and <b>Script</b> tabs, the Log Viewer and the report."],
];

export const subHint = (d: Doc) => HINTS.find((h) => d.t.startsWith(h[0]))?.[1] ?? "Everything you created or ran in this lesson.";

export type Submission = {
  id: string;
  user_id: string;
  lesson_id: number;
  url: string;
  note: string | null;
  status: "submitted" | "approved" | "revise";
  feedback: string | null;
  score: number | null;
  created_at: string;
  updated_at: string | null;
};

export const STATUS = {
  submitted: { label: "Waiting for review", cls: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-800" },
  revise: { label: "Needs changes", cls: "bg-red-100 text-red-800" },
} as const;

const slug = (t?: string | null) => String(t ?? "").trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// File name the trainee should use, for example Nini-Reyes_TFC_Lesson04
export const fileName = (me: Profile, docs: Doc[], d: Doc) =>
  `${slug(me.name) || "Name"}_${slug(me.info?.team as string | undefined) || "NoTribe"}_Lesson${String(docs.indexOf(d) + 1).padStart(2, "0")}`;

export const isDriveLink = (u: string) => /^https:\/\/(drive|docs)\.google\.com\//i.test(u);
