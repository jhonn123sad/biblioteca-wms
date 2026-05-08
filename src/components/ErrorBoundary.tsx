import { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { 
    console.error("CRITICAL_RENDER_ERROR:", error, errorInfo); 
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-sm">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">Ops! Algo deu errado.</h1>
            <p className="text-muted-foreground text-sm">Ocorreu um erro ao carregar esta parte da interface.</p>
            <Button onClick={() => window.location.reload()} variant="default" className="rounded-xl w-full">
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
