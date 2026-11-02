import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  ShoppingBag,
  Search,
  MessageSquare,
  Star,
  Download,
  Calendar,
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  Phone,
  X,
} from "lucide-react";
import { useMimenu } from "@/lib/mimenuContext";
import { CustomerProfile } from "@/types/mimenu";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const CustomerManagement = () => {
  const { customers, orders, venue, updateCustomerNotes, addCustomer, updateCustomer, deleteCustomer } = useMimenu();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");

  // CRUD state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [newCustomer, setNewCustomer] = useState<Omit<CustomerProfile, 'id'>>({
    name: '',
    phone: '',
    total_orders: 0,
    total_spent: 0,
    first_visit_at: new Date().toISOString(),
    last_visit_at: new Date().toISOString(),
    favorite_items: [],
    loyalty_tier: 'Bronce',
    notes: '',
  });

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.loyalty_tier.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  // Overall CRM metrics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((sum, c) => sum + c.total_orders, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
    const vipCount = customers.filter(c => c.loyalty_tier === 'VIP' || c.loyalty_tier === 'Oro').length;

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      vipCount,
    };
  }, [customers]);

  const handleOpenNotes = (cust: CustomerProfile) => {
    setSelectedCustomer(cust);
    setCustomerNotes(cust.notes || "");
    setIsNotesDialogOpen(true);
  };

  const handleSaveNotes = () => {
    if (!selectedCustomer) return;
    updateCustomerNotes(selectedCustomer.id, customerNotes);
    setIsNotesDialogOpen(false);
  };

  const handleOpenOrders = (cust: CustomerProfile) => {
    setSelectedCustomer(cust);
    setIsOrdersDialogOpen(true);
  };

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customer_phone.includes(selectedCustomer.phone) || o.customer_name === selectedCustomer.name);
  }, [orders, selectedCustomer]);

  const handleWhatsAppReengage = (cust: CustomerProfile) => {
    const favItem = cust.favorite_items[0] || 'tu plato favorito';
    const message = `¡Hola ${cust.name}! Te extrañamos en ${venue.name}. Esta noche tenemos una cortesía especial para ti: pide tu ${favItem} y disfruta de la mejor noche en Equipetrol. ¡Te esperamos!`;
    const cleanPhone = cust.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      toast.error('Nombre y teléfono son requeridos');
      return;
    }
    addCustomer({
      ...newCustomer,
      phone: newCustomer.phone.trim(),
      name: newCustomer.name.trim(),
      favorite_items: newCustomer.favorite_items || [],
    });
    setNewCustomer({
      name: '',
      phone: '',
      total_orders: 0,
      total_spent: 0,
      first_visit_at: new Date().toISOString(),
      last_visit_at: new Date().toISOString(),
      favorite_items: [],
      loyalty_tier: 'Bronce',
      notes: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditCustomer = () => {
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, {
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      total_orders: editingCustomer.total_orders,
      total_spent: editingCustomer.total_spent,
      first_visit_at: editingCustomer.first_visit_at,
      last_visit_at: editingCustomer.last_visit_at,
      favorite_items: editingCustomer.favorite_items,
      loyalty_tier: editingCustomer.loyalty_tier,
      notes: editingCustomer.notes,
    });
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    if (!window.confirm('¿Seguro que querés eliminar este cliente?')) return;
    deleteCustomer(id);
  };

  const handleExportCSV = () => {
    const headers = ["Nombre", "WhatsApp", "Total Pedidos", "Total Consumo", "Nivel Fidelidad", "Platos Favoritos", "Última Visita"];
    const rows = customers.map((c) => [
      c.name,
      c.phone,
      c.total_orders.toString(),
      `${venue.currency} ${c.total_spent}`,
      c.loyalty_tier,
      c.favorite_items.join(" | "),
      new Date(c.last_visit_at).toLocaleDateString("es-BO"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${venue.slug || 'mimenu'}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Listado de clientes exportado en CSV");
  };

  const getTierBadge = (tier: CustomerProfile['loyalty_tier']) => {
    const solid = tier === 'VIP';
    const strong = tier === 'Oro';
    return (
      <span
        className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
          solid
            ? 'border-primary bg-primary text-primary-foreground'
            : strong
              ? 'border-foreground/60 text-foreground'
              : 'border-border text-muted-foreground'
        }`}
      >
        {solid && <Star className="h-3 w-3 fill-current" aria-hidden="true" />}
        {tier === 'VIP' ? 'VIP' : tier === 'Oro' ? 'Oro' : tier === 'Plata' ? 'Plata' : 'Bronce'}
      </span>
    );
  };

  const statsItems = [
    { label: 'Total clientes', value: stats.totalCustomers, icon: Users },
    { label: 'Pedidos acumulados', value: stats.totalOrders, icon: ShoppingBag },
    { label: 'Consumo total', value: `${venue.currency} ${stats.totalRevenue}`, icon: TrendingUp },
    { label: 'Clientes VIP & Oro', value: stats.vipCount, icon: Star },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <AdminPageHeader
          index="06"
          eyebrow="Clientes"
          title="CRM y fidelización"
          description={`Base propia de comensales de ${venue.name}. Identificá clientes VIP y reactivalos por WhatsApp.`}
          actions={
            <>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Exportar CSV
              </button>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setNewCustomer({
                    name: '',
                    phone: '',
                    total_orders: 0,
                    total_spent: 0,
                    first_visit_at: new Date().toISOString(),
                    last_visit_at: new Date().toISOString(),
                    favorite_items: [],
                    loyalty_tier: 'Bronce',
                    notes: '',
                  });
                  setIsAddDialogOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-primary/40 bg-primary/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/15"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Agregar cliente
              </button>
            </>
          }
        />

        {/* Metrics band */}
        <div className="grid grid-cols-2 border-l border-t border-border md:grid-cols-4">
          {statsItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border-b border-r border-border p-4 sm:p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{label}</p>
              </div>
              <p className="mt-3 font-display text-2xl leading-none text-foreground tabular-nums sm:text-3xl">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Customer list */}
        <section className="border-b border-border">
          <div className="relative border-b border-border">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, teléfono o nivel (VIP, Oro, Plata)..."
              className="h-12 w-full border-0 bg-transparent pl-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="border-b border-r border-border p-8">
              <p className="font-display text-lg text-foreground">No encontramos clientes con ese filtro</p>
              <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
                Los comensales que realicen pedidos en el menú aparecerán acá automáticamente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    {['Comensal', 'Nivel', 'Visitas', 'Consumo', 'Favoritos', 'Última visita', 'Acciones'].map((head) => (
                      <TableHead
                        key={head}
                        className={`h-10 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground ${
                          head === 'Consumo' || head === 'Acciones' ? 'text-right' : head === 'Visitas' ? 'text-center' : ''
                        }`}
                      >
                        {head}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((cust) => (
                    <TableRow key={cust.id} className="border-b border-border text-xs transition-colors hover:bg-card/60">
                      <TableCell>
                        <p className="font-semibold text-foreground">{cust.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{cust.phone}</p>
                      </TableCell>
                      <TableCell>{getTierBadge(cust.loyalty_tier)}</TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleOpenOrders(cust)}
                          className="border-0 border-b border-transparent bg-transparent p-0 text-[11px] font-semibold text-foreground tabular-nums transition-colors hover:border-current"
                          title="Ver historial de pedidos"
                        >
                          {cust.total_orders} pedidos
                        </button>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground tabular-nums">
                        {venue.currency} {cust.total_spent}
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {cust.favorite_items.slice(0, 2).map((fav, i) => (
                            <span key={i} className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {fav}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {new Date(cust.last_visit_at).toLocaleDateString("es-BO", { day: '2-digit', month: 'short' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => handleOpenNotes(cust)}
                            className="border-0 border-b border-transparent bg-transparent p-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-current hover:text-foreground"
                            title="Ver o editar notas"
                          >
                            Notas
                          </button>
                          <button
                            onClick={() => handleWhatsAppReengage(cust)}
                            className="inline-flex items-center gap-1.5 border-0 border-b border-transparent bg-transparent p-0 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-current"
                            title="Reactivar comensal por WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3" aria-hidden="true" />
                            WhatsApp
                          </button>
                          <button
                            onClick={() => {
                              setEditingCustomer(cust);
                              setNewCustomer({
                                name: cust.name,
                                phone: cust.phone,
                                total_orders: cust.total_orders,
                                total_spent: cust.total_spent,
                                first_visit_at: new Date(cust.first_visit_at).toISOString(),
                                last_visit_at: new Date(cust.last_visit_at).toISOString(),
                                favorite_items: [...cust.favorite_items],
                                loyalty_tier: cust.loyalty_tier,
                                notes: cust.notes || '',
                              });
                              setIsEditDialogOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 border-0 border-b border-transparent bg-transparent p-0 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-current hover:text-primary"
                            title="Editar cliente"
                          >
                            <Pencil className="h-3 w-3" aria-hidden="true" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(cust.id)}
                            className="inline-flex items-center gap-1.5 border-0 border-b border-transparent bg-transparent p-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                            Eliminar
                          </button>
                        </div>
                      </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-md rounded-[4px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-foreground">
              Notas de cliente: {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Preferencias, alergias o solicitudes especiales
            </Label>
            <Input
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="ej. Mesa preferida en terraza, extra picante, cumpleaños en octubre"
              className="h-10 text-xs"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNotesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveNotes} className="bg-foreground font-bold text-background hover:bg-foreground/90">
              Guardar notas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Orders History Dialog */}
      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[4px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg text-foreground">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Historial de {selectedCustomer?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            {customerOrders.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No hay pedidos registrados en la sesión actual.</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="space-y-2 border border-border p-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Comanda #{ord.order_number} · {ord.fulfillment_type === 'dine_in' ? `Mesa ${ord.table_number}` : 'Retiro'}</span>
                      <span className="font-semibold text-foreground tabular-nums">{venue.currency} {ord.total}</span>
                    </div>
                    <div className="space-y-0.5 text-muted-foreground">
                      {ord.items.map((it, idx) => (
                        <p key={idx}>· {it.quantity}x {it.name} ({venue.currency} {it.price * it.quantity})</p>
                      ))}
                    </div>
                    <p className="flex items-center gap-1 border-t border-border/60 pt-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      <span>{new Date(ord.created_at).toLocaleString("es-BO")}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CustomerManagement;
