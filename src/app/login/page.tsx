"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const { error: authError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    if (authError) setError(authError.message); else setSent(true);
  }
  return <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6"><h1 className="mb-3 text-3xl font-normal">Focus</h1><p className="muted mb-9 leading-relaxed">Ein klarer nächster Schritt.</p>{sent ? <p className="surface rounded-xl p-4 text-sm">Link gesendet. Öffne deine E-Mail.</p> : <form onSubmit={submit} className="space-y-4"><label className="sr-only" htmlFor="email">E-Mail</label><input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail-Adresse" className="focus-ring w-full rounded-xl border border-[#3b4048] bg-transparent px-4 py-3 outline-none" /><button className="focus-ring accent-bg w-full rounded-xl py-3 font-medium">Magic Link senden</button>{error && <p className="text-sm text-[#e5b9b9]">{error}</p>}</form>}</main>;
}
