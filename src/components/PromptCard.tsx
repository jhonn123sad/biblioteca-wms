import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Copy, Maximize2, Layers } from "lucide-react";

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    description: string;
    content: string;
    images: { url: string; is_primary: boolean }[];
  };
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const primaryImage = prompt.images.find(img => img.is_primary)?.url || prompt.images[0]?.url || "https://placehold.co/600x400?text=No+Image";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-secondary/30 transition-all hover:bg-secondary/50 border border-white/5 hover:border-purple-500/30">
      <div className="aspect-[4/5] overflow-hidden">
        <img 
          src={primaryImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">{prompt.images.length} Imagens</span>
        </div>
        <h3 className="text-xl font-bold mb-1 leading-tight">{prompt.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-1 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{prompt.description}</p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 text-white rounded-xl">
              Explorar Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-zinc-950 border-white/5 text-white p-0 overflow-hidden sm:rounded-3xl">
            <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
              <div className="overflow-y-auto p-4 space-y-4 bg-zinc-900/50">
                <div className="grid grid-cols-2 gap-3">
                  {prompt.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group/img">
                      <img src={img.url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-between overflow-y-auto border-l border-white/5">
                <div>
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl font-bold">{prompt.title}</DialogTitle>
                    <p className="text-gray-400 mt-2">{prompt.description}</p>
                  </DialogHeader>
                  
                  <div className="relative group/code">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover/code:opacity-40 transition" />
                    <div className="relative bg-black/50 p-6 rounded-xl border border-white/10">
                      <pre className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{prompt.content}</pre>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-500 rounded-xl h-12"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(prompt.content);
                        toast.success("Copiado com sucesso!");
                      } catch (err) {
                        toast.error("Erro ao copiar.");
                      }
                    }}
                  >
                    <Copy className="mr-2 w-4 h-4" /> Copiar Prompt
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
