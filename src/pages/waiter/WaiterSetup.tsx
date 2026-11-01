import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function WaiterSetup() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Por favor, ingresá un nombre para mostrar");
      return;
    }

    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (trimmedName.length > 50) {
      setError("El nombre debe tener como máximo 50 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Call the database function to set display name
      const { data, error: rpcError } = await supabase.rpc('set_waiter_display_name', {
        p_display_name: trimmedName
      });

      if (rpcError) {
        console.error('Error setting display name:', rpcError);
        
        // Handle specific error cases
        if (rpcError.message.includes('already in use')) {
          setError("Ese nombre ya está en uso. Por favor, elegí otro.");
        } else if (rpcError.message.includes('Not authenticated')) {
          setError("Sesión expirada. Por favor, iniciá sesión nuevamente.");
          setTimeout(() => navigate('/login'), 2000);
        } else if (rpcError.message.includes('Only waiters')) {
          setError("Solo los meseros pueden configurar nombres para mostrar.");
        } else {
          setError("Error al guardar. Intentá nuevamente.");
        }
        return;
      }

      // Success!
      toast.success("¡Nombre para mostrar configurado con éxito!");
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/waiter/dashboard', { replace: true });
      }, 500);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError("Error inesperado. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft border-2 border-accent rounded-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/50 to-blue-500 rounded-none flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-display uppercase tracking-wider text-gray-900">
            Configurá tu Nombre para Mostrar
          </CardTitle>
          <CardDescription className="text-base font-body">
            Elegí un nombre único que se usará para identificarte en los pedidos y reportes
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-display uppercase tracking-wider">
                Nombre para Mostrar
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Ej.: Juan, María, Pedro..."
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="text-base border-2 border-accent rounded-none shadow-soft"
                autoFocus
                maxLength={50}
              />
              <p className="text-xs font-body text-gray-500">
                {displayName.length}/50 caracteres
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border-2 border-accent rounded-none p-4 space-y-2 shadow-soft">
              <p className="text-sm font-display uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Consejos:
              </p>
              <ul className="text-sm font-body text-blue-800 space-y-1 ml-6 list-disc">
                <li>Usá tu apodo o tu primer nombre</li>
                <li>Debe ser único (no se puede repetir)</li>
                <li>Será visible para todo el equipo</li>
                <li>Puede contener letras, números y espacios</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-display uppercase tracking-wider rounded-none shadow-soft"
              disabled={loading || !displayName.trim()}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
