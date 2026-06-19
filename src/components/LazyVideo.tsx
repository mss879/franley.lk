"use client";

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export default function LazyVideo({ src, className, ...props }: LazyVideoProps) {
  return (
    <div className={`w-full h-full relative ${className || ""}`}>
      <video src={src} preload="auto" className="w-full h-full object-cover" {...props} />
    </div>
  );
}
