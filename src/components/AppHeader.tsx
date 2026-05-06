import { Search, RotateCw, Menu, Moon, Sun, LogIn, LogOut, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "./ui/dropdown-menu";

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
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-border safe-top w-full transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <img src="/logo-wms-new.png" alt="WMS Logo" className="h-10 w-10 md:h-16 md:w-16 object-contain transition-all hover:scale-110 duration-500 drop-shadow-sm" />
          <h1 className="text-xs md:text-xl font-bold tracking-tight line-clamp-1 hidden xs:block">Biblioteca WMS</h1>
        </div>
        
        <div className="relative flex-1 max-w-[180px] xs:max-w-md group min-w-0">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border-border animate-in fade-in slide-in-from-top-2 duration-200">
              {isAuthenticated ? (
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onLogin} className="cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Entrar</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  <span>Modo</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background border-border animate-in fade-in slide-in-from-left-2 duration-200">
                    <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Escuro</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
