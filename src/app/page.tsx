"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useStore, levelFor } from "@/lib/store";
import { PROMPT_IDEAS, COMPANY } from "@/lib/data";
import { LABS, labProgress, nextTask } from "@/lib/labs";
import { MODULES } from "@/lib/learn";
import { Card, Modal, Progress, Ring, Sparkle } from "@/components/ui";

const TILES = [
  { href: "/chat", emoji: "💬", title: "Grounded chat", desc: "Ask questions over company data", color: "#4285f4" },
  { href: "/agents", emoji: "🤖", title: "Agent gallery", desc: "Use & build AI agents", color: "#d96570" },
  { href: "/notebook", emoji: "📓", title: "NotebookLM", desc: "Study sources, audio overviews", color: "#34a853" },
  { href: "/research", emoji: "🔬", title: "Deep Research", desc: "Long, cited research reports", color: "#00a1e0" },
  { href: "/workflows", emoji: "⚙️", title: "Workflows", desc: "Automate multi-step tasks", color: "#ff7a1a" },
  { href: "/connectors", emoji: "🔌", title: "Connectors", desc: "Plug in Drive, Jira, Salesforce", color: "#f9ab00" },
];

export default function Home() {
  const { state, ready, update, toast } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [welcome, setWelcome] = useState(false);
  const [name, setName] = useState("");
  const lp = labProgress(state);
  const nt = nextTask(state);
  const lv = levelFor(state.xp);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (ready && state.name === "Learner" && !state.events.welcomed) setWelcome(true);
  }, [ready]);

  const go = (text: string) => router.push(`/chat?q=${encodeURIComponent(text)}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Hero */}
      <section className="flex flex-col items-center pt-4 text-center md:pt-10">
        <div className="animate-float"><Sparkle size={52} /></div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          <span className="gem-text">{greet}, {state.name}</span>
        </h1>
        <p className="mt-2 text-lg text-gray-500">What would you like to get done at {COMPANY} today?</p>

        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q); }} className="gem-border mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full bg-white py-2 pl-6 pr-2 shadow-xl shadow-purple-100">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything, search everything…" className="flex-1 bg-transparent py-2 text-base outline-none" />
          <button className="gem-bg flex h-11 w-11 items-center justify-center rounded-full text-white"><ArrowUp size={20} /></button>
        </form>

        <div className="mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
          {PROMPT_IDEAS.slice(0, 5).map((p) => (
            <button key={p.text} onClick={() => go(p.text)} className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow" style={{ borderColor: p.color + "55" }}>
              <span className="mr-1">{p.emoji}</span>{p.text}
            </button>
          ))}
        </div>
      </section>

      {/* Mission + progress */}
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden md:col-span-2" style={{ background: "linear-gradient(135deg,#fff,#f6f0ff)" }}>
          <div className="absolute -right-6 -top-6 text-8xl opacity-10">🎯</div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-500">Your next mission</p>
          {nt ? (
            <>
              <h3 className="mt-2 text-xl font-bold text-gray-900">{nt.task.label}</h3>
              <p className="mt-1 text-sm text-gray-500">{nt.lab.emoji} {nt.lab.title} · 💡 {nt.task.hint}</p>
              <Link href={nt.task.href} className="gem-bg mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow">
                Start mission <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <h3 className="mt-2 text-xl font-bold">🏆 You finished every lab! Keep practising freely.</h3>
          )}
        </Card>
        <Card className="flex items-center gap-4">
          <Ring pct={lp.pct} size={88} label="labs" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{lv.emoji} {lv.name}</p>
            <p className="text-xs text-gray-500">{lp.done}/{lp.total} lab tasks · {state.lessonsDone.length}/{MODULES.length} modules</p>
            <Link href="/progress" className="mt-2 inline-block text-xs font-semibold text-purple-600 hover:underline">View badges →</Link>
          </div>
        </Card>
      </section>

      {/* Tiles */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Explore the workspace</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href} className="group rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition group-hover:scale-110" style={{ background: t.color + "22" }}>{t.emoji}</div>
              <p className="mt-3 font-semibold text-gray-900">{t.title}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning path */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">📚 Learning path</h2>
            <Link href="/learn" className="text-xs font-semibold text-blue-600">All modules →</Link>
          </div>
          <div className="mt-3 space-y-2">
            {MODULES.slice(0, 5).map((m, i) => {
              const done = state.lessonsDone.includes(m.id);
              return (
                <Link key={m.id} href={`/learn/${m.id}`} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-gray-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: m.color + "22" }}>{done ? "✅" : m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{i + 1}. {m.title}</p>
                    <p className="text-xs text-gray-400">{m.minutes} min read · quiz</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">🧪 Hands-on labs</h2>
            <Link href="/labs" className="text-xs font-semibold text-pink-600">All labs →</Link>
          </div>
          <div className="mt-3 space-y-3">
            {LABS.slice(0, 5).map((l) => {
              const d = l.tasks.filter((t) => t.check(state)).length;
              return (
                <Link key={l.id} href="/labs" className="block rounded-2xl p-2 hover:bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{l.emoji} {l.title}</span>
                    <span className="text-xs text-gray-400">{d}/{l.tasks.length}</span>
                  </div>
                  <div className="mt-1.5"><Progress pct={(d / l.tasks.length) * 100} color={l.color} h={6} /></div>
                </Link>
              );
            })}
          </div>
        </Card>
      </section>

      <p className="mt-10 text-center text-xs text-gray-400">
        Unofficial training sandbox · inspired by the Gemini Enterprise experience · all company data is fictional · not affiliated with Google
      </p>

      <Modal open={welcome} onClose={() => { setWelcome(false); update((s) => ({ ...s, events: { ...s.events, welcomed: 1 } })); }} title="👋 Welcome to your Gemini Enterprise sandbox!">
        <p className="text-sm text-gray-600">
          You've just joined <b>{COMPANY}</b>, a fictional outdoor-gear company. Everything here — docs, emails, tickets, deals — is simulated, so you can explore, break things and practise safely.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>📚 <b>Learn</b> — short modules + quizzes explain each concept</li>
          <li>🧪 <b>Labs</b> — missions that auto-check as you use the sandbox</li>
          <li>⚡ <b>XP & levels</b> — earn points, unlock badges, celebrate 🎉</li>
        </ul>
        <label className="mt-5 block text-sm font-semibold text-gray-700">What should we call you?</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200" />
        <button
          onClick={() => {
            update((s) => ({ ...s, name: name.trim() || "Learner", xp: s.xp + 10, events: { ...s.events, welcomed: 1 } }));
            setWelcome(false);
            toast("+10 XP · Welcome aboard!", "🎉");
          }}
          className="gem-bg mt-5 w-full rounded-full py-2.5 font-semibold text-white"
        >
          Let's go 🚀
        </button>
      </Modal>
    </div>
  );
}
