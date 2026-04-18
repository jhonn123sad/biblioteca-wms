import { AgentBio } from "@/components/AgentBio";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Properties } from "@/components/Properties";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <AgentBio />
        <div className="px-4">
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
