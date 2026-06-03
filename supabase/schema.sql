-- ============================================================================
-- Westside Lexus Voice AI — Intern Journey
-- Complete Supabase schema: tables, helper functions, RLS policies, seed data.
--
-- Run this in the Supabase SQL Editor (or `supabase db reset` with this file
-- as a migration). It is idempotent-ish: it drops the app's own objects first.
--
-- Roles:
--   intern  (Tyler Brennan)  — working/learning view; can write their data.
--   manager (Usman)          — read-mostly oversight across everything Tyler does.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Clean slate (app-owned objects only; never touches auth schema)
-- ---------------------------------------------------------------------------
drop view  if exists public.vendor_rankings cascade;
drop table if exists public.user_badges   cascade;
drop table if exists public.xp_events      cascade;
drop table if exists public.decision_log   cascade;
drop table if exists public.scores         cascade;
drop table if exists public.criteria       cascade;
drop table if exists public.vendors        cascade;
drop table if exists public.reflections    cascade;
drop table if exists public.tasks          cascade;
drop table if exists public.weeks          cascade;
drop table if exists public.badges         cascade;
drop table if exists public.profiles       cascade;

-- ---------------------------------------------------------------------------
-- 1. Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null default 'New User',
  title       text,
  role        text        not null default 'intern'
              check (role in ('intern', 'manager')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when a user signs up. Reads optional metadata:
--   raw_user_meta_data->>'full_name', 'title', 'role'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, title, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'title',
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'intern')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helpers (SECURITY DEFINER avoids recursive RLS on profiles).
create or replace function public.current_role_is(target text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = target
  );
$$;

create or replace function public.is_intern()  returns boolean
  language sql stable as $$ select public.current_role_is('intern'); $$;
create or replace function public.is_manager() returns boolean
  language sql stable as $$ select public.current_role_is('manager'); $$;

-- ---------------------------------------------------------------------------
-- 2. Curriculum: weeks + tasks + reflections
-- ---------------------------------------------------------------------------
create table public.weeks (
  week_no            int  primary key check (week_no between 1 and 10),
  title              text not null,
  theme              text not null,
  start_date         date not null,
  end_date           date not null,
  objective          text not null,
  primer_title       text not null,
  primer_body        text not null,
  reflection_prompt  text not null,
  milestone_label    text
);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  week_no     int  not null references public.weeks (week_no) on delete cascade,
  title       text not null,
  status      text not null default 'todo'
              check (status in ('todo', 'in_progress', 'done')),
  xp          int  not null default 20,
  sort        int  not null default 0,
  updated_at  timestamptz not null default now()
);
create index tasks_week_idx on public.tasks (week_no);

create table public.reflections (
  id            uuid primary key default gen_random_uuid(),
  week_no       int  not null references public.weeks (week_no) on delete cascade,
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  body          text not null default '',
  submitted_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (week_no, profile_id)
);

-- ---------------------------------------------------------------------------
-- 3. Voice AI project workspace: vendors, criteria, scores, decision log
-- ---------------------------------------------------------------------------
create table public.vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  summary     text,
  created_at  timestamptz not null default now()
);

create table public.criteria (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  weight       numeric not null default 0 check (weight >= 0 and weight <= 100),
  sort         int not null default 0
);

create table public.scores (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references public.vendors (id)  on delete cascade,
  criterion_id  uuid not null references public.criteria (id) on delete cascade,
  score         int  not null check (score between 1 and 5),
  notes         text,
  updated_at    timestamptz not null default now(),
  unique (vendor_id, criterion_id)
);

create table public.decision_log (
  id          uuid primary key default gen_random_uuid(),
  entry_type  text not null default 'note'
              check (entry_type in ('decision', 'note', 'prep')),
  title       text not null,
  body        text not null default '',
  author_id   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Weighted ranking view: contribution = (score/5) * weight; max possible = 100.
create view public.vendor_rankings
with (security_invoker = on) as
select
  v.id   as vendor_id,
  v.name as name,
  coalesce(round(sum((s.score::numeric / 5) * c.weight), 1), 0) as weighted_total,
  rank() over (
    order by coalesce(sum((s.score::numeric / 5) * c.weight), 0) desc
  ) as rank
from public.vendors v
left join public.scores   s on s.vendor_id = v.id
left join public.criteria c on c.id = s.criterion_id
group by v.id, v.name;

-- ---------------------------------------------------------------------------
-- 4. Gamification: badges, user_badges, xp_events
-- ---------------------------------------------------------------------------
create table public.badges (
  key          text primary key,
  name         text not null,
  description  text not null,
  icon         text not null default '⭐',
  hint         text not null default ''
);

create table public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  badge_key   text not null references public.badges (key) on delete cascade,
  earned_at   timestamptz not null default now(),
  unique (profile_id, badge_key)
);

