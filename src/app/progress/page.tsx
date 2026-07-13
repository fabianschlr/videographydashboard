import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ProgressClient } from "@/components/ProgressClient";

const types = ["erste_mail", "erste_antwort", "erstes_telefonat", "erstes_angebot", "erster_kunde", "umsatz_500", "umsatz_1000", "umsatz_5000"];
export default async function ProgressPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const start = new Date(); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0);
  const [{ data: saved }, { data: sessions }] = await Promise.all([
    supabase.from("milestones").select("id,type,achieved_at,note").eq("user_id", user.id).order("achieved_at"),
    supabase.from("sessions").select("completed,fail_reason").eq("user_id", user.id).gte("started_at", start.toISOString()),
  ]);
  const milestones = [...types.map((type) => saved?.find((item) => item.type === type) ?? { id: `pending-${type}`, type, achieved_at: null, note: null }), ...(saved ?? []).filter((item) => item.type === "custom")];
  const complete = sessions?.filter((s) => s.completed).length ?? 0;
  const failures = sessions?.filter((s) => !s.completed && s.fail_reason).map((s) => s.fail_reason) ?? [];
  const common = failures.sort((a, b) => failures.filter((x) => x === b).length - failures.filter((x) => x === a).length)[0];
  const summary = `Diese Woche: ${complete} von ${sessions?.length ?? 0} Sessions abgeschlossen.${common ? ` Häufigster Grund fürs Nicht-Schaffen: ${common}.` : ""}`;
  return <ProgressClient userId={user.id} milestones={milestones} summary={summary} />;
}
