import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminFetch, AppSessionError } from "@/lib/appSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Users, 
  UserCheck,
  AlertCircle,
  RefreshCw,
  Key
} from "lucide-react";
import { z } from "zod";
import { UniformHeader } from "@/components/UniformHeader";

interface Waiter {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  phone_number?: string;
}

const waiterSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100),
  full_name: z.string().min(1, { message: "El nombre completo es obligatorio" }).max(255),
  phone_number: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }).max(20).optional().or(z.literal('')),
});

const waiterEditSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  full_name: z.string().min(1, { message: "El nombre completo es obligatorio" }).max(255),
  phone_number: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }).max(20).optional().or(z.literal('')),
});

const WaiterManagement = () => {
  const navigate = useNavigate();
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWaiter, setCurrentWaiter] = useState<Partial<Waiter> & { password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if bypass parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  const bypassParam = urlParams.get('bypass');
  const bypassSuffix = bypassParam ? `?bypass=${bypassParam}` : '';

  useEffect(() => {
    fetchWaiters();
  }, []);

  const callWaiterApi = async (path: string, body?: unknown) => {
    const response = await adminFetch(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      throw new Error(data?.error || "La operación no se pudo completar.");
    }

    return data;
  };

  const handleSessionExpired = (error: unknown): boolean => {
    if (error instanceof AppSessionError) {
      toast.error(error.message);
      if (error.status === 401) navigate('/auth');
      return true;
    }
    return false;
  };

  const fetchWaiters = async () => {
    setLoading(true);
    try {
      const data = await callWaiterApi('/api/waiters/list-waiters');
      setWaiters(data.waiters || []);
    } catch (error) {
      console.error("❌ Error fetching waiters:", error);
      if (!handleSessionExpired(error)) {
        toast.error(error instanceof Error ? error.message : "Error de conexión al cargar la lista de meseros");
      }
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

      const { email, password, full_name, phone_number } = validation.data;

      await callWaiterApi('/api/waiters/create-waiter', {
        email,
        password,
        full_name,
        phone_number: phone_number || null,
      });

      toast.success("✅ ¡Mesero creado con éxito!");
      setIsDialogOpen(false);
      setCurrentWaiter({});
      fetchWaiters();

    } catch (error: any) {
      console.error('❌ Create waiter error:', error);
      if (handleSessionExpired(error)) return;

      const message: string = error?.message || '';
      toast.error(
        /already|exists|duplicate|registrado/i.test(message)
          ? "Este correo ya está registrado."
          : message || "Error desconocido al crear el mesero."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validation = waiterEditSchema.safeParse(currentWaiter);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setIsSubmitting(false);
        return;
      }

      const { email, full_name, phone_number } = validation.data;

      // Clean phone number - remove spaces and special characters
      const cleanPhone = phone_number ? phone_number.replace(/\D/g, '') : null;

      await callWaiterApi('/api/waiters/update-waiter-profile', {
        waiterId: currentWaiter.id,
        email,
        full_name,
        phone_number: cleanPhone || null,
      });

      toast.success("✅ ¡Mesero actualizado! Podés restablecer su contraseña desde la lista.");
      setIsDialogOpen(false);
      setCurrentWaiter({});
      setIsEditMode(false);
      fetchWaiters();

    } catch (error: any) {
      console.error('❌ Update waiter error:', error);
      if (handleSessionExpired(error)) return;
      toast.error(error.message || "Error desconocido al actualizar el mesero.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (waiter: Waiter) => {
    if (!waiter.email) {
      toast.error("Este mesero no tiene un email registrado.");
      return;
    }

    if (!window.confirm(`¿Restablecer la contraseña de ${waiter.full_name} y enviar una contraseña temporal a ${waiter.email}?`)) return;

    try {
      await callWaiterApi('/api/waiters/send-password-reset', {
        waiterId: waiter.id,
        waiterEmail: waiter.email,
        waiterName: waiter.full_name,
      });

      toast.success("✅ ¡Contraseña temporal enviada por email!");

    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      if (handleSessionExpired(error)) return;
      toast.error(error.message || "Error al enviar el enlace de restablecimiento.");
    }
  };

  const handleDeleteWaiter = async (waiterId: string, waiterName: string) => {
    if (!window.confirm(`¿Estás seguro de que querés eliminar al mesero "${waiterName}"? Esta acción es irreversible.`)) return;

    try {
      await callWaiterApi('/api/waiters/delete-waiter', { waiterId });

      toast.success("✅ ¡Mesero eliminado con éxito!");
      fetchWaiters();

    } catch (error: any) {
      console.error('❌ Delete waiter error:', error);
      if (handleSessionExpired(error)) return;
      toast.error(error.message || "Error desconocido al eliminar el mesero.");
    }
  };

  const openCreateDialog = () => {
    setCurrentWaiter({ full_name: '', email: '', password: '' });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (waiter: Waiter) => {
    setCurrentWaiter({ ...waiter, password: '' });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleBack = () => {
    navigate(`/admin${bypassSuffix}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-100">
      <UniformHeader
        title="Meseros"
      />

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
          <Button
            onClick={fetchWaiters}
            variant="outline"
            size="default"
            className="bg-white w-full sm:w-auto border-2 border-accent rounded-none shadow-soft"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-secondary hover:bg-secondary/90 text-foreground font-display uppercase tracking-wider w-full sm:w-auto rounded-none shadow-soft"
            size="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Mesero
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-6">
            <Card className="shadow-soft border-2 border-accent rounded-none bg-white/95 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-display uppercase tracking-wider text-gray-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    <span>Equipo de Meseros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs sm:text-sm">
                      {waiters.length} {waiters.length === 1 ? 'mesero' : 'meseros'}
                    </Badge>
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {loading ? (
                  <div className="text-center py-8 sm:py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-sm sm:text-base text-gray-600">Cargando lista de meseros...</p>
                  </div>
                ) : waiters.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Ningún mesero registrado</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Empezá agregando al primer mesero de tu equipo.</p>
                    <Button onClick={openCreateDialog} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Primer Mesero
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Layout */}
                    <div className="block md:hidden space-y-3">
                      {waiters.map((waiter) => (
                        <div key={waiter.id} className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-4 space-y-3 shadow-md border border-primary/10">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{waiter.full_name}</h3>
                              <p className="text-xs text-gray-600 break-all">{waiter.email}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="rounded-full w-9 h-9 p-0 shadow-lg border-purple-200 hover:bg-purple-50"
                                onClick={() => openEditDialog(waiter)}
                              >
                                <Edit className="w-4 h-4 text-purple-600" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="rounded-full w-9 h-9 p-0 shadow-lg"
                                onClick={() => handleDeleteWaiter(waiter.id, waiter.full_name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 block">Creado el</span>
                              <span className="text-xs font-medium text-gray-700 block">
                                {new Date(waiter.created_at).toLocaleDateString("es-BO")}
                              </span>
                            </div>
                            <div className="space-y-1 text-right">
                              <span className="text-xs text-gray-500 block">Estado</span>
                              <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Activo
                              </Badge>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResetPassword(waiter)}
                              className="w-full hover:bg-blue-50 border-blue-200"
                            >
                              <Key className="w-4 h-4 mr-2 text-blue-600" />
                              Restablecer Contraseña por Email
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Creado el</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {waiters.map((waiter) => (
                            <TableRow key={waiter.id} className="hover:bg-purple-50/50">
                              <TableCell className="font-medium">{waiter.full_name}</TableCell>
                              <TableCell>{waiter.email}</TableCell>
                              <TableCell>{new Date(waiter.created_at).toLocaleDateString("es-BO")}</TableCell>
                              <TableCell>
                                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Activo
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openEditDialog(waiter)}
                                  className="hover:bg-purple-50 border-purple-200"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4 text-purple-600" />
                                </Button>
                                {waiter.email && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleResetPassword(waiter)}
                                    className="hover:bg-blue-50 border-blue-200"
                                    title="Restablecer contraseña por email"
                                  >
                                    <Key className="w-4 h-4 text-blue-600" />
                                  </Button>
                                )}
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleDeleteWaiter(waiter.id, waiter.full_name)}
                                  className="hover:bg-red-600"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
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
        </div>

        {/* Create/Edit Waiter Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto border-2 border-accent rounded-none shadow-soft">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-display uppercase tracking-wider">
                {isEditMode ? <Edit className="w-5 h-5 text-purple-600" /> : <Users className="w-5 h-5 text-purple-600" />}
                {isEditMode ? 'Editar Mesero' : 'Agregar Nuevo Mesero'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={isEditMode ? handleUpdateWaiter : handleCreateWaiter}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-display uppercase tracking-wider">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    placeholder="Ingresá el nombre completo"
                    value={currentWaiter.full_name || ''}
                    onChange={(e) => setCurrentWaiter({ ...currentWaiter, full_name: e.target.value })}
                    required
                    className="text-base border-2 border-accent rounded-none shadow-soft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-display uppercase tracking-wider">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresá el email"
                    value={currentWaiter.email || ''}
                    onChange={(e) => setCurrentWaiter({ ...currentWaiter, email: e.target.value })}
                    required
                    className="text-base border-2 border-accent rounded-none shadow-soft"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-sm font-display uppercase tracking-wider">
                    Teléfono de contacto (opcional)
                  </Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="59171234567"
                    value={currentWaiter.phone_number || ''}
                    onChange={(e) => setCurrentWaiter({ ...currentWaiter, phone_number: e.target.value })}
                    className="text-base border-2 border-accent rounded-none shadow-soft"
                  />
                  <p className="text-xs font-body text-gray-500">
                    Formato: código de país + número (ej.: 59171234567). La contraseña temporal se envía al email del mesero.
                  </p>
                </div>

                {!isEditMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-display uppercase tracking-wider">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresá la contraseña (mínimo 6 caracteres)"
                      value={currentWaiter.password || ''}
                      onChange={(e) => setCurrentWaiter({ ...currentWaiter, password: e.target.value })}
                      required
                      className="text-base border-2 border-accent rounded-none shadow-soft"
                    />
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto border-2 border-accent rounded-none shadow-soft"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-secondary hover:bg-secondary/90 text-foreground font-display uppercase tracking-wider w-full sm:w-auto rounded-none shadow-soft"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {isEditMode ? 'Actualizar Mesero' : 'Crear Mesero'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WaiterManagement;
