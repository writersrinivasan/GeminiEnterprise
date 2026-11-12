"use client";
import React from "react";

/** Tiny markdown-ish renderer: headings, bullets, numbered lists, tables, **bold**, _italic_, [n] citations. */
export default function RichText({ text, onCite }: { text: string; onCite?: (i: number) => void }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (s: string): React.ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|\[\d+\]|_[^_]+_)/g).map((part, idx) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      if (/^_[^_]+_$/.test(part)) return <em key={idx} className="text-gray-500">{part.slice(1, -1)}</em>;
      const m = part.match(/^\[(\d+)\]$/);
      if (m && onCite)
        return (
          <button key={idx} onClick={() => onCite(Number(m[1]) - 1)} className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 align-middle text-[11px] font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition">
            {m[1]}
          </button>
        );
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });

  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      out.push(
        <div key={key++} className="my-3 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>{rows[0]?.map((c, j) => <th key={j} className="px-3 py-2 text-left font-semibold text-gray-700">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((r, ri) => (
                <tr key={ri} className="border-t border-gray-100 odd:bg-white even:bg-gray-50/60">
                  {r.map((c, j) => <td key={j} className="px-3 py-2 text-gray-700">{inline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^#{2,3} /.test(l)) {
      const lvl = l.startsWith("### ") ? 3 : 2;
      const t = l.replace(/^#{2,3} /, "");
      out.push(lvl === 2 ? <h2 key={key++} className="mt-4 mb-2 text-lg font-bold text-gray-900">{inline(t)}</h2> : <h3 key={key++} className="mt-3 mb-1 font-semibold text-gray-900">{inline(t)}</h3>);
      i++;
      continue;
    }
    if (/^\s*- /.test(l)) {
      const items: { t: string; nested: boolean }[] = [];
      while (i < lines.length && /^\s*- /.test(lines[i])) {
        items.push({ t: lines[i].replace(/^\s*- /, ""), nested: /^\s{2,}- /.test(lines[i]) });
        i++;
      }
      out.push(
        <ul key={key++} className="my-1.5 space-y-1">
          {items.map((it, j) => (
            <li key={j} className={`flex gap-2 ${it.nested ? "ml-6" : ""}`}>
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${it.nested ? "bg-purple-300" : "bg-gradient-to-br from-blue-500 to-pink-500"}`} />
              <span>{inline(it.t)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      out.push(
        <ol key={key++} className="my-1.5 space-y-1">
          {items.map((t, j) => (
            <li key={j} className="flex gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-bold text-purple-700">{j + 1}</span>
              <span>{inline(t)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    if (l.trim() === "") {
      out.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }
    out.push(<p key={key++} className="leading-relaxed">{inline(l)}</p>);
    i++;
  }
  return <div className="text-[15px] text-gray-700">{out}</div>;
}
