import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMimenu } from "@/lib/mimenuContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, QrCode, Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";

const METHOD_LABEL = {
  cash: "Efectivo en caja",
  qr_simple: "QR simple",
  card: "Tarjeta",
} as const;

const METHOD_ICON = {
  cash: Banknote,
  qr_simple: QrCode,
  card: CreditCard,
} as const;

const Payment = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder } = useMimenu();

  const order = orders.find((o) => o.id === orderId) || null;

  useEffect(() => {
    document.title = "Pago del Pedido | MiMenu";
  }, []);

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
  const Icon = METHOD_ICON[order.payment_method];

  const confirmPayment = () => {
    updateOrder(order.id, { payment_status: "paid" });
    toast.success("¡Pago registrado!");
    navigate(`/order-status/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-100 pb-24">
      <div className="bg-gradient-ocean text-white shadow-soft">
        <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 transition-all rounded-lg"
            onClick={() => navigate(`/order-status/${order.id}`)}
            aria-label="Volver al estado del pedido"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider">
            Pago del Pedido
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 sm:p-8 shadow-soft border-2 border-accent rounded-xl">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isPaid
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-yellow-500 to-orange-600"
            }`}>
              {isPaid ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Clock className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pedido #{order.order_number}
            </h2>
            <Badge
              className={isPaid
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200"}
            >
              {isPaid ? "Pagado" : "Pendiente de pago"}
            </Badge>
          </div>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                Método de pago
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {METHOD_LABEL[order.payment_method]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Cliente</span>
              <span className="text-sm font-semibold text-gray-900">{order.customer_name}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-base font-bold text-gray-900">Total a pagar</span>
              <span className="text-2xl font-bold text-primary">Bs {order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {isPaid ? (
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-accent shadow-soft rounded-xl text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-900 mb-1">Pago confirmado</h3>
            <p className="text-green-700">Gracias por tu compra.</p>
          </Card>
        ) : (
          <>
            <Card className="p-6 border-2 border-accent rounded-xl">
              <p className="text-sm text-gray-600 leading-relaxed">
                Acercate a la caja para completar el pago en efectivo, o solicita el QR de pago al
                personal. Cuando el pago esté confirmado, podés marcarlo desde este botón.
              </p>
            </Card>
            <Button
              onClick={confirmPayment}
              className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-foreground font-display uppercase tracking-wider py-7 text-xl shadow-soft rounded-xl"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              CONFIRMAR PAGO
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Payment;
