"use client";
import Link from "next/link";
import { Card, PageHeader, Progress } from "@/components/ui";
import { MODULES } from "@/lib/learn";
import { useStore } from "@/lib/store";

const MAP = [
  { emoji: "🧠", label: "Gemini models", desc: "Understand & generate", color: "#4285f4" },
  { emoji: "💬", label: "Chat & search", desc: "The front door", color: "#9b72cb" },
  { emoji: "🔌", label: "Connectors", desc: "Your company data", color: "#f9ab00" },
  { emoji: "🤖", label: "Agents", desc: "Prebuilt + custom", color: "#d96570" },
  { emoji: "⚙️", label: "Workflows & actions", desc: "Get work done", color: "#ff7a1a" },
  { emoji: "🛡️", label: "Governance", desc: "Secure & compliant", color: "#1fa463" },
];

export default function LearnPage() {
  const { state } = useStore();
  const done = state.lessonsDone.length;
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji="📚" title="Gemini Enterprise Academy" subtitle="Bite-sized modules that explain how the platform works. Each ends with a quiz and a link to practise in the sandbox." color="#4285f4"
        right={<div className="w-48 rounded-2xl bg-white/20 p-3 backdrop-blur"><p className="text-sm font-semibold">{done}/{MODULES.length} modules complete</p><div className="mt-2"><Progress pct={(done / MODULES.length) * 100} color="#ffffff" /></div></div>}
      />

      <Card>
        <h2 className="font-bold text-gray-900">🗺️ The platform at a glance</h2>
        <p className="text-sm text-gray-500">How the pieces stack up — from the model to governance.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
          {MAP.map((m, i) => (
            <div key={m.label} className="relative rounded-2xl p-4 text-center" style={{ background: m.color + "15" }}>
              <div className="text-3xl">{m.emoji}</div>
              <p className="mt-2 text-sm font-bold" style={{ color: m.color }}>{m.label}</p>
              <p className="text-[11px] text-gray-500">{m.desc}</p>
              {i < MAP.length - 1 && <span className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-gray-300 md:block">▶</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => {
          const isDone = state.lessonsDone.includes(m.id);
          const score = state.quizScores[m.id];
          return (
            <Link key={m.id} href={`/learn/${m.id}`} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 transition group-hover:scale-150" style={{ background: m.color }} />
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: m.color + "22" }}>{m.emoji}</span>
                <span className="text-xs font-semibold text-gray-400">Module {i + 1}</span>
              </div>
              <p className="mt-3 font-bold text-gray-900">{m.title}</p>
              <p className="mt-1 flex-1 text-sm text-gray-500">{m.summary}</p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">⏱ {m.minutes} min</span>
                {isDone && <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">✅ Done</span>}
                {score !== undefined && <span className="rounded-full bg-purple-100 px-2 py-0.5 font-semibold text-purple-700">Quiz {score}/3</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
