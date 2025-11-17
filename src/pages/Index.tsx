import { Hero } from "@/components/Hero";
import { AgentProfile } from "@/components/AgentProfile";
import { PropertyList } from "@/components/PropertyList";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AgentProfile />
      <PropertyList />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Index;
