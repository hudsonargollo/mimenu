import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Users, RefreshCw } from "lucide-react";
import { z } from "zod";

interface Waiter {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const waiterSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100),
  full_name: z.string().min(1, { message: "El nombre completo es obligatorio" }).max(255),
});

const AdminWaiters = () => {
  const navigate = useNavigate();
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWaiter, setCurrentWaiter] = useState<Partial<Waiter> & { password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    setLoading(true);
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sesión expirada. Iniciá sesión nuevamente.");
        navigate('/auth');
        return;
      }

      console.log('🔵 Calling Supabase Edge Function: list-waiters');
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('list-waiters', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Edge Function error:", error);
        
        // Handle specific error cases
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          toast.error("Sesión expirada. Iniciá sesión nuevamente.");
          navigate('/auth');
          return;
        }
        
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          toast.error("Acceso denegado. Solo los administradores pueden gestionar meseros.");
          navigate('/');
          return;
        }
        
        toast.error("Error al cargar la lista de meseros");
        setWaiters([]);
        return;
      }
      
      setWaiters(data?.waiters || []);
      
    } catch (error) {
      console.error("Error fetching waiters:", error);
      toast.error("Error al cargar la lista de meseros");
      setWaiters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validation = waiterSchema.safeParse(currentWaiter);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setIsSubmitting(false);
        return;
      }

      const { email, password, full_name } = validation.data;

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sesión expirada. Iniciá sesión nuevamente.");
        navigate('/auth');
        setIsSubmitting(false);
        return;
      }

      console.log('🔵 Creating waiter via Supabase Edge Function:', { email, full_name });

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-waiter', {
        body: { email, password, full_name },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          toast.error("Sesión expirada. Iniciá sesión nuevamente.");
          navigate('/auth');
          return;
        }
        
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          toast.error("Acceso denegado. Solo los administradores pueden gestionar meseros.");
          navigate('/');
          return;
        }
        
        if (error.message?.includes('already exists') || error.message?.includes('duplicate') || error.message?.includes('já existe')) {
          toast.error("Este email ya está registrado.");
          return;
        }
        
        if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
          toast.error("Preencha todos os campos obrigatórios.");
          return;
        }
        
        toast.error("Error al crear la cuenta del mesero.");
        return;
      }

      toast.success("¡Mesero creado con éxito!");
      setIsDialogOpen(false);
      setCurrentWaiter({});
      fetchWaiters(); // Refresh list

    } catch (error: any) {
      console.error('Create waiter error:', error);
      toast.error("Error en el servidor. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWaiter = async (waiterId: string) => {
    if (!window.confirm("¿Seguro que querés eliminar este mesero? Esta acción es irreversible.")) return;

    setDeletingId(waiterId);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sesión expirada. Iniciá sesión nuevamente.");
        navigate('/auth');
        return;
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('delete-waiter', {
        body: { waiterId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          toast.error("Sesión expirada. Iniciá sesión nuevamente.");
          navigate('/auth');
          return;
        }
        
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          toast.error("Acceso denegado. Solo los administradores pueden gestionar meseros.");
          navigate('/');
          return;
        }
        
        if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
          toast.error("Mesero no encontrado.");
          return;
        }
        
        toast.error("Error al eliminar la cuenta del mesero.");
        return;
      }

      toast.success("¡Mesero eliminado con éxito!");
      fetchWaiters(); // Refresh list

    } catch (error: any) {
      console.error('Delete waiter error:', error);
      toast.error("Error en el servidor. Intentá nuevamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentWaiter({ full_name: '', email: '', password: '' });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Gestión de Meseros
          </h1>
          <p className="text-gray-600 mt-2">
            Gestioná tu equipo de meseros
          </p>
        </div>
        {/* Content Card */}
        <Card className="shadow-xl border-0 bg-white rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Equipo de Meseros
                </CardTitle>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary/90 rounded-full text-sm font-medium">
                {waiters.length} mesero{waiters.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-gray-500">Cargando lista de meseros...</p>
            </div>
          ) : waiters.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Ningún mesero registrado</p>
              <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar primer mesero
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-4">
                {waiters.map((waiter) => (
                  <div key={waiter.id} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{waiter.full_name}</h3>
                        <p className="text-sm text-gray-600 break-all">{waiter.email}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="ml-2 rounded-full w-10 h-10 p-0"
                        onClick={() => handleDeleteWaiter(waiter.id)}
                        disabled={deletingId === waiter.id}
                      >
                        {deletingId === waiter.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Creado el</span>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(waiter.created_at).toLocaleDateString("es-BO")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Activo
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre completo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Creado el</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waiters.map((waiter) => (
                      <TableRow key={waiter.id}>
                        <TableCell className="font-medium">{waiter.full_name}</TableCell>
                        <TableCell>{waiter.email}</TableCell>
                        <TableCell>{new Date(waiter.created_at).toLocaleDateString("es-BO")}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteWaiter(waiter.id)}
                            disabled={deletingId === waiter.id}
                          >
                            {deletingId === waiter.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Creating/Editing Waiter */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar mesero" : "Agregar nuevo mesero"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWaiter}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  value={currentWaiter.full_name || ''}
                  onChange={(e) => setCurrentWaiter({ ...currentWaiter, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentWaiter.email || ''}
                  onChange={(e) => setCurrentWaiter({ ...currentWaiter, email: e.target.value })}
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña {isEditing ? "(Dejala en blanco para no cambiarla)" : ""}</Label>
                <Input
                  id="password"
                  type="password"
                  value={currentWaiter.password || ''}
                  onChange={(e) => setCurrentWaiter({ ...currentWaiter, password: e.target.value })}
                  required={!isEditing}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isEditing ? "Guardar cambios" : "Crear mesero"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminWaiters;
