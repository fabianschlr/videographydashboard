"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SetupClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [energy, setEnergy] = useState("mittel");
  const [hours, setHours] = useState(20);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await supabase.from("settings").upsert({ user_id: userId, energy_default: energy, working_hours_per_week: hours });
    await supabase.auth.updateUser({ data: { name } });
    router.refresh();
  }
  return <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6"><h1 className="mb-2 text-3xl">Einrichten</h1><p className="muted mb-8">Nur die Eckdaten.</p><form onSubmit={submit} className="space-y-5"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="focus-ring surface w-full rounded-xl p-3 outline-none" /><label className="block"><span className="muted mb-2 block text-sm">Standard-Energie</span><select value={energy} onChange={(e) => setEnergy(e.target.value)} className="focus-ring surface w-full rounded-xl p-3"><option>niedrig</option><option>mittel</option><option>hoch</option></select></label><label className="block"><span className="muted mb-2 block text-sm">Wochenarbeitsstunden</span><input type="number" min="1" max="100" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="focus-ring surface w-full rounded-xl p-3" /></label><button className="focus-ring accent-bg w-full rounded-xl py-3 font-medium">Weiter</button></form></main>;
}