create table public.xp_events (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  source      text not null,
  amount      int  not null,
  ref         text,                       -- idempotency key (e.g. 'task:<id>')
  created_at  timestamptz not null default now(),
  unique (profile_id, ref)
);

-- ============================================================================
-- 5. Row Level Security
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.weeks         enable row level security;
alter table public.tasks         enable row level security;
alter table public.reflections   enable row level security;
alter table public.vendors       enable row level security;
alter table public.criteria      enable row level security;
alter table public.scores        enable row level security;
alter table public.decision_log  enable row level security;
alter table public.badges        enable row level security;
alter table public.user_badges   enable row level security;
alter table public.xp_events     enable row level security;

-- Profiles: everyone authenticated can read all profiles (so the manager can
-- see the intern, and the app can resolve roles); you may only edit your own.
create policy "profiles read"   on public.profiles for select to authenticated using (true);
create policy "profiles update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Weeks: read-only reference data for all; curated via SQL/seed only.
create policy "weeks read" on public.weeks for select to authenticated using (true);

-- Tasks: visible to all authenticated; only the intern may change them.
create policy "tasks read"   on public.tasks for select to authenticated using (true);
create policy "tasks insert" on public.tasks for insert to authenticated with check (public.is_intern());
create policy "tasks update" on public.tasks for update to authenticated using (public.is_intern()) with check (public.is_intern());
create policy "tasks delete" on public.tasks for delete to authenticated using (public.is_intern());

-- Reflections: everyone authenticated can read (manager oversight); the intern
-- may only write their OWN reflections. Managers cannot write reflections.
create policy "reflections read"   on public.reflections for select to authenticated using (true);
create policy "reflections insert" on public.reflections for insert to authenticated
  with check (profile_id = auth.uid() and public.is_intern());
create policy "reflections update" on public.reflections for update to authenticated
  using (profile_id = auth.uid() and public.is_intern())
  with check (profile_id = auth.uid() and public.is_intern());

-- Workspace data: readable by all; writable only by the intern.
do $$
declare t text;
begin
  foreach t in array array['vendors','criteria','scores','decision_log']
  loop
    execute format('create policy "%s read"   on public.%I for select to authenticated using (true);', t, t);
    execute format('create policy "%s insert" on public.%I for insert to authenticated with check (public.is_intern());', t, t);
    execute format('create policy "%s update" on public.%I for update to authenticated using (public.is_intern()) with check (public.is_intern());', t, t);
    execute format('create policy "%s delete" on public.%I for delete to authenticated using (public.is_intern());', t, t);
  end loop;
end $$;

-- Badges catalog: read-only for everyone.
create policy "badges read" on public.badges for select to authenticated using (true);

-- User badges: readable by all (manager oversight); you write only your own.
create policy "user_badges read"   on public.user_badges for select to authenticated using (true);
create policy "user_badges insert" on public.user_badges for insert to authenticated with check (profile_id = auth.uid());
create policy "user_badges delete" on public.user_badges for delete to authenticated using (profile_id = auth.uid());

-- XP events: readable by all (manager oversight); you write only your own.
create policy "xp_events read"   on public.xp_events for select to authenticated using (true);
create policy "xp_events insert" on public.xp_events for insert to authenticated with check (profile_id = auth.uid());

-- ============================================================================
-- 6. Seed data
-- ============================================================================

