import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customer_name, customer_email, phone_number, shipping_address, items, total_amount, payment_method } = body;
    const cleanName = (customer_name || "").trim();
    const cleanEmail = (customer_email || "").trim();
    const cleanPhone = (phone_number || "").trim();
    const cleanAddress = (shipping_address || "").trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanAddress || !items || total_amount === undefined) {
      return NextResponse.json(
        { error: "Missing required order checkout details" },
        { status: 400 }
      );
    }

    // Name check: minimum 2 letters, spaces/hyphens allowed, no numbers
    const nameRegex = /^[a-zA-Z\s\-]{2,}$/;
    if (!nameRegex.test(cleanName)) {
      return NextResponse.json(
        { error: "Customer name must be at least 2 characters long and contain only letters" },
        { status: 400 }
      );
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Phone check: standard format 7 to 15 digits
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Please provide a valid phone number (7 to 15 digits)" },
        { status: 400 }
      );
    }

    // Generate unique order reference (e.g. ORD-20260613-A7F2)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randHex = Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, "0");
    const orderId = `ORD-${dateStr}-${randHex}`;

    if (supabase) {
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: cleanName,
        customer_email: cleanEmail,
        phone_number: cleanPhone,
        shipping_address: cleanAddress,
        items,
        total_amount,
        payment_method: payment_method || "cash_on_delivery",
        status: "pending",
      });

      if (error) {
        console.error("Supabase insert order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      console.log(`[Offline Mode] Created Mock Order Reference: ${orderId}`);
    }

    // Send order confirmation email via Resend
    try {
      await sendOrderConfirmationEmail({
        orderId,
        customerName: cleanName,
        customerEmail: cleanEmail,
        phoneNumber: cleanPhone,
        shippingAddress: cleanAddress,
        items,
        totalAmount: total_amount,
        paymentMethod: payment_method || "cash_on_delivery",
      });
    } catch (emailErr) {
      console.error("Order created but failed to send confirmation email:", emailErr);
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Error in create order API route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
