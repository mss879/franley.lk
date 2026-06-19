import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, referrer } = body;

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    // Capture headers
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // Capture country from hosting environment headers (e.g. Vercel, Netlify)
    const country = request.headers.get("x-vercel-ip-country") || 
                    request.headers.get("cf-ipcountry") || 
                    "United States"; // Default fallback for seed aesthetic

    // Insert visit log to Supabase if configured
    if (supabase) {
      const { error } = await supabase
        .from("analytics_visits")
        .insert({
          path,
          referrer: referrer || "direct",
          user_agent: userAgent,
          ip,
          country,
        });

      if (error) {
        console.error("Failed to insert analytics row:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // In offline/unconfigured mode, print to console for debugging
      console.log(`[Offline Analytics Log] Visit tracked: ${path} (Referrer: ${referrer || "direct"})`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in analytics tracking route:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
