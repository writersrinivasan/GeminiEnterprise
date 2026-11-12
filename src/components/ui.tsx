"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export function Sparkle({ size = 24, spinning = false }: { size?: number; spinning?: boolean }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={spinning ? "animate-spin-slow" : ""}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="45%" stopColor="#9b72cb" />
          <stop offset="80%" stopColor="#d96570" />
          <stop offset="100%" stopColor="#f9ab00" />
        </linearGradient>
      </defs>
      <path d="M12 0C12.6 6.4 17.6 11.4 24 12C17.6 12.6 12.6 17.6 12 24C11.4 17.6 6.4 12.6 0 12C6.4 11.4 11.4 6.4 12 0Z" fill={`url(#${id})`} />
    </svg>
  );
}

export function PageHeader({ emoji, title, subtitle, color = "#4285f4", right }: { emoji: string; title: string; subtitle?: string; color?: string; right?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg md:p-8" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc 45%, #9b72cb)` }}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-pink-300/30 blur-2xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-4xl">{emoji}</div>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-white/85">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

export function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-3xl border border-gray-100 bg-white p-5 shadow-sm ${className}`} style={style}>{children}</div>;
}

export function Progress({ pct, color = "#4285f4", h = 8 }: { pct: number; color?: string; h?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-gray-100" style={{ height: h }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: `linear-gradient(90deg, ${color}, #9b72cb, #d96570)` }} />
    </div>
  );
}

export function Ring({ pct, size = 72, label }: { pct: number; size?: number; label?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const id = React.useId().replace(/:/g, "");
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id}>
            <stop offset="0%" stopColor="#4285f4" />
            <stop offset="60%" stopColor="#9b72cb" />
            <stop offset="100%" stopColor="#d96570" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef0f6" strokeWidth={8} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#${id})`} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-gray-800">{Math.round(pct)}%</span>
        {label && <span className="text-[9px] text-gray-400">{label}</span>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-lg" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`animate-pop w-full ${width} max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TipBox({ children, title = "Learning tip" }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 text-sm text-gray-700">
      <p className="font-semibold text-orange-700">🎓 {title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const COLORS = ["#4285f4", "#ea4335", "#f9ab00", "#34a853", "#9b72cb", "#d96570", "#00a1e0", "#ff7a1a"];

export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; color: string; delay: number; dur: number; size: number; round: boolean }[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const p = Array.from({ length: 90 }, (_, i) => ({
      id: trigger * 1000 + i,
      left: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.6,
      dur: 2 + Math.random() * 1.8,
      size: 6 + Math.random() * 8,
      round: Math.random() > 0.5,
    }));
    setPieces(p);
    const t = setTimeout(() => setPieces([]), 4500);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span key={p.id} className="confetti" style={{ left: `${p.left}%`, background: p.color, width: p.size, height: p.size * (p.round ? 1 : 0.5), borderRadius: p.round ? "50%" : 2, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}
