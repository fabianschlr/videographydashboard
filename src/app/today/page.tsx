import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { TodayClient } from "@/components/TodayClient";
import { SetupClient } from "@/components/SetupClient";

export default async function TodayPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: tasks }, { data: shifts }, { data: settings }] = await Promise.all([
    supabase.from("tasks").select("id,title,priority_tier,deadline,estimated_minutes,status").eq("user_id", user.id),
    supabase.from("shifts").select("date,start_time,end_time").eq("user_id", user.id),
    supabase.from("settings").select("energy_default").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!settings) return <SetupClient userId={user.id} />;
  return <TodayClient userId={user.id} tasks={tasks ?? []} shifts={shifts ?? []} energy={settings?.energy_default ?? ""} />;
}
