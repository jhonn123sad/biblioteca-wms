import { useState } from "react";
import logoSrc from "@/assets/wms-logo.png";
import { Image } from "lucide-react";

export function BrandLogo({ className = "h-20 w-20 md:h-32 md:w-32" }: { className?: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-secondary rounded-2xl border border-border overflow-hidden`}>
        <div className="flex flex-col items-center justify-center gap-1">
          <Image className="w-1/2 h-1/2 text-muted-foreground opacity-20" />
          <span className="text-muted-foreground font-black text-[10px] md:text-xs tracking-tighter opacity-40">WMS</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center relative overflow-hidden rounded-2xl`}>
      <img
        src={logoSrc}
        alt="WMS Logo"
        className="h-full w-full object-contain transition-all duration-300"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
