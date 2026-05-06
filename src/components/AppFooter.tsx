import { Users, Instagram, Youtube, ExternalLink } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="container mx-auto px-4 md:px-12 py-16 border-t border-border mt-20 bg-secondary/20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo-wms.png" alt="WMS Logo" className="h-12 w-12 object-contain" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">WMS Society</h2>
          </div>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xs">
            A maior comunidade de tecnologia e lifestyle para quem busca a liberdade através da internet.
          </p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Nossa Comunidade
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <a href="https://www.instagram.com/webmoneysociety/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF007A] via-[#833AB4] to-[#FCAF45] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Instagram</span>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">@webmoneysociety</span>
              </div>
            </a>
            <a href="https://www.youtube.com/@WMoneySociety" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FF0000] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Youtube className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">YouTube</span>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Inscreva-se</span>
              </div>
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Fundadores</h3>
          <div className="grid grid-cols-1 gap-4">
            <a href="https://www.instagram.com/jota.wms/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-[2rem] bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative w-14 h-14 shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF007A] to-[#8A2BE2] animate-pulse opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="w-full h-full rounded-full border-2 border-background shadow-md overflow-hidden bg-secondary flex items-center justify-center relative z-10">
                  <img src="/jota.jpg" alt="Jota" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background shadow-sm flex items-center justify-center z-20">
                  <Instagram className="w-3.5 h-3.5 text-[#FF007A]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-foreground">Jota</span>
                <span className="text-[11px] text-[#FF007A] font-bold uppercase tracking-wider">@jota.wms</span>
                <div className="flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Seguir</span>
                  <ExternalLink className="w-2 h-2" />
                </div>
              </div>
            </a>

            <a href="https://www.instagram.com/ia.gostini/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-[2rem] bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative w-14 h-14 shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#39FF14] animate-pulse opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="w-full h-full rounded-full border-2 border-background shadow-md overflow-hidden bg-secondary flex items-center justify-center relative z-10">
                  <img src="/agostini.jpg" alt="Agostini" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background shadow-sm flex items-center justify-center z-20">
                  <Instagram className="w-3.5 h-3.5 text-[#00D1FF]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-foreground">Agostini</span>
                <span className="text-[11px] text-[#00D1FF] font-bold uppercase tracking-wider">@ia.gostini</span>
                <div className="flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Seguir</span>
                  <ExternalLink className="w-2 h-2" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border opacity-40">
        <p className="text-[10px] font-black tracking-widest uppercase text-foreground">&copy; {new Date().getFullYear()} WEB MONEY SOCIETY</p>
        <div className="flex gap-8 text-foreground">
          <span className="text-[10px] font-black uppercase tracking-widest">Premium Resource</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Official Library</span>
        </div>
      </div>
    </footer>
  );
}
