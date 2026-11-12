"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Bot, BookOpen, FlaskConical, GraduationCap, Home, Menu, MessageSquarePlus, NotebookPen, Plug, Search, Shield, Workflow, X, Telescope, Trophy } from "lucide-react";
import { levelFor, useStore } from "@/lib/store";
import { Confetti, Progress, Sparkle } from "./ui";

const NAV = [
  { href: "/", label: "Home", icon: Home, color: "#4285f4" },
  { href: "/chat", label: "Chat", icon: MessageSquarePlus, color: "#9b72cb" },
  { href: "/agents", label: "Agents", icon: Bot, color: "#d96570" },
  { href: "/notebook", label: "NotebookLM", icon: NotebookPen, color: "#34a853" },
  { href: "/research", label: "Deep Research", icon: Telescope, color: "#00a1e0" },
  { href: "/workflows", label: "Workflows", icon: Workflow, color: "#ff7a1a" },
  { href: "/connectors", label: "Connectors", icon: Plug, color: "#f9ab00" },
  { href: "/admin", label: "Admin console", icon: Shield, color: "#1fa463" },
];
const ACADEMY = [
  { href: "/learn", label: "Learn", icon: BookOpen, color: "#4285f4" },
  { href: "/labs", label: "Hands-on labs", icon: FlaskConical, color: "#d96570" },
  { href: "/progress", label: "My progress", icon: Trophy, color: "#f9ab00" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { state, toasts, confetti, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const lv = levelFor(state.xp);
  const recentAgents = state.agents.slice(-3).reverse();

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  const NavItem = ({ n }: { n: (typeof NAV)[number] }) => {
    const Icon = n.icon;
    const active = isActive(n.href);
    return (
      <Link href={n.href} onClick={() => setOpen(false)} className={`group flex items-center gap-3 rounded-full px-3 py-2 text-sm transition ${active ? "bg-white font-semibold text-gray-900 shadow-sm" : "text-gray-600 hover:bg-white/70"}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-full transition group-hover:scale-110" style={{ background: n.color + (active ? "" : "22"), color: active ? "white" : n.color }}>
          <Icon size={15} />
        </span>
        {n.label}
      </Link>
    );
  };

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-[#eef3fe] via-[#f5effc] to-[#fdf0f3] p-3 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2 py-2">
          <Link href="/" className="flex items-center gap-2">
            <Sparkle size={26} />
            <div className="leading-tight">
              <div className="font-bold text-gray-900">Gemini <span className="gem-text">Enterprise</span></div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-purple-500">Training sandbox</div>
            </div>
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>

        <Link href="/chat?new=1" onClick={() => setOpen(false)} className="gem-bg mt-3 flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90">
          <MessageSquarePlus size={16} /> New chat
        </Link>

        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => <NavItem key={n.href} n={n} />)}
          {recentAgents.length > 0 && (
            <div className="pt-3">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Your agents</p>
              {recentAgents.map((a) => (
                <Link key={a.id} href={`/chat?agent=${a.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2 truncate rounded-full px-3 py-1.5 text-sm text-gray-600 hover:bg-white/70">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs" style={{ background: a.color + "33" }}>{a.emoji}</span>
                  <span className="truncate">{a.name}</span>
                </Link>
              ))}
            </div>
          )}
          <div className="pt-3">
            <p className="flex items-center gap-1 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400"><GraduationCap size={12} /> Academy</p>
            {ACADEMY.map((n) => <NavItem key={n.href} n={n} />)}
          </div>
        </nav>

        <Link href="/progress" className="mt-2 rounded-2xl bg-white/80 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">{lv.emoji} {lv.name}</span>
            <span className="font-bold text-purple-600">{ready ? state.xp : 0} XP</span>
          </div>
          <div className="mt-2"><Progress pct={lv.pct} h={6} /></div>
          <p className="mt-1 text-[10px] text-gray-400">{lv.next ? `${lv.next.min - state.xp} XP to ${lv.next.name}` : "Max level reached!"}</p>
        </Link>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
          <div className="blob absolute -top-24 right-10 h-72 w-72 rounded-full bg-blue-200/40" />
          <div className="blob absolute top-1/2 -left-20 h-72 w-72 rounded-full bg-pink-200/40" style={{ animationDelay: "-6s" }} />
          <div className="blob absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-yellow-100/50" style={{ animationDelay: "-12s" }} />
        </div>

        <header className="relative z-10 flex items-center gap-3 border-b border-white/60 bg-white/60 px-4 py-2.5 backdrop-blur">
          <button className="md:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/chat?q=${encodeURIComponent(q)}`);
              setQ("");
            }}
            className="flex max-w-xl flex-1 items-center gap-2 rounded-full bg-gray-100/80 px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-200"
          >
            <Search size={16} className="text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Nimbus Outfitters data…" className="w-full bg-transparent text-sm outline-none" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 sm:inline">🔥 {state.streakDays.length || 1}-day streak</span>
            <span className="hidden rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 sm:inline">⚡ {ready ? state.xp : 0} XP</span>
            <div className="gem-bg flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">{state.name.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="animate-pop flex items-center gap-2 rounded-2xl bg-gray-900/90 px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur">
            <span className="text-lg">{t.emoji}</span> {t.text}
          </div>
        ))}
      </div>
      <Confetti trigger={confetti} />
    </div>
  );
}
