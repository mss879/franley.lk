import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { 
  sendOrderShippedEmail, 
  sendOrderDeliveredEmail 
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing required orderId or status" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // Prioritize service role key to bypass RLS, fallback to public anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const authHeader = request.headers.get("Authorization");

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize server-side client with authorization headers if present
    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
      auth: {
        persistSession: false,
      }
    });

    // Validate Authorization token
    let isAdmin = false;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
        if (!authError && user && user.email === "admin@franley.lk") {
          isAdmin = true;
        }
      } catch (err) {
        console.error("Token verification exception:", err);
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access: Administrator session required" },
        { status: 401 }
      );
    }

    // 1. Fetch current order details to get customer details and items
    const { data: order, error: fetchError } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("Failed to fetch order for status update:", fetchError);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 2. Update the order status in Supabase
    const { error: updateError } = await supabaseServer
      .from("orders")
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order status in DB:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 3. Trigger corresponding email status templates
    try {
      const emailPayload = {
        orderId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        phoneNumber: order.phone_number,
        shippingAddress: order.shipping_address,
        items: order.items,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method || "cash_on_delivery",
      };

      if (status === "shipped") {
        await sendOrderShippedEmail(emailPayload);
      } else if (status === "delivered") {
        await sendOrderDeliveredEmail(emailPayload);
      }
    } catch (emailErr) {
      console.error(`Order status updated to ${status} but failed to send notification email:`, emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in update status API route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
