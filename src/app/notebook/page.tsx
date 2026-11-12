"use client";
import { useState } from "react";
import { ArrowLeft, Pause, Play, Plus, Trash2 } from "lucide-react";
import ChatView from "@/components/ChatView";
import RichText from "@/components/RichText";
import { Modal, PageHeader, TipBox } from "@/components/ui";
import { DOCS, SOURCES } from "@/lib/data";
import { notebookAnswer, notebookGenerate, uid } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { Notebook } from "@/lib/types";

const NB_EMOJI = ["📓", "📗", "📘", "📙", "🧠", "🎒", "🗺️", "🧪"];
const STUDIO = [
  { kind: "audio", label: "Audio overview", emoji: "🎧", color: "#d96570" },
  { kind: "study", label: "Study guide", emoji: "📚", color: "#4285f4" },
  { kind: "faq", label: "FAQ", emoji: "❓", color: "#f9ab00" },
  { kind: "briefing", label: "Briefing doc", emoji: "📝", color: "#34a853" },
  { kind: "mindmap", label: "Mind map", emoji: "🧠", color: "#9b72cb" },
];

export default function NotebookPage() {
  const { state, update, track, toast } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [viewNote, setViewNote] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const nb = state.notebooks.find((n) => n.id === openId) ?? null;
  const visibleDocs = DOCS.filter((d) => !d.restricted);

  const saveNb = (n: Notebook) => update((s) => ({ ...s, notebooks: s.notebooks.map((x) => (x.id === n.id ? n : x)) }));

  const create = () => {
    const n: Notebook = { id: uid(), title: `Untitled notebook ${state.notebooks.length + 1}`, emoji: NB_EMOJI[state.notebooks.length % NB_EMOJI.length], sources: [], notes: [], createdAt: Date.now() };
    update((s) => ({ ...s, notebooks: [...s.notebooks, n] }));
    setOpenId(n.id);
    setAdding(true);
    track("notebook_created", 15, "Created a notebook");
  };

  const generate = (kind: string) => {
    if (!nb) return;
    const docs = DOCS.filter((d) => nb.sources.includes(d.id));
    if (!docs.length) return toast("Add sources first", "📎");
    const g = notebookGenerate(kind, docs);
    const note = { id: uid(), title: g.title, body: g.body, kind, at: Date.now() };
    saveNb({ ...nb, notes: [note, ...nb.notes] });
    setViewNote(note.id);
    track(kind === "audio" ? "nb_audio" : "nb_generated", kind === "audio" ? 20 : 10, `Generated ${g.title.replace(/^\S+ /, "")}`);
  };

  if (!nb) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
        <PageHeader emoji="📓" title="NotebookLM" subtitle="Your AI research & study partner — grounded strictly in the sources you add. Great for learning and onboarding." color="#34a853"
          right={<button onClick={create} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-green-700 shadow"><Plus size={16} /> New notebook</button>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={create} className="flex min-h-40 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-300 bg-green-50/50 text-green-700 transition hover:bg-green-50">
            <Plus size={28} /><span className="mt-2 font-semibold">Create new</span>
          </button>
          {state.notebooks.map((n, i) => (
            <button key={n.id} onClick={() => setOpenId(n.id)} className="flex min-h-40 flex-col rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg" style={{ background: ["#e8f0fe", "#fce8e6", "#fef7e0", "#e6f4ea", "#f3e8fd"][i % 5] }}>
              <span className="text-3xl">{n.emoji}</span>
              <p className="mt-3 font-bold text-gray-900">{n.title}</p>
              <p className="mt-auto text-xs text-gray-500">{n.sources.length} sources · {n.notes.length} notes</p>
            </button>
          ))}
        </div>
        <TipBox title="Why NotebookLM is great for training">
          Add your training materials as sources, then generate a <b>study guide</b>, quiz yourself, or listen to an <b>audio overview</b> on your commute. Answers never wander outside your sources.
        </TipBox>
      </div>
    );
  }

  const docs = DOCS.filter((d) => nb.sources.includes(d.id));
  const note = nb.notes.find((x) => x.id === viewNote);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white/70 px-4 py-3 backdrop-blur">
        <button onClick={() => setOpenId(null)} className="rounded-full p-1.5 hover:bg-gray-100"><ArrowLeft size={18} /></button>
        <span className="text-2xl">{nb.emoji}</span>
        <input value={nb.title} onChange={(e) => saveNb({ ...nb, title: e.target.value })} className="flex-1 bg-transparent text-lg font-bold outline-none" />
        <button onClick={() => { update((s) => ({ ...s, notebooks: s.notebooks.filter((x) => x.id !== nb.id) })); setOpenId(null); }} className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[260px_1fr_300px] lg:overflow-hidden">
        {/* Sources */}
        <div className="flex min-h-0 flex-col rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">Sources</p>
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"><Plus size={12} /> Add</button>
          </div>
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
            {docs.length === 0 && <p className="text-sm text-gray-400">No sources yet. Add 3+ to unlock the best results.</p>}
            {docs.map((d) => (
              <div key={d.id} className="flex items-start gap-2 rounded-xl bg-gray-50 p-2 text-xs">
                <span>{SOURCES[d.source].emoji}</span>
                <span className="flex-1 text-gray-700">{d.title}</span>
                <button onClick={() => saveNb({ ...nb, sources: nb.sources.filter((x) => x !== d.id) })} className="text-gray-300 hover:text-red-500">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex min-h-[480px] flex-col overflow-hidden rounded-3xl bg-white shadow-sm lg:min-h-0">
          <ChatView
            key={nb.id + nb.sources.length}
            compact
            responder={(q) => notebookAnswer(q, docs)}
            onSent={() => track("nb_chat", 10, "Asked your notebook")}
            starters={docs.slice(0, 3).map((d) => ({ text: `What are the key points of ${d.title.split(":")[0].split("–")[0].trim()}?`, emoji: SOURCES[d.source].emoji, color: SOURCES[d.source].color }))}
            placeholder={docs.length ? `Ask about your ${docs.length} sources…` : "Add sources to start chatting"}
            accent="#34a853"
            empty={<div className="text-center"><div className="text-5xl animate-float">{nb.emoji}</div><p className="mt-2 font-semibold text-gray-800">{docs.length} sources</p><p className="text-sm text-gray-500">Answers come only from these sources</p></div>}
          />
        </div>

        {/* Studio */}
        <div className="flex min-h-0 flex-col rounded-3xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-gray-800">Studio</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {STUDIO.map((s) => (
              <button key={s.kind} onClick={() => generate(s.kind)} className={`rounded-2xl p-3 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow ${s.kind === "audio" ? "col-span-2" : ""}`} style={{ background: s.color + "18", color: s.color }}>
                <span className="text-xl">{s.emoji}</span><br />{s.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Notes</p>
          <div className="mt-2 flex-1 space-y-1.5 overflow-y-auto">
            {nb.notes.map((n) => (
              <button key={n.id} onClick={() => setViewNote(n.id)} className="block w-full truncate rounded-xl bg-gray-50 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100">{n.title}</button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add sources" width="max-w-2xl">
        <p className="mb-3 text-sm text-gray-500">Pick documents from your company data (only items you have access to are listed).</p>
        <div className="grid max-h-[55vh] gap-2 overflow-y-auto sm:grid-cols-2">
          {visibleDocs.map((d) => {
            const on = nb.sources.includes(d.id);
            return (
              <button key={d.id} onClick={() => { saveNb({ ...nb, sources: on ? nb.sources.filter((x) => x !== d.id) : [...nb.sources, d.id] }); if (!on) track("notebook_source_added", 3); }} className={`flex items-start gap-2 rounded-2xl border-2 p-3 text-left text-sm ${on ? "border-green-400 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                <span className="text-lg">{SOURCES[d.source].emoji}</span>
                <span className="flex-1"><span className="font-medium text-gray-800">{d.title}</span><br /><span className="text-xs text-gray-400">{SOURCES[d.source].name}</span></span>
                {on && <span className="text-green-600">✓</span>}
              </button>
            );
          })}
        </div>
        <button onClick={() => setAdding(false)} className="gem-bg mt-4 w-full rounded-full py-2.5 text-sm font-semibold text-white">Done ({nb.sources.length} selected)</button>
      </Modal>

      <Modal open={!!note} onClose={() => { setViewNote(null); setPlaying(false); }} title={note?.title ?? ""} width="max-w-2xl">
        {note?.kind === "audio" && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-4">
            <button onClick={() => { setPlaying((p) => !p); if (!playing) toast("Audio is simulated — read the transcript below", "🎧"); }} className="gem-bg flex h-12 w-12 items-center justify-center rounded-full text-white">{playing ? <Pause size={20} /> : <Play size={20} />}</button>
            <div className="flex flex-1 items-end gap-0.5">
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className="w-1.5 rounded-full bg-purple-400" style={{ height: 6 + ((i * 37) % 28), opacity: playing ? 1 : 0.4, animation: playing ? `float ${0.6 + (i % 5) * 0.15}s ease-in-out infinite` : "none" }} />
              ))}
            </div>
            <span className="text-xs text-gray-500">~6 min</span>
          </div>
        )}
        {note && <RichText text={note.body} />}
      </Modal>
    </div>
  );
}
