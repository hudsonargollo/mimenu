import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchWaiterInfo, type WaiterInfo } from '@/lib/waiterUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_confirmed_at: string | null;
  ready_at: string | null;
  waiter_id: string | null;
}

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderDetailsDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [waiterInfo, setWaiterInfo] = useState<WaiterInfo | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    table_number: '',
  });

  useEffect(() => {
    if (order && open) {
      loadOrderItems();
      setFormData({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        table_number: order.table_number,
      });
      setEditing(false);
      
      // Load waiter info if order has a waiter
      if (order.waiter_id) {
        fetchWaiterInfo(order.waiter_id).then(setWaiterInfo);
      } else {
        setWaiterInfo(null);
      }
    }
  }, [order, open]);

  const loadOrderItems = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading order items:', error);
      toast.error('Error al cargar los ítems del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    if (!formData.customer_name || !formData.customer_phone || !formData.table_number) {
      toast.error('Completa todos los campos');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          table_number: formData.table_number,
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('¡Pedido actualizado!');
      setEditing(false);
      onOrderUpdated?.();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('¡Pedido cancelado!');
      setShowCancelDialog(false);
      onOpenChange(false);
      onOrderUpdated?.();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error al cancelar el pedido');
    } finally {
      setCancelling(false);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending_payment: 'Aguardando Pagamento',
      paid: 'Pago',
      in_preparation: 'Preparando',
      ready: 'Listo',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalles del Pedido #{order.order_number}</span>
              {!editing && order.status !== 'completed' && order.status !== 'cancelled' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Información del Cliente</h3>
              
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Cliente</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Teléfono</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-semibold">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="font-semibold">{order.customer_phone}</span>
                  </div>
                  {waiterInfo && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Mesero:</span>
                      <span className="font-semibold">{waiterInfo.full_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold">{getStatusLabel(order.status)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Ítems del Pedido</h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando ítems...</p>
              ) : orderItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ningún ítem encontrado</p>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity} × Bs. {item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        Bs. {(item.quantity * item.unit_price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary text-xl">Bs. {order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Histórico</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="font-medium text-sm">{formatTimestamp(order.created_at)}</span>
                </div>
                {order.payment_confirmed_at && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Pago:</span>
                    <span className="font-medium text-sm text-green-600">{formatTimestamp(order.payment_confirmed_at)}</span>
                  </div>
                )}
                {order.ready_at && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Pronto:</span>
                    <span className="font-medium text-sm text-green-600">{formatTimestamp(order.ready_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      customer_name: order.customer_name,
                      customer_phone: order.customer_phone,
                      table_number: order.table_number,
                    });
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </>
            ) : (
              <>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar Pedido
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancelar Pedido?
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas cancelar el pedido #{order.order_number}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>No, Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {cancelling ? 'Cancelando...' : 'Sí, Cancelar Pedido'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
