import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userName, setUserName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      console.log("AUTH_INITIALIZING...");
      const auth = localStorage.getItem("wms_member_auth");
      const name = localStorage.getItem("wms_member_name");
      console.log("AUTH_STORAGE_CHECK:", { auth, name });
      
      if (auth === "true") {
        setIsAuthenticated(true);
        if (name) setUserName(name);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error("AUTH_STORAGE_ERROR:", e);
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
    try {
      // Primeiro tenta verificar na tabela local do Supabase
      const { data: allowedData, error: allowedError } = await supabase
        .from('allowed_numbers')
        .select('name')
        .eq('phone', sanitizedPhone)
        .maybeSingle();

      if (allowedError) {
        console.error("Supabase auth error:", allowedError);
      }

      if (allowedData) {
        const finalName = allowedData.name || "Membro";
        return await finalizeLogin(finalName);
      }

      // Se não encontrar no Supabase, tenta o Google Script (legado)
      const AUTH_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwtcYiY9cgrk_vme8aMZEKJvUoaIMvjXq4UxwbtFNUMGWvRQJiUhhU1thdmOwIwZ7k5/exec";
      const response = await fetch(`${AUTH_SCRIPT_URL}?phone=${encodeURIComponent(sanitizedPhone)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.authorized) {
          return await finalizeLogin(data.name || "Membro");
        }
      }

      toast.error("Número não autorizado. Verifique se você já fez o onboarding.");
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Erro ao validar acesso.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const finalizeLogin = async (name: string) => {
    setUserName(name);
    setShowWelcome(true);
    
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        setIsAuthenticated(true);
        localStorage.setItem("wms_member_auth", "true");
        localStorage.setItem("wms_member_name", name);
        setShowWelcome(false);
        toast.success(`Bem-vindo(a), ${name}!`);
        resolve(true);
      }, 3000);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("wms_member_auth");
    localStorage.removeItem("wms_member_name");
    setIsAuthenticated(false);
    toast.info("Você saiu do sistema.");
  };

  return { isAuthenticated, isVerifying, userName, showWelcome, handleLogin, handleLogout };
}
