import { useState } from "react";
import { MapPin, Bed, Bath, Square } from "lucide-react";
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
    <section className="px-5 py-10 max-w-md mx-auto space-y-6" aria-label="Imóveis em destaque">
      <header className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Imóveis em <span className="text-secondary">destaque</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Toque em <span className="font-semibold text-foreground">"Tenho interesse"</span> para falar diretamente comigo
        </p>
      </header>

      {properties.map((p) => (
        <article
          key={p.id}
          className="bg-card rounded-2xl overflow-hidden shadow-card transition-smooth hover:shadow-luxury"
        >
          <div className="relative h-56 overflow-hidden">
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
              {p.price}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{p.address}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" /> {p.beds}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" /> {p.baths}
              </span>
              <span className="flex items-center gap-1">
                <Square className="w-4 h-4" /> {p.area}
              </span>
            </div>
            <Button
              onClick={() => setOpenId(p.id)}
              size="lg"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-base shadow-card hover:shadow-luxury transition-smooth"
              aria-label={`Demonstrar interesse em ${p.name}`}
            >
              Tenho interesse →
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
