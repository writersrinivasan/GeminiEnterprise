"use client";
import { useState } from "react";
import { Card, PageHeader, TipBox } from "@/components/ui";
import { LICENSE_TIERS, PEOPLE, SOURCES } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { SourceId } from "@/lib/types";

const POLICIES = [
  { key: "webGrounding", label: "Allow web grounding", desc: "Users may include public web results in answers", emoji: "🌐" },
  { key: "agentCreation", label: "Allow users to create agents", desc: "Agent Designer is available to licensed users", emoji: "🛠️" },
  { key: "agentSharing", label: "Allow agent sharing org-wide", desc: "Published agents appear for everyone", emoji: "📣" },
  { key: "actions", label: "Enable actions in connected apps", desc: "Agents can send email, create tickets (with confirmation)", emoji: "⚡" },
  { key: "modelArmor", label: "Model Armor safety screening", desc: "Screen prompts & responses for prompt injection, sensitive data and harmful content", emoji: "🛡️" },
];

const TABS = ["Overview", "Users & licenses", "Policies", "Audit log"] as const;

export default function AdminPage() {
  const { state, update, track, toast } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const licensed = Object.values(state.licenses).filter((v) => v !== "none").length;

  const setLicense = (uidv: string, tier: string) => {
    update((s) => ({ ...s, licenses: { ...s.licenses, [uidv]: tier } }));
    if (tier !== "none") track("license_assigned", 10, "Assigned a license");
  };
  const setPolicy = (k: string, v: boolean | string) => {
    update((s) => ({ ...s, policies: { ...s.policies, [k]: v } }));
    track("policy_changed", 10, "Changed a policy");
    toast(`Policy updated: ${k}`, "🛡️");
  };

  const usage = [
    { label: "Chat", v: state.events.chat_sent ?? 0, color: "#4285f4" },
    { label: "Agents", v: Object.entries(state.events).filter(([k]) => k.startsWith("agent_")).reduce((a, [, v]) => a + v, 0), color: "#d96570" },
    { label: "Workflows", v: state.events.workflow_run ?? 0, color: "#ff7a1a" },
    { label: "Research", v: state.events.research_run ?? 0, color: "#00a1e0" },
    { label: "Notebooks", v: (state.events.nb_chat ?? 0) + (state.events.nb_generated ?? 0) + (state.events.nb_audio ?? 0), color: "#34a853" },
  ];
  const max = Math.max(1, ...usage.map((u) => u.v));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji="🛡️" title="Admin console (simulated)" subtitle="In real life this lives in the Google Cloud console. Admins manage identity, licenses, connectors, feature policies, safety and auditing." color="#1fa463" />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); if (t === "Audit log") track("audit_viewed", 10, "Reviewed the audit log"); }} className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { l: "Licensed users", v: `${licensed}/${PEOPLE.length}`, c: "#4285f4", e: "👥" },
            { l: "Data stores", v: Object.keys(state.connectors).length, c: "#f9ab00", e: "🗄️" },
            { l: "Custom agents", v: state.agents.length, c: "#d96570", e: "🤖" },
            { l: "Safety", v: state.policies.modelArmor ? "On" : "Off", c: state.policies.modelArmor ? "#34a853" : "#ea4335", e: "🛡️" },
          ].map((k) => (
            <Card key={k.l} style={{ borderTop: `4px solid ${k.c}` }}>
              <p className="text-2xl">{k.e}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{k.v}</p>
              <p className="text-xs text-gray-500">{k.l}</p>
            </Card>
          ))}
          <Card className="md:col-span-2">
            <p className="font-semibold text-gray-800">📈 Your usage (adoption analytics)</p>
            <div className="mt-4 flex h-40 items-end gap-3">
              {usage.map((u) => (
                <div key={u.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-600">{u.v}</span>
                  <div className="w-full rounded-t-xl transition-all duration-700" style={{ height: `${(u.v / max) * 100}%`, minHeight: 4, background: `linear-gradient(${u.color}, ${u.color}99)` }} />
                  <span className="text-[10px] text-gray-500">{u.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="md:col-span-2">
            <p className="font-semibold text-gray-800">🗄️ Data stores</p>
            <div className="mt-3 space-y-2">
              {(Object.keys(state.connectors) as SourceId[]).map((s) => (
                <div key={s} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                  <span>{SOURCES[s].emoji} {SOURCES[s].name}</span>
                  <span className="text-xs text-gray-500">{state.connectors[s]?.mode} · {state.connectors[s]?.docs.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "Users & licenses" && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-50 to-blue-50 text-left text-gray-600">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">License</th></tr>
            </thead>
            <tbody>
              {PEOPLE.map((p) => {
                const tier = state.licenses[p.id] ?? "none";
                const t = LICENSE_TIERS.find((x) => x.id === tier)!;
                return (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3"><span className="mr-2 text-lg">{p.emoji}</span><b>{p.name}</b><br /><span className="ml-8 text-xs text-gray-400">{p.email}</span></td>
                    <td className="px-4 py-3 text-gray-600">{p.dept}</td>
                    <td className="px-4 py-3">
                      <select value={tier} onChange={(e) => setLicense(p.id, e.target.value)} className="rounded-full px-3 py-1 text-xs font-semibold outline-none" style={{ background: t.color + "22", color: t.color }}>
                        {LICENSE_TIERS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="p-4 text-xs text-gray-400">Edition names are simplified for training — check the official pricing page for current tiers and features.</p>
        </Card>
      )}

      {tab === "Policies" && (
        <div className="space-y-3">
          {POLICIES.map((p) => {
            const on = state.policies[p.key] === true;
            return (
              <Card key={p.key} className="flex items-center gap-4">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{p.label}</p>
                  <p className="text-sm text-gray-500">{p.desc}</p>
                </div>
                <button onClick={() => setPolicy(p.key, !on)} className={`relative h-7 w-12 rounded-full transition ${on ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
                </button>
              </Card>
            );
          })}
          <Card className="flex flex-wrap items-center gap-4">
            <span className="text-2xl">🌍</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Data residency</p>
              <p className="text-sm text-gray-500">Where data stores and processing are located</p>
            </div>
            <select value={String(state.policies.residency)} onChange={(e) => setPolicy("residency", e.target.value)} className="rounded-full bg-gray-100 px-4 py-2 text-sm outline-none">
              <option value="global">Global (multi-region)</option>
              <option value="us">United States</option>
              <option value="eu">European Union</option>
            </select>
          </Card>
          <TipBox>Try turning <b>web grounding off</b>, then go to Chat — the Web button becomes disabled. That's how admin policy shapes the end-user experience.</TipBox>
        </div>
      )}

      {tab === "Audit log" && (
        <Card className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            {state.audit.length === 0 && <p className="p-6 text-sm text-gray-400">No activity yet — go use the sandbox!</p>}
            {state.audit.map((a, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-gray-50 px-4 py-2.5 text-sm">
                <span className="w-36 shrink-0 font-mono text-xs text-gray-400">{new Date(a.t).toLocaleString()}</span>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 font-mono text-xs text-purple-700">{a.event}</span>
                <span className="truncate text-gray-600">{state.name} · {a.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
