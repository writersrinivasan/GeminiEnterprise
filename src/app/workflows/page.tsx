"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Play, Plus, Trash2, X } from "lucide-react";
import { Card, PageHeader, TipBox } from "@/components/ui";
import { STEP_KINDS, TRIGGERS, WF_TEMPLATES, sleep, uid } from "@/lib/sim";
import { useStore } from "@/lib/store";
import type { Workflow } from "@/lib/types";

type LogLine = { stepId: string; status: "running" | "ok" | "waiting"; text: string };

export default function WorkflowsPage() {
  const { state, update, track, toast } = useStore();
  const [selId, setSelId] = useState<string | null>(state.workflows[0]?.id ?? null);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<((ok: boolean) => void) | null>(null);
  const wf = state.workflows.find((w) => w.id === selId) ?? null;

  const save = (w: Workflow) => update((s) => ({ ...s, workflows: s.workflows.map((x) => (x.id === w.id ? w : x)) }));

  const create = (tpl?: (typeof WF_TEMPLATES)[number]) => {
    const w: Workflow = {
      id: uid(),
      name: tpl ? tpl.name : `My workflow ${state.workflows.length + 1}`,
      trigger: tpl ? tpl.trigger : "manual",
      steps: tpl ? tpl.steps.map(([kind, config]) => ({ id: uid(), kind, config: { ...config } as Record<string, string> })) : [],
      runs: 0,
      createdAt: Date.now(),
      active: false,
    };
    update((s) => ({ ...s, workflows: [...s.workflows, w] }));
    setSelId(w.id);
    setLog([]);
    track("workflow_created", 20, tpl ? `Used template: ${tpl.name}` : "Created a workflow");
  };

  const addStep = (kind: string) => {
    if (!wf) return;
    save({ ...wf, steps: [...wf.steps, { id: uid(), kind, config: {} }] });
    track("workflow_step_added", 3);
  };
  const move = (i: number, d: number) => {
    if (!wf) return;
    const s = [...wf.steps];
    const j = i + d;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    save({ ...wf, steps: s });
  };

  const run = async () => {
    if (!wf || running) return;
    if (!wf.steps.length) return toast("Add at least one step first", "➕");
    setRunning(true);
    const trig = TRIGGERS.find((t) => t.id === wf.trigger)!;
    const lines: LogLine[] = [{ stepId: "trigger", status: "ok", text: `${trig.emoji} Trigger fired: ${trig.name}` }];
    setLog([...lines]);
    for (const st of wf.steps) {
      const k = STEP_KINDS.find((x) => x.kind === st.kind)!;
      setActiveStep(st.id);
      lines.push({ stepId: st.id, status: "running", text: `${k.emoji} ${k.name}…` });
      setLog([...lines]);
      await sleep(900);
      if (st.kind === "approval") {
        lines[lines.length - 1] = { stepId: st.id, status: "waiting", text: `🙋 Waiting for approval from ${st.config.approver || "manager@nimbus.example"}…` };
        setLog([...lines]);
        const ok = await new Promise<boolean>((res) => setPendingApproval(() => res));
        setPendingApproval(null);
        if (!ok) {
          lines[lines.length - 1] = { stepId: st.id, status: "ok", text: "⛔ Rejected — workflow stopped safely. Nothing downstream ran." };
          setLog([...lines]);
          setRunning(false);
          setActiveStep(null);
          track("workflow_rejected", 10, "Stopped a run at approval");
          return;
        }
      }
      lines[lines.length - 1] = { stepId: st.id, status: "ok", text: `${k.emoji} ${k.name} → ${k.run(st.config)}` };
      setLog([...lines]);
    }
    lines.push({ stepId: "done", status: "ok", text: `🎉 Run complete in ${(wf.steps.length * 0.9 + 0.4).toFixed(1)}s` });
    setLog([...lines]);
    setActiveStep(null);
    setRunning(false);
    save({ ...wf, runs: wf.runs + 1 });
    track("workflow_run", 25, "Ran a workflow");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji="⚙️" title="Workflows" subtitle="Chain a trigger → AI steps → actions. Add a human approval before anything high-impact." color="#ff7a1a"
        right={<button onClick={() => create()} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 shadow hover:bg-orange-50"><Plus size={16} /> New workflow</button>}
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr_300px]">
        {/* List + templates */}
        <div className="space-y-4">
          <Card className="p-3">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Your workflows</p>
            {state.workflows.length === 0 && <p className="px-2 text-sm text-gray-400">None yet</p>}
            {state.workflows.map((w) => (
              <button key={w.id} onClick={() => { setSelId(w.id); setLog([]); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${w.id === selId ? "bg-orange-50 font-semibold text-orange-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="truncate">{w.name}</span>
                <span className="text-[10px] text-gray-400">{w.runs} runs</span>
              </button>
            ))}
          </Card>
          <Card className="p-3">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Start from template</p>
            {WF_TEMPLATES.map((t) => (
              <button key={t.name} onClick={() => create(t)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                <span className="text-lg">{t.emoji}</span> {t.name}
              </button>
            ))}
          </Card>
        </div>

        {/* Canvas */}
        <div>
          {!wf ? (
            <Card className="flex flex-col items-center py-16 text-center">
              <div className="text-6xl animate-float">🧩</div>
              <p className="mt-3 text-lg font-semibold">Create your first workflow</p>
              <p className="text-sm text-gray-500">Start blank or pick a template on the left.</p>
              <button onClick={() => create()} className="gem-bg mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white">+ New workflow</button>
            </Card>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm" style={{ backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
              <div className="flex flex-wrap items-center gap-2">
                <input value={wf.name} onChange={(e) => save({ ...wf, name: e.target.value })} className="flex-1 rounded-xl bg-white px-3 py-2 text-lg font-bold outline-none ring-1 ring-gray-100 focus:ring-orange-200" />
                <button onClick={run} disabled={running} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"><Play size={15} /> {running ? "Running…" : "Run"}</button>
                <button onClick={() => { update((s) => ({ ...s, workflows: s.workflows.filter((x) => x.id !== wf.id) })); setSelId(null); }} className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>

              <div className="mx-auto mt-6 flex max-w-md flex-col items-center">
                {/* Trigger */}
                <div className="w-full rounded-2xl border-2 bg-white p-4 shadow-sm" style={{ borderColor: TRIGGERS.find((t) => t.id === wf.trigger)?.color }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trigger</p>
                  <select value={wf.trigger} onChange={(e) => save({ ...wf, trigger: e.target.value })} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none">
                    {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
                  </select>
                </div>

                {wf.steps.map((st, i) => {
                  const k = STEP_KINDS.find((x) => x.kind === st.kind)!;
                  const isActive = activeStep === st.id;
                  return (
                    <div key={st.id} className="flex w-full flex-col items-center">
                      <div className="h-6 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200" />
                      <div className={`w-full rounded-2xl border-2 bg-white p-4 shadow-sm transition ${isActive ? "pulse-ring scale-[1.02]" : ""}`} style={{ borderColor: k.color }}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl text-lg" style={{ background: k.color + "22" }}>{k.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{i + 1}. {k.name}</p>
                            <p className="text-[11px] text-gray-400">{k.desc}</p>
                          </div>
                          <button onClick={() => move(i, -1)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><ArrowUp size={14} /></button>
                          <button onClick={() => move(i, 1)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><ArrowDown size={14} /></button>
                          <button onClick={() => save({ ...wf, steps: wf.steps.filter((x) => x.id !== st.id) })} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"><X size={14} /></button>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {k.fields.map((f) =>
                            f.options ? (
                              <select key={f.key} value={st.config[f.key] ?? ""} onChange={(e) => save({ ...wf, steps: wf.steps.map((x) => (x.id === st.id ? { ...x, config: { ...x.config, [f.key]: e.target.value } } : x)) })} className="w-full rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-xs outline-none">
                                <option value="">{f.label}…</option>
                                {f.options.map((o) => <option key={o}>{o}</option>)}
                              </select>
                            ) : (
                              <input key={f.key} value={st.config[f.key] ?? ""} placeholder={`${f.label}: ${f.placeholder ?? ""}`} onChange={(e) => save({ ...wf, steps: wf.steps.map((x) => (x.id === st.id ? { ...x, config: { ...x.config, [f.key]: e.target.value } } : x)) })} className="w-full rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-xs outline-none focus:bg-white" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="h-6 w-0.5 bg-gray-200" />
                <div className="rounded-full border-2 border-dashed border-gray-300 bg-white px-4 py-1.5 text-xs text-gray-400">+ add a step from the palette →</div>
              </div>

              {log.length > 0 && (
                <div className="mt-6 rounded-2xl bg-gray-900 p-4 font-mono text-xs text-green-300 shadow-inner">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-gray-500">Run log</p>
                  {log.map((l, i) => (
                    <p key={i} className={`animate-pop ${l.status === "running" ? "text-yellow-300" : l.status === "waiting" ? "text-orange-300" : ""}`}>
                      {l.status === "running" ? "⏳ " : l.status === "waiting" ? "⏸ " : "✔ "}{l.text}
                    </p>
                  ))}
                  {pendingApproval && (
                    <div className="mt-3 flex gap-2 font-sans">
                      <button onClick={() => pendingApproval(true)} className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-white">✅ Approve</button>
                      <button onClick={() => pendingApproval(false)} className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white">⛔ Reject</button>
                      <span className="self-center text-gray-400">You are playing the approver</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Palette */}
        <div className="space-y-4">
          <Card className="p-3">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Step palette</p>
            <div className="space-y-1.5">
              {STEP_KINDS.map((k) => (
                <button key={k.kind} disabled={!wf} onClick={() => addStep(k.kind)} className="flex w-full items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-left text-sm transition hover:-translate-x-0.5 hover:shadow disabled:opacity-40" style={{ borderLeft: `4px solid ${k.color}` }}>
                  <span className="text-lg">{k.emoji}</span>
                  <span className="flex-1 font-medium text-gray-700">{k.name}</span>
                  <Plus size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          </Card>
          <TipBox title="Patterns to practise">
            <ul className="space-y-1">
              <li>📊 <b>Digest:</b> schedule → search → summarize → email</li>
              <li>🎫 <b>Triage:</b> Jira → classify → if/else → post</li>
              <li>🚚 <b>Escalation:</b> email → summarize → <b>approval</b> → Jira</li>
            </ul>
          </TipBox>
        </div>
      </div>
    </div>
  );
}
