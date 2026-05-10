import { Button } from "./ui/button";
import { Prompt } from "../hooks/usePrompts";
import { motion } from "framer-motion";

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
    return "bg-[#FF007A]/10 text-[#FF007A] border-[#FF007A] border-[2px] font-black uppercase";
  }
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = content.charCodeAt(i) + ((hash << 5) - hash);
  }
  return neonColors[Math.abs(hash) % neonColors.length];
};

interface PromptCardProps {
  prompt: Prompt;
  onView: () => void;
}

export function PromptCard({ prompt, onView }: PromptCardProps) {
  const title = prompt?.title || "Sem Título";
  const description = prompt?.description || "";
  const mainImage = (prompt?.images && prompt.images[0]) || `https://placehold.co/600x800?text=${encodeURIComponent(title)}`;
  
  // Extract number and tags from title
  const idMatch = title.match(/#\d+/);
  const tagRegex = /\[([^\]]+)\](?!\()/g;
  const rawTags = Array.from(title.matchAll(tagRegex)).map(match => match[1].trim());
  
  // Filter out the ID from tags if it appears in brackets like [#34]
  const tags = rawTags.filter(tag => !/^#?\d+$/.test(tag));
  
  // Clean title: remove #number and [tags]
  const cleanTitle = title
    .replace(/#\d+/, '')
    .replace(/\[([^\]]+)\](?!\()/g, '')
    .trim();

  // Clean description: remove [tags]
  const cleanDescription = description
    .replace(/\[([^\]]+)\](?!\()/g, '')
    .trim();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full w-full"
    >
      {/* 1. IMAGEM EM DESTAQUE */}
      <div className="aspect-[3/4] overflow-hidden relative bg-muted">
        <img 
          src={mainImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          decoding="async"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-1 min-w-0 gap-2 md:gap-3">
        {/* 2. TÍTULO DO BLOCO */}
        <h3 className="text-[14px] md:text-xl font-medium font-display leading-tight text-foreground">
          {cleanTitle}
        </h3>

        {/* 3. LINHA COM NUMERAÇÃO + TAG */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {idMatch && (
            <span className="text-[#FF007A] font-black text-[10px] md:text-xs">
              {idMatch[0]}
            </span>
          )}
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`${getTagColor(tag)} text-[7px] md:text-[9px] font-extrabold px-1.5 md:px-2 py-0.5 rounded-md uppercase tracking-wider select-none leading-none`}
            >
              {tag}
            </span>
          ))}
        </div>

        <Button 
          onClick={onView}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 md:h-11 text-[11px] md:text-sm font-bold transition-all shadow-lg shadow-black/5 active:scale-95 mt-1 dark:text-white"
        >
          Visualizar
        </Button>
      </div>
    </motion.div>
  );
}
