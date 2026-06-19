import React from "react";
import { Composition } from "remotion";
import { PromoVideo, PromoVideoProps } from "./PromoVideo";
import { ProductShowcase, ProductShowcaseProps } from "./ProductShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoVideo"
        component={PromoVideo as React.ComponentType<any>}
        durationInFrames={330} // 11 seconds at 30 fps (60 intro + 3 products * 90 + 90 outro)
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          accentColor: "#8b5cf6",
          featuredProductIds: ["headphones", "keyboard", "charger"],
          videoTitle: "Creator Gear",
          couponCode: "CREATOR25",
          discountAmount: "25% OFF",
        } as PromoVideoProps}
      />
      <Composition
        id="ProductShowcase"
        component={ProductShowcase as React.ComponentType<any>}
        durationInFrames={90} // 3 seconds at 30 fps
        fps={30}
        width={600}
        height={600}
        defaultProps={{
          productId: "headphones",
          variantColorHex: "#8b5cf6",
          features: ["Active Noise Cancellation", "Studio-grade sound", "40-hour Battery"],
        } as ProductShowcaseProps}
      />
    </>
  );
};