-- 6a. Weeks (the 10-module curriculum, anchored to the real 2026 calendar)
insert into public.weeks (week_no, title, theme, start_date, end_date, objective, primer_title, primer_body, reflection_prompt, milestone_label) values
(1, 'Orientation & the Voice AI Landscape', 'Enterprise AI vs. Consumer AI', '2026-06-01', '2026-06-07',
 'Understand how enterprise AI differs from the consumer AI you already use, and where Westside Lexus''s Voice AI initiative fits.',
 'Enterprise AI is a different sport',
 'Consumer AI (your phone assistant, a chatbot) optimizes for a single delighted user. Enterprise AI optimizes for reliability, governance, integration, and ROI across thousands of interactions. At a dealership, a Voice AI that mis-routes 2% of service calls isn''t a cute bug — it''s lost revenue and a frustrated customer. This summer you''ll learn to evaluate AI the way a Director of Data & AI does: not "is it cool?" but "is it dependable, secure, integrable, and worth the spend?"',
 'Name one AI product you use daily. What would have to change about it to make it ''enterprise-grade'' for a dealership?',
 'June 1 — Orientation'),
(2, 'Why Voice AI Matters in Automotive', 'Voice AI in Dealership Operations', '2026-06-08', '2026-06-14',
 'Map the dealership workflows where Voice AI creates value: service scheduling, after-hours capture, sales follow-up, and internal assistance.',
 'The dealership is a phone-first business',
 'A Lexus dealership lives on inbound and outbound calls: service appointments, parts, status updates, sales inquiries. Missed and mishandled calls leak revenue every day. Voice AI can answer 24/7, book service, qualify leads, and hand off cleanly to a human — but only if it understands automotive context (VINs, models, service intervals) and plugs into the DMS/CRM. This week you''ll learn the operational map before judging any vendor.',
 'Pick one dealership workflow. Walk through what a great Voice AI interaction looks like end-to-end — and where it could go wrong.',
 'June 12 — Trivia & facility tours'),
(3, 'How Companies Buy AI: The RFP', 'Vendor Evaluation — RFPs & Scoring', '2026-06-15', '2026-06-21',
 'Learn what an RFP is, why structured scoring beats gut feel, and how to translate business needs into weighted criteria.',
 'An RFP turns opinions into evidence',
 'A Request for Proposal (RFP) is how an enterprise asks vendors to prove they can solve a defined problem. The magic isn''t the document — it''s the scoring rubric. By agreeing on weighted criteria (accuracy, latency, integration, cost, data needs, workflow fit) before talking to vendors, you defend the decision against hype and politics. This week you''ll set up the scoring model you''ll use for the rest of the summer.',
 'Which scoring criterion do you think deserves the highest weight for Westside Lexus, and why?',
 null),
(4, 'Proof of Concept & Vendor Discussions', 'Vendor Evaluation — POC & Diligence', '2026-06-22', '2026-06-28',
 'Run the comparison: score each vendor against the criteria, prep sharp vendor questions, and capture takeaways.',
 'A demo is a sales tool; a POC is evidence',
 'Every vendor demo looks great — it''s curated. A proof of concept (POC) tests the vendor against YOUR data and YOUR workflows. Before any POC, you prep questions that separate marketing from reality: "What''s your word-error-rate on automotive terms?", "How do you handle a VIN read-back?", "What''s the integration path to our DMS?". This week you turn the rubric into scores and your meetings into documented takeaways.',
 'What was the most surprising thing you learned scoring the vendors against real criteria?',
 null),
(5, 'The Data Foundation', 'Data Requirements for AI', '2026-06-29', '2026-07-05',
 'Understand what data a Voice AI system needs to work, and why the mid-summer checkpoint is a great moment to assess data readiness.',
 'Garbage in, confident garbage out',
 'A Voice AI is only as good as the data behind it: customer records, vehicle/service history, appointment availability, pricing, and the integrations that keep them current. If the DMS data is stale or fragmented, even a brilliant model gives wrong answers — confidently. This is the unglamorous truth of enterprise AI: most of the value (and most of the work) is in the data foundation, not the model.',
 'Self-assess at the mid-point: what''s going well, and what do you want to push harder on in the second half?',
 'June 29 — Mid-summer evaluation • July 4 — Holiday'),
