import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, MapPin } from "lucide-react";
import { validateTableId, formatTableDisplay } from "@/lib/tableContext";

import bckMImage from "@/assets/bck-m.webp";

const Welcome = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  // If no table ID or invalid format, redirect to home
  if (!tableId || !validateTableId(tableId)) {
    navigate("/");
    return null;
  }

  const handleStartOrdering = () => {
    navigate(`/menu/${tableId}`);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center">
        {/* Logo in Circle */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-8 rounded-full border-4 border-secondary bg-white shadow-strong flex items-center justify-center">
          <img 
            src="/mimenu-square.svg" 
            alt="MiMenu" 
            className="w-32 sm:w-40 h-auto"
          />
        </div>
        
        {/* Welcome Text */}
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-3 drop-shadow-lg tracking-wider uppercase">
          Bem-vindo!
        </h1>
        <p className="text-xl sm:text-2xl text-foreground mb-2 drop-shadow-md font-body">
          PONTAL Carapitangui - Praia Bar
        </p>
        
        {/* Table Info */}
        <div className="flex items-center justify-center gap-2 mb-8 text-foreground">
          <MapPin className="h-5 w-5" />
          <span className="text-lg font-semibold font-body">{formatTableDisplay(tableId)}</span>
        </div>
        
        {/* Main CTA Button */}
        <Button 
          size="lg" 
          onClick={handleStartOrdering}
          className="w-full text-xl py-7 bg-secondary text-white hover:bg-secondary/90 shadow-2xl transition-all transform hover:scale-105 font-display uppercase tracking-wider rounded-none"
        >
          <QrCode className="mr-2 h-6 w-6" />
          Começar Pedido
        </Button>
        
        {/* Quick Info */}
        <div className="mt-8 bg-primary/5 backdrop-blur-sm p-4 text-foreground text-sm font-body border-2 border-accent rounded-none">
          <p className="mb-2">✨ Peça pelo celular</p>
          <p className="mb-2">💳 Pague com PIX</p>
          <p>📱 Receba notificações no WhatsApp</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
