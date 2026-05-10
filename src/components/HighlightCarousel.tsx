import { useRef } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Prompt } from "../hooks/usePrompts";

interface HighlightCarouselProps {
  prompts: Prompt[];
  onView: (prompt: Prompt) => void;
}

export function HighlightCarousel({ prompts, onView }: HighlightCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-8 md:mb-12 relative w-full">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-[9px] md:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-muted-foreground">Destaques</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-border md:flex hidden">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-border md:flex hidden">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div ref={scrollContainerRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none px-1">
        {prompts.map((prompt) => (
          <div key={`preview-${prompt.id}`} className="group/item relative flex-none w-[110px] xs:w-[130px] md:w-36 aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-sm snap-start">
            <img 
              src={prompt.images[0] || `https://placehold.co/600x800?text=${encodeURIComponent(prompt.title)}`} 
              alt={prompt.title} 
              className="w-full h-full object-cover transition-transform group-hover/item:scale-110" 
              loading="eager" 
              // @ts-ignore
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center md:opacity-0 group-hover/item:opacity-100 transition-opacity">
              <Button 
                onClick={() => onView(prompt)}
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
      </div>
    </div>
  );
}
