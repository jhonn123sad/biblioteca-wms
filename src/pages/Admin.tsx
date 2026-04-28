import { useState, useEffect, useRef } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles, Send } from "lucide-react";

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdmin(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.role === 'admin') setIsAdmin(true);
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Erro ao verificar admin");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Máximo de 5 imagens.");
        return;
      }
      setImages([...images, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error("Apenas administradores.");
    setSubmitting(true);

    try {
      const { data: prompt, error: promptError } = await supabase
        .from("prompts")
        .insert({ title, description, content })
        .select()
        .single();
      
      if (promptError) throw promptError;

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${prompt.id}/${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("prompt-assets")
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("prompt-assets")
          .getPublicUrl(fileName);

        await supabase.from("prompt_images").insert({
          prompt_id: prompt.id,
          url: publicUrl,
          is_primary: i === 0,
          display_order: i
        });
      }

      toast.success("Prompt publicado no cofre!");
      setTitle("");
      setDescription("");
      setContent("");
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const becomeAdmin = async () => {
    if (!session) return;
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        email: session.user.email,
        role: 'admin'
      });
      if (error) throw error;
      setIsAdmin(true);
      toast.success("Acesso admin concedido!");
    } catch (err: any) {
      toast.error("Erro ao obter acesso");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="glass-morphism p-12 rounded-[2.5rem] text-center max-w-md w-full border-white/5 shadow-2xl">
        <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Acesso Restrito</h2>
        <p className="text-gray-400 mb-8 font-medium">Você precisa de credenciais válidas para gerenciar o cofre.</p>
        <Button onClick={() => navigate("/auth")} className="w-full h-14 bg-white text-black rounded-2xl font-black text-lg hover:bg-white/90">
          Identificar-se
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">ESTAÇÃO DE COMANDO</h1>
              <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Status: Operacional
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()} className="border-white/5 bg-white/5 rounded-2xl px-8 h-12 font-bold hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all">
            Encerrar Sessão
          </Button>
        </header>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="glass-morphism rounded-[2.5rem] p-8 md:p-12 border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] -mr-32 -mt-32" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Codinome do Prompt</Label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Ex: Cyberpunk Portrait v4"
                    className="bg-black/50 border-white/5 h-16 rounded-2xl px-6 text-lg focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-gray-700" 
                    required 
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Descrição do Módulo</Label>
                  <Input 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Uma breve nota sobre a saída esperada..."
                    className="bg-black/50 border-white/5 h-16 rounded-2xl px-6 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-gray-700" 
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Script de Comando (Prompt)</Label>
                  <Textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    placeholder="/imagine prompt: ..."
                    className="bg-black/50 border-white/5 min-h-[250px] rounded-2xl p-6 text-lg font-mono focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-gray-700 resize-none" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Documentação Visual (Máx 5)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((file, i) => (
                    <div key={i} className="relative group aspect-square border-white/5 rounded-2xl overflow-hidden bg-white/5 border transition-all hover:border-purple-500/50">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                      <button 
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-purple-500/30 transition-all aspect-square group">
                      <ImageIcon className="h-8 w-8 text-gray-600 group-hover:text-purple-400 transition-colors mb-2" />
                      <span className="text-[10px] font-black uppercase text-gray-600 group-hover:text-purple-400">Add Foto</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full h-20 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50" disabled={submitting || !isAdmin}>
                {submitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin w-6 h-6" /> PROCESSANDO...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Send className="w-6 h-6" /> PUBLICAR NO COFRE
                  </div>
                )}
              </Button>
            </form>
          </div>

          <aside className="space-y-8">
            {!isAdmin && (
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/20 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-yellow-400 font-black text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> ACESSO RESTRITO
                </h3>
                <p className="text-yellow-400/80 text-sm font-medium mb-6 leading-relaxed">Sua autoridade ainda não foi elevada ao nível de Administrador do Cofre.</p>
                <Button onClick={becomeAdmin} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl h-12">
                  ELEVATOR AUTORIDADE
                </Button>
              </div>
            )}

            <div className="glass-morphism rounded-3xl p-8 border-white/5">
              <h3 className="text-white font-black mb-4 uppercase tracking-tighter text-sm">Diretrizes de Segurança</h3>
              <ul className="space-y-4">
                {[
                  "Máximo de 5 imagens por registro.",
                  "Scripts devem ser revisados antes do envio.",
                  "A remoção de registros é irreversível.",
                  "Evite vazamento de chaves API nos prompts."
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-xs text-gray-500 font-medium leading-relaxed">
                    <span className="text-purple-500 font-black">0{i+1}.</span> {text}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
