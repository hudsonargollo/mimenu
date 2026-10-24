/**
 * Payment Method Selector Component
 *
 * Displays and manages payment method selection for the ordering flow.
 * For Bolivia/Santa Cruz market, supports:
 * - QR PAGO (Bolivian QR code payment)
 * - Credit Card (via MercadoPago Payment Brick)
 * - Efectivo (cash on delivery/pickup)
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, QrCode, Banknote } from 'lucide-react';

export type PaymentMethod = 'qrpago' | 'card' | 'cash';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  showEfectivo?: boolean;
  currencySymbol?: string;
  className?: string;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  qrpago: 'QR PAGO',
  card: 'Tarjeta de Crédito / Débito',
  cash: 'Efectivo',
};

const paymentMethodIcons: Record<PaymentMethod, JSX.Element> = {
  qrpago: <QrCode className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  cash: <Banknote className="h-5 w-5" />,
};

/**
 * Payment Method Selector Component
 *
 * Renders a horizontal list of payment method options with icons.
 * Users can select between QR PAGO, credit card, and efectivo.
 *
 * @component
 * @example
 * ```tsx
 * <PaymentMethodSelector
 *   selectedMethod={method}
 *   onSelect={(m) => setMethod(m)}
 * />
 * ```
 */
export default function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  showEfectivo = true,
  currencySymbol = 'Bs',
  className = '',
}: PaymentMethodSelectorProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (method: PaymentMethod) => {
    if (method === selectedMethod) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onSelect(method);
    }, 150);
  };

  const availableMethods: PaymentMethod[] = showEfectivo
    ? ['qrpago', 'card', 'cash']
    : ['qrpago', 'card'];

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {availableMethods.map(method => (
        <Card
          key={method}
          className={`
            cursor-pointer transition-all duration-200
            ${isAnimating ? 'scale-95' : 'scale-100'}
            ${selectedMethod === method
              ? 'border-2 border-yellow-400 bg-yellow-400/10 shadow-md'
              : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50/80'}
          `}
          onClick={() => handleSelect(method)}
        >
          <CardContent className="flex items-center gap-3 px-4 py-3">
            {paymentMethodIcons[method]}
            <span className="text-sm font-medium text-foreground">
              {paymentMethodLabels[method]}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
