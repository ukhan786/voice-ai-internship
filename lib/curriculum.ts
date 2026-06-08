/**
 * Single source of truth for the 10-week curriculum, anchored to Tyler's
 * real internship calendar (June 1 – August 7, 2026) and his 4-phase project plan:
 *
 *   Phase 1: Onboarding & Context       Jun 1–13   (Weeks 1–2)
 *   Phase 2: Pilot Launch & Data Ready  Jun 16–30  (Weeks 3–4)
 *   Phase 3: Pilot Monitoring & Analytics Jul 1–18 (Weeks 5–7)
 *   Phase 4: Playbook & Final Rec.      Jul 19–Aug 7 (Weeks 8–10)
 *
 * Program dates:
 *   Jun 1   Orientation
 *   Jun 2   First day in business unit
 *   Jun 12  Trivia + facility tours
 *   Jun 29  Mid-summer evaluation
 *   Jul 4   Company holiday
 *   Jul 28–29 OR Aug 4–5  Final presentation windows
 *   Aug 6   Summer bash
 *   Aug 7   Last day
 */

export type WeekTask = {
  title: string;
  xp: number;
};

export type WeekModule = {
  week_no: number;
  title: string;
  theme: string;
  phase: number; // 1–4
  start_date: string;
  end_date: string;
  objective: string;
  deliverable: string; // the week's concrete output
  primer_title: string;
  primer_body: string;
  ai_concept_title: string;
  ai_concept_body: string;
  key_term: string;
  key_term_def: string;
  resource_label: string;
  resource_url: string;
  reflection_prompt: string;
  milestone_label: string | null;
  tasks: WeekTask[];
};

export type Phase = {
  no: number;
  name: string;
  shortName: string;
  dateRange: string;
  weeks: number[];
  deliverable: string;
};

export const PHASES: Phase[] = [
  {
    no: 1,
    name: "Onboarding & Context",
    shortName: "Onboarding",
    dateRange: "Jun 1 – Jun 13",
    weeks: [1, 2],
    deliverable: "Pilot overview + dealership call-flow summary",
  },
  {
    no: 2,
    name: "Pilot Launch & Data Readiness",
    shortName: "Launch Ready",
    dateRange: "Jun 16 – Jun 30",
    weeks: [3, 4],
    deliverable: "Go-live checklist + data-readiness checklist",
  },
  {
    no: 3,
    name: "Pilot Monitoring & Analytics",
    shortName: "Monitoring",
    dateRange: "Jul 1 – Jul 18",
    weeks: [5, 6, 7],
    deliverable: "Weekly status reports + pilot metrics summary",
  },
  {
    no: 4,
    name: "Playbook & Final Recommendation",
    shortName: "Playbook",
    dateRange: "Jul 19 – Aug 7",
    weeks: [8, 9, 10],
    deliverable: "Pilot playbook + final executive presentation",
  },
];

