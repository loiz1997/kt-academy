export type Category = "Local" | "TestOps" | "Tools";

export type Doc = {
  id: number;
  t: string; // title
  c: Category;
  l: string; // level
  u: string; // link
  b: string; // short description
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  track: "Both" | "Local" | "TestOps";
  done: number[];
  certs: Record<string, { earned?: boolean } | undefined>;
  info: { avatar?: string; team?: string; doneAt?: Record<string, string> } & Record<string, unknown>;
};

// One row from the top_learners() database function.
export type Learner = Pick<Profile, "id" | "name" | "role" | "track" | "done" | "certs"> & {
  score?: number | string | null;
  info?: { avatar?: string | null; team?: string | null } | null;
};
