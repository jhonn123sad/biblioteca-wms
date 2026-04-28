import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Terminal, Lock, Sparkles, ArrowRight } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Acesso autorizado!");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Credenciais registradas!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-purple-600 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mx-auto mb-6 transform -rotate-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">AUTENTICAÇÃO</h1>
          <p className="text-gray-500 font-medium">Inicie sua sessão no terminal de comando.</p>
        </div>

        <div className="glass-morphism rounded-[2.5rem] border-white/5 p-8 md:p-10 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-6">
            <Sparkles className="w-5 h-5 text-purple-500/30" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Protocolo Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-black/50 border-white/5 h-14 rounded-2xl px-6 focus:ring-purple-500 transition-all text-white placeholder:text-gray-700"
                placeholder="nome@dominio.com"
                required 
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Chave de Acesso</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-black/50 border-white/5 h-14 rounded-2xl px-6 focus:ring-purple-500 transition-all text-white placeholder:text-gray-700"
                placeholder="••••••••"
                required 
              />
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button type="submit" className="h-16 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-purple-900/20" disabled={loading}>
                {loading ? "PROCESSANDO..." : "INICIAR SESSÃO"}
              </Button>
              <Button type="button" variant="ghost" className="h-14 hover:bg-white/5 rounded-2xl text-gray-400 font-bold" onClick={handleSignUp} disabled={loading}>
                REGISTRAR NOVA CHAVE
              </Button>
            </div>
          </form>
        </div>

        <Link to="/" className="mt-8 flex items-center justify-center gap-2 text-gray-600 hover:text-white transition-colors font-bold text-sm">
          <Terminal className="w-4 h-4" /> Voltar ao Terminal Público <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
