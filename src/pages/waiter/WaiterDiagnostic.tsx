import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface DiagnosticResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: string;
}

const WaiterDiagnostic = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics: DiagnosticResult[] = [];

    // 1. Check authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        diagnostics.push({
          name: "Autenticación",
          status: "success",
          message: "Usuario autenticado",
          details: `Correo: ${user.email}, ID: ${user.id}`
        });

        // Check user role
        const role = user.user_metadata?.role || user.app_metadata?.role;
        diagnostics.push({
          name: "Rol del Usuario",
          status: role ? "success" : "warning",
          message: role ? `Rol: ${role}` : "No se encontró un rol en los metadatos",
          details: JSON.stringify({ user_metadata: user.user_metadata, app_metadata: user.app_metadata })
        });

        // Check profile in database using RPC (optional - may not exist)
        try {
          const { data: userRole, error: roleError } = await (supabase.rpc as any)('get_user_role', {
            user_id: user.id
          });

          if (roleError) {
            // RPC function may not exist yet - this is not critical
            diagnostics.push({
              name: "Base de Datos del Perfil (RPC)",
              status: "warning",
              message: "Función RPC no disponible (esto es normal)",
              details: "La función get_user_role puede no estar creada todavía"
            });
          } else if (userRole) {
            diagnostics.push({
              name: "Base de Datos del Perfil (RPC)",
              status: "success",
              message: `Rol del usuario desde RPC: ${userRole}`,
              details: `Rol: ${userRole}`
            });
          } else {
            diagnostics.push({
              name: "Base de Datos del Perfil (RPC)",
              status: "warning",
              message: "La RPC no devolvió un rol"
            });
          }
        } catch (rpcError: any) {
          // RPC function may not exist - this is not critical
          diagnostics.push({
            name: "Base de Datos del Perfil (RPC)",
            status: "warning",
            message: "Llamada RPC no disponible (esto es normal)",
            details: "La función get_user_role puede no estar creada todavía"
          });
        }
      } else {
        diagnostics.push({
          name: "Autenticación",
          status: "error",
          message: "Ningún usuario autenticado"
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: "Autenticación",
        status: "error",
        message: "Falló la verificación de autenticación",
        details: error.message
      });
    }

    // 2. Check menu data access
    try {
      const { data: categories, error: catError } = await supabase
        .from("menu_categories")
        .select("*")
        .limit(1);

      if (catError) throw catError;

      diagnostics.push({
        name: "Acceso a Categorías del Menú",
        status: "success",
        message: "Se puede acceder a las categorías del menú",
        details: `Se encontraron ${categories?.length || 0} categorías`
      });
    } catch (error: any) {
      diagnostics.push({
        name: "Acceso a Categorías del Menú",
        status: "error",
        message: "No se puede acceder a las categorías del menú",
        details: error.message
      });
    }

    // 3. Check menu items access
    try {
      const { data: items, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .limit(1);

      if (itemsError) throw itemsError;

      diagnostics.push({
        name: "Acceso a Ítems del Menú",
        status: "success",
        message: "Se puede acceder a los ítems del menú",
        details: `Se encontraron ${items?.length || 0} ítems`
      });
    } catch (error: any) {
      diagnostics.push({
        name: "Acceso a Ítems del Menú",
        status: "error",
        message: "No se puede acceder a los ítems del menú",
        details: error.message
      });
    }

    // 4. Check orders table access
    try {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .limit(1);

      if (ordersError) throw ordersError;

      diagnostics.push({
        name: "Acceso a la Tabla de Pedidos",
        status: "success",
        message: "Se puede acceder a la tabla de pedidos",
        details: `Se encontraron ${orders?.length || 0} pedidos`
      });
    } catch (error: any) {
      diagnostics.push({
        name: "Acceso a la Tabla de Pedidos",
        status: "error",
        message: "No se puede acceder a la tabla de pedidos",
        details: error.message
      });
    }

    // 5. Check navigation routes
    diagnostics.push({
      name: "Ruta Actual",
      status: "success",
      message: window.location.pathname,
      details: `URL completa: ${window.location.href}`
    });

    // 6. Check localStorage
    try {
      const cartData = localStorage.getItem('cart');
      diagnostics.push({
        name: "Carrito en LocalStorage",
        status: cartData ? "success" : "warning",
        message: cartData ? "Existen datos del carrito" : "No hay datos del carrito",
        details: cartData || "Vacío"
      });
    } catch (error: any) {
      diagnostics.push({
        name: "Carrito en LocalStorage",
        status: "error",
        message: "No se puede acceder a localStorage",
        details: error.message
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-acai p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-4 border-2 border-accent rounded-none shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-display uppercase tracking-wider">Diagnóstico del Sistema de Meseros</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/waiter-dashboard")}
                className="border-2 border-accent rounded-none shadow-soft"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Panel
              </Button>
            </div>
          </CardHeader>
        </Card>

        {loading ? (
          <Card className="border-2 border-accent rounded-none shadow-soft">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 font-body">Ejecutando diagnósticos...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <Card key={index} className={`border-2 rounded-none shadow-soft ${getStatusColor(result.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Mostrar detalles
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                            {result.details}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-4 border-2 border-accent rounded-none shadow-soft">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/menu")} variant="outline">
                Probar Navegación al Menú
              </Button>
              <Button onClick={() => navigate("/waiter-dashboard")} variant="outline">
                Ir al Panel
              </Button>
              <Button onClick={() => navigate("/auth")} variant="outline">
                Ir a Autenticación
              </Button>
              <Button onClick={runDiagnostics} variant="outline">
                Volver a Ejecutar Diagnósticos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaiterDiagnostic;
