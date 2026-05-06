import { useState } from "react";
import logoSrc from "@/assets/wms-logo.png";

export function BrandLogo({ className = "h-10 w-10 md:h-16 md:w-16" }: { className?: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/10`}>
        <span className="text-primary-foreground font-black text-xs md:text-sm tracking-tighter">WMS</span>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center relative overflow-hidden`}>
      <img
        src={logoSrc}
        alt=""
        className="h-full w-full object-contain transition-all duration-300"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