export const CURRICULUM: WeekModule[] = [
  // ── PHASE 1: Onboarding & Context ─────────────────────────────────────────
  {
    week_no: 1,
    title: "Onboarding & the Voice AI Landscape",
    theme: "Enterprise AI vs. Consumer AI",
    phase: 1,
    start_date: "2026-06-01",
    end_date: "2026-06-07",
    objective:
      "Understand how enterprise AI differs from the consumer AI you already use, and what the Westside Lexus Voice AI pilot is trying to accomplish.",
    deliverable: "Pilot overview summary (1-page write-up)",
    primer_title: "Enterprise AI is a different sport",
    primer_body:
      "Consumer AI (your phone assistant, a chatbot) optimizes for a single delighted user in the moment. Enterprise AI optimizes for reliability, governance, integration, and ROI across thousands of interactions — and it has to keep working when it's connected to real systems and real money. At a dealership, a Voice AI that mis-routes 2% of service calls isn't a cute bug; it's lost revenue, a frustrated customer, and a service advisor cleaning up the mess.\n\nThis summer you'll support an active Voice AI pilot at Westside Lexus. Your job isn't to root for the technology — it's to observe, measure, document, and eventually synthesize what you find into a recommendation that helps the team decide whether and how to scale. That lens — evidence over hype — is the throughline of every week ahead.",
    ai_concept_title: "What a large language model actually is",
    ai_concept_body:
      "Modern AI assistants are built on Large Language Models (LLMs). An LLM is a very large neural network trained on enormous amounts of text by playing one game over and over: predict the next word. After training on trillions of words, it becomes startlingly good at producing fluent, relevant text — but under the hood it's still predicting likely sequences, not 'looking up' verified facts.\n\nTwo phases matter. *Training* is the expensive, one-time process of learning patterns from data. *Inference* is what happens every time you send a prompt — the model generates a response. Enterprises mostly pay for, and care about, inference: its speed, cost, and accuracy at scale.\n\nThis is also why models 'hallucinate' — confidently state something false. They generate plausible text, and plausible isn't the same as true. For a dealership, that's the whole game: an assistant that confidently quotes the wrong service price is worse than one that says 'let me transfer you.' Everything you'll evaluate this summer is, in part, about controlling that gap between plausible and correct.",
    key_term: "Inference",
    key_term_def:
      "Running a trained model to produce an output for a given input. It's the per-request cost and latency you pay every time the AI answers — as opposed to training, the one-time process of building the model.",
    resource_label: "Wikipedia — Large language model",
    resource_url: "https://en.wikipedia.org/wiki/Large_language_model",
    reflection_prompt:
      "Name one AI product you use daily. What would have to change about it to make it 'enterprise-grade' for a dealership?",
    milestone_label: "Jun 1 — Orientation · Jun 2 — First day in business unit",
    tasks: [
      { title: "Complete orientation and set up accounts/tools", xp: 40 },
      { title: "Read the Westside Lexus Voice AI project brief", xp: 30 },
      { title: "Write a 1-paragraph pilot overview summary", xp: 30 },
    ],
  },
  {
    week_no: 2,
    title: "Dealership Calls & the Call-Flow Map",
    theme: "Understanding the Problem Space",
    phase: 1,
    start_date: "2026-06-08",
    end_date: "2026-06-14",
    objective:
      "Map the dealership call workflows where Voice AI creates value, and produce a call-flow summary that explains where calls arrive, stall, and get dropped.",
    deliverable: "Dealership call-flow diagram + workflow summary",
    primer_title: "You can't evaluate a solution until you can describe the problem",
    primer_body:
      "A Lexus dealership lives on inbound calls: service appointments, parts inquiries, status updates, and sales questions. Missed and mishandled calls leak revenue every day — nights, weekends, and lunch rushes especially. Voice AI can answer 24/7, book service, and hand off cleanly to a human. But it only works if it actually understands the call patterns it's being asked to handle.\n\nBefore you can evaluate whether the pilot is working, you need a clear map of what 'working' looks like. That means understanding which call types exist (service scheduling, after-hours capture, escalations), where in the conversation things break down today, and what a successful Voice AI interaction looks like end-to-end. This week you build that map.",
    ai_concept_title: "How a voice agent works end-to-end (ASR → NLU → TTS)",
    ai_concept_body:
      "A Voice AI isn't one model — it's a pipeline of three stages running in real time. First, Automatic Speech Recognition (ASR) turns the caller's audio into text. Second, a Natural Language Understanding layer (NLU, today usually an LLM) figures out intent and decides what to do — including looking things up or taking actions like booking an appointment. Third, Text-to-Speech (TTS) turns the response back into a natural-sounding voice.\n\nEach stage adds delay, and delay is the enemy of a natural conversation. The 'latency budget' is the sum of ASR + understanding + any database/API calls + TTS. If the round trip exceeds about a second, callers start talking over the bot — which is why good systems also handle 'barge-in' (letting the caller interrupt).\n\nKnowing this pipeline helps you ask sharp questions during the pilot: Where is our latency coming from? Is the ASR tuned for automotive terms? Does the LLM call our DMS live, or work from stale data? You're no longer grading a black box — you're inspecting each stage.",
    key_term: "ASR (Automatic Speech Recognition)",
    key_term_def:
      "The component that converts spoken audio into text. Its quality is the foundation of a voice agent — if it mishears 'RX 350' or a VIN, every downstream step is working from the wrong words.",
    resource_label: "Wikipedia — Speech recognition",
    resource_url: "https://en.wikipedia.org/wiki/Speech_recognition",
    reflection_prompt:
      "Pick one dealership call type. Walk through what a great Voice AI interaction looks like — and name one specific place it could fail.",
    milestone_label: "Jun 12 — Trivia & facility tours",
    tasks: [
      { title: "Tour the facility and map where calls arrive and get dropped", xp: 30 },
      { title: "Shadow or review at least one call sample", xp: 30 },
      { title: "Draw a call-flow diagram for service scheduling", xp: 40 },
      { title: "Identify the top 3 'leaky' call moments to target with Voice AI", xp: 20 },
    ],
  },

  // ── PHASE 2: Pilot Launch & Data Readiness ────────────────────────────────
  {
    week_no: 3,
    title: "The Voice AI Stack & Launch Readiness",
    theme: "Pilot Launch Support",
    phase: 2,
    start_date: "2026-06-15",
    end_date: "2026-06-21",
    objective:
      "Learn the Voice AI technology pipeline from telephony to DMS, and support go-live preparation by building a launch readiness checklist.",
    deliverable: "Go-live checklist + open launch issues log",
    primer_title: "Know the stack before you monitor it",
    primer_body:
      "You can't catch problems in a system you don't understand. The Voice AI pipeline has at least five layers — telephony routing, speech recognition, AI reasoning, system integrations (DMS/CRM), and escalation — and a failure at any layer looks different. A missed booking might be a DMS sync issue, not a speech accuracy problem.\n\nThis week you learn to name and describe each layer of the stack so you can localize issues when the pilot surfaces them. You also support the go-live process: what needs to be confirmed, configured, and cleared before the first live call goes through the system.",
    ai_concept_title: "How the Voice AI pipeline connects to dealership systems",
    ai_concept_body:
      "The full stack from caller to confirmed appointment has more steps than most people expect. A call comes in through the telephony provider (the phone line). The audio is streamed to the ASR engine, which produces text. That text goes to the NLU/LLM layer, which determines intent ('book a service appointment') and decides on an action. The action layer makes real API calls: it reads open appointment slots from the DMS/CRM, holds one, and writes the confirmation back.\n\nEach API call takes time and can fail. The DMS connector is usually the riskiest integration — dealer management systems are notoriously complex, and real-time two-way sync is hard to get right. This is why 'integration complexity' matters more than it sounds: a Voice AI that 'books' an appointment but doesn't write it to the DMS has a 0% task completion rate despite sounding confident.\n\nThe escalation layer is equally important: when the AI is unsure or a caller asks something outside scope, does it hand off cleanly with context (caller name, intent, what was already said)? A bad handoff is sometimes worse than no AI at all.",
    key_term: "DMS (Dealer Management System)",
    key_term_def:
      "The central operational software at a dealership — tracks inventory, service appointments, customer records, and more. Any Voice AI that takes bookings or answers customer questions must integrate with it to be reliable.",
    resource_label: "Wikipedia — Spoken dialogue system",
    resource_url: "https://en.wikipedia.org/wiki/Spoken_dialogue_system",
    reflection_prompt:
      "Which layer of the Voice AI stack do you think is most likely to cause a go-live problem? Why?",
    milestone_label: null,
    tasks: [
      { title: "Map all 5 layers of the Voice AI stack for this pilot", xp: 40 },
      { title: "Build the go-live readiness checklist", xp: 40 },
      { title: "Log all open launch blockers with owners and target dates", xp: 30 },
      { title: "Attend a launch prep meeting and capture action items", xp: 20 },
    ],
  },
  {
    week_no: 4,
    title: "Data Readiness & Pilot KPIs",
    theme: "Building the Measurement Foundation",
    phase: 2,
    start_date: "2026-06-22",
    end_date: "2026-06-28",
    objective:
      "Build a data-readiness checklist for the Voice AI pilot and define the KPIs you will track over the next 6 weeks to determine whether it's working.",
    deliverable: "Data-readiness checklist + pilot KPI definitions",
    primer_title: "You can't improve what you don't measure",
    primer_body:
      "The two most common reasons a Voice AI pilot disappoints: the data behind it was never ready, and no one agreed on what 'good' looks like before launch. Both problems are preventable — but only if you act now.\n\nData readiness means every system the AI needs to read from or write to is connected, current, and clean: appointment slots, customer records, service history, vehicle data. KPI definition means agreeing, before you see the results, on which numbers will tell you the pilot is working. Otherwise you'll be tempted to declare victory on the metrics that look good and ignore the ones that don't.",
    ai_concept_title: "Grounding AI in your data: RAG and live integrations",
    ai_concept_body:
      "An LLM only 'knows' what it learned in training — it has no idea about today's appointment slots or a specific customer's service history. To be useful at a dealership, it has to be connected to live, trustworthy data. There are two main ways.\n\nFirst, live integrations/APIs: the assistant calls the DMS/CRM in real time to read availability or write a booking. Second, Retrieval-Augmented Generation (RAG): instead of relying on the model's memory, the system retrieves relevant documents (service policies, pricing, FAQs) and feeds them into the prompt so the model answers FROM that source. RAG is how you make an assistant cite your facts instead of inventing plausible ones — directly attacking the hallucination problem.\n\nBoth approaches have a shared dependency: your data must be clean, current, and accessible. If the DMS hasn't been updated in 24 hours, the AI's 'available slots' are stale. If the service menu PDF is three years old, RAG will pull wrong pricing. Data quality isn't a back-office concern — it's the ceiling on everything the AI can do correctly.",
    key_term: "RAG (Retrieval-Augmented Generation)",
    key_term_def:
      "A technique where the system retrieves relevant, trusted documents and gives them to the model as context, so its answer is grounded in your real data instead of its training memory — reducing hallucinations.",
    resource_label: "Wikipedia — Retrieval-augmented generation",
    resource_url: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
    reflection_prompt:
      "What's the single biggest data-readiness risk for this pilot, and what would you do about it?",
    milestone_label: null,
    tasks: [
      { title: "Identify all data sources the Voice AI must read and write", xp: 30 },
      { title: "Complete a data-readiness checklist with status per source", xp: 40 },
      {
        title: "Define the pilot KPIs: containment rate, escalation rate, booking accuracy, latency",
        xp: 40,
      },
      { title: "Document 3 data-quality risks with mitigation ideas", xp: 20 },
    ],
  },

  // ── PHASE 3: Pilot Monitoring & Analytics ─────────────────────────────────
  {
    week_no: 5,
    title: "Mid-Summer Check-In & Early Signals",
    theme: "Milestone: Pilot Is Live",
    phase: 3,
    start_date: "2026-06-29",
    end_date: "2026-07-05",
    objective:
      "Complete the mid-summer evaluation, capture early pilot observations, and begin pulling the first real performance numbers from the live system.",
    deliverable: "Mid-summer self-evaluation + early pilot observations snapshot",
    primer_title: "Early data is imperfect — capture it anyway",
    primer_body:
      "A week or two of live data won't tell you everything, but it will tell you something. Early signals — a containment rate much lower than projected, a specific call type the AI consistently mishandles, a DMS sync delay — are far cheaper to fix now than at week 8.\n\nThe mid-summer evaluation is also a checkpoint on you: where are you against your project goals, what are you learning, and what do you need to push harder on in the second half? A good mid-point reflection doesn't just report facts — it adjusts the plan.",
    ai_concept_title: "What containment rate really measures (and how vendors inflate it)",
    ai_concept_body:
      "Containment rate is the share of calls the AI fully handles without a human — the single most-quoted Voice AI KPI and the most easily gamed. Here's why: a system can 'contain' a call by giving a vague answer the caller accepts, forcing the caller to give up, or counting a silent hang-up as resolved. None of those are actual successes.\n\nThe honest version has three components: the AI understood the caller's request, took the right action, and the caller's problem was solved. A system with 70% containment but 40% task completion (e.g. the booking actually landed in the DMS) is failing half the calls it claims to handle.\n\nWhen you read containment figures — from the vendor or from your own dashboards — ask: what counts as 'contained'? Is it time-based (call ended after X seconds)? Is it measured against actual outcomes? Is it audited against call recordings? The difference between a great metric and a vanity metric is the definition.",
    key_term: "Containment rate",
    key_term_def:
      "The percentage of calls the AI fully resolves without escalating to a human. The single biggest ROI metric — and the one most easily inflated by loose definitions.",
    resource_label: "Wikipedia — Interactive voice response",
    resource_url: "https://en.wikipedia.org/wiki/Interactive_voice_response",
    reflection_prompt:
      "Self-assess at the mid-point: what's going well, what do you need to push harder on in the second half?",
    milestone_label: "Jun 29 — Mid-summer evaluation · Jul 4 — Company holiday",
    tasks: [
      { title: "Complete the mid-summer self-evaluation", xp: 40 },
      { title: "Log 3+ early pilot observations (what's working, what's not)", xp: 30 },
      {
        title: "Pull initial containment and escalation numbers from the system",
        xp: 30,
      },
    ],
  },
  {
    week_no: 6,
    title: "Pilot Monitoring: Tracking What Matters",
    theme: "Metrics & Performance Analysis",
    phase: 3,
    start_date: "2026-07-06",
    end_date: "2026-07-12",
    objective:
      "Track and analyze the full set of pilot KPIs — containment, resolution, escalation quality, appointment booking accuracy, latency, and customer feedback.",
    deliverable: "Weekly status report with pilot metrics",
    primer_title: "One number is never the whole story",
    primer_body:
      "Good pilot monitoring isn't watching one number — it's understanding a system. Containment tells you volume; task completion tells you quality; escalation rate tells you where the AI fails; latency tells you whether it feels natural; customer feedback tells you whether callers trust it. Together they paint a picture.\n\nThis week you produce your first formal weekly status report — the document you'll refine every week through Phase 3. A great status report doesn't just list numbers; it calls out trends, flags risks, and proposes a next action. That habit of observation → insight → recommendation is the core skill you're building.",
    ai_concept_title: "Measuring AI performance in production: beyond a single metric",
    ai_concept_body:
      "The danger of optimizing for one metric is that the system finds ways to score well on it while failing on what you actually care about. This is Goodhart's Law: 'When a measure becomes a target, it ceases to be a good measure.'\n\nFor Voice AI, a healthy monitoring suite tracks a mix of: *containment* (did the AI handle it?), *task completion* (did the action actually happen?), *escalation quality* (when it handed off, was the context complete?), *latency* (did the conversation feel natural?), and *post-call outcomes* (did the appointment show up, did the customer call back?).\n\nYou also want to look at failure modes by category: which call types fail most? Which customer profiles? Which times of day? A 75% average containment rate can hide a 30% failure rate on after-hours calls if that's the segment you most needed to fix. Segmented metrics tell a very different story than averages.",
    key_term: "Task completion rate",
    key_term_def:
      "The share of AI-handled calls where the intended action was fully completed — e.g., the appointment was confirmed in the DMS, not just 'sounded' booked. Distinct from containment: a call can be 'contained' with a zero task completion.",
    resource_label: "Wikipedia — A/B testing",
    resource_url: "https://en.wikipedia.org/wiki/A/B_testing",
    reflection_prompt:
      "Looking at this week's metrics, which number concerns you most — and what would you investigate first?",
    milestone_label: null,
    tasks: [
      { title: "Compile weekly pilot metrics into a status report", xp: 50 },
      { title: "Track containment rate and task completion rate vs. target", xp: 30 },
      { title: "Document issues, enhancements, and open questions", xp: 30 },
      { title: "Begin comparing vendor claims to pilot evidence", xp: 20 },
    ],
  },
  {
    week_no: 7,
    title: "Analytics Deep-Dive & Vendor Evidence",
    theme: "Data → Insights → Decisions",
    phase: 3,
    start_date: "2026-07-13",
    end_date: "2026-07-19",
    objective:
      "Analyze the accumulated pilot data, compare vendor claims against real evidence, flag risks and gaps, and deliver a comprehensive pilot metrics summary.",
    deliverable: "Pilot metrics summary with vendor analysis and risk log",
    primer_title: "The most important slide compares before and after",
    primer_body:
      "By now you have weeks of real data. The question isn't 'how is the system performing?' — it's 'how does the system perform compared to what we expected, and compared to the world without it?' That comparison is the baseline.\n\nEvery vendor makes projections during sales. This week you hold them accountable: where did the pilot deliver, and where did it miss? Honest gap analysis — documented now — is what makes your final recommendation credible. A recommendation that glosses over problems doesn't build trust; one that names them and proposes solutions does.",
    ai_concept_title: "Baselines, A/B testing, and proving impact",
    ai_concept_body:
      "The most persuasive (and most honest) way to claim an AI works is to compare it against a baseline — the current way of doing things. 'The AI books 40% of after-hours calls' only means something next to 'today we book ~0% of them because no one answers.' The lift over baseline is the real result.\n\nThe rigorous version is an A/B test: route some calls to the AI and some to the existing process, then compare outcomes. Because the two groups differ only in the AI, any difference in results can be credited to it. This is exactly what a well-designed POC produces — evidence, not anecdotes.\n\nFor your presentation, this gives you a spine that executives trust: here's the baseline, here's the measured lift, here's how we measured it. Beware vanity metrics (e.g. 'calls handled') that look impressive but don't tie to a baseline or a business outcome. The strongest data point compares before and after on a number leadership already cares about.",
    key_term: "Baseline",
    key_term_def:
      "The current level of performance you measure against. Without it, an AI metric is just a number; with it, you can show the actual lift the AI delivers over the status quo.",
    resource_label: "Wikipedia — A/B testing",
    resource_url: "https://en.wikipedia.org/wiki/A/B_testing",
    reflection_prompt:
      "In two sentences: what does the pilot data say about whether this Voice AI is working, and what's the biggest unresolved question?",
    milestone_label: null,
    tasks: [
      { title: "Complete the pilot metrics summary (all KPIs, trends, gaps)", xp: 40 },
      {
        title: "Compare vendor projections vs. actual pilot performance for 3+ metrics",
        xp: 40,
      },
      { title: "Document open questions, unresolved risks, and recommended next steps", xp: 30 },
      { title: "Prepare weekly check-in summary for manager review", xp: 20 },
    ],
  },

  // ── PHASE 4: Playbook & Final Recommendation ──────────────────────────────
  {
    week_no: 8,
    title: "Building the Voice AI Playbook",
    theme: "Documentation & Scaling",
    phase: 4,
    start_date: "2026-07-20",
    end_date: "2026-07-26",
    objective:
      "Document the lessons learned from the pilot into a reusable Voice AI implementation playbook for future dealerships.",
    deliverable: "Draft Voice AI pilot playbook",
    primer_title: "The playbook is a gift to the next team",
    primer_body:
      "Every time a team runs a pilot and doesn't write down what they learned, the next team starts from zero. Your job this week is to change that: take everything you've observed — the stack decisions, the data-readiness challenges, the metrics that mattered, the things that didn't go as planned — and turn it into a document a different team could actually use.\n\nA good playbook doesn't just say what happened; it says what to do. It's a decision guide: here's how to set up the data environment, here's the KPI framework to use, here's what to watch out for in the first two weeks, here's how to know when to escalate. That's what makes it reusable.",
    ai_concept_title: "What makes AI scalable: drift, monitoring, and governance",
    ai_concept_body:
      "Choosing a vendor and going live isn't the finish line — for AI it's the start of an operating responsibility. Models and the real world both change, so a system that performs well at launch can quietly degrade. This is 'model drift': new car models, new slang, new call patterns, or a vendor model update can all shift accuracy over time.\n\nScalable AI requires three things beyond the initial deployment: *monitoring* (tracking containment, escalation, and error rates continuously), *governance* (clear ownership, audit trails, privacy controls that hold across sites), and *changeability* (can you retrain or reconfigure without a full re-implementation?).\n\nFor the playbook, this means documenting not just how to deploy but how to operate: who reviews metrics weekly, what triggers an escalation to the vendor, and what are the criteria for deciding the system is no longer working and needs intervention. Those aren't afterthoughts — they're what separates a project that scales from one that quietly fails.",
    key_term: "Model drift",
    key_term_def:
      "The gradual decline in an AI model's performance as the real world changes from what it learned on. It's why deployed AI needs ongoing monitoring and periodic updates — 'set it and forget it' doesn't apply.",
    resource_label: "Wikipedia — Concept drift",
    resource_url: "https://en.wikipedia.org/wiki/Concept_drift",
    reflection_prompt:
      "What's the single most important thing you learned from this pilot that the next team shouldn't have to re-discover?",
    milestone_label: null,
    tasks: [
      { title: "Define the playbook structure: sections, audience, and purpose", xp: 30 },
      { title: "Write the 'what we learned' summary section", xp: 40 },
      { title: "Document scaling considerations and governance requirements", xp: 30 },
      { title: "Draft the 'do this next time' recommendations section", xp: 40 },
    ],
  },
  {
    week_no: 9,
    title: "Business Case & Final Presentation Prep",
    theme: "Executive Storytelling",
    phase: 4,
    start_date: "2026-07-27",
    end_date: "2026-08-02",
    objective:
      "Build the business case behind the recommendation and prepare the final executive presentation.",
    deliverable: "Final executive presentation outline + business case summary",
    primer_title: "Executives buy outcomes, not features",
    primer_body:
      "A C-suite sponsor doesn't approve 'a Voice AI with 75% containment.' They approve 'a system that recovers approximately $X in missed service calls per month, paying back in Z months.' Your job this week is translation: take the pilot data you've gathered and turn it into the language of outcomes, cost, and risk.\n\nThe business case ties containment rate to revenue. Task completion ties to staff hours saved. The recommendation names the path forward and the risks of not taking it. Together they give a decision-maker exactly what they need: a clear choice, supported by evidence, with trade-offs named honestly.",
    ai_concept_title: "The unit economics of AI: cost per call and payback period",
    ai_concept_body:
      "AI feels free when you use a consumer app, but at enterprise scale every interaction has a cost. Voice AI is typically billed per minute or per call (covering ASR, LLM inference, and TTS). The core equation is: value = (calls handled × value per call) − (cost per call × volume) − setup and integration cost.\n\nThe biggest lever is the containment rate. If the AI fully handles 60% of after-hours service calls that would otherwise be missed, each contained call has a real dollar value far above its few cents of inference cost. That gap, multiplied by volume, is the business case.\n\nFrom there you compute payback period: how many months of savings or captured revenue it takes to cover the implementation cost. Executives think in payback and risk. A vendor that's 15% more expensive but contains 25% more calls can have a dramatically shorter payback — which is why you never judge cost in isolation from the outcomes it buys.",
    key_term: "Payback period",
    key_term_def:
      "How long it takes for the savings or new revenue from an investment to equal its upfront cost. A short payback (under 12 months) is one of the most persuasive numbers in any business case.",
    resource_label: "Wikipedia — Payback period",
    resource_url: "https://en.wikipedia.org/wiki/Payback_period",
    reflection_prompt:
      "What's the single most compelling number in your business case, and how would you defend it in front of a skeptic?",
    milestone_label: "Jul 28–29 — Final presentation window",
    tasks: [
      { title: "Draft the business case with 2+ quantified benefits", xp: 50 },
      { title: "Build the final presentation slide outline", xp: 30 },
      { title: "Draft the one-slide executive recommendation", xp: 40 },
      { title: "Rehearse the presentation with your manager", xp: 20 },
    ],
  },
  {
    week_no: 10,
    title: "Final Presentation & Wrap-Up",
    theme: "Deliver & Reflect",
    phase: 4,
    start_date: "2026-08-03",
    end_date: "2026-08-09",
    objective:
      "Deliver the final executive presentation, capture feedback, and reflect on the journey from day one to recommendation.",
    deliverable: "Final executive presentation (delivered + feedback documented)",
    primer_title: "Land it, then look back",
    primer_body:
      "Delivery is a skill: open with the recommendation, support it with evidence, invite hard questions, and close with a concrete next step. Then reflect — the goal of the summer wasn't just a pilot analysis; it was learning how to evaluate, document, and communicate an enterprise AI project end-to-end.\n\nThat perspective is what you carry forward, wherever your career goes. A real AI project doesn't end at the presentation — which is exactly the mindset that makes a recommendation credible to people who will have to live with it.",
    ai_concept_title: "After go-live: monitoring, drift, and responsible AI",
    ai_concept_body:
      "The complete enterprise AI lifecycle you've lived this summer: understand the problem → map the workflows → learn the stack → establish data readiness → define KPIs → monitor → analyze → synthesize → recommend → present. That arc repeats for every AI initiative.\n\nThe responsible version adds one more layer: keep a human in the loop for cases the AI shouldn't own, be transparent with callers that they're talking to an assistant, and have a clear path to turn it off or fall back if something goes wrong. These aren't afterthoughts; mature buyers ask about them before signing — and mature AI practitioners build them in from the start.\n\nSo the thing you're carrying forward isn't knowledge of this specific vendor or this specific system. It's the habit of demanding evidence, naming trade-offs, documenting what you find, and making recommendations that hold up to scrutiny. That's the transferable skill.",
    key_term: "Responsible AI",
    key_term_def:
      "The practice of building and deploying AI in ways that are transparent, fair, accountable, and safe — including human oversight, bias checks, privacy controls, and clear escalation paths when the system fails.",
    resource_label: "Wikipedia — Ethics of artificial intelligence",
    resource_url: "https://en.wikipedia.org/wiki/Ethics_of_artificial_intelligence",
    reflection_prompt:
      "Looking back across all ten weeks: what changed about how you think about AI, and what are you most proud of?",
    milestone_label:
      "Aug 4–5 — Final presentation window · Aug 6 — Summer bash · Aug 7 — Last day",
    tasks: [
      { title: "Deliver the final executive presentation", xp: 60 },
      { title: "Capture leadership feedback and document next steps", xp: 30 },
      { title: "Submit the closing reflection", xp: 30 },
      { title: "Celebrate at the summer bash 🎉", xp: 20 },
    ],
  },
];

