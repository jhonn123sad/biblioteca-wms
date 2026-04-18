import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AgentBio = () => {
  return (
    <section className="pt-12 pb-8 px-4 text-center">
      <Avatar className="w-28 h-28 mx-auto mb-4 ring-4 ring-secondary/30">
        <AvatarImage src="" alt="Corretor" />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
          CR
        </AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold text-foreground mb-1">Carlos Ribeiro</h1>
      <p className="text-secondary font-medium mb-3">Corretor de Imóveis · CRECI 12345</p>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
        Especialista em imóveis de alto padrão em São Paulo. Mais de 10 anos
        ajudando clientes a encontrar o lar dos sonhos.
      </p>
    </section>
  );
};
