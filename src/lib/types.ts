export type SourceId =
  | "drive"
  | "gmail"
  | "calendar"
  | "sharepoint"
  | "jira"
  | "confluence"
  | "salesforce"
  | "servicenow";

export type Doc = {
  id: string;
  source: SourceId;
  title: string;
  author: string;
  updated: string;
  type: string;
  snippet: string;
  points: string[];
  tags: string[];
  restricted?: boolean;
};

export type Agent = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  instructions: string;
  tools: string[];
  sources: SourceId[];
  starters: string[];
  published: boolean;
  createdAt: number;
  builtin?: boolean;
};

export type WfStep = { id: string; kind: string; config: Record<string, string> };

export type Workflow = {
  id: string;
  name: string;
  trigger: string;
  steps: WfStep[];
  runs: number;
  createdAt: number;
  active: boolean;
};

export type NoteItem = { id: string; title: string; body: string; kind: string; at: number };

export type Notebook = {
  id: string;
  title: string;
  emoji: string;
  sources: string[];
  notes: NoteItem[];
  createdAt: number;
};

export type AuditEntry = { t: number; event: string; detail: string };

export type ConnectorInfo = { mode: "federated" | "ingested"; docs: number; at: number };

export type State = {
  name: string;
  xp: number;
  events: Record<string, number>;
  lessonsDone: string[];
  quizScores: Record<string, number>;
  connectors: Partial<Record<SourceId, ConnectorInfo>>;
  agents: Agent[];
  workflows: Workflow[];
  notebooks: Notebook[];
  audit: AuditEntry[];
  celebrated: string[];
  licenses: Record<string, string>;
  policies: Record<string, boolean | string>;
  streakDays: string[];
};

export type Action = { tool: string; title: string; detail: string };

export type Reply = {
  thinking: string[];
  text: string;
  citations: Doc[];
  followups?: string[];
  action?: Action;
};
