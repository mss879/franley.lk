import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { MOCK_PRODUCTS, Product } from "../../products";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          category: data.category,
          price: typeof data.price === "number" ? `Rs. ${Math.round(data.price).toLocaleString()}` : data.price,
          slashedPrice: data.slashed_price ? `Rs. ${Math.round(data.slashed_price).toLocaleString()}` : "",
          discount: data.discount || "",
          description: data.description,
          color: data.color || "burgundy",
          images: data.images || [],
          tags: data.tags || [],
          features: data.features || [],
          metaTitle: data.meta_title || "",
        };
      }
    }
  } catch (e) {
    console.warn("Failed to fetch product on server, falling back to mock:", e);
  }

  // Fallback to local mock data without icon elements
  const mockProduct = MOCK_PRODUCTS.find((p) => p.id === id);
  if (mockProduct) {
    const { icon, ...rest } = mockProduct;
    return rest;
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Franley",
    };
  }

  const titleText = product.metaTitle || `${product.name} | Franley Premium Gentlemen Accessories`;

  return {
    title: titleText,
    description: product.description,
    alternates: {
      canonical: `https://www.franley.lk/product/${product.id}`,
    },
    openGraph: {
      title: titleText,
      description: product.description,
      url: `https://www.franley.lk/product/${product.id}`,
      type: "website",
      images: product.images && product.images.length > 0 ? [product.images[0]] : ["/franley_logo_no_text_transparent.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: product.description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : ["/franley_logo_no_text_transparent.png"],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Parse numeric price for schema
  const numericPrice = typeof product.price === "string"
    ? parseFloat(product.price.replace(/[^\d.]/g, ""))
    : product.price;

  const absoluteImages = product.images && product.images.length > 0
    ? product.images.map((img) => img.startsWith("http") ? img : `https://www.franley.lk${img}`)
    : ["https://www.franley.lk/franley_logo_no_text_transparent.png"];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": absoluteImages,
    "offers": {
      "@type": "Offer",
      "url": `https://www.franley.lk/product/${product.id}`,
      "priceCurrency": "LKR",
      "price": numericPrice,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2027-12-31"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
