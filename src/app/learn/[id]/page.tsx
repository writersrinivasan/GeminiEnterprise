"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import RichText from "@/components/RichText";
import { Card } from "@/components/ui";
import { MODULES } from "@/lib/learn";
import { useStore } from "@/lib/store";

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const { state, update, track, toast, celebrate } = useStore();
  const idx = MODULES.findIndex((m) => m.id === id);
  const m = MODULES[idx];
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(m ? m.quiz.map(() => null) : []);
    setSubmitted(false);
  }, [id]);

  if (!m) return <div className="p-10">Module not found. <Link href="/learn" className="text-blue-600">Back</Link></div>;
  const next = MODULES[idx + 1];
  const isDone = state.lessonsDone.includes(m.id);
  const score = answers.filter((a, i) => a === m.quiz[i].answer).length;

  const complete = () => {
    if (isDone) return;
    update((s) => ({ ...s, lessonsDone: [...s.lessonsDone, m.id] }));
    track(`lesson_${m.id}`, 25, `Completed “${m.title}”`);
  };

  const submit = () => {
    if (answers.some((a) => a === null)) return toast("Answer all questions first", "✋");
    setSubmitted(true);
    const best = Math.max(score, state.quizScores[m.id] ?? 0);
    update((s) => ({ ...s, quizScores: { ...s.quizScores, [m.id]: best } }));
    track(`quiz_${m.id}`, score * 10, `Quiz ${score}/3`);
    if (score === 3) celebrate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={16} /> All modules</Link>

      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${m.color}, #9b72cb)` }}>
        <div className="absolute -right-8 -top-8 text-[140px] opacity-20">{m.emoji}</div>
        <p className="text-sm font-semibold text-white/80">Module {idx + 1} of {MODULES.length} · ⏱ {m.minutes} min</p>
        <h1 className="mt-2 text-3xl font-bold">{m.emoji} {m.title}</h1>
        <p className="mt-2 text-white/90">{m.summary}</p>
      </div>

      {m.sections.map((s, i) => (
        <Card key={i} className="animate-pop" style={{ borderLeft: `5px solid ${m.color}` }}>
          <h2 className="mb-2 text-lg font-bold text-gray-900">{s.h}</h2>
          <RichText text={s.body} />
        </Card>
      ))}

      <Link href={m.tryIt.href} className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 p-5 shadow-sm transition hover:shadow-md">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">🧪 Try it in the sandbox</p>
          <p className="mt-1 font-semibold text-gray-900">{m.tryIt.label}</p>
        </div>
        <ArrowRight className="text-orange-600" />
      </Link>

      <Card>
        <h2 className="text-lg font-bold text-gray-900">📝 Quick quiz</h2>
        <div className="mt-4 space-y-5">
          {m.quiz.map((q, qi) => (
            <div key={qi}>
              <p className="font-semibold text-gray-800">{qi + 1}. {q.q}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.options.map((o, oi) => {
                  const picked = answers[qi] === oi;
                  const correct = q.answer === oi;
                  let cls = "border-gray-100 hover:border-purple-200";
                  if (!submitted && picked) cls = "border-purple-400 bg-purple-50";
                  if (submitted && correct) cls = "border-green-400 bg-green-50";
                  if (submitted && picked && !correct) cls = "border-red-300 bg-red-50";
                  return (
                    <button key={oi} disabled={submitted} onClick={() => setAnswers((a) => a.map((x, j) => (j === qi ? oi : x)))} className={`rounded-2xl border-2 px-4 py-2.5 text-left text-sm transition ${cls}`}>
                      {o} {submitted && correct && "✅"} {submitted && picked && !correct && "❌"}
                    </button>
                  );
                })}
              </div>
              {submitted && <p className="mt-2 text-sm text-gray-500">💡 {q.why}</p>}
            </div>
          ))}
        </div>
        {!submitted ? (
          <button onClick={submit} className="gem-bg mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow">Check answers</button>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${score === 3 ? "bg-green-100 text-green-700" : score === 2 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
              {score === 3 ? "🏆 Perfect!" : score === 2 ? "👍 Passed" : "🔁 Try again"} {score}/3
            </span>
            <button onClick={() => { setSubmitted(false); setAnswers(m.quiz.map(() => null)); }} className="rounded-full px-4 py-2 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">Retake</button>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <button onClick={complete} disabled={isDone} className={`rounded-full px-6 py-2.5 text-sm font-semibold shadow ${isDone ? "bg-green-100 text-green-700" : "bg-green-500 text-white hover:bg-green-600"}`}>
          {isDone ? "✅ Module completed" : "Mark module complete (+25 XP)"}
        </button>
        {next && <Link href={`/learn/${next.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50">Next: {next.emoji} {next.title} <ArrowRight size={15} /></Link>}
      </div>
    </div>
  );
}
