import type { Agent, Doc, SourceId } from "./types";

/* ------------------------------------------------------------------ */
/*  Fictional company used across the sandbox: "Nimbus Outfitters"    */
/*  (an outdoor-gear retailer). Every record below is made up.         */
/* ------------------------------------------------------------------ */

export const COMPANY = "Nimbus Outfitters";

export const SOURCES: Record<
  SourceId,
  { name: string; emoji: string; color: string; kind: string; desc: string; docs: number }
> = {
  drive: { name: "Google Drive", emoji: "📁", color: "#1a73e8", kind: "Google Workspace", desc: "Docs, Sheets, Slides and PDFs", docs: 1240 },
  gmail: { name: "Gmail", emoji: "✉️", color: "#ea4335", kind: "Google Workspace", desc: "Email threads and attachments", docs: 8930 },
  calendar: { name: "Google Calendar", emoji: "📅", color: "#f9ab00", kind: "Google Workspace", desc: "Meetings, agendas, attendees", docs: 612 },
  sharepoint: { name: "SharePoint", emoji: "🗂️", color: "#038387", kind: "Microsoft 365", desc: "Sites, document libraries", docs: 2104 },
  jira: { name: "Jira", emoji: "🐞", color: "#2684ff", kind: "Atlassian", desc: "Issues, epics, sprints", docs: 3377 },
  confluence: { name: "Confluence", emoji: "📘", color: "#6554c0", kind: "Atlassian", desc: "Wiki pages and spaces", docs: 980 },
  salesforce: { name: "Salesforce", emoji: "☁️", color: "#00a1e0", kind: "CRM", desc: "Accounts, opportunities, cases", docs: 4510 },
  servicenow: { name: "ServiceNow", emoji: "🛠️", color: "#1fa463", kind: "IT Service Mgmt", desc: "Incidents, requests, KB articles", docs: 1765 },
};

export const SOURCE_IDS = Object.keys(SOURCES) as SourceId[];

