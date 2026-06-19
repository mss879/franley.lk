import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "Contact Support | Help Desk & Inquiries | Franley",
  description: "Get in touch with Franley support desk. Send us your questions about our premium workspace setup tools, shipping logistics, or customized collection bundles.",
  openGraph: {
    title: "Contact Support | Help Desk & Inquiries | Franley",
    description: "Get in touch with Franley support desk. Send us your questions about our premium workspace setup tools.",
    url: "https://www.franley.lk/contact",
    images: ["/banner_1.webp"],
  },
};

export default function Page() {
  return <ContactClient />;
}
