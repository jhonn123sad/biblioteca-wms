import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";

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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img 
          src={primaryImage} 
          alt={prompt.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{prompt.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>
      </CardContent>
      <CardFooter>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Abrir Prompt</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{prompt.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {prompt.images.map((img, i) => (
                  <img key={i} src={img.url} alt={`Gallery ${i}`} className="rounded-md object-cover aspect-square w-full" />
                ))}
              </div>
              <div className="bg-muted p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{prompt.content}</pre>
              </div>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(prompt.content);
                }}
                className="w-full"
              >
                Copiar Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
