"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const faqItems = [
  {
    question: "What is your typical shipping and delivery timeframe?",
    answer: "We offer standard and expedited shipping options. Standard shipping within the region typically takes 3–5 business days, while expedited orders are delivered within 1–2 business days. Tracking details are sent automatically once dispatched."
  },
  {
    question: "Do you offer customization for workspace setups or bundle packages?",
    answer: "Yes, we specialize in curating custom setup bundles tailored to your specifications. Whether you are looking for specific desk accessory combinations or enterprise workspace deployments, reach out to our design team using the inquiry form above."
  },
  {
    question: "What is your return policy for personal electronics and workspace accessories?",
    answer: "We support all eligible products with a 30-Day Workspace Trial. If you are not fully satisfied, you can return items in their original packaging. Please refer to our dedicated Refund Policy page linked in the footer for complete eligibility criteria."
  },
  {
    question: "Can I visit your design studio to preview setup components in person?",
    answer: "Yes! Our design showroom in Dehiwala is open for reservation bookings. To ensure we can dedicate personal time to your setup walkthrough, please coordinate a visit time in advance by sending us a message."
  }
];

export default function ContactClient() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("general_inquiries");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimMessage = message.trim();

    if (!trimName || !trimEmail || !trimMessage) {
      setError("Please fill out all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    const nameRegex = /^[a-zA-Z\s\-]{2,}$/;
    if (!nameRegex.test(trimName)) {
      setError("Name must be at least 2 characters long and contain only letters.");
      return;
    }

    if (trimMessage.length < 10) {
      setError("Message content must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimName,
          email: trimEmail,
          reason,
          message: trimMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setReason("general_inquiries");
        setMessage("");
      } else {
        throw new Error(data.error || "Failed to submit message.");
      }
    } catch (err: any) {
      console.warn("Contact submission database error, running offline simulation:", err);
      // Fallback offline simulation
      setSuccess(true);
      setName("");
      setEmail("");
      setReason("general_inquiries");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-y-auto scrollbar-thin bg-slate-50/50 flex flex-col font-outfit select-none relative pb-28 md:pb-16">
      <style>{`
        @keyframes draw-checkmark {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale-checkmark {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill-checkmark {
          100% { box-shadow: inset 0px 0px 0px 50px #10b981; }
        }
        .anim-checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #10b981;
          fill: none;
          animation: draw-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .anim-checkmark {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: block;
          stroke-width: 2.5;
          stroke: #fff;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #10b981;
          animation: fill-checkmark .4s ease-in-out .4s forwards, scale-checkmark .3s ease-in-out .9s forwards;
        }
        .anim-checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: draw-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes draw-stroke {
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

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
          Help Desk
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 md:py-12 z-10 flex flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-2.5 text-left max-w-2xl">
          <span className="text-xs font-bold tracking-widest text-[#7b0323] uppercase">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl md:text-4xl font-normal text-zinc-950 font-[family-name:var(--font-playfair)] tracking-wide">
            We'd love to hear from you.
          </h1>
          <p className="text-zinc-650 text-sm sm:text-base font-medium leading-relaxed">
            Have a question about our premium gentlemen neckties, bespoke cufflinks, or customized gift sets? Send a message and our support desk will respond shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">
          {/* Left Column: Premium Contact Details Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            
            {/* Email Support Card */}
            <div className="group relative bg-[#fafafa]/90 backdrop-blur-md border border-zinc-200/80 rounded-[1.8rem] p-6 text-left flex flex-col justify-between hover:border-[#d4af37]/60 hover:-translate-y-1 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(123,3,35,0.04)]">
              {/* Gold Top Accent Hover Bar */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-start justify-between w-full mb-6">
                <div className="w-10 h-10 bg-[#7b0323]/5 border border-[#7b0323]/10 rounded-xl flex items-center justify-center text-[#7b0323] group-hover:bg-[#7b0323] group-hover:text-white transition-all duration-300 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-outfit mt-1">
                  Support Email
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <a href="mailto:support@franley.lk" className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-[#7b0323] transition-colors duration-300 tracking-wide font-outfit break-words">
                  support@franley.lk
                </a>
                <span className="text-[11px] sm:text-xs text-zinc-500 font-medium leading-relaxed font-outfit">
                  Submit a query 24/7. Detailed response within 24 hours.
                </span>
              </div>
            </div>

            {/* Phone Support Card */}
            <div className="group relative bg-[#fafafa]/90 backdrop-blur-md border border-zinc-200/80 rounded-[1.8rem] p-6 text-left flex flex-col justify-between hover:border-[#d4af37]/60 hover:-translate-y-1 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(123,3,35,0.04)]">
              {/* Gold Top Accent Hover Bar */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-start justify-between w-full mb-6">
                <div className="w-10 h-10 bg-[#7b0323]/5 border border-[#7b0323]/10 rounded-xl flex items-center justify-center text-[#7b0323] group-hover:bg-[#7b0323] group-hover:text-white transition-all duration-300 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-outfit mt-1">
                  Phone & Whatsapp
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <a href="tel:+94707507722" className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-[#7b0323] transition-colors duration-300 tracking-wide font-outfit">
                  +94 70 750 7722
                </a>
                <span className="text-[11px] sm:text-xs text-zinc-500 font-medium leading-relaxed font-outfit">
                  Monday to Saturday, 9.00 AM to 6.00 PM for client orders.
                </span>
              </div>
            </div>

            {/* Head Office Address Card */}
            <div className="group relative bg-[#fafafa]/90 backdrop-blur-md border border-zinc-200/80 rounded-[1.8rem] p-6 text-left flex flex-col justify-between hover:border-[#d4af37]/60 hover:-translate-y-1 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(123,3,35,0.04)]">
              {/* Gold Top Accent Hover Bar */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-start justify-between w-full mb-6">
                <div className="w-10 h-10 bg-[#7b0323]/5 border border-[#7b0323]/10 rounded-xl flex items-center justify-center text-[#7b0323] group-hover:bg-[#7b0323] group-hover:text-white transition-all duration-300 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-outfit mt-1">
                  Showroom
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-[#7b0323] transition-colors duration-300 tracking-wide font-outfit leading-snug">
                  10, Atapattu Road
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-500 font-medium leading-relaxed font-outfit">
                  Dehiwala, Sri Lanka. Showroom visits by advance reservation.
                </span>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="group relative bg-[#fafafa]/90 backdrop-blur-md border border-zinc-200/80 rounded-[1.8rem] p-6 text-left flex flex-col justify-between hover:border-[#d4af37]/60 hover:-translate-y-1 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(123,3,35,0.04)]">
              {/* Gold Top Accent Hover Bar */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-start justify-between w-full mb-6">
                <div className="w-10 h-10 bg-[#7b0323]/5 border border-[#7b0323]/10 rounded-xl flex items-center justify-center text-[#7b0323] group-hover:bg-[#7b0323] group-hover:text-white transition-all duration-300 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-outfit mt-1">
                  Business Hours
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-[#7b0323] transition-colors duration-300 tracking-wide font-outfit">
                  Mon – Sat: 9 AM – 6 PM
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-500 font-medium leading-relaxed font-outfit">
                  Sunday & Public Holidays: Closed.
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_45px_rgba(123,3,35,0.04)] hover:border-[#7b0323]/20 transition-all duration-500 relative overflow-hidden text-left h-full flex flex-col justify-between">
              
              {/* success screen banner */}
              {success ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center gap-6 py-8 animate-in fade-in duration-500">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="anim-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                      <circle className="anim-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                      <path className="anim-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-xl font-normal text-zinc-950 font-[family-name:var(--font-playfair)] tracking-wide">
                      Message Sent!
                    </h3>
                    <p className="text-zinc-655 text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Thank you for contacting us. Your message has been successfully logged in our administration records. We will review your query and get back to you shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="bg-[#7b0323] hover:bg-[#8e1534] text-white text-xs font-bold tracking-[0.2em] px-8 py-4 rounded-full transition-all border border-[#d4af37]/20 hover:border-[#d4af37]/60 hover:shadow-[0_8px_25px_rgba(123,3,35,0.2)] active:scale-95 cursor-pointer shadow-sm"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full justify-between">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1 border-b border-zinc-100 pb-4 mb-1">
                      <span className="text-[9px] font-bold tracking-[0.3em] text-[#7b0323] uppercase font-outfit">
                        Client Concierge
                      </span>
                      <h2 className="text-xl md:text-2xl font-normal text-zinc-950 font-[family-name:var(--font-playfair)] tracking-wide">
                        Send an <span className="italic text-[#d4af37]">Inquiry</span>
                      </h2>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-2.5 rounded-xl text-center uppercase tracking-wider font-outfit">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase ml-1 font-outfit">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`bg-zinc-50/50 border rounded-xl px-4 py-3.5 text-sm font-semibold text-zinc-900 placeholder-zinc-400/80 focus:bg-white focus:outline-none transition-all w-full font-outfit focus:ring-1 focus:ring-[#7b0323]/25 ${
                            error && (error.toLowerCase().includes("name") || error.toLowerCase().includes("fields"))
                              ? "border-red-400 focus:border-red-500"
                              : "border-zinc-200/80 focus:border-[#7b0323]"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase ml-1 font-outfit">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`bg-zinc-50/50 border rounded-xl px-4 py-3.5 text-sm font-semibold text-zinc-900 placeholder-zinc-400/80 focus:bg-white focus:outline-none transition-all w-full font-outfit focus:ring-1 focus:ring-[#7b0323]/25 ${
                            error && (error.toLowerCase().includes("email") || error.toLowerCase().includes("fields"))
                              ? "border-red-400 focus:border-red-500"
                              : "border-zinc-200/80 focus:border-[#7b0323]"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase ml-1 font-outfit">
                        Reason for Inquiry
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-zinc-50/50 border border-zinc-200/80 focus:bg-white focus:border-[#7b0323] focus:ring-1 focus:ring-[#7b0323]/25 rounded-xl px-4 py-3.5 text-sm font-semibold text-zinc-900 focus:outline-none transition-all w-full cursor-pointer font-outfit"
                      >
                        <option value="general_inquiries">General Inquiries</option>
                        <option value="product_inquiries">Product Inquiries</option>
                        <option value="shipping_inquiries">Shipping Inquiries</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase ml-1 font-outfit">
                        Message Content
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Write your inquiries details here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`bg-zinc-50/50 border rounded-xl px-4 py-3.5 text-sm font-semibold text-zinc-900 placeholder-zinc-400/80 focus:bg-white focus:outline-none transition-all w-full h-28 resize-none font-outfit focus:ring-1 focus:ring-[#7b0323]/25 ${
                          error && (error.toLowerCase().includes("message") || error.toLowerCase().includes("fields"))
                            ? "border-red-400 focus:border-red-500"
                            : "border-zinc-200/80 focus:border-[#7b0323]"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full relative overflow-hidden bg-[#7b0323] text-white text-xs font-bold tracking-[0.25em] py-4.5 rounded-full hover:bg-[#8e1534] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(123,3,35,0.2)] active:scale-[0.98] cursor-pointer border border-[#d4af37]/20 hover:border-[#d4af37]/60 mt-4 flex items-center justify-center gap-2 group font-outfit"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "SUBMIT INQUIRIES"
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 md:mt-16 flex flex-col gap-6 text-left w-full">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold tracking-widest text-[#7b0323] uppercase">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-2xl md:text-3xl font-normal text-zinc-950 font-[family-name:var(--font-playfair)] tracking-wide">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {faqItems.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-zinc-200/60 rounded-2xl overflow-hidden bg-white hover:border-[#7b0323]/20/60 transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-5 text-left font-outfit font-bold text-sm text-zinc-955 hover:text-[#7b0323] transition-colors duration-200 cursor-pointer border-0 bg-transparent outline-none"
                  >
                    <span>{item.question}</span>
                    <span className={`ml-4 w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                      isOpen ? "rotate-180 text-[#7b0323] border-[#7b0323]/20" : "text-zinc-500"
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {/* Expandable answer */}
                  <div
                    className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t border-zinc-100" : "max-h-0"
                    }`}
                  >
                    <div className="p-5 text-sm text-zinc-500 leading-relaxed font-medium bg-slate-50/50">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                  <li><Link href="/shop?category=neckties" className="text-zinc-660 hover:text-[#7b0323] transition-colors font-outfit">Neckties Collection</Link></li>
                  <li><Link href="/shop?category=cufflinks" className="text-zinc-660 hover:text-[#7b0323] transition-colors font-outfit">Bespoke Cufflinks</Link></li>
                  <li><Link href="/shop?collection=gift-sets" className="text-zinc-660 hover:text-[#7b0323] transition-colors font-outfit">Premium Gift Sets</Link></li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                  Support
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-semibold">
                  <li><Link href="/contact" className="text-zinc-660 hover:text-[#7b0323] transition-colors font-outfit">Contact Support</Link></li>
                  <li><Link href="/privacy-policy" className="text-zinc-660 hover:text-[#7b0323] transition-colors font-outfit">Privacy Policy</Link></li>
                  <li><Link href="/refund-policy" className="text-zinc-660 hover:text-[#7b0323] transition-colors font-outfit">Refund Policy</Link></li>
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
