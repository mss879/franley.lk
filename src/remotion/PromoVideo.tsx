"use client";

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
} from "remotion";

export interface PromoVideoProps {
  accentColor: string; // Hex color code (e.g., "#8b5cf6")
  featuredProductIds: string[]; // List of product IDs to showcase
  videoTitle: string;
  couponCode: string;
  discountAmount: string; // e.g. "25% OFF"
}

// Product data lookup for rendering inside the composition
const PRODUCT_DATA: Record<string, { name: string; category: string; price: string; description: string }> = {
  headphones: {
    name: "Pro Noise-Cancelling Headphones",
    category: "Best sellers",
    price: "$299",
    description: "Studio-grade sound, ultimate comfort & active noise cancellation.",
  },
  charger: {
    name: "Smart Dual Wireless Charger",
    category: "Tech & Gadgets",
    price: "$89",
    description: "Fast-charging pad for your phone and watch with a sleek leather surface.",
  },
  keyboard: {
    name: "Creations Mechanical Keyboard",
    category: "Best sellers",
    price: "$159",
    description: "Hot-swappable tactile switches, wooden base frame, retro keycaps.",
  },
  sleeve: {
    name: "Minimalist Tech Sleeve",
    category: "Tech & Gadgets",
    price: "$45",
    description: "Water-resistant canvas organizer for cords, power banks, and cards.",
  },
  lightbar: {
    name: "Ambient LED Desk Bar",
    category: "Home and kitchen",
    price: "$79",
    description: "Monitor-mounted lighting with smart hue adjustment and music sync.",
  },
  riser: {
    name: "Carbon Fiber Laptop Lift",
    category: "Tech & Gadgets",
    price: "$65",
    description: "Lightweight, ultra-durable carbon fiber laptop riser.",
  },
  mouse: {
    name: "Precision Wireless Mouse",
    category: "Tech & Gadgets",
    price: "$129",
    description: "Ergonomic workspace mouse with smart scroll wheel and silent clicks.",
  },
  speaker: {
    name: "Hi-Fi Studio Monitor Speaker",
    category: "Home and kitchen",
    price: "$349",
    description: "High-resolution desktop monitor speakers with premium carbon cone drivers.",
  },
  webcam: {
    name: "4K Creator Webcam",
    category: "Trending",
    price: "$199",
    description: "Ultra-wide 4K webcam with automatic framing and high dynamic range.",
  },
  mic: {
    name: "USB Condenser Microphone",
    category: "Trending",
    price: "$179",
    description: "Cardioid condenser microphone with dynamic noise suppression filter.",
  },
  stand: {
    name: "MagSafe Desk Mount",
    category: "Mobile & Auto",
    price: "$49",
    description: "Magnetic phone mount machined from solid aerospace-grade aluminum.",
  },
  backpack: {
    name: "Urban Tech Backpack",
    category: "Mobile & Auto",
    price: "$139",
    description: "Weatherproof layout with dedicated laptop compartment and luggage pass-through.",
  },
};

