import { useState } from "react";
import { MapPin, Bed, Bath, Square, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterestForm } from "./InterestForm";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: 1,
    name: "Penthouse Skyline",
    address: "Avenida Paulista, São Paulo",
    description: "Cobertura luxuosa com vista panorâmica e acabamentos premium.",
    price: "R$ 15.800.000",
    image: property1,
    beds: 4,
    baths: 5,
    area: "450m²",
  },
  {
    id: 2,
    name: "Villa Paradiso",
    address: "Praia do Forte, Bahia",
    description: "Villa à beira-mar com piscina infinita e acesso privativo.",
    price: "R$ 12.500.000",
    image: property2,
    beds: 5,
    baths: 6,
    area: "650m²",
  },
  {
    id: 3,
    name: "Mountain Retreat",
    address: "Campos do Jordão, SP",
    description: "Chalé moderno com vista para as montanhas e máximo conforto.",
    price: "R$ 8.900.000",
    image: property3,
    beds: 4,
    baths: 4,
    area: "380m²",
  },
];

export const Properties = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const active = properties.find((p) => p.id === openId);

  return (
    <section className="px-5 py-10 max-w-md mx-auto space-y-7" aria-label="Imóveis em destaque">
      <header className="text-center">
        <span className="inline-block text-[10px] font-semibold tracking-[0.25em] uppercase text-secondary mb-2">
          Portfólio
        </span>
        <h2 className="font-display text-3xl font-bold text-foreground">
          Imóveis em <span className="text-secondary italic">destaque</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
          Toque em <span className="font-semibold text-foreground">"Tenho interesse"</span> para falar diretamente comigo
        </p>
      </header>

      {properties.map((p) => (
        <article
          key={p.id}
          className="group bg-card rounded-3xl overflow-hidden shadow-card transition-smooth hover:shadow-luxury hover:-translate-y-1 border border-border/40"
        >
          <div className="relative h-60 overflow-hidden">
            <img
              src={p.image}
              alt={`Foto do imóvel ${p.name} em ${p.address}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
            <div className="absolute top-3.5 right-3.5 bg-gradient-gold text-secondary-foreground px-3.5 py-1.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
              {p.price}
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-display text-2xl font-bold text-foreground">{p.name}</h3>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>{p.address}</span>
            </div>
            <p className="text-sm text-muted-foreground/90 mb-4 leading-relaxed">{p.description}</p>
            <dl className="flex items-center gap-5 text-sm text-muted-foreground mb-5 pb-5 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-secondary" aria-hidden />
                <dt className="sr-only">Quartos</dt>
                <dd>{p.beds}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-secondary" aria-hidden />
                <dt className="sr-only">Banheiros</dt>
                <dd>{p.baths}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4 text-secondary" aria-hidden />
                <dt className="sr-only">Área</dt>
                <dd>{p.area}</dd>
              </div>
            </dl>
            <Button
              onClick={() => setOpenId(p.id)}
              size="lg"
              className="group/btn w-full bg-gradient-gold hover:opacity-95 text-secondary-foreground font-semibold text-base shadow-card hover:shadow-luxury transition-smooth h-12"
              aria-label={`Demonstrar interesse em ${p.name}`}
            >
              Tenho interesse
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" aria-hidden />
            </Button>
          </div>
        </article>
      ))}

      {active && (
        <InterestForm
          open={openId !== null}
          onOpenChange={(o) => !o && setOpenId(null)}
          propertyName={active.name}
        />
      )}
    </section>
  );
};
