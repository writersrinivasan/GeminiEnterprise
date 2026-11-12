"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Globe, Layers } from "lucide-react";
import ChatView from "@/components/ChatView";
import { Sparkle, TipBox } from "@/components/ui";
import { BUILTIN_AGENTS, PROMPT_IDEAS, SOURCES } from "@/lib/data";
import { agentAnswer, answer, hitsRestricted } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { SourceId } from "@/lib/types";

function ChatInner() {
  const sp = useSearchParams();
  const { state, track } = useStore();
  const connected = Object.keys(state.connectors) as SourceId[];
  const [disabled, setDisabled] = useState<SourceId[]>([]);
  const [web, setWeb] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const active = connected.filter((s) => !disabled.includes(s));

  const agentId = sp.get("agent");
  const agent = useMemo(() => [...BUILTIN_AGENTS, ...state.agents].find((a) => a.id === agentId), [agentId, state.agents]);

  const responder = (q: string) => {
    if (agent) return agentAnswer(q, agent, connected);
    const r = answer(q, active);
    if (web && state.policies.webGrounding) {
      r.thinking.splice(2, 0, "🌐 Also searching the public web (simulated)");
      r.text += "\n\n🌐 **Web (simulated):** Public sources broadly agree with the internal data above.";
    }
    return r;
  };

  const onSent = (q: string, r: ReturnType<typeof answer>) => {
    track("chat_sent", 5, "Asked a question");
    if (r.citations.some((d) => d.source === "jira")) track("cite_jira", 15, "Answer grounded in Jira");
    if (r.citations.some((d) => d.source === "salesforce")) track("cite_salesforce", 10, "Answer grounded in Salesforce");
    if (hitsRestricted(q, connected) && !r.citations.some((d) => d.restricted)) track("acl_blocked", 15, "Saw permissions in action");
    if (agent) track(`agent_chat_${agent.id}`, 10, `Chatted with ${agent.name}`);
  };

  const starters = agent ? agent.starters.map((t) => ({ text: t, emoji: agent.emoji, color: agent.color })) : PROMPT_IDEAS;

  const toolbar = agent ? null : (
    <>
      <button type="button" onClick={() => setShowSources((v) => !v)} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
        <Layers size={14} /> Sources ({active.length})
      </button>
      <button
        type="button"
        onClick={() => { if (!state.policies.webGrounding) return; setWeb((w) => !w); track("web_toggle", 3); }}
        title={state.policies.webGrounding ? "Toggle web grounding" : "Disabled by your admin"}
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${!state.policies.webGrounding ? "cursor-not-allowed text-gray-300" : web ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
      >
        <Globe size={14} /> Web {web ? "on" : "off"}
      </button>
    </>
  );

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {agent && (
          <div className="flex items-center gap-3 border-b border-gray-100 bg-white/70 px-6 py-3 backdrop-blur">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: agent.color + "33" }}>{agent.emoji}</span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{agent.name}</p>
              <p className="truncate text-xs text-gray-500">{agent.description}</p>
            </div>
            <Link href="/chat" className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200">Exit agent</Link>
          </div>
        )}
        {showSources && !agent && (
          <div className="animate-pop border-b border-gray-100 bg-white/80 px-6 py-3">
            <p className="mb-2 text-xs font-semibold text-gray-500">Choose which connected sources to ground on — <Link href="/connectors" className="text-blue-600">connect more →</Link></p>
            <div className="flex flex-wrap gap-2">
              {connected.map((s) => {
                const on = !disabled.includes(s);
                return (
                  <button key={s} onClick={() => { setDisabled((d) => (on ? [...d, s] : d.filter((x) => x !== s))); track("source_toggled", 3); }} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${on ? "text-white ring-transparent" : "bg-white text-gray-500 ring-gray-200"}`} style={on ? { background: SOURCES[s].color } : {}}>
                    {SOURCES[s].emoji} {SOURCES[s].name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1">
          <ChatView
            key={(agentId ?? "") + (sp.get("new") ?? "") + (sp.get("q") ?? "")}
            responder={responder}
            onSent={onSent}
            starters={starters}
            initialQuery={sp.get("q") ?? undefined}
            accent={agent?.color}
            toolbar={toolbar}
            placeholder={agent ? `Message ${agent.name}…` : undefined}
            empty={
              <div className="text-center">
                {agent ? <div className="text-6xl animate-float">{agent.emoji}</div> : <div className="flex justify-center animate-float"><Sparkle size={56} /></div>}
                <h1 className="mt-4 text-3xl font-bold"><span className="gem-text">{agent ? `Hi, I'm ${agent.name}` : `Hello, ${state.name}`}</span></h1>
                <p className="mt-2 text-gray-500">{agent ? agent.description : `Grounded in ${active.length} connected source${active.length === 1 ? "" : "s"}. Try a prompt below 👇`}</p>
              </div>
            }
          />
        </div>
      </div>
      <aside className="hidden w-72 shrink-0 space-y-4 overflow-y-auto border-l border-gray-100 bg-white/50 p-4 xl:block">
        <TipBox title="How grounded chat works">
          <ol className="list-decimal space-y-1 pl-4">
            <li>Your question is understood</li>
            <li>Connected sources are searched</li>
            <li>Results are filtered by <b>your permissions</b></li>
            <li>Gemini writes an answer</li>
            <li>Citations link back to sources</li>
          </ol>
        </TipBox>
        <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
          <p className="font-semibold text-gray-800">🧪 Try these experiments</p>
          <ul className="mt-2 space-y-2 text-gray-600">
            <li>• Ask about <b>“executive compensation”</b> — see permissions block it 🔒</li>
            <li>• Turn <b>Drive off</b> in Sources and ask about Q3 sales</li>
            <li>• Ask <b>“Draft an email about…”</b> to change the output format</li>
            <li>• Connect <b>Jira</b>, then ask about P1 bugs</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
          <p className="font-semibold text-gray-800">🔌 Connected sources</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {connected.map((s) => <span key={s} className="rounded-full px-2 py-0.5 text-xs" style={{ background: SOURCES[s].color + "22", color: SOURCES[s].color }}>{SOURCES[s].emoji} {SOURCES[s].name}</span>)}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}
