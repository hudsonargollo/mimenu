import { useMemo, useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Printer,
  RefreshCw,
  Download,
  PlayCircle,
  Loader2,
  UserCog,
  KeyRound,
  UserPlus,
  Users as UsersIcon,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { printServerClient } from '@/integrations/print-server/client';
import { useMimenu } from '@/lib/mimenuContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export type StaffRole = 'admin' | 'waiter' | 'kitchen' | 'cashier';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  password: string;
  createdAt: string;
}

const STORAGE_KEY = 'mimenu_managed_users';

function loadUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: ManagedUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

const AdminSettings = () => {
  const { venue } = useMimenu();
  const [activeTab, setActiveTab] = useState('general');

  // Printer
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Users
  const [users, setUsers] = useState<ManagedUser[]>(() => loadUsers());
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('waiter');
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');

  const syncUsers = (updater: (current: ManagedUser[]) => ManagedUser[]) => {
    setUsers((current) => {
      const next = updater(current);
      saveUsers(next);
      return next;
    });
  };

  useEffect(() => {
    document.title = 'Configuración | MiMenu';
    const saved = printServerClient.getServerUrl();
    setServerUrl(saved);
    checkPrinterConnection();
  }, []);

  const checkPrinterConnection = async () => {
    setIsChecking(true);
    try {
      const available = await printServerClient.checkAvailability();
      setIsConnected(available);
      toast.success(available ? 'Servidor de impresión conectado' : 'Servidor no disponible');
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSavePrinterUrl = () => {
    printServerClient.setServerUrl(serverUrl);
    toast.success('URL del servidor de impresión guardada');
    checkPrinterConnection();
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${serverUrl}/test-print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) toast.success('Impresión de prueba enviada');
      else toast.error('Fallo en la impresión');
    } catch {
      toast.error('Error al conectar con el servidor de impresión local');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateUser = () => {
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    const password = newPassword.trim();
    const role = newRole;

    if (!name || !email || !password) {
      toast.error('Completá nombre, email y contraseña');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email inválido');
      return;
    }
    if (users.some((u) => u.email === email)) {
      toast.error('Ya existe un usuario con ese email');
      return;
    }

    const user: ManagedUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      password,
      createdAt: new Date().toISOString(),
    };

    syncUsers((current) => [...current, user]);
    setNewName('');
    setNewEmail('');
    setNewRole('waiter');
    setNewPassword('');
    toast.success('Usuario creado');
  };

  const handleResetPassword = () => {
    const email = resetEmail.trim().toLowerCase();
    const password = resetPassword.trim();
    if (!email || !password) {
      toast.error('Completá email y nueva contraseña');
      return;
    }
    const exists = users.some((u) => u.email === email);
    if (!exists) {
      toast.error('No se encontró un usuario con ese email');
      return;
    }
    syncUsers((current) =>
      current.map((u) => (u.email === email ? { ...u, password } : u))
    );
    setResetEmail('');
    setResetPassword('');
    toast.success('Contraseña actualizada');
  };

  const handleDeleteUser = (id: string) => {
    syncUsers((current) => current.filter((u) => u.id !== id));
    toast.success('Usuario eliminado');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <AdminPageHeader
          index="11"
          eyebrow="Configuraciones"
          title="Configuración de la plataforma"
          description="Gestioná marca, impresión térmica y accesos del panel."
          meta={<span className="noir-eyebrow">{venue?.name ?? 'Local'}</span>}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-7 inline-flex h-auto items-center gap-7 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="general"
              className="-mb-px inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Marca & Experiencia
            </TabsTrigger>
            <TabsTrigger
              value="printer"
              className="-mb-px inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Impresión térmica
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="-mb-px inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Usuarios & Accesos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>White-Label & Marca</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Identidad pública y coherencia visual del local.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nombre público</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{venue?.name ?? 'Local'}</p>
                  </div>
                  <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Slug</p>
                    <p className="text-sm font-bold text-foreground mt-0.5 font-mono">{venue?.slug ?? 'loja'}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted/20 border border-border/60 rounded-xl text-xs text-muted-foreground">
                  Esta sección controla la identidad pública del local. Podés ajustar nombre, slug, logo y colores desde la sección dedicada de marca.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printer" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-500" />
                  <span>Servidor de Impresión Térmica</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Integración ESC/POS para comandas y recibos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-xs font-bold text-foreground">Servidor local de impresión</p>
                      <p className="text-[11px] text-muted-foreground">Driver WebSocket / HTTP ESC/POS</p>
                    </div>
                  </div>
                  <Badge className={isConnected ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'}>
                    {isConnected ? 'Conectado' : 'Esperando servidor'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverUrl" className="text-xs font-semibold">URL del servidor local</Label>
                  <div className="flex gap-2">
                    <Input
                      id="serverUrl"
                      type="text"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://localhost:3001"
                      className="text-xs h-10 rounded-xl"
                    />
                    <Button onClick={handleSavePrinterUrl} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold h-10 px-5 rounded-xl shrink-0">
                      Guardar URL
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button onClick={checkPrinterConnection} disabled={isChecking} variant="outline" className="text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2">
                    {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Probar conexión</span>
                  </Button>
                  <Button onClick={handleTestPrint} disabled={isTesting} variant="outline" className="text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2">
                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                    <span>Imprimir comanda de prueba</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 pt-2">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-1 rounded-2xl border border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <span>Crear usuario</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Alta de admin o waiter para este local.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Nombre completo</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-10 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Email</Label>
                    <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-10 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Contraseña</Label>
                    <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Rol</Label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as StaffRole)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="waiter">Waiter</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                  <Button onClick={handleCreateUser} className="w-full h-10 rounded-xl text-xs font-bold">
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    Crear usuario
                  </Button>
                </CardContent>
              </Card>

              <Card className="xl:col-span-1 rounded-2xl border border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>Reset password</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reestablecé la contraseña de un usuario existente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Email</Label>
                    <Input value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="h-10 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Nueva contraseña</Label>
                    <Input value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="h-10 rounded-xl text-xs" />
                  </div>
                  <Button onClick={handleResetPassword} variant="outline" className="w-full h-10 rounded-xl text-xs font-bold">
                    Actualizar contraseña
                  </Button>
                </CardContent>
              </Card>

              <Card className="xl:col-span-1 rounded-2xl border border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-amber-500" />
                    <span>Usuarios</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Listado local y gestión básica.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {users.length === 0 && (
                    <p className="text-xs text-muted-foreground">Todavía no hay usuarios creados.</p>
                  )}
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        <p className="text-[10px] text-muted-foreground">{u.role} • {new Date(u.createdAt).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
