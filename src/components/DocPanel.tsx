"use client";
import { X } from "lucide-react";
import { SOURCES } from "@/lib/data";
import type { Doc } from "@/lib/types";
import RichText from "./RichText";

export default function DocPanel({ doc, onClose }: { doc: Doc | null; onClose: () => void }) {
  if (!doc) return null;
  const s = SOURCES[doc.source];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <aside onClick={(e) => e.stopPropagation()} className="animate-slide-in h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <div className="h-2" style={{ background: s.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: s.color + "18", color: s.color }}>
              <span>{s.emoji}</span> {s.name} · {doc.type}
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100"><X size={18} /></button>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{doc.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{doc.author} · Updated {doc.updated}</p>
          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm italic text-gray-600">“{doc.snippet}”</p>
          </div>
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Content (simulated)</h3>
            <RichText text={doc.points.map((p) => "- " + p).join("\n")} />
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 text-sm text-gray-700">
            <p className="font-semibold">🎓 Why citations matter</p>
            <p className="mt-1">Gemini Enterprise links every grounded claim to its source so you can verify it. Always check numbers and dates before sharing an AI answer.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
