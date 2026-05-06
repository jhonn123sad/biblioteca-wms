import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * URL do Google Apps Script que serve como nossa API de dados vinda da planilha.
 */
const PROMPTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEyFpibtm2eSElodTKKMSVF2dK1S3vKtRAjCWmF86L18wQ6Kf8HShFNTHORegiHUgc/exec";

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
}

/**
 * Converte links do Google Drive para URLs de miniatura/direto para visualização.
 */
const fixDriveLink = (url: string) => {
  if (!url || typeof url !== 'string') return "";
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    // sz=w1000 garante uma boa resolução para os cards
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
  }
  return url.startsWith('http') ? url : "";
};

/**
 * Mapeia os dados brutos recebidos da planilha para o formato esperado pela aplicação.
 */
const formatSheetData = (data: any[]): Prompt[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map((cols, index) => {
    const getValue = (val: any) => {
      if (val === undefined || val === null || typeof val === 'object') return "";
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
  }).filter(p => p.content); // Apenas itens com conteúdo real (prompt)
};

/**
 * Extrai o número do identificador (ex: #34) para ordenação correta.
 */
export const getSortNumber = (title: string) => {
  const match = title.match(/#(\d+)/);
  return match ? parseInt(match[1]) : Infinity;
};

/**
 * Valida se uma string encontrada entre colchetes [] é uma tag válida de categoria.
 */
export const isValidTag = (tag: string) => {
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
 * Hook customizado para gerenciar a busca, processamento e cache dos prompts.
 * Utiliza React Query para gerenciamento de estado assíncrono.
 */
export function usePrompts() {
  const { data: prompts, isLoading, refetch, isError } = useQuery({
    queryKey: ["prompts-sheets"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // Timeout de 20s
      
      try {
        const response = await fetch(PROMPTS_SCRIPT_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Servidor respondeu com erro: ${response.status}`);
        }
        
        const json = await response.json();
        return formatSheetData(json.data || []);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("ERRO_FETCH_PROMPTS:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // Dados considerados frescos por 10 minutos
    gcTime: 1000 * 60 * 30,    // Mantém no cache por 30 minutos
  });

  /**
   * Extrai todas as tags únicas presentes nos títulos e descrições dos prompts.
   */
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
