import { useState, useEffect, useMemo, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  ChevronLeft,
  AlertCircle,
  ImageIcon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { usePrompts, Prompt } from "../hooks/usePrompts";
import { useAuth } from "../hooks/useAuth";
import { useFilteredPrompts } from "../hooks/useFilteredPrompts";
import { PromptDetailView } from "../components/PromptDetailView";
import { AuthView } from "../components/AuthView";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { AppHeader } from "../components/AppHeader";
import { AppFooter } from "../components/AppFooter";
import { BackgroundEffects } from "../components/BackgroundEffects";
import { HighlightCarousel } from "../components/HighlightCarousel";
import { FilterSystem } from "../components/FilterSystem";
import { PromptGrid } from "../components/PromptGrid";
import { ErrorBoundary } from "../components/ErrorBoundary";

type SortOption = 'recent' | 'az' | 'numeric' | 'popular';

function MainApp() {
  const auth = useAuth();
  const { isAuthenticated, isVerifying, userName, showWelcome, handleLogin, handleLogout } = auth;
  const promptsData = usePrompts();
  const { prompts, allTags, isLoading, refetch, isError } = promptsData;
  
  // Efeito para pre-carregar imagens e otimizar velocidade
  useEffect(() => {
    if (prompts && prompts.length > 0) {
      // Pre-carregar as primeiras 15 imagens com prioridade máxima
      const imagesToPreload = prompts.slice(0, 15);
      imagesToPreload.forEach(prompt => {
        if (prompt.images && prompt.images[0]) {
          const img = new Image();
          img.src = prompt.images[0];
        }
      });
      
      // Carregar o restante em background após um pequeno delay
      const timer = setTimeout(() => {
        prompts.slice(15, 40).forEach(prompt => {
          if (prompt.images && prompt.images[0]) {
            const img = new Image();
            img.src = prompt.images[0];
          }
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [prompts]);

  useEffect(() => {
    console.log("APP_STATE_DIAGNOSTIC:", { 
      authReady: isAuthenticated !== null, 
      promptsLoading: isLoading,
      hasPrompts: !!prompts,
      promptsCount: prompts?.length 
    });
  }, [isAuthenticated, isLoading, prompts]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<Prompt | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('numeric');

  useLayoutEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
    };
  }, []);

  const handleViewPrompt = (prompt: Prompt) => {
    if (!isAuthenticated) {
      setPendingPrompt(prompt);
      setShowAuthOverlay(true);
      return;
    }
    setSelectedPrompt(prompt);
  };

  const tagCounts = useMemo(() => {
    if (!prompts || prompts.length === 0 || !allTags || allTags.length === 0) return {};
    const counts: { [key: string]: number } = {};
    
    allTags.forEach(tag => {
      if (!tag) return;
      const tagLower = tag.toLowerCase();
      counts[tag] = prompts.filter(p => {
        if (!p || !p.title) return false;
        const titleTags = p.title.match(/\[([^\]]+)\](?!\()/g) || [];
        const descTags = (p.description || "").match(/\[([^\]]+)\](?!\()/g) || [];
        const matches = [...titleTags, ...descTags].map(t => t.slice(1, -1).trim().toLowerCase());
        return matches.includes(tagLower);
      }).length;
    });
    return counts;
  }, [prompts, allTags]);

  const { groups, filteredFlat } = useFilteredPrompts({
    prompts,
    searchTerm,
    selectedTag,
    sortBy,
    allTags
  });

  const previewPrompts = useMemo(() => {
    if (!prompts) return [];
    const getSortNumber = (title: string) => {
      if (!title) return Infinity;
      const match = title.match(/#(\d+)/);
      return match ? parseInt(match[1]) : Infinity;
    };
    return [...prompts].sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title)).slice(0, 11);
  }, [prompts]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Validando acesso...</p>
        </div>
      </div>
    );
  }
  
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
    <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground font-sans flex flex-col w-full antialiased relative overflow-hidden select-none">
      <BackgroundEffects />

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

        <main className="container mx-auto px-4 md:px-8 py-6 md:py-10 flex-1 w-full max-w-full overflow-x-hidden mt-16 md:mt-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 md:mb-12 flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-3"
          >
            <h2 className="text-2xl md:text-5xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white">BIBLIOTECA WMS</h2>
            <p className="text-slate-600 dark:text-white/70 max-w-2xl text-[11px] md:text-lg font-medium leading-relaxed px-1 md:px-0">
              Pegue o que for útil e use para colocar dinheiro no seu bolso, viralizar vídeos e fazer a mudança na sua própria história.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isLoading && !searchTerm && showCarousel && !selectedTag && (
              <motion.div 
                key="carousel-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HighlightCarousel prompts={previewPrompts} onView={handleViewPrompt} />
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && (
            <FilterSystem 
              allTags={allTags}
              tagCounts={tagCounts}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setShowCarousel={setShowCarousel}
            />
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
          ) : (searchTerm ? filteredFlat : groups)?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
              <ImageIcon className="w-10 h-10 mb-4" />
              <h3 className="text-lg font-medium">Nenhum resultado</h3>
              <p className="text-sm">Tente outros termos ou limpe o filtro.</p>
            </div>
          ) : (
            <PromptGrid 
              groups={groups} 
              onView={handleViewPrompt} 
              searchTerm={searchTerm} 
              filteredFlat={filteredFlat} 
              selectedTag={selectedTag} 
            />
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
      `}} />
      <MainApp />
    </ErrorBoundary>
  );
}
