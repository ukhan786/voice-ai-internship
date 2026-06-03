/**
 * The 10-week curriculum is the single source of truth for both the seeded
 * database (supabase/schema.sql is generated to match) and for any UI that
 * needs static copy. Dates are anchored to the real internship calendar:
 *
 *   Week 1 begins Monday June 1, 2026 (orientation).
 *   June 2  — first day in the Business Unit
 *   June 12 — trivia + facility tours
 *   June 29 — mid-summer evaluation
 *   July 4  — holiday
 *   Jul 28–29 OR Aug 4–5 — final presentation windows
 *   Aug 6   — summer bash
 *   Aug 7   — last day
 *
 * Curriculum arc:
 *   Wk 1–2  Enterprise AI vs consumer AI; why Voice AI matters in dealerships
 *   Wk 3–4  How companies evaluate vendors — RFPs, scoring, proof of concept
 *   Wk 5–6  Data requirements for AI; why clean data is the foundation
 *   Wk 7–8  Building the business case; how AI decisions get made at C-suite
 *   Wk 9–10 Synthesis + final presentation prep
 */

export type Milestone = {
  date: string; // ISO
  label: string;
};

export type WeekTask = {
  title: string;
  xp: number;
};

export type WeekModule = {
  week_no: number;
  title: string;
  theme: string;
  start_date: string; // ISO (Monday)
  end_date: string; // ISO (Sunday)
  objective: string;
  primer_title: string;
  primer_body: string;
  reflection_prompt: string;
  milestone_label: string | null;
  tasks: WeekTask[];
};

