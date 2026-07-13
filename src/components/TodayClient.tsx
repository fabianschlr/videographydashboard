"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "./AppNav";
import { supabase } from "@/lib/supabase";
import { failReasons, SessionReason, Shift, Task } from "@/lib/types";
import { rankedTasks } from "@/lib/prioritize";

export function TodayClient({ userId, tasks, shifts, energy }: { userId: string; tasks: Task[]; shifts: Shift[]; energy: string }) {
  const router = useRouter();
  const ranked = useMemo(() => rankedTasks(tasks, shifts), [tasks, shifts]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const elapsedBeforeResume = useRef(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newTask, setNewTask] = useState("");
  const [dumpOpen, setDumpOpen] = useState(false);
  const [dump, setDump] = useState("");
  const [showReasons, setShowReasons] = useState(false);
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [suggestedReasons, setSuggestedReasons] = useState(failReasons.slice(0, 3));
  const task = ranked[index];

  useEffect(() => {
    supabase.from("sessions").select("fail_reason").eq("user_id", userId).not("fail_reason", "is", null).limit(30).then(({ data }) => {
      if (!data?.length) return;
      const counts = data.reduce<Record<string, number>>((all, session) => ({ ...all, [session.fail_reason!]: (all[session.fail_reason!] ?? 0) + 1 }), {});
      const frequent = [...failReasons].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)).slice(0, 3);
      setSuggestedReasons(frequent);
    });
  }, [userId]);

  useEffect(() => {
    if (!running || paused || !startedAt) return;
    const timer = window.setInterval(() => setElapsed(elapsedBeforeResume.current + Math.floor((Date.now() - startedAt.getTime()) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [running, paused, startedAt]);

  function togglePause() {
    if (paused) {
      setStartedAt(new Date());
      setPaused(false);
      return;
    }
    if (startedAt) {
      elapsedBeforeResume.current += Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setElapsed(elapsedBeforeResume.current);
    }
    setPaused(true);
  }

  async function finish(completed: boolean, reason?: SessionReason) {
    if (!task || !startedAt || !sessionStartedAt || saving) return;
    const currentElapsed = paused ? elapsedBeforeResume.current : elapsedBeforeResume.current + Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const actual = Math.max(1, Math.round(currentElapsed / 60));
    setSaving(true); setError("");
    const { error: sessionError } = await supabase.from("sessions").insert({ user_id: userId, task_id: task.id, planned_minutes: task.estimated_minutes, actual_minutes: actual, completed, fail_reason: reason ?? null, started_at: sessionStartedAt.toISOString(), ended_at: new Date().toISOString() });
    if (sessionError) { setSaving(false); setError("Speichern fehlgeschlagen. Bitte erneut versuchen."); return; }
    if (completed) {
      const { error: taskError } = await supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", task.id);
      if (taskError) { setSaving(false); setError("Aufgabe konnte nicht abgeschlossen werden. Bitte erneut versuchen."); return; }
    }
    setSaving(false); setRunning(false); setPaused(false); setStartedAt(null); setSessionStartedAt(null); setElapsed(0); elapsedBeforeResume.current = 0; setShowReasons(false); setShowAllReasons(false); setIndex((value) => value + 1);
  }

  async function saveDump(event: React.FormEvent) {
    event.preventDefault();
    if (!dump.trim()) return;
    await supabase.from("brain_dumps").insert({ user_id: userId, content: dump.trim(), processed: false });
    setDump(""); setDumpOpen(false);
  }

  async function addTask(event: React.FormEvent) {
    event.preventDefault();
    if (!newTask.trim() || saving) return;
    setSaving(true); setError("");
    const { error: taskError } = await supabase.from("tasks").insert({ user_id: userId, title: newTask.trim(), priority_tier: "B", estimated_minutes: 25, status: "open" });
    if (taskError) { setError("Aufgabe konnte nicht gespeichert werden. Bitte erneut versuchen."); setSaving(false); return; }
    router.refresh();
  }

  if (running && task) {
    const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
    return <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <p className="mb-10 max-w-sm text-xl leading-relaxed">{task.title}</p>
      <time className="mb-14 text-6xl font-light tracking-tight tabular-nums">{time}</time>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button className="focus-ring rounded-xl border border-[#3b4048] px-5 py-4 text-sm" onClick={togglePause}>{paused ? "Fortsetzen" : "Pause"}</button>
        <button disabled={saving} className="focus-ring accent-bg rounded-xl px-5 py-4 font-medium disabled:opacity-50" onClick={() => finish(true)}>Erledigt</button>
        <button disabled={saving} className="focus-ring muted mt-3 py-2 text-sm disabled:opacity-50" onClick={() => setShowReasons(true)}>Nicht erledigt</button>
      </div>
      {showReasons && <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2">{(showAllReasons ? failReasons : suggestedReasons).map((reason) => <button disabled={saving} key={reason.id} onClick={() => finish(false, reason.id)} className="focus-ring surface rounded-full px-4 py-2 text-sm disabled:opacity-50">{reason.label}</button>)}{!showAllReasons && <button disabled={saving} onClick={() => setShowAllReasons(true)} className="focus-ring muted px-3 text-sm disabled:opacity-50">Anderer Grund</button>}<button disabled={saving} onClick={() => finish(false)} className="focus-ring muted px-3 text-sm disabled:opacity-50">Später eintragen</button></div>}
      {error && <p className="mt-5 text-sm text-[#e5b9b9]">{error}</p>}
    </main>;
  }

  return <><main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 pb-24 pt-10 md:ml-44 md:justify-center md:pb-10">
    <button aria-label="Gedanken notieren" onClick={() => setDumpOpen((open) => !open)} className="focus-ring absolute right-6 top-6 muted rounded p-2 text-xl">+</button>
    {dumpOpen && <form onSubmit={saveDump} className="absolute left-6 right-14 top-5"><input autoFocus value={dump} onChange={(e) => setDump(e.target.value)} placeholder="Gedanke ablegen …" className="focus-ring w-full border-b border-[#3b4048] bg-transparent px-2 py-2 text-sm outline-none" /></form>}
    {task ? <section>
      <p className="muted mb-5 text-sm">{energy ? `Energie: ${energy}` : "Eine Sache."}</p>
      <h1 className="mb-5 text-3xl font-normal leading-snug">{task.title}</h1>
      <p className="muted mb-10 text-base">{task.estimated_minutes} Minuten</p>
      <button onClick={() => { const now = new Date(); elapsedBeforeResume.current = 0; setElapsed(0); setPaused(false); setSessionStartedAt(now); setStartedAt(now); setRunning(true); }} className="focus-ring accent-bg w-full rounded-xl py-4 text-sm font-semibold tracking-[0.12em]">START</button>
    </section> : <form onSubmit={addTask} className="space-y-4"><p className="muted text-lg">Was ist der nächste Schritt?</p><input required autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Eine konkrete Aufgabe" className="focus-ring w-full border-b border-[#3b4048] bg-transparent py-3 outline-none" /><button disabled={saving} className="focus-ring accent-bg w-full rounded-xl py-4 text-sm font-semibold tracking-[0.12em] disabled:opacity-50">Für 25 Minuten anlegen</button>{error && <p className="text-sm text-[#e5b9b9]">{error}</p>}</form>}
  </main><AppNav /></>;
}
