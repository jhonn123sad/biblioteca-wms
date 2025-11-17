import { Phone, Mail, Award, Users } from "lucide-react";
import agentImage from "@/assets/agent-profile.jpg";

export const AgentProfile = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Agent Image */}
          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-card">
              <img
                src={agentImage}
                alt="Corretor Especialista"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-foreground p-6 rounded-lg shadow-luxury">
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8" />
                <div>
                  <p className="font-bold text-2xl">15+</p>
                  <p className="text-sm">Anos de Experiência</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Seu Parceiro em Imóveis de <span className="text-secondary">Luxo</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Com mais de 15 anos de experiência no mercado imobiliário de alto padrão, 
              oferecemos um serviço personalizado e exclusivo para encontrar a propriedade 
              perfeita que atenda às suas expectativas mais sofisticadas.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <Users className="w-8 h-8 text-secondary mb-2" />
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Clientes Satisfeitos</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <Award className="w-8 h-8 text-secondary mb-2" />
                <p className="text-3xl font-bold text-foreground">R$ 2B+</p>
                <p className="text-sm text-muted-foreground">Em Negociações</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+5511999999999"
                className="flex items-center gap-3 text-foreground hover:text-secondary transition-smooth"
              >
                <Phone className="w-5 h-5" />
                <span className="text-lg">+55 11 99999-9999</span>
              </a>
              <a
                href="mailto:contato@luxoimoveis.com"
                className="flex items-center gap-3 text-foreground hover:text-secondary transition-smooth"
              >
                <Mail className="w-5 h-5" />
                <span className="text-lg">contato@luxoimoveis.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
