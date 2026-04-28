import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form state
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
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (data?.role === 'admin') setIsAdmin(true);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Máximo de 5 imagens permitido.");
        return;
      }
      setImages([...images, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error("Apenas administradores podem postar.");
    setSubmitting(true);

    try {
      // 1. Create prompt
      const { data: prompt, error: promptError } = await supabase
        .from("prompts")
        .insert({ title, description, content })
        .select()
        .single();
      
      if (promptError) throw promptError;

      // 2. Upload images
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

      toast.success("Prompt criado com sucesso!");
      setTitle("");
      setDescription("");
      setContent("");
      setImages([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const becomeAdmin = async () => {
    if (!session) return;
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email,
      role: 'admin'
    });
    if (error) toast.error(error.message);
    else {
      setIsAdmin(true);
      toast.success("Agora você é um administrador!");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if (!session) return <div className="p-12 text-center">
    <p className="mb-4">Você precisa estar logado para acessar o painel.</p>
    <Button onClick={() => navigate("/auth")}>Ir para Login</Button>
  </div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        <h1 className="text-2xl font-bold">Painel ADM</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
      </div>

      {!isAdmin && (
        <Card className="mb-8 border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="mb-4 text-yellow-800 font-medium">Você não tem permissão de administrador ainda.</p>
            <Button onClick={becomeAdmin}>Tornar-me Admin (Debug)</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Novo Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Breve Descrição</Label>
              <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Prompt</Label>
              <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} className="min-h-[200px]" required />
            </div>
            <div className="space-y-2">
              <Label>Imagens (Máx 5)</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((file, i) => (
                  <div key={i} className="relative group aspect-square border rounded-md overflow-hidden">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors aspect-square">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting || !isAdmin}>
              {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
              Salvar Prompt
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
