"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHeader, Progress, Ring } from "@/components/ui";
import { LABS, labProgress } from "@/lib/labs";
import { useStore } from "@/lib/store";

const LEVEL_COLOR = { Beginner: "#34a853", Intermediate: "#f9ab00", Advanced: "#ea4335" };

export default function LabsPage() {
  const { state } = useStore();
  const lp = labProgress(state);
  const firstOpen = LABS.find((l) => !l.tasks.every((t) => t.check(state)))?.id ?? LABS[0].id;
  const [open, setOpen] = useState<string | null>(firstOpen);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader emoji="🧪" title="Hands-on labs" subtitle="Missions that check themselves automatically as you use the sandbox. Finish a lab for bonus XP and confetti 🎉" color="#d96570"
        right={<div className="rounded-2xl bg-white p-2"><Ring pct={lp.pct} size={84} label={`${lp.done}/${lp.total}`} /></div>}
      />

      <div className="space-y-4">
        {LABS.map((l, i) => {
          const done = l.tasks.filter((t) => t.check(state)).length;
          const complete = done === l.tasks.length;
          const isOpen = open === l.id;
          return (
            <div key={l.id} className={`overflow-hidden rounded-3xl bg-white shadow-sm transition ${complete ? "ring-2 ring-green-300" : ""}`}>
              <button onClick={() => setOpen(isOpen ? null : l.id)} className="flex w-full items-center gap-4 p-5 text-left">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: l.color + "22" }}>{complete ? "🏆" : l.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">LAB {i + 1}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: LEVEL_COLOR[l.level] + "22", color: LEVEL_COLOR[l.level] }}>{l.level}</span>
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">+{l.xp} XP bonus</span>
                  </div>
                  <p className="mt-1 font-bold text-gray-900">{l.title}</p>
                  <p className="text-sm text-gray-500">{l.desc}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1"><Progress pct={(done / l.tasks.length) * 100} color={l.color} h={6} /></div>
                    <span className="text-xs font-semibold text-gray-500">{done}/{l.tasks.length}</span>
                  </div>
                </div>
                <ChevronDown className={`shrink-0 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="animate-pop space-y-2 border-t border-gray-50 bg-gray-50/50 p-5">
                  {l.tasks.map((t) => {
                    const ok = t.check(state);
                    return (
                      <div key={t.id} className={`flex items-center gap-3 rounded-2xl p-3 ${ok ? "bg-green-50" : "bg-white shadow-sm"}`}>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${ok ? "bg-green-500 text-white" : "border-2 border-gray-200"}`}>{ok ? "✓" : ""}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${ok ? "text-green-800 line-through decoration-green-300" : "text-gray-800"}`}>{t.label}</p>
                          {!ok && <p className="text-xs text-gray-400">💡 {t.hint}</p>}
                        </div>
                        {!ok && <Link href={t.href} className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow" style={{ background: l.color }}>Go →</Link>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
