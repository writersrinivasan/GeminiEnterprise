"use client";
import { useRef, useState } from "react";
import { Plus, Telescope, X } from "lucide-react";
import DocPanel from "@/components/DocPanel";
import RichText from "@/components/RichText";
import { Card, PageHeader, Progress, Sparkle, TipBox } from "@/components/ui";
import { SOURCES } from "@/lib/data";
import { researchPlan, researchReport, sleep, uid } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { Doc } from "@/lib/types";

const TOPICS = ["Holiday 2026 readiness", "Supply chain risks for Q4", "How to grow trail-running sales", "Reducing product returns"];

export default function ResearchPage() {
  const { state, update, track, toast } = useStore();
  const [topic, setTopic] = useState("");
  const [plan, setPlan] = useState<string[] | null>(null);
  const [phase, setPhase] = useState<"idle" | "plan" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [activity, setActivity] = useState<string[]>([]);
  const [report, setReport] = useState<{ text: string; docs: Doc[] } | null>(null);
  const [openDoc, setOpenDoc] = useState<Doc | null>(null);
  const edited = useRef(false);

  const makePlan = (t = topic) => {
    if (!t.trim()) return;
    setTopic(t);
    setPlan(researchPlan(t));
    setPhase("plan");
    edited.current = false;
  };

  const start = async () => {
    if (!plan) return;
    setPhase("running");
    setActivity([]);
    setProgress(0);
    const rep = researchReport(topic);
    const feed = [
      ...plan.map((p) => `🧭 ${p}`),
      ...rep.docs.map((d) => `📄 Reading “${d.title}” (${SOURCES[d.source].name})`),
      "🌐 Browsing 14 web pages (simulated)",
      "⚖️ Cross-checking numbers between sources",
      "✍️ Drafting report sections",
    ];
    for (let i = 0; i < feed.length; i++) {
      setActivity((a) => [...a, feed[i]]);
      setProgress(((i + 1) / feed.length) * 100);
      await sleep(550);
    }
    setReport(rep);
    setPhase("done");
    track("research_run", 30, "Ran Deep Research");
  };

  const saveToNotebook = () => {
    if (!report) return;
    const nb = { id: uid(), title: `Research: ${topic}`, emoji: "🔬", sources: report.docs.map((d) => d.id), notes: [{ id: uid(), title: "🔬 Deep Research report", body: report.text, kind: "research", at: Date.now() }], createdAt: Date.now() };
    update((s) => ({ ...s, notebooks: [...s.notebooks, nb] }));
    track("research_saved", 15, "Saved research to NotebookLM");
    toast("Saved to NotebookLM", "📓");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji="🔬" title="Deep Research" subtitle="Give a topic → review & edit the plan → let the agent research internal and web sources → get a long, cited report." color="#00a1e0" />

      {(phase === "idle" || phase === "plan") && (
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); makePlan(); }} className="gem-border flex items-center gap-2 rounded-full bg-white py-1.5 pl-5 pr-1.5">
            <Telescope size={18} className="text-sky-500" />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What should I research?" className="flex-1 bg-transparent py-2 outline-none" />
            <button className="gem-bg rounded-full px-5 py-2 text-sm font-semibold text-white">Create plan</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => <button key={t} onClick={() => makePlan(t)} className="rounded-full bg-sky-50 px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-100">🔎 {t}</button>)}
          </div>
        </Card>
      )}

      {phase === "plan" && plan && (
        <Card className="animate-pop">
          <div className="flex items-center gap-2">
            <Sparkle size={22} />
            <h2 className="font-bold text-gray-900">Research plan for “{topic}”</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">✏️ Edit, add or remove steps — you're in control before the agent starts.</p>
          <div className="mt-4 space-y-2">
            {plan.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">{i + 1}</span>
                <input value={p} onChange={(e) => { const n = [...plan]; n[i] = e.target.value; setPlan(n); if (!edited.current) { edited.current = true; track("plan_edited", 10, "Edited a research plan"); } }} className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200" />
                <button onClick={() => setPlan(plan.filter((_, j) => j !== i))} className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => { setPlan([...plan, "New step: "]); if (!edited.current) { edited.current = true; track("plan_edited", 10, "Edited a research plan"); } }} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-50"><Plus size={14} /> Add step</button>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={start} className="gem-bg rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow">🚀 Start research</button>
            <button onClick={() => setPhase("idle")} className="rounded-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Cancel</button>
          </div>
        </Card>
      )}

      {phase === "running" && (
        <Card className="animate-pop">
          <div className="flex items-center gap-3">
            <Sparkle size={30} spinning />
            <div className="flex-1">
              <p className="font-semibold"><span className="shimmer">Researching “{topic}”…</span></p>
              <div className="mt-2"><Progress pct={progress} color="#00a1e0" /></div>
            </div>
          </div>
          <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            {activity.map((a, i) => <p key={i} className="animate-pop">{a}</p>)}
          </div>
          <p className="mt-2 text-xs text-gray-400">The real agent can run for several minutes and read hundreds of sources — sped up here.</p>
        </Card>
      )}

      {phase === "done" && report && (
        <Card className="animate-pop">
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={saveToNotebook} className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow">📓 Save to NotebookLM</button>
            <button onClick={() => toast("Exported to Google Docs (simulated)", "📄")} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">📄 Export to Docs</button>
            <button onClick={() => { setPhase("idle"); setReport(null); setTopic(""); }} className="rounded-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">New research</button>
          </div>
          <RichText text={report.text} onCite={(i) => { const d = report.docs[i]; if (d) { setOpenDoc(d); track("citation_opened", 10, "Verified a source"); } }} />
        </Card>
      )}

      <TipBox title="When to use Deep Research vs. chat">
        Use <b>chat</b> for quick answers. Use <b>Deep Research</b> when you need breadth — many sources, comparisons, a structured report you'd otherwise spend hours writing. Always review the plan; a better plan = a better report.
      </TipBox>
      <DocPanel doc={openDoc} onClose={() => setOpenDoc(null)} />
      {state.notebooks.length > 0 && <p className="text-center text-xs text-gray-400">{state.notebooks.length} notebook(s) in NotebookLM</p>}
    </div>
  );
}
