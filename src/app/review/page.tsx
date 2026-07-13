import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ReviewClient } from "@/components/ReviewClient";

export default async function ReviewPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("coach_context").select("summary_text").eq("user_id", user.id).maybeSingle();
  return <ReviewClient previousContext={data?.summary_text ?? ""} />;
}
