import { useMemo } from "react";
import { Prompt } from "./usePrompts";

type SortOption = 'recent' | 'az' | 'numeric' | 'popular';

export interface UseFilteredPromptsProps {
  prompts: Prompt[] | undefined;
  searchTerm: string;
  selectedTag: string | null;
  sortBy: SortOption;
  allTags: string[];
}

export function useFilteredPrompts({ prompts, searchTerm, selectedTag, sortBy, allTags }: UseFilteredPromptsProps) {
  return useMemo(() => {
    if (!prompts || !allTags) return { groups: [], filteredFlat: [] };

    const getPromptTags = (p: Prompt) => {
      const tagRegex = /\[([^\]]+)\](?!\()/g;
      const matches = [
        ...(p.title.match(tagRegex) || []),
        ...(p.description.match(tagRegex) || [])
      ].map(t => t.slice(1, -1).trim().toLowerCase())
       .filter(t => allTags.some(at => at.toLowerCase() === t));
      return Array.from(new Set(matches));
    };

    let basePrompts = [...prompts];

    // Sorting
    if (sortBy === 'az') {
      basePrompts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'numeric') {
      const getSortNumber = (title: string) => {
        const match = title.match(/#(\d+)/);
        return match ? parseInt(match[1]) : Infinity;
      };
      basePrompts.sort((a, b) => getSortNumber(a.title) - getSortNumber(b.title));
    } else if (sortBy === 'popular') {
      basePrompts.sort((a, b) => {
        const viewsA = parseInt(localStorage.getItem(`views_${a.id}`) || "0");
        const viewsB = parseInt(localStorage.getItem(`views_${b.id}`) || "0");
        if (viewsB !== viewsA) return viewsB - viewsA;
        return parseInt(b.id) - parseInt(a.id);
      });
    } else {
      basePrompts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const filtered = basePrompts.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
      return { groups: [], filteredFlat: filtered };
    }

    // Tag filtering / Grouping
    if (selectedTag) {
      const targetTag = selectedTag.toLowerCase();
      const filtered = basePrompts.filter(p => getPromptTags(p).includes(targetTag));
      return { groups: [{ tag: selectedTag, prompts: filtered }], filteredFlat: [] };
    }

    const categories: { [key: string]: Prompt[] } = {};
    const uncategorized: Prompt[] = [];

    basePrompts.forEach(p => {
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

    const groups = allTags
      .filter(tag => categories[tag])
      .map(tag => ({ tag, prompts: categories[tag] }));
    
    if (uncategorized.length > 0) {
      groups.push({ tag: null, prompts: uncategorized });
    }

    return { groups, filteredFlat: [] };
  }, [prompts, searchTerm, selectedTag, sortBy, allTags]);
}
