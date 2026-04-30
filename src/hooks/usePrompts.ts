import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const PROMPTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEyFpibtm2eSElodTKKMSVF2dK1S3vKtRAjCWmF86L18wQ6Kf8HShFNTHORegiHUgc/exec";

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
}

const fixDriveLink = (url: string) => {
  if (!url || typeof url !== 'string') return "";
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
  }
  return url.startsWith('http') ? url : "";
};

const formatSheetData = (data: any[]): Prompt[] => {
  return data.map((cols, index) => {
    const getValue = (val: any) => {
      if (!val || typeof val === 'object') return "";
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
      description: getValue(cols[1]) || "",
      content: getValue(cols[2]) || "",
      images
    };
  }).filter(p => p.content);
};

export const getSortNumber = (title: string) => {
  const match = title.match(/#(\d+)/);
  return match ? parseInt(match[1]) : Infinity;
};

// Melhora na lógica de detecção de tags para evitar "tags esquisitas"
export const isValidTag = (tag: string) => {
  if (!tag) return false;
  const clean = tag.trim();
  
  // Lista de filtros para o que NÃO deve ser uma categoria
  return (
    clean.length > 2 && // Tags muito curtas geralmente são ruído
    !/^\d+$/.test(clean) && // Não pode ser apenas números
    !/^#?\d+$/.test(clean) && // Não pode ser #34 ou similar
    !clean.includes('.') && // Geralmente links ou extensões
    !clean.includes('/') && // Caminhos de arquivos
    !/^[0-9\s!@#$%^&*(),.?":{}|<>]+$/.test(clean) && // Não pode ser apenas símbolos
    !['clique aqui', 'leia mais', 'veja mais', 'saiba mais'].includes(clean.toLowerCase()) // Texto de botões comuns
  );
};

export function usePrompts() {
  const { data: prompts, isLoading, refetch, isError } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      try {
        const response = await fetch(PROMPTS_SCRIPT_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Falha na resposta do servidor.");
        const json = await response.json();
        return formatSheetData(json.data || []);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("Fetch prompts error:", err);
        throw err;
      }
    },
    retry: 2,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    const tagRegex = /\[([^\]]+)\](?!\()/g;
    
    prompts?.forEach(p => {
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
    return uniqueTags.sort((a, b) => a.localeCompare(b));
  }, [prompts]);

  return { prompts, allTags, isLoading, refetch, isError };
}
