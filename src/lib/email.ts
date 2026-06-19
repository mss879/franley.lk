import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || "re_dummy_for_build_time");
  }
  return resendInstance;
}

interface EmailItem {
  id: string;
  name: string;
  color: string;
  quantity: number;
  price: string;
}

interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  shippingAddress: string;
  items: EmailItem[];
  totalAmount: number;
  paymentMethod: string;
}

// Reusable premium HTML email generator (without logo)
function generateOrderEmailHtml({
  orderId,
  customerName,
  customerEmail,
  phoneNumber,
  shippingAddress,
  items,
  totalAmount,
  paymentMethod,
  bannerTitle,
  bannerSubtitle,
  bodyIntro,
  orderStatusLabel,
}: OrderEmailPayload & {
  bannerTitle: string;
  bannerSubtitle: string;
  bodyIntro: string;
  orderStatusLabel: string;
}) {
  const formatPrice = (amount: number) => {
    return `Rs. ${Math.round(amount).toLocaleString()}`;
  };

  const formatItemPrice = (priceVal: any) => {
    if (typeof priceVal === "string") {
      if (priceVal.startsWith("$")) {
        const num = parseFloat(priceVal.replace(/[^0-9.]/g, "")) || 0;
        return `Rs. ${Math.round(num).toLocaleString()}`;
      }
      return priceVal;
    }
    return `Rs. ${Math.round(priceVal || 0).toLocaleString()}`;
  };

  const cleanPaymentMethod = (method: string) => {
    switch (method) {
      case "cash_on_delivery":
        return "Cash on Delivery";
      case "card_payment":
        return "Card Payment (Online)";
      default:
        return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 16px 0; text-align: left;">
        <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${item.name}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Color: ${item.color}</div>
      </td>
      <td style="padding: 16px 0; text-align: center; color: #475569; font-size: 14px; font-weight: 600;">
        ${item.quantity}
      </td>
      <td style="padding: 16px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;">
        ${formatItemPrice(item.price)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${bannerTitle} - Franley</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #f8fafc;
          padding: 40px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <div class="container">
          <!-- Header Banner -->
          <div style="background: #7b0323; background: linear-gradient(135deg, #7b0323 0%, #5e021a 50%, #1a1a1a 100%); padding: 48px 32px; text-align: center;">
            <div style="font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 24px;">
              FRANLEY
            </div>
            <div style="font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; text-transform: uppercase;">
              ${bannerTitle}
            </div>
            <p style="color: #d4af37; font-size: 13px; font-weight: 600; margin: 8px 0 0 0; letter-spacing: 0.15em; text-transform: uppercase;">
              ${bannerSubtitle}
            </p>
          </div>

          <!-- Order Summary Body -->
          <div style="padding: 32px 32px 24px 32px; text-align: left;">
            <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; font-weight: 500; line-height: 1.6;">
              Hi ${customerName},<br>
              ${bodyIntro}
            </p>

            <!-- Order Badge -->
            <div style="background-color: #fcf8f2; border: 1px dashed #d4af37/30; border-radius: 16px; padding: 14px 20px; display: inline-block; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: 700; color: #7b0323; letter-spacing: 0.05em; text-transform: uppercase;">Order Reference</span>
              <div style="font-size: 16px; font-weight: 800; color: #7b0323; margin-top: 2px; letter-spacing: 0.02em;">${orderId}</div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; margin-top: 10px;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0;">
                  <th style="text-align: left; padding-bottom: 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Product Details</th>
                  <th style="text-align: center; padding-bottom: 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
                  <th style="text-align: right; padding-bottom: 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Pricing Summary -->
            <table style="width: 100%; margin-top: 16px; border-top: 2px solid #e2e8f0; padding-top: 16px;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 500;">Subtotal</td>
                <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #334155; font-weight: 600;">${formatPrice(totalAmount)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 500;">Shipping</td>
                <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">FREE</td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0 0; font-size: 16px; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em;">Total Amount</td>
                <td style="padding: 16px 0 0 0; text-align: right; font-size: 18px; color: #7b0323; font-weight: 800;">${formatPrice(totalAmount)}</td>
              </tr>
            </table>
          </div>

          <!-- Divider -->
          <div style="height: 1px; background-color: #f1f5f9; margin: 0 32px;"></div>

          <!-- Checkout Details Section -->
          <div style="padding: 24px 32px 32px 32px; text-align: left; background-color: #fafbfd;">
            <h3 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; border-left: 3px solid #7b0323; padding-left: 8px;">
              Delivery Details
            </h3>
            
            <table style="width: 100%;">
              <tr>
                <td style="vertical-align: top; width: 50%; padding-right: 16px; padding-bottom: 16px;">
                  <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Shipping Address</div>
                  <div style="font-size: 13px; color: #334155; font-weight: 600; line-height: 1.5;">
                    ${shippingAddress.replace(/\n/g, "<br>")}
                  </div>
                </td>
                <td style="vertical-align: top; width: 50%; padding-bottom: 16px;">
                  <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Contact Info</div>
                  <div style="font-size: 13px; color: #334155; font-weight: 600; line-height: 1.5;">
                    Phone: ${phoneNumber}<br>
                    Email: ${customerEmail}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="vertical-align: top; width: 50%; padding-right: 16px;">
                  <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Payment Method</div>
                  <div style="font-size: 13px; color: #334155; font-weight: 600;">
                    ${cleanPaymentMethod(paymentMethod)}
                  </div>
                </td>
                <td style="vertical-align: top; width: 50%;">
                  <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Order Status</div>
                  <div style="font-size: 13px; color: #7b0323; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                    ${orderStatusLabel}
                  </div>
                </td>
              </tr>
            </table>

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://franley.lk/contact" style="background-color: #7b0323; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 12px rgba(123, 3, 35, 0.25);">
                Need Help? Contact Sartorial Support
              </a>
            </div>
          </div>

          <!-- Email Footer -->
          <div style="background-color: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; line-height: 1.5; text-transform: uppercase; letter-spacing: 0.08em;">
              © ${new Date().getFullYear()} FRANLEY. ALL RIGHTS RESERVED.
            </p>
            <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8; font-weight: 500; line-height: 1.5;">
              You received this email because you placed an order with Franley Storefront.
            </p>
            <div style="margin-top: 12px;">
              <a href="https://franley.lk/privacy-policy" style="color: #7b0323; text-decoration: none; font-size: 11px; font-weight: 600; margin: 0 8px;">Privacy Policy</a>
              <span style="color: #cbd5e1;">|</span>
              <a href="https://franley.lk/refund-policy" style="color: #7b0323; text-decoration: none; font-size: 11px; font-weight: 600; margin: 0 8px;">Refund Policy</a>
            </div>
          </div>
        </div>
      </center>
    </body>
    </html>
  `;
}

// 1. Order Confirmation Email
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] API key is missing. Skipping email send.");
    return { success: false, error: "Resend API Key missing" };
  }

  const emailHtml = generateOrderEmailHtml({
    ...payload,
    bannerTitle: "Order Confirmed",
    bannerSubtitle: "Thank you for your order",
    bodyIntro: "Thank you for shopping at Franley. We are excited to let you know that your order has been received and confirmed. Our team is preparing your premium menswear and luxury accessories for dispatch. Below is a detailed breakdown of your purchase.",
    orderStatusLabel: "Pending Fulfillment",
  });

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Franley Storefront <orders@franley.lk>";
    const data = await getResendClient().emails.send({
      from: fromEmail,
      to: [payload.customerEmail],
      subject: `Order Confirmed: ${payload.orderId} - Franley`,
      html: emailHtml,
    });

    console.log(`[Resend] Order confirmation email sent to ${payload.customerEmail}. Data:`, data);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend] Failed to send order confirmation email:", error);
    return { success: false, error: error?.message || error };
  }
}

// 2. Order Shipped / Out for Delivery Email
export async function sendOrderShippedEmail(payload: OrderEmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] API key is missing. Skipping email send.");
    return { success: false, error: "Resend API Key missing" };
  }

  const emailHtml = generateOrderEmailHtml({
    ...payload,
    bannerTitle: "Out for Delivery",
    bannerSubtitle: "Your order has been shipped",
    bodyIntro: "Great news! Your premium menswear and luxury accessories has been shipped and is officially out for delivery. It is on its way to elevate your workspace. Below is a summary of the shipment details.",
    orderStatusLabel: "Out for Delivery / Shipped",
  });

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Franley Storefront <orders@franley.lk>";
    const data = await getResendClient().emails.send({
      from: fromEmail,
      to: [payload.customerEmail],
      subject: `Out for Delivery: ${payload.orderId} - Franley`,
      html: emailHtml,
    });

    console.log(`[Resend] Shipped notification email sent to ${payload.customerEmail}. Data:`, data);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend] Failed to send shipped email notification:", error);
    return { success: false, error: error?.message || error };
  }
}

// 3. Order Delivered Email
export async function sendOrderDeliveredEmail(payload: OrderEmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] API key is missing. Skipping email send.");
    return { success: false, error: "Resend API Key missing" };
  }

  const emailHtml = generateOrderEmailHtml({
    ...payload,
    bannerTitle: "Order Delivered",
    bannerSubtitle: "Your style package is complete",
    bodyIntro: "Your Franley order has been successfully delivered to your shipping address. We hope your new luxury accessories elevate your style and matches your aesthetic. Thank you for shopping with us!",
    orderStatusLabel: "Delivered",
  });

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Franley Storefront <orders@franley.lk>";
    const data = await getResendClient().emails.send({
      from: fromEmail,
      to: [payload.customerEmail],
      subject: `Delivered: ${payload.orderId} - Franley`,
      html: emailHtml,
    });

    console.log(`[Resend] Delivered notification email sent to ${payload.customerEmail}. Data:`, data);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend] Failed to send delivered email notification:", error);
    return { success: false, error: error?.message || error };
  }
}
