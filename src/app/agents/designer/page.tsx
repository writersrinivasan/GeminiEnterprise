"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Rocket, Save } from "lucide-react";
import ChatView from "@/components/ChatView";
import { Progress, TipBox } from "@/components/ui";
import { SOURCES, SOURCE_IDS, TOOLS } from "@/lib/data";
import { agentAnswer, instructionScore, uid } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { Agent, SourceId } from "@/lib/types";

const EMOJIS = ["🤖", "🧑‍🏫", "💼", "🛠️", "🎨", "📊", "🧭", "🦉", "🚀", "🐙", "🌈", "🏔️"];
const COLORS = ["#4285f4", "#d96570", "#9b72cb", "#34a853", "#f9ab00", "#00a1e0", "#ff7a1a", "#ea4335"];

const TEMPLATES: Partial<Agent>[] = [
  {
    name: "Onboarding Buddy", emoji: "🧑‍🏫", color: "#34a853", description: "Helps new hires through their first 30 days.",
    instructions: "You are the Nimbus Outfitters onboarding buddy. Your goal is to help new hire employees through their first 30 days. Use a friendly, warm tone. Only answer from the onboarding guide and HR policies; never discuss individual salaries. Format answers as short bullet lists and end with one suggested next step.",
    tools: ["search", "calendar_create"], sources: ["drive", "sharepoint"], starters: ["What do I do on day 1?", "When must I finish benefits enrollment?", "Schedule a coffee with my buddy"],
  },
  {
    name: "Deal Coach", emoji: "💼", color: "#00a1e0", description: "Preps sales reps for customer calls.",
    instructions: "You are a sales deal coach for the sales team. Help reps prepare for customer meetings by summarizing the opportunity, risks and next steps. Be concise and professional. Always cite Salesforce records. Format: sections for Summary, Risks, Next steps.",
    tools: ["search", "gmail_send", "data_analysis"], sources: ["salesforce", "gmail", "calendar"], starters: ["Prep me for the Alpine Lodge call", "How healthy is our Q4 pipeline?", "Send a follow-up email to Henrik"],
  },
  {
    name: "Bug Triage Bot", emoji: "🐞", color: "#ea4335", description: "Summarizes bugs and files new Jira issues.",
    instructions: "You are a QA triage assistant for engineers. Summarize open bugs by priority and help file new issues. Be brief. Never guess a root cause that is not in the ticket. Format as a bullet list sorted by priority.",
    tools: ["search", "jira_create"], sources: ["jira", "confluence"], starters: ["What P1 bugs are open right now?", "File a bug: search results empty on iPad", "Summarize the Black Friday postmortem"],
  },
];

const blank = (): Agent => ({ id: "", name: "", emoji: "🤖", color: "#4285f4", description: "", instructions: "", tools: ["search"], sources: [], starters: [], published: false, createdAt: Date.now() });

