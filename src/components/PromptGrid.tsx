import { motion } from "framer-motion";
import { PromptCard } from "./PromptCard";
import { Prompt } from "../hooks/usePrompts";

interface PromptGridProps {
  groups: { tag: string | null; prompts: Prompt[] }[];
  onView: (prompt: Prompt) => void;
  searchTerm?: string;
  filteredFlat?: Prompt[] | null;
  selectedTag?: string | null;
}

export function PromptGrid({ groups, onView, searchTerm, filteredFlat, selectedTag }: PromptGridProps) {
  const displayItems = searchTerm ? filteredFlat : (selectedTag ? groups[0]?.prompts : null);

  if (displayItems) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-6">
        {displayItems.map((prompt) => prompt ? (
          <PromptCard 
            key={`${prompt.id}-grid`} 
            prompt={prompt} 
            onView={() => onView(prompt)}
          />
        ) : null)}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.tag || 'uncategorized'} className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm md:text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white/80"
            >
              {group.tag || "Sem Categoria"}
            </motion.h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-6">
            {group.prompts.map((prompt) => prompt ? (
              <PromptCard 
                key={`${group.tag}-${prompt.id}`} 
                prompt={prompt} 
                onView={() => onView(prompt)}
              />
            ) : null)}
          </div>
        </div>
      ))}
    </div>
  );
}
