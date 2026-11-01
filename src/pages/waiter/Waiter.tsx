import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, ArrowLeft, Flame } from "lucide-react";

const Waiter = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Acceso Mesero | MiMenu";
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to auth page with waiter context
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-ocean flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-soft border-2 border-accent rounded-2xl">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4 hover:bg-gray-100 transition-all duration-300 border-2 border-accent rounded-lg shadow-soft"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>

        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/20 mb-4">
            <div className="w-full h-full bg-[#0D0E15] rounded-[14px] flex items-center justify-center">
              <Flame className="w-8 h-8 text-amber-400 fill-amber-400" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserCheck className="h-7 w-7 text-green-600" />
            <h1 className="text-3xl font-display uppercase tracking-wider text-purple-900">Mesero</h1>
          </div>
          <p className="text-muted-foreground font-body">
            Iniciá sesión para acceder al panel
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-display uppercase tracking-wider">Correo electrónico</Label>
            <Input
              id="username"
              type="email"
              placeholder="Ingresá tu correo electrónico"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-12 border-2 border-accent rounded-lg shadow-soft"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-display uppercase tracking-wider">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 border-2 border-accent rounded-lg shadow-soft"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-foreground font-display uppercase tracking-wider text-lg rounded-lg shadow-soft"
          >
            Ingresar al Panel
          </Button>
        </form>


      </Card>
    </div>
  );
};

export default Waiter;
