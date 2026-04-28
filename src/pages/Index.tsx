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
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Grid className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PROMPT GALLERY</h1>
          </div>
          
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar prompts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-xl h-10 pl-10 text-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                refetch();
                toast.success("Sincronizando biblioteca...");
              }}
              disabled={isFetching}
              className="rounded-xl border-black/10 hover:bg-black hover:text-white transition-all h-10 w-10 p-0"
              title="Sincronizar dados"
            >
              <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            
            <a href="https://sheets.new" target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-xl border-black/10 hover:bg-black hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                Sheets <ExternalLink className="ml-2 w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Intro */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">SUA BIBLIOTECA<br />NO GOOGLE SHEETS.</h2>
          <p className="text-gray-500 max-w-md font-medium">Sincronização direta. Minimalismo total. Carregamento instantâneo.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Sincronizando Sheets...</p>
          </div>
        ) : filteredPrompts?.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-[2rem] p-20 text-center">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">Nenhum prompt encontrado</h3>
            <p className="text-gray-400 text-sm mb-6">Certifique-se de que o CSV está publicado e a URL está correta.</p>
            <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-xl text-left text-xs font-mono overflow-x-auto">
              {APPS_SCRIPT_URL}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPrompts?.map((prompt) => (
              <PromptItem key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </main>

      {/* Footer Instructions */}
      <footer className="container mx-auto px-6 py-20 border-t border-black/5">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-gray-400">Passo 01</h4>
            <p className="text-sm font-medium leading-relaxed">Crie uma planilha no Google Sheets com as colunas: <b>Título, Descrição, Prompt, Imagem1, Imagem2, Imagem3, Imagem4, Imagem5</b>.</p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-gray-400">Passo 02</h4>
            <p className="text-sm font-medium leading-relaxed">No Sheets, vá em <b>Extensões &gt; Apps Script</b>, cole o código do robô e clique em <b>Implantar &gt; Nova Implantação &gt; App da Web</b> (Acesso: Qualquer pessoa).</p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-gray-400">Passo 03</h4>
            <p className="text-sm font-medium leading-relaxed">Copie a URL gerada e cole no código (const <b>APPS_SCRIPT_URL</b>). O site lerá os dados via JSON para maior estabilidade.</p>
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
    <div className="group bg-white rounded-[2rem] border border-black/5 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={mainImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-1">{prompt.title}</h3>
        <p className="text-gray-400 text-xs font-medium mb-6 line-clamp-1">{prompt.description}</p>
        
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-black text-white hover:bg-gray-800 rounded-xl h-12 font-bold transition-all">
                Abrir
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden rounded-[2.5rem] border-none">
              <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
                <div className="bg-gray-50 p-6 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {prompt.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-black/5">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {prompt.images.length === 0 && (
                      <div className="col-span-2 aspect-video bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-10 flex flex-col justify-between">
                  <div>
                    <DialogHeader className="mb-8">
                      <DialogTitle className="text-3xl font-black tracking-tighter">{prompt.title}</DialogTitle>
                      <p className="text-gray-400 font-medium mt-2">{prompt.description}</p>
                    </DialogHeader>

                    <div className="bg-gray-100 p-6 rounded-[1.5rem] border border-black/5">
                      <pre className="text-sm font-medium whitespace-pre-wrap leading-relaxed text-gray-700 font-mono">
                        {prompt.content}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Button 
                      onClick={copyToClipboard}
                      className="flex-1 bg-black text-white hover:bg-gray-800 rounded-[1.25rem] h-14 font-black"
                    >
                      <Copy className="mr-2 w-4 h-4" /> COPIAR PROMPT
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
