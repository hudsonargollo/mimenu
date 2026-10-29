import { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Clock,
  CheckCircle,
  Bell,
  AlertCircle,
  Timer,
  DollarSign,
  ChefHat,
  Package,
  Eye,
  Edit,
  BarChart3,
  X,
  Users,
  Plus,
  MessageSquare,
  Store,
  QrCode,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMimenu } from "@/lib/mimenuContext";
import { notificationTriggers } from "@/integrations/whatsapp";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import type { MimenuOrder } from "@/types/mimenu";
import type { OrderStatus, PaymentStatus } from "@/components/StatusBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderCardInfo } from "@/components/OrderCardInfo";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import { fetchAllWaiters, getWaiterName } from "@/lib/waiterUtils";

const Cashier = () => {
  const navigate = useNavigate();
  const {
    venue,
    orders: contextOrders,
    tables,
    cyclingOffers,
    updateOrderStatus,
    createOrder,
  } = useMimenu();

  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MimenuOrder | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [selectedWaiterId, setSelectedWaiterId] = useState<string | null>(
    (() => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("cashier_waiter_filter") || null;
      }
      return null;
    })()
  );
  const [waiters, setWaiters] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Timer tick every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Set page title
  useEffect(() => {
    document.title = `Caja & KDS | ${venue.name}`;
  }, [venue.name]);

  // Persist waiter filter to localStorage
  useEffect(() => {
    if (selectedWaiterId) {
      localStorage.setItem("cashier_waiter_filter", selectedWaiterId);
    } else {
      localStorage.removeItem("cashier_waiter_filter");
    }
  }, [selectedWaiterId]);

  // Load waiters from registry
  useEffect(() => {
    const loadWaiters = async () => {
      const waitersList = await fetchAllWaiters();
      setWaiters(waitersList);
    };
    loadWaiters();
  }, []);

  const handleLogout = () => {
    // No Supabase auth to sign out — just redirect to auth
    navigate("/auth");
  };

  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeWithAMPM = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes}${ampm}`;
  };

  const formatCurrency = (amount: number) => {
    return `${venue.currency} ${Number(amount).toFixed(2)}`;
  };

  // Orders from context — already have items embedded
  const orders = useMemo(() => contextOrders, [contextOrders]);

  // Categorize orders by status
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const inProgressOrders = orders.filter(
    (o) => o.status === "preparing"
  );
  const readyOrders = orders.filter((o) => o.status === "ready" || o.status === "delivered");
  const completedOrders = orders.filter((o) => o.status === "cancelled");

  // Payment breakdown
  const getPaymentBreakdown = (ordersList: MimenuOrder[]) => {
    const pending = ordersList.filter((o) => o.payment_status === "pending").length;
    const confirmed = ordersList.filter((o) => o.payment_status === "paid").length;
    return { pending, confirmed, failed: 0, total: ordersList.length };
  };

  const pendingPaymentBreakdown = getPaymentBreakdown(pendingOrders);
  const inProgressPaymentBreakdown = getPaymentBreakdown(inProgressOrders);
  const readyPaymentBreakdown = getPaymentBreakdown(readyOrders);
  const completedPaymentBreakdown = getPaymentBreakdown(completedOrders);

  // Payment status — no Supabase/MercadoPago integration
  const getPaymentStatus = (order: MimenuOrder) => {
    if (order.payment_status === "paid") {
      return {
        status: "confirmed",
        label: "Pago Confirmado",
        icon: CheckCircle,
        variant: "default" as const,
        timestamp: order.created_at,
      };
    }
    if (order.payment_status === "pending") {
      return {
        status: "pending",
        label: "Sin Pago",
        icon: CreditCard,
        variant: "secondary" as const,
        timestamp: null,
      };
    }
    return {
      status: "no_payment",
      label: "Sin Pago",
      icon: CreditCard,
      variant: "secondary" as const,
      timestamp: null,
    };
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
  };

  const completeOrder = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
  };

  const moveToPreparation = (orderId: string) => {
    updateOrderStatus(orderId, "preparing");
  };

  const markAsReady = (orderId: string) => {
    updateOrderStatus(orderId, "ready");
  };

  // Payment verification stub — Supabase edge functions removed
  const verifyPayment = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order?.payment_status === "paid") {
      toast.success("Pago confirmado!");
      return;
    }
    toast.info("Confirmacion de pago manual requerida. El pago aun no se verifica automaticamente.");
  };

  const confirmPaymentManually = (orderId: string) => {
    updateOrderStatus(orderId, "preparing");
    toast.success("Pago confirmado!");
  };

  const notifyCustomer = (orderId: string) => {
    void notificationTriggers.onOrderReady(orderId);
    toast.success("Cliente notificado por WhatsApp!");
  };

  const openDetails = (order: MimenuOrder) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  return (
    <AdminLayout>
      {/* Payment Confirmation Dialog - disabled (Supabase edge functions removed) */}
      {/* Order Details Dialog */}
      {/* Uniform Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Caja & KDS: {venue.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                {venue.city}
              </span>
              <span className="text-xs text-muted-foreground">
                Gestion de pedidos, ofertas inteligentes y social proof.
              </span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleLogout}
          className="text-xs font-bold"
        >
          Cerrar Sesion
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <Card
          className="border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("pending")}
        >
          <div className="p-4 text-center">
            <Timer className="w-6 h-6 mx-auto mb-1 text-rose-400" />
            <p className="text-xs font-medium text-muted-foreground">Esperando Pago</p>
            <p className="text-2xl font-black text-rose-400">{pendingOrders.length}</p>
          </div>
        </Card>
        <Card
          className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("progress")}
        >
          <div className="p-4 text-center">
            <ChefHat className="w-6 h-6 mx-auto mb-1 text-amber-400" />
            <p className="text-xs font-medium text-muted-foreground">En Preparacion</p>
            <p className="text-2xl font-black text-amber-400">{inProgressOrders.length}</p>
          </div>
        </Card>
        <Card
          className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("ready")}
        >
          <div className="p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
            <p className="text-xs font-medium text-muted-foreground">Listos</p>
            <p className="text-2xl font-black text-emerald-400">{readyOrders.length}</p>
          </div>
        </Card>
        <Card
          className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab("completed")}
        >
          <div className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-purple-400" />
            <p className="text-xs font-medium text-muted-foreground">Finalizados</p>
            <p className="text-2xl font-black text-purple-400">{completedOrders.length}</p>
          </div>
        </Card>
        <Card
          className="border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-card"
          onClick={() => (window.location.href = "/admin/tables")}
        >
          <div className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-blue-400" />
            <p className="text-xs font-medium text-muted-foreground">Mesas Ocupadas</p>
            <p className="text-2xl font-black text-blue-400">
              {tables.filter((t) => t.is_occupied).length} / {tables.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Esperando ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="progress">En Preparacion ({inProgressOrders.length})</TabsTrigger>
          <TabsTrigger value="ready">Listos ({readyOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Finalizados ({completedOrders.length})</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <Timer className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Ningun pedido esperando pago</p>
                <p className="text-sm text-gray-500">
                  Los pedidos apareceran aqui cuando los clientes hagan nuevos pedidos.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingOrders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                return (
                  <Card key={order.id} className="p-3 sm:p-6 shadow-soft">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-xl text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
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

                    <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <OrderCardInfo
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerName={order.customer_name}
                          customerPhone={order.customer_phone}
                          createdAt={order.created_at}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-primary whitespace-nowrap">
                          {formatCurrency(Number(order.total))}
                        </p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(Number(item.price * item.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(order)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
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
                                Estas seguro de cancelar el pedido #{order.order_number}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelOrder(order.id)}
                                className="bg-destructive"
                              >
                                Si, Cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          className="flex-1 min-h-[44px] text-base"
                          onClick={() => verifyPayment(order.id)}
                          disabled={paymentStatus.status === "confirmed"}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          {paymentStatus.status === "confirmed" ? "Pago Confirmado" : "Verificar Pago"}
                        </Button>
                        {paymentStatus.status === "confirmed" && (
                          <Button
                            variant="outline"
                            className="min-h-[44px] text-base"
                            onClick={() => moveToPreparation(order.id)}
                          >
                            <ChefHat className="mr-2 h-4 w-4" />
                            Enviar a Cocina
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

        {/* In Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
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
                        Fallo: <strong className="text-lg">{inProgressPaymentBreakdown.failed}</strong>
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
                <p className="text-lg font-medium text-gray-700 mb-2">Ningun pedido en preparacion</p>
                <p className="text-sm text-gray-500">
                  Los pedidos apareceran aqui cuando sean enviados a la cocina.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inProgressOrders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const elapsed = Math.floor((currentTime - new Date(order.created_at).getTime()) / 60000);
                return (
                  <Card key={order.id} className="p-3 sm:p-6 shadow-soft">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-xl text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
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

                    <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <OrderCardInfo
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerName={order.customer_name}
                          customerPhone={order.customer_phone}
                          createdAt={order.created_at}
                          paymentConfirmedAt={order.payment_status === "paid" ? order.created_at : undefined}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-primary whitespace-nowrap">
                          {formatCurrency(Number(order.total))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {elapsed}m en preparacion
                        </p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(Number(item.price * item.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(order)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
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
                                Estas seguro de cancelar el pedido #{order.order_number}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelOrder(order.id)} className="bg-destructive">
                                Si, Cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {order.payment_status === "paid" && (
                        <Button
                          className="w-full min-h-[44px] text-base"
                          onClick={() => updateOrderStatus(order.id, "preparing")}
                        >
                          <ChefHat className="mr-2 h-4 w-4" />
                          Iniciar Preparacion
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          className="w-full min-h-[44px] text-base"
                          onClick={() => markAsReady(order.id)}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Marcar como Listo
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Ready Tab */}
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
                        Fallo: <strong className="text-lg">{readyPaymentBreakdown.failed}</strong>
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
                <p className="text-lg font-medium text-gray-700 mb-2">Ningun pedido listo</p>
                <p className="text-sm text-gray-500">
                  Los pedidos apareceran aqui cuando la cocina marque como listos.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {readyOrders.map((order) => {
                return (
                  <Card key={order.id} className="p-3 sm:p-6 shadow-soft border-l-4 border-l-green-500">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-xl text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
                      </div>
                      <div className="flex gap-1.5 items-center flex-wrap justify-end">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                          Listo!
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <OrderCardInfo
                          orderId={order.id}
                          orderNumber={order.order_number}
                          customerName={order.customer_name}
                          customerPhone={order.customer_phone}
                          createdAt={order.created_at}
                          readyAt={order.created_at}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-primary whitespace-nowrap">
                          {formatCurrency(Number(order.total))}
                        </p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(Number(item.price * item.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => completeOrder(order.id)}
                          className="flex-1 min-h-[44px] text-base"
                          variant="outline"
                        >
                          <Package className="mr-2 h-4 w-4 text-green-400" />
                          Entregado / Finalizar
                        </Button>
                        {order.customer_phone && (
                          <Button
                            className="flex-1 min-h-[44px] text-base"
                            onClick={() => notifyCustomer(order.id)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Notificar Cliente
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

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
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
                        Fallo: <strong className="text-lg">{completedPaymentBreakdown.failed}</strong>
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
                <p className="text-lg font-medium text-gray-700 mb-2">Ningun pedido finalizado</p>
                <p className="text-sm text-gray-500">
                  Los pedidos apareceran aqui cuando sean finalizados.
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
                          {order.customer_name} {order.customer_phone ? formatPhoneNumber(order.customer_phone) : ""}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Creado: {formatTimestamp(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          Finalizado
                        </Badge>
                        <p className="font-bold text-muted-foreground">
                          {formatCurrency(Number(order.total))}
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
      {selectedOrder && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pedido #{selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{selectedOrder.customer_name || "Cliente"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefono</p>
                <p className="font-medium">{selectedOrder.customer_phone || "Sin telefono"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <StatusBadge
                  orderStatus={selectedOrder.status as OrderStatus}
                  paymentStatus={selectedOrder.payment_status as PaymentStatus}
                  showBoth
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <div className="space-y-1">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(Number(item.price * item.quantity))}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(Number(selectedOrder.total))}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default Cashier;
