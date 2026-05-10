import { useState } from "react";
const logoSrc = "/logo-wms.png";
import { Image } from "lucide-react";

export function BrandLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center relative overflow-hidden rounded-2xl`}>
      <img
        src="/logo-wms.png"
        alt="WMS Logo"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
