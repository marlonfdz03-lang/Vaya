import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use publishable key for auth operations
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use service key for DB operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { mode, email, password, name, role } = await req.json();

  if (mode === "signup") {
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      if (authError.message.toLowerCase().includes("already")) {
        return NextResponse.json({ error: "exists" });
      }
      return NextResponse.json({ error: authError.message });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No user returned" });
    }

    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert({ id: authData.user.id, name, email, role });

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json({ error: profileError.message });
    }

    return NextResponse.json({ success: true, user: { name, email, role } });
  }

  if (mode === "signin") {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error) return NextResponse.json({ error: "invalid" });

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("name, role")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        name: profile?.name ?? email,
        email,
        role: profile?.role ?? "rider",
      },
      session: data.session,
    });
  }

  return NextResponse.json({ error: "invalid_mode" });
}
