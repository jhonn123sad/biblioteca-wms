import { Search, RotateCw } from "lucide-react";
import { Button } from "./ui/button";

interface AppHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isLoading: boolean;
  refetch: () => void;
  onLogout: () => void;
}

export function AppHeader({ searchTerm, setSearchTerm, isLoading, refetch, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-black/[0.03] safe-top w-full transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <img src="/logo-wms.png" alt="WMS Logo" className="h-7 w-7 md:h-10 md:w-10 object-contain rounded-lg shadow-sm" />
          <h1 className="text-xs md:text-xl font-bold tracking-tight line-clamp-1 hidden xs:block">Biblioteca WMS</h1>
        </div>
        
        <div className="relative flex-1 max-w-[180px] xs:max-w-md group min-w-0">
          <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3 md:w-3.5 h-3 md:h-3.5 text-gray-400 group-focus-within:text-black" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/[0.04] border border-transparent rounded-xl h-9 md:h-10 pl-8 md:pl-9 pr-3 md:pr-4 text-[11px] md:text-sm focus:bg-white focus:border-black/10 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-black hover:bg-black/5"
            title="Sincronizar"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-[9px] md:text-xs text-gray-400 hover:text-red-500 transition-colors h-7 md:h-8 px-1.5 md:px-2 flex-shrink-0"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
