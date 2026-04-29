import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { 
  Loader2, 
  Copy, 
  Search, 
  Grid, 
  ExternalLink, 
  Image as ImageIcon,
  BookOpen,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Lock,
  Phone,
  X,
  RotateCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// CONFIGURAÇÃO DO GOOGLE SHEETS VIA APPS SCRIPT
const PROMPTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEyFpibtm2eSElodTKKMSVF2dK1S3vKtRAjCWmF86L18wQ6Kf8HShFNTHORegiHUgc/exec";
const AUTH_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwtcYiY9cgrk_vme8aMZEKJvUoaIMvjXq4UxwbtFNUMGWvRQJiUhhU1thdmOwIwZ7k5/exec";

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
}

const fixDriveLink = (url: string) => {
  if (!url || typeof url !== 'string') return "";
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
  }
  return url.startsWith('http') ? url : "";
};

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
  if (content.toLowerCase() === "curso dentro") {
    return "bg-[#FF007A]/10 text-[#FF007A] border-[#FF007A] border-2";
  }
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
          className={`${colorClass} text-[8px] md:text-[10px] font-bold px-1 md:px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-wider inline-flex items-center align-middle mx-0.5 leading-none transition-transform hover:scale-105`}
        >
          {tagContent}
        </span>
      );
    }
    return part;
  });
};

