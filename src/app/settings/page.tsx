import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("settings").select("energy_default,accent_color,theme,working_hours_per_week").eq("user_id", user.id).maybeSingle();
  return <SettingsClient userId={user.id} initial={data ?? {}} />;
}
