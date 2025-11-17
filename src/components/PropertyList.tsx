import { MapPin, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: 1,
    name: "Penthouse Skyline",
    address: "Avenida Paulista, São Paulo",
    description: "Cobertura luxuosa com vista panorâmica da cidade, acabamentos premium e tecnologia de ponta.",
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
    description: "Villa à beira-mar com piscina infinita, design contemporâneo e acesso privativo à praia.",
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
    description: "Chalé moderno com vista para as montanhas, arquitetura alpina e máximo conforto.",
    price: "R$ 8.900.000",
    image: property3,
    beds: 4,
    baths: 4,
    area: "380m²",
  },
];

export const PropertyList = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="imoveis" className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Imóveis <span className="text-secondary">Exclusivos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma seleção cuidadosa das propriedades mais extraordinárias do mercado
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-luxury transition-smooth"
            >
              {/* Property Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-bold">
                  {property.price}
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {property.name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.address}</span>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {property.description}
                </p>

                {/* Features */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.baths}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    <span>{property.area}</span>
                  </div>
                </div>

                <Button
                  onClick={scrollToContact}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth"
                >
                  Agendar Visita
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
