import type { State } from "./types";

const ev = (s: State, k: string, n = 1) => (s.events[k] ?? 0) >= n;

export type LabTask = { id: string; label: string; hint: string; href: string; check: (s: State) => boolean };
export type Lab = { id: string; title: string; emoji: string; color: string; desc: string; xp: number; level: "Beginner" | "Intermediate" | "Advanced"; tasks: LabTask[] };

export const LABS: Lab[] = [
  {
    id: "lab-chat", title: "First steps with grounded chat", emoji: "💬", color: "#4285f4", xp: 50, level: "Beginner",
    desc: "Ask questions over company data and verify answers with citations.",
    tasks: [
      { id: "t1", label: "Send your first chat message", hint: "Type anything in the chat box", href: "/chat", check: (s) => ev(s, "chat_sent") },
      { id: "t2", label: "Use a suggested prompt chip", hint: "Click one of the colorful chips", href: "/chat", check: (s) => ev(s, "prompt_chip") },
      { id: "t3", label: "Open a citation to verify an answer", hint: "Click a [1] chip or a source card", href: "/chat", check: (s) => ev(s, "citation_opened") },
      { id: "t4", label: "Expand 'Show thinking' to see the RAG steps", hint: "Under any answer", href: "/chat", check: (s) => ev(s, "thinking_opened") },
      { id: "t5", label: "Ask 5 questions in total", hint: "Follow-ups count too", href: "/chat", check: (s) => ev(s, "chat_sent", 5) },
    ],
  },
  {
    id: "lab-connect", title: "Connect your company data", emoji: "🔌", color: "#f9ab00", xp: 60, level: "Beginner",
    desc: "Wire up connectors, run syncs, then get answers from new sources.",
    tasks: [
      { id: "t1", label: "Connect Jira", hint: "Connectors → Jira → Connect", href: "/connectors", check: (s) => !!s.connectors.jira },
      { id: "t2", label: "Connect a connector in Federated mode", hint: "Choose 'Federated' in the setup dialog", href: "/connectors", check: (s) => Object.values(s.connectors).some((c) => c?.mode === "federated") },
      { id: "t3", label: "Have 5 or more sources connected", hint: "Drive and Gmail start connected", href: "/connectors", check: (s) => Object.keys(s.connectors).length >= 5 },
      { id: "t4", label: "Get an answer that cites Jira", hint: "Ask: 'What P1 bugs are open?'", href: "/chat", check: (s) => ev(s, "cite_jira") },
      { id: "t5", label: "Hit a permission wall (ACL demo)", hint: "Ask about 'executive compensation'", href: "/chat", check: (s) => ev(s, "acl_blocked") },
    ],
  },
  {
    id: "lab-gallery", title: "Explore prebuilt agents", emoji: "🧩", color: "#9b72cb", xp: 60, level: "Beginner",
    desc: "Try Idea Generation, Data Insights and the help desk agent.",
    tasks: [
      { id: "t1", label: "Chat with Idea Generation", hint: "Agents → Idea Generation", href: "/agents", check: (s) => ev(s, "agent_chat_builtin-idea") },
      { id: "t2", label: "Chat with Data Insights", hint: "Agents → Data Insights", href: "/agents", check: (s) => ev(s, "agent_chat_builtin-data") },
      { id: "t3", label: "Ask IT Help Desk to open a ticket and confirm the action", hint: "Say 'Open a ticket for my broken monitor' and click Confirm", href: "/agents", check: (s) => ev(s, "action_confirmed") },
    ],
  },
  {
    id: "lab-agent", title: "Build your first agent", emoji: "🤖", color: "#d96570", xp: 100, level: "Intermediate",
    desc: "Use Agent Designer: instructions, knowledge, tools, test and publish.",
    tasks: [
      { id: "t1", label: "Create and save an agent", hint: "Agents → + Create agent", href: "/agents/designer", check: (s) => s.agents.length >= 1 },
      { id: "t2", label: "Score 80%+ on the instruction checklist", hint: "Include role, goal, audience, tone, constraints, format", href: "/agents/designer", check: (s) => ev(s, "instructions_80") },
      { id: "t3", label: "Give an agent 3 or more tools", hint: "Tick tools in the designer", href: "/agents/designer", check: (s) => s.agents.some((a) => a.tools.length >= 3) },
      { id: "t4", label: "Test it in the preview pane", hint: "Ask it something on the right side", href: "/agents/designer", check: (s) => ev(s, "agent_tested") },
      { id: "t5", label: "Publish your agent", hint: "Click Publish", href: "/agents/designer", check: (s) => s.agents.some((a) => a.published) },
    ],
  },
  {
    id: "lab-workflow", title: "Automate with workflows", emoji: "⚙️", color: "#00a1e0", xp: 100, level: "Intermediate",
    desc: "Chain a trigger, AI steps and actions — with a human approval.",
    tasks: [
      { id: "t1", label: "Create a workflow", hint: "Workflows → New or start from a template", href: "/workflows", check: (s) => s.workflows.length >= 1 },
      { id: "t2", label: "Have a workflow with 4+ steps", hint: "Add steps from the palette", href: "/workflows", check: (s) => s.workflows.some((w) => w.steps.length >= 4) },
      { id: "t3", label: "Include a Human approval step", hint: "Palette → Human approval", href: "/workflows", check: (s) => s.workflows.some((w) => w.steps.some((x) => x.kind === "approval")) },
      { id: "t4", label: "Run a workflow successfully", hint: "Click ▶ Run", href: "/workflows", check: (s) => ev(s, "workflow_run") },
      { id: "t5", label: "Use a non-manual trigger", hint: "Schedule, email, Jira or form", href: "/workflows", check: (s) => s.workflows.some((w) => w.trigger !== "manual") },
    ],
  },
  {
    id: "lab-research", title: "Deep Research & NotebookLM", emoji: "🔬", color: "#34a853", xp: 100, level: "Intermediate",
    desc: "Plan and run research, then study it in a notebook.",
    tasks: [
      { id: "t1", label: "Edit a research plan before running", hint: "Change any plan step text", href: "/research", check: (s) => ev(s, "plan_edited") },
      { id: "t2", label: "Run a Deep Research report", hint: "Click Start research", href: "/research", check: (s) => ev(s, "research_run") },
      { id: "t3", label: "Create a notebook with 3+ sources", hint: "NotebookLM → New notebook → add sources", href: "/notebook", check: (s) => s.notebooks.some((n) => n.sources.length >= 3) },
      { id: "t4", label: "Generate an Audio Overview", hint: "Studio panel → Audio overview", href: "/notebook", check: (s) => ev(s, "nb_audio") },
      { id: "t5", label: "Ask the notebook a question", hint: "Use the notebook chat", href: "/notebook", check: (s) => ev(s, "nb_chat") },
    ],
  },
  {
    id: "lab-admin", title: "Admin & governance", emoji: "🛡️", color: "#1fa463", xp: 80, level: "Advanced",
    desc: "Assign licenses, set policies and review the audit log.",
    tasks: [
      { id: "t1", label: "Assign licenses to 3 users", hint: "Admin → Users & licenses", href: "/admin", check: (s) => Object.values(s.licenses).filter((v) => v !== "none").length >= 3 },
      { id: "t2", label: "Turn on Model Armor (safety filtering)", hint: "Admin → Policies", href: "/admin", check: (s) => s.policies.modelArmor === true },
      { id: "t3", label: "Change data residency", hint: "Admin → Policies → Data residency", href: "/admin", check: (s) => s.policies.residency !== "global" },
      { id: "t4", label: "Review the audit log", hint: "Admin → Audit log tab", href: "/admin", check: (s) => ev(s, "audit_viewed") },
    ],
  },
  {
    id: "lab-scholar", title: "Academy scholar", emoji: "🎓", color: "#ff7a1a", xp: 120, level: "Advanced",
    desc: "Finish the learning modules and ace the quizzes.",
    tasks: [
      { id: "t1", label: "Complete 3 learning modules", hint: "Learn → read a module → Mark complete", href: "/learn", check: (s) => s.lessonsDone.length >= 3 },
      { id: "t2", label: "Pass 5 quizzes (2/3 or better)", hint: "Quiz at the end of each module", href: "/learn", check: (s) => Object.values(s.quizScores).filter((v) => v >= 2).length >= 5 },
      { id: "t3", label: "Get a perfect score on 3 quizzes", hint: "3/3 correct", href: "/learn", check: (s) => Object.values(s.quizScores).filter((v) => v === 3).length >= 3 },
      { id: "t4", label: "Complete all modules", hint: "Every module marked complete", href: "/learn", check: (s) => s.lessonsDone.length >= 9 },
    ],
  },
];

export function labProgress(s: State) {
  const all = LABS.flatMap((l) => l.tasks);
  const done = all.filter((t) => t.check(s)).length;
  return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
}

export function nextTask(s: State) {
  for (const l of LABS) for (const t of l.tasks) if (!t.check(s)) return { lab: l, task: t };
  return null;
}
