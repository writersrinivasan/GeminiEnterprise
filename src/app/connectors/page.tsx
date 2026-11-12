"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, Modal, PageHeader, Progress, TipBox } from "@/components/ui";
import { SOURCES, SOURCE_IDS } from "@/lib/data";
import { sleep } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { SourceId } from "@/lib/types";

export default function ConnectorsPage() {
  const { state, update, track, toast } = useStore();
  const [setup, setSetup] = useState<SourceId | null>(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"ingested" | "federated">("ingested");
  const [syncPct, setSyncPct] = useState<Partial<Record<SourceId, number>>>({});

  const open = (s: SourceId) => {
    setSetup(s);
    setStep(0);
    setMode("ingested");
  };

  const runSync = async (s: SourceId, m: "ingested" | "federated") => {
    const total = SOURCES[s].docs;
    if (m === "federated") {
      update((st) => ({ ...st, connectors: { ...st.connectors, [s]: { mode: m, docs: total, at: Date.now() } } }));
      return;
    }
    for (let p = 0; p <= 100; p += 10) {
      setSyncPct((x) => ({ ...x, [s]: p }));
      await sleep(180);
    }
    setSyncPct((x) => ({ ...x, [s]: undefined }));
    update((st) => ({ ...st, connectors: { ...st.connectors, [s]: { mode: m, docs: total, at: Date.now() } } }));
  };

  const finish = async () => {
    if (!setup) return;
    const s = setup;
    setSetup(null);
    track("connector_connected", 20, `Connected ${SOURCES[s].name}`);
    toast(`${SOURCES[s].name} connected (${mode})`, SOURCES[s].emoji);
    await runSync(s, mode);
  };

  const disconnect = (s: SourceId) => {
    update((st) => {
      const c = { ...st.connectors };
      delete c[s];
      return { ...st, connectors: c };
    });
    toast(`${SOURCES[s].name} disconnected`, "🔌");
  };

  const resync = async (s: SourceId) => {
    track("connector_synced", 5, "Ran a sync");
    await runSync(s, state.connectors[s]?.mode ?? "ingested");
    toast(`${SOURCES[s].name} sync complete`, "🔄");
  };

  const count = Object.keys(state.connectors).length;
  const docs = Object.values(state.connectors).reduce((a, c) => a + (c?.docs ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji="🔌" title="Connectors & data stores" subtitle="Connect company apps so search, chat and agents can ground answers in your data — while respecting each app's permissions." color="#f9ab00"
        right={<div className="rounded-2xl bg-white/20 px-4 py-2 text-right backdrop-blur"><p className="text-2xl font-bold">{count}/8</p><p className="text-xs">connected · {docs.toLocaleString()} items</p></div>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SOURCE_IDS.map((s) => {
          const src = SOURCES[s];
          const c = state.connectors[s];
          const p = syncPct[s];
          return (
            <Card key={s} className="relative overflow-hidden transition hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: src.color }} />
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: src.color + "22" }}>{src.emoji}</span>
                {c ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">● {c.mode}</span> : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">off</span>}
              </div>
              <p className="mt-3 font-bold text-gray-900">{src.name}</p>
              <p className="text-xs text-gray-400">{src.kind}</p>
              <p className="mt-1 text-sm text-gray-500">{src.desc}</p>
              {p !== undefined ? (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-medium text-gray-500">Indexing… {p}%</p>
                  <Progress pct={p} color={src.color} />
                </div>
              ) : c ? (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{c.docs.toLocaleString()} items</span>
                  <div className="flex gap-1">
                    {c.mode === "ingested" && <button onClick={() => resync(s)} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100" title="Sync now"><RefreshCw size={14} /></button>}
                    <button onClick={() => disconnect(s)} className="rounded-full px-2 py-1 text-gray-500 hover:bg-red-50 hover:text-red-600">Disconnect</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => open(s)} className="mt-3 w-full rounded-full py-2 text-sm font-semibold text-white shadow transition hover:opacity-90" style={{ background: src.color }}>Connect</button>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-bold text-gray-900">📥 Ingested (indexed)</h3>
          <p className="mt-1 text-sm text-gray-600">Content and ACLs are copied into a managed <b>data store</b> and indexed. Rich, fast semantic search. Needs periodic sync to stay fresh.</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500"><span className="rounded-lg bg-blue-50 px-2 py-1">App</span>→<span className="rounded-lg bg-purple-50 px-2 py-1">Sync</span>→<span className="rounded-lg bg-pink-50 px-2 py-1">Data store index</span>→<span className="rounded-lg bg-yellow-50 px-2 py-1">Gemini</span></div>
        </Card>
        <Card>
          <h3 className="font-bold text-gray-900">🔗 Federated (live)</h3>
          <p className="mt-1 text-sm text-gray-600">Queries go live to the app's own search API at question time. Nothing is copied; always fresh, but quality depends on the source's search.</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500"><span className="rounded-lg bg-yellow-50 px-2 py-1">Gemini</span>⇄<span className="rounded-lg bg-blue-50 px-2 py-1">App search API</span></div>
        </Card>
      </div>
      <TipBox>In the real product, connectors are usually configured by an <b>admin</b> in the Google Cloud console, often with a service account and OAuth app registration in the source system. End users then see results only for content they already have access to.</TipBox>

      <Modal open={!!setup} onClose={() => setSetup(null)} title={setup ? `Connect ${SOURCES[setup].name}` : ""}>
        {setup && (
          <div>
            <div className="mb-5 flex gap-2">
              {["Authorize", "Scope", "Mode"].map((l, i) => (
                <div key={l} className="flex-1">
                  <div className={`h-1.5 rounded-full ${i <= step ? "gem-bg" : "bg-gray-100"}`} />
                  <p className={`mt-1 text-xs ${i <= step ? "font-semibold text-gray-800" : "text-gray-400"}`}>{i + 1}. {l}</p>
                </div>
              ))}
            </div>
            {step === 0 && (
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-semibold">🔐 Simulated OAuth consent</p>
                <p className="mt-1 text-sm text-gray-600"><b>Gemini Enterprise (sandbox)</b> wants to:</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>✅ Read content and metadata</li>
                  <li>✅ Read access control lists (who can see what)</li>
                  <li>✅ Map identities to your company directory</li>
                </ul>
                <button onClick={() => setStep(1)} className="mt-4 w-full rounded-full py-2 text-sm font-semibold text-white" style={{ background: SOURCES[setup].color }}>Allow</button>
              </div>
            )}
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-700">What should be included?</p>
                {["All shared content", "Only selected sites / projects / folders", "Exclude archived items"].map((o, i) => (
                  <label key={o} className="mt-2 flex items-center gap-2 rounded-xl border border-gray-100 p-3 text-sm"><input type="checkbox" defaultChecked={i !== 1} className="accent-purple-600" /> {o}</label>
                ))}
                <button onClick={() => setStep(2)} className="gem-bg mt-4 w-full rounded-full py-2 text-sm font-semibold text-white">Next</button>
              </div>
            )}
            {step === 2 && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Choose a connection mode</p>
                {(["ingested", "federated"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`mt-2 w-full rounded-2xl border-2 p-3 text-left text-sm ${mode === m ? "border-purple-400 bg-purple-50" : "border-gray-100"}`}>
                    <p className="font-semibold">{m === "ingested" ? "📥 Ingested (indexed)" : "🔗 Federated (live)"}</p>
                    <p className="text-xs text-gray-500">{m === "ingested" ? "Copy & index into a data store. Best search quality." : "Query the source live. Nothing copied."}</p>
                  </button>
                ))}
                <button onClick={finish} className="gem-bg mt-4 w-full rounded-full py-2 text-sm font-semibold text-white">Connect & {mode === "ingested" ? "start sync" : "enable"}</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
