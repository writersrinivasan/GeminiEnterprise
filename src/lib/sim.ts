import { DOCS, SOURCES, TOOLS } from "./data";
import type { Agent, Doc, Reply, SourceId } from "./types";

/* ------------------------------------------------------------------ */
/* Very small "retrieval + generation" simulator. It is NOT an LLM —    */
/* it keyword-scores the fictional docs and composes a templated answer */
/* so that learners can see the *shape* of a grounded response.         */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  "a an the of for to in on at is are was were be our we us me my i you your what whats what's how do does did can could should would please about with and or any right now tell show give get from this that it its by as".split(" ")
);

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const uid = () => Math.random().toString(36).slice(2, 10);

function tokens(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9$+ ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function searchDocs(q: string, sources: SourceId[], limit = 3, includeRestricted = false): Doc[] {
  const tks = tokens(q);
  if (!tks.length) return [];
  const scored = DOCS.filter((d) => sources.includes(d.source))
    .filter((d) => includeRestricted || !d.restricted)
    .map((d) => {
      const hay = (d.title + " " + d.snippet + " " + d.points.join(" ")).toLowerCase();
      let s = 0;
      for (const t of tks) {
        const stem = t.replace(/s$/, "");
        const re = new RegExp("\\b" + stem.replace(/[$+]/g, "\\$&"));
        if (re.test(d.title.toLowerCase())) s += 3;
        if (d.tags.some((tag) => re.test(tag) || tag === t)) s += 2;
        if (re.test(hay)) s += 1;
      }
      return { d, s };
    })
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.d);
}

/** True when the query targets restricted content — used to teach permission-aware search. */
export function hitsRestricted(q: string, sources: SourceId[]) {
  const full = searchDocs(q, sources, 3, true);
  return full.some((d) => d.restricted);
}

function srcNames(docs: Doc[]) {
  return Array.from(new Set(docs.map((d) => SOURCES[d.source].name)));
}

export function answer(q: string, sources: SourceId[]): Reply {
  const ql = q.toLowerCase();
  const thinking: string[] = [
    `Understanding the request: “${q.length > 60 ? q.slice(0, 60) + "…" : q}”`,
    `Searching ${sources.length} connected source${sources.length === 1 ? "" : "s"}: ${sources.map((s) => SOURCES[s].name).join(", ") || "none"}`,
  ];

  if (!sources.length) {
    return {
      thinking: [...thinking, "No data sources are connected"],
      text: "I don't have any company data sources connected yet, so I can't ground an answer. 🔌\n\nGo to **Connectors** and connect Google Drive, Jira or others — then ask me again!",
      citations: [],
      followups: ["How do connectors work?"],
    };
  }

  const docs = searchDocs(q, sources);
  const restricted = hitsRestricted(q, sources);

  if (!docs.length) {
    const t = restricted
      ? "I found a matching document, but **you don't have permission to view it**, so I can't use it. 🔒\n\nGemini Enterprise respects the source system's access controls (ACLs): answers only use content **you** are allowed to see."
      : missingSourceHint(q, sources) ?? generic();
    return {
      thinking: [...thinking, restricted ? "Match found but filtered by access controls (ACL)" : "No strong matches in connected sources", "Composing a best-effort answer"],
      text: t,
      citations: [],
      followups: ["What P1 bugs are open right now?", "Summarize our Q3 sales performance"],
    };
  }

  thinking.push(`Found ${docs.length} relevant item${docs.length > 1 ? "s" : ""} in ${srcNames(docs).join(" + ")}`);
  thinking.push("Reading top results and checking your permissions");
  thinking.push("Writing a grounded answer with citations");

  let text = "";
  if (/\b(draft|write|compose)\b.*\b(email|message|note)\b|\bemail\b.*\b(about|to)\b/.test(ql)) {
    const d = docs[0];
    text =
      `Here's a draft based on **${d.title}** [1]:\n\n### ✉️ Draft email\n**Subject:** Update: ${d.title.replace(/^Re: /, "")}\n\nHi team,\n\nQuick update on ${d.title.split(":")[0].toLowerCase()}:\n` +
      d.points.map((p) => `- ${p}`).join("\n") +
      `\n\nPlease reply with any concerns by end of day.\n\nThanks,\nYou\n\n_Tip: an agent with the **Gmail: send email** tool could send this for you after you confirm._`;
  } else if (/summar|overview|tl;?dr|recap/.test(ql)) {
    text = `Here's a summary from ${srcNames(docs).join(" and ")}:\n\n` + docs.map((d, i) => `### ${d.title} [${i + 1}]\n` + d.points.slice(0, 3).map((p) => `- ${p}`).join("\n")).join("\n\n");
  } else {
    const d0 = docs[0];
    text = `${d0.snippet} [1]\n\n**Key details:**\n` + d0.points.map((p) => `- ${p} [1]`).join("\n");
    if (docs.length > 1) {
      text += `\n\n**Also related:**\n` + docs.slice(1).map((d, i) => `- **${d.title}** — ${d.snippet} [${i + 2}]`).join("\n");
    }
  }

  return {
    thinking,
    text,
    citations: docs,
    followups: followupsFor(docs),
  };
}