const linkify = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#FF007A] hover:underline break-all font-bold"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(true);
  const [viewAllOrder, setViewAllOrder] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem("wms_member_auth");
    const name = localStorage.getItem("wms_member_name");
    if (auth === "true") {
      setIsAuthenticated(true);
      if (name) setUserName(name);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsVerifying(true);
    try {
      const response = await fetch(`${AUTH_SCRIPT_URL}?phone=${encodeURIComponent(phoneNumber.replace(/\D/g, ''))}`);
      const data = await response.json();

      if (data.authorized) {
        const finalName = data.name || "Membro";
        setUserName(finalName);
        setShowWelcome(true);
        
        setTimeout(() => {
          setIsAuthenticated(true);
          localStorage.setItem("wms_member_auth", "true");
          localStorage.setItem("wms_member_name", finalName);
          setShowWelcome(false);
          toast.success(`Bem-vindo(a), ${finalName}!`);
        }, 3000);
      } else {
        toast.error("Número não autorizado. Verifique se você já fez o onboarding.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao validar acesso. Tente novamente.");
    } finally {
      setIsVerifying(false);
    }
  };

  const LogoutButton = () => (
    <Button 
      variant="ghost" 
      onClick={() => {
        localStorage.removeItem("wms_member_auth");
        localStorage.removeItem("wms_member_name");
        setIsAuthenticated(false);
        toast.info("Você saiu do sistema.");
      }}
      className="text-[9px] md:text-xs text-gray-400 hover:text-red-500 transition-colors h-7 md:h-8 px-1.5 md:px-2 flex-shrink-0"
    >
      Sair
    </Button>
  );

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const { data: prompts, isLoading, refetch } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      try {
        const response = await fetch(PROMPTS_SCRIPT_URL);
        if (!response.ok) throw new Error("Não foi possível carregar os dados.");
        const json = await response.json();
        return formatSheetData(json.data || []);
      } catch (err: any) {
        console.error(err);
        return [];
      }
    },
    refetchInterval: 30000, // Sync every 30 seconds
    staleTime: 10000,
  });

  const allTags = Array.from(new Set(
    prompts?.flatMap(p => {
      const titleTags = p.title.match(/\[([^\]]+)\]/g) || [];
      const descTags = p.description.match(/\[([^\]]+)\]/g) || [];
      return [...titleTags, ...descTags].map(tag => tag.slice(1, -1));
    }) || []
  )).sort();

  const getSortNumber = (title: string) => {
    const match = title.match(/#(\d+)/);
    return match ? parseInt(match[1]) : Infinity;
  };

  const organizedPrompts = (() => {
    if (!prompts) return [];
    if (viewAllOrder) {
      return [...prompts].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    }
    if (selectedTag) {
      return prompts
        .filter(p => p.title.includes(`[${selectedTag}]`) || p.description.includes(`[${selectedTag}]`))
        .sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    }

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

  const previewPrompts = prompts?.sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 11) || [];

  if (isAuthenticated === null) return null;

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 transition-all duration-1000">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
          <h2 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-[0.3em] animate-pulse">
            Acesso Autorizado
          </h2>
          <h1 className="text-2xl md:text-6xl font-bold text-white tracking-tight">
            Bem-vindo(a), <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-tight break-words px-4">{userName}</span>
          </h1>
          <div className="flex justify-center mt-8">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 selection:bg-black selection:text-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-black shadow-xl shadow-black/10 mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Biblioteca WMS</h1>
            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base px-2">
              Esta é uma área exclusiva. Use seu número de WhatsApp cadastrado para entrar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
              <input 
                type="tel" 
                placeholder="WhatsApp (apenas números)" 
                value={phoneNumber}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin(e);
                }}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isVerifying}
                className="w-full bg-black/[0.03] border border-transparent rounded-2xl h-14 md:h-16 pl-12 pr-4 text-base focus:bg-white focus:border-black/10 focus:ring-0 transition-all outline-none"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isVerifying || !phoneNumber}
              className="w-full bg-black text-white hover:bg-black/90 rounded-2xl h-14 md:h-16 text-base font-medium shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
            >
              {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Entrar na Biblioteca"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-black selection:text-white overflow-x-hidden flex flex-col w-full antialiased">
      <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-black/[0.03] safe-top w-full">
        <div className="container mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <img src="/logo-wms.png" alt="WMS Logo" className="h-7 w-7 md:h-10 md:w-10 object-contain rounded-lg shadow-sm" />
            <h1 className="text-xs md:text-xl font-bold tracking-tight line-clamp-1 hidden xs:block">Biblioteca WMS</h1>
          </div>
          
          <div className="relative flex-1 max-w-[180px] xs:max-w-md group min-w-0">
            <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3 md:w-3.5 h-3 md:h-3.5 text-gray-400 group-focus-within:text-black" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/[0.04] border border-transparent rounded-xl h-9 md:h-10 pl-8 md:pl-9 pr-3 md:pr-4 text-[11px] md:text-sm focus:bg-white focus:border-black/10 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                refetch();
                toast.success("Sincronizando biblioteca...");
              }}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-black hover:bg-black/5"
              title="Sincronizar"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-6 py-4 md:py-6 flex-1 w-full max-w-full overflow-x-hidden">
        <div className="mb-6 md:mb-12 flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-3">
          <h2 className="text-2xl md:text-5xl font-bold tracking-tight leading-tight">Prompts WMS</h2>
          <p className="text-gray-400 max-w-2xl text-[11px] md:text-lg font-light leading-relaxed px-1 md:px-0">
            Pegue o que for útil e use para colocar dinheiro no seu bolso, viralizar vídeos e fazer a mudança na sua própria história.
          </p>
        </div>

        {!isLoading && !searchTerm && showCarousel && !selectedTag && !viewAllOrder && (
          <div className="mb-8 md:mb-12 relative w-full">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-[9px] md:text-sm font-bold uppercase tracking-widest text-black/40">Recentes</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => scrollCarousel('left')} className="w-8 h-8 rounded-full border border-black/5 md:flex hidden">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => scrollCarousel('right')} className="w-8 h-8 rounded-full border border-black/5 md:flex hidden">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setViewAllOrder(true); setShowCarousel(false); }} className="text-[9px] md:text-xs font-bold hover:bg-black/5 rounded-lg px-2 h-7 md:h-8">
                  <span>Ordem Numérica</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </Button>
              </div>
            </div>
            
            <div ref={scrollContainerRef} className="flex gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none -mx-3 px-3 md:-mx-4 md:px-4">
              {previewPrompts.map((prompt) => (
                <div key={`preview-${prompt.id}`} className="group/item relative flex-none w-[110px] xs:w-[130px] md:w-36 aspect-[3/4] rounded-xl overflow-hidden border border-black/[0.03] shadow-sm snap-start">
                  <img src={prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`} alt={prompt.title} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center md:opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Button 
                      onClick={() => setSelectedPrompt(prompt)}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-md p-0 hover:bg-white/40 border border-white/20"
                    >
                      <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 md:p-2">
                    <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-tighter line-clamp-1">{prompt.title.match(/#\d+/) ? prompt.title.match(/#\d+/)?.[0] : ""}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => { setViewAllOrder(true); setShowCarousel(false); }} className="flex-none w-[110px] xs:w-[130px] md:w-36 aspect-[3/4] rounded-xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-1.5 md:gap-2 hover:bg-black/[0.02] snap-start">
                <Grid className="w-5 h-5 md:w-6 md:h-6 text-black/20" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase text-black/40">Ordem Numérica</span>
              </button>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="mb-6 md:mb-8 sticky top-[64px] md:top-[80px] z-30 bg-white/95 backdrop-blur-md py-2 md:py-3 -mx-3 px-3 md:-mx-6 md:px-6 border-b border-black/[0.03]">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 max-w-full">
              <Button
                variant={(!selectedTag && !viewAllOrder) ? "default" : "outline"}
                onClick={() => { setSelectedTag(null); setViewAllOrder(false); setShowCarousel(true); }}
                className={`rounded-full px-3 md:px-4 h-7 md:h-8 text-[9px] md:text-[11px] font-bold uppercase tracking-wider flex-none ${(!selectedTag && !viewAllOrder) ? "bg-black text-white shadow-md shadow-black/10" : "bg-white"}`}
              >Início</Button>
              <Button
                variant={viewAllOrder ? "default" : "outline"}
                onClick={() => { setViewAllOrder(true); setSelectedTag(null); setShowCarousel(false); }}
                className={`rounded-full px-3 md:px-4 h-7 md:h-8 text-[9px] md:text-[11px] font-bold uppercase tracking-wider flex-none ${viewAllOrder ? "bg-black text-white shadow-md shadow-black/10" : "bg-white"}`}
              >Ordem Numérica</Button>
              <div className="hidden xs:block w-[1px] h-4 bg-black/10 flex-none mx-0.5 md:mx-1" />
              {allTags.map(tag => {
                const isSpecial = tag.toLowerCase() === "curso dentro";
                const isSelected = selectedTag === tag;
                return (
                  <Button
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => { setSelectedTag(isSelected ? null : tag); setViewAllOrder(false); setShowCarousel(false); }}
                    className={`rounded-full px-3 md:px-4 h-7 md:h-8 text-[9px] md:text-[11px] font-bold uppercase tracking-wider flex-none transition-all ${
                      isSelected 
                        ? "bg-black text-white shadow-md shadow-black/10" 
                        : isSpecial 
                          ? "bg-[#FF007A]/5 text-[#FF007A] border-[#FF007A] border-2 hover:bg-[#FF007A]/10" 
                          : "bg-white hover:bg-black/5"
                    }`}
                  >{tag}</Button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative"><div className="w-10 h-10 border-2 border-black/5 rounded-full" /><div className="w-10 h-10 border-t-2 border-black rounded-full animate-spin absolute top-0 left-0" /></div>
            <p className="text-sm font-medium text-gray-400 animate-pulse">Carregando biblioteca...</p>
          </div>
        ) : (searchTerm ? filteredPrompts : organizedPrompts)?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <ImageIcon className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium">Nenhum resultado</h3>
            <p className="text-sm">Tente outros termos.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {searchTerm ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
                {(filteredPrompts as Prompt[])?.map((prompt) => (
                  <PromptCard 
                    key={`${prompt.id}-search`} 
                    prompt={prompt} 
                    onView={() => setSelectedPrompt(prompt)}
                  />
                ))}
              </div>
            ) : (selectedTag || viewAllOrder) ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
                {(organizedPrompts as Prompt[])?.map((prompt) => (
                  <PromptCard 
                    key={`${prompt.id}-list`} 
                    prompt={prompt} 
                    onView={() => setSelectedPrompt(prompt)}
                  />
                ))}
              </div>
            ) : (
              (organizedPrompts as { tag: string | null, prompts: Prompt[] }[]).map((group) => (
                <div key={group.tag || 'uncategorized'} className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <h3 className="text-sm md:text-xl font-bold uppercase tracking-widest text-black/80">{group.tag || "Sem Categoria"}</h3>
                    <div className="h-px flex-1 bg-black/[0.05]" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
                    {group.prompts.map((prompt) => (
                      <PromptCard 
                        key={`${group.tag}-${prompt.id}`} 
                        prompt={prompt} 
                        onView={() => setSelectedPrompt(prompt)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer className="container mx-auto px-6 py-12 border-t border-black/[0.03] mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <p className="text-[10px] font-medium tracking-wider uppercase">&copy; {new Date().getFullYear()} WMS</p>
          <div className="flex gap-8"><span className="text-[10px] font-medium uppercase tracking-widest">Minimalist</span><span className="text-[10px] font-medium uppercase tracking-widest">Sync</span></div>
        </div>
      </footer>

      {selectedPrompt && (
        <PromptDetailView 
          prompt={selectedPrompt} 
          onClose={() => setSelectedPrompt(null)} 
        />
      )}
    </div>
  );
}

function PromptCard({ prompt, onView }: { prompt: Prompt, onView: () => void }) {
  const mainImage = prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`;
  return (
    <div className="group bg-white rounded-xl md:rounded-2xl border border-black/[0.03] overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full w-full">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img src={mainImage} alt={prompt.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-2.5 md:p-5 flex flex-col flex-1 min-w-0">
        <h3 className="text-[11px] md:text-base font-bold leading-tight mb-1.5 md:mb-2 line-clamp-3 min-h-[3.3em] md:min-h-[3.5em]">{renderWithTags(prompt.title)}</h3>
        <p className="text-gray-400 text-[9px] md:text-xs font-light mb-3 md:mb-4 line-clamp-2 leading-relaxed flex-1 overflow-hidden">{renderWithTags(prompt.description)}</p>
        <Button 
          onClick={onView}
          className="w-full bg-black text-white hover:bg-black/90 rounded-lg md:rounded-xl h-8 md:h-10 text-[10px] md:text-xs font-medium transition-all shadow-lg shadow-black/5"
        >
          Visualizar
        </Button>
      </div>
    </div>
  );
}

function PromptDetailView({ prompt, onClose }: { prompt: Prompt, onClose: () => void }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const copyToClipboard = () => {
    if (!prompt.content) return;
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copiado!");
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col antialiased animate-in fade-in duration-200">
      {/* Universal Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-black/[0.05] bg-white flex-shrink-0 z-10">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xs md:text-lg font-bold uppercase tracking-tight break-words leading-tight">{prompt.title}</h3>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:scale-105"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="container mx-auto max-w-6xl h-full">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Column: Visual & Info */}
            <div className="w-full md:w-1/2 p-4 md:p-8 bg-[#F9F9F9] md:overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-black/[0.03]">
              <div className="space-y-6 md:space-y-8">
                {/* Image Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {prompt.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-black/[0.03] shadow-sm bg-white">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                  {prompt.images.length === 0 && (
                    <div className="col-span-2 aspect-video bg-black/[0.02] rounded-2xl flex items-center justify-center text-gray-300 border border-dashed border-black/10">
                      <ImageIcon className="w-10 h-10 opacity-10" />
                    </div>
                  )}
                </div>

                {/* Info Card */}
                <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-black/[0.03] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-black/30 uppercase tracking-[0.2em] text-[10px] font-bold border-b border-black/[0.03] pb-3">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Detalhes do Prompt</span>
                  </div>
                  <div className="prose prose-sm prose-neutral max-w-none prose-p:leading-relaxed prose-p:text-gray-600 prose-headings:text-black prose-a:text-[#FF007A] prose-a:no-underline hover:prose-a:underline prose-a:font-bold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt.description}</ReactMarkdown>
                  </div>
                </div>

                <div className="hidden md:block py-4">
                  <p className="text-center text-black/20 text-[10px] uppercase tracking-widest font-medium italic">
                    Role para ver o prompt abaixo em dispositivos móveis
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Prompt Content */}
            <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col bg-white">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2 text-black/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Conteúdo para Copiar</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="h-8 text-[11px] font-bold bg-black text-white rounded-xl px-4 shadow-lg hover:bg-black/80 transition-all active:scale-95"
                  >
                    COPIAR
                  </button>
                </div>

                <div className="relative group flex-1 bg-black/[0.02] rounded-[2rem] border border-black/[0.03] overflow-hidden min-h-[200px] md:min-h-0 mb-6">
                  <div className="h-full p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <pre className="text-[13px] md:text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-800 break-words">{linkify(prompt.content)}</pre>
                  </div>
                </div>

                <button 
                  onClick={copyToClipboard} 
                  className="w-full bg-black text-white rounded-2xl h-16 text-sm font-bold shadow-2xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-auto"
                >
                  <Copy className="w-5 h-5" />
                  COPIAR PROMPT PARA USAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
