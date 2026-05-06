import { Search, RotateCw, Moon, Sun, LogIn, LogOut } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isLoading: boolean;
  refetch: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function AppHeader({ searchTerm, setSearchTerm, isLoading, refetch, onLogout, isAuthenticated, onLogin }: AppHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-border safe-top w-full transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <BrandLogo />
          <h1 className="text-xs md:text-xl font-bold tracking-tight line-clamp-1 hidden xs:block">BIBLIOTECA WMS</h1>
        </div>
        
        <div className="relative flex-1 max-w-[220px] xs:max-w-md md:max-w-2xl group min-w-0 mx-2 md:mx-6">
          <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3 md:w-3.5 h-3 md:h-3.5 text-muted-foreground group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border border-transparent rounded-xl h-9 md:h-10 pl-8 md:pl-9 pr-3 md:pr-4 text-[11px] md:text-sm focus:bg-background focus:border-primary/20 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Sincronizar"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-transform duration-300 active:rotate-45"
              title="Alternar Tema"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-white" />
              ) : (
                <Sun className="w-4 h-4 text-foreground" />
              )}
            </Button>
          )}

          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              className="w-8 h-8 rounded-full text-destructive hover:bg-destructive/10"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={onLogin}
              className="rounded-full px-4 h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