(6, 'Clean Data as a Competitive Edge', 'Data Quality & Governance', '2026-07-06', '2026-07-12',
 'Connect data quality and governance (privacy, retention, PII) to vendor scoring — especially the ''data requirements'' criterion.',
 'Trust is a data property',
 'Customers share names, phone numbers, vehicles, and sometimes payment context. Enterprise AI must respect privacy, retention limits, and access controls — and so must any vendor you choose. "How is our customer data stored, for how long, and who can see it?" is not a legal footnote; it''s a scoring criterion. Revisit your vendor scores now that you understand data governance.',
 'Did learning about data governance change how you''d score any vendor? Explain.',
 null),
(7, 'Building the Business Case', 'ROI & The Business Case', '2026-07-13', '2026-07-19',
 'Translate the technical evaluation into dollars: cost, captured revenue, time saved, and risk — the language executives use.',
 'Executives buy outcomes, not features',
 'A C-suite sponsor doesn''t approve "a Voice AI with 95% accuracy." They approve "a system that recovers ~$X in missed service calls and frees Y staff hours, paying back in Z months." The business case ties your scoring to outcomes: captured after-hours bookings, reduced hold times, higher CSI. This week you draft the value story behind the recommendation.',
 'What''s the single most compelling number in your business case, and how would you defend it?',
 null),
(8, 'How AI Decisions Get Made', 'Decision-Making at the C-Suite', '2026-07-20', '2026-07-26',
 'Understand stakeholders, risk, and governance in an enterprise AI decision — and form a defensible recommendation.',
 'The recommendation is a story with a spine',
 'Enterprise AI decisions weigh more than the best score: change management, vendor stability, security review, and executive risk appetite all matter. A strong recommendation states the choice, the evidence (your weighted scores), the business case, the risks, and the mitigation. Decision-makers reward clarity and honesty about trade-offs over false certainty.',
 'Who are the stakeholders in this decision, and what does each one care about most?',
 null),
(9, 'Synthesis', 'Synthesis & Storyline', '2026-07-27', '2026-08-02',
 'Pull ten weeks into one coherent storyline and build the spine of the final presentation.',
 'Synthesis is subtraction',
 'You''ve gathered a summer of detail. Synthesis means cutting it to the story that matters: the problem, the evaluation method, the evidence, the recommendation, the value, and the next step. A great final presentation could be reconstructed from its section titles alone. Build that skeleton now; you''ll add polish next week.',
 'In two sentences, what is your final recommendation and why should leadership believe it?',
 'Jul 28–29 — Final presentation (window 1)'),
(10, 'Final Presentation & Wrap-Up', 'Deliver & Reflect', '2026-08-03', '2026-08-09',
 'Deliver the final presentation, capture feedback, and reflect on the journey from consumer-AI user to enterprise-AI evaluator.',
 'Land it, then look back',
 'Delivery is a skill: open with the recommendation, support it with evidence, invite hard questions, and close with the next step. Then reflect — the goal of the summer wasn''t just a vendor pick; it was learning how enterprise AI decisions get made. That perspective is what you carry forward, wherever your career goes.',
 'Looking back across all ten weeks: what changed about how you think about AI, and what are you most proud of?',
 'Aug 4–5 — Final presentation (window 2) • Aug 6 — Summer bash • Aug 7 — Last day');

