import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notificationTriggers } from "@/integrations/whatsapp";
import { useCashierOrders } from "@/hooks/useRealtimeOrders";
import { useNotificationHistory } from "@/hooks/useNotificationHistory";
import { useWhatsAppErrors } from "@/hooks/useWhatsAppErrors";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { RealtimeNotifications, notificationUtils } from "@/components/RealtimeNotifications";
import { ConnectionMonitor, useConnectionMonitor } from "@/components/ConnectionMonitor";
import { NotificationControls } from "@/components/NotificationControls";
import { WhatsAppErrorIndicator } from "@/components/WhatsAppErrorIndicator";
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog";
import { OrderEditDialog } from "@/components/OrderEditDialog";
import { OrderCardInfo } from "@/components/OrderCardInfo";
import { PaymentConfirmationDialog } from "@/components/PaymentConfirmationDialog";
import { CompactOrderCard } from "@/components/CompactOrderCard";
import { GeneratePaymentDialog } from "@/components/GeneratePaymentDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { UniformHeader } from "@/components/UniformHeader";
import AdminLayout from "@/components/AdminLayout";
import type { OrderStatus, PaymentStatus } from "@/components/StatusBadge";
import { fetchAllWaiters, getWaiterName, type WaiterInfo } from "@/lib/waiterUtils";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Clock, CheckCircle, Bell, AlertCircle, Timer, DollarSign, ChefHat, Package, Eye, Edit, BarChart3, X, Users, Plus, MessageSquare, Store } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Order } from "@/integrations/supabase/realtime";

// Order interface is now imported from realtime service

