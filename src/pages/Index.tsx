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
  RefreshCcw,
  BookOpen,
  Terminal
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(true);
  const [viewAllOrder, setViewAllOrder] = useState(false);

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

  // Extrair todas as tags únicas dos prompts
  const allTags = Array.from(new Set(
    prompts?.flatMap(p => {
      const titleTags = p.title.match(/\[([^\]]+)\]/g) || [];
      const descTags = p.description.match(/\[([^\]]+)\]/g) || [];
      return [...titleTags, ...descTags].map(tag => tag.slice(1, -1));
    }) || []
  )).sort();

  // Função para extrair o número de ordenação (#1, #2, etc)
  const getSortNumber = (title: string) => {
    const match = title.match(/#(\d+)/);
    return match ? parseInt(match[1]) : Infinity;
  };

  // Organizar os prompts por categoria e ordenação numérica
  const organizedPrompts = (() => {
    if (!prompts) return [];

    // Se o usuário clicou em "Ver Todos", mostramos tudo em ordem numérica sem categorias
    if (viewAllOrder) {
      return [...prompts].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    }

    // Se houver uma tag selecionada, filtramos e ordenamos apenas por ela
    if (selectedTag) {
      return prompts
        .filter(p => p.title.includes(`[${selectedTag}]`) || p.description.includes(`[${selectedTag}]`))
        .sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    }

    // Se "Todos" estiver selecionado, organizamos por categorias (tags)
    const categories: { [key: string]: Prompt[] } = {};
    const uncategorized: Prompt[] = [];

    prompts.forEach(p => {
      const tags = Array.from(new Set([
        ...(p.title.match(/\[([^\]]+)\]/g) || []),
        ...(p.description.match(/\[([^\]]+)\]/g) || [])
      ].map(tag => tag.slice(1, -1))));

      if (tags.length === 0) {
        uncategorized.push(p);
      } else {
        tags.forEach(tag => {
          if (!categories[tag]) categories[tag] = [];
          categories[tag].push(p);
        });
      }
    });

    const result: { tag: string | null, prompts: Prompt[] }[] = [];
    allTags.forEach(tag => {
      if (categories[tag]) {
        result.push({
          tag,
          prompts: categories[tag].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title))
        });
      }
    });

    if (uncategorized.length > 0) {
      result.push({
        tag: null,
        prompts: uncategorized.sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title))
      });
    }

    return result;
  })();

  const filteredPrompts = (() => {
    const search = searchTerm.toLowerCase();
    if (search) {
      return prompts?.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      ).sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 50);
    }
    return null;
  })();

  const previewPrompts = prompts?.sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 15) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/[0.03]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo-wms.png" 
              alt="WMS Logo" 
              className="h-10 w-10 object-contain rounded-lg shadow-sm"
            />
            <h1 className="text-xl font-bold tracking-tight">Bíblioteca de Prompts WMS</h1>
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

      <main className="container mx-auto px-6 py-2 md:py-4">
        {/* Intro */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-center md:text-left">
              Prompts exclusivos para membros WMS
            </h2>
            <p className="text-gray-400 max-w-2xl text-lg font-light text-center md:text-left leading-relaxed">
              Pegue o que for útil e use para colocar dinheiro no seu bolso, viralizar vídeos e fazer a mudança na sua própria história.
            </p>
          </div>
        </div>

        {/* Bloco de Preview em Ordem Numérica */}
        {!isLoading && !searchTerm && showCarousel && !selectedTag && !viewAllOrder && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Início (#1, #2, ...)</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setViewAllOrder(true);
                  setShowCarousel(false);
                }}
                className="text-xs font-bold hover:bg-black/5 rounded-lg"
              >
                Ver lista completa <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 md:gap-4">
              {previewPrompts.map((prompt) => (
                <div key={`preview-${prompt.id}`} className="group/item relative aspect-[3/4] rounded-xl overflow-hidden border border-black/[0.03] shadow-sm">
                  <img 
                    src={prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`} 
                    alt={prompt.title} 
                    className="w-full h-full object-cover transition-transform group-hover/item:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                    <PromptItemOnlyDialog prompt={prompt} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter line-clamp-1">
                      {prompt.title.match(/#\d+/) ? prompt.title.match(/#\d+/)?.[0] : ""}
                    </span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  setViewAllOrder(true);
                  setShowCarousel(false);
                }}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-1 hover:bg-black/[0.02] transition-colors group"
              >
                <Grid className="w-5 h-5 text-black/20 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold uppercase text-black/40">Ver Todos</span>
              </button>
            </div>
          </div>
        )} oncology:

        {/* Filtro de Tags - Redesenhado */}
        {!isLoading && (
          <div className="mb-10 sticky top-[80px] z-30 bg-white/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-black/[0.02]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={(!selectedTag && !viewAllOrder) ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTag(null);
                    setViewAllOrder(false);
                    setShowCarousel(true);
                  }}
                  className={`rounded-xl px-4 h-9 text-[11px] font-bold uppercase tracking-wider transition-all flex-none border-black/10 ${
                    (!selectedTag && !viewAllOrder) ? "bg-black text-white shadow-lg shadow-black/20" : "bg-white hover:bg-black/5"
                  }`}
                >
                  Categorias
                </Button>
                <Button
                  variant={viewAllOrder ? "default" : "outline"}
                  onClick={() => {
                    setViewAllOrder(true);
                    setSelectedTag(null);
                    setShowCarousel(false);
                  }}
                  className={`rounded-xl px-4 h-9 text-[11px] font-bold uppercase tracking-wider transition-all flex-none border-black/10 ${
                    viewAllOrder ? "bg-black text-white shadow-lg shadow-black/20" : "bg-white hover:bg-black/5"
                  }`}
                >
                  Ordem Numérica
                </Button>
                <div className="w-px h-4 bg-black/10 flex-none mx-2" />
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag ? null : tag);
                      setViewAllOrder(false);
                      setShowCarousel(false);
                    }}
                    className={`rounded-xl px-4 h-9 text-[11px] font-bold uppercase tracking-wider transition-all flex-none border-black/10 ${
                      selectedTag === tag 
                        ? "bg-black text-white shadow-lg shadow-black/20" 
                        : "bg-white hover:bg-black/5"
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-black/5 rounded-full" />
              <div className="w-12 h-12 border-t-2 border-black rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-sm font-medium text-gray-400 animate-pulse">Carregando biblioteca...</p>
          </div>
        ) : (searchTerm ? filteredPrompts : organizedPrompts)?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <ImageIcon className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium">Nenhum resultado</h3>
            <p className="text-sm">Tente outros termos ou atualize a página.</p>
          </div>
        ) : searchTerm ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(filteredPrompts as Prompt[])?.map((prompt) => (
              <PromptItem key={`${prompt.id}-search`} prompt={prompt} />
            ))}
          </div>
        ) : (selectedTag || viewAllOrder) ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(organizedPrompts as Prompt[])?.map((prompt) => (
              <PromptItem key={`${prompt.id}-tag-or-order`} prompt={prompt} />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {(organizedPrompts as { tag: string | null, prompts: Prompt[] }[]).map((group, groupIdx) => (
              <div key={group.tag || 'uncategorized'} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-black/80">
                    {group.tag || "Sem Categoria"}
                  </h3>
                  <div className="h-px flex-1 bg-black/[0.05]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {group.prompts.map((prompt) => (
                    <PromptItem key={`${group.tag}-${prompt.id}`} prompt={prompt} />
                  ))}
                </div>
              </div>
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


function PromptItemOnlyDialog({ prompt }: { prompt: Prompt }) {
  const [isOpen, setIsOpen] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copiado!");
  };

  const neonColors = [
    'bg-[#FF00FF] text-white border-transparent', 
    'bg-[#00D1FF] text-white border-transparent', 
    'bg-[#39FF14] text-black border-transparent', 
    'bg-[#FFFB00] text-black border-transparent', 
    'bg-[#FF3131] text-white border-transparent', 
    'bg-[#8A2BE2] text-white border-transparent', 
    'bg-[#FF5E00] text-white border-transparent', 
    'bg-[#00FF94] text-black border-transparent', 
    'bg-[#7000FF] text-white border-transparent', 
    'bg-[#FF007A] text-white border-transparent', 
  ];

  const getTagColor = (content: string) => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = content.charCodeAt(i) + ((hash << 5) - hash);
    }
    return neonColors[Math.abs(hash) % neonColors.length];
  };

  const renderWithTags = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const tagContent = part.slice(1, -1);
        const colorClass = getTagColor(tagContent);
        return (
          <span 
            key={index} 
            className={`${colorClass} text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-wider inline-flex items-center align-middle mx-0.5 leading-none transition-transform hover:scale-105`}
          >
            {tagContent}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md p-0 hover:bg-white/40 border border-white/20">
          <ImageIcon className="w-4 h-4 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] bg-white p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
          <div className="bg-[#F9F9F9] p-8 md:p-12 overflow-y-auto custom-scrollbar border-r border-black/[0.03]">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {prompt.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-black/[0.03] shadow-sm bg-white group/img">
                    <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/img:scale-105 duration-500" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-black/40 uppercase tracking-widest text-[10px] font-bold">
                  <BookOpen className="w-3 h-3" />
                  <span>Tutorial & Contexto</span>
                </div>
                <div className="prose prose-sm prose-neutral max-w-none prose-p:leading-relaxed prose-p:text-gray-600 prose-headings:text-black prose-strong:text-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prompt.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-between bg-white overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              <DialogHeader className="mb-8 text-left">
                <DialogTitle className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{renderWithTags(prompt.title)}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 text-black/40 uppercase tracking-widest text-[10px] font-bold mb-4">
                  <Terminal className="w-3 h-3" />
                  <span>Prompt de Alta Performance</span>
                </div>
                <div className="relative group flex-1 min-h-0">
                  <div className="h-full bg-black/[0.02] p-8 rounded-3xl border border-black/[0.03] overflow-y-auto custom-scrollbar">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-800">
                      {prompt.content}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button 
                onClick={copyToClipboard}
                className="w-full bg-black text-white hover:bg-black/90 rounded-2xl h-16 text-base font-medium shadow-xl shadow-black/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Copy className="w-5 h-5" /> COPIAR PROMPT COMPLETO
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PromptItem({ prompt }: { prompt: Prompt }) {
  const [isOpen, setIsOpen] = useState(false);
  const mainImage = prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copiado!");
  };

  const neonColors = [
    'bg-[#FF00FF] text-white border-transparent', // Magenta vibrante
    'bg-[#00D1FF] text-white border-transparent', // Cyan vibrante
    'bg-[#39FF14] text-black border-transparent', // Neon Green
    'bg-[#FFFB00] text-black border-transparent', // Yellow
    'bg-[#FF3131] text-white border-transparent', // Red
    'bg-[#8A2BE2] text-white border-transparent', // Purple
    'bg-[#FF5E00] text-white border-transparent', // Orange
    'bg-[#00FF94] text-black border-transparent', // Mint
    'bg-[#7000FF] text-white border-transparent', // Indigo
    'bg-[#FF007A] text-white border-transparent', // Pink
  ];

  const getTagColor = (content: string) => {
    // Gerar um índice baseado na string para manter a cor consistente para a mesma tag
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = content.charCodeAt(i) + ((hash << 5) - hash);
    }
    return neonColors[Math.abs(hash) % neonColors.length];
  };

  const renderWithTags = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const tagContent = part.slice(1, -1);
        const colorClass = getTagColor(tagContent);
        return (
          <span 
            key={index} 
            className={`${colorClass} text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-wider inline-flex items-center align-middle mx-0.5 leading-none transition-transform hover:scale-105`}
          >
            {tagContent}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="group bg-white rounded-2xl border border-black/[0.03] overflow-hidden transition-all duration-500 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={mainImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4 md:p-5">
        <h3 className="text-sm md:text-base font-bold leading-tight mb-2 min-h-[1.25em]">
          {renderWithTags(prompt.title)}
        </h3>
        <p className="text-gray-400 text-[11px] md:text-xs font-light mb-4 line-clamp-2 leading-relaxed">
          {renderWithTags(prompt.description)}
        </p>
        
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-black text-white hover:bg-black/90 rounded-xl h-10 text-xs font-medium transition-all shadow-lg shadow-black/5">
                Visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] bg-white p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
              <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
                {/* Lado Esquerdo: Imagens e Tutorial */}
                <div className="bg-[#F9F9F9] p-8 md:p-12 overflow-y-auto custom-scrollbar border-r border-black/[0.03]">
                  <div className="space-y-8">
                    {/* Galeria de Imagens */}
                    <div className="grid grid-cols-2 gap-4">
                      {prompt.images.map((img, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-black/[0.03] shadow-sm bg-white group/img">
                          <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/img:scale-105 duration-500" />
                        </div>
                      ))}
                      {prompt.images.length === 0 && (
                        <div className="col-span-2 aspect-video bg-black/[0.02] rounded-2xl flex items-center justify-center text-gray-300 border border-dashed border-black/10">
                          <ImageIcon className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                    </div>

                    {/* Tutorial / Descrição */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-black/40 uppercase tracking-widest text-[10px] font-bold">
                        <BookOpen className="w-3 h-3" />
                        <span>Tutorial & Contexto</span>
                      </div>
                      <div className="prose prose-sm prose-neutral max-w-none prose-p:leading-relaxed prose-p:text-gray-600 prose-headings:text-black prose-strong:text-black">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {prompt.description}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Lado Direito: Prompt */}
                <div className="p-8 md:p-12 flex flex-col justify-between bg-white overflow-hidden">
                  <div className="flex flex-col h-full overflow-hidden">
                    <DialogHeader className="mb-8 text-left">
                      <DialogTitle className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{renderWithTags(prompt.title)}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center gap-2 text-black/40 uppercase tracking-widest text-[10px] font-bold mb-4">
                        <Terminal className="w-3 h-3" />
                        <span>Prompt de Alta Performance</span>
                      </div>
                      
                      <div className="relative group flex-1 min-h-0">
                        <div className="h-full bg-black/[0.02] p-8 rounded-3xl border border-black/[0.03] overflow-y-auto custom-scrollbar">
                          <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-800">
                            {prompt.content}
                          </pre>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={copyToClipboard}
                            className="bg-white/80 backdrop-blur shadow-sm rounded-xl h-9"
                          >
                            <Copy className="w-3 h-3 mr-2" /> Copiar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      onClick={copyToClipboard}
                      className="w-full bg-black text-white hover:bg-black/90 rounded-2xl h-16 text-base font-medium shadow-xl shadow-black/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <Copy className="w-5 h-5" /> COPIAR PROMPT COMPLETO
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
