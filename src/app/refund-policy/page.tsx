import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "Refund & Return Policy | 30-Day Wear Trial | Franley",
  description: "Learn about the Franley 30-Day Wear Trial, refund processing timelines, return conditions, and shipping logistics.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-outfit select-none relative pb-16">
      
      {/* Header Nav */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 px-6 lg:px-12 py-4 flex items-center justify-between z-40 relative">
        <Link href="/" className="flex items-center gap-1.5 text-zinc-900 hover:text-[#7b0323] transition-colors uppercase font-bold text-[10px] sm:text-xs tracking-widest group">
          <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO STOREFRONT
        </Link>

        {/* Center Logo */}
        <Link href="/" className="w-32 h-8 block hover:opacity-75 transition-opacity">
          <img src="/franley_logo_no_text_transparent.png" alt="Logo" className="w-full h-full object-contain" />
        </Link>

        {/* Status Pill */}
        <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
          POLICIES
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-8 md:py-12 z-10 flex flex-col gap-8 text-left">
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black tracking-widest text-[#7b0323] uppercase">
            SATISFACTION GUARANTEES
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-955 font-syne uppercase tracking-tight">
            Refund & Return Policy
          </h1>
          <p className="text-zinc-550 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Last Updated: June 13, 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-8 md:p-10 shadow-sm flex flex-col gap-6 text-zinc-650 text-sm leading-relaxed font-semibold">
          
          <section className="flex flex-col gap-3">
            <h2 className="text-zinc-950 font-extrabold uppercase font-syne text-xs tracking-widest border-b border-zinc-100 pb-2">
              1. 30-Day Wear Trial
            </h2>
            <p>
              We want you to wear our premium designs with absolute confidence. Franley offers a <strong className="text-zinc-900">30-day wear trial</strong> on all standard catalog items, including our handcrafted silk ties, sterling silver cufflinks, and classic pocket squares.
            </p>
            <p>
              If an accessory doesn't elevate your sartorial style or fit your aesthetic, you are eligible to request a full refund or exchange within 30 days of receiving your package.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-zinc-955 font-extrabold uppercase font-syne text-xs tracking-widest border-b border-zinc-100 pb-2">
              2. Return Conditions & Packaging
            </h2>
            <p>
              To qualify for a refund, returned items must satisfy the following criteria:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-zinc-500 font-medium">
              <li>Items must be in like-new, fully operational condition with zero structural blemishes or physical scuffs.</li>
              <li>Returns must be accompanied by the original packaging, custom boxes, and accessories included in the initial shipping package.</li>
              <li>A valid Order Reference Code (e.g. `ORD-20260613-XXXX`) must be provided during application.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-zinc-955 font-extrabold uppercase font-syne text-xs tracking-widest border-b border-zinc-100 pb-2">
              3. Refund Processing Timelines
            </h2>
            <p>
              Once your return package arrives at our design studio, our QA inspectors evaluate the items. This evaluation takes 2 to 3 business days. Following approval, refunds are issued immediately.
            </p>
            <p>
              For orders paid via <strong className="text-zinc-850">Direct Bank Transfer</strong>, we will request your account coordinates to return the funds. For cash payments, refunds are handled through verified bank wires or store credits. Please allow 5 to 10 business days for the transaction to reflect in your account.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-zinc-955 font-extrabold uppercase font-syne text-xs tracking-widest border-b border-zinc-100 pb-2">
              4. Return Shipping Logistics
            </h2>
            <p>
              Franley covers return shipping costs for defective items or shipping errors. For returns based on personal style changes, customers are responsible for covering return courier fees. We recommend using a trackable courier service, as we cannot issue refunds for packages lost in transit.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-zinc-955 font-extrabold uppercase font-syne text-xs tracking-widest border-b border-zinc-100 pb-2">
              5. How to Initiate a Return
            </h2>
            <p>
              To start a return request, please contact our helpdesk through the <Link href="/contact" className="text-[#7b0323] hover:underline">Contact Form</Link> choosing the reason <strong className="text-zinc-800">"Product Inquiries"</strong> or email us at <a href="mailto:contact@franley.lk" className="text-[#7b0323] font-bold hover:underline">contact@franley.lk</a> quoting your order code.
            </p>
          </section>

        </div>

      </main>

      {/* Footer */}
      <div className="relative z-20 w-full px-6 lg:px-8 mt-16 -mb-12">
        <div className="relative w-full">
          {/* Back 3D Slab Extrusion Layer */}
          <div 
            className="absolute inset-0 bg-[#7b0323] rounded-[2.2rem] md:rounded-[3.2rem] translate-y-2.5" 
          />
          
          {/* Main Card Shape Front Face */}
          <footer className="relative bg-white/95 backdrop-blur-2xl border-[3px] sm:border-[4px] border-[#7b0323] rounded-[2.2rem] md:rounded-[3.2rem] text-zinc-650 px-6 sm:px-10 py-12 md:py-16 flex flex-col gap-10 md:gap-12 overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
            {/* Subtle ambient light glows */}
            <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#7b0323]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] bg-[#d4af37]/5 blur-[90px] rounded-full pointer-events-none" />

            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10 text-left">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <img src="/franley_logo_no_text_transparent.png" alt="Franley Logo" className="h-8 object-contain" />
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-semibold font-outfit">
                  A curated collection of handcrafted silk neckties, bespoke cufflinks, and elevated menswear accessories designed to define the modern gentleman.
                </p>
                {/* Social Icons */}
                <div className="flex gap-3.5 mt-2">
                  {[
                    { name: "Facebook", viewBox: "0 0 24 24", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", href: "https://www.facebook.com/share/1BHcutxZxf/" },
                    { name: "Instagram", viewBox: "0 0 24 24", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", href: "https://www.instagram.com/franley.lk?igsh=MThiM2JyYmwweGJnNw==" },
                    { name: "TikTok", viewBox: "0 0 24 24", path: "M12.53.02C13.82 0 15.14.01 16.46 0c.08 1.56.54 3.06 1.39 4.37.95.84 2.14 1.27 3.39 1.48v3.07a8.553 8.553 0 01-4.78-1.7c-.01 3.82.01 7.64-.02 11.46-.08 3.54-2.58 6.55-5.97 7.14-3.83.77-7.66-1.57-8.38-5.39-.77-3.83 1.57-7.66 5.39-8.38 1.05-.2 2.13-.1 3.13.28v3.19a5.352 5.352 0 00-3.13-.39c-1.8.35-3.07 2.05-2.88 3.88.19 1.83 1.83 3.16 3.66 2.97 1.83-.19 3.16-1.83 2.97-3.66V0h3.29v.02z", href: "https://www.tiktok.com/@franley.lk" }
                  ].map((icon) => (
                    <a
                      key={icon.name}
                      href={icon.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-zinc-200/80 flex items-center justify-center text-zinc-500 hover:text-[#7b0323] hover:border-[#7b0323]/30 hover:bg-[#7b0323]/5 hover:shadow-[0_4px_12px_rgba(123,3,35,0.1)] transition-all duration-300 group"
                      title={icon.name}
                    >
                      <svg className="w-5 h-5 fill-current" viewBox={icon.viewBox}>
                        <path d={icon.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                  Browse
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-semibold">
                  <li><Link href="/shop?category=neckties" className="text-zinc-660 hover:text-[#7b0323] transition-colors">Neckties Collection</Link></li>
                  <li><Link href="/shop?category=cufflinks" className="text-zinc-660 hover:text-[#7b0323] transition-colors">Bespoke Cufflinks</Link></li>
                  <li><Link href="/shop?collection=gift-sets" className="text-zinc-660 hover:text-[#7b0323] transition-colors">Premium Gift Sets</Link></li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                  Support
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-semibold">
                  <li><Link href="/contact" className="text-zinc-660 hover:text-[#7b0323] transition-colors">Contact Support</Link></li>
                  <li><Link href="/privacy-policy" className="text-zinc-660 hover:text-[#7b0323] transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/refund-policy" className="text-zinc-660 hover:text-[#7b0323] transition-colors">Refund Policy</Link></li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                  Newsletter
                </h4>
                <p className="text-xs sm:text-sm text-zinc-555 leading-relaxed font-semibold font-outfit">
                  Subscribe for style guide updates, early access to new collections, and exclusive client privileges.
                </p>
                
                {/* Glassmorphic Newsletter Box */}
                <form
                  className="flex flex-col gap-2 w-full mt-1"
                >
                  <div className="flex items-center bg-[#7b0323]/[0.02] border border-[#7b0323]/20 border-b-[3px] border-[#7b0323]/30 rounded-full px-4 py-1.5">
                    <input
                      id="newsletter-email-input"
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full bg-transparent text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none py-1.5 font-outfit"
                    />
                    <button
                      type="submit"
                      className="bg-[#7b0323] hover:bg-[#8e1534] hover:scale-105 active:scale-95 text-white font-bold text-[10px] tracking-widest px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer shrink-0 border-0 shadow-sm"
                    >
                      JOIN
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="max-w-6xl w-full mx-auto border-t border-zinc-200/80 pt-8 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 text-[10px] sm:text-xs font-bold tracking-wider text-zinc-455">
              <span>© {new Date().getFullYear()} FRANLEY LUXURY. ALL RIGHTS RESERVED.</span>
              <a
                href="https://www.arcai.agency"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 hover:text-[#7b0323] transition-colors duration-200 font-semibold text-[10px] sm:text-xs"
                title="ARC AI - AI Automation and Software Company"
              >
                <span>DESIGNED AND BUILT BY</span>
                <img src="/black%20logo.svg" alt="ARC AI Logo" className="h-16 w-auto object-contain" />
              </a>
              <div className="flex gap-6">
                <Link href="/privacy-policy" className="hover:text-[#7b0323] transition-colors duration-200 font-outfit">PRIVACY POLICY</Link>
                <Link href="/refund-policy" className="hover:text-[#7b0323] transition-colors duration-200 font-outfit">REFUND POLICY</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
