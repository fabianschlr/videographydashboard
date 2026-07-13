"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "./AppNav";
import { supabase } from "@/lib/supabase";

export function SettingsClient({ userId, initial }: { userId: string; initial: { energy_default?: string; accent_color?: string; theme?: string; working_hours_per_week?: number } }) {
  const router = useRouter();
  const [settings, setSettings] = useState({ energy_default: initial.energy_default ?? "mittel", accent_color: initial.accent_color ?? "#6f9ed8", theme: initial.theme ?? "dark", working_hours_per_week: initial.working_hours_per_week ?? 20 });
  const [notice, setNotice] = useState("");
  async function save() { await supabase.from("settings").upsert({ user_id: userId, ...settings }, { onConflict: "user_id" }); document.documentElement.dataset.theme = settings.theme; document.documentElement.style.setProperty("--accent", settings.accent_color); setNotice("Gespeichert."); }
  async function importCsv(file: File) {
    const text = await file.text(); const rows = text.trim().split(/\r?\n/); const headers = rows.shift()?.split(/[;,]/).map((v) => v.trim().toLowerCase()) ?? [];
    const index = (names: string[]) => headers.findIndex((header) => names.includes(header));
    const dateIndex = index(["datum", "date"]), startIndex = index(["start", "startzeit"]), endIndex = index(["ende", "endzeit"]), typeIndex = index(["schichttyp", "shift_type", "typ"]);
    if ([dateIndex, startIndex, endIndex, typeIndex].some((value) => value < 0)) { setNotice("CSV braucht: Datum, Start, Ende, Schichttyp."); return; }
    const shifts = rows.filter(Boolean).map((row) => { const col = row.split(/[;,]/).map((v) => v.trim()); return { user_id: userId, date: col[dateIndex], start_time: col[startIndex], end_time: col[endIndex], shift_type: col[typeIndex] }; });
    if (!shifts.length) return;
    const dates = shifts.map((s) => s.date).sort(); await supabase.from("shifts").delete().eq("user_id", userId).gte("date", dates[0]).lte("date", dates[dates.length - 1]); await supabase.from("shifts").insert(shifts);
    setNotice(`${shifts.length} Schichten importiert.`);
  }
  return <><main className="mx-auto min-h-dvh max-w-xl px-6 pb-24 pt-10 md:ml-44 md:pb-10"><h1 className="mb-9 text-3xl">Settings</h1><div className="space-y-6"><label className="block"><span className="muted mb-2 block text-sm">Theme</span><select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="focus-ring surface w-full rounded-lg p-3"><option value="dark">Dark</option><option value="light">Light</option></select></label><label className="block"><span className="muted mb-2 block text-sm">Akzentfarbe</span><input type="color" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} className="h-11 w-full bg-transparent" /></label><label className="block"><span className="muted mb-2 block text-sm">Standard-Energie</span><select value={settings.energy_default} onChange={(e) => setSettings({ ...settings, energy_default: e.target.value })} className="focus-ring surface w-full rounded-lg p-3"><option>niedrig</option><option>mittel</option><option>hoch</option></select></label><label className="block"><span className="muted mb-2 block text-sm">Wochenarbeitsstunden</span><input type="number" min="1" max="100" value={settings.working_hours_per_week} onChange={(e) => setSettings({ ...settings, working_hours_per_week: Number(e.target.value) })} className="focus-ring surface w-full rounded-lg p-3" /></label><label className="block"><span className="muted mb-2 block text-sm">Dienstplan (CSV)</span><input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} className="text-sm" /></label><button onClick={save} className="focus-ring accent-bg w-full rounded-xl py-3 font-medium">Speichern</button>{notice && <p className="muted text-sm">{notice}</p>}<button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); router.refresh(); }} className="focus-ring muted pt-4 text-sm">Logout</button></div></main><AppNav /></>;
}