export const DOCS: Doc[] = [
  {
    id: "d1", source: "drive", title: "Q3 2026 Sales Performance Review", author: "Priya Raman (CFO office)", updated: "Oct 4, 2026", type: "Google Slides",
    snippet: "Q3 revenue reached $48.2M, up 12% year over year, driven by the trail-running category.",
    points: ["Q3 revenue was **$48.2M**, up **12% YoY**", "Trail-running footwear grew **31%** and is now the #1 category", "Online share of revenue climbed to **44%** (from 38%)", "The Pacific Northwest region missed target by 6% due to store remodels"],
    tags: ["sales", "revenue", "q3", "quarter", "performance", "numbers", "growth", "region"],
  },
  {
    id: "d2", source: "drive", title: "Holiday 2026 Campaign Plan – 'Gear Up for Winter'", author: "Marcus Lee (Marketing)", updated: "Oct 28, 2026", type: "Google Docs",
    snippet: "Campaign launches Nov 20 with a $2.1M budget split across social, search and in-store.",
    points: ["Launch date: **Nov 20**, runs through Jan 5", "Budget **$2.1M**: 45% social, 30% search, 25% in-store", "Hero products: the Summit insulated jacket and Ridge 40L pack", "Goal: **+18% holiday revenue** vs. last year"],
    tags: ["holiday", "campaign", "marketing", "launch", "budget", "winter", "plan"],
  },
  {
    id: "d3", source: "drive", title: "Employee Onboarding Guide 2026", author: "People Team", updated: "Aug 12, 2026", type: "Google Docs",
    snippet: "Everything new hires need in their first 30 days: accounts, buddies, training and benefits.",
    points: ["Day 1: laptop pickup, SSO setup and a welcome lunch with your buddy", "Week 1: complete Security Basics and Gemini Enterprise training", "Benefits enrollment must be finished within **30 days**", "Every new hire is paired with an onboarding buddy for 90 days"],
    tags: ["onboarding", "new hire", "hr", "benefits", "training", "first day", "employee"],
  },
  {
    id: "d4", source: "sharepoint", title: "Customer Return Policy v4", author: "Customer Experience", updated: "Sep 2, 2026", type: "SharePoint page",
    snippet: "Customers may return unused items within 60 days; members get 365 days.",
    points: ["Standard return window: **60 days** with receipt", "Nimbus+ members get a **365-day** window", "Worn footwear can be returned within 30 days if defective", "Refunds go back to the original payment method within 5–7 business days"],
    tags: ["return", "refund", "policy", "customer", "members", "exchange"],
  },
  {
    id: "d5", source: "sharepoint", title: "Brand Voice & Visual Guidelines", author: "Brand Studio", updated: "Jun 18, 2026", type: "PDF",
    snippet: "Our voice is adventurous, warm and practical. Primary colors: Glacier Blue and Ember Orange.",
    points: ["Voice: **adventurous, warm, practical** — never jargon-heavy", "Primary colors: Glacier Blue (#1E6FD9) and Ember Orange (#FF7A1A)", "Always show real people outdoors, never studio-only shots", "Taglines should be under 8 words"],
    tags: ["brand", "voice", "tone", "guidelines", "colors", "marketing", "design"],
  },
  {
    id: "d6", source: "jira", title: "NIM-431: Checkout fails for gift cards over $250", author: "Dana Ortiz (QA)", updated: "Nov 9, 2026", type: "Jira bug · P1",
    snippet: "Customers paying with gift cards over $250 receive a 500 error at the payment step.",
    points: ["Priority **P1**, status **In Progress**, assignee: Kenji Watanabe", "Affects ~**2.3%** of checkout sessions since Nov 7", "Root cause suspected in the payment-split service", "Fix targeted for the Nov 14 release"],
    tags: ["bug", "checkout", "gift card", "payment", "error", "ticket", "issue", "jira", "incident"],
  },
  {
    id: "d7", source: "jira", title: "NIM-417: Mobile app crashes on Android 15 store locator", author: "Kenji Watanabe", updated: "Nov 3, 2026", type: "Jira bug · P2",
    snippet: "The store locator screen crashes on Android 15 devices when location permission is denied.",
    points: ["Priority **P2**, status **To Do**", "Crash rate 4.1% on Android 15 sessions", "Workaround: grant location permission", "Planned for Sprint 46"],
    tags: ["bug", "mobile", "android", "crash", "app", "ticket", "issue", "jira"],
  },
  {
    id: "d8", source: "confluence", title: "Postmortem: Black Friday 2025 Site Slowdown", author: "SRE Team", updated: "Dec 10, 2025", type: "Confluence page",
    snippet: "Peak traffic was 9x normal; the product search service saturated for 47 minutes.",
    points: ["Peak traffic hit **9x** normal load", "Product search degraded for **47 minutes**", "Action items: autoscaling limits raised, cache warmed pre-event", "Load test for 12x traffic required before Black Friday 2026"],
    tags: ["postmortem", "incident", "black friday", "outage", "performance", "sre", "lessons"],
  },
  {
    id: "d9", source: "confluence", title: "API Design Guidelines", author: "Platform Engineering", updated: "Jul 1, 2026", type: "Confluence page",
    snippet: "All public APIs are REST + JSON, versioned in the path, with OAuth 2.0.",
    points: ["Use REST + JSON with versioning in the URL path (e.g. /v2/)", "Authentication via **OAuth 2.0** only", "Paginate list endpoints with page tokens", "Every endpoint needs an owner and an SLO"],
    tags: ["api", "engineering", "design", "guidelines", "rest", "standards"],
  },
  {
    id: "d10", source: "salesforce", title: "Opportunity: Alpine Lodge Group – Corporate Gifting", author: "Sofia Martins (Sales)", updated: "Nov 6, 2026", type: "Salesforce opportunity",
    snippet: "B2B deal for 4,000 branded jackets for Alpine Lodge Group staff and guests.",
    points: ["Deal size **$640K**, stage **Negotiation**", "Close date target: **Dec 1, 2026**", "Decision maker: Henrik Olsen (VP Operations)", "Open risk: delivery timeline for custom embroidery"],
    tags: ["deal", "opportunity", "sales", "customer", "account", "pipeline", "b2b", "alpine"],
  },
  {
    id: "d11", source: "salesforce", title: "Q4 Pipeline Snapshot", author: "Sales Ops", updated: "Nov 10, 2026", type: "Salesforce report",
    snippet: "Q4 pipeline totals $5.8M across 37 open opportunities.",
    points: ["Total Q4 pipeline: **$5.8M** across 37 opportunities", "Weighted forecast: **$3.1M**", "Top 3 deals make up 41% of pipeline", "Average sales cycle: 52 days"],
    tags: ["pipeline", "forecast", "sales", "q4", "deals", "numbers", "quarter"],
  },
  {
    id: "d12", source: "servicenow", title: "INC0019822: VPN outage – Denver office", author: "IT Service Desk", updated: "Nov 11, 2026", type: "ServiceNow incident",
    snippet: "Denver staff cannot connect to VPN since 8:10 AM; network team engaged.",
    points: ["Status: **In Progress**, impact: 85 users", "Started **8:10 AM**, suspected firewall certificate expiry", "Workaround: use the Zero-Trust browser portal", "Next update promised at 2:00 PM"],
    tags: ["vpn", "outage", "it", "incident", "network", "denver", "help"],
  },
  {
    id: "d13", source: "servicenow", title: "KB0042: How to request a new laptop", author: "IT Service Desk", updated: "Mar 3, 2026", type: "Knowledge article",
    snippet: "Submit a Hardware Request in the portal; standard delivery is 3 business days.",
    points: ["Open the IT portal → Hardware Request", "Manager approval is required for non-standard models", "Standard delivery: **3 business days**", "Return your old device within 14 days"],
    tags: ["laptop", "hardware", "it", "request", "device", "help"],
  },
  {
    id: "d14", source: "gmail", title: "Re: FY27 budget planning – please submit by Nov 21", author: "Priya Raman <cfo@nimbus.example>", updated: "Nov 10, 2026", type: "Email thread",
    snippet: "Team leads must submit FY27 budget requests in the planning sheet by Nov 21.",
    points: ["Deadline: **Nov 21** for all FY27 budget requests", "Headcount requests need a business case", "Travel budgets are capped at FY26 levels", "Questions go to the #fy27-planning channel"],
    tags: ["budget", "fy27", "planning", "finance", "deadline", "email", "cfo"],
  },
  {
    id: "d15", source: "gmail", title: "Supplier update: TrailTex fabric shipment delayed", author: "Ana Gomez <ana@trailtex.example>", updated: "Nov 8, 2026", type: "Email thread",
    snippet: "The Gore-style membrane fabric shipment will arrive 10 days late due to port congestion.",
    points: ["Shipment delayed by **10 days** (new ETA Nov 29)", "Affects production of the Summit insulated jacket", "Supplier offers 5% discount on the order", "Air freight option available at +$38K"],
    tags: ["supplier", "shipment", "delay", "supply chain", "vendor", "email", "jacket"],
  },
  {
    id: "d16", source: "calendar", title: "Quarterly Business Review – Leadership", author: "Executive Assistant", updated: "Nov 18, 2026 · 10:00 AM", type: "Calendar event",
    snippet: "QBR with leadership: Q3 results, holiday readiness, FY27 priorities.",
    points: ["When: **Nov 18, 10:00–12:00**, Boardroom + Meet", "Agenda: Q3 results, holiday readiness, FY27 priorities", "Pre-read: Q3 Sales Performance Review", "Attendees: 12 leaders"],
    tags: ["meeting", "qbr", "calendar", "leadership", "review", "agenda"],
  },
  {
    id: "d17", source: "calendar", title: "Holiday Launch Readiness Sync", author: "Marcus Lee", updated: "Nov 14, 2026 · 3:00 PM", type: "Calendar event",
    snippet: "Weekly sync to confirm campaign assets, inventory and site readiness.",
    points: ["When: **Nov 14, 3:00–3:30 PM**", "Owners: Marketing, E-commerce, Supply chain", "Open item: TrailTex delay impact on Summit jacket stock", "Decision needed: air freight yes/no"],
    tags: ["meeting", "launch", "holiday", "sync", "calendar", "readiness"],
  },
  {
    id: "d18", source: "drive", title: "Executive Compensation Plan FY27", author: "HR Leadership", updated: "Nov 1, 2026", type: "Google Sheets",
    snippet: "Restricted document – visible only to HR leadership.",
    points: ["(Restricted)"],
    tags: ["compensation", "salary", "executive", "hr", "bonus"],
    restricted: true,
  },
];

