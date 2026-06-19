"use client";

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
} from "remotion";

export interface ProductShowcaseProps {
  productId: string;
  variantColorHex: string;
  features: string[];
  imageUrl?: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productId,
  variantColorHex,
  features = [],
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Background glow pulse animation
  const glowPulse = interpolate(
    Math.sin((frame / 90) * Math.PI * 2), // Loops perfectly over 90 frames
    [-1, 1],
    [0.12, 0.28]
  );

  // 2. Product Image scale entrance (elastic overshoot)
  const imgScaleEntrance = interpolate(frame, [0, 22], [0, 1], {
    easing: Easing.bezier(0.16, 1.4, 0.3, 1), // custom overshoot curve
    extrapolateRight: "clamp",
  });

  // 3. Product Image floating breathing effect (slow sine translation after entrance)
  const imgFloatY = frame > 22
    ? Math.sin(((frame - 22) / 68) * Math.PI * 2) * 6
    : 0;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-zinc-950 font-outfit select-none overflow-hidden">
      {/* Background glow matching user selected variant color */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full blur-[80px] pointer-events-none transition-all duration-[600ms] ease-out"
        style={{
          opacity: glowPulse,
          background: `radial-gradient(circle, ${variantColorHex} 0%, transparent 70%)`,
        }}
      />

      <div className="flex flex-col items-center gap-6 z-10 w-full px-6">
        {/* Product image container with scale & float */}
        <div
          className="relative w-40 h-40 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl flex items-center justify-center shadow-xl"
          style={{
            transform: `scale(${imgScaleEntrance}) translateY(${imgFloatY}px)`,
          }}
        >
          <Img
            src={imageUrl || `/products/${productId}.webp`}
            alt="Showcase item"
            className="max-w-[110px] max-h-[110px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Staggered specs/features layout */}
        <div className="flex flex-col items-center gap-2 mt-2 w-full">
          {features.slice(0, 3).map((feature, idx) => {
            const startFrame = 12 + idx * 8; // staggered entrance

            const itemOpacity = interpolate(frame, [startFrame, startFrame + 12], [0, 0.9], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const itemTranslateY = interpolate(frame, [startFrame, startFrame + 15], [15, 0], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={feature}
                className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/40 px-3.5 py-1.5 rounded-full shadow-md"
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemTranslateY}px)`,
                }}
              >
                {/* Colored accent checkmark indicator */}
                <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: variantColorHex }} />
                <span className="text-[10px] font-black text-white tracking-widest uppercase">
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
