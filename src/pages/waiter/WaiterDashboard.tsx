import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  ChefHat,
  Clock,
  CreditCard,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminLayout from "@/components/AdminLayout";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus, PaymentStatus } from "@/components/StatusBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMimenu } from "@/lib/mimenuContext";
import { useAuth } from "@/lib/authContext";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import type { MimenuOrder } from "@/types/mimenu";

type PaymentFilter = "all" | "pending" | "paid";

const PAYMENT_FILTER_KEY = "waiter-payment-filter";

const toOrderStatus = (order: MimenuOrder): OrderStatus =>
  order.status as OrderStatus;

const toPaymentStatus = (order: MimenuOrder): PaymentStatus =>
  order.payment_status === "paid" ? "confirmed" : "pending";

const paymentMethodLabel: Record<MimenuOrder["payment_method"], string> = {
  cash: "Efectivo",
  qr_simple: "QR simple",
  card: "Tarjeta",
};

const fulfillmentLabel = (order: MimenuOrder): string => {
  if (order.fulfillment_type === "dine_in") {
    return order.table_number ? `Mesa ${order.table_number}` : "Salón";
  }
  if (order.fulfillment_type === "pickup") return "Para llevar";
  return "Delivery";
};

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const { venue, orders, updateOrder } = useMimenu();

  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>(() => {
    const saved = localStorage.getItem(PAYMENT_FILTER_KEY);
    return saved === "pending" || saved === "paid" ? saved : "all";
  });

  useEffect(() => {
    localStorage.setItem(PAYMENT_FILTER_KEY, paymentFilter);
  }, [paymentFilter]);

  const venueOrders = useMemo(
    () =>
      orders
        .filter((order) => order.venue_id === venue.id)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [orders, venue.id]
  );

  const pendingPaymentCount = venueOrders.filter(
    (order) => order.payment_status === "pending" && order.status !== "cancelled"
  ).length;
  const paidCount = venueOrders.filter(
    (order) => order.payment_status === "paid" && order.status !== "cancelled"
  ).length;
  const openOrders = venueOrders.filter((order) =>
    ["pending", "preparing", "ready"].includes(order.status)
  );
  const readyOrders = venueOrders.filter((order) => order.status === "ready");
  const totalSales = venueOrders
    .filter(
      (order) =>
        order.payment_status === "paid" && order.status !== "cancelled"
    )
    .reduce((sum, order) => sum + order.total, 0);

  const filteredOrders = venueOrders.filter((order) => {
    if (paymentFilter === "all") return true;
    return order.payment_status === paymentFilter;
  });

  const setStatus = (order: MimenuOrder, status: MimenuOrder["status"]) => {
    updateOrder(order.id, { status });
    toast.success(`Pedido #${order.order_number} actualizado`);
  };

  const confirmPayment = (order: MimenuOrder) => {
    updateOrder(order.id, { payment_status: "paid" });
    toast.success(`Pago del pedido #${order.order_number} confirmado`);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-BO", {
      style: "currency",
      currency: venue.currency_code || "BOB",
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderActions = (order: MimenuOrder) => (
    <div className="flex flex-wrap items-center gap-2">
      {order.payment_status === "pending" && order.status !== "cancelled" && (
        <Button
          size="sm"
          variant="outline"
          className="text-green-700 border-green-600 hover:bg-green-50"
          onClick={() => confirmPayment(order)}
        >
          <CreditCard className="w-3.5 h-3.5 mr-1" />
          Cobrar
        </Button>
      )}
      {order.status === "pending" && (
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => setStatus(order, "preparing")}
        >
          <ChefHat className="w-3.5 h-3.5 mr-1" />
          A cocina
        </Button>
      )}
      {order.status === "preparing" && (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setStatus(order, "ready")}
        >
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          Listo
        </Button>
      )}
      {order.status === "ready" && (
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setStatus(order, "delivered")}
        >
          <Package className="w-3.5 h-3.5 mr-1" />
          Entregar
        </Button>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <AdminPageHeader
        index="16"
        eyebrow="Mesero"
        title={user?.name || 'Panel de mesero'}
        description={`${venue.name} · ${venue.city}`}
        actions={
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Cerrar sesión
          </button>
        }
      />

      <section className="mb-7 grid grid-cols-2 divide-x divide-y divide-border border-y border-border xl:grid-cols-4 xl:divide-y-0">
        {[
          { label: "Total de ventas", value: formatCurrency(totalSales), note: `${paidCount} pedidos pagados`, icon: <TrendingUp className="h-3.5 w-3.5" />, tone: "text-foreground" },
          { label: "Pedidos activos", value: String(openOrders.length), note: "en el salón", icon: <ShoppingCart className="h-3.5 w-3.5" />, tone: "text-foreground" },
          { label: "Por cobrar", value: String(pendingPaymentCount), note: "pendientes de pago", icon: <Clock className="h-3.5 w-3.5" />, tone: "text-amber-700" },
          { label: "Listos para entregar", value: String(readyOrders.length), note: "en mostrador", icon: <Package className="h-3.5 w-3.5" />, tone: "text-emerald-700" },
        ].map((cell) => (
          <div key={cell.label} className="flex flex-col justify-between gap-6 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="noir-eyebrow">{cell.label}</span>
              <span className="text-muted-foreground">{cell.icon}</span>
            </div>
            <div>
              <p className={`noir-num font-display text-[1.9rem] leading-none tracking-[-0.03em] ${cell.tone}`}>{cell.value}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{cell.note}</p>
            </div>
          </div>
        ))}
      </section>

      <Card className="border-0 shadow-lg bg-white/95">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-purple-600" />
              Pedidos del salón
            </CardTitle>

            <Tabs
              value={paymentFilter}
              onValueChange={(value) =>
                setPaymentFilter(value as PaymentFilter)
              }
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">
                  Todos ({venueOrders.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Por cobrar ({pendingPaymentCount})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Pagados ({paidCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                No hay pedidos en esta vista
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Creá un pedido desde el menú para empezar a atender.
              </p>
              <Button onClick={() => navigate("/menu")} className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Nuevo pedido
              </Button>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900">
                          Pedido #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer_name || "Cliente"} ·{" "}
                          {formatPhoneNumber(order.customer_phone)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {fulfillmentLabel(order)} ·{" "}
                          {paymentMethodLabel[order.payment_method]}
                        </p>
                      </div>
                      <StatusBadge
                        orderStatus={toOrderStatus(order)}
                        paymentStatus={toPaymentStatus(order)}
                        showBoth
                        compact
                      />
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.item_id}-${index}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    {renderActions(order)}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-gray-900">
                        <div>#{order.order_number}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {fulfillmentLabel(order)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="font-medium">
                          {order.customer_name || "Cliente"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPhoneNumber(order.customer_phone)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {order.items
                            .map((item) => `${item.quantity}x ${item.name}`)
                            .join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          orderStatus={toOrderStatus(order)}
                          paymentStatus={toPaymentStatus(order)}
                          compact
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status === "delivered"
                                ? "bg-gray-100 text-gray-700"
                                : order.status === "ready"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "preparing"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {order.status === "pending"
                            ? "Recibido"
                            : order.status === "preparing"
                              ? "En preparación"
                              : order.status === "ready"
                                ? "Listo"
                                : order.status === "delivered"
                                  ? "Entregado"
                                  : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderActions(order)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default WaiterDashboard;
