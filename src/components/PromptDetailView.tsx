import { useState, useEffect } from "react";
import { X, Search, BookOpen, Terminal, Copy, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Prompt } from "../hooks/usePrompts";
import { renderWithTags, linkify } from "../lib/render-utils";

interface PromptDetailViewProps {
  prompt: Prompt;
  onClose: () => void;
}

export function PromptDetailView({ prompt, onClose }: PromptDetailViewProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const copyToClipboard = () => {
    if (!prompt.content) return;
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copiado!");
    
    // Tracking de visualizações/popularidade simulado
    const views = parseInt(localStorage.getItem(`views_${prompt.id}`) || "0");
    localStorage.setItem(`views_${prompt.id}`, (views + 1).toString());
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.style.position = 'relative';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col antialiased animate-in fade-in duration-200 select-none">
      <div className="flex items-center justify-between px-4 h-16 border-b border-border bg-background flex-shrink-0 z-10">
        <div className="flex-1 min-w-0 pr-4">
          <div className="text-xs md:text-lg font-black tracking-tight break-words leading-tight flex flex-wrap gap-1 items-center text-foreground">
            {renderWithTags(prompt.title)}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:scale-105"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-6xl h-full">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 p-4 md:p-8 bg-secondary/30 md:overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-border">
              <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {prompt.images.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setExpandedImage(img)}
                      className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm bg-card cursor-zoom-in group/img relative"
                    >
                      <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" loading="eager" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Search className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  ))}
                  {prompt.images.length === 0 && (
                    <div className="col-span-2 aspect-video bg-secondary/50 rounded-2xl flex items-center justify-center text-muted-foreground border border-dashed border-border">
                      <ImageIcon className="w-10 h-10 opacity-10" />
                    </div>
                  )}
                </div>

                <div className="bg-card p-5 md:p-8 rounded-[2rem] border border-border shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold border-b border-border pb-3">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Detalhes do Prompt</span>
                  </div>
                  <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-bold">
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
              </div>
            </div>

            <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col bg-background">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Conteúdo para Copiar</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="h-8 text-[11px] font-bold bg-primary text-primary-foreground rounded-xl px-4 shadow-lg hover:bg-primary/80 transition-all active:scale-95"
                  >
                    COPIAR
                  </button>
                </div>

                <div className="relative group flex-1 bg-secondary/20 rounded-[2rem] border border-border overflow-hidden min-h-[200px] md:min-h-0 mb-6">
                  <div className="h-full p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <pre className="text-[13px] md:text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground break-words">{linkify(prompt.content)}</pre>
                  </div>
                </div>

                <button 
                  onClick={copyToClipboard} 
                  className="w-full bg-primary text-primary-foreground rounded-2xl h-16 text-sm font-bold shadow-2xl shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-auto"
                >
                  <Copy className="w-5 h-5" />
                  COPIAR PROMPT PARA USAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              style={{ transform: `scale(${zoomScale})` }}
            />
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[210]">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <button onClick={() => setZoomScale(s => Math.max(s - 0.5, 1))} className="text-white font-bold p-2">-</button>
              <span className="text-white text-[10px] font-mono w-8 text-center">{Math.round(zoomScale * 100)}%</span>
              <button onClick={() => setZoomScale(s => Math.min(s + 0.5, 5))} className="text-white font-bold p-2">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