function Section({ n, title, children, sub }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="gem-bg flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">{n}</span>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function DesignerInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { state, update, track, toast, celebrate } = useStore();
  const [a, setA] = useState<Agent>(blank());
  const [starterText, setStarterText] = useState("");
  const [testKey, setTestKey] = useState(0);
  const connected = Object.keys(state.connectors) as SourceId[];
  const { score, checks } = instructionScore(a.instructions);

  useEffect(() => {
    const id = sp.get("id");
    const found = state.agents.find((x) => x.id === id);
    if (found) {
      setA(found);
      setStarterText(found.starters.join("\n"));
    }
  }, [sp.get("id")]);

  const set = <K extends keyof Agent>(k: K, v: Agent[K]) => setA((x) => ({ ...x, [k]: v }));
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const save = (publish = false) => {
    if (!a.name.trim()) return toast("Give your agent a name first", "✏️");
    if (!a.instructions.trim()) return toast("Add some instructions first", "📝");
    const isNew = !a.id;
    const final: Agent = { ...a, id: a.id || uid(), starters: starterText.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 4), published: publish || a.published };
    update((s) => ({ ...s, agents: isNew ? [...s.agents, final] : s.agents.map((x) => (x.id === final.id ? final : x)) }));
    setA(final);
    if (isNew) track("agent_created", 30, "Created an agent");
    if (score >= 80) track("instructions_80", 20, "Strong instructions");
    if (publish) {
      track("agent_published", 30, "Published an agent");
      celebrate();
      toast(`${final.name} is live in the gallery!`, "🚀");
    } else toast("Agent saved", "💾");
    if (isNew) router.replace(`/agents/designer?id=${final.id}`);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Config */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={16} /> Gallery</Link>
            <div className="flex gap-2">
              <button onClick={() => save(false)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"><Save size={15} /> Save draft</button>
              <button onClick={() => save(true)} className="gem-bg inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow"><Rocket size={15} /> {a.published ? "Update" : "Publish"}</button>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold"><span className="gem-text">Agent Designer</span></h1>
            <p className="text-sm text-gray-500">Build a no-code agent. Test it live on the right →</p>
          </div>

          {!a.id && (
            <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4">
              <p className="text-sm font-semibold text-gray-700">⚡ Start from a template</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.name} onClick={() => { setA({ ...blank(), ...t } as Agent); setStarterText((t.starters ?? []).join("\n")); setTestKey((k) => k + 1); track("template_used", 5); }} className="rounded-full bg-white px-3 py-1.5 text-sm shadow-sm hover:shadow">
                    {t.emoji} {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Section n={1} title="Identity" sub="How your agent appears in the gallery">
            <div className="flex gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: a.color + "33" }}>{a.emoji}</div>
              <div className="flex-1 space-y-2">
                <input value={a.name} onChange={(e) => set("name", e.target.value)} placeholder="Agent name, e.g. Onboarding Buddy" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200" />
                <input value={a.description} onChange={(e) => set("description", e.target.value)} placeholder="One-line description" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => <button key={e} onClick={() => set("emoji", e)} className={`h-9 w-9 rounded-xl text-lg ${a.emoji === e ? "bg-purple-100 ring-2 ring-purple-400" : "hover:bg-gray-100"}`}>{e}</button>)}
            </div>
            <div className="mt-2 flex gap-2">
              {COLORS.map((c) => <button key={c} onClick={() => set("color", c)} className={`h-7 w-7 rounded-full ${a.color === c ? "ring-2 ring-offset-2" : ""}`} style={{ background: c, ["--tw-ring-color" as string]: c }} />)}
            </div>
          </Section>

          <Section n={2} title="Instructions" sub="The system prompt: who the agent is and how it behaves">
            <textarea value={a.instructions} onChange={(e) => set("instructions", e.target.value)} rows={6} placeholder="You are… Your goal is to help… for [audience]. Use a [tone] tone. Never… Format answers as…" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200" />
            <div className="mt-3 rounded-2xl bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Instruction quality</span>
                <span className={`font-bold ${score >= 80 ? "text-green-600" : score >= 50 ? "text-orange-500" : "text-red-500"}`}>{score}% {score >= 80 ? "🌟" : ""}</span>
              </div>
              <div className="mt-2"><Progress pct={score} color={score >= 80 ? "#34a853" : "#f9ab00"} /></div>
              <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {checks.map((c) => <p key={c.id} className={`text-xs ${c.ok ? "text-green-700" : "text-gray-400"}`}>{c.ok ? "✅" : "⬜"} {c.label}</p>)}
              </div>
            </div>
          </Section>

          <Section n={3} title="Knowledge" sub="Which data stores the agent may search (none selected = all connected)">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SOURCE_IDS.map((s) => {
                const on = a.sources.includes(s);
                const isConn = connected.includes(s);
                return (
                  <button key={s} onClick={() => set("sources", toggle(a.sources, s))} className={`relative rounded-2xl border-2 p-3 text-left text-xs transition ${on ? "shadow-md" : "border-gray-100 hover:border-gray-200"}`} style={on ? { borderColor: SOURCES[s].color, background: SOURCES[s].color + "12" } : {}}>
                    <div className="text-xl">{SOURCES[s].emoji}</div>
                    <div className="mt-1 font-semibold text-gray-800">{SOURCES[s].name}</div>
                    {!isConn && <div className="text-[10px] text-orange-500">not connected</div>}
                  </button>
                );
              })}
            </div>
            {a.sources.some((s) => !connected.includes(s)) && <p className="mt-2 text-xs text-orange-600">⚠️ Some selected sources aren't connected — the agent can't search them until you <Link href="/connectors" className="underline">connect them</Link>.</p>}
          </Section>

          <Section n={4} title="Tools & actions" sub="What the agent can do beyond answering">
            <div className="space-y-2">
              {TOOLS.map((t) => {
                const on = a.tools.includes(t.id);
                return (
                  <label key={t.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${on ? "border-transparent shadow-sm" : "border-gray-100"}`} style={on ? { background: t.color + "14" } : {}}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: t.color + "22" }}>{t.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.desc}</p>
                    </div>
                    <input type="checkbox" checked={on} onChange={() => set("tools", toggle(a.tools, t.id))} className="h-5 w-5 accent-purple-600" />
                  </label>
                );
              })}
            </div>
          </Section>

          <Section n={5} title="Conversation starters" sub="One per line — shown to users as quick prompts">
            <textarea value={starterText} onChange={(e) => { setStarterText(e.target.value); set("starters", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 4)); }} rows={3} placeholder={"What do I do on day 1?\nSchedule a meeting with my buddy"} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </Section>

          <TipBox title="Test like a pro">
            Try a normal question, a question that needs a <b>tool</b> (e.g. “open a ticket…”), and one it should <b>refuse</b>. Toggle tools on/off and watch the behaviour change.
          </TipBox>
        </div>
      </div>

      {/* Preview */}
      <div className="flex h-[70vh] w-full shrink-0 flex-col border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/50 lg:h-full lg:w-[420px] lg:border-l lg:border-t-0">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: a.color + "33" }}>{a.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{a.name || "Untitled agent"} <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">PREVIEW</span></p>
            <p className="text-[11px] text-gray-400">{a.tools.length} tools · {a.sources.length || "all"} sources</p>
          </div>
          <button onClick={() => setTestKey((k) => k + 1)} title="Reset test chat" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"><RotateCcw size={15} /></button>
        </div>
        <div className="min-h-0 flex-1">
          <ChatView
            key={testKey}
            compact
            responder={(q) => agentAnswer(q, a, connected)}
            onSent={() => track("agent_tested", 15, "Tested an agent")}
            starters={a.starters.map((t) => ({ text: t, emoji: a.emoji, color: a.color }))}
            placeholder="Test your agent…"
            accent={a.color}
            empty={<div className="text-center"><div className="text-5xl animate-float">{a.emoji}</div><p className="mt-2 text-sm text-gray-500">Ask your agent something to test it</p></div>}
          />
        </div>
      </div>
    </div>
  );
}

export default function DesignerPage() {
  return (
    <Suspense>
      <DesignerInner />
    </Suspense>
  );
}
