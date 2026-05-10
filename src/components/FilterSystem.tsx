import { useState } from "react";
import { Filter, Grid, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface FilterSystemProps {
  allTags: string[];
  tagCounts: { [key: string]: number };
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  sortBy: string;
  setSortBy: (sort: any) => void;
  setShowCarousel: (show: boolean) => void;
}

export function FilterSystem({ 
  allTags, 
  tagCounts, 
  selectedTag, 
  setSelectedTag, 
  sortBy, 
  setSortBy, 
  setShowCarousel 
}: FilterSystemProps) {
  const INITIAL_VISIBLE_COUNT = 8;
  const visibleTags = isExpanded 
    ? allTags 
    : allTags.filter((tag, index) => index < INITIAL_VISIBLE_COUNT || tag === selectedTag);
  
  const hiddenTagsCount = allTags.length - visibleTags.length;
  const hasMoreTags = hiddenTagsCount > 0;

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-muted-foreground/40" />
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground/60">Filtros da Biblioteca</h3>
        </div>
      </div>

      <div className="relative">
        <div 
          className="flex flex-wrap gap-2 md:gap-2.5 pb-2 select-none md:px-1"
        >
          <Button
            variant="ghost"
            onClick={() => { setSelectedTag(null); setShowCarousel(true); }}
            className={`rounded-xl px-4 h-9 md:h-10 text-[10px] md:text-xs font-extrabold uppercase tracking-wider flex-none transition-all duration-300 border backdrop-blur-xl shadow-lg hover:-translate-y-[1px] ${
              (!selectedTag) 
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-white/20 shadow-green-500/20" 
                : "bg-white/50 dark:bg-black/40 border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white/70 hover:bg-white/70 dark:hover:bg-black/60 hover:border-green-500/30"
            }`}
          >
            <Grid className="w-3.5 h-3.5 mr-2" />
            Início
          </Button>
          
          {visibleTags.map(tag => {
            const isSpecial = tag.toLowerCase() === "curso dentro";
            const isSelected = selectedTag === tag;
            const count = tagCounts[tag] || 0;

            return (
              <Button
                key={tag}
                variant="ghost"
                onClick={() => { setSelectedTag(isSelected ? null : tag); setShowCarousel(false); }}
                className={`rounded-xl px-4 h-9 md:h-10 text-[10px] md:text-xs font-extrabold uppercase tracking-wider transition-all duration-300 border backdrop-blur-xl shadow-lg hover:-translate-y-[1px] ${
                  isSelected 
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-white/20 shadow-green-500/20" 
                    : isSpecial 
                      ? "bg-[#FF007A]/10 text-[#FF007A] border-[#FF007A]/30 hover:bg-[#FF007A]/20" 
                      : "bg-white/50 dark:bg-black/40 border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white/70 hover:bg-white/70 dark:hover:bg-black/60 hover:border-green-500/30"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 mr-2" />}
                {tag === "Biblioteca WMS" ? "Prompts" : tag}
                <span className={`ml-2 text-[8px] opacity-40 ${isSelected ? 'text-white/60' : ''}`}>({count})</span>
              </Button>
            );
          })}

          {hasMoreTags && (
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-xl px-4 h-9 md:h-10 text-[10px] md:text-xs font-extrabold uppercase tracking-wider transition-all duration-300 border backdrop-blur-xl bg-white/30 dark:bg-black/20 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-black/40"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-2" />
                  Ver Menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-2" />
                  Ver Mais (+{allTags.length - INITIAL_VISIBLE_COUNT})
                </>
              )}
            </Button>
          )}

          {(selectedTag || sortBy !== 'recent') && (
            <Button 
              variant="ghost" 
              onClick={() => { setSelectedTag(null); setSortBy('recent'); setShowCarousel(true); }}
              className="text-[9px] md:text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 h-9 md:h-10 px-3 rounded-xl transition-all duration-300"
            >
              <X className="w-3 h-3" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
