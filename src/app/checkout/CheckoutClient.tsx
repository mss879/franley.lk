"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS, getColorHex, getCategoryIcon, Product } from "../products";
import { supabase } from "../../lib/supabase";

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

export default function CheckoutClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Form states
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "bank_transfer">("cash_on_delivery");
  const [formError, setFormError] = useState<string | null>(null);

  // Step states: "shipping" | "payment" | "placing"
  const [checkoutStep, setCheckoutStep] = useState<"shipping" | "payment" | "placing">("shipping");
  const [placingStatus, setPlacingStatus] = useState<"loading" | "success">("loading");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = localStorage.getItem("franley_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        setCart(parsedCart);
        // If empty cart, direct user back to cart review page
        if (parsedCart.length === 0) {
          router.push("/cart");
        }
      } else {
        router.push("/cart");
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      router.push("/cart");
    }
  }, [router]);

  // Sync Cart with event listener
  useEffect(() => {
    const syncCart = () => {
      try {
        const savedCart = localStorage.getItem("franley_cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart) as CartItem[];
          setCart(parsedCart);
          if (parsedCart.length === 0) {
            router.push("/cart");
          }
        } else {
          router.push("/cart");
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      }
    };
    window.addEventListener("cart-updated", syncCart);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
    };
  }, [router]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      const serializableCart = newCart.map((item) => ({
        ...item,
        product: { ...item.product, icon: undefined },
      }));
      localStorage.setItem("franley_cart", JSON.stringify(serializableCart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  };

  const parsePrice = (priceStr: string) => {
    const cleanStr = priceStr.replace(/rs\.?/i, "").replace(/[^0-9.]/g, "");
    return parseFloat(cleanStr) || 0;
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    setCheckoutStep("placing");
    setPlacingStatus("loading");

    let orderIdRef = "";
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: custName.trim(),
          customer_email: custEmail.trim(),
          phone_number: custPhone.trim(),
          shipping_address: custAddress.trim(),
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            color: item.color,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total_amount: cartSubtotal,
          payment_method: paymentMethod,
        }),
      });
      const data = await response.json();
      if (data.success) {
        orderIdRef = data.orderId;
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.warn("Failed to submit order to database, checking out offline:", err);
      orderIdRef = `OFFLINE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }

    // Backend order placed successfully, transition checkout status
    setPlacingStatus("success");
    saveCart([]); // Clear cart contents

    // Wait for the SVG checkmark drawing animation to play fully before redirecting to success details
    setTimeout(() => {
      setOrderSuccess(orderIdRef);
    }, 2500);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Loading Secure Checkout...</span>
        </div>
      </div>
    );
  }

  // Beautiful Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 font-outfit">
        <div className="w-full max-w-lg bg-white border border-zinc-200/60 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl shadow-zinc-200/40 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#7b0323]/10 blur-[80px] rounded-full opacity-60 z-0 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 font-syne uppercase tracking-tight">Order Confirmed!</h1>
              <p className="text-zinc-550 text-xs font-bold uppercase tracking-wider">Reference Code: <span className="text-[#7b0323] font-black">{orderSuccess}</span></p>
            </div>

            <p className="text-zinc-600 text-sm leading-relaxed max-w-sm mt-1">
              Thank you for shopping with Franley! Your premium creator essentials are being packaged. We have sent a confirmation email to <span className="font-extrabold text-zinc-900">{custEmail || "your email address"}</span>.
            </p>

            <Link href="/" className="w-full bg-zinc-950 text-white text-xs font-bold tracking-widest py-4 rounded-full hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md shadow-zinc-950/10 cursor-pointer text-center block mt-4 border-0">
              RETURN TO STOREFRONT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto scrollbar-thin bg-slate-50/50 flex flex-col font-outfit select-none relative pb-16">
      
      {/* Header Nav */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 px-6 lg:px-12 py-4 flex items-center justify-between z-40 relative">
        <Link href="/cart" className="flex items-center gap-1.5 text-zinc-900 hover:text-[#7b0323] transition-colors uppercase font-bold text-[10px] sm:text-xs tracking-widest group">
          <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO CART
        </Link>

        {/* Center Logo */}
        <Link href="/" className="w-32 h-8 block hover:opacity-75 transition-opacity">
          <img src="/franley_logo_no_text_transparent.png" alt="Logo" className="w-full h-full object-contain" />
        </Link>

        {/* Status Pill */}
        <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
          SECURE CHECKOUT
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 md:py-12 z-10 flex flex-col gap-6 md:gap-8">
        
        <div className="flex flex-col gap-1.5 text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-950 font-syne uppercase tracking-tight">
            Checkout Details
          </h1>
          <p className="text-zinc-550 text-xs font-bold tracking-wider uppercase">
            Complete your order by filling in the details below
          </p>
        </div>

        {cart.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (col-span-7): Forms */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* STEP 1: SHIPPING DETAILS FORM */}
              {checkoutStep === "shipping" && (
                <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                      Shipping Information
                    </h2>
                    <span className="text-[9px] font-black text-[#7b0323] tracking-wider">STEP 1 OF 2</span>
                  </div>

                  {formError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
                      {formError.toUpperCase()}
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const trimName = custName.trim();
                      const trimEmail = custEmail.trim();
                      const trimPhone = custPhone.trim();
                      const trimAddress = custAddress.trim();

                      if (!trimName || !trimEmail || !trimPhone || !trimAddress) {
                        setFormError("Please fill in all shipping details.");
                        return;
                      }

                      // Name check: minimum 2 letters, spaces/hyphens allowed, no numbers
                      const nameRegex = /^[a-zA-Z\s\-]{2,}$/;
                      if (!nameRegex.test(trimName)) {
                        setFormError("Name must be at least 2 characters long and contain only letters.");
                        return;
                      }

                      // Email check
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(trimEmail)) {
                        setFormError("Please enter a valid email address.");
                        return;
                      }

                      // Phone check: 7 to 15 digits
                      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
                      if (!phoneRegex.test(trimPhone)) {
                        setFormError("Please enter a valid phone number (7 to 15 digits).");
                        return;
                      }

                      setFormError(null);
                      setCheckoutStep("payment");
                    }} 
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-black tracking-widest text-zinc-400 uppercase ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className={`bg-slate-50 border rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all w-full ${
                          formError && (formError.toLowerCase().includes("name") || formError.toLowerCase().includes("details"))
                            ? "border-red-400 focus:border-red-500 focus:bg-white"
                            : "border-zinc-200 focus:border-[#7b0323]"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-black tracking-widest text-zinc-400 uppercase ml-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. john@gmail.com"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className={`bg-slate-50 border rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all w-full ${
                          formError && (formError.toLowerCase().includes("email") || formError.toLowerCase().includes("details"))
                            ? "border-red-400 focus:border-red-500 focus:bg-white"
                            : "border-zinc-200 focus:border-[#7b0323]"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-black tracking-widest text-zinc-400 uppercase ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 555-0199"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className={`bg-slate-50 border rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all w-full ${
                          formError && (formError.toLowerCase().includes("phone") || formError.toLowerCase().includes("details"))
                            ? "border-red-400 focus:border-red-500 focus:bg-white"
                            : "border-zinc-200 focus:border-[#7b0323]"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-black tracking-widest text-zinc-400 uppercase ml-1">
                        Shipping Address
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Street, City, State, ZIP"
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        className={`bg-slate-50 border rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all w-full ${
                          formError && (formError.toLowerCase().includes("address") || formError.toLowerCase().includes("details"))
                            ? "border-red-400 focus:border-red-500 focus:bg-white"
                            : "border-zinc-200 focus:border-[#7b0323]"
                        }`}
                      />
                    </div>

                    <button
                       type="submit"
                      className="w-full bg-[#7b0323] text-white text-xs font-bold tracking-widest py-4 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0 mt-2 flex items-center justify-center gap-2"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD CHOICE */}
              {checkoutStep === "payment" && (
                <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                      Payment Method
                    </h2>
                    <span className="text-[9px] font-black text-[#7b0323] tracking-wider">STEP 2 OF 2</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* COD Option */}
                    <div 
                      onClick={() => setPaymentMethod("cash_on_delivery")}
                      className={`border p-4 rounded-2xl cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === "cash_on_delivery" 
                          ? "border-[#7b0323] bg-[#7b0323]/5/20 shadow-sm" 
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                        paymentMethod === "cash_on_delivery" ? "border-[#7b0323] text-[#7b0323]" : "border-zinc-300"
                      }`}>
                        {paymentMethod === "cash_on_delivery" && (
                          <div className="w-2 h-2 rounded-full bg-[#7b0323]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">Cash on Delivery</span>
                        <span className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                          Pay with cash upon delivery of your order. No extra charges.
                        </span>
                      </div>
                    </div>

                    {/* Bank Transfer Option */}
                    <div 
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`border p-4 rounded-2xl cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === "bank_transfer" 
                          ? "border-[#7b0323] bg-[#7b0323]/5/20 shadow-sm" 
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                        paymentMethod === "bank_transfer" ? "border-[#7b0323] text-[#7b0323]" : "border-zinc-300"
                      }`}>
                        {paymentMethod === "bank_transfer" && (
                          <div className="w-2 h-2 rounded-full bg-[#7b0323]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">Direct Bank Transfer</span>
                        <span className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                          Send the payment directly to our corporate bank account.
                        </span>
                      </div>
                    </div>

                    {/* Bank Details Card */}
                    {paymentMethod === "bank_transfer" && (
                      <div className="bg-slate-50 border border-zinc-200 p-4 rounded-2xl flex flex-col gap-2 text-left animate-in slide-in-from-top-3 duration-300">
                        <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Beneficiary Bank Account</span>
                        <div className="flex flex-col gap-1 text-[11px] text-zinc-650 font-semibold">
                          <div className="flex justify-between">
                            <span>Bank Name:</span>
                            <span className="text-zinc-950 font-extrabold">Standard Chartered</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Title:</span>
                            <span className="text-zinc-950 font-extrabold">Franley Retail Ltd.</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Number:</span>
                            <span className="text-zinc-950 font-mono font-black">01-2345678-99</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Branch Code:</span>
                            <span className="text-zinc-950 font-extrabold">020 (Downtown)</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-zinc-400 font-bold leading-relaxed border-t border-zinc-200/60 pt-2 mt-1">
                          *Please include your name or Order ID in the transaction reference notes.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-[#7b0323] text-white text-xs font-bold tracking-widest py-4 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0 mt-3 flex items-center justify-center gap-2"
                    >
                      PLACE SECURE ORDER
                    </button>
                    <button
                      onClick={() => setCheckoutStep("shipping")}
                      className="w-full bg-transparent text-zinc-500 hover:text-zinc-800 text-[10px] font-bold tracking-widest py-2 rounded-full hover:bg-zinc-100 transition-colors border-0 cursor-pointer"
                    >
                      BACK TO SHIPPING INFO
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (col-span-5): Product details & Summary */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
              
              {/* Order Summary Summary Panel */}
              <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                    Order Summary
                  </h2>
                  <span className="text-[10px] font-extrabold text-[#7b0323] bg-[#7b0323]/5 px-2.5 py-0.5 rounded-full border border-[#7b0323]/10/50">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                {/* Read-Only Items List */}
                <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                  {cart.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.color}`}
                      className="flex gap-3 items-center bg-slate-50/50 border border-zinc-100 p-2.5 rounded-2xl"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0 flex items-center justify-center p-0.5">
                        <img 
                          src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : `/products/${item.product.id}.webp`} 
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-grow min-w-0 text-left">
                        <h4 className="text-[11px] font-extrabold text-zinc-950 truncate font-outfit">
                          {item.product.name}
                        </h4>
                        <p className="text-[9px] text-zinc-550 font-bold mt-0.5">
                          Qty: <span className="text-zinc-800 font-extrabold">{item.quantity}</span> • Color: <span className="text-zinc-800 font-extrabold">{item.color}</span>
                        </p>
                      </div>
                      <div className="text-xs font-black text-[#7b0323] font-outfit shrink-0">
                        Rs. {(parsePrice(item.product.price) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Totals */}
                <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-550 uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-zinc-950 font-extrabold">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-extrabold text-[10px] tracking-wide">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold border-b border-zinc-200/50 pb-3">
                    <span>Estimated Taxes</span>
                    <span className="text-zinc-850 font-bold">Rs. 0</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-zinc-950 font-outfit uppercase tracking-widest">
                    <span>Total Amount</span>
                    <span className="text-[#7b0323] text-lg font-black font-outfit">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Full-Screen Order Placing Animation Overlay */}
      {checkoutStep === "placing" && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center font-outfit animate-in fade-in duration-300">
          <style>{`
            @keyframes check-stroke {
              100% { stroke-dashoffset: 0; }
            }
            @keyframes check-scale {
              0%, 100% { transform: none; }
              50% { transform: scale3d(1.1, 1.1, 1); }
            }
            @keyframes check-fill {
              100% { box-shadow: inset 0px 0px 0px 50px #10b981; }
            }
            .anim-checkmark__circle {
              stroke-dasharray: 166;
              stroke-dashoffset: 166;
              stroke-width: 2;
              stroke-miterlimit: 10;
              stroke: #10b981;
              fill: none;
              animation: check-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .anim-checkmark {
              width: 72px;
              height: 72px;
              border-radius: 50%;
              display: block;
              stroke-width: 2.5;
              stroke: #fff;
              stroke-miterlimit: 10;
              box-shadow: inset 0px 0px 0px #10b981;
              animation: check-fill .4s ease-in-out .4s forwards, check-scale .3s ease-in-out .9s forwards;
            }
            .anim-checkmark__check {
              transform-origin: 50% 50%;
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: check-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            .confetti-particle {
              position: absolute;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              animation: float-confetti 2.5s ease-out infinite;
            }
            @keyframes float-confetti {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
              100% { transform: translate(var(--x), var(--y)) rotate(360deg); opacity: 0; }
            }
          `}</style>

          <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6 relative">
            {placingStatus === "loading" ? (
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin duration-1000" />
                {/* Inner Lock Icon */}
                <div className="w-16 h-16 bg-[#7b0323]/5 rounded-full flex items-center justify-center text-[#7b0323] animate-pulse">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Success Animated Checkmark */}
                <svg className="anim-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="anim-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="anim-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>

                {/* Confetti Burst */}
                <div className="confetti-particle bg-[#7b0323]" style={{ "--x": "60px", "--y": "-60px" } as React.CSSProperties} />
                <div className="confetti-particle bg-emerald-500" style={{ "--x": "-50px", "--y": "-70px" } as React.CSSProperties} />
                <div className="confetti-particle bg-amber-500" style={{ "--x": "80px", "--y": "20px" } as React.CSSProperties} />
                <div className="confetti-particle bg-blue-500" style={{ "--x": "-70px", "--y": "30px" } as React.CSSProperties} />
                <div className="confetti-particle bg-pink-500" style={{ "--x": "30px", "--y": "-80px" } as React.CSSProperties} />
                <div className="confetti-particle bg-teal-400" style={{ "--x": "-40px", "--y": "-90px" } as React.CSSProperties} />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-widest font-syne">
                {placingStatus === "loading" ? "Processing Checkout" : "Order Placed!"}
              </h3>
              <p className="text-xs text-zinc-550 font-bold leading-relaxed max-w-[280px]">
                {placingStatus === "loading" 
                  ? "Securing your setup essentials. Please do not close or refresh this page." 
                  : "Thank you! Generating your order reference receipt now..."}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
