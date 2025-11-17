import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Em breve entraremos em contato com você.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contato" className="py-20 bg-primary">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Entre em <span className="text-secondary">Contato</span>
          </h2>
          <p className="text-xl text-primary-foreground/90">
            Agende uma consulta exclusiva e encontre o imóvel perfeito para você
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Seu Nome"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-primary-foreground text-primary border-none h-12 text-lg"
              />
            </div>
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Seu E-mail"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-primary-foreground text-primary border-none h-12 text-lg"
              />
            </div>
          </div>

          <div>
            <Input
              type="tel"
              name="phone"
              placeholder="Seu Telefone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-primary-foreground text-primary border-none h-12 text-lg"
            />
          </div>

          <div>
            <Textarea
              name="message"
              placeholder="Mensagem (descreva o tipo de imóvel que procura)"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="bg-primary-foreground text-primary border-none text-lg resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 text-lg shadow-luxury transition-smooth"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};