export const PROMPT_IDEAS = [
  { emoji: "📊", text: "Summarize our Q3 sales performance", color: "#4285f4" },
  { emoji: "🐞", text: "What P1 bugs are open right now?", color: "#ea4335" },
  { emoji: "🎄", text: "What's the plan for the holiday campaign?", color: "#34a853" },
  { emoji: "✉️", text: "Draft an email about the TrailTex shipment delay", color: "#9b72cb" },
  { emoji: "💼", text: "Status of the Alpine Lodge deal?", color: "#00a1e0" },
  { emoji: "🔁", text: "What's our return policy for members?", color: "#f9ab00" },
];

export const TOOLS: { id: string; name: string; emoji: string; desc: string; color: string }[] = [
  { id: "search", name: "Company search", emoji: "🔎", desc: "Ground answers in connected data stores", color: "#4285f4" },
  { id: "web_search", name: "Web grounding", emoji: "🌐", desc: "Pull fresh public info from the web", color: "#34a853" },
  { id: "gmail_send", name: "Gmail: send email", emoji: "✉️", desc: "Draft and send emails (needs confirm)", color: "#ea4335" },
  { id: "calendar_create", name: "Calendar: create event", emoji: "📅", desc: "Schedule meetings", color: "#f9ab00" },
  { id: "jira_create", name: "Jira: create issue", emoji: "🐞", desc: "File tickets in a project", color: "#2684ff" },
  { id: "data_analysis", name: "Data analysis", emoji: "📈", desc: "Run calculations & build tables", color: "#9b72cb" },
  { id: "image_gen", name: "Image generation", emoji: "🎨", desc: "Create visuals from a prompt", color: "#d96570" },
];

