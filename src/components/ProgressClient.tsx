"use client";
import { useState } from "react";
import { AppNav } from "./AppNav";
import { supabase } from "@/lib/supabase";

type Milestone = { id: string; type: string; achieved_at: string | null; note: string | null };
const labels: Record<string, string> = { erste_mail: "Erste Mail", erste_antwort: "Erste Antwort", erstes_telefonat: "Erstes Telefonat", erstes_angebot: "Erstes Angebot", erster_kunde: "Erster Kunde", umsatz_500: "500 € Umsatz", umsatz_1000: "1.000 € Umsatz", umsatz_5000: "5.000 € Umsatz" };

export function ProgressClient({ userId, milestones, summary }: { userId: string; milestones: Milestone[]; summary: string }) {
  const [items, setItems] = useState(milestones);
  const [custom, setCustom] = useState("");
  async function toggle(item: Milestone) {
    const achieved_at = item.achieved_at ? null : new Date().toISOString();
    if (item.id.startsWith("pending-")) {
      const { data } = await supabase.from("milestones").insert({ user_id: userId, type: item.type, achieved_at }).select().single();
      if (data) setItems((all) => all.map((value) => value.id === item.id ? data : value));
    } else {
      await supabase.from("milestones").update({ achieved_at }).eq("id", item.id);
      setItems((all) => all.map((value) => value.id === item.id ? { ...value, achieved_at } : value));
    }
  }
  async function add(event: React.FormEvent) {
    event.preventDefault(); if (!custom.trim()) return;
    const { data } = await supabase.from("milestones").insert({ user_id: userId, type: "custom", note: custom.trim() }).select().single();
    if (data) setItems((all) => [...all, data]); setCustom("");
  }
  return <><main className="mx-auto min-h-dvh max-w-xl px-6 pb-24 pt-10 md:ml-44 md:pb-10"><h1 className="mb-4 text-3xl">Progress</h1><p className="surface mb-10 rounded-xl p-4 text-sm leading-relaxed">{summary}</p><ol className="border-l border-[#3b4048] pl-6">{items.map((item) => <li key={item.id} className="relative mb-7"><button onClick={() => toggle(item)} aria-label={`${item.note ?? labels[item.type]} markieren`} className={`focus-ring absolute -left-[34px] top-1 h-4 w-4 rounded-full border ${item.achieved_at ? "border-transparent accent-bg" : "border-[#69717d] bg-[#101113]"}`} /><button onClick={() => toggle(item)} className={`focus-ring text-left text-lg ${item.achieved_at ? "" : "muted"}`}>{item.note ?? labels[item.type] ?? item.type}</button>{item.achieved_at && <p className="muted mt-1 text-sm">{new Date(item.achieved_at).toLocaleDateString("de-DE")}</p>}</li>)}</ol><form onSubmit={add} className="mt-6 flex gap-2"><input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Eigener Meilenstein" className="focus-ring min-w-0 flex-1 border-b border-[#3b4048] bg-transparent px-1 py-2 outline-none" /><button className="focus-ring accent px-2 text-sm">Hinzufügen</button></form></main><AppNav /></>;
}
