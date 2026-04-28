import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { 
  Loader2, 
  Copy, 
  Search, 
  Grid, 
  ExternalLink, 
  Image as ImageIcon,
  RefreshCcw
} from "lucide-react";

// CONFIGURAÇÃO DO GOOGLE SHEETS VIA APPS SCRIPT
// Você deve implantar seu Apps Script como Web App e colar a URL aqui
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEyFpibtm2eSElodTKKMSVF2dK1S3vKtRAjCWmF86L18wQ6Kf8HShFNTHORegiHUgc/exec";

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
}

// Função para converter links do Google Drive em links diretos de imagem
const fixDriveLink = (url: string) => {
  if (!url || typeof url !== 'string') return "";
  
  // Trata links de compartilhamento padrão do Drive
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    // Usando thumbnail de alta resolução que é mais estável para o Drive
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
  }
  
  return url.startsWith('http') ? url : "";
};

// Função para formatar os dados vindos do Apps Script (JSON)
const formatSheetData = (data: any[]): Prompt[] => {
  return data.map((cols, index) => {
    const getValue = (val: any) => {
      if (!val || typeof val === 'object') return "";
      return val.toString().trim();
    };

    const images = [
      fixDriveLink(getValue(cols[3])),
      fixDriveLink(getValue(cols[4])),
      fixDriveLink(getValue(cols[5])),
      fixDriveLink(getValue(cols[6])),
      fixDriveLink(getValue(cols[7]))
    ].filter(img => img && img.startsWith('http'));

    return {
      id: index.toString(),
      title: getValue(cols[0]) || "Sem Título",
      description: getValue(cols[1]) || "",
      content: getValue(cols[2]) || "",
      images
    };
  }).filter(p => p.content);
};

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: prompts, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      try {
        const response = await fetch(APPS_SCRIPT_URL);
        if (!response.ok) throw new Error("Não foi possível carregar os dados.");
        const json = await response.json();
        return formatSheetData(json.data || []);
      } catch (err: any) {
        console.error(err);
        return [];
      }
    }
  });

  const filteredPrompts = prompts?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/[0.03]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
              <Grid className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Bíblioteca de Prompts WMS</h1>
          </div>
          
          <div className="relative hidden md:block w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar inspirações..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/[0.03] border border-transparent rounded-2xl h-11 pl-11 pr-4 text-sm focus:bg-white focus:border-black/10 focus:ring-0 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* O botão de sincronização agora só aparece se estivermos em ambiente de desenvolvimento (LOVABLE) */}
            {window.location.hostname.includes("lovable") && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  refetch();
                  toast.success("Sincronizando biblioteca...");
                }}
                disabled={isFetching}
                className="rounded-xl hover:bg-black/5 transition-all h-10 w-10 p-0"
                title="Sincronizar Sheets (Apenas Editor)"
              >
                <RefreshCcw className={`w-4 h-4 text-gray-400 ${isFetching ? 'animate-spin text-black' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 md:py-20">
        {/* Intro */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight text-center md:text-left">
            Prompts de alta performance
          </h2>
          <p className="text-gray-400 max-w-lg text-lg font-light text-center md:text-left">
            Uma curadoria minimalista de prompts otimizados para maximizar seus resultados.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-black/5 rounded-full" />
              <div className="w-12 h-12 border-t-2 border-black rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-sm font-medium text-gray-400 animate-pulse">Carregando biblioteca...</p>
          </div>
        ) : filteredPrompts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <ImageIcon className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium">Nenhum resultado</h3>
            <p className="text-sm">Tente outros termos ou atualize a página.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredPrompts?.map((prompt) => (
              <PromptItem key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </main>

      <footer className="container mx-auto px-6 py-12 border-t border-black/[0.03]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">
            &copy; {new Date().getFullYear()} Bíblioteca de Prompts WMS
          </p>
          <div className="flex gap-8">
            <span className="text-xs text-gray-300 font-medium uppercase tracking-widest">Minimalist Design</span>
            <span className="text-xs text-gray-300 font-medium uppercase tracking-widest">Fast Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


function PromptItem({ prompt }: { prompt: Prompt }) {
  const [isOpen, setIsOpen] = useState(false);
  const mainImage = prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copiado!");
  };

  return (
    <div className="group bg-white rounded-3xl border border-black/[0.03] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2">
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={mainImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-7">
        <h3 className="text-lg font-semibold leading-snug mb-2 line-clamp-1">{prompt.title}</h3>
        <p className="text-gray-400 text-sm font-light mb-8 line-clamp-2 leading-relaxed">{prompt.description}</p>
        
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-black text-white hover:bg-black/90 rounded-2xl h-12 text-sm font-medium transition-all shadow-lg shadow-black/5">
                Visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-white p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
              <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
                <div className="bg-[#F9F9F9] p-8 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {prompt.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-black/[0.03] shadow-sm bg-white">
                        <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                      </div>
                    ))}
                    {prompt.images.length === 0 && (
                      <div className="col-span-2 aspect-video bg-black/[0.02] rounded-2xl flex items-center justify-center text-gray-300 border border-dashed border-black/10">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-10 md:p-14 flex flex-col justify-between bg-white">
                  <div>
                    <DialogHeader className="mb-10 text-left">
                      <DialogTitle className="text-3xl font-semibold tracking-tight leading-tight">{prompt.title}</DialogTitle>
                      <p className="text-gray-400 font-light text-lg mt-3 leading-relaxed">{prompt.description}</p>
                    </DialogHeader>

                    <div className="relative group">
                      <div className="bg-black/[0.02] p-8 rounded-3xl border border-black/[0.03] max-h-[300px] overflow-y-auto custom-scrollbar">
                        <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-600">
                          {prompt.content}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <Button 
                      onClick={copyToClipboard}
                      className="w-full bg-black text-white hover:bg-black/90 rounded-2xl h-16 text-base font-medium shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
                    >
                      <Copy className="mr-3 w-4 h-4" /> COPIAR PROMPT
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