export const BUILTIN_AGENTS: Agent[] = [
  {
    id: "builtin-idea", name: "Idea Generation", emoji: "💡", color: "#f9ab00", builtin: true,
    description: "Brainstorms, scores and ranks ideas using a tournament-style evaluation.",
    instructions: "You generate many ideas, critique them, then rank the top ones with pros and cons.",
    tools: ["search", "web_search"], sources: [], starters: ["Ideas to boost holiday online sales", "Ways to reduce product returns", "New loyalty perks for Nimbus+ members"], published: true, createdAt: 0,
  },
  {
    id: "builtin-data", name: "Data Insights", emoji: "📈", color: "#9b72cb", builtin: true,
    description: "Asks questions of structured data and returns tables and trends.",
    instructions: "You answer with numbers, tables and a one-line takeaway.",
    tools: ["search", "data_analysis"], sources: ["drive", "salesforce"], starters: ["Break down Q3 revenue", "How healthy is our Q4 pipeline?", "Compare online vs store share"], published: true, createdAt: 0,
  },
  {
    id: "builtin-helpdesk", name: "IT Help Desk", emoji: "🛠️", color: "#1fa463", builtin: true,
    description: "Answers IT questions from ServiceNow and can open tickets.",
    instructions: "You are a friendly IT help desk agent. Be concise. Offer to open a ticket when you cannot solve the issue.",
    tools: ["search", "jira_create"], sources: ["servicenow", "confluence"], starters: ["Is the VPN down?", "How do I request a new laptop?", "Open a ticket for my broken monitor"], published: true, createdAt: 0,
  },
];

export const PEOPLE = [
  { id: "u1", name: "Priya Raman", email: "priya@nimbus.example", dept: "Finance", emoji: "👩🏽‍💼" },
  { id: "u2", name: "Marcus Lee", email: "marcus@nimbus.example", dept: "Marketing", emoji: "👨🏻‍🎨" },
  { id: "u3", name: "Kenji Watanabe", email: "kenji@nimbus.example", dept: "Engineering", emoji: "👨🏻‍💻" },
  { id: "u4", name: "Sofia Martins", email: "sofia@nimbus.example", dept: "Sales", emoji: "👩🏻‍💼" },
  { id: "u5", name: "Dana Ortiz", email: "dana@nimbus.example", dept: "Quality", emoji: "🧑🏽‍🔬" },
  { id: "u6", name: "Amara Okafor", email: "amara@nimbus.example", dept: "People", emoji: "👩🏿‍🏫" },
  { id: "u7", name: "Leo Fischer", email: "leo@nimbus.example", dept: "Supply Chain", emoji: "👨🏼‍🔧" },
  { id: "u8", name: "Ravi Kumar", email: "ravi@nimbus.example", dept: "IT", emoji: "🧑🏾‍💻" },
];

export const LICENSE_TIERS = [
  { id: "none", name: "No license", color: "#9ca3af" },
  { id: "business", name: "Business", color: "#34a853" },
  { id: "standard", name: "Enterprise Standard", color: "#4285f4" },
  { id: "plus", name: "Enterprise Plus", color: "#9b72cb" },
];
