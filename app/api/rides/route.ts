import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { rider_id, pickup, destination, price } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("rides")
    .insert({ rider_id, pickup, destination, price })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message });
  return NextResponse.json({ success: true, ride: data });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const role = searchParams.get("role");

  let query = supabaseAdmin.from("rides").select("*").order("created_at", { ascending: false });

  if (role === "rider") query = query.eq("rider_id", user_id);
  if (role === "driver") query = query.eq("driver_id", user_id);
  if (role === "driver_pending") query = query.eq("status", "pending");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message });
  return NextResponse.json({ rides: data });
}

export async function PATCH(req: NextRequest) {
  const { ride_id, status, driver_id, rider_rating } = await req.json();

  const update: Record<string, unknown> = { status };
  if (driver_id) update.driver_id = driver_id;
  if (rider_rating) update.rider_rating = rider_rating;

  const { data, error } = await supabaseAdmin
    .from("rides")
    .update(update)
    .eq("id", ride_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message });
  return NextResponse.json({ success: true, ride: data });
}
