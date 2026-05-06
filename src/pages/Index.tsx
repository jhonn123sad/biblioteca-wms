import { useState, useRef, useEffect, useMemo, Component, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Grid, 
  ExternalLink, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Check,
  X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { usePrompts, getSortNumber, Prompt } from "../hooks/usePrompts";
import { useAuth } from "../hooks/useAuth";
import { PromptCard } from "../components/PromptCard";
import { PromptDetailView } from "../components/PromptDetailView";
import { AuthView } from "../components/AuthView";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { AppHeader } from "../components/AppHeader";
import { AppFooter } from "../components/AppFooter";

/**
 * Componente ErrorBoundary para capturar falhas críticas no render 
 * e evitar que o aplicativo inteiro quebre.
 */
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { 
    console.error("CRITICAL_RENDER_ERROR:", error, errorInfo); 
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-sm">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">Ops! Algo deu errado.</h1>
            <p className="text-muted-foreground text-sm">Ocorreu um erro ao carregar esta parte da interface.</p>
            <Button onClick={() => window.location.reload()} variant="default" className="rounded-xl w-full">
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { isAuthenticated, isVerifying, userName, showWelcome, handleLogin, handleLogout } = useAuth();
  const { prompts, allTags, isLoading, refetch, isError } = usePrompts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(true);
  const [viewAllOrder, setViewAllOrder] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<Prompt | null>(null);
  const [gridCols, setGridCols] = useState<4 | 5>(4);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
    try {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    } catch (e) {
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const handleViewPrompt = (prompt: Prompt) => {
    if (!isAuthenticated) {
      setPendingPrompt(prompt);
      setShowAuthOverlay(true);
      return;
    }
    setSelectedPrompt(prompt);
  };


  const organizedPrompts = useMemo(() => {
    if (!prompts) return [];
    
    const getPromptTags = (p: Prompt) => {
      const tagRegex = /\[([^\]]+)\](?!\()/g;
      const matches = [
        ...(p.title.match(tagRegex) || []),
        ...(p.description.match(tagRegex) || [])
      ].map(t => t.slice(1, -1).trim().toLowerCase())
       .filter(t => allTags.some(at => at.toLowerCase() === t));
      return Array.from(new Set(matches));
    };

    if (viewAllOrder) {
      return [...prompts].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    }

    if (selectedTag) {
      const targetTag = selectedTag.toLowerCase();
      return prompts
        .filter(p => getPromptTags(p).includes(targetTag))
        .sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    }

    const categories: { [key: string]: Prompt[] } = {};
    const uncategorized: Prompt[] = [];

    prompts.forEach(p => {
      const tags = getPromptTags(p);
      if (tags.length === 0) {
        uncategorized.push(p);
      } else {
        tags.forEach(tagLower => {
          const originalTag = allTags.find(t => t.toLowerCase() === tagLower) || tagLower;
          if (!categories[originalTag]) categories[originalTag] = [];
          categories[originalTag].push(p);
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

  const filteredPrompts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    if (search) {
      return prompts?.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      ).sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 50);
    }
    return null;
  }, [prompts, searchTerm]);

  const previewPrompts = useMemo(() => {
    return prompts ? [...prompts].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 11) : [];
  }, [prompts]);

  if (isAuthenticated === null) return null;
  
  if (showWelcome) return <WelcomeScreen userName={userName} />;

  if (showAuthOverlay && !isAuthenticated) {
    return (
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => { setShowAuthOverlay(false); setPendingPrompt(null); }}
          className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors border border-border"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <AuthView 
          onLogin={async (phone) => {
            const success = await handleLogin(phone);
            if (success) {
              setShowAuthOverlay(false);
              if (pendingPrompt) {
                setSelectedPrompt(pendingPrompt);
                setPendingPrompt(null);
              }
            }
            return success;
          }} 
          isVerifying={isVerifying} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col w-full antialiased relative overflow-hidden">
      {/* Sistema de Background Premium */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Camada 1: Gradientes de Iluminação Difusa com Animação */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-primary/10 rounded-full blur-[100px] animate-pulse duration-[8000ms] delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-blue-500/5 dark:bg-emerald-500/5 rounded-full blur-[100px] animate-pulse duration-[12000ms]" />
        
        {/* Camada 2: Textura de Ruído Fino (Grain) */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-noise mix-blend-overlay pointer-events-none" />
        
        {/* Camada 3: Grid Orgânico Sutil */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col w-full min-h-screen">
        <AppHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          isLoading={isLoading} 
          refetch={refetch} 
          onLogout={handleLogout} 
          isAuthenticated={isAuthenticated}
          onLogin={() => setShowAuthOverlay(true)}
        />

        <main className="container mx-auto px-4 md:px-8 py-6 md:py-10 flex-1 w-full max-w-full overflow-x-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 md:mb-12 flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-3"
        >
          <h2 className="text-2xl md:text-5xl font-bold tracking-tight leading-tight text-foreground dark:text-white">Prompts WMS</h2>
          <p className="text-muted-foreground max-w-2xl text-[11px] md:text-lg font-light leading-relaxed px-1 md:px-0 dark:text-white/70">
            Pegue o que for útil e use para colocar dinheiro no seu bolso, viralizar vídeos e fazer a mudança na sua própria história.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isLoading && !searchTerm && showCarousel && !selectedTag && !viewAllOrder && (
            <motion.div 
              key="carousel-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-8 md:mb-12 relative w-full"
            >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-[9px] md:text-sm font-bold uppercase tracking-widest text-muted-foreground">Recentes</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => scrollCarousel('left')} className="w-8 h-8 rounded-full border border-border md:flex hidden">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => scrollCarousel('right')} className="w-8 h-8 rounded-full border border-border md:flex hidden">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setViewAllOrder(true); setShowCarousel(false); }} className="text-[9px] md:text-xs font-bold hover:bg-secondary rounded-lg px-2 h-7 md:h-8">
                  <span>Ordem Numérica</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </Button>
              </div>
            </div>
            
            <div ref={scrollContainerRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none px-1">
              {previewPrompts.map((prompt) => (
                <div key={`preview-${prompt.id}`} className="group/item relative flex-none w-[110px] xs:w-[130px] md:w-36 aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-sm snap-start">
                  <img src={prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`} alt={prompt.title} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center md:opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Button 
                      onClick={() => handleViewPrompt(prompt)}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-md p-0 hover:bg-white/40 border border-white/20"
                    >
                      <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 md:p-2">
                    <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tighter line-clamp-1">
                      {prompt.title.match(/#\d+/)?.[0] || ""}
                    </span>
                  </div>
                </div>
              ))}
              <button onClick={() => { setViewAllOrder(true); setShowCarousel(false); }} className="flex-none w-[110px] xs:w-[130px] md:w-36 aspect-[3/4] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 md:gap-2 hover:bg-secondary/50 transition-colors snap-start">
                <Grid className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">Ordem Numérica</span>
              </button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && (
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground/40" />
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground/60">Filtros da Biblioteca</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center bg-secondary/30 rounded-lg p-1 border border-border mr-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setGridCols(4)}
                    className={`w-7 h-7 rounded-md transition-all ${gridCols === 4 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Grade de 4"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setGridCols(5)}
                    className={`w-7 h-7 rounded-md transition-all ${gridCols === 5 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Grade de 5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="5" height="7"></rect><rect x="9.5" y="3" width="5" height="7"></rect><rect x="17" y="3" width="5" height="7"></rect><rect x="2" y="14" width="5" height="7"></rect><rect x="9.5" y="14" width="5" height="7"></rect><rect x="17" y="14" width="5" height="7"></rect></svg>
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative group/filters overflow-hidden">
              <div className="flex overflow-x-auto gap-2 md:gap-2.5 pb-3 scrollbar-hide cursor-grab active:cursor-grabbing select-none px-1">
                <Button
                  variant={(!selectedTag && !viewAllOrder) ? "default" : "outline"}
                  onClick={() => { setSelectedTag(null); setViewAllOrder(false); setShowCarousel(true); }}
                  className={`rounded-xl px-4 h-9 md:h-10 text-[10px] md:text-xs font-extrabold uppercase tracking-wider flex-none transition-all border-2 ${(!selectedTag && !viewAllOrder) ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10" : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary dark:text-white/60"}`}
                >
                  <Grid className="w-3.5 h-3.5 mr-2" />
                  Início
                </Button>
                
                <Button
                  variant={viewAllOrder ? "default" : "outline"}
                  onClick={() => { setViewAllOrder(true); setSelectedTag(null); setShowCarousel(false); }}
                  className={`rounded-xl px-4 h-9 md:h-10 text-[10px] md:text-xs font-extrabold uppercase tracking-wider flex-none transition-all border-2 ${viewAllOrder ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10" : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary dark:text-white/60"}`}
                >
                  <span className="mr-2 font-black">#</span>
                  Ordem Numérica
                </Button>

                <div className="w-px h-10 bg-border/50 mx-1 flex-none" />

                {allTags.map(tag => {
                  const isSpecial = tag.toLowerCase() === "curso dentro";
                  const isSelected = selectedTag === tag;
                  const count = prompts?.filter(p => {
                    const matches = [
                      ...(p.title.match(/\[([^\]]+)\](?!\()/g) || []),
                      ...(p.description.match(/\[([^\]]+)\](?!\()/g) || [])
                    ].map(t => t.slice(1, -1).trim().toLowerCase());
                    return matches.includes(tag.toLowerCase());
                  }).length || 0;

                  return (
                    <Button
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => { setSelectedTag(isSelected ? null : tag); setViewAllOrder(false); setShowCarousel(false); }}
                      className={`rounded-xl px-4 h-9 md:h-10 text-[10px] md:text-xs font-extrabold uppercase tracking-wider flex-none transition-all border-2 ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10" 
                          : isSpecial 
                            ? "bg-[#FF007A]/5 text-[#FF007A] border-[#FF007A] hover:bg-[#FF007A]/10" 
                            : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary dark:text-white/60"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 mr-2" />}
                      {tag}
                      <span className={`ml-2 text-[8px] opacity-40 ${isSelected ? 'text-white/60' : ''}`}>({count})</span>
                    </Button>
                  );
                })}

                {(selectedTag || viewAllOrder) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => { setSelectedTag(null); setViewAllOrder(false); setShowCarousel(true); }}
                    className="text-[9px] md:text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 h-9 md:h-10 px-3 rounded-xl flex-none ml-2"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </Button>
                )}
              </div>
              
              <div className="absolute left-0 top-0 bottom-3 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover/filters:opacity-100 transition-opacity" />
              <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </div>
        )}
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-primary/10 rounded-full" />
              <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-sm font-medium text-gray-400 animate-pulse">Carregando biblioteca...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-bold">Erro ao carregar dados</h3>
            <p className="text-sm text-gray-500">Não foi possível conectar à base de dados.</p>
            <Button onClick={() => refetch()} variant="default" className="rounded-xl shadow-lg shadow-primary/20">Tentar Novamente</Button>
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
              <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-2.5 md:gap-6`}>
                {(filteredPrompts as Prompt[])?.map((prompt) => prompt ? (
                  <PromptCard 
                    key={`${prompt.id}-search`} 
                    prompt={prompt} 
                    onView={() => handleViewPrompt(prompt)}
                  />
                ) : null)}
              </div>
            ) : (selectedTag || viewAllOrder) ? (
              <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-2.5 md:gap-6`}>
                {(organizedPrompts as Prompt[])?.map((prompt) => prompt ? (
                  <PromptCard 
                    key={`${prompt.id}-list`} 
                    prompt={prompt} 
                    onView={() => handleViewPrompt(prompt)}
                  />
                ) : null)}
              </div>
            ) : (
              (organizedPrompts as { tag: string | null, prompts: Prompt[] }[]).map((group) => (
                <div key={group.tag || 'uncategorized'} className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.h3 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="text-sm md:text-xl font-bold uppercase tracking-widest text-foreground/80 dark:text-white/80"
                    >
                      {group.tag || "Sem Categoria"}
                    </motion.h3>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-2.5 md:gap-6`}>
                    {group.prompts.map((prompt) => prompt ? (
                      <PromptCard 
                        key={`${group.tag}-${prompt.id}`} 
                        prompt={prompt} 
                        onView={() => handleViewPrompt(prompt)}
                      />
                    ) : null)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <AppFooter />
    </div>

    {selectedPrompt && (
      <PromptDetailView 
        prompt={selectedPrompt} 
        onClose={() => setSelectedPrompt(null)} 
      />
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
        
        header { 
          position: fixed !important; 
          top: 0 !important; 
          left: 0 !important;
          right: 0 !important;
          z-index: 100 !important;
          width: 100%;
        }

        main {
          margin-top: 64px;
        }

        @media (min-width: 768px) {
          main {
            margin-top: 80px;
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
