"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MOCK_PRODUCTS, getCategoryIcon, Product } from "../products";
import RichTextEditor from "../../components/RichTextEditor";

interface Collection {
  id: string;
  name: string;
  description: string;
  type: "manual" | "smart";
  rules: { tags: string[] };
  created_at?: string;
}

interface VisitLog {
  id: string;
  path: string;
  referrer: string;
  user_agent: string;
  ip?: string;
  country: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  name: string;
  color: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  phone_number?: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_method?: string;
  status: "pending" | "fulfilled" | "shipped" | "delivered";
  created_at: string;
  updated_at?: string;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  reason: "general_inquiries" | "product_inquiries" | "shipping_inquiries";
  message: string;
  created_at: string;
}

interface MarqueeOffer {
  id: string;
  text: string;
  row_number: number;
  created_at?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation Tabs state
  // "dashboard", "catalog", "add-product", "collections", "analytics", "orders", "contact-inquiries", "offer-section"
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productsOpen, setProductsOpen] = useState(true);

  // Authentication State
  const [adminUser, setAdminUser] = useState<string>("");

  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [activeInquiry, setActiveInquiry] = useState<ContactInquiry | null>(null);
  const [marqueeOffers, setMarqueeOffers] = useState<MarqueeOffer[]>([]);
  const [newOfferText, setNewOfferText] = useState("");
  const [newOfferRow, setNewOfferRow] = useState<number>(1);
  const [savingOffer, setSavingOffer] = useState(false);
  const [collectionProducts, setCollectionProducts] = useState<{ collection_id: string; product_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Add Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodMetaTitle, setProdMetaTitle] = useState("");
  const [prodCategory, setProdCategory] = useState("Home and kitchen");
  const [prodPrice, setProdPrice] = useState("");
  const [prodSlashedPrice, setProdSlashedPrice] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodTags, setProdTags] = useState("");
  const [prodColors, setProdColors] = useState("Matte Black, Silver Gray");
  const [prodFeatures, setProdFeatures] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Collection Form State
  const [collName, setCollName] = useState("");
  const [collDescription, setCollDescription] = useState("");
  const [collType, setCollType] = useState<"manual" | "smart">("manual");
  const [collTags, setCollTags] = useState("");
  const [collSelectedProducts, setCollSelectedProducts] = useState<string[]>([]);

  // Load Admin session & data on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem("franley_admin_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setAdminUser(session.email || "admin@franley.lk");
    }

    async function loadData() {
      setLoading(true);
      try {
        if (supabase) {
          // 1. Fetch Products
          try {
            const { data: prodData, error: prodErr } = await supabase
              .from("products")
              .select("*")
              .order("created_at", { ascending: false });
            if (prodErr) throw prodErr;

            if (prodData && prodData.length > 0) {
              const mappedProds: Product[] = prodData.map((item) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: typeof item.price === "number" ? `Rs. ${Math.round(item.price).toLocaleString()}` : item.price,
                slashedPrice: item.slashed_price ? `Rs. ${Math.round(item.slashed_price).toLocaleString()}` : "",
                discount: item.discount || "",
                description: item.description,
                color: item.color || "burgundy",
                icon: getCategoryIcon(item.category, item.id),
                images: item.images || [],
                tags: item.tags || [],
                features: item.features || [],
                metaTitle: item.meta_title || "",
              }));
              setProducts(mappedProds);
            } else {
              setProducts(MOCK_PRODUCTS);
            }
          } catch (e) {
            console.error("Failed to load products:", e);
            setProducts(MOCK_PRODUCTS);
          }

          // 2. Fetch Collections
          try {
            const { data: collData, error: collErr } = await supabase
              .from("collections")
              .select("*")
              .order("created_at", { ascending: false });
            if (collErr) throw collErr;
            if (collData && collData.length > 0) {
              setCollections(collData);
            } else {
              throw new Error("Collections empty");
            }
          } catch (e) {
            console.error("Failed to load collections:", e);
            setCollections([
              {
                id: "audio-elite",
                name: "Audio Elite",
                description: "Broadcast quality mics, reference studio monitors, and comfort-focused ANC headphones.",
                type: "smart",
                rules: { tags: ["audio"] },
              },
              {
                id: "desk-accessories",
                name: "Desk Accessories",
                description: "Elevate your desk layout with premium work gear.",
                type: "smart",
                rules: { tags: ["gear"] },
              },
              {
                id: "creator-bundle",
                name: "Creator Essentials Bundle",
                description: "The ultimate starter pack for streaming and programming.",
                type: "manual",
                rules: { tags: [] },
              },
            ]);
          }

          // Fetch Collection-Products relationships
          try {
            const { data: cpData, error: cpErr } = await supabase
              .from("collection_products")
              .select("*");
            if (cpErr) throw cpErr;
            if (cpData && cpData.length > 0) {
              setCollectionProducts(cpData);
            } else {
              throw new Error("Collection-products empty");
            }
          } catch (e) {
            console.error("Failed to load collection_products:", e);
            setCollectionProducts([
              { collection_id: "creator-bundle", product_id: "keyboard" },
              { collection_id: "creator-bundle", product_id: "mic" }
            ]);
          }

          // 3. Fetch Analytics
          try {
            const { data: visitData, error: visitErr } = await supabase
              .from("analytics_visits")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(500);
            if (visitErr) throw visitErr;
            if (visitData && visitData.length > 0) {
              setVisits(visitData);
            } else {
              throw new Error("Visits empty");
            }
          } catch (e) {
            console.error("Failed to load analytics_visits:", e);
            setVisits([
              { id: "1", path: "/", referrer: "direct", user_agent: "Mozilla", country: "United States", created_at: new Date(Date.now() - 3600000).toISOString() },
              { id: "2", path: "/product/headphones", referrer: "google.com", user_agent: "Chrome", country: "United States", created_at: new Date(Date.now() - 7200000).toISOString() },
              { id: "3", path: "/product/keyboard", referrer: "instagram.com", user_agent: "Safari", country: "United Kingdom", created_at: new Date(Date.now() - 10000000).toISOString() },
              { id: "4", path: "/", referrer: "youtube.com", user_agent: "Firefox", country: "Canada", created_at: new Date(Date.now() - 15000000).toISOString() },
              { id: "5", path: "/product/charger", referrer: "direct", user_agent: "Chrome", country: "Germany", created_at: new Date(Date.now() - 18000000).toISOString() },
              { id: "6", path: "/product/mic", referrer: "twitter.com", user_agent: "Edge", country: "Australia", created_at: new Date(Date.now() - 25000000).toISOString() },
            ]);
          }

          // 4. Fetch Orders
          try {
            const { data: orderData, error: orderErr } = await supabase
              .from("orders")
              .select("*")
              .order("created_at", { ascending: false });
            if (orderErr) throw orderErr;
            if (orderData && orderData.length > 0) {
              setOrders(orderData);
            } else {
              throw new Error("Orders empty");
            }
          } catch (e) {
            console.error("Failed to load orders:", e);
            setOrders([
              {
                id: "ORD-20260612-921A",
                customer_name: "Sarah Jenkins",
                customer_email: "sarah.j@example.com",
                shipping_address: "1524 Pine Street, San Francisco, CA, 94109",
                items: [{ id: "headphones", name: "Pro Noise-Cancelling Headphones", color: "Signature Burgundy", quantity: 1, price: "Rs. 90,000" }],
                total_amount: 90000.00,
                status: "pending",
                created_at: new Date(Date.now() - 14400000).toISOString()
              },
              {
                id: "ORD-20260611-304B",
                customer_name: "Alex Rivera",
                customer_email: "alex.rivera@example.com",
                shipping_address: "892 Broadway Apt 4B, New York, NY, 10003",
                items: [
                  { id: "keyboard", name: "Creations Mechanical Keyboard", color: "Onyx Black", quantity: 1, price: "Rs. 48,000" },
                  { id: "charger", name: "Smart Dual Wireless Charger", color: "Carbon Black", quantity: 1, price: "Rs. 27,000" }
                ],
                total_amount: 75000.00,
                status: "shipped",
                created_at: new Date(Date.now() - 86400000).toISOString()
              },
              {
                id: "ORD-20260610-855C",
                customer_name: "Evelyn Chen",
                customer_email: "evelyn.chen@gmail.com",
                shipping_address: "724 Olympic Blvd, Los Angeles, CA, 90015",
                items: [{ id: "backpack", name: "Urban Tech Backpack", color: "Slate Grey", quantity: 1, price: "Rs. 42,000" }],
                total_amount: 42000.00,
                status: "delivered",
                created_at: new Date(Date.now() - 172800000).toISOString()
              }
            ]);
          }

          // 5. Fetch Contact Inquiries
          try {
            const { data: contactData, error: contactErr } = await supabase
              .from("contact_inquiries")
              .select("*")
              .order("created_at", { ascending: false });
            if (contactErr) throw contactErr;
            if (contactData && contactData.length > 0) {
              setContactInquiries(contactData);
            } else {
              throw new Error("Contact inquiries empty");
            }
          } catch (e) {
            console.error("Failed to load contact_inquiries:", e);
            setContactInquiries([
              {
                id: "INQ-1",
                name: "Liam Johnson",
                email: "liam.johnson@example.com",
                reason: "general_inquiries",
                message: "Hello, I love your workspace aesthetic! Do you offer bulk discounts for corporate setup upgrades?",
                created_at: new Date(Date.now() - 86400000).toISOString(),
              },
              {
                id: "INQ-2",
                name: "Sophia Smith",
                email: "sophia.smith@example.com",
                reason: "product_inquiries",
                message: "Hi, is the mechanical keyboard compatible with macOS function keys out of the box?",
                created_at: new Date(Date.now() - 43200000).toISOString(),
              },
              {
                id: "INQ-3",
                name: "Jackson Davis",
                email: "jackson.davis@example.com",
                reason: "shipping_inquiries",
                message: "Hello, do you ship to international locations like Switzerland and Germany? If so, what is the ETA?",
                created_at: new Date(Date.now() - 7200000).toISOString(),
              }
            ]);
          }

          // 6. Fetch Marquee Offers
          try {
            const { data: offerData, error: offerErr } = await supabase
              .from("marquee_offers")
              .select("*")
              .order("created_at", { ascending: true });
            if (offerErr) throw offerErr;
            if (offerData && offerData.length > 0) {
              setMarqueeOffers(offerData);
            } else {
              throw new Error("Marquee offers empty");
            }
          } catch (e) {
            console.error("Failed to load marquee_offers:", e);
            setMarqueeOffers([
              { id: "MO-1", text: "Summer Sale: 20% Off All Audio Devices", row_number: 1 },
              { id: "MO-2", text: "Free Delivery on orders over Rs. 45,000", row_number: 1 },
              { id: "MO-3", text: "Use Code CREATE20 for extra discounts", row_number: 1 },
              { id: "MO-4", text: "Limited stock on mechanical keyboards", row_number: 1 },
              { id: "MO-5", text: "Premium creator bundles now available", row_number: 1 },
              { id: "MO-6", text: "Elevate your desk setup with 15% off", row_number: 1 },
              { id: "MO-7", text: "Tactile switches special promotion active", row_number: 1 },
              { id: "MO-8", text: "Shop the high performance range", row_number: 1 },
              { id: "MO-9", text: "Exclusive subscriber discounts inside", row_number: 2 },
              { id: "MO-10", text: "Buy now and pay later with zero interest", row_number: 2 },
              { id: "MO-11", text: "Ambient LED lightbars: 30% discount", row_number: 2 },
              { id: "MO-12", text: "Carbon fiber monitor risers special offer", row_number: 2 },
              { id: "MO-13", text: "Upgrade to studio audio today", row_number: 2 },
              { id: "MO-14", text: "All desk accessories starting at Rs. 9,000", row_number: 2 },
              { id: "MO-15", text: "Smart wireless chargers best price", row_number: 2 },
              { id: "MO-16", text: "Water resistant travel cases on sale", row_number: 2 }
            ]);
          }
        } else {
          // Offline Fallbacks
          setProducts(MOCK_PRODUCTS);
          setCollections([
            {
              id: "audio-elite",
              name: "Audio Elite",
              description: "Broadcast quality mics, reference studio monitors, and comfort-focused ANC headphones.",
              type: "smart",
              rules: { tags: ["audio"] },
            },
            {
              id: "desk-accessories",
              name: "Desk Accessories",
              description: "Elevate your desk layout with premium work gear.",
              type: "smart",
              rules: { tags: ["gear"] },
            },
            {
              id: "creator-bundle",
              name: "Creator Essentials Bundle",
              description: "The ultimate starter pack for streaming and programming.",
              type: "manual",
              rules: { tags: [] },
            },
          ]);
          setCollectionProducts([
            { collection_id: "creator-bundle", product_id: "keyboard" },
            { collection_id: "creator-bundle", product_id: "mic" }
          ]);
          // Mock some visit data
          setVisits([
            { id: "1", path: "/", referrer: "direct", user_agent: "Mozilla", country: "United States", created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: "2", path: "/product/headphones", referrer: "google.com", user_agent: "Chrome", country: "United States", created_at: new Date(Date.now() - 7200000).toISOString() },
            { id: "3", path: "/product/keyboard", referrer: "instagram.com", user_agent: "Safari", country: "United Kingdom", created_at: new Date(Date.now() - 10000000).toISOString() },
            { id: "4", path: "/", referrer: "youtube.com", user_agent: "Firefox", country: "Canada", created_at: new Date(Date.now() - 15000000).toISOString() },
            { id: "5", path: "/product/charger", referrer: "direct", user_agent: "Chrome", country: "Germany", created_at: new Date(Date.now() - 18000000).toISOString() },
            { id: "6", path: "/product/mic", referrer: "twitter.com", user_agent: "Edge", country: "Australia", created_at: new Date(Date.now() - 25000000).toISOString() },
          ]);
          // Mock orders fallback
          setOrders([
            {
              id: "ORD-20260612-921A",
              customer_name: "Sarah Jenkins",
              customer_email: "sarah.j@example.com",
              shipping_address: "1524 Pine Street, San Francisco, CA, 94109",
              items: [{ id: "headphones", name: "Pro Noise-Cancelling Headphones", color: "Signature Burgundy", quantity: 1, price: "Rs. 90,000" }],
              total_amount: 90000.00,
              status: "pending",
              created_at: new Date(Date.now() - 14400000).toISOString()
            },
            {
              id: "ORD-20260611-304B",
              customer_name: "Alex Rivera",
              customer_email: "alex.rivera@example.com",
              shipping_address: "892 Broadway Apt 4B, New York, NY, 10003",
              items: [
                { id: "keyboard", name: "Creations Mechanical Keyboard", color: "Onyx Black", quantity: 1, price: "Rs. 48,000" },
                { id: "charger", name: "Smart Dual Wireless Charger", color: "Carbon Black", quantity: 1, price: "Rs. 27,000" }
              ],
              total_amount: 75000.00,
              status: "shipped",
              created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: "ORD-20260610-855C",
              customer_name: "Evelyn Chen",
              customer_email: "evelyn.chen@gmail.com",
              shipping_address: "724 Olympic Blvd, Los Angeles, CA, 90015",
              items: [{ id: "backpack", name: "Urban Tech Backpack", color: "Slate Grey", quantity: 1, price: "Rs. 42,000" }],
              total_amount: 42000.00,
              status: "delivered",
              created_at: new Date(Date.now() - 172800000).toISOString()
            }
          ]);
          // Mock contact inquiries fallback
          setContactInquiries([
            {
              id: "INQ-1",
              name: "Liam Johnson",
              email: "liam.johnson@example.com",
              reason: "general_inquiries",
              message: "Hello, I love your workspace aesthetic! Do you offer bulk discounts for corporate setup upgrades?",
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "INQ-2",
              name: "Sophia Smith",
              email: "sophia.smith@example.com",
              reason: "product_inquiries",
              message: "Hi, is the mechanical keyboard compatible with macOS function keys out of the box?",
              created_at: new Date(Date.now() - 43200000).toISOString(),
            },
            {
              id: "INQ-3",
              name: "Jackson Davis",
              email: "jackson.davis@example.com",
              reason: "shipping_inquiries",
              message: "Hello, do you ship to international locations like Switzerland and Germany? If so, what is the ETA?",
              created_at: new Date(Date.now() - 7200000).toISOString(),
            }
          ]);
          // Mock marquee offers fallback
          setMarqueeOffers([
            { id: "MO-1", text: "Summer Sale: 20% Off All Audio Devices", row_number: 1 },
            { id: "MO-2", text: "Free Delivery on orders over Rs. 45,000", row_number: 1 },
            { id: "MO-3", text: "Use Code CREATE20 for extra discounts", row_number: 1 },
            { id: "MO-4", text: "Limited stock on mechanical keyboards", row_number: 1 },
            { id: "MO-5", text: "Premium creator bundles now available", row_number: 1 },
            { id: "MO-6", text: "Elevate your desk setup with 15% off", row_number: 1 },
            { id: "MO-7", text: "Tactile switches special promotion active", row_number: 1 },
            { id: "MO-8", text: "Shop the high performance range", row_number: 1 },
            { id: "MO-9", text: "Exclusive subscriber discounts inside", row_number: 2 },
            { id: "MO-10", text: "Buy now and pay later with zero interest", row_number: 2 },
            { id: "MO-11", text: "Ambient LED lightbars: 30% discount", row_number: 2 },
            { id: "MO-12", text: "Carbon fiber monitor risers special offer", row_number: 2 },
            { id: "MO-13", text: "Upgrade to studio audio today", row_number: 2 },
            { id: "MO-14", text: "All desk accessories starting at Rs. 9,000", row_number: 2 },
            { id: "MO-15", text: "Smart wireless chargers best price", row_number: 2 },
            { id: "MO-16", text: "Water resistant travel cases on sale", row_number: 2 }
          ]);
        }
      } catch (err) {
        console.warn("Failed to load DB details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: "pending" | "fulfilled" | "shipped" | "delivered") => {
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch("/api/orders/update-status", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ orderId, status: newStatus }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to update order status on server");
        }
      }
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm("Are you sure you want to delete this contact inquiry?")) return;

    try {
      if (supabase) {
        const { error } = await supabase.from("contact_inquiries").delete().eq("id", inquiryId);
        if (error) throw error;
      }
      setContactInquiries(contactInquiries.filter((inq) => inq.id !== inquiryId));
      if (activeInquiry?.id === inquiryId) {
        setActiveInquiry(null);
      }
    } catch (err: any) {
      alert(`Failed to delete contact inquiry: ${err.message}`);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferText.trim()) return;

    setSavingOffer(true);
    const tempId = `MO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    try {
      const payload = {
        text: newOfferText.trim(),
        row_number: newOfferRow,
      };

      let addedId = tempId;

      if (supabase) {
        const { data, error } = await supabase
          .from("marquee_offers")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        addedId = data?.id || tempId;
      }

      setMarqueeOffers((prev) => [
        ...prev,
        { id: addedId, text: newOfferText.trim(), row_number: newOfferRow }
      ]);
      setNewOfferText("");
    } catch (err: any) {
      alert(`Failed to add offer item: ${err.message}`);
    } finally {
      setSavingOffer(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer item?")) return;

    try {
      if (supabase) {
        const { error } = await supabase.from("marquee_offers").delete().eq("id", id);
        if (error) throw error;
      }
      setMarqueeOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert(`Failed to delete offer item: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("franley_admin_session");
    router.replace("/admin/login");
  };

  // -------------------------
  // PRODUCT FORM SUBMIT
  // -------------------------
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving product...");

    const id = editingProductId || prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const priceNum = parseFloat(prodPrice.replace(/[^0-9.]/g, "")) || 0;
    const slashedPriceNum = prodSlashedPrice ? parseFloat(prodSlashedPrice.replace(/[^0-9.]/g, "")) || 0 : null;
    const discountVal = slashedPriceNum ? `${Math.round(((slashedPriceNum - priceNum) / slashedPriceNum) * 100)}% OFF` : "";

    const tagsArr = prodTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const colorsArr = prodColors.split(",").map((c) => c.trim()).filter(Boolean);
    const featuresArr = prodFeatures.split(",").map((f) => f.trim()).filter(Boolean);

    const productPayload = {
      id,
      name: prodName,
      category: prodCategory,
      price: priceNum,
      slashed_price: slashedPriceNum,
      discount: discountVal,
      description: prodDescription,
      color: colorsArr[0]?.toLowerCase().includes("purple") ? "purple" : "slate",
      colors: colorsArr,
      images: prodImages.length > 0 ? prodImages : [`/products/${id}.webp`],
      tags: tagsArr,
      features: featuresArr,
      meta_title: prodMetaTitle,
      updated_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        let err;
        if (editingProductId) {
          const { error } = await supabase
            .from("products")
            .update(productPayload)
            .eq("id", editingProductId);
          err = error;
        } else {
          const { error } = await supabase
            .from("products")
            .insert({ ...productPayload, created_at: new Date().toISOString() });
          err = error;
        }

        if (err) throw err;
      }

      // Update state local catalog list
      const uiProduct: Product = {
        id,
        name: prodName,
        category: prodCategory,
        price: `Rs. ${Math.round(priceNum).toLocaleString()}`,
        slashedPrice: slashedPriceNum ? `Rs. ${Math.round(slashedPriceNum).toLocaleString()}` : "",
        discount: discountVal,
        description: prodDescription,
        color: colorsArr[0]?.toLowerCase().includes("purple") ? "purple" : "slate",
        icon: getCategoryIcon(prodCategory, id),
        images: prodImages.length > 0 ? prodImages : [`/products/${id}.webp`],
        tags: tagsArr,
        features: featuresArr,
        metaTitle: prodMetaTitle,
      };

      if (editingProductId) {
        setProducts(products.map((p) => (p.id === editingProductId ? uiProduct : p)));
        setSaveStatus("Product updated successfully!");
      } else {
        setProducts([uiProduct, ...products]);
        setSaveStatus("Product added successfully!");
      }

      // Clear form
      resetProductForm();
      setTimeout(() => {
        setSaveStatus(null);
        setActiveTab("catalog");
      }, 1500);

    } catch (err: any) {
      console.error("Save product failed:", err);
      setSaveStatus(`Error saving: ${err.message}`);
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdName("");
    setProdCategory("Home and kitchen");
    setProdPrice("");
    setProdSlashedPrice("");
    setProdDescription("");
    setProdTags("");
    setProdColors("Matte Black, Silver Gray");
    setProdFeatures("");
    setProdImages([]);
    setProdMetaTitle("");
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price.replace(/Rs\.\s*|Rs\s*|,/gi, ""));
    setProdSlashedPrice(p.slashedPrice.replace(/Rs\.\s*|Rs\s*|,/gi, ""));
    setProdDescription(p.description);
    setProdTags((p.tags || []).join(", "));
    setProdColors((p.colors || []).join(", "));
    setProdFeatures((p.features || []).join(", "));
    setProdImages(p.images || []);
    setProdMetaTitle(p.metaTitle || "");
    setActiveTab("add-product");
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(`Are you sure you want to delete product ID: ${productId}?`)) return;

    try {
      if (supabase) {
        const { error } = await supabase.from("products").delete().eq("id", productId);
        if (error) throw error;
      }
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  // -------------------------
  // IMAGE UPLOADS HANDLER
  // -------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (prodImages.length + files.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (supabase) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from("products").getPublicUrl(filePath);
          if (data?.publicUrl) {
            uploadedUrls.push(data.publicUrl);
          }
        } else {
          // Fallback Base64 for local offline demonstration
          const reader = new FileReader();
          const localUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(localUrl);
        }
      } catch (err: any) {
        console.error("Failed to upload image file:", err);
        alert(`Upload error: ${err.message || "Is your Supabase products storage bucket public?"}`);
      }
    }

    setProdImages([...prodImages, ...uploadedUrls]);
    setUploadingImages(false);
  };

  const removeUploadedImage = (index: number) => {
    setProdImages(prodImages.filter((_, i) => i !== index));
  };

  // -------------------------
  // COLLECTIONS HANDLER
  // -------------------------
  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Creating collection...");

    const id = collName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const tagsArr = collTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

    const payload = {
      id,
      name: collName,
      description: collDescription,
      type: collType,
      rules: { tags: tagsArr },
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from("collections").insert(payload);
        if (error) throw error;

        // If manual and products selected, link them
        if (collType === "manual" && collSelectedProducts.length > 0) {
          const joins = collSelectedProducts.map((pId) => ({
            collection_id: id,
            product_id: pId,
          }));
          const { error: joinErr } = await supabase.from("collection_products").insert(joins);
          if (joinErr) throw joinErr;
        }
      }

      setCollections([payload, ...collections]);
      if (collType === "manual" && collSelectedProducts.length > 0) {
        const joins = collSelectedProducts.map((pId) => ({
          collection_id: id,
          product_id: pId,
        }));
        setCollectionProducts((prev) => [...prev, ...joins]);
      }
      setSaveStatus("Collection created!");
      setCollName("");
      setCollDescription("");
      setCollType("manual");
      setCollTags("");
      setCollSelectedProducts([]);

      setTimeout(() => setSaveStatus(null), 1500);
    } catch (err: any) {
      console.error("Save collection failed:", err);
      setSaveStatus(`Error creating: ${err.message}`);
    }
  };

  const toggleProductSelectForCollection = (prodId: string) => {
    if (collSelectedProducts.includes(prodId)) {
      setCollSelectedProducts(collSelectedProducts.filter((id) => id !== prodId));
    } else {
      setCollSelectedProducts([...collSelectedProducts, prodId]);
    }
  };

  // Helper to fetch collection items dynamically (Shopify Smart logic!)
  const getCollectionProductCount = (collection: Collection) => {
    if (collection.type === "smart") {
      const matchTags = collection.rules?.tags || [];
      return products.filter((p) =>
        p.tags?.some((t) => matchTags.includes(t.toLowerCase()))
      ).length;
    }
    // Count join rows matching this collection's ID
    return collectionProducts.filter((cp) => cp.collection_id === collection.id).length;
  };

  // -------------------------
  // ANALYTICS AGGREGATIONS
  // -------------------------
  const totalVisits = visits.length;
  const uniqueVisitors = new Set(visits.map((v) => v.ip || v.id)).size;
  
  // Referrers Pie logic
  const referrerMap: Record<string, number> = {};
  visits.forEach((v) => {
    const ref = v.referrer || "direct";
    referrerMap[ref] = (referrerMap[ref] || 0) + 1;
  });
  const sortedReferrers = Object.entries(referrerMap).sort((a, b) => b[1] - a[1]);

  // Page paths popularity
  const pathMap: Record<string, number> = {};
  visits.forEach((v) => {
    pathMap[v.path] = (pathMap[v.path] || 0) + 1;
  });
  const sortedPaths = Object.entries(pathMap).sort((a, b) => b[1] - a[1]);

  // Visits in last 7 days chart array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }).reverse();

  // Compute visits count for each of the last 7 days from analytics_visits
  const last7DaysDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const graphPoints = last7DaysDates.map((date) => {
    const start = date.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return visits.filter((v) => {
      const vTime = new Date(v.created_at).getTime();
      return vTime >= start && vTime < end;
    }).length;
  });

  const svgPath = (() => {
    const maxVal = Math.max(...graphPoints, 5);
    const pts = graphPoints.map((val, idx) => {
      const x = idx * 100;
      const y = 170 - (val / maxVal) * 140;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return pts.join(" ");
  })();

  return (
    <div className="flex-grow flex h-full select-none overflow-hidden text-sm leading-relaxed font-inter">
      
      {/* ------------------------- */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* ------------------------- */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 p-6 z-20">
        <div className="flex flex-col gap-8">
          
          {/* Admin title */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-extrabold tracking-[0.2em] font-inter text-slate-900 uppercase">
              FRANLEY // ADMIN
            </h1>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold border-0 text-left ${
                activeTab === "dashboard"
                  ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/15"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>

            {/* Products Dropdown Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer font-bold border-0 text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Products
                </div>
                <svg
                  className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                    productsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {productsOpen && (
                <div className="flex flex-col pl-7 border-l border-slate-200 ml-6 gap-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border-0 ${
                      activeTab === "catalog"
                        ? "bg-[#7b0323]/5 text-[#7b0323] font-extrabold"
                        : "bg-transparent text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    Catalog
                  </button>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setActiveTab("add-product");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border-0 ${
                      activeTab === "add-product"
                        ? "bg-[#7b0323]/5 text-[#7b0323] font-extrabold"
                        : "bg-transparent text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    Add Product
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold border-0 text-left ${
                activeTab === "collections"
                  ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/15"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Collections
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold border-0 text-left ${
                activeTab === "orders"
                  ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/15"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              Orders
            </button>

            <button
              onClick={() => setActiveTab("contact-inquiries")}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold border-0 text-left ${
                activeTab === "contact-inquiries"
                  ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/15"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Inquiries
              </div>
              {contactInquiries.length > 0 && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "contact-inquiries"
                    ? "bg-white text-[#7b0323]"
                    : "bg-[#7b0323]/5 text-[#7b0323]"
                }`}>
                  {contactInquiries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("offer-section")}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold border-0 text-left ${
                activeTab === "offer-section"
                  ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/15"
                  : "bg-transparent text-slate-550 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Offer Section
              </div>
              {marqueeOffers.length > 0 && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "offer-section"
                    ? "bg-white text-[#7b0323]"
                    : "bg-[#7b0323]/5 text-[#7b0323]"
                }`}>
                  {marqueeOffers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold border-0 text-left ${
                activeTab === "analytics"
                  ? "bg-[#7b0323] text-white shadow-md shadow-[#7b0323]/15"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Analytics
            </button>
          </nav>
        </div>

        {/* User Block & Logout */}
        <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-6">
          <div className="flex flex-col select-none">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
              Logged in as
            </span>
            <span className="text-[11px] font-bold text-slate-650 truncate max-w-full">
              {adminUser}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-2.5 rounded-full transition-all text-xs font-bold cursor-pointer"
          >
            LOG OUT SYSTEM
          </button>
        </div>
      </aside>

      {/* ------------------------- */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ------------------------- */}
      <main className="flex-grow flex flex-col h-full bg-slate-50/50 backdrop-blur-3xl overflow-hidden relative z-10">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-50 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                Fetching records...
              </span>
            </div>
          </div>
        )}

        {/* Header toolbar */}
        <header className="h-20 border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 bg-white/80">
          <h2 className="text-lg font-black font-inter tracking-tight text-slate-900 uppercase">
            {activeTab.replace("-", " ")} Workspace
          </h2>
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            System status: <span className="text-emerald-600 font-black">ONLINE</span>
          </div>
        </header>

        {/* Tab workspace area */}
        <div className="flex-grow overflow-y-auto p-8 scrollbar-thin">
          
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-8">
              
              {/* Quick Metrics Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Catalog Inventory", count: products.length, desc: "Active store items", color: "from-blue-500/5 to-transparent border-blue-100 bg-white" },
                  { title: "Dynamic Collections", count: collections.length, desc: "Categories & groupings", color: "from-[#7b0323]/5 to-transparent border-[#7b0323]/10 bg-white" },
                  { title: "Total Page Visits", count: totalVisits, desc: "Tracked customer load counts", color: "from-emerald-500/5 to-transparent border-emerald-100 bg-white" },
                ].map((stat, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${stat.color} border p-6 rounded-[1.8rem] shadow-xs flex flex-col justify-between h-36`}>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      {stat.title}
                    </span>
                    <div className="text-4xl font-extrabold font-inter text-slate-900">
                      {stat.count}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      {stat.desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Graphical analytics widget */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                    Visitor Load Volume (Last 7 Days)
                  </h3>
                  <span className="text-xs font-bold text-[#7b0323]">
                    +12% vs last week
                  </span>
                </div>

                <div className="h-56 w-full flex items-end justify-between relative pt-6 px-2 border-b border-slate-200">
                  {/* Custom SVG Line Chart */}
                  <svg className="absolute inset-0 w-full h-full p-6 text-[#7b0323]" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <path
                      d={svgPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="drop-shadow-[0_0_6px_rgba(139,92,246,0.15)]"
                    />
                  </svg>

                  {/* Grid Lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100" />
                  <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100" />
                  <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100" />

                  {/* Columns rendering */}
                  {last7Days.map((day, idx) => {
                    const maxVal = Math.max(...graphPoints, 1);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 z-10">
                        <div className="text-[10px] font-black text-[#7b0323]/80">
                          {graphPoints[idx]}
                        </div>
                        <div 
                          className="w-1.5 rounded-full bg-gradient-to-t from-[#7b0323] to-fuchsia-400 transition-all duration-1000"
                          style={{ height: `${(graphPoints[idx] / maxVal) * 140}px` }}
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Products Row & Top Referrers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Popular paths widget */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                  <h4 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                    Top Page Paths
                  </h4>
                  <div className="flex flex-col gap-3">
                    {sortedPaths.slice(0, 4).map(([path, count], idx) => (
                      <div key={path} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="font-mono text-xs text-slate-600 truncate max-w-[70%]">
                          {idx + 1}. {path}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 px-3 py-1 rounded-full">
                          {count} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referrers widget */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                  <h4 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                    Acquisition Sources
                  </h4>
                  <div className="flex flex-col gap-3">
                    {sortedReferrers.slice(0, 4).map(([ref, count], idx) => {
                      const percentage = Math.round((count / totalVisits) * 100) || 0;
                      return (
                        <div key={ref} className="flex flex-col gap-1.5 py-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-700 capitalize">{ref}</span>
                            <span className="text-slate-400">{count} visits ({percentage}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#7b0323] to-fuchsia-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === "catalog" && (
            <div className="flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Showing {products.length} Products
                </span>
                <button
                  onClick={() => {
                    resetProductForm();
                    setActiveTab("add-product");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-widest px-5 py-2.5 rounded-full transition-all cursor-pointer border-0 shadow-sm"
                >
                  ADD NEW PRODUCT
                </button>
              </div>

              {/* Table List of products */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-black tracking-widest text-slate-500 uppercase bg-slate-50/50">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Tags</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0">
                            <img
                              src={p.images && p.images.length > 0 ? p.images[0] : `/products/${p.id}.webp`}
                              alt={p.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{p.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">{p.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500">
                          {p.category}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-slate-900">{p.price}</span>
                            {p.slashedPrice && (
                              <span className="text-xs text-slate-400 line-through">{p.slashedPrice}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(p.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[9px] font-black text-[#7b0323] bg-[#7b0323]/5 border border-[#7b0323]/10 px-2 py-0.5 rounded-md uppercase">
                                {tag}
                              </span>
                            ))}
                            {(p.tags || []).length > 3 && (
                              <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5">
                                +{(p.tags || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="bg-slate-50 hover:bg-red-550/5 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: ADD PRODUCT FORM */}
          {activeTab === "add-product" && (
            <div className="max-w-3xl bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xs">
              
              {saveStatus && (
                <div className="bg-[#7b0323]/5 border border-[#7b0323]/10 text-[#7b0323] text-xs font-semibold px-4 py-3 rounded-2xl mb-6 text-center animate-pulse">
                  {saveStatus.toUpperCase()}
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. Pro Noise-Cancelling Headphones"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Category
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    >
                      {["Home and kitchen", "Tech & Gadgets", "Mobile & Auto", "Best sellers", "Trending"].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Meta Title Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={prodMetaTitle}
                    onChange={(e) => setProdMetaTitle(e.target.value)}
                    placeholder="e.g. Pro Noise-Cancelling Headphones | Premium Studio Audio Gear"
                    className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Store Price (Rs.)
                    </label>
                    <input
                      type="text"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 90000"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Compare-at Slash Price (Rs.)
                    </label>
                    <input
                      type="text"
                      value={prodSlashedPrice}
                      onChange={(e) => setProdSlashedPrice(e.target.value)}
                      placeholder="e.g. 120000"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                    Rich Text Description
                  </label>
                  <RichTextEditor
                    value={prodDescription}
                    onChange={setProdDescription}
                    placeholder="Enter broadcast quality copy..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Product Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={prodTags}
                      onChange={(e) => setProdTags(e.target.value)}
                      placeholder="audio, wireless, anc, premium"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Available Colors (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={prodColors}
                      onChange={(e) => setProdColors(e.target.value)}
                      placeholder="Signature Burgundy, Matte Black, Silver Gray"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                    Key Features / Highlight Specs (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={prodFeatures}
                    onChange={(e) => setProdFeatures(e.target.value)}
                    placeholder="Active Noise Cancellation, Studio sound, 40h Battery"
                    className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                  />
                </div>

                {/* Images Uploads Bucket section */}
                <div className="flex flex-col gap-4 border-t border-slate-200 pt-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Product Images (Max 5 images)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Upload to Supabase storage bucket `products`
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center mt-2">
                    {prodImages.map((imgUrl, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0">
                        <img src={imgUrl} alt="Upload preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-1 right-1 bg-red-650 hover:bg-red-750 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border-0 cursor-pointer shadow-md"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {prodImages.length < 5 && (
                      <label className="w-20 h-20 bg-slate-55 border border-dashed border-slate-250 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7b0323] transition-all text-slate-450 hover:text-[#7b0323]">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImages}
                          className="hidden"
                        />
                        {uploadingImages ? (
                          <div className="w-4 h-4 border-2 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="text-xl font-bold">+</span>
                            <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-grow bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-widest py-4 rounded-full transition-all cursor-pointer border-0 shadow-sm"
                  >
                    {editingProductId ? "SAVE PRODUCT CHANGES" : "PUBLISH TO STOREFRONT"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetProductForm();
                      setActiveTab("catalog");
                    }}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 px-6 py-4 rounded-full text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>

              </form>

            </div>
          )}          {/* TAB 4: COLLECTIONS SYSTEM */}
          {activeTab === "collections" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Form: Create Collection */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-6 shadow-xs">
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-550 uppercase">
                  Create Collection
                </h3>

                {saveStatus && (
                  <div className="bg-[#7b0323]/5 border border-[#7b0323]/10 text-[#7b0323] text-xs font-semibold px-4 py-2 rounded-xl text-center">
                    {saveStatus.toUpperCase()}
                  </div>
                )}

                <form onSubmit={handleCollectionSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Collection Title
                    </label>
                    <input
                      type="text"
                      required
                      value={collName}
                      onChange={(e) => setCollName(e.target.value)}
                      placeholder="e.g., Audio Elite"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Description
                    </label>
                    <textarea
                      value={collDescription}
                      onChange={(e) => setCollDescription(e.target.value)}
                      placeholder="Describe the collection purpose..."
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all h-20 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase ml-1">
                      Collection Type
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setCollType("manual")}
                        className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          collType === "manual"
                            ? "bg-[#7b0323]/5 border-[#7b0323] text-[#7b0323]"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        }`}
                      >
                        Manual Linkage
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollType("smart")}
                        className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          collType === "smart"
                            ? "bg-[#7b0323]/5 border-[#7b0323] text-[#7b0323]"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        }`}
                      >
                        Smart Tags
                      </button>
                    </div>
                  </div>

                  {/* SMART RULES SETTINGS */}
                  {collType === "smart" && (
                    <div className="flex flex-col gap-2 bg-[#7b0323]/5/50 border border-[#7b0323]/10/85 rounded-2xl p-4 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black tracking-widest text-[#7b0323] uppercase">
                        Smart Criteria Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        required
                        value={collTags}
                        onChange={(e) => setCollTags(e.target.value)}
                        placeholder="audio, premium, anc"
                        className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold leading-normal mt-1 block">
                        💡 Shopify logic: Creating a product with any of these tags will automatically bind it to this collection.
                      </span>
                    </div>
                  )}

                  {/* MANUAL SELECTION LIST */}
                  {collType === "manual" && (
                    <div className="flex flex-col gap-2 border border-slate-200 rounded-2xl p-4 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black tracking-widest text-slate-450 uppercase">
                        Select Products to Add
                      </label>
                      <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
                        {products.map((p) => {
                          const isSelected = collSelectedProducts.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleProductSelectForCollection(p.id)}
                              className={`flex items-center justify-between p-2 rounded-xl text-left transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-[#7b0323]/5 border-[#7b0323]/20 text-slate-900 font-bold"
                                  : "bg-slate-50 border-slate-200/60 text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              <span className="truncate max-w-[80%]">{p.name}</span>
                              <span className="text-[10px] font-bold text-slate-400">{p.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-widest py-4 rounded-full mt-2 transition-all cursor-pointer border-0 shadow-sm"
                  >
                    CREATE COLLECTION
                  </button>
                </form>
              </div>

              {/* Right List: Collections List */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-555 uppercase">
                  Existing Collections
                </h3>

                <div className="flex flex-col gap-4">
                  {collections.map((c) => {
                    const count = getCollectionProductCount(c);
                    return (
                      <div key={c.id} className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-3xl flex items-center justify-between hover:border-slate-350 transition-all duration-305 shadow-2xs">
                        <div className="flex flex-col gap-1 text-left max-w-[70%]">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-base">{c.name}</span>
                            <span className={`text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full border uppercase ${
                              c.type === "smart"
                                ? "bg-[#7b0323]/5 border-[#7b0323]/20/80 text-[#7b0323]"
                                : "bg-blue-50 border-blue-200/80 text-blue-650"
                            }`}>
                              {c.type}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                            {c.description || "No description provided."}
                          </p>
                          {c.type === "smart" && c.rules?.tags && (
                            <div className="flex gap-1.5 flex-wrap mt-1">
                              {c.rules.tags.map((tag) => (
                                <span key={tag} className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  tag:{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1.5">
                          <span className="text-2xl font-black font-inter text-slate-800">
                            {count}
                          </span>
                          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                            Products
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ANALYTICS DETAIL */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-8">
              
              {/* Traffic details row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Total Views", value: totalVisits, desc: "Cumulative logs" },
                  { title: "Unique Visitors", value: uniqueVisitors, desc: "Separate client sessions" },
                  { title: "Top Referrer", value: sortedReferrers[0]?.[0] || "direct", desc: "Best traffic funnel" },
                  { title: "Conversion Ratio", value: totalVisits > 0 ? `${((orders.length / totalVisits) * 100).toFixed(1)}%` : "0.0%", desc: "Estimated buyer rate" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-[1.5rem] flex flex-col justify-between h-28 shadow-xs">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      {stat.title}
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 font-inter capitalize truncate">
                      {stat.value}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {stat.desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Full lists columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Visits log list */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                  <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                    Recent Activity Logs
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[9px] font-black tracking-widest text-slate-500 uppercase bg-slate-50/50">
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Path</th>
                          <th className="py-2.5 px-3">Origin Referrer</th>
                          <th className="py-2.5 px-3">Country</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visits.slice(0, 10).map((v, idx) => {
                          const date = new Date(v.created_at);
                          return (
                            <tr key={v.id || idx} className="hover:bg-slate-50/30 text-slate-650">
                              <td className="py-3 px-3 font-semibold text-slate-400">
                                {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-900 truncate max-w-[120px]">
                                {v.path}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-500 truncate max-w-[100px] capitalize">
                                {v.referrer}
                              </td>
                              <td className="py-3 px-3 text-slate-500 font-semibold">
                                {v.country || "United States"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Country rankings */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                  <h3 className="text-xs font-black tracking-[0.2em] text-slate-550 uppercase">
                    Visitor Geography
                  </h3>
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const geoMap: Record<string, number> = {};
                      visits.forEach((v) => {
                        const geo = v.country || "United States";
                        geoMap[geo] = (geoMap[geo] || 0) + 1;
                      });
                      const sortedGeos = Object.entries(geoMap).sort((a, b) => b[1] - a[1]);
                      return sortedGeos.map(([country, count], idx) => {
                        const widthPct = Math.round((count / totalVisits) * 100) || 0;
                        return (
                          <div key={country} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-650">
                              <span>{idx + 1}. {country}</span>
                              <span className="text-slate-400">{count} views</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: ORDERS WORKSPACE */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Showing {orders.length} Customer Orders
                </span>
                
                {/* Status Quick Stats pills */}
                <div className="flex flex-wrap gap-2">
                  {["all", "pending", "fulfilled", "shipped", "delivered"].map((filterState) => {
                    const count = filterState === "all" 
                      ? orders.length 
                      : orders.filter((o) => o.status === filterState).length;
                    return (
                      <span key={filterState} className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl text-[11px] font-bold text-slate-500 capitalize shadow-2xs">
                        {filterState}: <span className="text-slate-900 font-extrabold">{count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Orders List Container */}
              <div className="flex flex-col gap-4">
                {orders.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-12 text-center text-slate-400 font-bold shadow-xs">
                    No orders have been placed on the storefront yet.
                  </div>
                ) : (
                  orders.map((order) => {
                    const date = new Date(order.created_at);
                    
                    // Colors for status pills
                    const statusColors = {
                      pending: "bg-amber-50 border-amber-200 text-amber-700",
                      fulfilled: "bg-blue-50 border-blue-200 text-blue-700",
                      shipped: "bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]",
                      delivered: "bg-emerald-50 border-emerald-200 text-emerald-700",
                    };

                    return (
                      <div key={order.id} className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-slate-350 transition-all duration-300 shadow-xs">
                        {/* Left: Customer info & Items details */}
                        <div className="flex-grow flex flex-col gap-4 text-left">
                          
                          {/* Order Reference details */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-extrabold text-slate-900 text-base font-inter">{order.id}</span>
                            <span className="text-xs text-slate-400 font-bold">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                            <span className={`text-[9px] font-black tracking-widest px-3 py-0.5 rounded-full border uppercase ${statusColors[order.status] || ""}`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Customer Billing/Shipping Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-slate-100 py-3 text-xs text-slate-500 font-semibold">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Customer details</span>
                              <span className="text-slate-800 font-extrabold">{order.customer_name}</span>
                              <span className="text-slate-400 font-normal">{order.customer_email}</span>
                              {order.phone_number && <span className="text-slate-500 font-normal">{order.phone_number}</span>}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Shipping Address</span>
                              <span className="text-slate-800 font-extrabold truncate">{order.shipping_address}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Payment Method</span>
                              <span className="text-slate-850 font-extrabold uppercase text-[10px]">
                                {order.payment_method === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}
                              </span>
                            </div>
                          </div>

                          {/* Order Products items */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Items Ordered</span>
                            <div className="flex flex-col gap-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 px-3.5 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono">({item.color})</span>
                                  </div>
                                  <div className="text-xs font-semibold text-slate-500">
                                    {item.quantity}x • {
                                      typeof item.price === "string"
                                        ? (item.price.startsWith("$")
                                            ? `Rs. ${Math.round(parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0).toLocaleString()}`
                                            : item.price)
                                        : `Rs. ${Math.round(item.price || 0).toLocaleString()}`
                                    }
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Right: Total & Transition Actions */}
                        <div className="md:w-56 shrink-0 flex flex-col justify-between items-end text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-black tracking-widest text-slate-450 uppercase">Total Amount</span>
                            <span className="text-2xl font-black text-[#7b0323] font-inter">Rs. {Math.round(order.total_amount).toLocaleString()}</span>
                          </div>

                          {/* Action Buttons to Fulfill / Ship / Deliver */}
                          <div className="w-full flex flex-col gap-2 mt-4">
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "fulfilled")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black tracking-widest py-3.5 rounded-full cursor-pointer transition-all border-0 shadow-md shadow-blue-500/10"
                              >
                                FULFILL ORDER
                              </button>
                            )}

                            {order.status === "fulfilled" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "shipped")}
                                className="w-full bg-[#d4af37] hover:bg-[#c59e2b] text-white text-xs font-black tracking-widest py-3.5 rounded-full cursor-pointer transition-all border-0 shadow-md shadow-[#d4af37]/10"
                              >
                                SHIP ORDER
                              </button>
                            )}

                            {order.status === "shipped" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-widest py-3.5 rounded-full cursor-pointer transition-all border-0 shadow-md shadow-emerald-500/10"
                              >
                                DELIVER ORDER
                              </button>
                            )}

                            {order.status === "delivered" && (
                              <div className="w-full flex items-center justify-center gap-1.5 py-3.5 text-emerald-600 text-xs font-black tracking-widest uppercase bg-emerald-50 border border-emerald-200/80 rounded-full shadow-inner select-none">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                COMPLETED
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 7: CONTACT INQUIRIES WORKSPACE */}
          {activeTab === "contact-inquiries" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Showing {contactInquiries.length} Inquiries
                </span>
              </div>

              {/* Table List of inquiries */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-xs">
                {contactInquiries.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold">
                    No contact inquiries found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black tracking-widest text-slate-500 uppercase bg-slate-50/50">
                        <th className="py-4 px-6">Sender</th>
                        <th className="py-4 px-6">Reason</th>
                        <th className="py-4 px-6">Message Preview</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contactInquiries.map((inq) => {
                        const date = new Date(inq.created_at);
                        const reasonLabels: Record<string, string> = {
                          general_inquiries: "General Inquiries",
                          product_inquiries: "Product Inquiries",
                          shipping_inquiries: "Shipping Inquiries"
                        };
                        const reasonColors: Record<string, string> = {
                          general_inquiries: "bg-blue-50 border-blue-200/80 text-blue-700",
                          product_inquiries: "bg-[#7b0323]/5 border-[#7b0323]/20/80 text-[#7b0323]",
                          shipping_inquiries: "bg-amber-50 border-amber-200/80 text-amber-700"
                        };

                        return (
                          <tr 
                            key={inq.id} 
                            onClick={() => setActiveInquiry(inq)}
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex flex-col text-left">
                                <span className="font-bold text-slate-800 group-hover:text-[#7b0323] transition-colors">{inq.name}</span>
                                <span className="text-[10px] font-semibold text-slate-400 font-mono">{inq.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border uppercase ${reasonColors[inq.reason] || "bg-slate-50 border-slate-200 text-slate-600"}`}>
                                {reasonLabels[inq.reason] || inq.reason}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 font-medium max-w-xs truncate">
                              {inq.message}
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-bold text-xs">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </td>
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setActiveInquiry(inq)}
                                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                  className="bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}

          {/* INQUIRY DETAIL MODAL OVERLAY */}
          {activeInquiry && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl relative text-left mx-6 animate-in zoom-in-95 duration-200">
                
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black tracking-widest text-[#7b0323] uppercase">
                      Inquiry Details
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-inter uppercase">
                      {activeInquiry.name}
                    </h3>
                    <a href={`mailto:${activeInquiry.email}`} className="text-xs font-semibold text-slate-400 hover:text-[#7b0323] transition-colors font-mono">
                      {activeInquiry.email}
                    </a>
                  </div>
                  <button
                    onClick={() => setActiveInquiry(null)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Details layout */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Reason</span>
                      <span className="text-slate-800 font-extrabold uppercase text-[10px]">
                        {activeInquiry.reason.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Submitted At</span>
                      <span className="text-slate-800 font-extrabold">
                        {new Date(activeInquiry.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Message</span>
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-xs font-medium text-slate-700 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                      {activeInquiry.message}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex gap-4 mt-6 border-t border-slate-100 pt-4">
                  <a
                    href={`mailto:${activeInquiry.email}?subject=Re: Franley Inquiry`}
                    className="flex-grow bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-widest py-3.5 rounded-full transition-all cursor-pointer border-0 shadow-sm text-center block font-inter"
                  >
                    REPLY VIA EMAIL
                  </a>
                  <button
                    onClick={() => handleDeleteInquiry(activeInquiry.id)}
                    className="bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-500 px-6 py-3.5 rounded-full text-xs font-bold cursor-pointer transition-all"
                  >
                    Delete Inquiry
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: OFFER SECTION WORKSPACE */}
          {activeTab === "offer-section" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
              
              {/* Left Form: Add Offer Text */}
              <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-6 shadow-xs text-left">
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                  Add Marquee Offer
                </h3>

                <form onSubmit={handleAddOffer} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase ml-1">
                      Offer Text (Sales, discounts, codes)
                    </label>
                    <input
                      type="text"
                      required
                      value={newOfferText}
                      onChange={(e) => setNewOfferText(e.target.value)}
                      placeholder="e.g. FLASH SALE: 15% OFF SITEWIDE"
                      className="bg-slate-50 border border-slate-250 focus:bg-white focus:border-[#7b0323]/80 focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase ml-1">
                      Target Scroll Row
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setNewOfferRow(1)}
                        className={`py-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          newOfferRow === 1
                            ? "bg-[#7b0323]/5 border-[#7b0323] text-[#7b0323]"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-350 hover:text-slate-650"
                        }`}
                      >
                        Row 1 (Top Row)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewOfferRow(2)}
                        className={`py-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          newOfferRow === 2
                            ? "bg-[#7b0323]/5 border-[#7b0323] text-[#7b0323]"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-350 hover:text-slate-650"
                        }`}
                      >
                        Row 2 (Bottom Row)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingOffer}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-widest py-4.5 rounded-full mt-2 transition-all cursor-pointer border-0 shadow-sm flex items-center justify-center gap-2"
                  >
                    {savingOffer ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "ADD TO MARQUEE"
                    )}
                  </button>
                </form>
              </div>

              {/* Right Side: Row 1 & Row 2 items list */}
              <div className="lg:col-span-8 flex flex-col gap-6 text-left">
                
                {/* Row 1 Manager */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black tracking-[0.2em] text-slate-550 uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7b0323] animate-pulse" />
                      Row 1 Offers (Top Scroll)
                    </h3>
                    <span className="text-[10px] font-bold text-slate-405">
                      {marqueeOffers.filter((o) => o.row_number === 1).length} items
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {marqueeOffers.filter((o) => o.row_number === 1).length === 0 ? (
                      <span className="text-xs text-slate-400 font-semibold p-4 text-center">No Row 1 items created yet.</span>
                    ) : (
                      marqueeOffers.filter((o) => o.row_number === 1).map((offer) => (
                        <div key={offer.id} className="flex justify-between items-center bg-slate-50/50 border border-slate-200/80 p-3 px-4 rounded-xl hover:border-slate-300 transition-colors">
                          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase font-inter truncate max-w-[85%]">{offer.text}</span>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-650 border-0 p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-black"
                            title="Delete offer"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Row 2 Manager */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black tracking-[0.2em] text-slate-550 uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 animate-pulse" />
                      Row 2 Offers (Bottom Scroll)
                    </h3>
                    <span className="text-[10px] font-bold text-slate-405">
                      {marqueeOffers.filter((o) => o.row_number === 2).length} items
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {marqueeOffers.filter((o) => o.row_number === 2).length === 0 ? (
                      <span className="text-xs text-slate-400 font-semibold p-4 text-center">No Row 2 items created yet.</span>
                    ) : (
                      marqueeOffers.filter((o) => o.row_number === 2).map((offer) => (
                        <div key={offer.id} className="flex justify-between items-center bg-slate-50/50 border border-slate-200/80 p-3 px-4 rounded-xl hover:border-slate-300 transition-colors">
                          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase font-inter truncate max-w-[85%]">{offer.text}</span>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-655 border-0 p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-black"
                            title="Delete offer"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
