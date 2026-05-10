import { useState } from "react";
import { Library } from "lucide-react";

export function BrandLogo({ className = "h-12 w-12" }: { className?: string }) {
  const [imageError, setImageError] = useState(false);
  const logoSrc = "/logo-wms.png";

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-secondary rounded-xl border border-border shadow-sm`}>
        <div className="flex flex-col items-center justify-center">
          <Library className="w-1/2 h-1/2 text-muted-foreground opacity-20" />
          <span className="text-muted-foreground font-black text-[10px] md:text-xs tracking-tighter opacity-40">WMS</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center relative overflow-hidden rounded-xl`}>
      <img
        src={logoSrc}
        alt="WMS Logo"
        className="h-full w-full object-contain transition-all duration-300"
        onError={() => setImageError(true)}
        loading="eager"
      />
    </div>
  );
}