// 1. Intro Scene Component
const IntroScene: React.FC<{ title: string; accentColor: string }> = ({ title, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations with custom Bezier curves
  const titleScale = interpolate(frame, [0, fps * 1.5], [0.85, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleTranslateY = interpolate(frame, [fps * 0.4, fps * 1.5], [40, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [fps * 0.4, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-zinc-950 font-outfit">
      {/* Background glow matching accent color */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      <div style={{ transform: `scale(${titleScale})`, opacity: textOpacity }} className="text-center px-8 z-10">
        <span className="text-[12px] font-extrabold tracking-[0.4em] text-zinc-500 uppercase block mb-3">
          FRANLEY // PRESENTATION
        </span>
        <h1 className="text-5xl md:text-6xl font-black text-white font-syne tracking-tight leading-none mb-6">
          {title.toUpperCase()}
        </h1>
        <div 
          className="w-16 h-[3px] mx-auto rounded-full mb-6"
          style={{ backgroundColor: accentColor }}
        />
        <p
          className="text-sm md:text-base text-zinc-400 font-medium tracking-wide max-w-md mx-auto"
          style={{ transform: `translateY(${subtitleTranslateY}px)`, opacity: subtitleOpacity }}
        >
          Elevated Essentials for the Modern Workspace
        </p>
      </div>
    </AbsoluteFill>
  );
};

// 2. Product Showcase Scene Component
const ProductScene: React.FC<{ productId: string; accentColor: string }> = ({ productId, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const product = PRODUCT_DATA[productId] || {
    name: "Premium Tech Item",
    category: "Tech",
    price: "$99",
    description: "Elevated hardware for your creative workflow.",
  };

  // Entrance phase animations
  const imgTranslateX = interpolate(frame, [0, fps * 1.2], [-150, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });

  const imgOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentTranslateX = interpolate(frame, [fps * 0.2, fps * 1.4], [150, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [fps * 0.2, fps * 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow subtle zoom on image for dynamic visual interest
  const imgScale = interpolate(frame, [0, fps * 3], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex items-center bg-zinc-950 px-12 md:px-20 font-outfit">
      {/* Dynamic background lighting */}
      <div
        className="absolute w-[600px] h-[600px] -left-20 rounded-full blur-[200px] opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full z-10">
        {/* Left Side: Product Image with slide-in from left */}
        <div
          className="flex justify-center items-center"
          style={{
            transform: `translateX(${imgTranslateX}px) scale(${imgScale})`,
            opacity: imgOpacity,
          }}
        >
          <div className="relative p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/40 w-[280px] h-[280px] flex items-center justify-center shadow-2xl">
            <Img
              src={`/products/${productId}.webp`}
              alt={product.name}
              className="max-w-[200px] max-h-[200px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>

        {/* Right Side: Product Details with slide-in from right */}
        <div
          className="flex flex-col text-left justify-center gap-4"
          style={{
            transform: `translateX(${contentTranslateX}px)`,
            opacity: contentOpacity,
          }}
        >
          <span 
            className="text-xs font-black tracking-[0.3em] uppercase"
            style={{ color: accentColor }}
          >
            {product.category}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-syne leading-tight tracking-tight">
            {product.name}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            {product.description}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-3xl font-black text-white font-syne">{product.price}</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg tracking-widest uppercase">
              Free Delivery
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3. Outro Scene Component
const OutroScene: React.FC<{
  accentColor: string;
  couponCode: string;
  discountAmount: string;
}> = ({ accentColor, couponCode, discountAmount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const mainOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardScale = interpolate(frame, [0, fps * 1.2], [0.85, 1], {
    easing: Easing.bezier(0.16, 1.3, 0.3, 1), // Overshoot ease-out
    extrapolateRight: "clamp",
  });

  const glowOpacity = interpolate(frame, [fps * 0.5, fps * 2.5], [0.1, 0.25], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-zinc-950 font-outfit">
      {/* Background glow matching accent color */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none"
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      <div 
        style={{ opacity: mainOpacity, transform: `scale(${cardScale})` }} 
        className="text-center px-6 z-10 flex flex-col items-center"
      >
        <span className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase block mb-3 animate-pulse">
          EXCLUSIVE OFFER
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white font-syne tracking-tight leading-none mb-4">
          UPGRADE YOUR DESK
        </h2>
        <p className="text-zinc-400 text-sm font-medium mb-8 max-w-sm">
          Get premium workspace essentials delivered straight to your door.
        </p>

        {/* Coupon Card container */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl w-[320px] flex flex-col items-center relative overflow-hidden">
          {/* Top banner tag */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
          
          <span className="text-2xl font-black text-white tracking-wide font-syne mb-1">
            {discountAmount.toUpperCase()}
          </span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Storewide Discount
          </span>

          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 flex justify-between items-center">
            <span className="text-xs font-extrabold text-zinc-500 tracking-wider">CODE:</span>
            <span className="text-sm font-black tracking-widest text-white font-syne" style={{ color: accentColor }}>
              {couponCode.toUpperCase() || "FRANLEY"}
            </span>
          </div>
        </div>

        <span className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase mt-8">
          SHOP TODAY // FRANLEY.CO
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const PromoVideo: React.FC<PromoVideoProps> = ({
  accentColor,
  featuredProductIds,
  videoTitle,
  couponCode,
  discountAmount,
}) => {
  const { fps } = useVideoConfig();
  const introDuration = 60; // 2 seconds
  const productDuration = 90; // 3 seconds each
  const outroDuration = 90; // 3 seconds

  return (
    <AbsoluteFill className="bg-zinc-950 select-none">
      {/* Intro Scene */}
      <Sequence durationInFrames={introDuration}>
        <IntroScene title={videoTitle} accentColor={accentColor} />
      </Sequence>

      {/* Featured Products Showcase Sequences */}
      {featuredProductIds.map((productId, index) => {
        const startFrame = introDuration + index * productDuration;
        return (
          <Sequence
            key={productId}
            from={startFrame}
            durationInFrames={productDuration}
          >
            <ProductScene productId={productId} accentColor={accentColor} />
          </Sequence>
        );
      })}

      {/* Outro Scene */}
      <Sequence
        from={introDuration + featuredProductIds.length * productDuration}
        durationInFrames={outroDuration}
      >
        <OutroScene
          accentColor={accentColor}
          couponCode={couponCode}
          discountAmount={discountAmount}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
