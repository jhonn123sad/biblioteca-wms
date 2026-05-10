import { useState } from "react";
const logoSrc = "/logo-wms.png";
import { Image } from "lucide-react";

export function BrandLogo({ className = "h-12 w-12" }: { className?: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-secondary rounded-xl border border-border shadow-sm`}>
        <span className="text-muted-foreground font-black text-[10px] md:text-xs tracking-tighter opacity-40">WMS</span>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center relative overflow-hidden rounded-xl`}>
      <img
        src="/logo-wms.png"
        alt="WMS Logo"
        className="h-full w-full object-contain transition-all duration-300"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
