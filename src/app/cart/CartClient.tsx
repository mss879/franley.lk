"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS, getColorHex, getCategoryIcon, Product } from "../products";

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

export default function CartClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    const syncCart = () => {
      try {
        const savedCart = localStorage.getItem("franley_cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      }
    };
    syncCart();
    window.addEventListener("cart-updated", syncCart);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
    };
  }, []);

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

  const updateQuantity = (productId: string, color: string, delta: number) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === productId && item.color === color
    );
    if (existingIndex > -1) {
      let newCart = [...cart];
      const newQty = newCart[existingIndex].quantity + delta;
      if (newQty <= 0) {
        newCart = newCart.filter(
          (item) => !(item.product.id === productId && item.color === color)
        );
      } else {
        newCart[existingIndex].quantity = newQty;
      }
      saveCart(newCart);
    }
  };

  const removeFromCart = (productId: string, color: string) => {
    const newCart = cart.filter(
      (item) => !(item.product.id === productId && item.color === color)
    );
    saveCart(newCart);
  };

  const parsePrice = (priceStr: string) => {
    const cleanStr = priceStr.replace(/rs\.?/i, "").replace(/[^0-9.]/g, "");
    return parseFloat(cleanStr) || 0;
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Loading Shopping Cart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto scrollbar-thin bg-slate-50/50 flex flex-col font-outfit select-none relative pb-28 md:pb-16">
      
      {/* Header Nav */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 px-6 lg:px-12 py-4 flex items-center justify-between z-40 relative">
        <Link href="/" className="flex items-center gap-1.5 text-zinc-900 hover:text-[#7b0323] transition-colors uppercase font-bold text-[10px] sm:text-xs tracking-widest group">
          <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          STOREFRONT
        </Link>

        {/* Center Logo */}
        <Link href="/" className="w-32 h-8 block hover:opacity-75 transition-opacity relative">
          <Image src="/franley_logo_no_text_transparent.png" alt="Franley Logo" fill sizes="128px" style={{ objectFit: "contain" }} />
        </Link>

        {/* Status Pill */}
        <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
          SECURE CHECKOUT
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 md:py-12 z-10 flex flex-col gap-6 md:gap-8">
        
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-950 font-syne uppercase tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-zinc-500 text-xs font-bold tracking-wider uppercase">
            Review your creative setup essentials before checkout
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="w-full bg-white border border-zinc-200/60 rounded-[2.5rem] p-12 md:p-20 text-center flex flex-col items-center gap-6 shadow-sm">
            <div className="p-6 bg-[#7b0323]/5 rounded-full text-[#7b0323]/60 border border-[#7b0323]/10/30 shadow-inner">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-extrabold text-zinc-950 uppercase tracking-widest">Your cart is empty</h2>
              <p className="text-zinc-500 text-sm font-medium max-w-xs leading-relaxed">
                Looks like you haven't added any products to your setup yet.
              </p>
            </div>
            <Link href="/" className="bg-[#7b0323] text-white text-xs font-bold tracking-widest px-8 py-4 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md">
              BROWSE STOREFRONT
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items list */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {cart.map((item) => (
                <div 
                  key={`${item.product.id}-${item.color}`}
                  className="flex gap-4 items-center bg-white border border-zinc-200/60 p-4 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0 flex items-center justify-center p-1 relative">
                    <Image 
                      src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : `/products/${item.product.id}.webp`} 
                      alt={item.product.name}
                      width={80}
                      height={80}
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <div className="flex-grow min-w-0 text-left">
                    <span className="text-[8px] font-bold tracking-widest text-[#7b0323] uppercase">
                      {item.product.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-zinc-950 font-outfit truncate mt-0.5">
                      {item.product.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                      Variant: <span className="text-zinc-700 font-extrabold">{item.color}</span>
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center bg-zinc-50 border border-zinc-200/50 rounded-full px-2 py-0.5 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.color, -1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/50 transition-colors border-0 bg-transparent text-sm font-bold cursor-pointer"
                        >
                          —
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-800 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.color, 1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/50 transition-colors border-0 bg-transparent text-sm font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch gap-3 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.product.id, item.color)}
                      className="text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer p-1 rounded-lg hover:bg-red-50"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>                    <div className="text-sm font-black text-[#7b0323] font-outfit">
                      Rs. {(parsePrice(item.product.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Checkout Summary & Proceed CTA */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Summary Card */}
              <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                    Order Summary
                  </h2>
                  <span className="text-[10px] font-extrabold text-[#7b0323] bg-[#7b0323]/5 px-2.5 py-0.5 rounded-full border border-[#7b0323]/10/50">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-zinc-950 font-extrabold">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-extrabold text-[10px] tracking-wide">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold border-b border-zinc-200/50 pb-3">
                    <span>Estimated Taxes</span>
                    <span className="text-zinc-800 font-bold">Rs. 0</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-zinc-900 font-outfit uppercase tracking-widest">
                    <span>Total Amount</span>
                    <span className="text-[#7b0323] text-lg font-black font-outfit">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Proceed to Checkout CTA Button */}
              <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#7b0323] text-white text-xs font-bold tracking-widest py-4 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0 flex items-center justify-center gap-2"
                >
                  PROCEED TO CHECKOUT
                </button>
                <Link 
                  href="/" 
                  className="w-full bg-transparent text-zinc-500 hover:text-zinc-800 text-[10px] font-bold tracking-widest py-2 rounded-full hover:bg-zinc-100 transition-colors border-0 cursor-pointer text-center block"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
