"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { State } from "./types";
import { LABS } from "./labs";

export const LEVELS = [
  { min: 0, name: "Curious Newcomer", emoji: "🌱" },
  { min: 120, name: "Explorer", emoji: "🧭" },
  { min: 300, name: "Prompt Crafter", emoji: "✍️" },
  { min: 600, name: "Agent Builder", emoji: "🤖" },
  { min: 1000, name: "Workflow Architect", emoji: "🏗️" },
  { min: 1600, name: "Gemini Champion", emoji: "🏆" },
];

export function levelFor(xp: number) {
  let i = 0;
  LEVELS.forEach((l, idx) => {
    if (xp >= l.min) i = idx;
  });
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return { ...cur, index: i, next, pct: next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100 };
}

const KEY = "ge-sandbox-v1";

export const initialState: State = {
  name: "Learner",
  xp: 0,
  events: {},
  lessonsDone: [],
  quizScores: {},
  connectors: {
    drive: { mode: "ingested", docs: 1240, at: Date.now() },
    gmail: { mode: "ingested", docs: 8930, at: Date.now() },
  },
  agents: [],
  workflows: [],
  notebooks: [],
  audit: [],
  celebrated: [],
  licenses: { u1: "standard", u2: "none", u3: "none", u4: "none", u5: "none", u6: "none", u7: "none", u8: "none" },
  policies: { webGrounding: true, agentCreation: true, agentSharing: false, actions: true, modelArmor: false, residency: "global" },
  streakDays: [],
};

type Toast = { id: number; text: string; emoji: string };

type Ctx = {
  state: State;
  ready: boolean;
  track: (event: string, xp?: number, detail?: string) => void;
  update: (fn: (s: State) => State) => void;
  toast: (text: string, emoji?: string) => void;
  reset: () => void;
  toasts: Toast[];
  confetti: number;
  celebrate: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confetti, setConfetti] = useState(0);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...initialState, ...parsed, policies: { ...initialState.policies, ...(parsed.policies ?? {}) } });
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  // daily streak
  useEffect(() => {
    if (!ready) return;
    const today = new Date().toISOString().slice(0, 10);
    if (!state.streakDays.includes(today)) setState((s) => ({ ...s, streakDays: [...s.streakDays, today].slice(-60) }));
  }, [ready]);

  const toast = useCallback((text: string, emoji = "✨") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, text, emoji }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const track = useCallback(
    (event: string, xp = 0, detail?: string) => {
      const count = ref.current.events[event] ?? 0;
      const gain = count < 3 ? xp : 0; // XP only for the first few repeats
      setState((s) => ({
        ...s,
        xp: s.xp + gain,
        events: { ...s.events, [event]: (s.events[event] ?? 0) + 1 },
        audit: [{ t: Date.now(), event, detail: detail ?? "" }, ...s.audit].slice(0, 150),
      }));
      if (gain > 0) toast(`+${gain} XP${detail ? " · " + detail : ""}`, "⚡");
    },
    [toast]
  );

  const update = useCallback((fn: (s: State) => State) => setState(fn), []);
  const celebrate = useCallback(() => setConfetti((c) => c + 1), []);

  const reset = useCallback(() => {
    setState({ ...initialState, connectors: { ...initialState.connectors } });
    toast("Sandbox reset — fresh start!", "🔄");
  }, [toast]);

  // Lab completion celebration
  useEffect(() => {
    if (!ready) return;
    const done = LABS.filter((l) => l.tasks.every((t) => t.check(state))).map((l) => l.id);
    const fresh = done.filter((id) => !state.celebrated.includes(id));
    if (fresh.length) {
      const bonus = fresh.reduce((a, id) => a + (LABS.find((l) => l.id === id)?.xp ?? 0), 0);
      setState((s) => ({ ...s, celebrated: [...s.celebrated, ...fresh], xp: s.xp + bonus }));
      fresh.forEach((id) => {
        const l = LABS.find((x) => x.id === id);
        if (l) toast(`Lab complete: ${l.title}! +${l.xp} XP`, "🏆");
      });
      setConfetti((c) => c + 1);
    }
  }, [state, ready]);

  // Level-up celebration
  const lastLevel = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    const lv = levelFor(state.xp);
    if (lastLevel.current !== null && lv.index > lastLevel.current) {
      toast(`Level up! You're now a ${lv.name}`, lv.emoji);
      setConfetti((c) => c + 1);
    }
    lastLevel.current = lv.index;
  }, [state.xp, ready]);

  return (
    <StoreCtx.Provider value={{ state, ready, track, update, toast, reset, toasts, confetti, celebrate }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