function missingSourceHint(q: string, sources: SourceId[]) {
  const others = (Object.keys(SOURCES) as SourceId[]).filter((s) => !sources.includes(s));
  const hits = searchDocs(q, others, 3);
  if (!hits.length) return null;
  const names = srcNames(hits);
  return `I couldn't find this in your connected sources — but it looks like the answer lives in **${names.join(" and ")}**, which ${names.length > 1 ? "aren't" : "isn't"} connected (or is switched off in Sources). 🔌\n\n- Go to **Connectors** and connect ${names.join(" / ")}\n- Then ask again and watch the answer get grounded with citations\n\n_This is exactly why connectors matter: AI can only ground on data it can reach._`;
}

function generic() {
  return `I couldn't find anything about that in your connected company data. 🤔\n\nA few things to try:\n- Connect more sources on the **Connectors** page (e.g. Jira, Salesforce)\n- Use names, project codes or dates (e.g. “NIM-431”, “Q3”)\n- Turn on **web grounding** for public information\n\n_In the real product, Gemini can also answer from general model knowledge when grounding returns nothing._`;
}

function followupsFor(docs: Doc[]) {
  const map: Record<string, string> = {
    d1: "Which region missed its target?",
    d2: "What is the holiday campaign budget split?",
    d3: "What should a new hire do in week 1?",
    d4: "What's our return policy for members?",
    d6: "Draft an email about the gift card checkout bug",
    d10: "What are the risks on the Alpine Lodge deal?",
    d11: "Summarize the Q4 pipeline",
    d12: "Is the VPN down?",
    d14: "When is the FY27 budget deadline?",
    d15: "Draft an email about the TrailTex shipment delay",
    d16: "What's on the QBR agenda?",
  };
  const f = docs.map((d) => map[d.id]).filter(Boolean);
  return Array.from(new Set(f)).slice(0, 3);
}

/* ------------------------------ Agents ------------------------------ */

