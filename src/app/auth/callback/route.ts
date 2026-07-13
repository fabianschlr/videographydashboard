import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

type Cookie = { name: string; value: string; options: Record<string, unknown> };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const response = NextResponse.redirect(new URL("/today", url.origin));
  if (!code) return response;
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    cookies: {
      getAll: () => [],
      setAll: (cookies: Cookie[]) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
