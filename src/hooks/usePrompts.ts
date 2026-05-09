import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

const PROMPTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEyFpibtm2eSElodTKKMSVF2dK1S3vKtRAjCWmF86L18wQ6Kf8HShFNTHORegiHUgc/exec";

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
}

/**
 * Converts Google Drive links to thumbnail/direct view URLs.
 * Optimized for better resolution and faster delivery.
 */
const fixDriveLink = (url: string): string => {
  if (!url || typeof url !== 'string') return "";
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    // sz=w800 is a good balance for quality/performance
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w800`;
  }
  return url.startsWith('http') ? url : "";
};

const formatSheetData = (data: any[]): Prompt[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map((cols, index) => {
    const getValue = (val: any) => {
      if (val === undefined || val === null) return "";
      if (typeof val === 'object') return JSON.stringify(val);
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
      description: (getValue(cols[1]) || "").replace(/https?:\/\/(www\.)?youtube\.com\/[^\s\n]+/g, "").trim(),
      content: getValue(cols[2]) || "",
      images
    };
  }).filter(p => p && p.content && p.title && p.title !== "Sem Título");
};

export const getSortNumber = (title: string): number => {
  const match = title.match(/#(\d+)/);
  return match ? parseInt(match[1]) : Infinity;
};

export const isValidTag = (tag: string): boolean => {
  if (!tag) return false;
  const clean = tag.trim();
  return (
    clean.length > 2 && 
    !/^\d+$/.test(clean) && 
    !/^#?\d+$/.test(clean) && 
    !clean.includes('.') && 
    !clean.includes('/') && 
    !/^[0-9\s!@#$%^&*(),.?":{}|<>]+$/.test(clean) && 
    !['clique aqui', 'leia mais', 'veja mais', 'saiba mais'].includes(clean.toLowerCase())
  );
};

export function usePrompts() {
  const { data: prompts, isLoading, refetch, isError, error } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      try {
        const response = await fetch(PROMPTS_SCRIPT_URL, { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const json = await response.json();
        console.log("FETCH_RESPONSE_JSON:", json ? "Success (data keys: " + Object.keys(json) + ")" : "Null/Undefined");
        
        if (!json || !json.data) throw new Error("Invalid data format");
        
        return formatSheetData(json.data);
      } catch (err: any) {
        clearTimeout(timeoutId);
        const errorMessage = err.name === 'AbortError' ? 'Timeout: A planilha demorou muito para responder.' : err.message;
        console.error("FETCH_PROMPTS_ERROR:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allTags = useMemo(() => {
    if (!prompts) return [];
    
    const tags = new Set<string>();
    const tagRegex = /\[([^\]]+)\](?!\()/g;
    
    prompts.forEach(p => {
      const titleTags = p.title.match(tagRegex) || [];
      const descTags = p.description.match(tagRegex) || [];
      [...titleTags, ...descTags].forEach(t => {
        const cleanTag = t.slice(1, -1).trim();
        if (isValidTag(cleanTag)) tags.add(cleanTag);
      });
    });

    const uniqueTags = Array.from(tags).map(tag => 
      tag.toLowerCase() === "biblioteca wms" ? "Livros" : tag
    );
    
    return uniqueTags.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const isMetodoA = aLower.includes('método') || aLower.includes('metodo');
      const isMetodoB = bLower.includes('método') || bLower.includes('metodo');
      if (isMetodoA && !isMetodoB) return -1;
      if (!isMetodoA && isMetodoB) return 1;
      return a.localeCompare(b);
    });
  }, [prompts]);

  return { prompts, allTags, isLoading, refetch, isError, error: error as Error | null };
}
