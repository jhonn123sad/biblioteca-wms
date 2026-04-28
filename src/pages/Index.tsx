import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import PromptCard from "../components/PromptCard";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, Zap, LayoutGrid, Terminal } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">PROMPTVULT</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/admin">
              <Button variant="ghost" className="hover:bg-white/5 rounded-full px-6">
                Gerenciar
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-bold">
                Entrar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-6">
            A ERA DOS <span className="gradient-text">PROMPTS</span> CHEGOU.
          </h2>
          <p className="text-xl text-gray-400 font-medium">
            Sua biblioteca definitiva de engenharia de prompts, curada e organizada com precisão visual.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">Sincronizando biblioteca...</p>
          </div>
        ) : error ? (
          <div className="glass-morphism rounded-3xl p-12 text-center max-w-md mx-auto">
            <p className="text-red-400 mb-6">{(error as Error).message}</p>
            <Button onClick={() => window.location.reload()} className="bg-white text-black rounded-xl">
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {prompts?.map((prompt: any) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
            
            {prompts?.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-white/5 rounded-3xl py-32 text-center">
                <div className="mb-4 text-gray-600 flex justify-center">
                  <LayoutGrid className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-400">Vazio por enquanto</h3>
                <p className="text-gray-600 mb-8">Nenhum prompt foi catalogado ainda.</p>
                <Link to="/admin">
                  <Button className="bg-purple-600 hover:bg-purple-500 rounded-xl">
                    Começar a Catalogar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-500 text-sm">© 2024 PromptVault. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
