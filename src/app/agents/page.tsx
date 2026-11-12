"use client";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, PageHeader, TipBox } from "@/components/ui";
import { BUILTIN_AGENTS, SOURCES, TOOLS } from "@/lib/data";
import { useStore } from "@/lib/store";

const SPECIAL = [
  { id: "research", name: "Deep Research", emoji: "🔬", color: "#00a1e0", description: "Plans multi-step research, browses internal & web sources, writes cited reports.", href: "/research" },
  { id: "notebook", name: "NotebookLM", emoji: "📓", color: "#34a853", description: "Chat with your chosen sources; make study guides & audio overviews.", href: "/notebook" },
];

export default function AgentsPage() {
  const { state, update, toast } = useStore();
  const [tab, setTab] = useState<"all" | "prebuilt" | "mine">("all");
  const mine = state.agents;

  const del = (id: string) => {
    update((s) => ({ ...s, agents: s.agents.filter((a) => a.id !== id) }));
    toast("Agent deleted", "🗑️");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        emoji="🤖"
        title="Agent Gallery"
        subtitle="Agents package instructions + knowledge + tools for a specific job. Use prebuilt ones or design your own — no code needed."
        color="#d96570"
        right={
          <Link href="/agents/designer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-pink-600 shadow hover:bg-pink-50">
            <Plus size={16} /> Create agent
          </Link>
        }
      />

      <div className="flex gap-2">
        {(["all", "prebuilt", "mine"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}>
            {t === "all" ? "All agents" : t === "prebuilt" ? "✨ Prebuilt" : `🛠️ Made by you (${mine.length})`}
          </button>
        ))}
      </div>

      {tab !== "mine" && (
        <section>
          <h2 className="mb-3 font-bold text-gray-900">✨ Prebuilt agents</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIAL.map((a) => (
              <AgentCard key={a.id} emoji={a.emoji} color={a.color} name={a.name} desc={a.description} href={a.href} badge="Prebuilt" />
            ))}
            {BUILTIN_AGENTS.map((a) => (
              <AgentCard key={a.id} emoji={a.emoji} color={a.color} name={a.name} desc={a.description} href={`/chat?agent=${a.id}`} badge="Prebuilt" tools={a.tools} />
            ))}
          </div>
        </section>
      )}

      {tab !== "prebuilt" && (
        <section>
          <h2 className="mb-3 font-bold text-gray-900">🛠️ Made by you</h2>
          {mine.length === 0 ? (
            <Card className="flex flex-col items-center py-10 text-center">
              <div className="text-5xl animate-float">🧑‍🔧</div>
              <p className="mt-3 font-semibold text-gray-800">You haven't built an agent yet</p>
              <p className="text-sm text-gray-500">Lab 4 walks you through it step by step.</p>
              <Link href="/agents/designer" className="gem-bg mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white">Open Agent Designer</Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((a) => (
                <AgentCard key={a.id} emoji={a.emoji} color={a.color} name={a.name} desc={a.description || "No description"} href={`/chat?agent=${a.id}`} badge={a.published ? "Published" : "Draft"} tools={a.tools} sources={a.sources}
                  extra={
                    <div className="flex gap-1">
                      <Link href={`/agents/designer?id=${a.id}`} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"><Pencil size={14} /></Link>
                      <button onClick={(e) => { e.preventDefault(); del(a.id); }} className="rounded-full p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      <TipBox title="Prebuilt vs. custom agents">
        <b>Prebuilt</b> agents (Deep Research, NotebookLM, Idea Generation, Data Insights…) are ready to use. <b>Custom</b> agents are ones you or your team design in Agent Designer. Developers can also register pro-code agents built with the Agent Development Kit (ADK) or via the A2A protocol.
      </TipBox>
    </div>
  );
}

function AgentCard({ emoji, color, name, desc, href, badge, tools, sources, extra }: { emoji: string; color: string; name: string; desc: string; href: string; badge: string; tools?: string[]; sources?: string[]; extra?: React.ReactNode }) {
  return (
    <Link href={href} className="group relative flex flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${color}, #9b72cb)` }} />
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition group-hover:scale-110 group-hover:rotate-6" style={{ background: color + "22" }}>{emoji}</span>
        <div className="flex items-center gap-1">
          {extra}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge === "Draft" ? "bg-gray-100 text-gray-500" : badge === "Published" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{badge}</span>
        </div>
      </div>
      <p className="mt-3 font-bold text-gray-900">{name}</p>
      <p className="mt-1 flex-1 text-sm text-gray-500">{desc}</p>
      {(tools?.length || sources?.length) ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {tools?.map((t) => { const tl = TOOLS.find((x) => x.id === t); return tl ? <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-gray-100">{tl.emoji} {tl.name}</span> : null; })}
          {sources?.map((s) => <span key={s} className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-gray-100">{SOURCES[s as keyof typeof SOURCES]?.emoji}</span>)}
        </div>
      ) : null}
    </Link>
  );
}
