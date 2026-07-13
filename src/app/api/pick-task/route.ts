import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const system = "Du bist kritisch, nicht nett. Du motivierst nicht künstlich. Du sagst ehrlich, wenn sich der Nutzer im Kreis dreht. Du feierst Fortschritt nur, wenn er objektiv durch Daten belegt ist. Halte Antworten kurz (max. 3–4 Sätze). Formuliere genau einen sachlichen Satz zur gewählten Aufgabe. Du darfst die Rangfolge nicht verändern.";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { task, energy, weeklyGoal } = await request.json();
  if (!task?.title) return NextResponse.json({ error: "Aufgabe fehlt." }, { status: 400 });
  let wording = `${task.title} ist jetzt der nächste Schritt.`;
  if (process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await client.messages.create({ model: "claude-3-5-haiku-latest", max_tokens: 100, system, messages: [{ role: "user", content: `Gewählte Aufgabe: ${task.title}; Dauer: ${task.estimated_minutes} Minuten; Energie: ${energy ?? "unbekannt"}; Wochenziel: ${weeklyGoal ?? "keins"}` }] });
    if (result.content[0]?.type === "text") wording = result.content[0].text;
  }
  return NextResponse.json({ taskId: task.id, accepted: true, wording });
}
