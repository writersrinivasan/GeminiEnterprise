export type Quiz = { q: string; options: string[]; answer: number; why: string };
export type Module = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  minutes: number;
  summary: string;
  sections: { h: string; body: string }[];
  tryIt: { label: string; href: string };
  quiz: Quiz[];
};

export const MODULES: Module[] = [
  {
    id: "what-is",
    title: "What is Gemini Enterprise?",
    emoji: "🌟",
    color: "#4285f4",
    minutes: 6,
    summary: "The big picture: one front door for AI at work — chat, search, agents and automation over your company data.",
    sections: [
      { h: "The one-sentence version", body: "Gemini Enterprise is Google Cloud's platform that gives every employee a single place to **chat with AI, search across company data, use ready-made agents, and build their own agents** — with the security and admin controls a company needs.\n\nIt grew out of the product previously called **Google Agentspace**, combined with Gemini models and Google's agent tooling." },
      { h: "The six building blocks", body: "- **Gemini models** — the 'brain' that understands and writes\n- **Workbench / chat** — the app employees use every day\n- **Connectors & data stores** — plug in Google Workspace, Microsoft 365, Jira, Salesforce, ServiceNow and more\n- **Prebuilt agents** — Deep Research, NotebookLM, Idea Generation, Data Insights and others\n- **Agent Designer** — a no-code builder to create your own agents & multi-step flows\n- **Governance** — admin console, identity, licenses, policies, auditing" },
      { h: "Why companies want it", body: "- Knowledge is scattered across 10+ tools; one search box finds it all\n- Answers are **grounded with citations** so people can verify them\n- **Permissions are respected** — you only see what you could already open\n- Agents can **take actions** (send email, file a ticket) with a human in the loop" },
      { h: "Editions (simplified)", body: "Google sells it in tiers (for example a Business edition for smaller teams and Enterprise Standard / Plus for large organizations). Higher tiers add more connectors, more agent capability and stronger compliance features. **Always check the official pricing page — tiers change.**" },
    ],
    tryIt: { label: "Open the workspace home", href: "/" },
    quiz: [
      { q: "Which product was Gemini Enterprise built from / rebranded from?", options: ["Google Bard", "Google Agentspace", "Google Assistant", "Google Duet"], answer: 1, why: "Agentspace's enterprise search + agents became part of Gemini Enterprise." },
      { q: "What makes an answer 'grounded'?", options: ["It is written in a formal tone", "It is based on and cites real source documents", "It is very short", "It uses web search only"], answer: 1, why: "Grounding ties the answer to sources, shown as citations." },
      { q: "If a document is restricted to HR, can a sales rep see it via Gemini Enterprise search?", options: ["Yes, AI sees everything", "Only if they ask politely", "No — source permissions (ACLs) are respected", "Only on weekends"], answer: 2, why: "Search and answers honour each source system's access controls." },
    ],
  },
  {
    id: "tour",
    title: "Tour of the workspace",
    emoji: "🧭",
    color: "#34a853",
    minutes: 5,
    summary: "Learn the layout: left navigation, the prompt box, sources, agents and history.",
    sections: [
      { h: "The layout", body: "- **Left rail:** New chat, your agents, prebuilt agents (gallery), NotebookLM, recent chats\n- **Center:** a big greeting and a prompt box — the 'front door'\n- **Prompt box extras:** attach files, choose sources/agents, toggle web grounding\n- **Right side panels:** citations and source previews open beside the answer" },
      { h: "What you'll do most", body: "1. Ask a question in natural language\n2. Read the answer and **click citations** to verify\n3. Ask follow-ups — the chat keeps context\n4. Switch to an **agent** for specialised jobs" },
      { h: "In this sandbox", body: "This sandbox imitates that layout with a fictional company, **Nimbus Outfitters**. Nothing is real: every doc, email and ticket is made up so you can practise safely. Labels and exact screens in the real product may differ — the *concepts* are what transfer." },
    ],
    tryIt: { label: "Ask your first question", href: "/chat" },
    quiz: [
      { q: "Where do you verify an AI answer?", options: ["By clicking its citations", "In the admin console", "You can't", "By asking twice"], answer: 0, why: "Citations open the source so you can check it." },
      { q: "What should you use for a specialised, repeatable job?", options: ["A new browser tab", "An agent", "A spreadsheet macro", "Email"], answer: 1, why: "Agents package instructions, tools and knowledge for a job." },
      { q: "Is the data in this sandbox real?", options: ["Yes", "Partly", "No, it's all fictional", "Only the emails"], answer: 2, why: "Nimbus Outfitters is a made-up company for practice." },
    ],
  },
  {
    id: "grounding",
    title: "Grounded chat & enterprise search",
    emoji: "🔎",
    color: "#ea4335",
    minutes: 7,
    summary: "How retrieval works: query → search data stores → read → answer with citations.",
    sections: [
      { h: "The RAG loop (retrieval-augmented generation)", body: "1. **Understand** your question\n2. **Retrieve** the most relevant chunks from connected data stores\n3. **Filter** by your permissions\n4. **Generate** an answer using those chunks\n5. **Cite** the sources\n\nIn the sandbox chat, expand **“Show thinking”** to watch these steps." },
      { h: "Writing good prompts", body: "- Be specific: names, projects, dates (“NIM-431”, “Q3 2026”)\n- Say the format you want: “as a table”, “3 bullets”, “draft an email”\n- Give the audience: “for the leadership QBR”\n- Iterate with follow-ups instead of one giant prompt" },
      { h: "When grounding finds nothing", body: "If nothing relevant is in your connected sources, you get a weaker answer. Fixes: connect the right source, use better keywords, or enable **web grounding** for public info." },
    ],
    tryIt: { label: "Practise grounded chat", href: "/chat" },
    quiz: [
      { q: "What does the 'R' in RAG stand for?", options: ["Random", "Retrieval", "Rendering", "Reasoning"], answer: 1, why: "Retrieval-Augmented Generation." },
      { q: "Which prompt is best?", options: ["sales?", "Tell me stuff", "Summarize Q3 2026 sales by region as 3 bullets for the QBR", "SALES NOW"], answer: 2, why: "Specific, has format and audience." },
      { q: "Grounding found nothing. What's a good fix?", options: ["Connect the source that holds the info", "Delete your chat history", "Use ALL CAPS", "Restart the laptop"], answer: 0, why: "The AI can only retrieve from connected data." },
    ],
  },
  {
    id: "connectors",
    title: "Connectors & data stores",
    emoji: "🔌",
    color: "#f9ab00",
    minutes: 6,
    summary: "How company data gets in: federated vs. ingested connectors, sync and access control.",
    sections: [
      { h: "Connector = bridge to an app", body: "A connector links Gemini Enterprise to a system such as Google Drive, Gmail, SharePoint, Jira, Confluence, Salesforce or ServiceNow. Admins usually set them up once for the whole organization." },
      { h: "Two styles", body: "- **Ingested (indexed):** content is copied into a Google-managed **data store** and indexed. Fast, rich search; needs periodic **sync**.\n- **Federated:** queries go live to the source's own search API. Always fresh, nothing copied, but depends on the source's search quality.\n\nIn the sandbox Connectors page you can choose either mode and watch a simulated sync." },
      { h: "Access control", body: "Connectors also bring over **ACLs** (who can see what). Identity must line up — Google identity or a third-party IdP via workforce identity federation — so the system knows *you* in Jira are the same *you* in Drive." },
    ],
    tryIt: { label: "Connect data sources", href: "/connectors" },
    quiz: [
      { q: "Which connector style copies data into an index?", options: ["Federated", "Ingested", "Manual", "Offline"], answer: 1, why: "Ingested connectors sync content into a data store." },
      { q: "What do connectors carry along with content?", options: ["Ads", "Access control lists (ACLs)", "Fonts", "Passwords"], answer: 1, why: "ACLs keep answers permission-aware." },
      { q: "Main benefit of federated search?", options: ["Data stays in the source & is always fresh", "Works offline", "Free forever", "No identity needed"], answer: 0, why: "Federated queries hit the live source." },
    ],
  },
  {
    id: "gallery",
    title: "Prebuilt agents: Deep Research, NotebookLM & more",
    emoji: "🧩",
    color: "#9b72cb",
    minutes: 8,
    summary: "Meet the ready-made agents and when to use each one.",
    sections: [
      { h: "Deep Research", body: "Give it a topic → it **proposes a research plan** you can edit → it searches internal and web sources for several minutes → writes a **long report with citations**. Great for market scans, competitive analysis, or briefing packs." },
      { h: "NotebookLM (Enterprise)", body: "Create a notebook, **add specific sources**, then chat *only* with those sources. Generate study guides, FAQs, briefing docs, mind maps and **Audio Overviews** (a podcast-style discussion). Perfect for training and onboarding." },
      { h: "Idea Generation", body: "Generates many ideas, has AI critics debate them tournament-style, then ranks the winners. Use it for brainstorming with structure." },
      { h: "Data Insights / data agents", body: "Ask questions of structured data (e.g. BigQuery tables) in plain English — it writes the query, runs it, and returns tables and charts." },
    ],
    tryIt: { label: "Open the agent gallery", href: "/agents" },
    quiz: [
      { q: "You need a 10-page cited market brief. Which agent?", options: ["Idea Generation", "Deep Research", "IT Help Desk", "Calendar"], answer: 1, why: "Deep Research plans, searches and writes long cited reports." },
      { q: "What is special about NotebookLM answers?", options: ["They use only the sources you add", "They are always in French", "They never cite", "They come from TV"], answer: 0, why: "Strict grounding to the notebook's sources." },
      { q: "What can Deep Research let you do before it starts?", options: ["Edit its research plan", "Pick a font", "Nothing", "Pay per word"], answer: 0, why: "You review and adjust the plan first." },
    ],
  },
  {
    id: "designer",
    title: "Agent Designer: build no-code agents",
    emoji: "🤖",
    color: "#d96570",
    minutes: 10,
    summary: "Create your own agent: instructions, knowledge, tools, testing and sharing.",
    sections: [
      { h: "Anatomy of an agent", body: "- **Name & description** — what people see in the gallery\n- **Instructions** — the system prompt: role, goal, tone, rules, format\n- **Knowledge** — which data stores it can search\n- **Tools / actions** — what it can *do* (send email, create a ticket, analyse data)\n- **Conversation starters** — example prompts for users" },
      { h: "Great instructions (the R-G-A-T-C-F checklist)", body: "- **R**ole: “You are the Nimbus HR onboarding buddy…”\n- **G**oal: “Help new hires through their first 30 days…”\n- **A**udience: “…for employees in their first month”\n- **T**one: “Friendly and concise”\n- **C**onstraints: “Never discuss salaries. Only use the onboarding guide.”\n- **F**ormat: “Answer in short bullet lists with a next step”\n\nThe sandbox designer scores your instructions live against this checklist." },
      { h: "Test → publish → share", body: "Always test in the preview pane with realistic questions — including ones the agent should *refuse*. Then publish it and share with a team. Admins can control who may create and share agents." },
      { h: "Actions need a human in the loop", body: "When an agent wants to send an email or create a ticket, the user sees a **confirmation card** before anything happens. Try it in the sandbox!" },
    ],
    tryIt: { label: "Build your first agent", href: "/agents/designer" },
    quiz: [
      { q: "Where do you tell an agent its role and rules?", options: ["Conversation starters", "Instructions", "Agent icon", "Admin audit log"], answer: 1, why: "Instructions are the agent's system prompt." },
      { q: "An agent should send emails. What must you add?", options: ["A Gmail send tool/action", "A longer name", "More emojis", "Nothing"], answer: 0, why: "Agents can only act through enabled tools." },
      { q: "Before an agent sends an email, what happens?", options: ["It sends silently", "User confirms an action card", "The admin is paged", "It prints it"], answer: 1, why: "Human-in-the-loop confirmation for actions." },
    ],
  },
  {
    id: "workflows",
    title: "Workflows & multi-step automation",
    emoji: "⚙️",
    color: "#00a1e0",
    minutes: 8,
    summary: "Chain triggers, AI steps and actions into automated flows with approvals.",
    sections: [
      { h: "Trigger → steps → actions", body: "A workflow starts with a **trigger** (manual, schedule, new email, new ticket), runs **AI steps** (search, summarize, classify) and **actions** (send email, create issue, post to chat). Agent Designer supports multi-step flows like this, and agents can also hand off to other agents." },
      { h: "Design patterns", body: "- **Digest:** schedule → search → summarize → email\n- **Triage:** new ticket → classify → if/else → route\n- **Escalation:** email → summarize → **human approval** → create ticket\n\nKeep a **human approval** step before high-impact actions." },
      { h: "Beyond no-code", body: "Developers build custom agents with the **Agent Development Kit (ADK)**, deploy them (e.g. on Vertex AI Agent Engine) and register them in Gemini Enterprise. Agents can talk to each other via the open **A2A (Agent2Agent)** protocol and use tools via **MCP**." },
    ],
    tryIt: { label: "Build a workflow", href: "/workflows" },
    quiz: [
      { q: "What starts a workflow?", options: ["A trigger", "A citation", "A license", "A font"], answer: 0, why: "Triggers kick off workflows." },
      { q: "Where should you put a human approval?", options: ["Before high-impact actions", "Nowhere", "At random", "Only at the start"], answer: 0, why: "Approve before sending/creating/changing things." },
      { q: "Which protocol lets agents talk to other agents?", options: ["FTP", "A2A", "SMTP", "HTTP/0.9"], answer: 1, why: "Agent2Agent (A2A) is the open agent interoperability protocol." },
    ],
  },
  {
    id: "admin",
    title: "Admin, security & governance",
    emoji: "🛡️",
    color: "#1fa463",
    minutes: 7,
    summary: "What admins configure: identity, licenses, connectors, policies, safety and audit.",
    sections: [
      { h: "Where admins work", body: "Admins configure Gemini Enterprise in the **Google Cloud console**: create the app, attach data stores, set up identity, assign **licenses** to users, and control which features and agents are available." },
      { h: "Key controls", body: "- **Identity:** Google accounts or third-party IdP (workforce identity federation)\n- **Licenses:** assign editions per user or group\n- **Feature policies:** web grounding, agent creation & sharing, actions\n- **Safety:** content filtering & prompt-injection protection (e.g. Model Armor)\n- **Data:** data residency choices, customer-managed encryption keys (on supported tiers)\n- **Audit & analytics:** who used what, adoption dashboards" },
      { h: "Responsible rollout", body: "Start with a pilot group, connect a few high-value sources, publish 2–3 curated agents, train users (like you!), measure adoption, then expand." },
    ],
    tryIt: { label: "Open the admin console", href: "/admin" },
    quiz: [
      { q: "Where is Gemini Enterprise administered?", options: ["Google Cloud console", "Gmail settings", "Chrome flags", "YouTube Studio"], answer: 0, why: "Configuration lives in Google Cloud console." },
      { q: "What protects against prompt injection & unsafe content?", options: ["Model Armor-style safety filters", "Dark mode", "Bigger fonts", "Licenses"], answer: 0, why: "Safety filters screen prompts and responses." },
      { q: "Best rollout approach?", options: ["Everyone, all features, day one", "Pilot → measure → expand", "Never roll out", "Only executives forever"], answer: 1, why: "Pilot first, then scale." },
    ],
  },
  {
    id: "prompting",
    title: "Prompting like a pro",
    emoji: "✍️",
    color: "#ff7a1a",
    minutes: 5,
    summary: "Practical prompt patterns for work: context, task, format, and iteration.",
    sections: [
      { h: "The C-T-F pattern", body: "- **Context:** who you are and what's going on\n- **Task:** exactly what you want\n- **Format:** table, bullets, email, length\n\n_Example:_ “I'm preparing the Nov 18 QBR (context). Summarize Q3 sales and the Q4 pipeline (task) as 5 bullets with numbers (format).”" },
      { h: "Power moves", body: "- “Cite your sources” / “Only use the attached docs”\n- “Ask me 3 clarifying questions first”\n- “Give me 3 options with pros and cons”\n- “Rewrite this for a non-technical audience”" },
      { h: "Always verify", body: "AI can be wrong. Click citations, check numbers, and own the final output." },
    ],
    tryIt: { label: "Try prompts in chat", href: "/chat" },
    quiz: [
      { q: "What does the 'F' in C-T-F stand for?", options: ["Fast", "Format", "Friendly", "Final"], answer: 1, why: "Context, Task, Format." },
      { q: "Best way to reduce wrong answers?", options: ["Ask it to cite sources and verify them", "Type faster", "Use emojis", "Never read the answer"], answer: 0, why: "Grounding + verification." },
      { q: "You want options. Good prompt?", options: ["Do it", "Give me 3 options with pros and cons", "Hmm", "Again"], answer: 1, why: "Asking for structured options gets better results." },
    ],
  },
];
