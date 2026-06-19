import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "Secure Checkout | Complete Your Setup Order | Franley",
  description: "Complete your order securely. Enter your shipping information and payment details to process your premium creator essentials.",
  openGraph: {
    title: "Secure Checkout | Franley",
    description: "Complete your order securely and process your premium creator essentials.",
    url: "https://www.franley.lk/checkout",
    images: ["/banner_1.webp"],
  },
};

export default function Page() {
  return <CheckoutClient />;
}
