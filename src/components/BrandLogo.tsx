import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BrandLogo({ className = "h-10 w-10 md:h-16 md:w-16" }: { className?: string }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // URLs fornecidas anteriormente como as corretas
  const LOGO_DARK = "https://lovable-uploads.s3.us-west-2.amazonaws.com/97486e9e-56e2-4545-978d-966952e46e8c.png";
  const LOGO_LIGHT = "https://lovable-uploads.s3.us-west-2.amazonaws.com/994dd462-eb09-41db-bdb2-58d7fe833713.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={className} />;

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === "dark" ? LOGO_DARK : LOGO_LIGHT;

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