-- 6b. Tasks (2–4 per week, checkable; start as ''todo'' for a clean, honest slate)
insert into public.tasks (week_no, title, xp, sort) values
(1, 'Complete orientation & set up accounts/tools', 40, 0),
(1, 'Read the project brief: Westside Lexus Voice AI evaluation', 30, 1),
(1, 'List 3 differences between consumer and enterprise AI', 20, 2),
(2, 'Tour the facility; note where calls/handoffs happen', 30, 0),
(2, 'Diagram one Voice AI dealership workflow', 40, 1),
(2, 'Win (or survive) Voice AI trivia', 20, 2),
(2, 'Identify the top 3 ''leaky'' call moments to target', 30, 3),
(3, 'Define the weighted scoring criteria in the Workspace', 40, 0),
(3, 'Add the vendors currently under review', 30, 1),
(3, 'Write the evaluation goal in the Decision Log', 30, 2),
(4, 'Score every vendor against every criterion', 50, 0),
(4, 'Prep 5 vendor-discussion questions', 30, 1),
(4, 'Log takeaways from a vendor discussion', 30, 2),
(4, 'Review the auto-ranked results; note any surprises', 20, 3),
(5, 'List the data sources a dealer Voice AI must read/write', 40, 0),
(5, 'Note 3 data-quality risks for the project', 30, 1),
(5, 'Complete the mid-summer self-evaluation', 40, 2),
(6, 'Add/refine the ''data requirements'' scoring notes', 30, 0),
(6, 'Document governance questions for vendors', 30, 1),
(6, 'Re-score at least one vendor with fresh eyes', 40, 2),
(7, 'Draft the business-case outline in the Decision Log', 40, 0),
(7, 'Estimate one quantified benefit (e.g. captured calls)', 40, 1),
(7, 'Map each top vendor to its business-case fit', 30, 2),
(8, 'Write a one-line recommendation + top 3 reasons', 40, 0),
(8, 'List risks and a mitigation for each', 40, 1),
(8, 'Identify stakeholders and their priorities', 30, 2),
(9, 'Outline the final presentation (section by section)', 50, 0),
(9, 'Pull your strongest 3 data points from the Workspace', 30, 1),
(9, 'Draft the one-slide executive summary', 40, 2),
(10, 'Rehearse and deliver the final presentation', 60, 0),
(10, 'Capture leadership feedback in the Decision Log', 30, 1),
(10, 'Submit the closing reflection', 30, 2),
(10, 'Celebrate at the summer bash 🎉', 20, 3);

-- 6c. Workspace seed: criteria (weights sum to 100), vendors, scores
insert into public.criteria (name, description, weight, sort) values
('Transcription Accuracy', 'Word-error-rate on automotive terms (models, VINs, service language).', 25, 0),
('Latency / Responsiveness', 'End-to-end response time; does it feel like a natural conversation?', 15, 1),
('Integration Complexity', 'Effort to connect to our DMS/CRM and telephony (lower effort scores higher).', 20, 2),
('Total Cost', 'Licensing + implementation + ongoing cost vs. budget (better value scores higher).', 15, 3),
('Data Requirements & Governance', 'What customer data is needed, how it''s stored/retained, and privacy posture.', 15, 4),
('Dealer-Workflow Fit', 'How well it maps to real service/sales/parts workflows out of the box.', 10, 5);

-- Vendors currently under review (illustrative, dealership-oriented)
insert into public.vendors (name, summary) values
('VoxAuto AI',        'Automotive-specialized voice agent; strong DMS integrations, premium pricing.'),
('Concierge Voice',   'General-purpose enterprise voice platform; flexible but needs custom tuning.'),
('DriveLine Assist',  'Telephony-first startup; fast and cheap, lighter on governance maturity.');

-- Seed scores so rankings render immediately. (1–5 per criterion.)
-- Uses sub-selects so it is independent of generated UUIDs.
insert into public.scores (vendor_id, criterion_id, score, notes)
select v.id, c.id, s.score, s.notes
from (values
  -- VoxAuto AI: accurate + great fit, but pricey & heavier integration
  ('VoxAuto AI',       'Transcription Accuracy',          5, 'Best-in-class on automotive vocabulary in demo.'),
  ('VoxAuto AI',       'Latency / Responsiveness',        4, 'Snappy; minor pauses on long VIN read-backs.'),
  ('VoxAuto AI',       'Integration Complexity',          3, 'Pre-built DMS connector exists but needs config.'),
  ('VoxAuto AI',       'Total Cost',                      2, 'Premium tier; above current budget envelope.'),
  ('VoxAuto AI',       'Data Requirements & Governance',  4, 'Clear retention controls; SOC 2 in place.'),
  ('VoxAuto AI',       'Dealer-Workflow Fit',             5, 'Service scheduling flow maps almost 1:1.'),
  -- Concierge Voice: balanced, flexible, mid cost
  ('Concierge Voice',  'Transcription Accuracy',          3, 'Good general accuracy; needs automotive tuning.'),
  ('Concierge Voice',  'Latency / Responsiveness',        4, 'Consistent response times.'),
  ('Concierge Voice',  'Integration Complexity',          4, 'Solid APIs; CRM integration straightforward.'),
  ('Concierge Voice',  'Total Cost',                      4, 'Mid-market pricing, fits budget.'),
  ('Concierge Voice',  'Data Requirements & Governance',  4, 'Mature governance; configurable PII handling.'),
  ('Concierge Voice',  'Dealer-Workflow Fit',             3, 'Requires building dealership workflows.'),
  -- DriveLine Assist: cheap + fast, weaker governance
  ('DriveLine Assist', 'Transcription Accuracy',          3, 'Decent; struggles on rare model names.'),
  ('DriveLine Assist', 'Latency / Responsiveness',        5, 'Fastest of the three in testing.'),
  ('DriveLine Assist', 'Integration Complexity',          3, 'Telephony easy; DMS integration custom work.'),
  ('DriveLine Assist', 'Total Cost',                      5, 'Lowest cost; startup-friendly pricing.'),
  ('DriveLine Assist', 'Data Requirements & Governance',  2, 'Governance still maturing; needs DPA review.'),
  ('DriveLine Assist', 'Dealer-Workflow Fit',             3, 'Flexible but minimal dealership templates.')
) as s(vendor_name, criterion_name, score, notes)
join public.vendors  v on v.name = s.vendor_name
join public.criteria c on c.name = s.criterion_name;