export const CURRICULUM: WeekModule[] = [
  {
    week_no: 1,
    title: "Orientation & the Voice AI Landscape",
    theme: "Enterprise AI vs. Consumer AI",
    start_date: "2026-06-01",
    end_date: "2026-06-07",
    objective:
      "Understand how enterprise AI differs from the consumer AI you already use, and where Westside Lexus's Voice AI initiative fits.",
    primer_title: "Enterprise AI is a different sport",
    primer_body:
      "Consumer AI (your phone assistant, a chatbot) optimizes for a single delighted user. Enterprise AI optimizes for reliability, governance, integration, and ROI across thousands of interactions. At a dealership, a Voice AI that mis-routes 2% of service calls isn't a cute bug — it's lost revenue and a frustrated customer. This summer you'll learn to evaluate AI the way a Director of Data & AI does: not 'is it cool?' but 'is it dependable, secure, integrable, and worth the spend?'",
    reflection_prompt:
      "Name one AI product you use daily. What would have to change about it to make it 'enterprise-grade' for a dealership?",
    milestone_label: "June 1 — Orientation",
    tasks: [
      { title: "Complete orientation & set up accounts/tools", xp: 40 },
      { title: "Read the project brief: Westside Lexus Voice AI evaluation", xp: 30 },
      { title: "List 3 differences between consumer and enterprise AI", xp: 20 },
    ],
  },
  {
    week_no: 2,
    title: "Why Voice AI Matters in Automotive",
    theme: "Voice AI in Dealership Operations",
    start_date: "2026-06-08",
    end_date: "2026-06-14",
    objective:
      "Map the dealership workflows where Voice AI creates value: service scheduling, after-hours capture, sales follow-up, and internal assistance.",
    primer_title: "The dealership is a phone-first business",
    primer_body:
      "A Lexus dealership lives on inbound and outbound calls: service appointments, parts, status updates, sales inquiries. Missed and mishandled calls leak revenue every day. Voice AI can answer 24/7, book service, qualify leads, and hand off cleanly to a human — but only if it understands automotive context (VINs, models, service intervals) and plugs into the DMS/CRM. This week you'll learn the operational map before judging any vendor.",
    reflection_prompt:
      "Pick one dealership workflow. Walk through what a great Voice AI interaction looks like end-to-end — and where it could go wrong.",
    milestone_label: "June 12 — Trivia & facility tours",
    tasks: [
      { title: "Tour the facility; note where calls/handoffs happen", xp: 30 },
      { title: "Diagram one Voice AI dealership workflow", xp: 40 },
      { title: "Win (or survive) Voice AI trivia", xp: 20 },
      { title: "Identify the top 3 'leaky' call moments to target", xp: 30 },
    ],
  },
  {
    week_no: 3,
    title: "How Companies Buy AI: The RFP",
    theme: "Vendor Evaluation — RFPs & Scoring",
    start_date: "2026-06-15",
    end_date: "2026-06-21",
    objective:
      "Learn what an RFP is, why structured scoring beats gut feel, and how to translate business needs into weighted criteria.",
    primer_title: "An RFP turns opinions into evidence",
    primer_body:
      "A Request for Proposal (RFP) is how an enterprise asks vendors to prove they can solve a defined problem. The magic isn't the document — it's the scoring rubric. By agreeing on weighted criteria (accuracy, latency, integration, cost, data needs, workflow fit) before talking to vendors, you defend the decision against hype and politics. This week you'll set up the scoring model you'll use for the rest of the summer.",
    reflection_prompt:
      "Which scoring criterion do you think deserves the highest weight for Westside Lexus, and why?",
    milestone_label: null,
    tasks: [
      { title: "Define the weighted scoring criteria in the Workspace", xp: 40 },
      { title: "Add the vendors currently under review", xp: 30 },
      { title: "Write the evaluation goal in the Decision Log", xp: 30 },
    ],
  },
  {
    week_no: 4,
    title: "Proof of Concept & Vendor Discussions",
    theme: "Vendor Evaluation — POC & Diligence",
    start_date: "2026-06-22",
    end_date: "2026-06-28",
    objective:
      "Run the comparison: score each vendor against the criteria, prep sharp vendor questions, and capture takeaways.",
    primer_title: "A demo is a sales tool; a POC is evidence",
    primer_body:
      "Every vendor demo looks great — it's curated. A proof of concept (POC) tests the vendor against YOUR data and YOUR workflows. Before any POC, you prep questions that separate marketing from reality: 'What's your word-error-rate on automotive terms?', 'How do you handle a VIN read-back?', 'What's the integration path to our DMS?'. This week you turn the rubric into scores and your meetings into documented takeaways.",
    reflection_prompt:
      "What was the most surprising thing you learned scoring the vendors against real criteria?",
    milestone_label: null,
    tasks: [
      { title: "Score every vendor against every criterion", xp: 50 },
      { title: "Prep 5 vendor-discussion questions", xp: 30 },
      { title: "Log takeaways from a vendor discussion", xp: 30 },
      { title: "Review the auto-ranked results; note any surprises", xp: 20 },
    ],
  },
  {
    week_no: 5,
    title: "The Data Foundation",
    theme: "Data Requirements for AI",
    start_date: "2026-06-29",
    end_date: "2026-07-05",
    objective:
      "Understand what data a Voice AI system needs to work, and why the mid-summer checkpoint is a great moment to assess data readiness.",
    primer_title: "Garbage in, confident garbage out",
    primer_body:
      "A Voice AI is only as good as the data behind it: customer records, vehicle/service history, appointment availability, pricing, and the integrations that keep them current. If the DMS data is stale or fragmented, even a brilliant model gives wrong answers — confidently. This is the unglamorous truth of enterprise AI: most of the value (and most of the work) is in the data foundation, not the model.",
    reflection_prompt:
      "Self-assess at the mid-point: what's going well, and what do you want to push harder on in the second half?",
    milestone_label: "June 29 — Mid-summer evaluation • July 4 — Holiday",
    tasks: [
      { title: "List the data sources a dealer Voice AI must read/write", xp: 40 },
      { title: "Note 3 data-quality risks for the project", xp: 30 },
      { title: "Complete the mid-summer self-evaluation", xp: 40 },
    ],
  },
  {
    week_no: 6,
    title: "Clean Data as a Competitive Edge",
    theme: "Data Quality & Governance",
    start_date: "2026-07-06",
    end_date: "2026-07-12",
    objective:
      "Connect data quality and governance (privacy, retention, PII) to vendor scoring — especially the 'data requirements' criterion.",
    primer_title: "Trust is a data property",
    primer_body:
      "Customers share names, phone numbers, vehicles, and sometimes payment context. Enterprise AI must respect privacy, retention limits, and access controls — and so must any vendor you choose. 'How is our customer data stored, for how long, and who can see it?' is not a legal footnote; it's a scoring criterion. Revisit your vendor scores now that you understand data governance.",
    reflection_prompt:
      "Did learning about data governance change how you'd score any vendor? Explain.",
    milestone_label: null,
    tasks: [
      { title: "Add/refine the 'data requirements' scoring notes", xp: 30 },
      { title: "Document governance questions for vendors", xp: 30 },
      { title: "Re-score at least one vendor with fresh eyes", xp: 40 },
    ],
  },
  {
    week_no: 7,
    title: "Building the Business Case",
    theme: "ROI & The Business Case",
    start_date: "2026-07-13",
    end_date: "2026-07-19",
    objective:
      "Translate the technical evaluation into dollars: cost, captured revenue, time saved, and risk — the language executives use.",
    primer_title: "Executives buy outcomes, not features",
    primer_body:
      "A C-suite sponsor doesn't approve 'a Voice AI with 95% accuracy.' They approve 'a system that recovers ~$X in missed service calls and frees Y staff hours, paying back in Z months.' The business case ties your scoring to outcomes: captured after-hours bookings, reduced hold times, higher CSI. This week you draft the value story behind the recommendation.",
    reflection_prompt:
      "What's the single most compelling number in your business case, and how would you defend it?",
    milestone_label: null,
    tasks: [
      { title: "Draft the business-case outline in the Decision Log", xp: 40 },
      { title: "Estimate one quantified benefit (e.g. captured calls)", xp: 40 },
      { title: "Map each top vendor to its business-case fit", xp: 30 },
    ],
  },
  {
    week_no: 8,
    title: "How AI Decisions Get Made",
    theme: "Decision-Making at the C-Suite",
    start_date: "2026-07-20",
    end_date: "2026-07-26",
    objective:
      "Understand stakeholders, risk, and governance in an enterprise AI decision — and form a defensible recommendation.",
    primer_title: "The recommendation is a story with a spine",
    primer_body:
      "Enterprise AI decisions weigh more than the best score: change management, vendor stability, security review, and executive risk appetite all matter. A strong recommendation states the choice, the evidence (your weighted scores), the business case, the risks, and the mitigation. Decision-makers reward clarity and honesty about trade-offs over false certainty.",
    reflection_prompt:
      "Who are the stakeholders in this decision, and what does each one care about most?",
    milestone_label: null,
    tasks: [
      { title: "Write a one-line recommendation + top 3 reasons", xp: 40 },
      { title: "List risks and a mitigation for each", xp: 40 },
      { title: "Identify stakeholders and their priorities", xp: 30 },
    ],
  },
  {
    week_no: 9,
    title: "Synthesis",
    theme: "Synthesis & Storyline",
    start_date: "2026-07-27",
    end_date: "2026-08-02",
    objective:
      "Pull ten weeks into one coherent storyline and build the spine of the final presentation.",
    primer_title: "Synthesis is subtraction",
    primer_body:
      "You've gathered a summer of detail. Synthesis means cutting it to the story that matters: the problem, the evaluation method, the evidence, the recommendation, the value, and the next step. A great final presentation could be reconstructed from its section titles alone. Build that skeleton now; you'll add polish next week.",
    reflection_prompt:
      "In two sentences, what is your final recommendation and why should leadership believe it?",
    milestone_label: "Jul 28–29 — Final presentation (window 1)",
    tasks: [
      { title: "Outline the final presentation (section by section)", xp: 50 },
      { title: "Pull your strongest 3 data points from the Workspace", xp: 30 },
      { title: "Draft the one-slide executive summary", xp: 40 },
    ],
  },
  {
    week_no: 10,
    title: "Final Presentation & Wrap-Up",
    theme: "Deliver & Reflect",
    start_date: "2026-08-03",
    end_date: "2026-08-09",
    objective:
      "Deliver the final presentation, capture feedback, and reflect on the journey from consumer-AI user to enterprise-AI evaluator.",
    primer_title: "Land it, then look back",
    primer_body:
      "Delivery is a skill: open with the recommendation, support it with evidence, invite hard questions, and close with the next step. Then reflect — the goal of the summer wasn't just a vendor pick; it was learning how enterprise AI decisions get made. That perspective is what you carry forward, wherever your career goes.",
    reflection_prompt:
      "Looking back across all ten weeks: what changed about how you think about AI, and what are you most proud of?",
    milestone_label: "Aug 4–5 — Final presentation (window 2) • Aug 6 — Summer bash • Aug 7 — Last day",
    tasks: [
      { title: "Rehearse and deliver the final presentation", xp: 60 },
      { title: "Capture leadership feedback in the Decision Log", xp: 30 },
      { title: "Submit the closing reflection", xp: 30 },
      { title: "Celebrate at the summer bash 🎉", xp: 20 },
    ],
  },
];

