"use client";
import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Brain, Check, ChevronDown, Copy, Paperclip, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { SOURCES } from "@/lib/data";
import { sleep, uid } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { Action, Doc, Reply } from "@/lib/types";
import DocPanel from "./DocPanel";
import RichText from "./RichText";
import { Sparkle } from "./ui";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  thinking?: string[];
  shown?: number;
  citations?: Doc[];
  followups?: string[];
  action?: Action;
  actionState?: "pending" | "done" | "cancelled";
  status?: "thinking" | "typing" | "done";
};

export default function ChatView({
  responder,
  onSent,
  starters,
  placeholder = "Ask Gemini anything about your company…",
  empty,
  initialQuery,
  accent = "#4285f4",
  toolbar,
  compact,
}: {
  responder: (q: string) => Reply;
  onSent?: (q: string, r: Reply) => void;
  starters?: { emoji?: string; text: string; color?: string }[];
  placeholder?: string;
  empty?: React.ReactNode;
  initialQuery?: string;
  accent?: string;
  toolbar?: React.ReactNode;
  compact?: boolean;
}) {
  const { track, toast } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [openDoc, setOpenDoc] = useState<Doc | null>(null);
  const [openThinking, setOpenThinking] = useState<Record<string, boolean>>({});
  const alive = useRef(true);
  const fired = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const responderRef = useRef(responder);
  responderRef.current = responder;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  const patch = (id: string, p: Partial<Msg>) => setMsgs((m) => m.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const send = async (q: string, viaChip = false) => {
    if (!q.trim() || busy) return;
    setBusy(true);
    setInput("");
    if (viaChip) track("prompt_chip", 5, "Used a suggested prompt");
    const reply = responderRef.current(q);
    const aid = uid();
    setMsgs((m) => [...m, { id: uid(), role: "user", text: q }, { id: aid, role: "assistant", text: "", thinking: reply.thinking, shown: 0, status: "thinking" }]);
    for (let i = 1; i <= reply.thinking.length; i++) {
      await sleep(420);
      if (!alive.current) return;
      patch(aid, { shown: i });
    }
    patch(aid, { status: "typing" });
    const parts = reply.text.split(/(\s+)/);
    for (let i = 0; i < parts.length; i += 8) {
      if (!alive.current) return;
      patch(aid, { text: parts.slice(0, i + 8).join("") });
      await sleep(25);
    }
    patch(aid, { text: reply.text, status: "done", citations: reply.citations, followups: reply.followups, action: reply.action, actionState: reply.action ? "pending" : undefined });
    setBusy(false);
    onSent?.(q, reply);
  };

  useEffect(() => {
    if (initialQuery && !fired.current) {
      fired.current = true;
      setTimeout(() => send(initialQuery), 50);
    }
  }, [initialQuery]);

  const cite = (m: Msg, i: number) => {
    const d = m.citations?.[i];
    if (d) {
      setOpenDoc(d);
      track("citation_opened", 10, "Verified a source");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex-1 overflow-y-auto ${compact ? "px-3 py-3" : "px-4 py-6 md:px-8"}`}>
        {msgs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            {empty}
            {starters && starters.length > 0 && (
              <div className={`mt-6 grid w-full gap-2 ${compact ? "grid-cols-1" : "max-w-3xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {starters.map((s, i) => (
                  <button key={i} onClick={() => send(s.text, true)} className="group flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderLeft: `4px solid ${s.color ?? accent}` }}>
                    <span className="text-lg">{s.emoji ?? "✨"}</span>
                    <span className="group-hover:text-gray-900">{s.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`mx-auto space-y-6 ${compact ? "" : "max-w-3xl"}`}>
            {msgs.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end animate-pop">
                  <div className="max-w-[85%] rounded-3xl rounded-br-md bg-gradient-to-br from-blue-600 to-purple-600 px-4 py-2.5 text-white shadow">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3 animate-pop">
                  <div className="mt-1 shrink-0"><Sparkle spinning={m.status !== "done"} size={28} /></div>
                  <div className="min-w-0 flex-1">
                    {m.thinking && m.thinking.length > 0 && (
                      <div className="mb-2">
                        <button
                          onClick={() => {
                            setOpenThinking((o) => ({ ...o, [m.id]: !o[m.id] }));
                            track("thinking_opened", 5, "Peeked behind the scenes");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100"
                        >
                          <Brain size={13} />
                          {m.status === "thinking" ? <span className="shimmer font-semibold">{m.thinking[Math.max(0, (m.shown ?? 1) - 1)]}</span> : "Show thinking"}
                          <ChevronDown size={13} className={openThinking[m.id] ? "rotate-180" : ""} />
                        </button>
                        {(openThinking[m.id] || m.status === "thinking") && (
                          <ol className="mt-2 space-y-1 border-l-2 border-purple-200 pl-4 text-xs text-gray-500">
                            {m.thinking.slice(0, m.status === "thinking" ? m.shown : undefined).map((t, i) => (
                              <li key={i} className="animate-pop"><RichText text={`${i + 1}. ${t}`} /></li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}
                    {m.text && <RichText text={m.text} onCite={(i) => cite(m, i)} />}
                    {m.action && (
                      <div className="mt-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">⚡ Action requires your approval: {m.action.title}</div>
                        <p className="mt-1 text-sm text-orange-900/80">{m.action.detail}</p>
                        {m.actionState === "pending" ? (
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => { patch(m.id, { actionState: "done" }); track("action_confirmed", 20, "Approved an agent action"); toast(`${m.action!.title} — done (simulated)`, "✅"); }} className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600"><Check size={14} /> Confirm</button>
                            <button onClick={() => patch(m.id, { actionState: "cancelled" })} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"><X size={14} /> Cancel</button>
                          </div>
                        ) : (
                          <p className={`mt-2 text-sm font-semibold ${m.actionState === "done" ? "text-green-700" : "text-gray-500"}`}>{m.actionState === "done" ? "✅ Completed (simulated)" : "Cancelled — nothing was changed"}</p>
                        )}
                      </div>
                    )}
                    {m.status === "done" && m.citations && m.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.citations.map((d, i) => {
                          const s = SOURCES[d.source];
                          return (
                            <button key={d.id} onClick={() => cite(m, i)} className="flex max-w-[260px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow" style={{ borderTop: `3px solid ${s.color}` }}>
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold">{i + 1}</span>
                              <span className="truncate"><span className="mr-1">{s.emoji}</span>{d.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {m.status === "done" && (
                      <div className="mt-2 flex items-center gap-1 text-gray-400">
                        <IconBtn onClick={() => toast("Thanks for the feedback!", "👍")}><ThumbsUp size={14} /></IconBtn>
                        <IconBtn onClick={() => toast("Feedback noted — it helps improve answers", "📝")}><ThumbsDown size={14} /></IconBtn>
                        <IconBtn onClick={() => { navigator.clipboard?.writeText(m.text).catch(() => {}); toast("Copied", "📋"); }}><Copy size={14} /></IconBtn>
                      </div>
                    )}
                    {m.status === "done" && m.followups && m.followups.length > 0 && m.id === msgs[msgs.length - 1].id && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.followups.map((f) => (
                          <button key={f} onClick={() => send(f, true)} className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">↪ {f}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            <div ref={bottom} />
          </div>
        )}
      </div>

      <div className={compact ? "p-3" : "px-4 pb-5 md:px-8"}>
        <div className={`mx-auto ${compact ? "" : "max-w-3xl"}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="gem-border rounded-3xl bg-white p-2 shadow-lg shadow-purple-100"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={compact ? 1 : 2}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-gray-400"
            />
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
                <button type="button" onClick={() => toast("File upload is simulated in this sandbox", "📎")} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><Paperclip size={18} /></button>
                {toolbar}
              </div>
              <button disabled={busy || !input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-30 gem-bg">
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
          {!compact && <p className="mt-2 text-center text-[11px] text-gray-400">Sandbox simulation · answers are generated from fictional data · always verify AI output</p>}
        </div>
      </div>
      <DocPanel doc={openDoc} onClose={() => setOpenDoc(null)} />
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-full p-1.5 hover:bg-gray-100 hover:text-gray-700">{children}</button>;
}
