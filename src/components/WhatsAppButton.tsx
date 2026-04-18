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
      className="inline-flex items-center justify-center gap-2 w-full max-w-md mx-auto bg-secondary text-secondary-foreground font-semibold py-4 px-6 rounded-full shadow-card hover:shadow-luxury transition-smooth hover:scale-[1.02]"
    >
      <MessageCircle className="w-5 h-5" />
      Falar no WhatsApp
    </a>
  );
};
