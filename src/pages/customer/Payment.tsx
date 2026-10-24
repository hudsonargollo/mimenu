import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mercadoPagoService } from "@/integrations/mercadopago/client";
import { paymentRecoveryService } from "@/integrations/mercadopago/recovery";
import { usePaymentPolling } from "@/hooks/usePaymentPolling";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Clock, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import CreditCardPayment from "@/components/CreditCardPayment";
import type { MercadoPagoPaymentResponse } from "@/integrations/mercadopago/types";

type PaymentMethod = 'qrpago' | 'card' | 'cash';

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const Payment = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Pago del Pedido | MiMenu";
  }, []);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentData, setPaymentData] = useState<MercadoPagoPaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'expired' | 'error'>('pending');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Payment method state management (Task 7.1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('qrpago');
  
  // Handler for payment method changes
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  // Credit card payment callbacks (Task 7.4)
  const handleCardPaymentSuccess = async (paymentId: string) => {
    setPaymentStatus('approved');
    setRetryCount(0);
    toast.success('¡Pago aprobado con éxito!');
    
    // Update order status in database using the security definer function
    if (orderId) {
      try {
        // @ts-ignore - Type will be updated after Supabase types regeneration
        const { error } = await supabase.rpc('confirm_order_payment', {
          _order_id: orderId,
          _payment_id: paymentId,
          _payment_method: 'credit_card'
        });
        
        if (error) {
          console.error('Error confirming order payment:', error);
          toast.error('Error al confirmar el pago. Contacta al soporte.');
        } else {
          console.log('Order payment confirmed successfully:', { orderId, paymentId, method: 'credit_card' });
        }
      } catch (error) {
        console.error('Exception confirming order payment:', error);
      }
    }
  };

  const handleCardPaymentError = (error: string) => {
    setPaymentStatus('error');
    toast.error(error);
  };

  const handleCardPaymentPending = () => {
    setPaymentStatus('pending');
    toast.info('Pago en revisión. Recibirás una notificación cuando sea aprobado.');
  };

  // Load order and create payment
  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    loadOrderAndCreatePayment();
  }, [orderId]);

  // Poll order status directly from database as backup
  useEffect(() => {
    if (!orderId || paymentStatus !== 'pending') {
      return;
    }

    const checkOrderStatus = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status, payment_status, payment_confirmed_at')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        console.log('📊 Order status check:', data);
        if (data.payment_confirmed_at || data.payment_status === 'confirmed' || data.status === 'paid') {
          console.log('✅ Payment confirmed detected via direct check!');
          setPaymentStatus('approved');
        }
      }
    };

    // Check every 3 seconds as a backup
    const interval = setInterval(checkOrderStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId, paymentStatus]);

  // Payment status polling with custom hook
  const { stopPolling } = usePaymentPolling({
    paymentId: paymentData?.id || null,
    orderId: orderId || null,
    isActive: paymentStatus === 'pending' && selectedPaymentMethod === 'qrpago',
    onSuccess: () => {
      console.log('✅ Payment polling detected approval!');
      setPaymentStatus('approved');
      setRetryCount(0);
      paymentRecoveryService.resetRecoveryAttempts(orderId!);
    },
    onError: (error) => {
      console.error('❌ Payment polling error:', error);
      setPaymentStatus('error');
      handlePaymentError();
    },
    onTimeout: () => {
      console.log('⏰ Payment polling timeout');
      setPaymentStatus('expired');
      handlePaymentTimeout();
    },
    onStatusChange: (status) => {
      console.log('🔄 Payment status changed to:', status);
    }
  });

  // Timer for payment expiration
  useEffect(() => {
    if (!paymentData) return;

    const expirationTime = new Date(paymentData.expirationDate).getTime();
    
    const timerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, expirationTime - now);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setPaymentStatus('expired');
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [paymentData]);

  const loadOrderAndCreatePayment = async (isRetry: boolean = false) => {
    try {
      setLoading(true);
      if (isRetry) {
        setIsRecovering(true);
      }

      // Load order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Order not found');

      setOrder(orderData);

      // Reset status for retry
      if (isRetry) {
        setPaymentStatus('pending');
        setRetryCount(prev => prev + 1);
      }

      // Create MercadoPago payment with enhanced error handling
      const paymentResponse = await mercadoPagoService.createPayment({
        orderId: orderData.id,
        amount: orderData.total_amount,
        description: `Pedido #${orderData.order_number} - ${orderData.customer_name}`,
        customerName: orderData.customer_name,
        customerPhone: orderData.customer_phone,
        tableNumber: orderData.table_number
      });

      setPaymentData(paymentResponse);

      // Update order with payment information
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'pending_payment',
          mercadopago_payment_id: paymentResponse.id,
          qr_code_data: paymentResponse.qrCodeBase64,
          pix_copy_paste: paymentResponse.pixCopyPaste,
          payment_expires_at: paymentResponse.expirationDate
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order with payment data:', updateError);
        // Don't fail the whole process for this error
      }

      if (isRetry) {
        toast.success('¡Nuevo pago generado con éxito!');
      }

    } catch (error) {
      console.error('Error loading order or creating payment:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (isRetry) {
        toast.error(`Error al generar un nuevo pago: ${errorMessage}`);
      } else {
        toast.error('Error al cargar el pago. Intenta nuevamente.');
      }
      
      setPaymentStatus('error');
      
      // Offer recovery options for certain errors
      if (retryCount < 3 && !isRetry) {
        setTimeout(() => {
          handlePaymentError();
        }, 2000);
      }
    } finally {
      setLoading(false);
      setIsRecovering(false);
    }
  };

  const handlePaymentError = async () => {
    if (!orderId) return;

    const recoveryAttempts = paymentRecoveryService.getRecoveryAttempts(orderId);
    
    if (recoveryAttempts < 3) {
      toast.error(
        'Error en el pago. Haz clic aquí para intentar nuevamente.',
        {
          duration: 10000,
          action: {
            label: 'Intentar Nuevamente',
            onClick: () => loadOrderAndCreatePayment(true)
          }
        }
      );
    } else {
      toast.error('Fallaron varios intentos. Contacta al soporte.');
    }
  };

  const handlePaymentTimeout = async () => {
    if (!orderId) return;

    // Use the recovery service to handle expired payments
    await paymentRecoveryService.handleExpiredPayment(orderId);
  };

  const handleManualRecovery = async () => {
    if (!orderId) return;

    setIsRecovering(true);
    const success = await paymentRecoveryService.recoverPayment({ orderId });
    
    if (success) {
      // Reload the page data to get the new payment info
      await loadOrderAndCreatePayment(true);
    }
    
    setIsRecovering(false);
  };

  const formatPixSnippet = (pixCode: string): string => {
    if (!pixCode || pixCode.length < 16) return pixCode;
    const first10 = pixCode.substring(0, 10);
    const last6 = pixCode.substring(pixCode.length - 6);
    return `${first10}...${last6}`;
  };

  const handleBack = () => {
    // Navigate to order status page
    if (orderId) {
      navigate(`/order-status/${orderId}`);
    } else {
      navigate('/menu');
    }
  };

  const copyPixCode = async () => {
    if (!paymentData?.pixCopyPaste) return;

    try {
      await navigator.clipboard.writeText(paymentData.pixCopyPaste);
      toast.success('¡Copiado!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar el código');
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'approved':
        return <Badge className="bg-green-500" aria-label="Estado: Pago aprobado"><CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />Aprobado</Badge>;
      case 'expired':
        return <Badge variant="destructive" aria-label="Estado: Pago expirado"><AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />Expirado</Badge>;
      case 'error':
        return <Badge variant="destructive" aria-label="Estado: Error en el pago"><AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />Error</Badge>;
      default:
        return <Badge className="bg-primary text-white border-2 border-purple-400 shadow-lg animate-pulse-badge" aria-label="Estado: Esperando el pago"><Clock className="w-4 h-4 mr-1" aria-hidden="true" />Esperando</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-muted-foreground text-base">Generando pago...</p>
        </div>
      </div>
    );
  }

  if (!order || !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" role="alert" aria-live="assertive">
        <Card className="p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" aria-hidden="true" />
          <p className="text-muted-foreground mb-4 text-base">Error al cargar el pago</p>
          <Button 
            onClick={() => navigate('/')} 
            className="min-h-[44px]"
            aria-label="Volver al inicio"
          >
            Volver al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-ocean text-white shadow-2xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 transition-all rounded-lg"
              onClick={handleBack}
              aria-label="Volver al Estado del Pedido"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider">Pago</h1>
              {order && (
                <p className="text-white/90 text-sm mt-0.5 font-body">
                  Pedido #{order.order_number} • Bs {order.total_amount.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-6" role="main">
        {/* Payment Method Selector (Task 7.2) */}
        <Card className="p-4 shadow-soft border-2 border-accent rounded-xl">
          <h2 className="font-display font-bold text-lg mb-3 uppercase tracking-wider text-primary">Método de Pago</h2>
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onSelect={handlePaymentMethodChange}
          />
        </Card>

        {/* Payment Status */}
        <Card className="p-4 shadow-soft border-2 border-accent rounded-xl" role="region" aria-label="Estado del pago">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg uppercase tracking-wider text-primary">Estado del Pago</h2>
            {getStatusBadge()}
          </div>
          
          {paymentStatus === 'pending' && selectedPaymentMethod === 'qrpago' && timeRemaining > 0 && (
            <div className="text-center" role="timer" aria-live="polite" aria-atomic="true">
              <p className="text-muted-foreground mb-2 text-sm">Tiempo restante para pagar:</p>
              <p className="text-2xl font-bold text-primary" aria-label={`${formatTime(timeRemaining)} restantes`}>{formatTime(timeRemaining)}</p>
              {paymentData?.id.startsWith('mock_') && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Modo de prueba: El pago se aprobará automáticamente en ~10 segundos
                </p>
              )}
            </div>
          )}

          {paymentStatus === 'pending' && selectedPaymentMethod === 'card' && (
            <div className="text-center" role="status" aria-live="polite">
              <Clock className="w-16 h-16 mx-auto mb-2 text-yellow-600" aria-hidden="true" />
              <p className="font-semibold text-base">Pago en revisión</p>
              <p className="text-sm text-muted-foreground">
                Recibirás una notificación cuando sea aprobado
              </p>
            </div>
          )}

          {paymentStatus === 'approved' && (
            <div className="text-center text-secondary" role="status" aria-live="polite">
              <CheckCircle className="w-16 h-16 mx-auto mb-2" aria-hidden="true" />
              <p className="font-display font-semibold text-base uppercase tracking-wider">¡Pago aprobado!</p>
              <p className="text-sm text-accent mb-4 font-body">¡Tu pedido fue confirmado!</p>
              <Button 
                onClick={() => navigate(`/order-status/${orderId}`)}
                className="w-full min-h-[44px] bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-display uppercase tracking-wider rounded-xl"
                aria-label="Ver estado del pedido"
              >
                Ver Estado del Pedido
              </Button>
            </div>
          )}

          {paymentStatus === 'expired' && selectedPaymentMethod === 'qrpago' && (
            <div className="text-center" role="alert" aria-live="assertive">
              <AlertCircle className="w-16 h-16 mx-auto mb-2 text-destructive" aria-hidden="true" />
              <p className="font-semibold text-destructive text-base">Pago expirado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Se superó el tiempo límite para pagar
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full min-h-[44px]" 
                  onClick={() => loadOrderAndCreatePayment(true)}
                  disabled={isRecovering}
                  aria-label={isRecovering ? "Generando nuevo pago" : "Generar nuevo pago"}
                >
                  {isRecovering ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Generando...
                    </>
                  ) : (
                    'Generar Nuevo Pago'
                  )}
                </Button>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Intento {retryCount + 1} de 3
                  </p>
                )}
              </div>
            </div>
          )}

          {paymentStatus === 'error' && selectedPaymentMethod === 'qrpago' && (
            <div className="text-center" role="alert" aria-live="assertive">
              <AlertCircle className="w-16 h-16 mx-auto mb-2 text-destructive" aria-hidden="true" />
              <p className="font-semibold text-destructive text-base">Error en el pago</p>
              <p className="text-sm text-muted-foreground mb-4">
                Ocurrió un error al procesar el pago
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full min-h-[44px]" 
                  onClick={() => loadOrderAndCreatePayment(true)}
                  disabled={isRecovering}
                  aria-label={isRecovering ? "Intentando nuevamente" : "Intentar nuevamente"}
                >
                  {isRecovering ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Intentando...
                    </>
                  ) : (
                    'Intentar Nuevamente'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full min-h-[44px]" 
                  onClick={handleManualRecovery}
                  disabled={isRecovering}
                  aria-label="Recuperar pago"
                >
                  Recuperar Pago
                </Button>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Intento {retryCount + 1} de 3
                  </p>
                )}
              </div>
            </div>
          )}

          {paymentStatus === 'error' && selectedPaymentMethod === 'card' && (
            <div className="text-center" role="alert" aria-live="assertive">
              <AlertCircle className="w-16 h-16 mx-auto mb-2 text-destructive" aria-hidden="true" />
              <p className="font-semibold text-destructive text-base">Error en el pago</p>
              <p className="text-sm text-muted-foreground mb-4">
                Verifica los datos de la tarjeta e intenta nuevamente
              </p>
            </div>
          )}
        </Card>

        {/* QR Code and Pix - Conditional rendering for PIX method (Task 7.3) */}
        {selectedPaymentMethod === 'qrpago' && paymentStatus === 'pending' && paymentData && (
          <>
            {/* Primary QR PAGO Code Section */}
            <Card className="p-6 shadow-soft border-2 border-secondary rounded-xl">
              <h3 className="font-display font-bold text-lg mb-3 uppercase tracking-wider text-primary">Código de Pago QR</h3>
              
              {/* QR PAGO Code Snippet */}
              <div className="bg-background p-4 rounded-lg mb-2 border border-accent">
                <p className="text-base font-mono text-center text-foreground select-all font-body">
                  {formatPixSnippet(paymentData.pixCopyPaste)}
                </p>
              </div>
              
              {/* Helper Text */}
              <p className="text-sm text-accent text-center mb-4 font-body">
                Haz clic en "Copiar código de pago QR" para pegarlo en la app de tu banco
              </p>
              
              {/* Primary Copy Button */}
              <Button 
                onClick={copyPixCode} 
                className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-display uppercase tracking-wider py-6 text-lg min-h-[48px] rounded-xl"
                size="lg"
                aria-label="Copiar el código de pago QR al portapapeles"
              >
                <Copy className="w-5 h-5 mr-2" aria-hidden="true" />
                Copiar código de pago QR
              </Button>
            </Card>

            {/* Secondary QR Code Section */}
            <Card className="p-4 shadow-soft border-2 border-accent rounded-xl">
              <h3 className="font-display font-semibold text-base mb-2 uppercase tracking-wider text-primary">Pagar con QR (opcional)</h3>
              <p className="text-sm text-accent mb-3 font-body">
                Si prefieres, apunta la cámara de la app de tu banco al código QR
              </p>
              
              {/* Smaller QR Code */}
              {paymentData.qrCodeBase64 ? (
                <div className="flex justify-center" role="img" aria-label="Código QR para el pago">
                  <img
                    src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                    alt="Código QR para el pago - Escanéalo con la app de tu banco"
                    className="w-48 h-48 border-2 border-accent rounded-lg"
                    width="192"
                    height="192"
                  />
                </div>
              ) : (
                <div 
                  className="w-48 h-48 bg-background border-2 border-accent rounded-lg mx-auto flex items-center justify-center"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-accent text-sm font-body">Código QR no disponible</p>
                </div>
              )}
            </Card>

          </>
        )}

        {/* Credit Card Payment - Conditional rendering for card method */}
        {selectedPaymentMethod === 'card' && order && (
          <Card className="p-6 shadow-soft border-2 border-secondary rounded-xl">
            <h3 className="font-display font-bold text-lg mb-4 uppercase tracking-wider text-primary">Pago con Tarjeta de Crédito/Débito</h3>
            <CreditCardPayment
              orderId={order.id}
              amount={order.total_amount}
              customerEmail=""
              customerDocument=""
              customerDocumentType="CI"
              onPaymentSuccess={handleCardPaymentSuccess}
              onPaymentError={handleCardPaymentError}
              onPaymentPending={handleCardPaymentPending}
            />
          </Card>
        )}

        {/* Order Summary */}
        <Card className="p-4 shadow-soft border-2 border-accent rounded-xl" role="region" aria-label="Resumen del pedido">
          <h3 className="font-display font-bold text-lg mb-4 uppercase tracking-wider text-primary">Resumen del Pedido</h3>
          <div className="space-y-2 font-body">
            <div className="flex justify-between">
              <span className="text-foreground">Cliente:</span>
              <span className="font-semibold text-foreground">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Teléfono:</span>
              <span className="font-semibold text-foreground">{formatPhoneNumber(order.customer_phone)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-accent pt-2">
              <span className="text-foreground">Total:</span>
              <span className="text-secondary">Bs {order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Payment;