import { useState, useEffect } from "react";
import { toast } from "sonner";

const AUTH_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwtcYiY9cgrk_vme8aMZEKJvUoaIMvjXq4UxwbtFNUMGWvRQJiUhhU1thdmOwIwZ7k5/exec";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userName, setUserName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      const auth = localStorage.getItem("wms_member_auth");
      const name = localStorage.getItem("wms_member_name");
      if (auth === "true") {
        setIsAuthenticated(true);
        if (name) setUserName(name);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (phoneNumber: string) => {
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');
    if (!sanitizedPhone) {
      toast.error("Por favor, insira o número do seu WhatsApp.");
      return;
    }

    setIsVerifying(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${AUTH_SCRIPT_URL}?phone=${encodeURIComponent(sanitizedPhone)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();

      if (data && data.authorized) {
        const finalName = data.name || "Membro";
        setUserName(finalName);
        setShowWelcome(true);
        
        setTimeout(() => {
          setIsAuthenticated(true);
          localStorage.setItem("wms_member_auth", "true");
          localStorage.setItem("wms_member_name", finalName);
          setShowWelcome(false);
          toast.success(`Bem-vindo(a), ${finalName}!`);
        }, 3000);
        return true;
      } else {
        toast.error("Número não autorizado. Verifique se você já fez o onboarding.");
        return false;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Login error:", error);
      toast.error(error.name === 'AbortError' ? "Tempo de conexão esgotado." : "Erro ao validar acesso.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wms_member_auth");
    localStorage.removeItem("wms_member_name");
    setIsAuthenticated(false);
    toast.info("Você saiu do sistema.");
  };

  return { isAuthenticated, isVerifying, userName, showWelcome, handleLogin, handleLogout };
}
