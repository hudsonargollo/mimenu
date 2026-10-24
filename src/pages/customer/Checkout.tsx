import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  UtensilsCrossed, 
  ShoppingBag, 
  QrCode, 
  CreditCard, 
  Banknote,
  Clock,
  Sparkles,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cartContext";
import { useMimenu } from "@/lib/mimenuContext";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { venue, selectedTable, fulfillmentType, setFulfillmentType, setSelectedTable, createOrder } = useMimenu();
  const { state: cartState, clearCart, addItem, removeItem } = useCart();
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'qr_simple' | 'cash' | 'card'>('qr_simple');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");

  useEffect(() => {
    document.title = `Finalizar Pedido — ${venue.name} Santa Cruz`;
  }, [venue.name]);

  const totalAmount = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartState.items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }

    if (fulfillmentType === 'dine_in' && !selectedTable) {
      toast.error("Por favor selecciona tu número de mesa");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = createOrder({
        venue_id: venue.id,
        fulfillment_type: fulfillmentType,
        table_number: fulfillmentType === 'dine_in' ? (selectedTable || '1') : undefined,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || '+591 70000000',
        items: cartState.items.map(item => ({
          item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: orderNotes || undefined,
        })),
        subtotal: totalAmount,
        discount: 0,
        total: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'qr_simple' ? 'paid' : 'pending',
      });

      setCreatedOrderNumber(order.order_number);
      setIsSuccess(true);
      clearCart();
      toast.success("¡Pedido enviado a la cocina con éxito!");

    } catch (err) {
      console.error('Error creating order:', err);
      toast.error("Error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border-2 border-emerald-500/40 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              ¡Pedido Confirmado!
            </span>
            <h1 className="text-3xl font-black text-foreground">
              {createdOrderNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              {fulfillmentType === 'dine_in'
                ? `Enviado a la cocina para la Mesa ${selectedTable || '1'}`
                : 'En preparación para Retiro en Barra'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-bold">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lugar:</span>
              <span className="font-bold">{venue.name} SCZ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pagado:</span>
              <span className="font-black text-amber-500">{venue.currency} {totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método:</span>
              <span className="font-bold uppercase">{paymentMethod.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => navigate('/menu')}
              className="w-full bg-primary text-primary-foreground font-bold text-xs h-11 rounded-xl shadow-md"
            >
              Pedir Más Cosas
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full text-xs h-11 rounded-xl"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-xl"
              onClick={() => navigate("/menu")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-black uppercase tracking-tight">Tu Pedido • {venue.name}</h1>
              <p className="text-xs text-white/80">Santa Cruz de la Sierra</p>
            </div>
          </div>

          <span className="text-xs font-black bg-black/30 px-2.5 py-1 rounded-full border border-white/20">
            {fulfillmentType === 'dine_in' ? `Mesa ${selectedTable || '1'}` : 'Retiro en Barra'}
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Order Form */}
        <form onSubmit={handleCreateOrder} className="md:col-span-7 space-y-6">
          
          {/* Fulfillment Mode */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
            <label className="text-xs font-black text-foreground uppercase tracking-wider block">
              1. Tipo de Entrega
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfillmentType('dine_in')}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                  fulfillmentType === 'dine_in'
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold leading-none">En Mesa</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Mesa {selectedTable || '1'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold leading-none">Para Llevar / Barra</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Retiras en caja</p>
                </div>
              </button>
            </div>

            {fulfillmentType === 'dine_in' && (
              <div className="pt-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Número de Mesa:</Label>
                <Input
                  value={selectedTable || ""}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  placeholder="Ej. 4, 12, VIP 1"
                  className="text-xs h-9"
                  required
                />
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
            <label className="text-xs font-black text-foreground uppercase tracking-wider block">
              2. Tus Datos
            </label>
            <div className="space-y-2.5">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">¿A nombre de quién sale el pedido?</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Fernando Aguilera"
                  className="text-xs h-10"
                  required
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Celular / WhatsApp (opcional para aviso):</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+591 78000000"
                  className="text-xs h-10"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Notas para cocina / barra (opcional):</Label>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej. Salchipapa con salsa de ajo extra, trago con bastante hielo..."
                  className="text-xs min-h-[70px]"
                />
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
            <label className="text-xs font-black text-foreground uppercase tracking-wider block">
              3. Método de Pago en Bolivia
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('qr_simple')}
                className={`p-3 rounded-xl border-2 text-center flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'qr_simple'
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-bold">QR Simple / Banco</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border-2 text-center flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-500" />
                <span className="text-[11px] font-bold">Efectivo en Bs.</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border-2 text-center flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span className="text-[11px] font-bold">Tarjeta POS</span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || cartState.items.length === 0}
            className="w-full bg-gradient-to-r from-amber-500 via-red-600 to-amber-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-sm h-14 rounded-2xl shadow-xl hover:scale-[1.01] transition-all"
          >
            {isSubmitting ? 'Enviando a Cocina...' : `Confirmar Pedido • ${venue.currency} ${totalAmount}`}
          </Button>
        </form>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-md space-y-3 sticky top-20">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Resumen ({cartState.items.length} ítems)</span>
              <button
                onClick={clearCart}
                className="text-[11px] text-red-500 hover:underline font-normal flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Vaciar
              </button>
            </h3>

            {/* Item list */}
            <div className="divide-y divide-border/60 max-h-80 overflow-y-auto pr-1">
              {cartState.items.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">Tu carrito está vacío</p>
              ) : (
                cartState.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{venue.currency} {item.price} c/u</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[55px]">
                      <span className="text-xs font-black text-amber-500">
                        {venue.currency} {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total breakdown */}
            <div className="pt-3 border-t border-border space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span>{venue.currency} {totalAmount}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-500 font-medium">
                <span>Servicio digital MIMENU</span>
                <span>¡Gratis!</span>
              </div>
              <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border/60">
                <span>Total a Pagar</span>
                <span className="text-xl text-amber-500">{venue.currency} {totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
