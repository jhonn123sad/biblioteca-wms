import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Award, MapPin } from "lucide-react";
import agentPortrait from "@/assets/agent-portrait.jpg";

export const AgentBio = () => {
  return (
    <section className="pt-12 pb-8 px-5 text-center" aria-labelledby="agent-name">
      <div className="relative inline-block mb-5">
        <div className="absolute inset-0 bg-gradient-gold rounded-full blur-2xl opacity-30" aria-hidden />
        <Avatar className="relative w-32 h-32 ring-4 ring-secondary/50 shadow-luxury">
          <AvatarImage src={agentPortrait} alt="Carlos Ribeiro, corretor de imóveis" />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            CR
          </AvatarFallback>
        </Avatar>
      </div>
      <h1 id="agent-name" className="font-display text-4xl font-bold text-foreground mb-1.5">
        Carlos Ribeiro
      </h1>
      <p className="text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-4">
        Corretor · CRECI 12345
      </p>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-[15px] mb-6">
        Especialista em imóveis de alto padrão em São Paulo. Mais de 10 anos
        ajudando clientes a encontrar o lar dos sonhos.
      </p>
      <ul className="flex items-center justify-center flex-wrap gap-2.5 text-xs">
        <li className="flex items-center gap-1.5 bg-card border border-border/60 px-3 py-1.5 rounded-full text-muted-foreground shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary" aria-hidden />
          <span>Verificado</span>
        </li>
        <li className="flex items-center gap-1.5 bg-card border border-border/60 px-3 py-1.5 rounded-full text-muted-foreground shadow-sm">
          <Award className="w-3.5 h-3.5 text-secondary" aria-hidden />
          <span>+200 vendas</span>
        </li>
        <li className="flex items-center gap-1.5 bg-card border border-border/60 px-3 py-1.5 rounded-full text-muted-foreground shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-secondary" aria-hidden />
          <span>São Paulo</span>
        </li>
      </ul>
    </section>
  );
};
