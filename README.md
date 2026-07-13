# Focus

Persönliches Operating System, mobile-first mit Next.js 14 und Supabase.

## Lokal starten

1. `cp .env.example .env.local` und die Supabase- sowie optional Anthropic-Werte eintragen.
2. In Supabase den Inhalt von `supabase/schema.sql` im SQL Editor ausführen.
3. Unter **Authentication → URL Configuration** `http://localhost:3000/auth/callback` sowie die Vercel-URL als Redirect URLs eintragen.
4. `npm install && npm run dev`

Die Tabellen sind durch Row Level Security jeweils auf den angemeldeten Nutzer beschränkt. Ohne `ANTHROPIC_API_KEY` bleiben die zwei KI-Routen bewusst funktional, liefern aber einen neutralen Fallback.
