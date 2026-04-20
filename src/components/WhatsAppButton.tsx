import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5511999999999"; // troque pelo número real do corretor
const WHATSAPP_MESSAGE = "Olá! Vi seu site e gostaria de conversar sobre imóveis.";

export const WhatsAppButton = () => {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o corretor no WhatsApp"
      className="group inline-flex items-center justify-center gap-2.5 w-full bg-[hsl(142,70%,38%)] hover:bg-[hsl(142,70%,33%)] text-white font-semibold py-4 px-6 rounded-xl shadow-card hover:shadow-luxury transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(142,70%,38%)]"
    >
      <MessageCircle className="w-5 h-5" aria-hidden />
      Falar no WhatsApp
    </a>
  );
};
