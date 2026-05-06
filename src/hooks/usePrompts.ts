import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * URL of the Google Apps Script that acts as our data API from the spreadsheet.
 */
const PROMPTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEyFpibtm2eSElodTKKMSVF2dK1S3vKtRAjCWmF86L18wQ6Kf8HShFNTHORegiHUgc/exec";

/**
 * Represents a Prompt (Book) data structure.
 */
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
}

/**
 * Converts Google Drive links to thumbnail/direct view URLs.
 * sz=w1000 ensures good resolution for cards.
 * @param url The raw Google Drive URL.
 * @returns A formatted URL for direct image display.
 */
const fixDriveLink = (url: string): string => {
  if (!url || typeof url !== 'string') return "";
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
  }
  return url.startsWith('http') ? url : "";
};

/**
 * Maps raw sheet data into the formatted Prompt structure.
 * Includes validation to ensure only prompts with content are included.
 * @param data Array of raw column data from the spreadsheet.
 * @returns Array of formatted Prompts.
 */
const formatSheetData = (data: any[]): Prompt[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map((cols, index) => {
    const getValue = (val: any) => {
      if (val === undefined || val === null || typeof val === 'object') return "";
      return val.toString().trim();
    };

    // Images are stored in columns 3 to 7
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
  }).filter(p => p.content);
};

/**
 * Extracts the sorting number from titles (e.g., "#34").
 * Returns Infinity for items without a number to place them at the end.
 */
export const getSortNumber = (title: string): number => {
  const match = title.match(/#(\d+)/);
  return match ? parseInt(match[1]) : Infinity;
};

/**
 * Validates if a string found between brackets [] is a valid category tag.
 * Filters out numeric tags, short strings, and common CTA phrases.
 */
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

/**
 * Custom hook to manage fetching, processing, and caching of prompts.
 * Uses React Query for state management and async operations.
 * Includes robust error handling and caching strategies.
 */
export function usePrompts() {
  const { data: prompts, isLoading, refetch, isError, error } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      try {
        const response = await fetch(PROMPTS_SCRIPT_URL, { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        if (!json || !json.data) {
          throw new Error("Invalid data format received from script");
        }
        return formatSheetData(json.data);
      } catch (err: any) {
        clearTimeout(timeoutId);
        const errorMessage = err.name === 'AbortError' ? 'Request timed out' : err.message;
        console.error("FETCH_PROMPTS_ERROR:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
  });

  /**
   * Extracts unique tags from prompts for categorization.
   * Handles special renaming logic (e.g., "Biblioteca WMS" -> "Livros").
   */
  const allTags = useMemo(() => {
    if (!prompts) return [];
    
    const tags = new Set<string>();
    const tagRegex = /\[([^\]]+)\](?!\()/g;
    
    prompts.forEach(p => {
      const titleTags = p.title.match(tagRegex) || [];
      const descTags = p.description.match(tagRegex) || [];
      [...titleTags, ...descTags].forEach(t => {
        const cleanTag = t.slice(1, -1).trim();
        if (isValidTag(cleanTag)) {
          tags.add(cleanTag);
        }
      });
    });

    const uniqueTags: string[] = [];
    const seenLower = new Set<string>();
    
    Array.from(tags).forEach(tag => {
      const lower = tag.toLowerCase();
      if (!seenLower.has(lower)) {
        seenLower.add(lower);
        uniqueTags.push(tag);
      }
    });

    // Rename specific tags based on user requirements
    const renamedTags = uniqueTags.map(tag => 
      tag.toLowerCase() === "biblioteca wms" ? "Livros" : tag
    );
    
    // Sort logic: "Método" comes first, then alphabetically
    return renamedTags.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const isMetodoA = aLower.includes('método') || aLower.includes('metodo');
      const isMetodoB = bLower.includes('método') || bLower.includes('metodo');
      
      if (isMetodoA && !isMetodoB) return -1;
      if (!isMetodoA && isMetodoB) return 1;
      return a.localeCompare(b);
    });
  }, [prompts]);

  return { 
    prompts, 
    allTags, 
    isLoading, 
    refetch, 
    isError,
    error: error as Error | null
  };
}
