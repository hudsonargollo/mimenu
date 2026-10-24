import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  QrCode, 
  Banknote, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Share2,
  ArrowRight,
  Star,
  MapPin,
  UtensilsCrossed,
  Truck
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useMimenu } from '@/lib/mimenuContext';
import { GoogleReviewHunterModal } from '@/components/GoogleReviewHunterModal';
import { toast } from 'sonner';
import { useLang } from '@/i18n/LanguageProvider';
import { pickLocalText } from '@/lib/venueContext';

interface CartDrawerExpressProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawerExpress: React.FC<CartDrawerExpressProps> = ({
  isOpen,
  onClose,
}) => {
  const { state: cartState, addItem, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { venue, selectedTable, fulfillmentType, setFulfillmentType, setSelectedTable, createOrder, getContextualUpsells } = useMimenu();
  const { lang } = useLang();
  const venueName = pickLocalText(venue.name_i18n, lang) || venue.name;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr_simple' | 'cash' | 'card'>('qr_simple');
  const [selectedTip, setSelectedTip] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const subtotal = getTotalPrice();
  const deliveryFee = fulfillmentType === 'delivery' ? 10 : 0;
  const grandTotal = subtotal + selectedTip + deliveryFee;

  // Dynamic Contextual Upsells Engine
  const cartItemIds = useMemo(() => cartState.items.map(i => i.id), [cartState.items]);
  const dynamicUpsells = useMemo(() => getContextualUpsells(cartItemIds), [getContextualUpsells, cartItemIds]);

  const handleAddUpsell = (item: { id: string; name: string; price: number }) => {
    addItem({
      id: item.id,
      name: item.name,
      description: 'Maridaje sugerido',
      price: item.price,
      category_id: 'cat-addons',
      available: true,
    });
    toast.success(`Agregaste ${item.name} (+${venue.currency} ${item.price})`);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartState.items.length === 0) {
      toast.error('Tu pedido está vacío');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Por favor ingresa tu dirección de entrega');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const order = createOrder({
          venue_id: venue.id,
          fulfillment_type: fulfillmentType,
          table_number: fulfillmentType === 'dine_in' ? (selectedTable || '1') : undefined,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim() || '+591 70000000',
          delivery_address: fulfillmentType === 'delivery' ? deliveryAddress.trim() : undefined,
          delivery_reference: fulfillmentType === 'delivery' ? deliveryReference.trim() : undefined,
          delivery_fee: deliveryFee,
          tip_amount: selectedTip,
          items: cartState.items.map(i => ({
            item_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            notes: orderNotes || undefined,
          })),
          subtotal,
          discount: 0,
          total: grandTotal,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'qr_simple' ? 'paid' : 'pending',
        });

        setConfirmedOrder(order);
        clearCart();
        toast.success(`¡Pedido #${order.order_number} enviado a cocina!`);
      } catch (err) {
        console.error(err);
        toast.error('Error al procesar el pedido');
      } finally {
        setIsSubmitting(false);
      }
    }, 400);
  };

  const getWhatsAppTicketText = () => {
    if (!confirmedOrder) return '';
    const destination = fulfillmentType === 'dine_in'
      ? `Mesa ${selectedTable || '1'}`
      : fulfillmentType === 'pickup'
      ? 'Retiro en Barra'
      : `Delivery: ${deliveryAddress} (Ref: ${deliveryReference || 'S/R'})`;

    const itemsList = confirmedOrder.items.map((i: any) => `• ${i.quantity}x ${i.name} (Bs. ${i.price * i.quantity})`).join('\n');
    return `*${venueName.toUpperCase()} — PEDIDO #${confirmedOrder.order_number}*\nTipo: ${fulfillmentType.toUpperCase()}\nDestino: ${destination}\nCliente: ${confirmedOrder.customer_name} (${confirmedOrder.customer_phone})\n\n*DETALLE:*\n${itemsList}\n\nSubtotal: Bs. ${confirmedOrder.subtotal}\n${deliveryFee > 0 ? `Envío Delivery: Bs. ${deliveryFee}\n` : ''}Propina: Bs. ${selectedTip}\n*TOTAL:* Bs. ${confirmedOrder.total}\nMétodo: ${paymentMethod.replace('_', ' ').toUpperCase()}\n\n_Enviado desde MIMENU Santa Cruz_`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getWhatsAppTicketText());
    window.open(`https://wa.me/${venue.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold tracking-tight text-white">
                {confirmedOrder ? 'Pedido Confirmado' : `Tu Comanda • ${venueName}`}
              </DialogTitle>
              <p className="text-[11px] text-slate-400 font-medium">
                {fulfillmentType === 'dine_in' ? `Mesa ${selectedTable || '1'}` : fulfillmentType === 'pickup' ? 'Retiro en Barra' : 'Delivery Directo'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar comanda"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {confirmedOrder ? (
            /* Order Success View */
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Comanda #{confirmedOrder.order_number}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  En preparación en cocina
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Tu comanda fue registrada con éxito. Tiempo estimado: 10-15 min.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-left space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Destino:</span>
                  <span className="font-semibold text-foreground">
                    {fulfillmentType === 'dine_in' ? `Mesa ${selectedTable || '1'}` : fulfillmentType === 'pickup' ? 'Retiro en Barra' : `Delivery: ${deliveryAddress}`}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-amber-500 tabular-nums">{venue.currency} {confirmedOrder.total}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-semibold uppercase text-foreground">{paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {paymentMethod === 'qr_simple' && (
                  <Button
                    onClick={() => setShowQrModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                    <span>Ver QR Simple de Pago</span>
                  </Button>
                )}

                <Button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-11 rounded-xl shadow-xs flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-white" aria-hidden="true" />
                  <span>Calificar Experiencia en Google Maps</span>
                </Button>

                <Button
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl shadow-xs flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  <span>Compartir Comanda por WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                  }}
                  className="text-xs h-10 rounded-xl"
                >
                  Cerrar & Seguir en el Menú
                </Button>
              </div>
            </div>
          ) : (
            /* Cart & Express Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Fulfillment Type Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/40 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('dine_in')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    fulfillmentType === 'dine_in'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    fulfillmentType === 'pickup'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Retiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    fulfillmentType === 'delivery'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Delivery</span>
                </button>
              </div>

              {/* Item List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Platos y Bebidas ({getTotalItems()})</span>
                  {cartState.items.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] text-rose-500 hover:underline font-normal flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" /> Vaciar
                    </button>
                  )}
                </div>

                {cartState.items.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed border-border text-muted-foreground">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" aria-hidden="true" />
                    <p className="text-xs font-semibold">Tu comanda está vacía</p>
                    <p className="text-[11px] mt-0.5">Elige platos o bebidas de la carta para empezar.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 bg-muted/20 rounded-xl p-2 border border-border/70 max-h-48 overflow-y-auto">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="py-2 px-1 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{pickLocalText(item.name_i18n, lang) || item.name}</p>
                          <p className="text-[10px] text-amber-500 font-bold tabular-nums">{venue.currency} {item.price}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Quitar una unidad de ${item.name}`}
                            className="w-6 h-6 rounded-md bg-background hover:bg-muted text-foreground flex items-center justify-center border border-border"
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addItem(item)}
                            aria-label={`Agregar una unidad de ${item.name}`}
                            className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="text-right min-w-[50px] shrink-0">
                          <span className="text-xs font-bold text-foreground tabular-nums">
                            {venue.currency} {item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Contextual Upsells */}
              {cartState.items.length > 0 && dynamicUpsells.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sugerencias para tu comanda</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {dynamicUpsells.map((up) => (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => handleAddUpsell(up)}
                        className="p-2 rounded-lg bg-background border border-border hover:border-amber-500 text-left transition-all shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block leading-none">MARIDAJE</span>
                          <p className="text-[10px] font-semibold text-foreground truncate mt-1">{up.name}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border/40">
                          <span className="text-[10px] font-bold text-amber-500 tabular-nums">+{venue.currency}{up.price}</span>
                          <Plus className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info & Destination Fields */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Tu Nombre *</label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Lucas Argollo"
                      className="text-xs h-9 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">WhatsApp / Teléfono *</label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+591 78012345"
                      className="text-xs h-9 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {fulfillmentType === 'dine_in' && (
                  <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">N° de Mesa *</label>
                    <Input
                      value={selectedTable || ''}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      placeholder="Ej. 4, Terraza 2"
                      className="text-xs h-9 font-semibold rounded-lg"
                      required
                    />
                  </div>
                )}

                {fulfillmentType === 'delivery' && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" aria-hidden="true" />
                        <span>Dirección de Entrega *</span>
                      </label>
                      <Input
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Barrio Equipetrol, Calle 7 Este #120"
                        className="text-xs h-9 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-foreground mb-1 block">Punto de Referencia</label>
                      <Input
                        value={deliveryReference}
                        onChange={(e) => setDeliveryReference(e.target.value)}
                        placeholder="Portón negro frente al condominio"
                        className="text-xs h-9 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Notas para Cocina (opcional)</label>
                  <Input
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ej. Sin cebolla, salsa aparte, etc."
                    className="text-xs h-9 rounded-lg"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr_simple')}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'qr_simple'
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-foreground'
                        : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    <span className="text-[10px] leading-tight">QR Simple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-foreground'
                        : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                    <span className="text-[10px] leading-tight">Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-foreground'
                        : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-500" aria-hidden="true" />
                    <span className="text-[10px] leading-tight">Tarjeta TPV</span>
                  </button>
                </div>
              </div>

              {/* Voluntary Tip Selector */}
              {fulfillmentType === 'dine_in' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-muted-foreground">Propina voluntaria para el equipo:</span>
                    <span className="font-bold text-amber-500 tabular-nums">Bs. {selectedTip}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 5, 10, 20].map((tip) => (
                      <button
                        key={tip}
                        type="button"
                        onClick={() => setSelectedTip(tip)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selectedTip === tip
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tip === 0 ? 'Sin propina' : `Bs. ${tip}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Total & Submit Button */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Total a Pagar</span>
                    {deliveryFee > 0 && (
                      <span className="text-[10px] text-muted-foreground block">Incluye Bs. 10 de envío delivery</span>
                    )}
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">0% comisión de app</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-500 tabular-nums">
                      {venue.currency} {grandTotal}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || cartState.items.length === 0}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Enviando a Cocina...'
                  ) : (
                    <>
                      <span>Confirmar Comanda ({venue.currency} {grandTotal})</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>

      {/* QR Simple Modal Preview */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-sm w-full p-6 text-center space-y-4 bg-card border-border rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">QR Simple Bolivia</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Escanea con BNB, BCP, Banco Unión o tu app bancaria favorita.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 inline-block mx-auto shadow-sm">
            <div className="w-48 h-48 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2">
              <QrCode className="w-36 h-36 text-white" aria-hidden="true" />
              <span className="text-[10px] font-mono text-amber-300 font-bold">PAGAR BS. {confirmedOrder?.total || grandTotal}</span>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowQrModal(false);
              toast.success('Pago verificado por QR Simple');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl"
          >
            Confirmar Pago Realizado
          </Button>
        </DialogContent>
      </Dialog>

      {/* Google Review Hunter Modal */}
      <GoogleReviewHunterModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        defaultCustomerName={customerName}
        orderId={confirmedOrder?.id}
      />
    </Dialog>
  );
};
