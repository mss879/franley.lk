import React from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  slashedPrice: string;
  discount: string;
  description: string;
  color: string;
  icon?: React.ReactNode;
  images?: string[];
  tags?: string[];
  features?: string[];
  colors?: string[];
  metaTitle?: string;
}

export const getCategoryIcon = (category: string, id?: string): React.ReactNode => {
  const normCat = category.toLowerCase();

  if (normCat === "neckties") {
    return React.createElement(
      "svg",
      { className: "w-5 h-5 text-[#7b0323]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: "2.5" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 2L9 7l3 10 3-10-3-5z" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 17l-3 5h6l-3-5z" })
    );
  }

  if (normCat === "cufflinks") {
    return React.createElement(
      "svg",
      { className: "w-5 h-5 text-[#d4af37]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: "2.5" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 22V17" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 9l6-4 6 4v6l-6 4-6-4V9z" }),
      React.createElement("circle", { cx: "12", cy: "11", r: "3", stroke: "currentColor", strokeWidth: "1.5" })
    );
  }

  // Fallback icon
  return React.createElement(
    "svg",
    { className: "w-5 h-5 text-zinc-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: "2.5" },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" })
  );
};

export const getProductColors = (product: Product): string[] => {
  if (product.colors && product.colors.length > 0) {
    return product.colors;
  }
  return [product.color.charAt(0).toUpperCase() + product.color.slice(1)];
};

export const getColorHex = (colorName: string): string => {
  const name = colorName.toLowerCase();
  if (name.includes("burgundy") || name.includes("wine") || name.includes("crimson")) return "#7b0323";
  if (name.includes("purple")) return "#8b5cf6";
  if (name.includes("gold") || name.includes("amber") || name.includes("bronze")) return "#d4af37";
  if (name.includes("navy") || name.includes("blue")) return "#1d3557";
  if (name.includes("charcoal") || name.includes("slate") || name.includes("black") || name.includes("gunmetal") || name.includes("onyx")) return "#1a1a1a";
  if (name.includes("silver") || name.includes("pearl") || name.includes("white") || name.includes("frost")) return "#e2e8f0";
  if (name.includes("emerald") || name.includes("green") || name.includes("forest")) return "#0f4c3a";
  return "#7b0323"; // default brand burgundy
};

export const PRODUCT_FEATURES: Record<string, string[]> = {
  headphones: ["100% Pure Mulberry Silk", "Hand-rolled edges", "Diagonal twill luxury weave"],
  charger: ["925 Sterling Silver casing", "Genuine black onyx stone inlays", "18k gold accents"],
  keyboard: ["High-density jacquard weave", "Satin smooth backing", "Wrinkle-resistant luxury finish"],
  sleeve: ["Sleek geometric square design", "Hand-painted hard enamel", "Anti-tarnish silver plating"],
  lightbar: ["Interwoven herringbone pattern", "Perfect knot-forming drape", "Double-brushed wool lining"],
  riser: ["Smooth satin gold finish", "Rich jacquard thread count", "Elegant matching storage sleeve"],
  mouse: ["Premium hexagonal setting", "Natural obsidian cut stone", "T-bar swivel clasp mechanism"],
  speaker: ["Sleek micro-satin finish", "Heavy drape structure", "Gift-ready wooden box package"],
  webcam: ["Premium white mother of pearl", "Lustrous iridescent reflections", "Bullet-back folding clasp"],
  mic: ["18k yellow gold-plated shield", "Intricate Victorian scrollwork", "Collectible designer box"],
  stand: ["Tension rose gold frame", "Round burgundy crystal highlights", "Easy-clasp mounting base"],
  backpack: ["Luxe forest green velvet", "Extra thick knot profile", "Premium matte satin highlights"],
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "headphones",
    name: "Signature Burgundy Twill Silk Tie",
    category: "Neckties",
    price: "Rs. 1,190",
    slashedPrice: "Rs. 1,590",
    discount: "25% OFF",
    description: "Handcrafted from pure mulberry silk, featuring a classic diagonal twill weave in our signature deep burgundy.",
    color: "burgundy",
    colors: ["Signature Burgundy", "Dark Wine"],
    images: ["/tie1.webp"],
  },
  {
    id: "charger",
    name: "Bespoke Sterling Silver Cufflinks",
    category: "Cufflinks",
    price: "Rs. 18,000",
    slashedPrice: "Rs. 24,000",
    discount: "25% OFF",
    description: "Hand-polished sterling silver cufflinks featuring a central gold trim and a deep burgundy onyx inlay.",
    color: "silver",
    colors: ["Sterling Silver", "Onyx Burgundy"],
    images: ["/cuffling1.webp"],
  },
  {
    id: "keyboard",
    name: "Royal Gold Striped Silk Tie",
    category: "Neckties",
    price: "Rs. 1,190",
    slashedPrice: "Rs. 1,590",
    discount: "25% OFF",
    description: "An exquisite silk tie featuring diagonal gold stripes running across a deep navy blue background.",
    color: "blue",
    colors: ["Gold Stripe", "Navy Blue"],
    images: ["/tie2.webp"],
  },
  {
    id: "sleeve",
    name: "Classic Square Enamel Cufflinks",
    category: "Cufflinks",
    price: "Rs. 9,000",
    slashedPrice: "Rs. 12,000",
    discount: "25% OFF",
    description: "Sleek and minimalist square-shaped cufflinks detailed with hand-painted burgundy enamel highlights.",
    color: "black",
    colors: ["Burgundy Enamel", "Gunmetal Black"],
    images: ["/cuffling2.webp"],
  },
  {
    id: "lightbar",
    name: "Midnight Navy Herringbone Tie",
    category: "Neckties",
    price: "Rs. 1,190",
    slashedPrice: "Rs. 1,590",
    discount: "25% OFF",
    description: "A premium woven tie showcasing a classic herringbone texture in dark navy blue.",
    color: "blue",
    colors: ["Midnight Navy", "Charcoal Black"],
    images: ["/tie3.webp"],
  },
  {
    id: "riser",
    name: "Gold Twill Luxury Silk Tie",
    category: "Neckties",
    price: "Rs. 1,190",
    slashedPrice: "Rs. 1,590",
    discount: "25% OFF",
    description: "Crafted with pure satin silk threads, highlighting an opulent gold twill relief texture.",
    color: "gold",
    colors: ["Royal Gold", "Deep Bronze"],
    images: ["/tie4.webp"],
  },
  {
    id: "mouse",
    name: "Hexagonal Onyx Inlay Cufflinks",
    category: "Cufflinks",
    price: "Rs. 15,000",
    slashedPrice: "Rs. 20,000",
    discount: "25% OFF",
    description: "Modern hexagonal-cut cufflinks embedded with natural black onyx stone and wrapped in silver.",
    color: "silver",
    colors: ["Silver Onyx", "Gold Amber"],
    images: ["/cuffling3.webp"],
  },
  {
    id: "speaker",
    name: "Classic Charcoal Satin Necktie",
    category: "Neckties",
    price: "Rs. 1,190",
    slashedPrice: "Rs. 1,590",
    discount: "25% OFF",
    description: "Elegant dark charcoal satin necktie offering a sleek, reflective finish for formal evening wear.",
    color: "black",
    colors: ["Charcoal Satin", "Slate Gray"],
    images: ["/tie5.webp"],
  },
  {
    id: "webcam",
    name: "Mother of Pearl Square Cufflinks",
    category: "Cufflinks",
    price: "Rs. 16,500",
    slashedPrice: "Rs. 22,000",
    discount: "25% OFF",
    description: "Sophisticated cufflinks featuring premium natural mother of pearl shell inlays and a silver casing.",
    color: "silver",
    colors: ["Mother of Pearl", "Classic Silver"],
    images: ["/cuffling4.webp"],
  },
  {
    id: "mic",
    name: "Royal Shield Gold-Plated Cufflinks",
    category: "Cufflinks",
    price: "Rs. 21,000",
    slashedPrice: "Rs. 28,000",
    discount: "25% OFF",
    description: "Intricate shield-shaped cufflinks plated in 18k yellow gold with refined scrollwork engravings.",
    color: "gold",
    colors: ["18k Gold Plated", "Sterling Silver"],
    images: ["/cuffling1.webp"],
  },
  {
    id: "stand",
    name: "Burgundy Rose Gold Cufflinks",
    category: "Cufflinks",
    price: "Rs. 18,750",
    slashedPrice: "Rs. 25,000",
    discount: "25% OFF",
    description: "Stunning rose gold cufflinks decorated with a rich burgundy round crystal center.",
    color: "gold",
    colors: ["Rose Gold", "Burgundy Crystal"],
    images: ["/cuffling2.webp"],
  },
  {
    id: "backpack",
    name: "Emerald Green Velvet Tie",
    category: "Neckties",
    price: "Rs. 1,190",
    slashedPrice: "Rs. 1,590",
    discount: "25% OFF",
    description: "Bespoke velvet texture tie in a rich forest emerald shade, offering warmth and visual depth.",
    color: "green",
    colors: ["Emerald Green", "Forest Velvet"],
    images: ["/tie6.webp"],
  },
];
