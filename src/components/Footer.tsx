import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-secondary">
              Luxo Imóveis
            </h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              Especialistas em propriedades de alto padrão, oferecendo um serviço 
              personalizado e exclusivo para os clientes mais exigentes.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="tel:+5511999999999"
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-secondary transition-smooth"
              >
                <Phone className="w-4 h-4" />
                <span>+55 11 99999-9999</span>
              </a>
              <a
                href="mailto:contato@luxoimoveis.com"
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-secondary transition-smooth"
              >
                <Mail className="w-4 h-4" />
                <span>contato@luxoimoveis.com</span>
              </a>
              <div className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Av. Paulista, 1000<br />São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xl font-bold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-full flex items-center justify-center transition-smooth"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-full flex items-center justify-center transition-smooth"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-full flex items-center justify-center transition-smooth"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2024 Luxo Imóveis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
