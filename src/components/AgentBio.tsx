import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Award, MapPin } from "lucide-react";
import agentPortrait from "@/assets/agent-portrait.jpg";

export const AgentBio = () => {
  return (
    <section className="pt-10 pb-6 px-5 text-center">
      <Avatar className="w-32 h-32 mx-auto mb-5 ring-4 ring-secondary/40 shadow-luxury">
        <AvatarImage src={agentPortrait} alt="Carlos Ribeiro, corretor de imóveis" />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
          CR
        </AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
        Carlos Ribeiro
      </h1>
      <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
        Corretor · CRECI 12345
      </p>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-[15px] mb-5">
        Especialista em imóveis de alto padrão em São Paulo. Mais de 10 anos
        ajudando clientes a encontrar o lar dos sonhos.
      </p>
      <ul className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary" aria-hidden />
          Verificado
        </li>
        <li className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-secondary" aria-hidden />
          +200 vendas
        </li>
        <li className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-secondary" aria-hidden />
          São Paulo
        </li>
      </ul>
    </section>
  );
};
