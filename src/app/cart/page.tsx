import { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "Shopping Cart | Review Luxury Accessories | Franley",
  description: "Review your premium silk neckties and luxury accessories, select quantities, and proceed to secure checkout on Franley.",
  openGraph: {
    title: "Shopping Cart | Franley",
    description: "Review your luxury accessories and proceed to secure checkout.",
    url: "https://www.franley.lk/cart",
    images: ["/banner_1.webp"],
  },
};

export default function Page() {
  return <CartClient />;
}
