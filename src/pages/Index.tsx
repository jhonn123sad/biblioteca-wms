import { useState, useRef, useEffect, Component, ReactNode, useMemo } from "react";
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
  RotateCw,
  AlertCircle,
  Instagram,
  Youtube,
  Users,
  Filter,
  Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Error Boundary para capturar erros fatais e evitar tela branca
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("FATA_ERROR:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold">Ops! Algo deu errado.</h1>
            <p className="text-gray-500 text-sm">O sistema encontrou um erro inesperado.</p>
            <Button onClick={() => window.location.reload()} className="bg-black text-white rounded-xl">Recarregar Página</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const normalized = content.toLowerCase().trim();
  if (normalized === "curso dentro") {
    return "bg-[#FF007A]/10 text-[#FF007A] border-[#FF007A] border-[3px] shadow-[0_0_15px_rgba(255,0,122,0.3)] font-black uppercase";
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

function MainApp() {
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Correção para Safari Mobile em dispositivos antigos
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      const auth = localStorage.getItem("wms_member_auth");
      const name = localStorage.getItem("wms_member_name");
      if (auth === "true") {
        setIsAuthenticated(true);
        if (name) setUserName(name);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');
    if (!sanitizedPhone) {
      toast.error("Por favor, insira o número do seu WhatsApp.");
      return;
    }

    setIsVerifying(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(`${AUTH_SCRIPT_URL}?phone=${encodeURIComponent(sanitizedPhone)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();

      if (data && data.authorized) {
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
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Login error:", error);
      if (error.name === 'AbortError') {
        toast.error("Tempo de conexão esgotado. Verifique sua internet.");
      } else {
        toast.error("Erro ao validar acesso. Verifique sua conexão e tente novamente.");
      }
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
    try {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    } catch (e) {
      // Fallback para navegadores antigos
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const { data: prompts, isLoading, refetch, isError } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      try {
        const response = await fetch(PROMPTS_SCRIPT_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Falha na resposta do servidor.");
        const json = await response.json();
        return formatSheetData(json.data || []);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("Fetch prompts error:", err);
        throw err;
      }
    },
    retry: 2,
    refetchInterval: 60000, // Sync every minute
    staleTime: 30000,
  });

  const allTags = useMemo(() => {
    return Array.from(new Set(
      prompts?.flatMap(p => {
        const titleTags = p.title.match(/\[([^\]]+)\]/g) || [];
        const descTags = p.description.match(/\[([^\]]+)\]/g) || [];
        return [...titleTags, ...descTags].map(tag => tag.slice(1, -1));
      }) || []
    )).sort();
  }, [prompts]);

  const getSortNumber = (title: string) => {
    const match = title.match(/#(\d+)/);
    return match ? parseInt(match[1]) : Infinity;
  };

  const organizedPrompts = useMemo(() => {
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
          prompts: [...categories[tag]].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title))
        });
      }
    });

    if (uncategorized.length > 0) {
      result.push({
        tag: null,
        prompts: [...uncategorized].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title))
      });
    }

    return result;
  }, [prompts, viewAllOrder, selectedTag, allTags]);

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

  const previewPrompts = prompts ? [...prompts].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 11) : [];

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
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-black selection:text-white overflow-x-hidden flex flex-col w-full antialiased">
      <header className="sticky top-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-black/[0.02] safe-top w-full transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
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
            
            <div ref={scrollContainerRef} className="flex gap-5 md:gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none px-4 md:px-0">
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
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-black/40" />
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-black/60">Filtros da Biblioteca</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden text-[10px] font-bold uppercase tracking-wider bg-black/5 rounded-lg px-3 h-8"
              >
                {isFilterOpen ? "Fechar" : "Ver Categorias"}
              </Button>
            </div>

            <div className={`${isFilterOpen ? 'flex' : 'hidden'} md:flex flex-wrap gap-2 md:gap-3 transition-all duration-300`}>
              <Button
                variant={(!selectedTag && !viewAllOrder) ? "default" : "outline"}
                onClick={() => { setSelectedTag(null); setViewAllOrder(false); setShowCarousel(true); setIsFilterOpen(false); }}
                className={`rounded-xl px-4 h-10 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest flex-none transition-all border-2 ${(!selectedTag && !viewAllOrder) ? "bg-black text-white border-black shadow-lg shadow-black/20" : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"}`}
              >
                <Grid className="w-3.5 h-3.5 mr-2" />
                Início
              </Button>
              
              <Button
                variant={viewAllOrder ? "default" : "outline"}
                onClick={() => { setViewAllOrder(true); setSelectedTag(null); setShowCarousel(false); setIsFilterOpen(false); }}
                className={`rounded-xl px-4 h-10 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest flex-none transition-all border-2 ${viewAllOrder ? "bg-black text-white border-black shadow-lg shadow-black/20" : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"}`}
              >
                <span className="mr-2">#</span>
                Ordem Numérica
              </Button>

              <div className="w-full md:w-px h-px md:h-11 bg-black/5 my-1 md:my-0" />

              {allTags.map(tag => {
                const isSpecial = tag.toLowerCase() === "curso dentro";
                const isSelected = selectedTag === tag;
                return (
                  <Button
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => { setSelectedTag(isSelected ? null : tag); setViewAllOrder(false); setShowCarousel(false); setIsFilterOpen(false); }}
                    className={`rounded-xl px-4 h-10 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest flex-none transition-all border-2 ${
                      isSelected 
                        ? "bg-black text-white border-black shadow-lg shadow-black/20" 
                        : isSpecial 
                          ? "bg-[#FF007A]/5 text-[#FF007A] border-[#FF007A] hover:bg-[#FF007A]/10" 
                          : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 mr-2" />}
                    {tag}
                  </Button>
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
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-bold">Erro ao carregar dados</h3>
            <p className="text-sm text-gray-500">Não foi possível conectar à base de dados.</p>
            <Button onClick={() => refetch()} className="bg-black text-white rounded-xl">Tentar Novamente</Button>
          </div>
        ) : (searchTerm ? filteredPrompts : organizedPrompts)?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <ImageIcon className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium">Nenhum resultado</h3>
            <p className="text-sm">Tente outros termos ou limpe o filtro.</p>
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

      <footer className="container mx-auto px-4 md:px-12 py-16 border-t border-black/[0.05] mt-20 bg-black/[0.01]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo-wms.png" alt="WMS Logo" className="h-10 w-10 object-contain rounded-xl" />
              <h2 className="text-xl font-black uppercase tracking-tighter">WMS Society</h2>
            </div>
            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-xs">
              A maior comunidade de tecnologia e lifestyle para quem busca a liberdade através da internet.
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nossa Comunidade
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <a href="https://www.instagram.com/webmoneysociety/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/[0.03] shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF007A] via-[#833AB4] to-[#FCAF45] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Instagram</span>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">@webmoneysociety</span>
                </div>
              </a>
              <a href="https://www.youtube.com/@WMoneySociety" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/[0.03] shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#FF0000] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">YouTube</span>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Inscreva-se</span>
                </div>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Fundadores</h3>
            <div className="grid grid-cols-1 gap-4">
              <a href="https://www.instagram.com/jota.wms/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-black/[0.05] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative w-14 h-14 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF007A] to-[#8A2BE2] animate-pulse opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="w-full h-full rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center relative z-10">
                    <img 
                      src="/jota.jpg" 
                      alt="Jota" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jota";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center z-20">
                    <Instagram className="w-3.5 h-3.5 text-[#FF007A]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight">Jota</span>
                  <span className="text-[11px] text-[#FF007A] font-bold uppercase tracking-wider">@jota.wms</span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                    <span>Seguir</span>
                    <ExternalLink className="w-2 h-2" />
                  </div>
                </div>
              </a>

              <a href="https://www.instagram.com/ia.gostini/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-black/[0.05] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative w-14 h-14 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#39FF14] animate-pulse opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="w-full h-full rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center relative z-10">
                    <img 
                      src="/agostini.jpg" 
                      alt="Agostini" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Agostini";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center z-20">
                    <Instagram className="w-3.5 h-3.5 text-[#00D1FF]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight">Agostini</span>
                  <span className="text-[11px] text-[#00D1FF] font-bold uppercase tracking-wider">@ia.gostini</span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                    <span>Seguir</span>
                    <ExternalLink className="w-2 h-2" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-black/[0.03] opacity-40">
          <p className="text-[10px] font-black tracking-widest uppercase">&copy; {new Date().getFullYear()} WEB MONEY SOCIETY</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest">Premium Resource</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Official Library</span>
          </div>
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
      <div className="aspect-[3/4] overflow-hidden relative bg-gray-50">
        <img 
          src={mainImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          loading="lazy" 
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3 md:p-5 flex flex-col flex-1 min-w-0">
        <h3 className="text-[12px] md:text-base font-bold leading-tight mb-2 md:mb-3 min-h-[2.5em]">{renderWithTags(prompt.title)}</h3>
        <div className="text-gray-400 text-[10px] md:text-xs font-light mb-4 line-clamp-3 leading-relaxed flex-1 overflow-hidden">
          {prompt.description.replace(/\[[^\]]+\]/g, '')}
        </div>
        <Button 
          onClick={onView}
          className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-9 md:h-11 text-[11px] md:text-sm font-bold transition-all shadow-lg shadow-black/5 active:scale-95"
        >
          Visualizar
        </Button>
      </div>
    </div>
  );
}

function PromptDetailView({ prompt, onClose }: { prompt: Prompt, onClose: () => void }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const copyToClipboard = () => {
    if (!prompt.content) return;
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copiado!");
  };

  useEffect(() => {
    // Bloquear scroll e garantir que o modal cubra tudo
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.style.position = 'relative';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col antialiased animate-in fade-in duration-200">
      {/* Universal Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-black/[0.05] bg-white flex-shrink-0 z-10">
        <div className="flex-1 min-w-0 pr-4">
          <div className="text-xs md:text-lg font-black tracking-tight break-words leading-tight flex flex-wrap gap-1 items-center">
            {renderWithTags(prompt.title)}
          </div>
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
                    <div 
                      key={i} 
                      onClick={() => setExpandedImage(img)}
                      className="aspect-square rounded-2xl overflow-hidden border border-black/[0.03] shadow-sm bg-white cursor-zoom-in group/img relative"
                    >
                      <img src={img} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Search className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
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
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {prompt.description}
                    </ReactMarkdown>
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
      {/* Image Zoom Overlay */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200 overflow-hidden touch-none"
          onClick={() => { setExpandedImage(null); setZoomScale(1); }}
          onWheel={(e) => {
            if (e.deltaY < 0) setZoomScale(s => Math.min(s + 0.2, 5));
            else setZoomScale(s => Math.max(s - 0.2, 1));
          }}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 z-[210]"
            onClick={(e) => { e.stopPropagation(); setExpandedImage(null); setZoomScale(1); }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="w-full h-full flex items-center justify-center cursor-zoom-out relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={expandedImage} 
              alt="Expanded" 
              className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-200 select-none pointer-events-none"
              style={{ 
                transform: `scale(${zoomScale})`,
                cursor: zoomScale > 1 ? 'move' : 'zoom-in'
              }}
            />
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[210]">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <button onClick={() => setZoomScale(s => Math.max(s - 0.5, 1))} className="text-white font-bold p-2">-</button>
              <span className="text-white text-[10px] font-mono w-8 text-center">{Math.round(zoomScale * 100)}%</span>
              <button onClick={() => setZoomScale(s => Math.min(s + 0.5, 5))} className="text-white font-bold p-2">+</button>
            </div>
            <p className="text-white/40 text-[9px] uppercase tracking-widest font-medium">
              Use o scroll ou botões para zoom
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Index() {
  return (
    <ErrorBoundary>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --vh: 1vh; }
        .min-h-screen { min-height: 100vh; min-height: calc(var(--vh, 1vh) * 100); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        * { -webkit-tap-highlight-color: transparent; }
        body { overflow-x: hidden; width: 100%; position: relative; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        
        /* Garantir que o header seja fixo e tenha prioridade visual */
        header { 
          position: fixed !important; 
          top: 0 !important; 
          left: 0 !important;
          right: 0 !important;
          z-index: 100 !important;
          width: 100%;
        }

        main {
          margin-top: 64px; /* Altura do header mobile */
        }

        @media (min-width: 768px) {
          main {
            margin-top: 80px; /* Altura do header desktop */
          }
        }

        @media (max-width: 640px) {
          .container { padding-left: 1rem; padding-right: 1rem; }
        }
      `}} />
      <MainApp />
    </ErrorBoundary>
  );
}
