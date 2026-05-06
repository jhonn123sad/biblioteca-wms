import { useState } from "react";
import { Lock, Phone, Loader2 } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/button";

interface AuthViewProps {
  onLogin: (phone: string) => Promise<boolean>;
  isVerifying: boolean;
}

export function AuthView({ onLogin, isVerifying }: AuthViewProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(phoneNumber);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo className="h-40 w-40 md:h-48 md:w-48" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Biblioteca WMS</h1>
          <p className="text-muted-foreground font-light leading-relaxed text-sm md:text-base px-2">
            Esta é uma área exclusiva. Use seu número cadastrado para entrar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="tel" 
              placeholder="Apenas números" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isVerifying}
              className="w-full bg-secondary border border-border rounded-2xl h-14 md:h-16 pl-12 pr-4 text-base focus:bg-background focus:border-primary/20 focus:ring-0 transition-all outline-none text-foreground"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isVerifying || !phoneNumber}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 md:h-16 text-base font-bold shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
          >
            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Entrar na Biblioteca"}
          </Button>

          <div className="text-center pt-2">
            <a 
              href="https://wms-checkout.lovable.app/c/comunidade-wms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors font-bold"
            >
              Ainda não é um membro? <span className="underline decoration-primary/20 hover:decoration-primary underline-offset-4">Libere seu acesso aqui.</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
