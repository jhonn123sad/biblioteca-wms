import { Button } from "./ui/button";
import { Prompt } from "../hooks/usePrompts";
import { renderWithTags } from "../lib/render-utils";

interface PromptCardProps {
  prompt: Prompt;
  onView: () => void;
}

export function PromptCard({ prompt, onView }: PromptCardProps) {
  const mainImage = prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`;
  
  return (
    <div className="group bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full w-full">
      <div className="aspect-[3/4] overflow-hidden relative bg-muted">
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
        <h3 className="text-[12px] md:text-base font-bold leading-tight mb-2 md:mb-3 min-h-[2.5em] text-foreground">
          {renderWithTags(prompt.title)}
        </h3>
        <div className="text-muted-foreground text-[10px] md:text-xs font-light mb-4 line-clamp-3 leading-relaxed flex-1 overflow-hidden">
          {prompt.description.replace(/\[([^\]]+)\](?!\()/g, '')}
        </div>
        <Button 
          onClick={onView}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 md:h-11 text-[11px] md:text-sm font-bold transition-all shadow-lg shadow-black/5 active:scale-95"
        >
          Visualizar
        </Button>
      </div>
    </div>
  );
}
