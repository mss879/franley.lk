"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LazyVideo from "../components/LazyVideo";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";
import { Product, MOCK_PRODUCTS, getProductColors, getColorHex, getCategoryIcon } from "./products";
import { BLOG_POSTS } from "./blog/data";

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

const getIconForProduct = (id: string, category: string, color: string): React.ReactNode => {
  return getCategoryIcon(category, id);
};

export default function HomeClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [preloadedAssets, setPreloadedAssets] = useState<{ videoUrl: string; logoUrl: string; isVideoMobile: boolean } | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Lock scroll on home page mount
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";
    document.body.style.height = "100vh";
    document.documentElement.style.width = "100vw";
    document.body.style.width = "100vw";

    return () => {
      // Restore scroll when navigating away
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
      document.documentElement.style.width = "";
      document.body.style.width = "";
    };
  }, []);

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [videoSource, setVideoSource] = useState<string>("/Luxury_men's_ties_and_cufflinks_202606181413.mp4");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setVideoSource(
          preloadedAssets?.isVideoMobile
            ? preloadedAssets.videoUrl
            : "/Luxury_men's_ties_and_cufflinks_202606181413.mp4"
        );
      } else {
        setVideoSource(
          (preloadedAssets && !preloadedAssets.isVideoMobile)
            ? preloadedAssets.videoUrl
            : "/Luxury_men's_ties_and_cufflinks_202606181413.mp4"
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [preloadedAssets]);

  // Track scroll position of the bento drawer sheet relative to viewport height
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const clientHeight = e.currentTarget.clientHeight;
    // When the user scrolls past the viewport height, the hero background video is completely covered
    const visible = scrollTop < clientHeight - 20; // 20px buffer before it fully disappears
    if (visible !== isHeroVisible) {
      setIsHeroVisible(visible);
    }
  };

  // Play/pause the background video programmatically when it is active/covered
  useEffect(() => {
    if (!heroVideoRef.current) return;
    if (isHeroVisible) {
      heroVideoRef.current.play().catch(err => {
        // Safe check for autoplay interrupt restrictions
        console.log("Hero background video playback status:", err);
      });
    } else {
      heroVideoRef.current.pause();
    }
  }, [isHeroVisible]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchToast, setSearchToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() =>
    initialProducts.map((p) => ({
      ...p,
      icon: getIconForProduct(p.id, p.category, p.color),
    }))
  );
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string>("");
  const [activeQuantity, setActiveQuantity] = useState<number>(1);
  const [cartAnimate, setCartAnimate] = useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync with localStorage on mount
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

  // Fetch products from Supabase on mount (fall back to MOCK_PRODUCTS if offline/unconfigured)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("products")
            .select("*");
          if (!error && data && data.length > 0) {
            const mapped = data.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: `Rs. ${Math.round(item.price).toLocaleString()}`,
              slashedPrice: item.slashed_price ? `Rs. ${Math.round(item.slashed_price).toLocaleString()}` : "",
              discount: item.discount || "",
              description: item.description,
              color: item.color || "burgundy",
              metaTitle: item.meta_title || "",
              icon: getIconForProduct(item.id, item.category, item.color)
            }));
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load storefront products from Supabase, using mock fallback:", err);
      }
    };
    fetchProducts();

    // Load recent searches
    try {
      const saved = localStorage.getItem("franley_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  // Debounced search querying Supabase backend
  useEffect(() => {
    const performSearch = async () => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        setSearchResults([]);
        setFocusedIndex(-1);
        return;
      }

      setIsSearchingDb(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .or(`name.ilike.%${trimmedQuery}%,category.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`);

          if (error) throw error;

          if (data) {
            const mapped = data.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: `Rs. ${Math.round(item.price).toLocaleString()}`,
              slashedPrice: item.slashed_price ? `Rs. ${Math.round(item.slashed_price).toLocaleString()}` : "",
              discount: item.discount || "",
              description: item.description,
              color: item.color || "burgundy",
              metaTitle: item.meta_title || "",
              icon: getIconForProduct(item.id, item.category, item.color)
            }));
            setSearchResults(mapped);
          }
        } else {
          // Local fallback filter if Supabase not configured
          const q = trimmedQuery.toLowerCase();
          const localResults = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
          setSearchResults(localResults);
        }
      } catch (err) {
        console.warn("Supabase search error, falling back to local:", err);
        const q = trimmedQuery.toLowerCase();
        const localResults = products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
        setSearchResults(localResults);
      } finally {
        setIsSearchingDb(false);
        setFocusedIndex(-1);
      }
    };

    const delayDebounce = setTimeout(() => {
      performSearch();
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, products]);

  // Save to localStorage when cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      // Strip non-serializable `icon` (React.ReactNode) before persisting
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

  const addToCart = (product: Product, quantity: number, color: string) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.color === color
    );
    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity, color });
    }
    saveCart(newCart);

    // Trigger cart badge animation
    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 800);

    // Toast notification
    setSearchToast(`Added ${quantity}x ${product.name} (${color}) to cart!`);
    setTimeout(() => setSearchToast(null), 3000);
  };

  const removeFromCart = (productId: string, color: string) => {
    const newCart = cart.filter(
      (item) => !(item.product.id === productId && item.color === color)
    );
    saveCart(newCart);

    setSearchToast(`Removed item from cart`);
    setTimeout(() => setSearchToast(null), 3000);
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

  const clearCart = () => {
    saveCart([]);
  };

  const parsePrice = (priceStr: string) => {
    const cleanStr = priceStr.replace(/rs\.?/i, "").replace(/[^0-9.]/g, "");
    return parseFloat(cleanStr) || 0;
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  );

  // Reset active quantity and active color when active product changes
  useEffect(() => {
    if (activeProduct) {
      setActiveQuantity(1);
      const colors = getProductColors(activeProduct);
      setActiveColor(colors[0] || activeProduct.color);
    }
  }, [activeProduct]);

  const handleSelectProduct = (product: Product) => {
    setIsSearching(false);
    setSearchQuery("");
    router.push(`/product/${product.id}`);

    // Save to recent searches if query was typed
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const updated = [q, ...recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem("franley_recent_searches", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent searches", e);
      }
    }

    setSearchQuery("");

    // Show a quick success toast
    setSearchToast(`Viewing ${product.name}`);
    setTimeout(() => setSearchToast(null), 3000);
  };

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearching(false);
      setSearchQuery("");
      const btn = document.getElementById("search-bar-toggle-button");
      if (btn) btn.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const count = searchResults.length;
        if (count === 0) return -1;
        return prev < count - 1 ? prev + 1 : 0;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const count = searchResults.length;
        if (count === 0) return -1;
        return prev > 0 ? prev - 1 : count - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
        handleSelectProduct(searchResults[focusedIndex]);
      } else if (searchResults.length > 0) {
        handleSelectProduct(searchResults[0]);
      }
    }
  };

  // Click outside listener
  useEffect(() => {
    if (!isSearching) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("#interactive-search-container") &&
        !target.closest("#search-bar-toggle-button")
      ) {
        setIsSearching(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearching]);

  // Focus input when opened
  useEffect(() => {
    if (isSearching) {
      const input = document.getElementById("interactive-search-input") as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 150);
      }
      setFocusedIndex(-1);
    }
  }, [isSearching]);

  // Helper function to highlight matches
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const cleanQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanQuery})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-[#7b0323]/20/60 text-[#7b0323] font-bold rounded-sm px-0.5 no-underline">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <>

      <div
        className={`w-screen h-screen overflow-hidden bg-black p-1.5 lg:p-2.5 flex flex-col justify-stretch relative font-outfit select-none transition-all duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${(!isClient || isLoading) ? "opacity-0 scale-90 translate-y-12 pointer-events-none" : "opacity-100 scale-100 translate-y-0"
          }`}
        style={{
          transform: (!isClient || isLoading) ? "perspective(1200px) rotateX(10deg)" : "perspective(1200px) rotateX(0deg)",
          transformOrigin: "bottom center",
        }}
      >

        {/* 3D Extrusion Layer (white/gray offset shadow) */}
        <div
          className="absolute inset-1.5 lg:inset-2.5 z-0 rounded-[2rem] lg:rounded-[3rem] bg-zinc-900 translate-y-2 pointer-events-none"
        />

        {/* Main Hero Container Card (with rounded corners, no cutouts, brand border) */}
        <div
          className="absolute inset-1.5 lg:inset-2.5 z-0 rounded-[2rem] lg:rounded-[3rem] border-[4px] md:border-[6px] border-[#7b0323] bg-[#050505] overflow-hidden shadow-2xl pointer-events-none"
        >
          <video
            ref={heroVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: (isHeroVisible && !isLoading) ? "block" : "none" }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={preloadedAssets ? videoSource : undefined}
          >
            {!preloadedAssets && (
              <>
                <source src="/Luxury_men's_ties_and_cufflinks_202606181413.mp4" type="video/mp4" />
              </>
            )}
          </video>
        </div>

        {/* Main Inner Custom Shape Card */}
        <main className="absolute inset-0 overflow-hidden flex flex-col justify-between z-10">

          {/* Content Wrapper */}
          <div
            className="relative z-10 w-full h-full overflow-y-auto scrollbar-none md:scrollbar-thin scroll-smooth flex flex-col p-0"
            onScroll={handleScroll}
          >

            {/* Sticky Hero Section Wrapper (remains fixed on first fold, covered by solid white sheet on scroll) */}
            <div className="sticky top-0 z-10 w-full min-h-full flex flex-col justify-between shrink-0 pointer-events-none pt-2 lg:pt-3 px-6 lg:px-8 pb-4 relative">


              {/* Header Navigation Layer */}
              <header className="w-full flex items-center justify-between mt-1 lg:mt-2 px-6 lg:px-12 pointer-events-none relative shrink-0 z-20">

                {/* Left Nav Block */}
                <div
                  className={`flex items-center gap-2 sm:gap-4 lg:gap-6 w-[35%] justify-start pointer-events-auto transition-all duration-[800ms] delay-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                    } ${isSearching ? "opacity-0 pointer-events-none scale-95" : ""}`}
                >
                  <div className="hidden md:flex items-center gap-2 sm:gap-4 lg:gap-6">
                    {[
                      { name: "ABOUT", href: "/about", isExternal: true },
                      { name: "SHOP NOW", onClick: () => setIsCategoryModalOpen(true) },
                      { name: "CONTACT", href: "/contact", isExternal: true },
                    ].map((link) => (
                      link.onClick ? (
                        <button
                          key={link.name}
                          onClick={link.onClick}
                          className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-widest text-white hover:text-zinc-200 transition-colors duration-300 relative group border-0 bg-transparent cursor-pointer"
                        >
                          {link.name}
                          <span className="absolute bottom-[-4px] left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full" />
                        </button>
                      ) : (
                        <Link
                          key={link.name}
                          href={link.href!}
                          className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-widest text-white hover:text-zinc-200 transition-colors duration-300 relative group"
                        >
                          {link.name}
                          <span className="absolute bottom-[-4px] left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full" />
                        </Link>
                      )
                    ))}
                  </div>
                </div>

                {/* Center Logo (no cutout, placed inline on top of the container) */}
                <div
                  className={`flex items-center justify-center w-[30%] h-[65px] md:h-[90px] pointer-events-auto transition-all duration-[1000ms] delay-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoading ? "opacity-0 -translate-y-4 scale-95" : "opacity-100 translate-y-1 md:translate-y-1.5 lg:translate-y-2 scale-100"
                    }`}
                >
                  <Link href="/" className="block w-full h-full max-w-[175px] hover:opacity-75 transition-opacity duration-300 relative">
                    <Image
                      src="/franley_logo_no_text_transparent.png"
                      alt="Franley Logo"
                      fill
                      sizes="(max-width: 768px) 32vw, 23vw"
                      style={{ objectFit: "contain" }}
                      preload={true}
                      loading="eager"
                    />
                  </Link>
                </div>

                {/* Right Nav Block (links centered in the gap, action icons aligned right) */}
                <div
                  className={`flex items-center w-[35%] justify-end pointer-events-auto pr-1 lg:pr-3 transition-all duration-[800ms] delay-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                    }`}
                >
                  {/* Text menu links removed as only search and basket should be here */}

                  {/* Action Buttons (Search & Cart) / Search Input Container */}
                  <div
                    id="interactive-search-container"
                    className="relative flex items-center justify-end ml-auto shrink-0"
                  >
                    {/* Expanding Search Bar Input */}
                    <div
                      className={`flex items-center bg-white/75 backdrop-blur-xl border border-[#7b0323]/30/40 border-b-[3px] border-[#7b0323]/30 rounded-full shadow-[0_4px_16px_rgba(123,3,35,0.1),inset_0_1.5px_1.5px_rgba(255,255,255,0.6)] px-4 py-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSearching
                        ? "w-[calc(100vw-40px)] sm:w-[300px] md:w-[380px] lg:w-[450px] opacity-100 scale-100"
                        : "w-0 opacity-0 scale-95 pointer-events-none overflow-hidden border-none shadow-none py-0 px-0"
                        }`}
                    >
                      <svg className="w-5 h-5 text-[#7b0323] shrink-0 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <circle cx="11" cy="11" r="2.5" fill="currentColor" opacity="0.25" stroke="none" />
                      </svg>
                      <input
                        id="interactive-search-input"
                        type="text"
                        placeholder="Search luxury accessories..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setFocusedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none py-1"
                        autoComplete="off"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-zinc-400 hover:text-zinc-600 p-1 mr-1 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsSearching(false);
                          setSearchQuery("");
                        }}
                        className="bg-[#7b0323]/10 hover:bg-[#7b0323]/20 text-[#7b0323] rounded-full p-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Standard Search Trigger and Cart Buttons */}
                    <div
                      className={`hidden md:flex items-center gap-4 lg:gap-5 transition-all duration-300 ${isSearching
                        ? "opacity-0 scale-95 pointer-events-none w-0 overflow-hidden"
                        : "opacity-100 scale-100"
                        }`}
                    >
                      {/* Search Trigger Button */}
                      <button
                        id="search-bar-toggle-button"
                        onClick={() => setIsSearching(true)}
                        className="bg-white/10 backdrop-blur-md text-white border border-white/20 border-b-[3px] border-white/30 p-3 lg:p-3.5 rounded-full hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-[1px] transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 shadow-[0_4px_12px_rgba(255,255,255,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,0.2)]"
                      >
                        <svg className="w-5.5 h-5.5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="7" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <circle cx="11" cy="11" r="2.5" fill="currentColor" opacity="0.25" stroke="none" />
                        </svg>
                      </button>

                      {/* Cart Button Container with Hover Dropdown */}
                      <div className="relative group/cart">
                        <button
                          onClick={() => setIsCartOpen(true)}
                          className="relative border-0 bg-transparent text-white hover:text-zinc-200 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 p-1"
                        >
                          <svg className="w-8 h-8 lg:w-9 lg:h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                          {/* Quantity Badge */}
                          {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 bg-[#7b0323] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-white transition-all duration-300 ${cartAnimate ? "animate-bounce scale-110 shadow-[0_0_12px_rgba(123,3,35,0.5)]" : ""
                              }`}>
                              {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          )}
                        </button>

                        {/* Desktop Hover Cart Preview Dropdown */}
                        <div className="absolute top-[35px] right-0 w-[280px] sm:w-[320px] bg-white/95 backdrop-blur-xl border border-zinc-200/50 shadow-2xl rounded-2xl overflow-hidden opacity-0 translate-y-2 pointer-events-none group-hover/cart:opacity-100 group-hover/cart:translate-y-0 group-hover/cart:pointer-events-auto transition-all duration-300 z-50 text-left origin-top-right p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                              Cart Preview
                            </h4>
                            <span className="text-[10px] font-bold text-[#7b0323]">
                              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                            </span>
                          </div>

                          {cart.length === 0 ? (
                            <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-400">
                              <svg className="w-10 h-10 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                              </svg>
                              <span className="text-xs font-semibold select-none">Your cart is empty</span>
                            </div>
                          ) : (
                            <>
                              {/* Items List (max 3 items) */}
                              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                {cart.slice(0, 3).map((item, idx) => (
                                  <div key={`${item.product.id}-${item.color}`} className="flex gap-2.5 items-center">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0 flex items-center justify-center p-0.5">
                                      <Image
                                        src={`/products/${item.product.id}.webp`}
                                        alt={item.product.name}
                                        width={40}
                                        height={40}
                                        style={{ objectFit: "contain" }}
                                        loading="eager"
                                      />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <h5 className="text-[11px] font-bold text-zinc-950 truncate">
                                        {item.product.name}
                                      </h5>
                                      <p className="text-[9px] text-zinc-500 font-semibold truncate mt-0.5">
                                        Color: {item.color} • Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <div className="text-[11px] font-bold text-[#7b0323] flex-shrink-0">
                                      {item.product.price}
                                    </div>
                                  </div>
                                ))}
                                {cart.length > 3 && (
                                  <p className="text-[9px] text-zinc-400 font-semibold text-center italic mt-1">
                                    + {cart.length - 3} more items in cart
                                  </p>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="border-t border-zinc-100 pt-2 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                                    Subtotal
                                  </span>
                                  <span className="text-xs font-black text-[#7b0323] font-outfit">
                                    Rs. {cartSubtotal.toLocaleString()}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setIsCartOpen(true)}
                                  className="w-full bg-zinc-950 text-white text-[10px] font-bold tracking-widest py-2 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer border-0 mt-1 shadow-md shadow-zinc-950/10"
                                >
                                  VIEW FULL CART
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Search Dropdown / Autocomplete Results */}
                    <div
                      className={`absolute top-[55px] right-0 w-[calc(100vw-40px)] sm:w-[350px] md:w-[420px] lg:w-[480px] bg-white/95 backdrop-blur-xl border border-zinc-200/50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 z-50 text-left origin-top-right flex flex-col max-h-[450px] ${isSearching
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                        }`}
                    >
                      {/* Suggestions State (Empty query) */}
                      {!searchQuery.trim() && (
                        <div className="p-5 flex flex-col gap-4">
                          {recentSearches.length > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-2.5">
                                <h4 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                                  Recent Searches
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRecentSearches([]);
                                    try {
                                      localStorage.removeItem("franley_recent_searches");
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-[9px] font-bold text-zinc-400 hover:text-[#7b0323] transition-colors uppercase tracking-widest cursor-pointer border-0 bg-transparent"
                                >
                                  Clear
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term) => (
                                  <button
                                    key={term}
                                    onClick={() => {
                                      setSearchQuery(term);
                                      const input = document.getElementById("interactive-search-input") as HTMLInputElement;
                                      if (input) input.focus();
                                    }}
                                    className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 bg-[#7b0323]/[0.03] border border-[#7b0323]/20/30 text-zinc-700 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:bg-[#7b0323]/5 hover:text-[#7b0323]"
                                  >
                                    <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {term}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={recentSearches.length > 0 ? "border-t border-zinc-100 pt-4" : ""}>
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-2.5">
                              Trending Searches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {["Silk Neckties", "Gold Cufflinks", "Gift Box", "Ascots", "Menswear"].map((term) => (
                                <button
                                  key={term}
                                  onClick={() => {
                                    setSearchQuery(term);
                                    const input = document.getElementById("interactive-search-input") as HTMLInputElement;
                                    if (input) input.focus();
                                  }}
                                  className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 bg-zinc-100 hover:bg-[#7b0323]/5 hover:text-[#7b0323] text-zinc-700 rounded-full transition-all duration-200 cursor-pointer border border-zinc-200/40"
                                >
                                  {term}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-zinc-100 pt-4">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-2.5">
                              Browse Categories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: "Home and kitchen", color: "text-pink-700 bg-pink-50 border-pink-200/30" },
                                { name: "Tech & Gadgets", color: "text-blue-700 bg-blue-50 border-blue-200/30" },
                                { name: "Mobile & Auto", color: "text-emerald-700 bg-emerald-50 border-emerald-200/30" },
                                { name: "Best sellers", color: "text-[#7b0323] bg-[#7b0323]/5 border-[#7b0323]/20/30" },
                                { name: "Trending", color: "text-amber-700 bg-amber-50 border-amber-200/30" }
                              ].map((cat) => (
                                <button
                                  key={cat.name}
                                  onClick={() => {
                                    setSearchQuery(cat.name);
                                    const input = document.getElementById("interactive-search-input") as HTMLInputElement;
                                    if (input) input.focus();
                                  }}
                                  className={`text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${cat.color} hover:brightness-95`}
                                >
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Matches State (Typing query) */}
                      {searchQuery.trim() && (
                        <>
                          <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                              {isSearchingDb ? "Searching..." : `Search Results (${searchResults.length})`}
                            </span>
                            {!isSearchingDb && (
                              <span className="text-[9px] text-zinc-400 hidden sm:inline-block">
                                Use ↑↓ to navigate • Enter to view
                              </span>
                            )}
                          </div>

                          <div className="overflow-y-auto flex-1 max-h-[350px] divide-y divide-zinc-100/50">
                            {isSearchingDb ? (
                              <div className="py-12 flex flex-col items-center justify-center gap-3">
                                {/* Beautiful Glassmorphic Loader */}
                                <div className="relative w-8 h-8">
                                  <div className="absolute inset-0 rounded-full border-2 border-[#7b0323]/10"></div>
                                  <div className="absolute inset-0 rounded-full border-2 border-t-[#7b0323] animate-spin"></div>
                                </div>
                                <span className="text-[10px] font-bold tracking-widest text-zinc-450 uppercase animate-pulse">
                                  Searching database...
                                </span>
                              </div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map((product, index) => {
                                const isFocused = focusedIndex === index;

                                // Category colors setup
                                const colorMap: Record<string, string> = {
                                  purple: "bg-[#7b0323]/10 text-[#7b0323]",
                                  amber: "bg-amber-100 text-amber-600",
                                  blue: "bg-blue-100 text-blue-600",
                                  emerald: "bg-emerald-100 text-emerald-600",
                                  pink: "bg-pink-100 text-pink-600",
                                  slate: "bg-slate-100 text-slate-600",
                                };

                                return (
                                  <button
                                    key={product.id}
                                    onClick={() => handleSelectProduct(product)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    className={`w-full flex items-start p-3 text-left transition-all duration-200 outline-none ${isFocused
                                      ? "bg-[#7b0323]/5/80 border-l-[3.5px] border-[#7b0323] pl-2"
                                      : "hover:bg-zinc-50/60 border-l-[3.5px] border-transparent"
                                      }`}
                                  >
                                    <div className={`p-2 rounded-xl shrink-0 mr-3 ${colorMap[product.color] || "bg-zinc-100"}`}>
                                      {product.icon}
                                    </div>
                                    <div className="flex-grow min-w-0 pr-2">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <h5 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">
                                          {highlightMatch(product.name, searchQuery)}
                                        </h5>
                                        <span className="text-xs font-extrabold text-[#7b0323] shrink-0 font-syne">
                                          {product.price}
                                        </span>
                                      </div>
                                      <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-1 leading-normal font-medium">
                                        {highlightMatch(product.description ? product.description.replace(/<[^>]*>/g, '') : '', searchQuery)}
                                      </p>
                                      <span className="inline-block text-[8px] font-extrabold tracking-wider text-zinc-400 uppercase mt-1">
                                        {product.category}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                                <div className="p-3 bg-zinc-50 rounded-full text-zinc-400 mb-3 border border-zinc-200/20">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <h5 className="text-xs sm:text-sm font-bold text-zinc-700 mb-1">
                                  No creator essentials match
                                </h5>
                                <p className="text-[10px] sm:text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                                  Try searching for something else like &ldquo;headphones&rdquo;, &ldquo;keyboard&rdquo;, or &ldquo;charger&rdquo;.
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </header>

              {/* Hero Content Section (Glassmorphic card wrapping content - scaled up) */}
              <div
                className={`w-fit max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl self-start ml-2 md:ml-6 mb-8 md:mb-12 pointer-events-auto flex flex-col items-start text-left bg-black/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 sm:p-7 md:p-8 shadow-2xl transition-all duration-[1000ms] delay-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoading
                  ? "opacity-0 translate-y-8 scale-95"
                  : "opacity-100 translate-y-0 scale-100"
                  }`}
              >
                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4 font-outfit">
                  <span className="block">Crafted for the</span>
                  <span className="block whitespace-nowrap">Discerning Gentleman</span>
                </h1>

                {/* Description */}
                <p className="text-white/80 text-[13px] sm:text-[15px] md:text-base font-medium max-w-md leading-relaxed mb-6">
                  Discover our signature selection of handcrafted silk ties and bespoke cufflinks designed to elevate your style.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-white text-black text-xs sm:text-sm font-bold tracking-widest px-7 py-3.5 rounded-full hover:bg-zinc-200 transition-all duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 text-center uppercase min-w-[140px] sm:min-w-[160px] border-0 cursor-pointer"
                  >
                    Shop Now
                  </button>
                  <Link
                    href="/about"
                    className="bg-transparent border border-white text-white text-xs sm:text-sm font-bold tracking-widest px-7 py-3.5 rounded-full hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 text-center uppercase min-w-[140px] sm:min-w-[160px]"
                  >
                    About Us
                  </Link>
                </div>
              </div>

            </div>

            {/* Section 2: Overlapping Categories Section */}
            <section className="relative z-20 w-full bg-[#0a0a0f] text-white rounded-t-[2.5rem] lg:rounded-t-[3.5rem] border-t border-zinc-800 shadow-[0_-15px_40px_rgba(0,0,0,0.85)] pb-36 pt-16 px-6 lg:px-12 flex flex-col items-center shrink-0">
              {/* Subtle top decoration bar */}
              <div className="w-16 h-[4px] bg-zinc-800 rounded-full mb-8 opacity-20" />

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center gap-2 mb-12 text-center">
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.4em] text-[#d4af37] uppercase">
                  FRANLEY LUXURY
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider font-outfit mt-1">
                  SHOP OUR CATEGORIES
                </h2>
                <div className="w-12 h-[2px] bg-[#7b0323] mt-3" />
                <p className="text-zinc-400 text-xs md:text-sm max-w-md mt-3 font-medium leading-relaxed">
                  Browse our exquisite, handcrafted collections tailored for modern elegance and timeless style.
                </p>
              </div>

              {/* Two Portrait Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl px-2 md:px-6 mb-8">

                {/* Category 1: Neckties */}
                <Link
                  href="/shop?category=neckties"
                  className="group relative flex flex-col rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/5] bg-zinc-950 border border-zinc-800/40 hover:border-[#7b0323]/50 transition-all duration-500 shadow-xl hover:shadow-[#7b0323]/10"
                >
                  {/* Image */}
                  <div className="absolute inset-0 w-full h-full transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <Image
                      src="/neckties_category.png"
                      alt="Neckties Collection"
                      fill
                      sizes="(max-width: 640px) 100vw, 450px"
                      className="object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-500"
                    />
                  </div>
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />

                  {/* Card Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end items-center z-20 gap-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-bold tracking-[0.4em] text-[#7b0323] group-hover:text-red-400 transition-colors uppercase">
                      Curated Elegance
                    </span>
                    <span className="text-xl md:text-2xl font-extrabold tracking-widest text-white uppercase font-outfit mt-1">
                      Neckties
                    </span>
                    <span className="w-6 h-[2px] bg-[#7b0323] group-hover:w-24 transition-all duration-500 mt-2" />

                    {/* Tiny CTA text that fades in on hover */}
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/0 group-hover:text-white/80 transition-all duration-500 uppercase mt-3">
                      Explore Collection →
                    </span>
                  </div>
                </Link>

                {/* Category 2: Cufflinks */}
                <Link
                  href="/shop?category=cufflinks"
                  className="group relative flex flex-col rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/5] bg-zinc-950 border border-zinc-800/40 hover:border-[#d4af37]/50 transition-all duration-500 shadow-xl hover:shadow-[#d4af37]/10"
                >
                  {/* Image */}
                  <div className="absolute inset-0 w-full h-full transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <Image
                      src="/cufflinks_category.png"
                      alt="Cufflinks Collection"
                      fill
                      sizes="(max-width: 640px) 100vw, 450px"
                      className="object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-500"
                    />
                  </div>
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />

                  {/* Card Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end items-center z-20 gap-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-bold tracking-[0.4em] text-[#d4af37] group-hover:text-yellow-400 transition-colors uppercase">
                      Bespoke Details
                    </span>
                    <span className="text-xl md:text-2xl font-extrabold tracking-widest text-white uppercase font-outfit mt-1">
                      Cufflinks
                    </span>
                    <span className="w-6 h-[2px] bg-[#d4af37] group-hover:w-24 transition-all duration-500 mt-2" />

                    {/* Tiny CTA text that fades in on hover */}
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/0 group-hover:text-white/80 transition-all duration-500 uppercase mt-3">
                      Explore Collection →
                    </span>
                  </div>
                </Link>

              </div>
            </section>

            {/* Section 3: Woven with Intention (Infinite Scrolling ties section) */}
            <section className="relative z-20 w-full bg-white text-zinc-950 pb-16 pt-16 flex flex-col items-center overflow-visible shrink-0">

              {/* Elegant multi-layered geometric slant divider connecting perfectly to edges */}
              <div className="absolute top-0 left-0 w-full h-16 md:h-28 -translate-y-[99%] pointer-events-none overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1440 100"
                  fill="none"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Layer 1: Wine red background offset slant */}
                  <path
                    d="M 0 100 L 1440 20 L 1440 100 Z"
                    fill="#7b0323"
                  />
                  {/* Layer 2: Main solid foreground slant */}
                  <path
                    d="M 0 100 L 1440 50 L 1440 100 Z"
                    fill="#ffffff"
                  />
                </svg>
              </div>

              {/* Subtle top decoration bar */}
              <div className="w-16 h-[4px] bg-zinc-300 rounded-full mb-8 opacity-40 z-10" />

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center gap-2 mb-12 text-center px-4">
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.4em] text-[#7b0323] uppercase">
                  Franley Signature
                </span>
                <h2 className="text-3xl md:text-5xl font-normal text-zinc-950 tracking-wide font-[family-name:var(--font-playfair)] mt-2">
                  Woven with Intention
                </h2>
                <div className="w-12 h-[2px] bg-[#7b0323] mt-4" />
                <p className="text-zinc-600 text-xs md:text-sm max-w-lg mt-4 font-medium leading-relaxed font-outfit">
                  Immaculate textures, precise drape — handcrafted silk neckwear designed to define your presence.
                </p>
              </div>

              {/* Infinite Horizontal Marquee */}
              <div className="w-full overflow-hidden relative group/marquee py-6 mb-10">
                {/* Fade overlays on edges for smooth premium transition */}
                <div className="absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                {/* Marquee Wrapper */}
                <div className="flex gap-8 md:gap-12 w-max marquee-scroll group-hover/marquee:[animation-play-state:paused]">
                  {/* We render ties twice to ensure infinite scrolling loop */}
                  {[...Array(2)].map((_, loopIdx) => (
                    <div key={loopIdx} className="flex gap-8 md:gap-12 shrink-0">
                      {products
                        .filter((p) => p.category.toLowerCase() === "neckties")
                        .map((product, idx) => (
                          <div
                            key={`${product.id}-${loopIdx}-${idx}`}
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="w-56 md:w-64 flex flex-col items-center text-center cursor-pointer group/card"
                          >
                            {/* Product Visual Container */}
                            <div className="w-full aspect-[4/5] relative mb-4 flex items-center justify-center transition-all duration-300 group-hover/card:-translate-y-1">
                              <Image
                                src={product.images && product.images.length > 0 ? product.images[0] : `/tie1.webp`}
                                alt={product.name}
                                width={220}
                                height={275}
                                style={{ objectFit: "contain" }}
                                className="transform group-hover/card:scale-105 transition-transform duration-500 ease-out"
                              />
                            </div>

                            {/* Product Info */}
                            <h3 className="text-xs sm:text-sm font-bold text-zinc-950 group-hover/card:text-[#7b0323] transition-colors tracking-wide font-outfit line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium font-outfit mt-1">
                              {product.price}
                            </p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 4: Split Video Banner Section (Neckties & Cufflinks Showcase) */}
            <section className="relative z-20 w-full bg-[#0a0a0f] flex flex-col md:flex-row h-[40vh] md:h-[55vh] overflow-hidden shrink-0">

              {/* Left Side: Neckties Video Panel */}
              <div
                onClick={() => router.push("/shop?category=neckties")}
                className="flex-1 relative overflow-hidden cursor-pointer"
              >
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  src="/Gentleman_adjusting_silk_tie_202606190017.mp4"
                />
              </div>

              {/* Right Side: Cufflinks Video Panel */}
              <div
                onClick={() => router.push("/shop?category=cufflinks")}
                className="flex-1 relative overflow-hidden cursor-pointer"
              >
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  src="/Man_fastening_silver_cufflink_202606190020.mp4"
                />
              </div>
            </section>

            {/* Section 5: Sculpted for Elegance (Infinite Scrolling Cufflinks Section) */}
            <section className="relative z-20 w-full bg-white text-zinc-950 pb-16 pt-16 flex flex-col items-center overflow-visible shrink-0">

              {/* Elegant multi-layered geometric slant divider connecting perfectly to edges */}
              <div className="absolute top-0 left-0 w-full h-8 md:h-12 -translate-y-[99%] pointer-events-none overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1440 100"
                  fill="none"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Layer 1: Wine red background offset slant */}
                  <path
                    d="M 0 100 L 1440 20 L 1440 100 Z"
                    fill="#7b0323"
                  />
                  {/* Layer 2: Main solid foreground slant */}
                  <path
                    d="M 0 100 L 1440 50 L 1440 100 Z"
                    fill="#ffffff"
                  />
                </svg>
              </div>

              {/* Subtle top decoration bar */}
              <div className="w-16 h-[4px] bg-zinc-300 rounded-full mb-8 opacity-40 z-10" />

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center gap-2 mb-12 text-center px-4">
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.4em] text-[#d4af37] uppercase font-outfit">
                  Franley Accents
                </span>
                <h2 className="text-3xl md:text-5xl font-normal text-zinc-950 tracking-wide font-[family-name:var(--font-playfair)] mt-2">
                  Sculpted for Elegance
                </h2>
                <div className="w-12 h-[2px] bg-[#d4af37] mt-4" />
                <p className="text-zinc-600 text-xs md:text-sm max-w-lg mt-4 font-medium leading-relaxed font-outfit">
                  Precision-engineered sterling silver, genuine obsidian, and iridescent mother of pearl—crafted to define the modern cuff.
                </p>
              </div>

              {/* Infinite Horizontal Marquee */}
              <div className="w-full overflow-hidden relative group/marquee py-6 mb-10">
                {/* Fade overlays on edges for smooth premium transition */}
                <div className="absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                {/* Marquee Wrapper */}
                <div className="flex gap-8 md:gap-12 w-max marquee-scroll group-hover/marquee:[animation-play-state:paused]">
                  {/* We render cufflinks twice to ensure infinite scrolling loop */}
                  {[...Array(2)].map((_, loopIdx) => (
                    <div key={loopIdx} className="flex gap-8 md:gap-12 shrink-0">
                      {products
                        .filter((p) => p.category.toLowerCase() === "cufflinks")
                        .map((product, idx) => (
                          <div
                            key={`${product.id}-${loopIdx}-${idx}`}
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="w-56 md:w-64 flex flex-col items-center text-center cursor-pointer group/card"
                          >
                            {/* Product Visual Container */}
                            <div className="w-full aspect-[4/5] relative mb-4 flex items-center justify-center transition-all duration-300 group-hover/card:-translate-y-1">
                              <Image
                                src={product.images && product.images.length > 0 ? product.images[0] : `/cuffling1.webp`}
                                alt={product.name}
                                width={220}
                                height={275}
                                style={{ objectFit: "contain" }}
                                className="transform group-hover/card:scale-105 transition-transform duration-500 ease-out"
                              />
                            </div>

                            {/* Product Info */}
                            <h3 className="text-xs sm:text-sm font-bold text-zinc-950 group-hover/card:text-[#d4af37] transition-colors tracking-wide font-outfit line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium font-outfit mt-1">
                              {product.price}
                            </p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5.5: Full Width Slogan & Brand Image Banner */}
            <section className="relative z-20 w-full h-[60vh] md:h-[80vh] shrink-0 overflow-hidden bg-black border-y-[6px] md:border-y-[8px] border-[#7b0323]">
              <Image
                src="/i_want_you_to_recreate_202606190052.jpeg"
                alt="Franley - The Art of Modern Man Banner"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </section>

            {/* Section 5.6: Style Insights & Journal (Blog Section) */}
            <section className="relative z-20 w-full bg-[#0a0a0f] text-white pb-24 pt-20 px-6 lg:px-12 flex flex-col items-center shrink-0 border-b border-zinc-800">
              {/* Subtle top decoration bar */}
              <div className="w-16 h-[4px] bg-zinc-800 rounded-full mb-8 opacity-20" />

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center gap-2 mb-16 text-center">
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.4em] text-[#d4af37] uppercase font-outfit">
                  FRANLEY JOURNAL
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider font-outfit mt-1">
                  STYLE INSIGHTS & JOURNAL
                </h2>
                <div className="w-12 h-[2px] bg-[#7b0323] mt-3" />
                <p className="text-zinc-400 text-xs md:text-sm max-w-md mt-3 font-medium leading-relaxed font-outfit">
                  Explore style guides, sartorial history, and care advice curated for the discerning modern gentleman.
                </p>
              </div>

              {/* Blog Grid (3 posts) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-2 md:px-6 mb-12">
                {BLOG_POSTS.slice(0, 3).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-[2rem] overflow-hidden bg-zinc-950/40 border border-zinc-900 hover:border-[#7b0323]/50 transition-all duration-[550ms] shadow-xl hover:shadow-[#7b0323]/5 flex-1"
                  >
                    {/* Image Container */}
                    <div className="w-full aspect-[16/10] relative overflow-hidden bg-zinc-900 shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                      />
                    </div>
                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Category & Date */}
                        <div className="flex items-center gap-2 mb-3.5">
                          <span className="text-[9px] font-bold tracking-widest text-[#d4af37] uppercase bg-[#d4af37]/5 px-2.5 py-1 rounded-md border border-[#d4af37]/15">
                            {post.category}
                          </span>
                          <span className="text-[9px] font-semibold text-zinc-500 tracking-wider">
                            {post.date}
                          </span>
                        </div>
                        {/* Title */}
                        <h3 className="text-base md:text-lg font-bold text-white leading-snug tracking-wide group-hover:text-[#d4af37] transition-colors duration-300 font-outfit mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        {/* Excerpt */}
                        <p className="text-zinc-400 text-xs font-medium leading-relaxed line-clamp-3 mb-6">
                          {post.excerpt}
                        </p>
                      </div>
                      {/* Read Time & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50 mt-auto">
                        <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                          {post.readTime}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-white group-hover:text-[#d4af37] transition-colors duration-300 uppercase flex items-center gap-1">
                          READ ARTICLE <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View All Button */}
              <Link
                href="/blog"
                className="bg-transparent border border-white/20 text-white text-xs sm:text-sm font-bold tracking-widest px-8 py-3.5 rounded-full hover:bg-white/5 hover:border-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 uppercase text-center min-w-[180px]"
              >
                View All Articles
              </Link>
            </section>

            {/* Section 5.7: Frequently Asked Questions (FAQ Section) */}
            <section className="relative z-20 w-full bg-white text-zinc-950 pb-24 pt-20 px-6 lg:px-12 flex flex-col items-center shrink-0">
              {/* Subtle top decoration bar */}
              <div className="w-16 h-[4px] bg-zinc-200 rounded-full mb-8 opacity-40 z-10" />

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center gap-2 mb-16 text-center px-4">
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.4em] text-[#7b0323] uppercase">
                  CLIENT SERVICES & CARE
                </span>
                <h2 className="text-3xl md:text-5xl font-normal text-zinc-950 tracking-wide font-[family-name:var(--font-playfair)] mt-2">
                  Frequently Asked Questions
                </h2>
                <div className="w-12 h-[2px] bg-[#7b0323] mt-4" />
                <p className="text-zinc-650 text-xs md:text-sm max-w-md mt-4 font-medium leading-relaxed font-outfit">
                  Find answers to shipping, product details, material care guidelines, and custom luxury corporate solutions.
                </p>
              </div>

              {/* Accordion List */}
              <div className="w-full max-w-3xl flex flex-col gap-4 px-2 md:px-6">
                {[
                  {
                    q: "How do I care for my Franley silk neckties?",
                    a: "We recommend dry cleaning only for all Franley neckties to preserve the natural silk luster and structural interlining. Store them rolled loosely in a necktie drawer or hung on a dedicated hanger. Avoid folding or placing heavy objects on top to prevent permanent creasing."
                  },
                  {
                    q: "What premium materials are used in Franley cufflinks?",
                    a: "Franley cufflinks are crafted using high-grade metal bases, plated in premium materials like 18k yellow gold, platinum, or sterling silver. We feature insert inlays ranging from mother of pearl and obsidian to handcrafted enamel, ensuring lasting scratch resistance and timeless sophistication."
                  },
                  {
                    q: "How long does shipping take within Sri Lanka?",
                    a: "We offer secure, tracked door-to-door delivery across Sri Lanka. Orders inside Colombo and the Western Province are typically delivered in 1-2 business days. For outstation regions, delivery takes 3-5 business days. Free shipping is automatically applied to all store orders."
                  },
                  {
                    q: "What is your return and exchange policy?",
                    a: "We offer hassle-free exchanges or store credit within 14 days of delivery. Items must be completely unworn, in their original packaging, and with all tags attached. Cufflinks must be returned in their original designer box. Please contact client support to arrange a return pickup."
                  },
                  {
                    q: "Do you offer corporate gifting or custom catalog designs?",
                    a: "Yes, we specialize in luxury corporate gifting. We can customize gift box assortments with neckties, cufflinks, and silk pocket squares tailored to your corporate branding. Minimum order quantities apply for custom designs. Please contact our concierge team at support@franley.lk."
                  }
                ].map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-zinc-200/80 rounded-2xl overflow-hidden transition-all duration-300 bg-zinc-50/20 hover:bg-zinc-50/50"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left font-outfit border-0 bg-transparent cursor-pointer group"
                      >
                        <span className="text-sm md:text-base font-bold text-zinc-950 group-hover:text-[#7b0323] transition-colors duration-300 leading-snug pr-4">
                          {item.q}
                        </span>
                        <span className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-650 font-bold text-xs shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-[#7b0323]/5 text-[#7b0323]" : "group-hover:bg-[#7b0323]/5 group-hover:text-[#7b0323]"}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </span>
                      </button>
                      
                      <div
                        className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                          isOpen ? "max-h-[300px] opacity-100 border-t border-zinc-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="p-5 md:p-6 text-xs md:text-sm text-zinc-550 leading-relaxed font-medium bg-white font-outfit">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Footer Section */}
            <section className="relative z-20 w-full bg-[#0a0a0f] pb-16 pt-16 flex flex-col items-center overflow-visible shrink-0">
              <Footer />
            </section>

          </div>

        </main>
      </div>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div
          onClick={() => setActiveProduct(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 border border-[#7b0323]/20/80 shadow-2xl rounded-3xl p-6 md:p-8 max-w-sm sm:max-w-md w-full relative z-[101] text-center transform scale-100 transition-all duration-300 animate-in zoom-in-95"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full p-2 transition-colors cursor-pointer border-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Category Icon */}
            <div className="flex justify-center mb-5">
              <div className="p-5 bg-[#7b0323]/5 rounded-2xl text-[#7b0323] border border-[#7b0323]/10 shadow-inner inline-flex">
                {activeProduct.icon}
              </div>
            </div>

            {/* Content */}
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#7b0323] uppercase mb-1 block">
              {activeProduct.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 font-outfit mb-2">
              {activeProduct.name}
            </h3>
            <div className="text-lg font-black text-[#7b0323] mb-4 font-outfit">
              {activeProduct.price}
            </div>
            <div
              className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 font-medium rich-text-content"
              dangerouslySetInnerHTML={{ __html: activeProduct.description }}
            />

            {/* Color Variant Selector */}
            <div className="mb-5 flex flex-col items-center">
              <span className="text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase mb-2">
                Color: <span className="text-zinc-800 font-bold">{activeColor}</span>
              </span>
              <div className="flex gap-2.5 justify-center">
                {getProductColors(activeProduct).map((col) => {
                  const hex = getColorHex(col);
                  const isWhite = hex === "#ffffff" || hex === "#f4f4f5" || hex === "#f8fafc" || hex === "#e4e4e7";
                  return (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={`w-7 h-7 rounded-full border transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer ${activeColor === col
                        ? "border-[#7b0323] ring-2 ring-[#7b0323]/20 ring-offset-1 scale-105"
                        : "border-zinc-200"
                        }`}
                      style={{ backgroundColor: hex }}
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

            {/* Quantity Selector */}
            <div className="mb-6 flex flex-col items-center">
              <span className="text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase mb-2">
                Quantity
              </span>
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200/60 rounded-full px-2 py-1 shadow-inner">
                <button
                  onClick={() => setActiveQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/60 transition-colors border-0 bg-transparent text-sm font-bold cursor-pointer"
                >
                  —
                </button>
                <span className="w-8 text-center text-xs font-bold text-zinc-800 select-none">
                  {activeQuantity}
                </span>
                <button
                  onClick={() => setActiveQuantity((q) => Math.min(10, q + 1))}
                  className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/60 transition-colors border-0 bg-transparent text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  addToCart(activeProduct, activeQuantity, activeColor);
                  setActiveProduct(null);
                }}
                className="w-full bg-zinc-950 text-white text-xs font-bold tracking-widest py-3 rounded-full hover:bg-zinc-800 transition-all duration-300 shadow-md shadow-zinc-950/10 cursor-pointer border-0"
              >
                ADD TO CART
              </button>
              <button
                onClick={() => {
                  addToCart(activeProduct, activeQuantity, activeColor);
                  setActiveProduct(null);
                  setIsCartOpen(true);
                }}
                className="w-full bg-[#7b0323] text-white text-xs font-bold tracking-widest py-3 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in cursor-pointer"
          />

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white flex flex-col shadow-2xl z-[121] transform animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">

            {/* Drawer Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#7b0323] animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
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

            {/* Drawer Body: Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400 select-none">
                  <div className="p-6 bg-[#7b0323]/5 rounded-full text-[#7b0323]/60 border border-[#7b0323]/10/30 shadow-inner">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
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
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0 flex items-center justify-center p-1 relative">
                      <Image
                        src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : `/products/${item.product.id}.webp`}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        style={{ objectFit: "contain" }}
                        loading="eager"
                      />
                    </div>

                    {/* Details */}
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

                      {/* Quantity Selector inside cart item */}
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
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/50 transition-colors border-0 bg-transparent text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price & Delete */}
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
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-zinc-950 font-extrabold">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-550 font-semibold">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-extrabold text-[10px] tracking-wide">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-550 font-semibold border-b border-zinc-200/50 pb-2">
                    <span>Estimated Taxes</span>
                    <span className="text-zinc-800 font-bold">Rs. 0</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-zinc-950 font-outfit uppercase tracking-widest">
                    <span>Total Amount</span>
                    <span className="text-[#7b0323] text-base font-black font-outfit">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-[#7b0323] text-white text-xs font-bold tracking-widest py-3.5 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md shadow-[#7b0323]/15 cursor-pointer border-0 flex items-center justify-center gap-2 text-center"
                  >
                    VIEW CART
                  </Link>
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
          <svg className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {searchToast.toUpperCase()}
        </div>
      )}

      {/* Category Selection Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          {/* Modal Close Backplate */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCategoryModalOpen(false)} />

          {/* Modal Container */}
          <div className="relative bg-[#0a0a0f] border border-zinc-800/80 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-[90%] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 flex flex-col items-center gap-8 md:gap-10 text-center transform scale-100 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors duration-200 border-0 bg-transparent cursor-pointer p-2 rounded-full hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] md:text-xs font-semibold tracking-[0.55em] text-[#d4af37] uppercase font-outfit">
                Franley Luxury
              </span>
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider font-outfit">
                Select Collection
              </h2>
              <div className="w-12 h-[2px] bg-[#7b0323] self-center mt-2" />
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
              {/* Option 1: Neckties */}
              <Link
                href="/shop?category=neckties"
                onClick={() => setIsCategoryModalOpen(false)}
                className="group relative flex flex-col rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-800/40 hover:border-[#7b0323]/50 transition-all duration-500 shadow-lg hover:shadow-[#7b0323]/10"
              >
                {/* Image */}
                <div className="absolute inset-0 w-full h-full transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <Image
                    src="/neckties_category.png"
                    alt="Neckties Collection"
                    fill
                    sizes="260px"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0" />
                {/* Card Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-center z-10 gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[9px] font-bold tracking-[0.4em] text-zinc-400 uppercase">
                    Discover
                  </span>
                  <span className="text-lg md:text-xl font-extrabold tracking-widest text-white uppercase font-outfit">
                    Neckties
                  </span>
                  <span className="w-6 h-[1.5px] bg-[#7b0323] group-hover:w-16 transition-all duration-500 mt-2" />
                </div>
              </Link>

              {/* Option 2: Cufflinks */}
              <Link
                href="/shop?category=cufflinks"
                onClick={() => setIsCategoryModalOpen(false)}
                className="group relative flex flex-col rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-800/40 hover:border-[#d4af37]/50 transition-all duration-500 shadow-lg hover:shadow-[#d4af37]/10"
              >
                {/* Image */}
                <div className="absolute inset-0 w-full h-full transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <Image
                    src="/cufflinks_category.png"
                    alt="Cufflinks Collection"
                    fill
                    sizes="260px"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0" />
                {/* Card Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-center z-10 gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[9px] font-bold tracking-[0.4em] text-zinc-400 uppercase">
                    Discover
                  </span>
                  <span className="text-lg md:text-xl font-extrabold tracking-widest text-white uppercase font-outfit">
                    Cufflinks
                  </span>
                  <span className="w-6 h-[1.5px] bg-[#d4af37] group-hover:w-16 transition-all duration-500 mt-2" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <Preloader
          onComplete={(assets) => {
            setPreloadedAssets(assets);
            setIsLoading(false);
            // Restore window overflow settings
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.documentElement.style.height = "";
            document.body.style.height = "";
            document.documentElement.style.width = "";
            document.body.style.width = "";
          }}
        />
      )}
    </>
  );
}
