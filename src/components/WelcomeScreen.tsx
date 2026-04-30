import { Loader2 } from "lucide-react";

interface WelcomeScreenProps {
  userName: string;
}

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 transition-all duration-1000">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
        <h2 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-[0.3em] animate-pulse">
          Acesso Autorizado
        </h2>
        <h1 className="text-2xl md:text-6xl font-bold text-white tracking-tight">
          Bem-vindo(a), <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-tight break-words px-4">{userName}</span>
        </h1>
        <div className="flex justify-center mt-8">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      </div>
    </div>
  );
}
