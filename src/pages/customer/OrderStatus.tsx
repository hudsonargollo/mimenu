import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMimenu } from "@/lib/mimenuContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Clock, CheckCircle, ChefHat, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import type { MimenuOrder } from "@/types/mimenu";

const STATUS_LABEL: Record<MimenuOrder["status"], string> = {
  pending: "Recibido",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const OrderStatus = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder } = useMimenu();

  const order = orders.find((o) => o.id === orderId) || null;

  useEffect(() => {
    document.title = "Estado del Pedido | MiMenu";
  }, []);

  useEffect(() => {
    if (!orderId) navigate("/");
  }, [orderId, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-600">Pedido no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/menu")}>
          Volver al menú
        </Button>
      </div>
    );
  }

  const isPaid = order.payment_status === "paid";
  const isCancelled = order.status === "cancelled";

  const cancelOrder = () => {
    updateOrder(order.id, { status: "cancelled" });
    toast.success("Pedido cancelado");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-100 pb-24">
      <div className="bg-gradient-ocean text-white shadow-soft">
        <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 transition-all rounded-lg"
            onClick={() => navigate("/menu")}
            aria-label="Volver al Menú"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
            Estado de tu Pedido
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 sm:p-8 shadow-soft border-2 border-accent rounded-xl">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isCancelled
                ? "bg-gradient-to-br from-red-500 to-rose-600"
                : isPaid
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : "bg-gradient-to-br from-yellow-500 to-orange-600"
            }`}>
              {isCancelled ? (
                <XCircle className="w-8 h-8 text-white" />
              ) : isPaid ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Clock className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pedido #{order.order_number}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <ChefHat className="w-3 h-3" />
                {STATUS_LABEL[order.status]}
              </Badge>
              <Badge
                className={isPaid
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"}
              >
                {isPaid ? "Pagado" : "Pendiente de pago"}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Cliente</span>
              <span className="text-sm font-semibold text-gray-900">{order.customer_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Teléfono</span>
              <span className="text-sm font-semibold text-gray-900 font-mono">
                {formatPhoneNumber(order.customer_phone)}
              </span>
            </div>
            {order.table_number && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Mesa</span>
                <span className="text-sm font-semibold text-gray-900">{order.table_number}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Fecha</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(order.created_at).toLocaleString("es-BO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 shadow-soft border-2 border-accent rounded-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ítems del Pedido</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.item_id}-${index}`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-indigo-50 rounded-xl border border-primary/10"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-base">{item.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.quantity}x Bs {item.price.toFixed(2)}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{item.notes}</p>
                  )}
                </div>
                <p className="font-bold text-lg text-primary">
                  Bs {(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-primary/20">
            <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <span className="text-xl font-bold text-white">Total</span>
              <span className="text-3xl font-bold text-white">Bs {order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {!isPaid && !isCancelled && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-accent shadow-soft p-4 z-50">
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={() => navigate(`/payment/${order.id}`)}
                className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-foreground font-display uppercase tracking-wider py-7 text-xl shadow-soft hover:shadow-lg transition-all rounded-xl"
              >
                <CreditCard className="w-6 h-6 mr-2" />
                PAGAR AHORA
              </Button>
            </div>
          </div>
        )}

        {isPaid && !isCancelled && (
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-accent shadow-soft rounded-xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-display uppercase tracking-wider text-green-900 mb-3">
                ¡Pago Confirmado!
              </h3>
              <p className="text-lg font-body text-green-700 leading-relaxed">
                Tu pedido se está preparando. Te avisaremos cuando esté listo.
              </p>
            </div>
          </Card>
        )}

        {!isPaid && !isCancelled && (
          <Button
            variant="ghost"
            className="w-full text-gray-500 hover:text-red-600"
            onClick={cancelOrder}
          >
            Cancelar pedido
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
