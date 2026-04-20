import { AgentBio } from "@/components/AgentBio";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Properties } from "@/components/Properties";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-md mx-auto pb-4">
        <AgentBio />
        <div className="px-5 sticky top-3 z-10">
          <WhatsAppButton />
        </div>
        <Properties />
        <footer className="text-center text-xs text-muted-foreground py-8 px-4">
          © {new Date().getFullYear()} Carlos Ribeiro · Todos os direitos reservados
        </footer>
      </div>
    </main>
  );
};

export default Index;