export function instructionScore(ins: string) {
  const s = ins.toLowerCase();
  const checks = [
    { id: "role", label: "Defines a role / persona", ok: /\byou are\b|\bact as\b|\byour role\b/.test(s) },
    { id: "task", label: "States the goal or task", ok: /\b(help|answer|goal|task|your job|assist|create|draft|triage|summari)/.test(s) },
    { id: "audience", label: "Names the audience", ok: /\b(employee|customer|team|user|manager|new hire|staff|engineer|sales)/.test(s) },
    { id: "tone", label: "Sets tone & style", ok: /\b(tone|friendly|formal|concise|brief|warm|professional|casual|bullet)/.test(s) },
    { id: "constraints", label: "Adds guardrails / constraints", ok: /\b(never|do not|don't|only|always|must|avoid)\b/.test(s) },
    { id: "format", label: "Specifies output format", ok: /\b(format|bullet|table|list|steps|markdown|headings|json|sections)\b/.test(s) },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { score, checks };
}

export function agentAnswer(q: string, agent: Agent, connected: SourceId[]): Reply {
  const ql = q.toLowerCase();
  const ins = agent.instructions.toLowerCase();
  const allowed = agent.sources.length ? agent.sources.filter((s) => connected.includes(s)) : connected;
  const has = (t: string) => agent.tools.includes(t);
  const toolName = (t: string) => TOOLS.find((x) => x.id === t)?.name ?? t;

  // Specialised built-ins
  if (agent.id === "builtin-idea") return ideaAgent(q);
  if (agent.id === "builtin-data") return dataAgent(q, allowed);

  const base: Reply = has("search")
    ? answer(q, allowed)
    : { thinking: ["Company search tool is disabled for this agent"], text: "I don't have access to company data (the **Company search** tool is off), so here's a general answer:\n\n" + generic().split("\n\n").slice(1).join("\n\n"), citations: [] };

  const thinking = [`🤖 Running as **${agent.name}** with your instructions`, ...base.thinking];
  let text = base.text;
  let action: Reply["action"];
  const notes: string[] = [];

  const intents: { tool: string; re: RegExp; make: () => Reply["action"] }[] = [
    { tool: "jira_create", re: /\b(ticket|issue|bug|report a|file a|open a)\b/, make: () => ({ tool: "jira_create", title: "Create Jira issue", detail: `Project: NIM · Type: Task · Summary: “${q.slice(0, 70)}” · Priority: P3` }) },
    { tool: "gmail_send", re: /\b(send|email|reply|notify)\b/, make: () => ({ tool: "gmail_send", title: "Send email via Gmail", detail: `To: team@nimbus.example · Subject: “${(base.citations[0]?.title ?? q).slice(0, 60)}”` }) },
    { tool: "calendar_create", re: /\b(schedule|meeting|book|invite|calendar)\b/, make: () => ({ tool: "calendar_create", title: "Create calendar event", detail: "Title: Follow-up sync · Thu 2:00–2:30 PM · Attendees: 4 · Google Meet link added" }) },
  ];
  for (const it of intents) {
    if (it.re.test(ql)) {
      if (has(it.tool)) {
        if (!action) {
          action = it.make();
          thinking.push(`Preparing action with tool: ${toolName(it.tool)} (needs your confirmation)`);
        }
      } else {
        notes.push(`⚠️ This sounds like a job for **${toolName(it.tool)}**, but that tool isn't enabled for this agent. Add it in Agent Designer → Tools.`);
      }
    }
  }

  if (/\b(latest|news|competitor|market|trend|industry|web)\b/.test(ql)) {
    if (has("web_search")) {
      thinking.splice(2, 0, "🌐 Searching the public web (simulated)");
      notes.push("🌐 **From the web (simulated):** Industry analysts expect outdoor apparel demand to grow ~6% in 2027, with rental & resale models gaining share.");
    } else notes.push("ℹ️ Web grounding is off for this agent, so I only used company data.");
  }
  if (/\b(chart|table|calculate|analy|compare|numbers|percent)\b/.test(ql)) {
    if (has("data_analysis")) {
      thinking.push("📈 Running data analysis (simulated code execution)");
      notes.push("### 📈 Quick analysis\n| Metric | Value | Δ |\n|---|---|---|\n| Q3 revenue | $48.2M | +12% |\n| Online share | 44% | +6 pts |\n| Q4 weighted pipeline | $3.1M | — |");
    } else notes.push("⚠️ Enable the **Data analysis** tool to get tables and calculations.");
  }
  if (/\b(image|poster|visual|banner|picture)\b/.test(ql)) {
    if (has("image_gen")) notes.push("🎨 **Generated image (simulated):** A hiker in a Glacier-Blue Summit jacket on a snowy ridge at sunrise, Ember-Orange accents, tagline “Gear Up for Winter”.");
    else notes.push("⚠️ Enable **Image generation** to create visuals.");
  }

  // Apply instruction style
  if (/\b(concise|brief|short)\b/.test(ins)) {
    const lines = text.split("\n");
    text = lines.slice(0, Math.min(lines.length, 6)).join("\n");
  }
  let prefix = "";
  if (/\bfriendly|warm|cheerful|fun\b/.test(ins)) prefix = "Happy to help! 😊 ";
  if (/\bformal|professional\b/.test(ins)) prefix = "Certainly. ";
  if (/\bpirate\b/.test(ins)) prefix = "Ahoy, matey! 🏴‍☠️ ";
  if (/\btamil\b/.test(ins)) prefix = "வணக்கம்! ";
  text = prefix + text + (notes.length ? "\n\n" + notes.join("\n\n") : "");

  return { thinking, text, citations: base.citations, followups: agent.starters.length ? agent.starters.slice(0, 3) : base.followups, action };
}

function ideaAgent(q: string): Reply {
  const topic = q.replace(/^(ideas?|ways?) (to|for)\s*/i, "") || q;
  const ideas = [
    ["Trail-to-Table pop-up events", 92, "Leverages our #1 category (trail running, +31%)", "Needs event staff"],
    ["Nimbus+ ‘Gear Swap’ trade-in program", 88, "Drives loyalty & resale revenue", "Logistics for used items"],
    ["AI fit-finder on product pages", 84, "Reduces returns from sizing", "Engineering effort"],
    ["Micro-influencer trail ambassadors", 79, "Authentic content in brand voice", "Hard to measure ROI"],
    ["Bundle: Summit jacket + Ridge pack", 75, "Raises average order value", "TrailTex supply delay risk"],
  ];
  return {
    thinking: ["💡 Generating 24 raw ideas", "⚔️ Running a tournament: ideas debate head-to-head", "📊 Scoring on impact, feasibility, novelty", "🏅 Ranking the top 5"],
    text:
      `Here are the top-ranked ideas for **${topic}**:\n\n| Rank | Idea | Score | Why it wins | Watch out |\n|---|---|---|---|---|\n` +
      ideas.map((r, i) => `| ${["🥇", "🥈", "🥉", "4", "5"][i]} | ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |`).join("\n") +
      "\n\n_The real Idea Generation agent uses multiple AI ‘critics’ to evaluate ideas — this sandbox simulates the output._",
    citations: DOCS.filter((d) => ["d1", "d2", "d15"].includes(d.id)),
    followups: ["Expand idea #1 into a one-page plan", "Ideas to reduce product returns"],
  };
}

function dataAgent(q: string, allowed: SourceId[]): Reply {
  const pipeline = /pipeline|forecast|deal|q4/.test(q.toLowerCase());
  const text = pipeline
    ? "### 📈 Q4 pipeline health [2]\n| Stage | Deals | Value |\n|---|---|---|\n| Prospecting | 14 | $1.2M |\n| Proposal | 12 | $1.9M |\n| Negotiation | 8 | $2.1M |\n| Commit | 3 | $0.6M |\n| **Total** | **37** | **$5.8M** |\n\n**Takeaway:** Weighted forecast is $3.1M; the Alpine Lodge deal ($640K) alone is 11% of pipeline [1]."
    : "### 📈 Q3 revenue breakdown [1]\n| Channel | Share | YoY |\n|---|---|---|\n| Online | 44% | +6 pts |\n| Stores | 56% | −6 pts |\n| Trail running | 23% | +31% |\n| **Total** | **$48.2M** | **+12%** |\n\n**Takeaway:** Growth is online-led; trail running is the engine.";
  return {
    thinking: ["Translating the question into a query (NL → SQL, simulated)", `Querying tables from ${allowed.map((s) => SOURCES[s].name).join(", ") || "sample data"}`, "Aggregating results", "Building a table and a takeaway"],
    text,
    citations: DOCS.filter((d) => (pipeline ? ["d10", "d11"] : ["d1"]).includes(d.id)),
    followups: ["How healthy is our Q4 pipeline?", "Break down Q3 revenue"],
  };
}

/* ----------------------------- Workflows ---------------------------- */

export const TRIGGERS = [
  { id: "manual", name: "Run manually", emoji: "👆", color: "#6b7280" },
  { id: "schedule", name: "Every weekday at 9:00 AM", emoji: "⏰", color: "#f9ab00" },
  { id: "email", name: "New Gmail message matches filter", emoji: "✉️", color: "#ea4335" },
  { id: "jira", name: "New Jira issue created", emoji: "🐞", color: "#2684ff" },
  { id: "form", name: "Form submitted", emoji: "📝", color: "#34a853" },
];

export type StepKind = {
  kind: string;
  name: string;
  emoji: string;
  color: string;
  desc: string;
  fields: { key: string; label: string; placeholder?: string; options?: string[] }[];
  run: (c: Record<string, string>) => string;
};

export const STEP_KINDS: StepKind[] = [
  { kind: "search", name: "Search company data", emoji: "🔎", color: "#4285f4", desc: "Retrieve documents from data stores", fields: [{ key: "query", label: "Query", placeholder: "e.g. open P1 bugs" }], run: (c) => { const d = searchDocs(c.query || "sales", Object.keys(SOURCES) as SourceId[]); return d.length ? `Found ${d.length} docs: ${d.map((x) => x.title).join("; ")}` : "Found 0 docs (try another query)"; } },
  { kind: "summarize", name: "Summarize with Gemini", emoji: "✨", color: "#9b72cb", desc: "LLM step: condense previous output", fields: [{ key: "style", label: "Style", options: ["3 bullets", "One paragraph", "Executive TL;DR"] }], run: (c) => `Generated ${c.style || "3 bullets"} summary (≈120 words)` },
  { kind: "classify", name: "Classify / route", emoji: "🏷️", color: "#d96570", desc: "LLM step: label the input", fields: [{ key: "labels", label: "Labels", placeholder: "bug, billing, how-to" }], run: (c) => { const l = (c.labels || "bug, billing, how-to").split(",").map((s) => s.trim()); return `Label = “${l[Math.floor(Math.random() * l.length)]}” (confidence 0.${80 + Math.floor(Math.random() * 19)})`; } },
  { kind: "condition", name: "If / else", emoji: "🔀", color: "#f9ab00", desc: "Branch on a value", fields: [{ key: "rule", label: "Condition", placeholder: "priority == P1" }], run: (c) => `Condition “${c.rule || "priority == P1"}” → TRUE, continuing` },
  { kind: "approval", name: "Human approval", emoji: "🙋", color: "#ff7a1a", desc: "Pause until a person approves", fields: [{ key: "approver", label: "Approver", placeholder: "manager@nimbus.example" }], run: (c) => `Approved by ${c.approver || "manager@nimbus.example"} ✅` },
  { kind: "email", name: "Send Gmail", emoji: "✉️", color: "#ea4335", desc: "Action: send an email", fields: [{ key: "to", label: "To", placeholder: "team@nimbus.example" }, { key: "subject", label: "Subject", placeholder: "Daily digest" }], run: (c) => `Email sent to ${c.to || "team@nimbus.example"} — “${c.subject || "Daily digest"}”` },
  { kind: "jira", name: "Create Jira issue", emoji: "🐞", color: "#2684ff", desc: "Action: file a ticket", fields: [{ key: "project", label: "Project", placeholder: "NIM" }], run: (c) => `Created ${c.project || "NIM"}-${480 + Math.floor(Math.random() * 40)}` },
  { kind: "chat", name: "Post to Google Chat", emoji: "💬", color: "#1fa463", desc: "Action: notify a space", fields: [{ key: "space", label: "Space", placeholder: "#holiday-launch" }], run: (c) => `Message posted in ${c.space || "#holiday-launch"}` },
  { kind: "calendar", name: "Create calendar event", emoji: "📅", color: "#f9ab00", desc: "Action: schedule a meeting", fields: [{ key: "title", label: "Title", placeholder: "Triage sync" }], run: (c) => `Event “${c.title || "Triage sync"}” booked for tomorrow 10:00` },
  { kind: "agent", name: "Ask an agent", emoji: "🤖", color: "#00a1e0", desc: "Hand off to one of your agents", fields: [{ key: "agent", label: "Agent name", placeholder: "IT Help Desk" }], run: (c) => `${c.agent || "IT Help Desk"} responded with a 4-step plan` },
];

export const WF_TEMPLATES = [
  { name: "Daily sales digest", emoji: "📊", trigger: "schedule", steps: [["search", { query: "sales pipeline" }], ["summarize", { style: "Executive TL;DR" }], ["email", { to: "leaders@nimbus.example", subject: "Daily sales digest" }]] },
  { name: "Support ticket triage", emoji: "🎫", trigger: "jira", steps: [["classify", { labels: "bug, billing, how-to" }], ["condition", { rule: "label == bug" }], ["agent", { agent: "IT Help Desk" }], ["chat", { space: "#support-triage" }]] },
  { name: "Supplier delay escalation", emoji: "🚚", trigger: "email", steps: [["summarize", { style: "3 bullets" }], ["approval", { approver: "leo@nimbus.example" }], ["jira", { project: "SUP" }], ["calendar", { title: "Supply risk review" }]] },
] as const;

/* ---------------------------- Deep research --------------------------- */

export function researchPlan(topic: string) {
  return [
    `Clarify scope: what “${topic}” means for ${"Nimbus Outfitters"}`,
    "Search internal sources (Drive, SharePoint, Confluence, Salesforce)",
    "Browse public web sources for market context",
    "Compare findings, resolve conflicts, note gaps",
    "Write a structured report with citations",
  ];
}

export function researchReport(topic: string) {
  const all = Object.keys(SOURCES) as SourceId[];
  let docs = searchDocs(topic, all, 4);
  if (docs.length < 2) docs = DOCS.filter((d) => ["d1", "d2", "d11", "d15"].includes(d.id));
  const web = ["Outdoor Industry Outlook 2027 (simulated web source)", "Retail e-commerce benchmarks (simulated web source)", "Consumer sustainability survey (simulated web source)"];
  const cite = (i: number) => `[${i + 1}]`;
  const text =
    `## 🔬 Research report: ${topic}\n\n### Executive summary\n${docs[0].snippet} ${cite(0)} Combined with ${docs.length - 1} other internal sources and ${web.length} web sources, the picture is: momentum is strong, but execution risks need owners.\n\n### Key findings\n` +
    docs.map((d, i) => `- **${d.title}:** ${d.points[0]} ${cite(i)}`).join("\n") +
    `\n- **Market context:** outdoor apparel demand projected to grow ~6% in 2027 (web)\n\n### Risks\n- Supply-chain delays (TrailTex) could constrain hero products\n- Site performance at peak traffic (see Black Friday postmortem)\n\n### Recommendations\n1. Assign a single owner per risk with a weekly check-in\n2. Double down on the highest-growth category\n3. Re-run this research after the QBR on Nov 18\n\n### Sources\n` +
    docs.map((d, i) => `${i + 1}. ${d.title} — ${SOURCES[d.source].name}`).join("\n") +
    "\n" + web.map((w, i) => `${docs.length + i + 1}. ${w}`).join("\n");
  return { text, docs, webCount: web.length };
}

/* ----------------------------- NotebookLM ----------------------------- */

export function notebookGenerate(kind: string, docs: Doc[]) {
  const titles = docs.map((d) => d.title);
  const pts = docs.flatMap((d) => d.points.slice(0, 2));
  switch (kind) {
    case "study":
      return { title: "📚 Study guide", body: `### Key concepts\n${pts.map((p) => `- ${p}`).join("\n")}\n\n### Quiz yourself\n${docs.map((d, i) => `${i + 1}. What is the main point of “${d.title}”?`).join("\n")}\n\n### Glossary\n- **Grounding:** tying an answer to source documents\n- **Citation:** a link back to the exact source` };
    case "faq":
      return { title: "❓ FAQ", body: docs.map((d) => `**Q: What should I know about ${d.title.split(":")[0]}?**\nA: ${d.snippet}`).join("\n\n") };
    case "briefing":
      return { title: "📝 Briefing doc", body: `### Overview\nThis briefing covers ${docs.length} sources: ${titles.join("; ")}.\n\n### Most important points\n${pts.slice(0, 5).map((p) => `- ${p}`).join("\n")}\n\n### Suggested next step\nShare with stakeholders before the Nov 18 QBR.` };
    case "audio":
      return {
        title: "🎧 Audio overview (transcript)",
        body:
          `**Maya:** Welcome to the deep dive! Today we're unpacking ${docs.length} documents from Nimbus Outfitters.\n\n**Leo:** And the first thing that jumped out at me — ${pts[0]?.replace(/\*\*/g, "")}.\n\n**Maya:** Right, and that connects to ${titles[1] ?? titles[0]}. ${pts[2]?.replace(/\*\*/g, "") ?? ""}.\n\n**Leo:** So what's the takeaway for listeners?\n\n**Maya:** Know your numbers, know your risks — and always check the sources. That's it for today! 🎙️`,
      };
    case "mindmap":
      return { title: "🧠 Mind map", body: `**${docs.length} sources**\n` + docs.map((d) => `- **${d.title}**\n` + d.points.slice(0, 2).map((p) => `  - ${p}`).join("\n")).join("\n") };
    default:
      return { title: "Note", body: pts.join("\n") };
  }
}

export function notebookAnswer(q: string, docs: Doc[]): Reply {
  const ids = docs.map((d) => d.id);
  const sources = Array.from(new Set(docs.map((d) => d.source)));
  const found = searchDocs(q, sources, 3).filter((d) => ids.includes(d.id));
  if (!docs.length) return { thinking: ["Notebook has no sources"], text: "Add some sources to this notebook first — I only answer from the sources you add. 📎", citations: [] };
  if (!found.length)
    return { thinking: ["Searching only this notebook's sources", "No match in sources"], text: "I couldn't find that in this notebook's sources. NotebookLM stays **strictly grounded** in what you add — try adding a relevant source.", citations: [] };
  return {
    thinking: ["Searching only this notebook's sources", `Matched ${found.length} source(s)`],
    text: found.map((d, i) => `**${d.title}** [${i + 1}]\n` + d.points.map((p) => `- ${p}`).join("\n")).join("\n\n"),
    citations: found,
  };
}
