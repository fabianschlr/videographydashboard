import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const system = "Du bist kritisch, nicht nett. Du motivierst nicht künstlich. Du sagst ehrlich, wenn sich der Nutzer im Kreis dreht. Du feierst Fortschritt nur, wenn er objektiv durch Daten belegt ist. Halte Antworten kurz (max. 3–4 Sätze).";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { answers, coachContext } = await request.json();
  let analysis = "Kein KI-Key eingerichtet. Halte fest, was konkret nächste Woche anders läuft.";
  let summary = Object.values(answers as Record<string, string>).join(" ").slice(0, 900);
  if (process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await client.messages.create({ model: "claude-3-5-haiku-latest", max_tokens: 350, system, messages: [{ role: "user", content: `Bisheriger Kontext: ${coachContext || "keiner"}\nWochenreview: ${JSON.stringify(answers)}\nAnalysiere kurz. Ergänze am Schluss eine Kontext-Zusammenfassung unter 200 Wörtern, eingeleitet mit KONTEXT:` }] });
    const text = result.content[0]?.type === "text" ? result.content[0].text : analysis;
    const [visible, context] = text.split("KONTEXT:");
    analysis = visible.trim(); summary = (context ?? visible).trim().slice(0, 1200);
  }
  const week = new Date(); week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  await supabase.from("weekly_reviews").insert({ user_id: user.id, week_start_date: week.toISOString().slice(0, 10), answers, ai_analysis: analysis });
  await supabase.from("coach_context").upsert({ user_id: user.id, summary_text: summary, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return NextResponse.json({ analysis });
}