interface OrderWithItems extends Order {
  items?: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

const Cashier = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [selectedWaiterId, setSelectedWaiterId] = useState<string | null>(() => {
    const saved = localStorage.getItem('cashier_waiter_filter');
    return saved || null;
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogData, setPaymentDialogData] = useState<{
    orderId: string;
    status: string;
    message: string;
    canConfirmManually: boolean;
  } | null>(null);

  const [waiters, setWaiters] = useState<WaiterInfo[]>([]);
  
  // Payment generation dialog state
  const [generatePaymentDialogOpen, setGeneratePaymentDialogOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderWithItems | null>(null);
  
  // Load notification history for all orders
  const orderIds = orders.map(o => o.id);
  const { history: notificationHistory, refresh: refreshNotifications } = useNotificationHistory(orderIds);
  
  // Load WhatsApp errors for all orders
  const { errors: whatsappErrors, refresh: refreshErrors } = useWhatsAppErrors(orderIds);
  
  // Track unread messages for all orders
  const { unreadCounts, markAsRead } = useUnreadMessages(orderIds);
  
  // Store status management - disabled for now
  const { isOpen: storeIsOpen, loading: storeStatusLoading, toggleStoreStatus } = { isOpen: true, loading: false, toggleStoreStatus: () => {} };

  // Set page title
  useEffect(() => {
    document.title = "Caja & KDS | MiMenu";
  }, []);

  // Persist waiter filter selection to localStorage
  useEffect(() => {
    if (selectedWaiterId) {
      localStorage.setItem('cashier_waiter_filter', selectedWaiterId);
    } else {
      localStorage.removeItem('cashier_waiter_filter');
    }
  }, [selectedWaiterId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("¡Sesión cerrada!");
    navigate("/auth");
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeWithAMPM = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes}${ampm}`;
  };

  // Real-time order updates
  const handleOrderCreated = useCallback((order: Order) => {
    console.log('New order created:', order);
    
    // Apply waiter filter to real-time updates
    if (selectedWaiterId && order.waiter_id !== selectedWaiterId) {
      console.log('Order filtered out by waiter filter:', order.id);
      return;
    }
    
    // Reload orders to get complete data with items
    loadOrders();
    notificationUtils.newOrder(order.order_number, order.customer_name);
  }, [selectedWaiterId]);

  const handleOrderUpdate = useCallback((order: Order) => {
    console.log('Order updated:', order);
    
    // Apply waiter filter to real-time updates
    if (selectedWaiterId && order.waiter_id !== selectedWaiterId) {
      // If order was previously in the list but now doesn't match filter, remove it
      setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
      return;
    }
    
    // Reload orders to get complete data with items
    loadOrders();
    
    // Show appropriate notification based on status change
    switch (order.status) {
      case 'in_preparation':
        notificationUtils.orderInPreparation(order.order_number, order.customer_name);
        break;
      case 'ready':
        notificationUtils.orderReady(order.order_number, order.customer_name);
        break;
      case 'completed':
        notificationUtils.orderCompleted(order.order_number, order.customer_name);
        break;
    }
  }, [selectedWaiterId]);

  const handlePaymentConfirmed = useCallback((order: Order) => {
    console.log('Payment confirmed for order:', order);
    
    // Apply waiter filter to real-time updates
    if (selectedWaiterId && order.waiter_id !== selectedWaiterId) {
      return;
    }
    
    notificationUtils.paymentConfirmed(order.order_number, order.customer_name);
  }, [selectedWaiterId]);

  const { connectionStatus, reconnect } = useConnectionMonitor();
  
  useCashierOrders({
    onOrderCreated: handleOrderCreated,
    onOrderUpdate: handleOrderUpdate,
    onPaymentConfirmed: handlePaymentConfirmed,
    enabled: true
  });

  const getPaymentStatus = (order: Order) => {
    if (order.payment_confirmed_at) {
      return {
        status: 'confirmed',
        label: 'Pago Confirmado',
        icon: CheckCircle,
        variant: 'default' as const,
        timestamp: order.payment_confirmed_at,
      };
    }
    
    if (order.payment_expires_at && new Date(order.payment_expires_at) < new Date()) {
      return {
        status: 'expired',
        label: 'Pago Expirado',
        icon: AlertCircle,
        variant: 'destructive' as const,
        timestamp: order.payment_expires_at,
      };
    }
    
    if (order.mercadopago_payment_id) {
      return {
        status: 'pending',
        label: 'Esperando Pago QR',
        icon: Timer,
        variant: 'outline' as const,
        timestamp: order.payment_expires_at,
      };
    }
    
    return {
      status: 'no_payment',
      label: 'Sin Pago Generado',
      icon: CreditCard,
      variant: 'secondary' as const,
      timestamp: null,
    };
  };

  useEffect(() => {
    loadOrders();
    // Fetch all waiters to populate cache and dropdown
    loadWaiters();
  }, [selectedWaiterId]); // Re-load orders when filters change

  const loadWaiters = async () => {
    const waitersList = await fetchAllWaiters();
    setWaiters(waitersList);
  };

  const loadOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .is("deleted_at", null) // Only load non-deleted orders
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: ordersData, error } = await query;

      if (error) throw error;
      
      // Load items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from("order_items")
            .select("id, item_name, quantity, unit_price")
            .eq("order_id", order.id)
            .order("created_at", { ascending: true });
          
          return {
            ...order,
            items: items || []
          } as OrderWithItems;
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId: string) => {
    try {
      toast.loading("Verificando pago en MercadoPago...");
      
      // Get order with payment ID
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("mercadopago_payment_id")
        .eq("id", orderId)
        .single();

      if (orderError || !order?.mercadopago_payment_id) {
        toast.dismiss();
        // No payment ID, offer manual confirmation
        setPaymentDialogData({
          orderId,
          status: 'no_payment_id',
          message: 'No se pudo verificar el pago automáticamente. El pedido no tiene un pago asociado.',
          canConfirmManually: true,
        });
        setPaymentDialogOpen(true);
        return;
      }

      // Check payment status with MercadoPago
      const { mercadoPagoService } = await import("@/integrations/mercadopago");
      const paymentStatus = await mercadoPagoService.checkPaymentStatus(order.mercadopago_payment_id);
      
      toast.dismiss();

      if (paymentStatus.status === 'approved') {
        // Payment approved, confirm it automatically
        await confirmPaymentManually(orderId);
        toast.success("✅ ¡Pago verificado y confirmado!");
      } else if (paymentStatus.status === 'pending') {
        // Still pending
        setPaymentDialogData({
          orderId,
          status: 'pending',
          message: 'El pago aún está pendiente en MercadoPago. Espera unos momentos o confirma si el cliente pagó por otro método.',
          canConfirmManually: true,
        });
        setPaymentDialogOpen(true);
      } else {
        // Rejected or other status
        setPaymentDialogData({
          orderId,
          status: paymentStatus.status,
          message: `El pago fue ${paymentStatus.status} en MercadoPago. Verifica si el cliente pagó por otro método.`,
          canConfirmManually: true,
        });
        setPaymentDialogOpen(true);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.dismiss();
      // Error checking, offer manual confirmation
      setPaymentDialogData({
        orderId,
        status: 'error',
        message: 'Error al verificar el pago en MercadoPago. Verifica tu conexión o confirma si el cliente pagó por otro método.',
        canConfirmManually: true,
      });
      setPaymentDialogOpen(true);
    }
  };

  const confirmPaymentManually = async (orderId: string) => {
    try {
      console.log('Confirming payment manually for order:', orderId);
      
      // Get Supabase URL for edge function call
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call centralized payment confirmation edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          source: 'manual',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Payment confirmation failed');
      }

      console.log('Payment confirmed successfully:', result);
      // Show success message
      if (result.notificationSent) {
        toast.success("✅ ¡Pago confirmado! Pedido enviado a la cocina y cliente notificado por WhatsApp.");
      } else {
        toast.success("✅ ¡Pago confirmado! Pedido enviado a la cocina.");
        toast.info("ℹ️ Notificación WhatsApp no fue enviada (puede que ya haya sido enviada anteriormente).");
      }

      // Close payment dialog if open
      setPaymentDialogOpen(false);
      
    } catch (error) {
      console.error("Error confirming payment:", error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`❌ Error al confirmar pago: ${errorMessage}`);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Get current order status for comparison
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      const oldStatus = currentOrder?.status;

      const updateData: { status: string; ready_at?: string } = {
        status: newStatus,
      };

      // Add timestamp for specific status changes
      if (newStatus === 'ready') {
        updateData.ready_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      // Trigger WhatsApp notification based on status change
      await notificationTriggers.onOrderStatusChange(orderId, newStatus, oldStatus);

      const statusLabels: { [key: string]: string } = {
        'in_preparation': 'En Preparación',
        'ready': 'Listo',
        'completed': 'Finalizado',
      };

      toast.success(`Estado del pedido actualizado a: ${statusLabels[newStatus] || newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error al actualizar el estado del pedido");
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "completed",
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("¡Pedido marcado como finalizado!");
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Error al finalizar pedido");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("¡Pedido cancelado!");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Error al cancelar pedido");
    }
  };

  const openEditDialog = (orderId: string) => {
    setEditingOrderId(orderId);
    setIsEditDialogOpen(true);
    markAsRead(orderId);
  };

  const softDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
        })
        .eq("id", orderId);

      if (error) throw error;

      // Remove from local state
      setOrders(orders.filter(o => o.id !== orderId));
      toast.success("Pedido eliminado!");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error al eliminar pedido");
    }
  };

  const notifyCustomer = async (orderId: string) => {
    try {
      // Trigger WhatsApp ready notification
      await notificationTriggers.onOrderReady(orderId);

      const { error } = await supabase
        .from("orders")
        .update({
          notified_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("¡Cliente notificado por WhatsApp!");
    } catch (error) {
      console.error("Error notifying customer:", error);
      toast.error("Error al notificar al cliente");
    }
  };

  const formatCurrency = (amount: number) => {
    return `Bs ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // No payment status filter - show all orders
  const filteredOrders = orders;

  // Calculate order counts based on filtered orders
  // Include both "pending_payment" (customer orders) and "pending" (waiter orders)
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending_payment" || o.status === "pending");
  const inProgressOrders = filteredOrders.filter((o) => o.status === "paid" || o.status === "in_preparation");
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");
  const completedOrders = filteredOrders.filter((o) => o.status === "completed");
  const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelled" || o.status === "expired");

  // Calculate payment status breakdown for each order status
  const getPaymentBreakdown = (ordersList: Order[]) => {
    const pending = ordersList.filter(o => o.payment_status === 'pending').length;
    const confirmed = ordersList.filter(o => o.payment_status === 'confirmed').length;
    const failed = ordersList.filter(o => o.payment_status === 'failed').length;
    return { pending, confirmed, failed, total: ordersList.length };
  };

  const pendingPaymentBreakdown = getPaymentBreakdown(pendingOrders);
  const inProgressPaymentBreakdown = getPaymentBreakdown(inProgressOrders);
  const readyPaymentBreakdown = getPaymentBreakdown(readyOrders);
  const completedPaymentBreakdown = getPaymentBreakdown(completedOrders);

  return (
    <AdminLayout>
      <RealtimeNotifications 
        enabled={true}
        soundEnabled={true}
        showToasts={true}
      />
      <ConnectionMonitor />
      
      {/* Payment Confirmation Dialog */}
      {paymentDialogData && (
        <PaymentConfirmationDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onConfirm={() => confirmPaymentManually(paymentDialogData.orderId)}
          onRetry={() => verifyPayment(paymentDialogData.orderId)}
          paymentStatus={{
            status: paymentDialogData.status,
            message: paymentDialogData.message,
            canConfirmManually: paymentDialogData.canConfirmManually,
          }}
        />
      )}
      {/* Uniform Header */}
      <UniformHeader
        actions={
          <>
            {/* Store Status Switch */}
            <div className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-300">
              <Store className={`h-4 w-4 ${storeIsOpen ? 'text-green-300' : 'text-red-300'}`} />
              <span className="hidden md:inline text-white text-sm font-medium">
                {storeIsOpen ? 'Abierto' : 'Cerrado'}
              </span>
              <Switch
                checked={storeIsOpen}
                onCheckedChange={toggleStoreStatus}
                disabled={storeStatusLoading}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>
            
            <Button
              onClick={() => window.location.href = '/menu'}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Crear Pedido</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/reports'}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Reportes</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/products'}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Package className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </Button>
          </>
        }
        showDiagnostic={true}
        onLogout={handleLogout}
      />

      {/* Enhanced Summary Cards - Now Tab Selectors */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 backdrop-blur-sm overflow-hidden relative ${
              activeTab === 'pending' 
                ? 'border-orange-500 shadow-xl -translate-y-1 bg-gradient-to-br from-orange-500 to-orange-600' 
                : 'border-transparent bg-gradient-to-br from-white to-orange-50/50 hover:border-orange-300'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 transition-opacity duration-300 ${
              activeTab === 'pending' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  activeTab === 'pending' ? 'bg-white/20' : 'group-hover:bg-white/20'
                }`}>
                  <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'pending' ? 'text-white/90' : 'text-gray-600 group-hover:text-white/90'
                  }`}>Esperando</p>
                  <p className={`text-2xl sm:text-3xl font-bold transition-colors ${
                    activeTab === 'pending' ? 'text-white' : 'text-gray-900 group-hover:text-white'
                  }`}>{pendingOrders.length}</p>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors ${
                activeTab === 'pending' ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'
              }`}>
                <div className={`h-2 rounded-full transition-colors ${
                  activeTab === 'pending' ? 'bg-white' : 'bg-orange-500 group-hover:bg-white'
                }`} style={{width: `${Math.min((pendingOrders.length / Math.max(orders.length, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>
          </Card>

          <Card 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 backdrop-blur-sm overflow-hidden relative ${
              activeTab === 'progress' 
                ? 'border-blue-500 shadow-xl -translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'border-transparent bg-gradient-to-br from-white to-blue-50/50 hover:border-blue-300'
            }`}
            onClick={() => setActiveTab('progress')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 transition-opacity duration-300 ${
              activeTab === 'progress' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  activeTab === 'progress' ? 'bg-white/20' : 'group-hover:bg-white/20'
                }`}>
                  <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'progress' ? 'text-white/90' : 'text-gray-600 group-hover:text-white/90'
                  }`}>En Preparación</p>
                  <p className={`text-2xl sm:text-3xl font-bold transition-colors ${
                    activeTab === 'progress' ? 'text-white' : 'text-gray-900 group-hover:text-white'
                  }`}>{inProgressOrders.length}</p>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors ${
                activeTab === 'progress' ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'
              }`}>
                <div className={`h-2 rounded-full transition-colors ${
                  activeTab === 'progress' ? 'bg-white' : 'bg-blue-500 group-hover:bg-white'
                }`} style={{width: `${Math.min((inProgressOrders.length / Math.max(orders.length, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>
          </Card>

          <Card 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 backdrop-blur-sm overflow-hidden relative ${
              activeTab === 'ready' 
                ? 'border-green-500 shadow-xl -translate-y-1 bg-gradient-to-br from-green-500 to-green-600' 
                : 'border-transparent bg-gradient-to-br from-white to-green-50/50 hover:border-green-300'
            }`}
            onClick={() => setActiveTab('ready')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 transition-opacity duration-300 ${
              activeTab === 'ready' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  activeTab === 'ready' ? 'bg-white/20' : 'group-hover:bg-white/20'
                }`}>
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'ready' ? 'text-white/90' : 'text-gray-600 group-hover:text-white/90'
                  }`}>Listos</p>
                  <p className={`text-2xl sm:text-3xl font-bold transition-colors ${
                    activeTab === 'ready' ? 'text-white' : 'text-gray-900 group-hover:text-white'
                  }`}>{readyOrders.length}</p>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors ${
                activeTab === 'ready' ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'
              }`}>
                <div className={`h-2 rounded-full transition-colors ${
                  activeTab === 'ready' ? 'bg-white' : 'bg-green-500 group-hover:bg-white'
                }`} style={{width: `${Math.min((readyOrders.length / Math.max(orders.length, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>
          </Card>

          <Card 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 backdrop-blur-sm overflow-hidden relative ${
              activeTab === 'completed' 
                ? 'border-purple-500 shadow-xl -translate-y-1 bg-gradient-to-br from-primary/50 to-primary' 
                : 'border-transparent bg-gradient-to-br from-white to-purple-50/50 hover:border-primary/30'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-primary/50 to-primary transition-opacity duration-300 ${
              activeTab === 'completed' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/50 to-primary rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  activeTab === 'completed' ? 'bg-white/20' : 'group-hover:bg-white/20'
                }`}>
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'completed' ? 'text-white/90' : 'text-gray-600 group-hover:text-white/90'
                  }`}>Finalizados</p>
                  <p className={`text-2xl sm:text-3xl font-bold transition-colors ${
                    activeTab === 'completed' ? 'text-white' : 'text-gray-900 group-hover:text-white'
                  }`}>{completedOrders.length}</p>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors ${
                activeTab === 'completed' ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'
              }`}>
                <div className={`h-2 rounded-full transition-colors ${
                  activeTab === 'completed' ? 'bg-white' : 'bg-primary/50 group-hover:bg-white'
                }`} style={{width: `${Math.min((completedOrders.length / Math.max(orders.length, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>
          </Card>

          <Card 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 backdrop-blur-sm overflow-hidden relative ${
              activeTab === 'cancelled' 
                ? 'border-red-500 shadow-xl -translate-y-1 bg-gradient-to-br from-red-500 to-red-600' 
                : 'border-transparent bg-gradient-to-br from-white to-red-50/50 hover:border-red-300'
            }`}
            onClick={() => setActiveTab('cancelled')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 transition-opacity duration-300 ${
              activeTab === 'cancelled' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  activeTab === 'cancelled' ? 'bg-white/20' : 'group-hover:bg-white/20'
                }`}>
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'cancelled' ? 'text-white/90' : 'text-gray-600 group-hover:text-white/90'
                  }`}>Cancelados</p>
                  <p className={`text-2xl sm:text-3xl font-bold transition-colors ${
                    activeTab === 'cancelled' ? 'text-white' : 'text-gray-900 group-hover:text-white'
                  }`}>{cancelledOrders.length}</p>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors ${
                activeTab === 'cancelled' ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'
              }`}>
                <div className={`h-2 rounded-full transition-colors ${
                  activeTab === 'cancelled' ? 'bg-white' : 'bg-red-500 group-hover:bg-white'
                }`} style={{width: `${Math.min((cancelledOrders.length / Math.max(orders.length, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>
          </Card>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <Timer className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Ningún pedido esperando pago</p>
                <p className="text-sm text-gray-500">
                  Los pedidos aparecerán aquí cuando los clientes hagan nuevos pedidos
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingOrders.map((order) => {
              const paymentStatus = getPaymentStatus(order);
              const PaymentIcon = paymentStatus.icon;
              
              return (
                <Card key={order.id} className="p-3 sm:p-6 shadow-soft">
                    {/* Order Number + Status Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-xl text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
                        {(unreadCounts.get(order.id) || 0) > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 px-1.5 text-xs font-semibold animate-pulse"
                            title={`${unreadCounts.get(order.id)} mensaje${(unreadCounts.get(order.id) || 0) > 1 ? 's' : ''} no leído${(unreadCounts.get(order.id) || 0) > 1 ? 's' : ''}`}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {unreadCounts.get(order.id)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1.5 items-center flex-wrap justify-end">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs px-2 py-1 whitespace-nowrap">
                          Creado: {formatTimeWithAMPM(order.created_at)}
                        </Badge>
                        <StatusBadge 
                          orderStatus={order.status as OrderStatus}
                          paymentStatus={order.payment_status as PaymentStatus}
                          showBoth={false}
                          compact={true}
                        />
                      </div>
                    </div>
                    
                    {/* Customer Info + Total/Expiration */}
                    <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <OrderCardInfo
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerName={order.customer_name}
                          customerPhone={order.customer_phone}
                          waiterId={order.waiter_id}
                          createdAt={order.created_at}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-primary whitespace-nowrap">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                        {paymentStatus.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                            {paymentStatus.status === 'pending' ? 'Expira' : 'Pagado'}<br/>
                            {formatTimestamp(paymentStatus.timestamp)?.split(' ')[1]}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">📋 Ítems:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {item.quantity}x {item.item_name}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(Number(item.unit_price * item.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="border-t pt-3 space-y-2">
                      {/* Edit and Cancel Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(order.id)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 text-destructive hover:bg-destructive hover:text-white">
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de cancelar el pedido #{order.order_number}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelOrder(order.id)} className="bg-destructive">
                                Sí, Cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Payment Verification Button - Only for customer orders (no waiter_id) */}
                      {!order.waiter_id && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            className="flex-1 min-h-[44px] text-base"
                            onClick={() => verifyPayment(order.id)}
                            disabled={paymentStatus.status === 'confirmed'}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            {paymentStatus.status === 'confirmed' ? 'Pago Confirmado' : 'Verificar Pago'}
                          </Button>
                          {paymentStatus.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              className="min-h-[44px] text-base"
                              onClick={() => updateOrderStatus(order.id, 'in_preparation')}
                            >
                              <ChefHat className="mr-2 h-4 w-4" />
                              Enviar a Cocina
                            </Button>
                          )}
                        </div>
                      )}
                      {/* Waiter/Cashier orders - Generate Payment Button */}
                      {(order.waiter_id || (order as any).created_by_cashier) && order.payment_status === 'pending' && !order.mercadopago_payment_id && (
                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 min-h-[44px]"
                          onClick={() => {
                            setSelectedOrderForPayment(order);
                            setGeneratePaymentDialogOpen(true);
                          }}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Generar Pago (QR PAGO o Tarjeta)
                        </Button>
                      )}
                      {/* Waiter orders note */}
                      {order.waiter_id && order.mercadopago_payment_id && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-900 font-medium">
                            ✅ Pago generado - Esperando confirmación
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
              );
            })}
              </div>
            )
          }
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
            {/* Payment Status Summary */}
            {inProgressOrders.length > 0 && (
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-white">Estado de Pago</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-white font-medium">
                        Pendiente: <strong className="text-lg">{inProgressPaymentBreakdown.pending}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-white font-medium">
                        Confirmado: <strong className="text-lg">{inProgressPaymentBreakdown.confirmed}</strong>
                      </span>
                    </div>
                    {inProgressPaymentBreakdown.failed > 0 && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <span className="text-white font-medium">
                          Falló: <strong className="text-lg">{inProgressPaymentBreakdown.failed}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            {inProgressOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Ningún pedido en preparación</p>
                  <p className="text-sm text-gray-500">
                    Los pedidos aparecerán aquí cuando sean enviados a la cocina
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inProgressOrders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const PaymentIcon = paymentStatus.icon;
                const orderNotificationHistory = notificationHistory.get(order.id);
                const orderErrors = whatsappErrors.get(order.id) || [];
                
                return (
                  <Card key={order.id} className="p-3 sm:p-6 shadow-soft">
                    {/* Order Number + Status Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-xl text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
                        {(unreadCounts.get(order.id) || 0) > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 px-1.5 text-xs font-semibold animate-pulse"
                            title={`${unreadCounts.get(order.id)} mensaje${(unreadCounts.get(order.id) || 0) > 1 ? 's' : ''} no leído${(unreadCounts.get(order.id) || 0) > 1 ? 's' : ''}`}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {unreadCounts.get(order.id)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1.5 items-center flex-wrap justify-end">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs px-2 py-1 whitespace-nowrap">
                          Creado: {formatTimeWithAMPM(order.created_at)}
                        </Badge>
                        <StatusBadge 
                          orderStatus={order.status as OrderStatus}
                          paymentStatus={order.payment_status as PaymentStatus}
                          showBoth={false}
                          compact={true}
                        />
                      </div>
                    </div>
                    
                    {/* Customer Info + Total */}
                    <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <OrderCardInfo
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerName={order.customer_name}
                          customerPhone={order.customer_phone}
                          waiterId={order.waiter_id}
                          createdAt={order.created_at}
                          paymentConfirmedAt={order.payment_confirmed_at}
                          kitchenNotifiedAt={order.kitchen_notified_at}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-primary whitespace-nowrap">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">📋 Ítems:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {item.quantity}x {item.item_name}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(Number(item.unit_price * item.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* WhatsApp Error Indicator */}
                    {orderErrors.length > 0 && (
                      <div className="mb-3">
                        <WhatsAppErrorIndicator errors={orderErrors} orderId={order.id} />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="border-t pt-3 space-y-2">
                      {/* Edit and Cancel Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(order.id)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 text-destructive hover:bg-destructive hover:text-white">
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de cancelar el pedido #{order.order_number}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelOrder(order.id)} className="bg-destructive">
                                Sí, Cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Notification Controls */}
                      <div className="border-t pt-2">
                        <NotificationControls
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerPhone={order.customer_phone}
                          customerName={order.customer_name}
                          orderStatus={order.status}
                          notificationHistory={orderNotificationHistory}
                          onNotificationSent={refreshNotifications}
                        />
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {order.status === 'paid' && (
                          <Button
                            className="flex-1 min-h-[44px] text-base"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'in_preparation')}
                          >
                            <ChefHat className="mr-2 h-4 w-4" />
                            Iniciar Preparación
                          </Button>
                        )}
                        {order.status === 'in_preparation' && (
                          <Button
                            className="flex-1 min-h-[44px] text-base"
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Marcar como Listo
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              </div>
            )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
            {readyOrders.length > 0 && (
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-white">Estado de Pago</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-white font-medium">
                        Pendiente: <strong className="text-lg">{readyPaymentBreakdown.pending}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-white font-medium">
                        Confirmado: <strong className="text-lg">{readyPaymentBreakdown.confirmed}</strong>
                      </span>
                    </div>
                    {readyPaymentBreakdown.failed > 0 && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <span className="text-white font-medium">
                          Falló: <strong className="text-lg">{readyPaymentBreakdown.failed}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            {readyOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <Package className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Ningún pedido listo</p>
                  <p className="text-sm text-gray-500">
                    Los pedidos aparecerán aquí cuando la cocina marque como listos
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {readyOrders.map((order) => {
                const orderNotificationHistory = notificationHistory.get(order.id);
                const orderErrors = whatsappErrors.get(order.id) || [];
                
                return (
                  <Card key={order.id} className="p-3 sm:p-6 shadow-soft border-l-4 border-l-green-500">
                    {/* Order Number + Status Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-xl text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
                        {(unreadCounts.get(order.id) || 0) > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 px-1.5 text-xs font-semibold animate-pulse"
                            title={`${unreadCounts.get(order.id)} mensaje${(unreadCounts.get(order.id) || 0) > 1 ? 's' : ''} no leído${(unreadCounts.get(order.id) || 0) > 1 ? 's' : ''}`}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {unreadCounts.get(order.id)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1.5 items-center flex-wrap justify-end">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs px-2 py-1 whitespace-nowrap">
                          Creado: {formatTimeWithAMPM(order.created_at)}
                        </Badge>
                        <StatusBadge 
                          orderStatus={order.status as OrderStatus}
                          paymentStatus={order.payment_status as PaymentStatus}
                          showBoth={false}
                          compact={true}
                        />
                      </div>
                    </div>
                    
                    {/* Customer Info + Total */}
                    <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <OrderCardInfo
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerName={order.customer_name}
                          customerPhone={order.customer_phone}
                          waiterId={order.waiter_id}
                          createdAt={order.created_at}
                          paymentConfirmedAt={order.payment_confirmed_at}
                          readyAt={order.ready_at}
                        />
                        {order.notified_at && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                            Cliente notificado: {formatTimestamp(order.notified_at)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-primary whitespace-nowrap">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">📋 Ítems:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {item.quantity}x {item.item_name}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(Number(item.unit_price * item.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* WhatsApp Error Indicator */}
                    {orderErrors.length > 0 && (
                      <div className="mb-3">
                        <WhatsAppErrorIndicator errors={orderErrors} orderId={order.id} />
                      </div>
                    )}
                    
                    {/* View Details Button */}
                    <div className="border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsDialogOpen(true);
                        }}
                        className="w-full"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </Card>
                );
              })}
              </div>
            )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
            {/* Payment Status Summary */}
            {completedOrders.length > 0 && (
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/50 to-primary border-0 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-white">Estado de Pago</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-white font-medium">
                        Pendiente: <strong className="text-lg">{completedPaymentBreakdown.pending}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-white font-medium">
                        Confirmado: <strong className="text-lg">{completedPaymentBreakdown.confirmed}</strong>
                      </span>
                    </div>
                    {completedPaymentBreakdown.failed > 0 && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <span className="text-white font-medium">
                          Falló: <strong className="text-lg">{completedPaymentBreakdown.failed}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            {completedOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Ningún pedido finalizado</p>
                  <p className="text-sm text-gray-500">
                    Los pedidos aparecerán aquí cuando sean finalizados
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedOrders.map((order) => {
                return (
                  <Card key={order.id} className="p-4 shadow-soft border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Pedido #{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name} • {formatPhoneNumber(order.customer_phone)}
                        </p>
                        {order.waiter_id && (
                          <p className="text-sm text-muted-foreground">
                            👤 Camarero: <span className="font-medium">{getWaiterName(order.waiter_id)}</span>
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Creado: {formatTimestamp(order.created_at)}
                          </p>
                          {order.cancelled_at && (
                            <p className="text-xs text-muted-foreground">
                              Cancelado: {formatTimestamp(order.cancelled_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-2">
                          <AlertCircle className="mr-1 h-3 w-3" /> {order.status === 'expired' ? 'Expirado' : 'Cancelado'}
                        </Badge>
                        <p className="font-bold text-muted-foreground">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
              </div>
            )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
            {cancelledOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Ningún pedido cancelado</p>
                  <p className="text-sm text-gray-500">
                    Los pedidos cancelados aparecerán aquí
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cancelledOrders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const PaymentIcon = paymentStatus.icon;
                
                return (
                  <Card key={order.id} className="p-4 shadow-soft border-l-4 border-l-destructive opacity-60">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Pedido #{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name} • {formatPhoneNumber(order.customer_phone)}
                        </p>
                        {order.waiter_id && (
                          <p className="text-sm text-muted-foreground">
                            👤 Camarero: <span className="font-medium">{getWaiterName(order.waiter_id)}</span>
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Creado: {formatTimestamp(order.created_at)}
                          </p>
                          {order.cancelled_at && (
                            <p className="text-xs text-muted-foreground">
                              Cancelado: {formatTimestamp(order.cancelled_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-2">
                          <AlertCircle className="mr-1 h-3 w-3" /> {order.status === 'expired' ? 'Expirado' : 'Cancelado'}
                        </Badge>
                        <p className="font-bold text-muted-foreground">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
              </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onOrderUpdated={loadOrders}
      />

      {/* Generate Payment Dialog */}
      {selectedOrderForPayment && (
        <GeneratePaymentDialog
          isOpen={generatePaymentDialogOpen}
          onClose={() => {
            setGeneratePaymentDialogOpen(false);
            setSelectedOrderForPayment(null);
          }}
          orderId={selectedOrderForPayment.id}
          orderNumber={selectedOrderForPayment.order_number}
          amount={selectedOrderForPayment.total_amount}
          customerName={selectedOrderForPayment.customer_name}
          customerPhone={selectedOrderForPayment.customer_phone}
          onPaymentComplete={() => {
            loadOrders();
            toast.success('Pago generado con éxito!');
          }}
        />
      )}

      {/* Order Edit Dialog */}
      <OrderEditDialog
        orderId={editingOrderId}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingOrderId(null);
          }
        }}
        onOrderUpdated={loadOrders}
      />
    </AdminLayout>
  );
};

export default Cashier;