/** Badges tied to learning milestones across the journey. */
export type BadgeDef = {
  key: string;
  name: string;
  description: string;
  icon: string; // emoji used as a lightweight, tasteful glyph
  hint: string; // how it's earned (also drives auto-award logic)
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
    name: "Enterprise Thinker",
    description: "Finished the foundations of enterprise vs. consumer AI.",
    icon: "🏛️",
    hint: "Complete Weeks 1–2.",
  },
  {
    key: "rfp_analyst",
    name: "RFP Analyst",
    description: "Built a weighted scoring model and evaluated vendors.",
    icon: "📋",
    hint: "Complete Weeks 3–4.",
  },
  {
    key: "data_foundations",
    name: "Data Foundations",
    description: "Mastered why clean data is the bedrock of AI.",
    icon: "🧱",
    hint: "Complete Weeks 5–6.",
  },
  {
    key: "business_case_builder",
    name: "Business Case Builder",
    description: "Turned a technical evaluation into an executive value story.",
    icon: "📈",
    hint: "Complete Weeks 7–8.",
  },
  {
    key: "presenter",
    name: "Presenter",
    description: "Synthesized the summer and delivered the final presentation.",
    icon: "🎤",
    hint: "Complete Weeks 9–10.",
  },
  {
    key: "scorekeeper",
    name: "Scorekeeper",
    description: "Scored every vendor against every criterion.",
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
    key: "journey_complete",
    name: "Journey Complete",
    description: "Finished all ten weeks. Consumer-AI user → enterprise-AI evaluator.",
    icon: "🏆",
    hint: "Complete all 10 weeks.",
  },
];
