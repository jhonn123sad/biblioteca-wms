import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import PromptCard from "../components/PromptCard";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { data: prompts, isLoading, error } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select(`
            *,
            images:prompt_images(*)
          `)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (err: any) {
        console.error("Error fetching prompts:", err);
        throw new Error(err.message || "Falha ao carregar os prompts.");
      }
    },
    retry: 2,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Prompt Library</h1>
          <Link to="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{(error as Error).message}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prompts?.map((prompt: any) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
            {prompts?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nenhum prompt encontrado. Vá ao painel de Admin para adicionar.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