-- 6d. Decision log starter entries
insert into public.decision_log (entry_type, title, body, created_at) values
('decision', 'Evaluation goal & scope',
 'Westside Lexus is evaluating Voice AI to handle inbound service scheduling, after-hours call capture, and internal staff assistance. Scope for this phase: select a vendor for a 90-day proof of concept on the service line. Decision target: end of summer, with a recommendation to leadership.',
 '2026-06-15 16:00:00-05'),
('prep', 'Vendor discussion — standard question set',
 E'Bring to every vendor call:\n1) What is your word-error-rate on automotive terms (models, VINs, service codes)?\n2) How do you confirm a VIN read-back?\n3) What is the integration path to our DMS/CRM, and typical timeline?\n4) Where is customer data stored, for how long, and who can access it?\n5) How do clean human hand-offs work when the AI is unsure?',
 '2026-06-16 10:00:00-05'),
('note', 'Initial impressions',
 'VoxAuto AI is clearly the most automotive-native but pricing is a concern. Concierge Voice is the balanced option. DriveLine Assist is tempting on cost/speed but governance needs scrutiny before any POC.',
 '2026-06-22 14:30:00-05');

-- 6e. Badge catalog (mirrors lib/curriculum.ts BADGES)
insert into public.badges (key, name, description, icon, hint) values
('first_steps',              'First Steps',              'Completed your first task. The journey begins.',                                 '🚦', 'Complete any 1 task.'),
('enterprise_thinker',       'Enterprise Thinker',       'Finished the foundations of enterprise vs. consumer AI.',                         '🏛️', 'Complete Weeks 1–2.'),
('rfp_analyst',              'RFP Analyst',              'Built a weighted scoring model and evaluated vendors.',                           '📋', 'Complete Weeks 3–4.'),
('data_foundations',         'Data Foundations',         'Mastered why clean data is the bedrock of AI.',                                   '🧱', 'Complete Weeks 5–6.'),
('business_case_builder',    'Business Case Builder',    'Turned a technical evaluation into an executive value story.',                    '📈', 'Complete Weeks 7–8.'),
('presenter',                'Presenter',                'Synthesized the summer and delivered the final presentation.',                    '🎤', 'Complete Weeks 9–10.'),
('scorekeeper',              'Scorekeeper',              'Scored every vendor against every criterion.',                                    '🎯', 'Fill in all vendor scores in the Workspace.'),
('reflective_practitioner',  'Reflective Practitioner',  'Submitted reflections for at least 5 weeks.',                                     '🪞', 'Submit 5 weekly reflections.'),
('journey_complete',         'Journey Complete',         'Finished all ten weeks. Consumer-AI user → enterprise-AI evaluator.',             '🏆', 'Complete all 10 weeks.');

-- ============================================================================
-- Done. Next: create two Auth users (intern + manager) — see README.
-- To promote the manager:  update public.profiles set role='manager' where id='<usman-uuid>';
-- ============================================================================
