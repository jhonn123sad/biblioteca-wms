import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, Dice5, Coffee, Moon, Sun, Cloud, Heart } from "lucide-react";

const IDEAS = [
  { icon: <Coffee className="w-8 h-8 text-amber-500" />, text: "Beber mais água hoje" },
  { icon: <Moon className="w-8 h-8 text-blue-500" />, text: "Dormir 8 horas seguidas" },
  { icon: <Sun className="w-8 h-8 text-yellow-500" />, text: "Tomar 15 minutos de sol" },
  { icon: <Cloud className="w-8 h-8 text-gray-400" />, text: "Meditar por 5 minutos" },
  { icon: <Heart className="w-8 h-8 text-red-500" />, text: "Ligar para alguém querido" },
  { icon: <Sparkles className="w-8 h-8 text-purple-500" />, text: "Aprender algo novo agora" },
];

export default function Index() {
  const [idea, setIdea] = useState(IDEAS[0]);
  const [count, setCount] = useState(0);

  const shuffle = () => {
    const randomIndex = Math.floor(Math.random() * IDEAS.length);
    setIdea(IDEAS[randomIndex]);
    setCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">GERADOR ALEATÓRIO</h1>
          <p className="text-slate-500 font-medium">Se você está vendo isso, a publicação funcionou!</p>
        </header>

        <Card className="border-2 border-slate-100 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-6">
            <CardTitle className="text-sm uppercase tracking-widest text-slate-400 font-bold">Sugestão do Momento</CardTitle>
          </CardHeader>
          <CardContent className="p-12 space-y-6">
            <div className="flex justify-center transform transition-transform hover:scale-110 duration-300">
              {idea.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{idea.text}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={shuffle}
            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex gap-3"
          >
            <Dice5 className="w-6 h-6" /> GERAR NOVA IDEIA
          </Button>
          
          <div className="pt-4 flex flex-col items-center gap-2">
            <span className="bg-slate-100 px-4 py-1 rounded-full text-xs font-bold text-slate-500">
              CLIQUE NO BOTÃO ACIMA
            </span>
            <p className="text-slate-400 text-xs">Ideias geradas: {count}</p>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-8 text-slate-300 text-xs font-medium">
        PROJETO DE TESTE DE PUBLICAÇÃO • 2024
      </footer>
    </div>
  );
}
