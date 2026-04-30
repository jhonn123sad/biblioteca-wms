import { ReactNode } from "react";

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
    return "bg-[#FF007A]/10 text-[#FF007A] border-[#FF007A] border-[3px] shadow-[0_0_15px_rgba(255,0,122,0.3)] font-black uppercase";
  }
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = content.charCodeAt(i) + ((hash << 5) - hash);
  }
  return neonColors[Math.abs(hash) % neonColors.length];
};

export const renderWithTags = (text: string): ReactNode => {
  if (!text) return null;
  // Regex atualizada para ignorar links markdown [texto](url)
  // Ela procura por [algo] que NÃO seja seguido por (
  const parts = text.split(/(\[[^\]]+\](?!\()|!\[[^\]]+\](?!\()|#\d+)/g);
  
  return parts.map((part, index) => {
    // Se for uma tag [Conteúdo]
    if (part.startsWith('[') && part.endsWith(']') && !text.includes(part + '(')) {
      const tagContent = part.slice(1, -1).trim();
      
      // Se a tag for "esquisita" (números ou links), renderizamos como texto normal
      if (!/^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s-]+$/.test(tagContent) && tagContent.length < 15) {
         // Se for algo como #34 dentro de [], mostramos como ID ou texto
         if (/^#?\d+$/.test(tagContent)) {
             return <span key={index} className="text-[#FF007A] font-black mr-1">#{tagContent.replace('#', '')}</span>;
         }
      }

      const colorClass = getTagColor(tagContent);
      return (
        <span 
          key={index} 
          className={`${colorClass} text-[8px] md:text-[10px] font-extrabold px-1.5 md:px-2.5 py-0.5 rounded-md border shadow-sm uppercase tracking-wider inline-flex items-center align-middle mx-0.5 leading-none transition-all hover:scale-110 select-none`}
        >
          {tagContent}
        </span>
      );
    }
    // Se for um ID numérico como #123
    if (part.startsWith('#') && /^\d+$/.test(part.slice(1))) {
      return (
        <span key={index} className="text-[#FF007A] font-black mr-1">
          {part}
        </span>
      );
    }
    return part;
  });
};

export const linkify = (text: string): ReactNode => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#FF007A] hover:underline break-all font-bold"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};
