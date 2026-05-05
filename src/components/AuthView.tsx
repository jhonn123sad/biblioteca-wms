import { useState } from "react";
import { Lock, Phone, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-black shadow-xl shadow-black/10 mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Biblioteca WMS</h1>
          <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base px-2">
            Esta é uma área exclusiva. Use seu número de WhatsApp cadastrado para entrar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="tel" 
              placeholder="WhatsApp (apenas números)" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isVerifying}
              className="w-full bg-black/[0.03] border border-transparent rounded-2xl h-14 md:h-16 pl-12 pr-4 text-base focus:bg-white focus:border-black/10 focus:ring-0 transition-all outline-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isVerifying || !phoneNumber}
            className="w-full bg-black text-white hover:bg-black/90 rounded-2xl h-14 md:h-16 text-base font-medium shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
          >
            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Entrar na Biblioteca"}
          </Button>

          <div className="text-center pt-2">
            <a 
              href="https://pay.kiwify.com.br/3790" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-gray-400 hover:text-black transition-colors font-medium"
            >
              Ainda não é um membro? <span className="underline decoration-black/20 hover:decoration-black underline-offset-4">Libere seu acesso aqui.</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
