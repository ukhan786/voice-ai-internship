export type Role = "intern" | "manager";
export type TaskStatus = "todo" | "in_progress" | "done";
export type LogEntryType = "decision" | "note" | "prep";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  title: string | null;
  created_at: string;
};

export type Week = {
  week_no: number;
  title: string;
  theme: string;
  start_date: string;
  end_date: string;
  objective: string;
  primer_title: string;
  primer_body: string;
  reflection_prompt: string;
  milestone_label: string | null;
};

export type Task = {
  id: string;
  week_no: number;
  title: string;
  status: TaskStatus;
  xp: number;
  sort: number;
  updated_at: string;
};

export type Reflection = {
  id: string;
  week_no: number;
  profile_id: string;
  body: string;
  submitted_at: string | null;
  updated_at: string;
};

export type Vendor = {
  id: string;
  name: string;
  summary: string | null;
  created_at: string;
};

export type Criterion = {
  id: string;
  name: string;
  description: string | null;
  weight: number; // percentage; criteria weights sum to 100
  sort: number;
};

export type Score = {
  id: string;
  vendor_id: string;
  criterion_id: string;
  score: number; // 1..5
  notes: string | null;
  updated_at: string;
};

export type DecisionLogEntry = {
  id: string;
  entry_type: LogEntryType;
  title: string;
  body: string;
  author_id: string | null;
  created_at: string;
};

export type XpEvent = {
  id: string;
  profile_id: string;
  source: string;
  amount: number;
  ref: string | null;
  created_at: string;
};

export type UserBadge = {
  id: string;
  profile_id: string;
  badge_key: string;
  earned_at: string;
};

/** Derived: a vendor with its weighted total and rank. */
export type VendorRanking = {
  vendor_id: string;
  name: string;
  weighted_total: number; // 0..100
  rank: number;
};
