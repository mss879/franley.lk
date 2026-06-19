"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MOCK_PRODUCTS, getColorHex, getCategoryIcon, getProductColors, Product } from "../products";
import Footer from "@/components/Footer";

interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

function ShopContent({ initialProducts }: { initialProducts?: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params
  const initialCategory = searchParams.get("category");
  const initialTag = searchParams.get("tag");
  const initialSearch = searchParams.get("q") || searchParams.get("query") || "";
  const initialCollection = searchParams.get("collection");

  // Core Product State
  const [products, setProducts] = useState<Product[]>(() =>
    (initialProducts || []).map((p) => ({
      ...p,
      icon: getCategoryIcon(p.category, p.id),
    }))
  );
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);

  // Collections State
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(initialCollection);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (!initialCategory) return "All";
    const cats = ["Neckties", "Cufflinks"];
    const matchedCat = cats.find(c => c.toLowerCase() === initialCategory.toLowerCase());
    return matchedCat || "All";
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    if (!initialTag) return [];
    return [initialTag.toLowerCase()];
  });
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sortBy, setSortBy] = useState("featured");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Product Preview Modal State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeColor, setActiveColor] = useState("");
  const [activeQuantity, setActiveQuantity] = useState(1);

  // UI States
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchToast, setSearchToast] = useState<string | null>(null);

  // Sync params on mount
  useEffect(() => {
    setMounted(true);

    // Sync categories & tags from URL query
    if (initialCategory) {
      // Find case-insensitive match in CATEGORIES
      const cats = ["Neckties", "Cufflinks"];
      const matchedCat = cats.find(c => c.toLowerCase() === initialCategory.toLowerCase());
      if (matchedCat) {
        setSelectedCategory(matchedCat);
      }
    }
    if (initialTag) {
      setSelectedTags([initialTag.toLowerCase()]);
    }
    const collectionParam = searchParams.get("collection");
    if (collectionParam) {
      setSelectedCollection(collectionParam);
    } else {
      setSelectedCollection(null);
    }

    // Load Cart from localStorage
    try {
      const savedCart = localStorage.getItem("franley_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, [initialCategory, initialTag, searchParams]);

  // Sync Cart with event listener
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

  // Fetch collections and collection products relationships from Supabase
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        if (supabase) {
          const [collectionsRes, collectionProductsRes] = await Promise.all([
            supabase.from("collections").select("*"),
            supabase.from("collection_products").select("*")
          ]);
          
          if (!collectionsRes.error && collectionsRes.data) {
            setCollections(collectionsRes.data);
          }
          if (!collectionProductsRes.error && collectionProductsRes.data) {
            setCollectionProducts(collectionProductsRes.data);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch collections or join table data from Supabase:", e);
      }
    };
    fetchCollections();
  }, []);

  // Fetch products from Supabase (offline fallback to MOCK_PRODUCTS)
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
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
              colors: item.colors || [],
              images: item.images || [],
              tags: item.tags || [],
              features: item.features || [],
              metaTitle: item.meta_title || "",
              icon: getCategoryIcon(item.category, item.id)
            }));
            setProducts(mapped);
          } else {
            setProducts(MOCK_PRODUCTS);
          }
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.warn("Supabase fetch failed, using mock data:", err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update dynamic max price range once products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => parsePrice(p.price));
      const maxP = Math.max(...prices);
      setMaxPrice(Math.ceil(maxP));
    }
  }, [products]);

  // Helper to parse price string to number
  const parsePrice = (priceStr: string) => {
    const cleanStr = priceStr.replace(/rs\.?/i, "").replace(/[^0-9.]/g, "");
    return parseFloat(cleanStr) || 0;
  };

  // Cart operations
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

    // Toast notice
    showToast(`Added ${product.name} (${color}) to cart`);
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

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  );

  const showToast = (message: string) => {
    setSearchToast(message);
    setTimeout(() => setSearchToast(null), 3000);
  };

  // Unique tags across fetched products
  const allTags = Array.from(
    new Set(products.flatMap((p) => p.tags || []))
  ).filter(Boolean).sort();

  // Filter Categories list
  const CATEGORIES = ["All", "Neckties", "Cufflinks"];

  // Toggle tag checkboxes
  const handleTagToggle = (tag: string) => {
    const normTag = tag.toLowerCase();
    if (selectedTags.includes(normTag)) {
      setSelectedTags(selectedTags.filter((t) => t !== normTag));
    } else {
      setSelectedTags([...selectedTags, normTag]);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedTags([]);
    setSearchQuery("");
    setSelectedCollection(null);
    if (products.length > 0) {
      const prices = products.map(p => parsePrice(p.price));
      setMaxPrice(Math.ceil(Math.max(...prices)));
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const tagsList = p.tags || [];
    const matchesSearch = !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagsList.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesTags = selectedTags.length === 0 ||
      (tagsList.length > 0 && selectedTags.some(tag => tagsList.map(t => t.toLowerCase()).includes(tag.toLowerCase())));

    const productPrice = parsePrice(p.price);
    const matchesPrice = productPrice <= maxPrice;

    let matchesCollection = true;
    if (selectedCollection) {
      const collection = collections.find(
        (c) => c.id.toLowerCase() === selectedCollection.toLowerCase()
      );
      if (!collection) {
        matchesCollection = false;
      } else {
        if (collection.type === "smart") {
          const matchTags = (collection.rules?.tags || []).map((t: string) => t.toLowerCase());
          const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
          matchesCollection = matchTags.some((t: string) => pTags.includes(t));
        } else {
          matchesCollection = collectionProducts.some(
            (cp) => cp.collection_id === collection.id && cp.product_id === p.id
          );
        }
      }
    }

    return matchesSearch && matchesCategory && matchesTags && matchesPrice && matchesCollection;
  });

  // Sorted Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low-high") {
      return parsePrice(a.price) - parsePrice(b.price);
    }
    if (sortBy === "price-high-low") {
      return parsePrice(b.price) - parsePrice(a.price);
    }
    if (sortBy === "discount") {
      // compare discount values, e.g. "30% OFF" -> 30
      const getDiscVal = (d: string) => parseInt(d.replace(/[^0-9]/g, "")) || 0;
      return getDiscVal(b.discount) - getDiscVal(a.discount);
    }
    // "featured" default: keep original order
    return 0;
  });

  // Category counts helpers
  const getCategoryCount = (catName: string) => {
    if (catName === "All") return products.length;
    return products.filter(p => p.category.toLowerCase() === catName.toLowerCase()).length;
  };



  const activeCollectionObj = selectedCollection 
    ? collections.find(c => c.id.toLowerCase() === selectedCollection.toLowerCase())
    : null;

  return (
    <div className="w-full min-h-screen bg-[#fdfcf9] flex flex-col font-outfit select-none relative pb-28 md:pb-16">
      
      {/* Main Catalog View Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 pt-24 md:pt-32 pb-8 md:pb-12 z-10 flex flex-col gap-6 md:gap-8">
        
        {/* Editorial Page Header */}
        <header className="mb-6 md:mb-10 text-left border-b border-zinc-200/50 pb-8 relative">
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#7b0323] uppercase block mb-3 font-outfit">
            {activeCollectionObj 
              ? `COLLECTION: ${activeCollectionObj.name.toUpperCase()}` 
              : selectedCollection 
                ? `COLLECTION: ${selectedCollection.toUpperCase()}` 
                : "THE FRANLEY COLLECTION"}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-normal text-zinc-950 tracking-tight leading-[1.05] mb-6">
            {activeCollectionObj 
              ? activeCollectionObj.name 
              : selectedCollection 
                ? selectedCollection 
                : <>Sartorial <span className="italic font-normal">Storefront</span></>}
          </h1>
          <p className="text-zinc-650 text-sm md:text-[15px] font-medium tracking-wide max-w-2xl leading-relaxed font-outfit">
            {activeCollectionObj 
              ? activeCollectionObj.description 
              : selectedCollection 
                ? `Browse our selected products in the ${selectedCollection} collection.` 
                : "Discover our exclusive collection of handcrafted mulberry silk neckties, designer cufflinks, premium leather belts, and luxury gift sets curated for the modern gentleman."}
          </p>
          <div className="absolute bottom-0 left-0 w-24 h-[3px] bg-[#d4af37]" />
        </header>

        {/* Search & Sort Panel */}
        <div className="w-full bg-white/80 backdrop-blur-md border border-zinc-200/60 rounded-[1.5rem] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
          
          {/* Local Search Input */}
          <div className="relative w-full sm:max-w-md flex items-center bg-zinc-50/50 border border-zinc-200/80 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-[#d4af37]/65 transition-all duration-350 shadow-inner">
            <svg className="w-4 h-4 text-[#7b0323] shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search accessories, silk ties, cufflinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer border-0 bg-transparent p-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Controls: Mobile filters toggle & Sort options */}
          <div className="flex gap-3 items-center w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200/85 text-zinc-800 text-xs font-bold tracking-widest px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer border-0 shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              FILTERS
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase hidden sm:inline-block">SORT BY:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-xs font-bold text-zinc-850 px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#7b0323] transition-all cursor-pointer"
              >
                <option value="featured">Featured Items</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="discount">Biggest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Left Filters Sidebar, Right Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-24 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin text-left">
            <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col gap-6">
              
              {/* Filter Header */}
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h2 className="text-xs font-black tracking-widest text-zinc-950 uppercase">Filter Options</h2>
                {(selectedCategory !== "All" || selectedTags.length > 0 || searchQuery || maxPrice < 500) && (
                  <button 
                    onClick={handleResetFilters}
                    className="text-[9px] font-black tracking-widest text-[#7b0323] hover:text-[#7b0323] transition-colors uppercase cursor-pointer border-0 bg-transparent"
                  >
                    RESET ALL
                  </button>
                )}
              </div>

              {/* Category Filter Group */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Categories</h3>
                <div className="flex flex-col gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex justify-between items-center px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border-0 text-left ${
                        selectedCategory === cat
                          ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/10 scale-102"
                          : "bg-transparent text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                        selectedCategory === cat ? "bg-[#8e1534] text-[#7b0323]/10" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {getCategoryCount(cat)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter Group */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Max Price</h3>
                  <span className="text-xs font-extrabold text-[#7b0323]">Rs. {maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="150000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-[#7b0323] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-400 font-bold">
                  <span>Rs. 0</span>
                  <span>Rs. 150,000</span>
                </div>
              </div>

              {/* Tags Filter Group */}
              {allTags.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Product Tags</h3>
                  <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`text-[9px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-[#7b0323]/5 border-[#7b0323] text-[#7b0323] shadow-xs" 
                              : "bg-white border-zinc-200 text-zinc-550 hover:border-zinc-350 hover:text-zinc-800"
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* Right Product Grid */}
          <section className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Active Filters Summary Pills */}
            {(selectedCategory !== "All" || selectedTags.length > 0 || searchQuery || selectedCollection) && (
              <div className="flex flex-wrap gap-2 items-center text-left">
                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Active filters:</span>
                
                {selectedCategory !== "All" && (
                  <span className="bg-[#7b0323]/5 border border-[#7b0323]/20 text-[#7b0323] text-[10px] font-bold tracking-wide px-3 py-1 rounded-full flex items-center gap-1">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("All")} className="text-[#d4af37] hover:text-[#7b0323] border-0 bg-transparent font-bold cursor-pointer">×</button>
                  </span>
                )}

                {selectedTags.map((tag) => (
                  <span key={tag} className="bg-[#7b0323]/5 border border-[#7b0323]/20 text-[#7b0323] text-[10px] font-bold tracking-wide px-3 py-1 rounded-full flex items-center gap-1 uppercase">
                    #{tag}
                    <button onClick={() => handleTagToggle(tag)} className="text-[#d4af37] hover:text-[#7b0323] border-0 bg-transparent font-bold cursor-pointer">×</button>
                  </span>
                ))}

                {searchQuery && (
                  <span className="bg-[#7b0323]/5 border border-[#7b0323]/20 text-[#7b0323] text-[10px] font-bold tracking-wide px-3 py-1 rounded-full flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="text-[#d4af37] hover:text-[#7b0323] border-0 bg-transparent font-bold cursor-pointer">×</button>
                  </span>
                )}

                {selectedCollection && (
                  <span className="bg-[#7b0323]/5 border border-[#7b0323]/20 text-[#7b0323] text-[10px] font-bold tracking-wide px-3 py-1 rounded-full flex items-center gap-1">
                    Collection: {collections.find(c => c.id.toLowerCase() === selectedCollection.toLowerCase())?.name || selectedCollection}
                    <button onClick={() => setSelectedCollection(null)} className="text-[#d4af37] hover:text-[#7b0323] border-0 bg-transparent font-bold cursor-pointer">×</button>
                  </span>
                )}

                <button 
                  onClick={handleResetFilters}
                  className="text-[9px] font-bold text-zinc-400 hover:text-[#7b0323] transition-colors uppercase border-0 bg-transparent cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results count info */}
            <div className="text-left text-xs font-bold text-zinc-450 uppercase tracking-widest flex items-center justify-between border-b border-zinc-200/50 pb-3">
              <span>Showing {sortedProducts.length} Luxury Accessories</span>
              {loading && <div className="w-4 h-4 border-2 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />}
            </div>

            {/* Product Card Listing Grid */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white border border-zinc-200/60 rounded-[2.5rem] p-12 md:p-20 text-center flex flex-col items-center gap-6 shadow-sm w-full mt-4">
                <div className="p-6 bg-[#7b0323]/5 rounded-full text-[#7b0323]/60 border border-[#7b0323]/10/30 shadow-inner">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-md font-extrabold text-zinc-950 uppercase tracking-widest">No Products Match Filters</h2>
                  <p className="text-zinc-500 text-xs sm:text-sm font-medium max-w-sm leading-relaxed">
                    Try adjusting your category selection, relaxing the price range limits, or checking off some tag badges.
                  </p>
                </div>
                <button 
                  onClick={handleResetFilters}
                  className="bg-[#7b0323] text-white text-xs font-bold tracking-widest px-8 py-3.5 rounded-full hover:bg-[#8e1534] transition-all duration-300 shadow-md cursor-pointer border-0"
                >
                  RESET FILTER SELECTIONS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => {
                  const hasVariants = getProductColors(product).length > 1;
                  return (
                    <div 
                      key={product.id}
                      className="group bg-white border border-zinc-200/60 hover:border-[#d4af37]/60 hover:shadow-[0_12px_24px_rgba(123,3,35,0.04)] rounded-[2.2rem] p-4 flex flex-col justify-between transition-all duration-350 transform hover:-translate-y-1 relative"
                    >
                      {/* Badge and Quick Add actions */}
                      <div className="flex justify-between items-center z-10 relative">
                        <span className="text-[8px] font-black tracking-widest text-[#7b0323] bg-[#7b0323]/5 border border-[#7b0323]/10/60 px-3 py-1 rounded-full uppercase">
                          {product.category}
                        </span>
                        {product.discount && (
                          <span className="text-[8px] font-black tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2.5 py-1 rounded-full">
                            {product.discount}
                          </span>
                        )}
                      </div>

                      {/* Product Visual */}
                      <div 
                        onClick={() => {
                          router.push(`/product/${product.id}`);
                        }}
                        className="w-full h-44 my-4 flex items-center justify-center relative overflow-hidden rounded-2xl bg-zinc-50/20 cursor-pointer"
                      >
                        <Image 
                          src={product.images && product.images.length > 0 ? product.images[0] : `/products/${product.id}.webp`}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          style={{ objectFit: "contain", padding: "8px" }}
                          className="transform group-hover:scale-106 transition-transform duration-500 ease-out"
                        />
                      </div>

                      {/* Product Content Details */}
                      <div className="text-left flex-grow flex flex-col justify-between gap-3">
                        <div>
                          {/* Title */}
                          <h3 
                            onClick={() => {
                              router.push(`/product/${product.id}`);
                            }}
                            className="text-base font-bold text-zinc-950 hover:text-[#7b0323] transition-colors tracking-tight font-playfair line-clamp-1 cursor-pointer"
                          >
                            {product.name}
                          </h3>
                          
                          {/* Slashed Prices */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-[#7b0323] font-outfit">{product.price}</span>
                            {product.slashedPrice && (
                              <span className="text-xs font-semibold text-zinc-400 line-through font-outfit">{product.slashedPrice}</span>
                            )}
                          </div>

                          <p className="text-[11px] text-zinc-500 mt-2 font-medium leading-relaxed line-clamp-2">
                            {product.description ? product.description.replace(/<[^>]*>/g, '') : ''}
                          </p>
                        </div>

                        {/* Footer details: Color dots & Add to cart button */}
                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between mt-auto">
                          {/* Color dots preview */}
                          <div className="flex gap-1.5 items-center">
                            {getProductColors(product).slice(0, 3).map((col) => (
                              <span 
                                key={col} 
                                className="w-2.5 h-2.5 rounded-full border border-zinc-200"
                                style={{ backgroundColor: getColorHex(col) }}
                                title={col}
                              />
                            ))}
                            {getProductColors(product).length > 3 && (
                              <span className="text-[8px] font-bold text-zinc-400">+{getProductColors(product).length - 3}</span>
                            )}
                          </div>

                          {/* Quick Purchase Trigger */}
                          <button
                            onClick={() => {
                              if (hasVariants) {
                                router.push(`/product/${product.id}`);
                              } else {
                                // Add directly
                                addToCart(product, 1, getProductColors(product)[0]);
                              }
                            }}
                            className="bg-[#7b0323] hover:bg-[#8e1534] hover:scale-105 active:scale-95 text-white font-bold text-[9px] tracking-widest px-4 py-2 rounded-full border-0 transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-xs shadow-[#7b0323]/10"
                          >
                            {hasVariants ? "CHOOSE OPTIONS" : "ADD TO CART"}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </section>

        </div>

      </main>

      {/* Slide-over Mobile Filters Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden lg:hidden">
          <div 
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-350 cursor-pointer"
          />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white flex flex-col shadow-2xl z-[121] transform animate-in slide-in-from-left duration-300 ease-out text-left">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xs font-black tracking-widest text-zinc-950 uppercase">Filter Catalog</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-full p-2 border-0 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scrollbar-thin">
              {/* Category selector */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Categories</h3>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileFiltersOpen(false);
                      }}
                      className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer text-left ${
                        selectedCategory === cat
                          ? "bg-[#7b0323] text-white"
                          : "bg-transparent text-zinc-650 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                        selectedCategory === cat ? "bg-[#8e1534] text-[#7b0323]/10" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {getCategoryCount(cat)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Max Price</h3>
                  <span className="text-xs font-extrabold text-[#7b0323]">Rs. {maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="150000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-[#7b0323]"
                />
              </div>

              {/* Tags Selector */}
              {allTags.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Product Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`text-[9px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-[#7b0323]/5 border-[#7b0323] text-[#7b0323]" 
                              : "bg-white border-zinc-200 text-zinc-550"
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-2">
              <button 
                onClick={() => {
                  handleResetFilters();
                  setMobileFiltersOpen(false);
                }}
                className="w-1/2 bg-white border border-zinc-200 text-zinc-650 hover:bg-zinc-100 text-[10px] font-bold tracking-widest py-3 rounded-full border-0 cursor-pointer"
              >
                RESET
              </button>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="w-1/2 bg-[#7b0323] text-white hover:bg-[#8e1534] text-[10px] font-bold tracking-widest py-3 rounded-full border-0 cursor-pointer"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer (Unified import) */}
      <Footer />

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
            {/* Close */}
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

            {/* Modal Content */}
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#7b0323] uppercase mb-1 block">
              {activeProduct.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 font-outfit mb-2">
              {activeProduct.name}
            </h3>
            <div className="text-lg font-black text-[#7b0323] mb-4 font-outfit">
              {activeProduct.price}
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 font-medium">
              {activeProduct.description}
            </p>

            {/* Color Selector */}
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
                      className={`w-7 h-7 rounded-full border transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer ${
                        activeColor === col 
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

            {/* Quantity selection */}
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
                <span className="w-8 text-center text-xs font-bold text-zinc-850 select-none">
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

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  addToCart(activeProduct, activeQuantity, activeColor);
                  setActiveProduct(null);
                  setIsCartOpen(true); // Open drawer instantly for delightful UX
                }}
                className="w-full bg-[#7b0323] hover:bg-[#8e1534] text-white text-xs font-bold tracking-widest py-4 rounded-full transition-all duration-300 shadow-md shadow-[#7b0323]/10 cursor-pointer border-0"
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => setActiveProduct(null)}
                className="w-full bg-transparent hover:bg-zinc-55 text-zinc-500 hover:text-zinc-800 text-[10px] font-bold tracking-widest py-2.5 rounded-full transition-colors cursor-pointer border-0"
              >
                DISMISS DETAILS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in cursor-pointer"
          />

          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white flex flex-col shadow-2xl z-[121] transform animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between text-left">
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

            {/* Cart body */}
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
                    Looks like you haven't added any products to your cart yet.
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
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/50 transition-colors border-0 bg-transparent text-xs font-bold cursor-pointer"
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

            {/* Cart footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-4 text-left">
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
                  <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-zinc-955 font-outfit uppercase tracking-widest">
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

      {/* Toast */}
      {searchToast && (
        <div className="fixed bottom-6 right-6 bg-zinc-900/95 backdrop-blur-md text-white text-[10px] font-bold tracking-widest py-3 px-6 rounded-full shadow-2xl z-[150] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {searchToast.toUpperCase()}
        </div>
      )}

    </div>
  );
}

export default function ShopPage({ initialProducts }: { initialProducts?: Product[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Loading catalog...</span>
        </div>
      </div>
    }>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
