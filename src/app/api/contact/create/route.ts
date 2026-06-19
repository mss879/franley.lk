import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, reason, message } = body;
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim();
    const cleanMessage = (message || "").trim();

    // Validate fields
    if (!cleanName || !cleanEmail || !reason || !cleanMessage) {
      return NextResponse.json(
        { error: "Missing required contact details" },
        { status: 400 }
      );
    }

    // Email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Name check: minimum 2 letters, spaces/hyphens allowed, no numbers
    const nameRegex = /^[a-zA-Z\s\-]{2,}$/;
    if (!nameRegex.test(cleanName)) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long and contain only letters" },
        { status: 400 }
      );
    }

    // Message check: minimum 10 characters
    if (cleanMessage.length < 10) {
      return NextResponse.json(
        { error: "Message content must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const validReasons = ["general_inquiries", "product_inquiries", "shipping_inquiries"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid inquiry reason option chosen" },
        { status: 400 }
      );
    }

    let inquiryId = "";

    if (supabase) {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .insert({
          name: cleanName,
          email: cleanEmail,
          reason,
          message: cleanMessage,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase insert inquiry error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      inquiryId = data?.id || "";
    } else {
      inquiryId = `MOCK-INQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      console.log(`[Offline Mode] Simulated Contact Submission from ${cleanName} (${cleanEmail})`);
    }

    return NextResponse.json({ success: true, inquiryId });
  } catch (error: any) {
    console.error("Error in contact inquiry API route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