/** Milestone badges awarded automatically when conditions are met. */
export type BadgeDef = {
  key: string;
  name: string;
  description: string;
  icon: string;
  hint: string;
};

export const BADGES: BadgeDef[] = [
  {
    key: "first_steps",
    name: "First Steps",
    description: "Completed your first task. The journey begins.",
    icon: "🚦",
    hint: "Complete any 1 task.",
  },
  {
    key: "enterprise_thinker",
    name: "Context Explorer",
    description: "Completed Phase 1 — you understand the problem and the landscape.",
    icon: "🗺️",
    hint: "Complete Weeks 1–2 (Phase 1).",
  },
  {
    key: "rfp_analyst",
    name: "Launch Supporter",
    description: "Completed Phase 2 — pilot is live and data is ready.",
    icon: "🚀",
    hint: "Complete Weeks 3–4 (Phase 2).",
  },
  {
    key: "data_foundations",
    name: "Pilot Analyst",
    description: "Completed Phase 3 — you measured what matters.",
    icon: "📊",
    hint: "Complete Weeks 5–7 (Phase 3).",
  },
  {
    key: "business_case_builder",
    name: "Playbook Author",
    description: "Completed Phase 4 — you built the playbook and the case.",
    icon: "📘",
    hint: "Complete Weeks 8–10 (Phase 4).",
  },
  {
    key: "scorekeeper",
    name: "Scorekeeper",
    description: "Scored every vendor against every criterion in the Workspace.",
    icon: "🎯",
    hint: "Fill in all vendor scores in the Workspace.",
  },
  {
    key: "reflective_practitioner",
    name: "Reflective Practitioner",
    description: "Submitted reflections for at least 5 weeks.",
    icon: "🪞",
    hint: "Submit 5 weekly reflections.",
  },
  {
    key: "presenter",
    name: "Final Presenter",
    description: "Delivered the final executive presentation.",
    icon: "🎤",
    hint: "Complete Week 10.",
  },
  {
    key: "journey_complete",
    name: "Journey Complete",
    description: "Finished all ten weeks. Welcome to enterprise AI.",
    icon: "🏆",
    hint: "Complete all 10 weeks.",
  },
];
