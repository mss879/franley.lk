"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getProductColors,
  getColorHex,
  PRODUCT_FEATURES,
  Product,
} from "../../products";

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();

  // States
  const [activeColor, setActiveColor] = useState<string>("");
  const [activeQuantity, setActiveQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartAnimate, setCartAnimate] = useState(false);
  const [searchToast, setSearchToast] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);

  // Sync state defaults when product loads
  useEffect(() => {
    if (product) {
      const colors = getProductColors(product);
      setActiveColor(colors[0] || product.color);
      setActiveQuantity(1);
      setActiveImgIndex(0);
    }
  }, [product]);

  // Load cart from localStorage on mount
  useEffect(() => {
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

  // Save cart to state and localStorage
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

  const colors = getProductColors(product);
  const activeColorHex = getColorHex(activeColor || product.color);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Handlers
  const addToCart = (qty: number, col: string) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.color === col
    );
    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += qty;
    } else {
      newCart.push({ product, quantity: qty, color: col });
    }
    saveCart(newCart);

    // Bounce cart badge
    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 800);

    setSearchToast(`Added ${qty}x ${product.name} (${col}) to cart!`);
    setTimeout(() => setSearchToast(null), 3000);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, col: string) => {
    const newCart = cart.filter(
      (item) => !(item.product.id === productId && item.color === col)
    );
    saveCart(newCart);
    setSearchToast("Removed item from cart");
    setTimeout(() => setSearchToast(null), 3000);
  };

  const updateQuantity = (productId: string, col: string, delta: number) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === productId && item.color === col
    );
    if (existingIndex > -1) {
      let newCart = [...cart];
      const newQty = newCart[existingIndex].quantity + delta;
      if (newQty <= 0) {
        newCart = newCart.filter(
          (item) => !(item.product.id === productId && item.color === col)
        );
      } else {
        newCart[existingIndex].quantity = newQty;
      }
      saveCart(newCart);
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

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col font-outfit select-none relative pb-24 md:pb-0">

      {/* Sticky Header Nav */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 px-6 lg:px-12 py-4 flex items-center justify-between z-45 relative">
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

        {/* Cart Button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="hidden md:flex relative border-0 bg-transparent text-zinc-950 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer p-1"
        >
          <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          {totalCartItems > 0 && (
            <span className={`absolute -top-1 -right-1 bg-[#7b0323] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow border border-white transition-all duration-300 ${
              cartAnimate ? "animate-bounce scale-110 shadow-[0_0_8px_rgba(123,3,35,0.5)]" : ""
            }`}>
              {totalCartItems}
            </span>
          )}
        </button>
        <div className="w-8 md:hidden pointer-events-none" />
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center py-8 lg:py-16 px-6 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Product Image Gallery (col-span-6) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Breadcrumb Path (Mobile view top) */}
            <div className="w-full text-left flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
              <Link href="/" className="hover:text-zinc-650 transition-colors">HOME</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-zinc-650 transition-colors">SHOP</Link>
              <span>/</span>
              <span className="text-zinc-950 font-extrabold">{product.category}</span>
            </div>

            {(() => {
              const productImages = product.images && product.images.length > 0 
                ? product.images 
                : [`/products/${product.id}.webp`];
              return (
                <>
                  {/* Main Image Container */}
                  <div className="w-full aspect-square bg-white border border-zinc-200/80 rounded-[2.5rem] overflow-hidden shadow-lg flex items-center justify-center p-8 relative">
                    <Image
                      src={productImages[activeImgIndex]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      style={{ objectFit: "contain", padding: "32px" }}
                      preload
                    />
                  </div>

                  {/* Thumbnail Selection (only if more than 1 image) */}
                  {productImages.length > 1 && (
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                      {productImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={`w-16 h-16 rounded-2xl border-2 bg-white p-1 overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            activeImgIndex === idx 
                              ? "border-[#7b0323] scale-105 shadow-sm" 
                              : "border-zinc-200 hover:border-zinc-350"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} preview ${idx + 1}`}
                            width={56}
                            height={56}
                            style={{ objectFit: "contain" }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Right Column: Checkout Info & Variant selectors (col-span-6) */}
          <div className="lg:col-span-6 flex flex-col justify-center gap-6 text-left lg:pt-10">
            <div>
              <span 
                className="text-xs font-black tracking-[0.3em] uppercase block mb-1 text-[#7b0323]"
              >
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 font-syne leading-none tracking-tight mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 font-outfit">{product.price}</span>
                {product.slashedPrice && (
                  <span className="text-sm text-zinc-400 line-through font-bold">{product.slashedPrice}</span>
                )}
                {product.discount && (
                  <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-lg tracking-wider uppercase ml-1">
                    {product.discount}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-zinc-200/60 pt-5">
              <div 
                className="text-zinc-650 text-sm sm:text-base leading-relaxed font-medium rich-text-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Color Variant Selector */}
            {colors.length > 0 && (
              <div className="border-t border-zinc-200/60 pt-5 flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                  Select Color: <span className="text-zinc-800 font-bold">{activeColor}</span>
                </span>
                <div className="flex gap-3 mt-1">
                  {colors.map((col) => {
                    const hex = getColorHex(col);
                    const isWhite = hex === "#ffffff" || hex === "#f4f4f5" || hex === "#e4e4e7";
                    return (
                      <button
                        key={col}
                        onClick={() => setActiveColor(col)}
                        className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer ${
                          activeColor === col 
                            ? "ring-4 ring-offset-2 scale-105" 
                            : "border-zinc-200 opacity-80"
                        }`}
                        style={{ 
                          backgroundColor: hex,
                          borderColor: activeColor === col ? activeColorHex : "#e4e4e7",
                          outlineColor: activeColorHex
                        }}
                        title={col}
                      >
                        {activeColor === col && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isWhite ? 'bg-zinc-800' : 'bg-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="border-t border-zinc-200/60 pt-5 flex flex-col gap-2.5">
              <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                Quantity
              </span>
              <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200/60 rounded-full px-2.5 py-1.5 shadow-inner w-fit">
                <button
                  onClick={() => setActiveQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-555 hover:text-zinc-800 rounded-full hover:bg-zinc-200/60 transition-colors border-0 bg-transparent font-bold cursor-pointer"
                >
                  —
                </button>
                <span className="w-10 text-center text-sm font-extrabold text-zinc-800">
                  {activeQuantity}
                </span>
                <button
                  onClick={() => setActiveQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-555 hover:text-zinc-800 rounded-full hover:bg-zinc-200/60 transition-colors border-0 bg-transparent font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Checkout Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                onClick={() => addToCart(activeQuantity, activeColor)}
                className="flex-1 bg-zinc-950 text-white text-xs font-bold tracking-widest py-4 rounded-full hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md shadow-zinc-950/10 cursor-pointer border-0"
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => {
                  addToCart(activeQuantity, activeColor);
                  router.push("/cart");
                }}
                className="flex-1 bg-zinc-950 text-white text-xs font-bold tracking-widest py-4 rounded-full hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg cursor-pointer border-0"
              >
                BUY NOW
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in cursor-pointer"
          />

          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white flex flex-col shadow-2xl z-[121] transform animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-left">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#7b0323] animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                <h2 className="text-sm font-extrabold text-zinc-950 font-outfit uppercase tracking-widest">
                  Shopping Cart
                </h2>
                <span className="bg-[#7b0323]/10 text-[#7b0323] text-[10px] font-extrabold px-2 py-0.5 rounded-full font-outfit">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 rounded-full p-2 transition-colors cursor-pointer border-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400 select-none">
                  <div className="p-6 bg-[#7b0323]/5 rounded-full text-[#7b0323]/60 border border-[#7b0323]/10/30 shadow-inner">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="8" cy="21" r="1"/>
                      <circle cx="19" cy="21" r="1"/>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-widest font-outfit">Your cart is empty</h3>
                  <p className="text-xs text-zinc-500 text-center max-w-[240px] leading-relaxed font-medium">
                    Looks like you haven't added any products to your setup yet.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#7b0323] text-white text-xs font-bold tracking-widest px-6 py-3 rounded-full hover:bg-[#8e1534] transition-all duration-300 mt-2 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0"
                  >
                    START SHOPPING
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={`${item.product.id}-${item.color}`}
                    className="flex gap-4 items-center bg-white border border-zinc-200/50 p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0 flex items-center justify-center p-1 relative">
                      <Image 
                        src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : `/products/${item.product.id}.webp`} 
                        alt={item.product.name}
                        width={64}
                        height={64}
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    <div className="flex-grow min-w-0 text-left">
                      <span className="text-[8px] font-bold tracking-widest text-[#7b0323] uppercase">
                        {item.product.category}
                      </span>
                      <h4 className="text-xs font-extrabold text-zinc-950 font-outfit truncate mt-0.5">
                        {item.product.name}
                      </h4>
                      <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                        Variant: <span className="text-zinc-700 font-extrabold">{item.color}</span>
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-zinc-50 border border-zinc-200/50 rounded-full px-1.5 py-0.5 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.color, -1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/50 transition-colors border-0 bg-transparent text-xs font-bold cursor-pointer"
                          >
                            —
                          </button>
                          <span className="w-6 text-center text-[10px] font-bold text-zinc-800 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.color, 1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-555 hover:text-zinc-800 rounded-full hover:bg-zinc-200/50 transition-colors border-0 bg-transparent text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-xs font-black text-[#7b0323] font-outfit">
                        Rs. {(parsePrice(item.product.price) * item.quantity).toLocaleString()}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.color)}
                        className="text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer p-1 rounded-lg hover:bg-red-50"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-455 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-zinc-950 font-extrabold">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-extrabold text-[10px] tracking-wide">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold border-b border-zinc-200/50 pb-2">
                    <span>Estimated Taxes</span>
                    <span className="text-zinc-800 font-bold">Rs. 0</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-zinc-950 font-outfit uppercase tracking-widest">
                    <span>Total Amount</span>
                    <span className="text-[#7b0323] text-base font-black font-outfit">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/cart");
                    }}
                    className="w-full bg-[#7b0323] text-white text-xs font-bold tracking-widest py-3.5 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0 flex items-center justify-center gap-2"
                  >
                    GO TO DETAILED CART
                  </button>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-transparent text-zinc-500 hover:text-zinc-800 text-[9px] font-bold tracking-widest py-2 rounded-full hover:bg-zinc-100 transition-colors border-0 cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {searchToast && (
        <div className="fixed bottom-6 right-6 bg-zinc-900/95 backdrop-blur-md text-white text-[10px] font-bold tracking-widest py-3 px-6 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {searchToast.toUpperCase()}
        </div>
      )}
    </div>
  );
}
