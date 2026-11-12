"use client";
import { useState } from "react";
import { Card, Modal, PageHeader, Progress } from "@/components/ui";
import { LABS, labProgress } from "@/lib/labs";
import { MODULES } from "@/lib/learn";
import { LEVELS, levelFor, useStore } from "@/lib/store";

export default function ProgressPage() {
  const { state, reset, update } = useStore();
  const [confirm, setConfirm] = useState(false);
  const lv = levelFor(state.xp);
  const lp = labProgress(state);
  const perfect = Object.values(state.quizScores).filter((v) => v === 3).length;

  const BADGES = [
    { emoji: "💬", name: "First Words", desc: "Send a chat message", ok: (state.events.chat_sent ?? 0) >= 1 },
    { emoji: "🔍", name: "Fact Checker", desc: "Open 3 citations", ok: (state.events.citation_opened ?? 0) >= 3 },
    { emoji: "🔌", name: "Plugged In", desc: "Connect all 8 sources", ok: Object.keys(state.connectors).length >= 8 },
    { emoji: "🔒", name: "Permission Aware", desc: "See ACLs block restricted data", ok: (state.events.acl_blocked ?? 0) >= 1 },
    { emoji: "🤖", name: "Agent Smith", desc: "Build 3 agents", ok: state.agents.length >= 3 },
    { emoji: "🚀", name: "Ship It", desc: "Publish an agent", ok: state.agents.some((a) => a.published) },
    { emoji: "✅", name: "Human in the Loop", desc: "Confirm an agent action", ok: (state.events.action_confirmed ?? 0) >= 1 },
    { emoji: "⚙️", name: "Automator", desc: "Run workflows 5 times", ok: (state.events.workflow_run ?? 0) >= 5 },
    { emoji: "⛔", name: "Safety Brake", desc: "Reject a workflow at approval", ok: (state.events.workflow_rejected ?? 0) >= 1 },
    { emoji: "🔬", name: "Researcher", desc: "Run Deep Research", ok: (state.events.research_run ?? 0) >= 1 },
    { emoji: "🎧", name: "Podcaster", desc: "Generate an audio overview", ok: (state.events.nb_audio ?? 0) >= 1 },
    { emoji: "🛡️", name: "Guardian", desc: "Enable Model Armor", ok: state.policies.modelArmor === true },
    { emoji: "🎓", name: "Scholar", desc: "Complete all modules", ok: state.lessonsDone.length >= MODULES.length },
    { emoji: "💯", name: "Quiz Whiz", desc: "3 perfect quizzes", ok: perfect >= 3 },
    { emoji: "🔥", name: "Consistent", desc: "Practise on 3 different days", ok: state.streakDays.length >= 3 },
    { emoji: "🏆", name: "Champion", desc: "Finish every lab", ok: lp.done === lp.total },
  ];
  const earned = BADGES.filter((b) => b.ok).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji={lv.emoji} title={`${state.name}, you're a ${lv.name}`} subtitle={lv.next ? `${lv.next.min - state.xp} XP until ${lv.next.emoji} ${lv.next.name}` : "You've reached the top level!"} color="#f9ab00"
        right={<div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur"><p className="text-3xl font-bold">{state.xp}</p><p className="text-xs">total XP</p></div>}
      />

      <Card>
        <p className="font-bold text-gray-900">🪜 Level ladder</p>
        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
          {LEVELS.map((l, i) => (
            <div key={l.name} className={`rounded-2xl p-3 text-center ${i <= lv.index ? "bg-gradient-to-br from-yellow-100 to-orange-100" : "bg-gray-50 opacity-50"}`}>
              <div className="text-2xl">{l.emoji}</div>
              <p className="mt-1 text-xs font-semibold text-gray-700">{l.name}</p>
              <p className="text-[10px] text-gray-400">{l.min} XP</p>
            </div>
          ))}
        </div>
        <div className="mt-4"><Progress pct={lv.pct} /></div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-gray-500">Lab tasks</p><p className="text-3xl font-bold text-pink-600">{lp.done}/{lp.total}</p></Card>
        <Card><p className="text-sm text-gray-500">Modules</p><p className="text-3xl font-bold text-blue-600">{state.lessonsDone.length}/{MODULES.length}</p></Card>
        <Card><p className="text-sm text-gray-500">Labs completed</p><p className="text-3xl font-bold text-green-600">{state.celebrated.length}/{LABS.length}</p></Card>
      </div>

      <Card>
        <p className="font-bold text-gray-900">🏅 Badges · {earned}/{BADGES.length}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => (
            <div key={b.name} className={`rounded-2xl p-4 text-center transition ${b.ok ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-sm" : "bg-gray-50"}`}>
              <div className={`text-4xl ${b.ok ? "animate-float" : "grayscale opacity-30"}`}>{b.emoji}</div>
              <p className={`mt-2 text-sm font-bold ${b.ok ? "text-gray-900" : "text-gray-400"}`}>{b.name}</p>
              <p className="text-[11px] text-gray-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-800">Your name</p>
          <input value={state.name} onChange={(e) => update((s) => ({ ...s, name: e.target.value || "Learner" }))} className="mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none" />
        </div>
        <button onClick={() => setConfirm(true)} className="rounded-full bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">🔄 Reset sandbox</button>
      </Card>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset everything?">
        <p className="text-sm text-gray-600">This clears your XP, agents, workflows, notebooks and lab progress so you can practise from scratch. Progress is stored only in this browser.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => { reset(); setConfirm(false); }} className="flex-1 rounded-full bg-red-500 py-2 text-sm font-semibold text-white">Yes, reset</button>
          <button onClick={() => setConfirm(false)} className="flex-1 rounded-full bg-gray-100 py-2 text-sm font-semibold text-gray-700">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
