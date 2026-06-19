"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

/* ---------------------------------------------------------------- */
/* Scroll-reveal wrapper (IntersectionObserver)                      */
/* ---------------------------------------------------------------- */
type RevealVariant = "up" | "scale" | "left" | "right" | "blur";

function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantClass =
    variant === "scale"
      ? "reveal-scale"
      : variant === "left"
      ? "reveal-left"
      : variant === "right"
      ? "reveal-right"
      : variant === "blur"
      ? "reveal-blur"
      : "";

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Constellation particle field (canvas, no deps) — tuned for light  */
/* ---------------------------------------------------------------- */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    type P = { x: number; y: number; vx: number; vy: number };
    let particles: P[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(24, Math.floor((width * height) / 32000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(123, 3, 35, 0.15)";
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.05 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    draw();
    if (reduce) cancelAnimationFrame(raf);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-60"
      aria-hidden="true"
    />
  );
}

export default function AboutClient() {
  const [progress, setProgress] = useState(0);
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroContent = useRef<HTMLDivElement>(null);

  // Defensive: clear any leftover scroll-lock from the homepage
  useEffect(() => {
    const unlock = () => {
      for (const el of [document.documentElement, document.body]) {
        el.style.overflow = "";
        el.style.height = "";
        el.style.width = "";
      }
    };
    unlock();
    const t = setTimeout(unlock, 120);
    return () => clearTimeout(t);
  }, []);

  // Scroll progress and parallax
  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docH > 0 ? Math.min(y / docH, 1) : 0);

        if (!reduce && y < window.innerHeight) {
          if (blob1.current) blob1.current.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
          if (blob2.current) blob2.current.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
          if (gridRef.current) gridRef.current.style.transform = `translate3d(0, ${y * 0.1}px, 0)`;
          if (heroContent.current) {
            heroContent.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
            heroContent.current.style.opacity = `${Math.max(1 - y / (window.innerHeight * 0.75), 0)}`;
          }
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative bg-[#fdfcf9] text-zinc-900 font-outfit overflow-x-clip min-h-screen flex flex-col justify-between">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#7b0323] to-[#d4af37] origin-left transition-transform duration-75"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="flex-grow">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden border-b border-zinc-200/40">
          {/* soft light gradient base */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(123,3,35,0.02)_0%,rgba(253,252,249,0.5)_60%,#fdfcf9_100%)]" />

          {/* faint grid */}
          <div
            ref={gridRef}
            className="absolute inset-0 animate-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(123,3,35,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,3,35,0.04) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          {/* luxury ambient color glows */}
          <div
            ref={blob1}
            className="absolute -top-32 -left-24 w-[35rem] h-[35rem] rounded-full bg-[#7b0323]/5 blur-[120px] animate-aurora pointer-events-none"
          />
          <div
            ref={blob2}
            className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#d4af37]/5 blur-[130px] animate-aurora-slow pointer-events-none"
          />

          <ParticleField />

          <div ref={heroContent} className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 text-left">
            <nav className="mb-8 text-[10px] font-black tracking-[0.25em] text-[#7b0323] uppercase">
              <Link href="/" className="hover:text-[#d4af37] transition-colors duration-300">HOME</Link>
              <span className="mx-2.5 text-zinc-300">/</span>
              <span className="text-zinc-500">OUR STORY</span>
            </nav>

            <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-[#7b0323]/10 bg-white/75 backdrop-blur-md px-4 py-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7b0323] animate-glow" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#7b0323]">
                EST. 2026 · Colombo, Sri Lanka
              </span>
            </div>

            <h1 className="font-playfair text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.08] mb-8 text-zinc-955">
              The Details That <br />
              <span className="font-extrabold italic bg-gradient-to-r from-[#7b0323] via-[#d4af37] to-[#7b0323] bg-clip-text text-transparent">
                Define Confidence
              </span>
            </h1>

            <p className="text-zinc-600 text-base md:text-lg font-medium max-w-3xl leading-relaxed font-outfit border-l-4 border-[#7b0323] pl-6 py-2 bg-[#7b0323]/[0.01] rounded-r-xl">
              FRANLEY is a Sri Lankan men’s accessories brand built for the modern gentleman. We focus on timeless essentials—neckties, cufflinks, belts, wallets and more—designed to elevate your everyday style with a clean, premium finish.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-[#7b0323] hover:bg-[#8e1534] px-8 py-4 text-xs font-black tracking-widest text-white transition-all duration-300 shadow-md shadow-[#7b0323]/15 active:scale-[0.97] border border-[#d4af37]/20"
              >
                <span className="card-shine absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">BROWSE COLLECTIONS</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 hover:border-[#7b0323]/30 bg-white px-8 py-4 text-xs font-black tracking-widest text-zinc-800 transition-colors duration-300"
              >
                GET IN TOUCH
              </Link>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-60">
            <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-zinc-400">Scroll</span>
            <svg className="w-4 h-4 text-[#7b0323] animate-bob" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* ===================== TRUST PILLARS BAR ===================== */}
        <section className="relative bg-white border-b border-zinc-200/50 py-8 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                {
                  label: "FAST ISLANDWIDE DELIVERY",
                  desc: "Dispatched promptly across Sri Lanka",
                  icon: (
                    <svg className="w-5 h-5 text-[#7b0323]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  ),
                },
                {
                  label: "SECURE CHECKOUT",
                  desc: "100% encrypted & secure payment options",
                  icon: (
                    <svg className="w-5 h-5 text-[#7b0323]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  label: "WHATSAPP SUPPORT",
                  desc: "Dedicated personal assistant styling guidance",
                  icon: (
                    <svg className="w-5 h-5 text-[#7b0323]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <Reveal key={item.label} variant="up" delay={i * 100}>
                  <div className="flex items-center gap-4 justify-center md:justify-start px-4">
                    <div className="w-10 h-10 rounded-full bg-[#7b0323]/5 flex items-center justify-center border border-[#7b0323]/10 shrink-0">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="text-[10px] font-black tracking-widest text-[#7b0323] uppercase">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-semibold font-outfit mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SECTION 1: PHILOSOPHY & DETAILS ===================== */}
        <section className="relative max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32 border-b border-zinc-200/30">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-4">
              <Reveal variant="left">
                <div className="md:sticky md:top-28 text-left">
                  <span className="text-[10px] font-black tracking-[0.25em] text-[#7b0323] uppercase block mb-2 font-outfit">
                    / OUR PHILOSOPHY
                  </span>
                  <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight leading-tight text-zinc-950">
                    Confidence is in the Details
                  </h2>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-8 text-left flex flex-col gap-8 text-zinc-600 leading-relaxed font-medium text-sm md:text-[15px] font-outfit">
              <Reveal variant="up" delay={100}>
                <p className="text-zinc-800 font-semibold text-base md:text-lg mb-2">
                  That’s why we pay attention to fabric feel, craftsmanship, and presentation—so every piece you wear feels refined, purposeful, and worth it.
                </p>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                {[
                  {
                    num: "01",
                    title: "Fabric Feel",
                    desc: "Hand-selected mulberry silk, high-density weaves, and tactile linings selected for premium weight, shape retention, and elegant drapes.",
                  },
                  {
                    num: "02",
                    title: "Craftsmanship",
                    desc: "Precision stitching, luxury tipping details, and anti-slip structures engineered to stay neat and polished from morning to night.",
                  },
                  {
                    num: "03",
                    title: "Presentation",
                    desc: "Bespoke collector boxes, secure protective layout sleeves, and premium gift-wrapped packages designed to impress from the first touch.",
                  },
                ].map((val, idx) => (
                  <Reveal key={val.title} variant="up" delay={150 + idx * 100}>
                    <div className="bg-[#faf9f6] border border-zinc-200/50 p-5 rounded-2xl relative group hover:border-[#d4af37]/30 transition-all duration-300">
                      <span className="text-[10px] font-black text-[#7b0323]/50 block mb-3 font-outfit">{val.num}</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-2 font-outfit">{val.title}</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{val.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: DRESS SHARP WITH EASE ===================== */}
        <section className="relative max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <Reveal variant="up">
            <div className="mb-14 text-left">
              <span className="text-[10px] font-black tracking-[0.25em] text-[#7b0323] uppercase block mb-2 font-outfit">
                / THE DRESS CODE
              </span>
              <h2 className="font-playfair text-3xl md:text-5xl font-bold tracking-tight text-zinc-950">
                Dress Sharp With Ease
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm font-semibold tracking-wide max-w-xl leading-relaxed mt-2 font-outfit">
                Timeless essentials designed to serve your life's milestone moments.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "I",
                title: "Work & Executive",
                desc: "Establish command and showcase attention to detail in boardrooms and business events with rich textures, solid coordinates, and secure leather setups.",
                accent: "border-[#7b0323]/20",
              },
              {
                num: "II",
                title: "Weddings & Galas",
                desc: "Crafted for grand entries and groom/groomsmen ensembles. Features high-shine floral jacquards, classic black-tie ascots, and polished metallic cufflinks.",
                accent: "border-[#d4af37]/35",
              },
              {
                num: "III",
                title: "Luxury Gifting",
                desc: "Leave a lasting mark. Our custom packaging, luxury signature boxes, and matching tie-and-cufflink gift sets represent the ultimate gesture of appreciation.",
                accent: "border-[#7b0323]/20",
              },
            ].map((p, i) => (
              <Reveal key={p.title} variant="scale" delay={i * 120}>
                <div className={`group relative h-full overflow-hidden rounded-2xl border ${p.accent} bg-white p-6 md:p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}>
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7b0323]/50 via-[#d4af37] to-[#7b0323]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-playfair text-2xl font-bold italic text-[#7b0323]">{p.num}</span>
                      <span className="text-[9px] font-black tracking-widest text-zinc-300 uppercase font-outfit">FRANLEY LUXE</span>
                    </div>
                    <h3 className="font-playfair text-lg font-bold text-zinc-950 mb-3 tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium font-outfit">{p.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-zinc-950 uppercase tracking-widest border-t border-zinc-200/50 pt-5 mt-8 group-hover:text-[#7b0323] transition-colors duration-300 font-outfit">
                    <span>EXPLORE ESSENTIALS</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===================== SECTION 3: CALL TO ACTION ===================== */}
        <section className="relative max-w-5xl mx-auto px-6 md:px-8 pb-28">
          <Reveal variant="scale">
            <div className="bg-[#0c0c0c] border border-zinc-900 rounded-[2.5rem] p-8 md:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              {/* elegant mesh light glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7b0323]/10 via-transparent to-[#d4af37]/10 opacity-70 pointer-events-none" />
              
              <div className="relative z-10 max-w-xl flex flex-col items-center gap-5">
                <span className="text-[9px] font-black tracking-[0.3em] text-[#d4af37] uppercase font-outfit">
                  THE SARTORIAL BLUEPRINT
                </span>
                <h2 className="font-playfair text-2xl md:text-4xl font-normal text-white tracking-tight leading-tight">
                  Step Into the World of <span className="italic">Franley</span>
                </h2>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-outfit max-w-md">
                  Upgrade your daily style, discover handcrafted mulberry silk ties, designer cufflinks, and luxury leather accessories.
                </p>
                <div className="mt-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#7b0323] hover:bg-[#8e1534] text-white border border-[#d4af37]/20 hover:border-[#d4af37]/50 px-8 py-4 text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-md shadow-[#7b0323]/15 active:scale-[0.98]"
                  >
                    <span>BROWSE THE SHOP</span>
                    <svg className="w-4.5 h-4.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <Footer />
    </div>
  );
}
