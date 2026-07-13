"use client";
import { useState } from "react";
import { AppNav } from "./AppNav";

const questions = [
  ["was_lief_gut", "Was lief gut?"], ["was_lief_schlecht", "Was lief schlecht?"],
  ["was_hat_aufgehalten", "Was hat dich aufgehalten?"], ["was_aendere_ich", "Was änderst du?"],
];

export function ReviewClient({ previousContext }: { previousContext: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({ zufriedenheit: "5" });
  const [analysis, setAnalysis] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    const response = await fetch("/api/weekly-analysis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, coachContext: previousContext }) });
    const data = await response.json(); setAnalysis(data.analysis ?? "Analyse konnte nicht erstellt werden."); setBusy(false);
  }
  return <><main className="mx-auto min-h-dvh max-w-xl px-6 pb-24 pt-10 md:ml-44 md:pb-10"><h1 className="mb-2 text-3xl">Review</h1><p className="muted mb-9">Kurz. Konkret. Einmal pro Woche.</p>{analysis ? <p className="surface rounded-xl p-5 leading-relaxed">{analysis}</p> : <form onSubmit={submit} className="space-y-7">{questions.map(([key, label]) => <label key={key} className="block"><span className="mb-2 block">{label}</span><textarea required rows={2} value={answers[key] ?? ""} onChange={(e) => setAnswers((all) => ({ ...all, [key]: e.target.value }))} className="focus-ring w-full resize-none rounded-xl border border-[#3b4048] bg-transparent p-3 outline-none" /></label>)}<label className="block"><span className="mb-2 block">Zufriedenheit: {answers.zufriedenheit}/10</span><input className="accent w-full" type="range" min="1" max="10" value={answers.zufriedenheit} onChange={(e) => setAnswers((all) => ({ ...all, zufriedenheit: e.target.value }))} /></label><button disabled={busy} className="focus-ring accent-bg w-full rounded-xl py-3 font-medium disabled:opacity-50">{busy ? "Wird analysiert …" : "Absenden"}</button></form>}</main><AppNav /></>;
}
