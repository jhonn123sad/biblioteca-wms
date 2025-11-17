import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-luxury-home.jpg";

export const Hero = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Imóvel de Luxo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Encontre o Imóvel dos{" "}
            <span className="text-secondary">Seus Sonhos</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            Especialistas em propriedades de alto padrão. Transformamos seu sonho em realidade com exclusividade e sofisticação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={scrollToContact}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-6 text-lg shadow-luxury transition-smooth"
            >
              Agendar Consulta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" })}
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-8 py-6 text-lg transition-smooth"
            >
              Ver Imóveis
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground rounded-full" />
        </div>
      </div>
    </section>
  );
};
