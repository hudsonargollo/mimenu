import { useCallback, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { printServerClient } from '@/integrations/print-server/client';
import type { MimenuOrder } from '@/types/mimenu';

const ORDERS_KEY = 'mimenu_orders_v2';

interface OrderData {
  id: string;
  order_number: string | number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  order_notes?: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface PrintOrderData {
  order: OrderData;
  items: OrderItem[];
  waiterName?: string | null;
}

/**
 * Hook for manual order printing
 * 
 * Provides functionality to print order receipts on demand.
 * Fetches order data and opens print dialog with formatted receipt.
 * 
 * Requirements: 2.1, 2.2
 */
export function usePrintOrder() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState<PrintOrderData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Read the order from the local store used by the customer/kitchen panels
  const fetchOrderData = useCallback(async (orderId: string): Promise<PrintOrderData | null> => {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      const orders: MimenuOrder[] = stored ? JSON.parse(stored) : [];
      const order = orders.find((candidate) => candidate.id === orderId);

      if (!order) {
        toast.error('Pedido no encontrado');
        return null;
      }

      return {
        order: {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          total_amount: order.total,
          order_notes: order.customer_notes ?? null,
          created_at: order.created_at,
        },
        items: order.items.map((item, index) => ({
          id: `${order.id}-${index}`,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        waiterName: null,
      };
    } catch (error) {
      console.error('Error reading order data:', error);
      toast.error('Error al cargar los datos del pedido');
      return null;
    }
  }, []);

  // Generate kitchen receipt (includes waiter info, focused on preparation)
  const generateKitchenReceipt = (data: PrintOrderData): string => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const divider = '================================';
    const divider2 = '--------------------------------';
    
    let receipt = '';
    receipt += '\n';
    receipt += '      *** COCINA ***\n';
    receipt += divider + '\n';
    receipt += `PEDIDO: #${data.order.order_number}\n`;
    receipt += `HORA: ${formatDate(data.order.created_at)}\n`;
    if (data.waiterName && data.waiterName !== 'Cliente') {
      receipt += `GARZÓN: ${data.waiterName}\n`;
    }
    receipt += divider + '\n';
    receipt += '\n';
    receipt += 'ÍTEMS:\n';
    receipt += divider2 + '\n';
    
    data.items.forEach(item => {
      receipt += `\n`;
      receipt += `[ ] ${item.quantity}x ${item.item_name}\n`;
    });
    
    receipt += '\n';
    receipt += divider2 + '\n';
    
    if (data.order.order_notes) {
      receipt += '\n';
      receipt += '*** OBSERVACIONES ***\n';
      receipt += `${data.order.order_notes}\n`;
      receipt += divider + '\n';
    }
    
    receipt += '\n';
    receipt += `Cliente: ${data.order.customer_name}\n`;
    receipt += '\n\n\n\n\n\n\n\n';
    
    return receipt;
  };

  // Generate customer receipt (clean format with prices)
  const generateCustomerReceipt = (data: PrintOrderData): string => {
    const formatCurrency = (value: number) => {
      return `Bs ${value.toFixed(2).replace('.', ',')}`;
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const divider = '================================';
    const divider2 = '--------------------------------';
    
    let receipt = '';
    receipt += '    MIMENU\n';
    receipt += '       Menú Digital\n';
    receipt += divider + '\n';
    receipt += `Pedido: #${data.order.order_number}\n`;
    receipt += `Fecha: ${formatDate(data.order.created_at)}\n`;
    receipt += `Cliente: ${data.order.customer_name}\n`;
    if (data.waiterName && data.waiterName !== 'Cliente') {
      receipt += `Garzón: ${data.waiterName}\n`;
    }
    receipt += divider + '\n';
    receipt += 'CANT  ÍTEM                  PRECIO\n';
    receipt += divider2 + '\n';
    
    data.items.forEach(item => {
      const qty = `${item.quantity}x`.padEnd(5);
      const price = formatCurrency(item.unit_price * item.quantity).padStart(10);
      const nameWidth = 32 - qty.length - price.length;
      let name = item.item_name;
      if (name.length > nameWidth) {
        name = name.substring(0, nameWidth - 3) + '...';
      }
      receipt += `${qty}${name.padEnd(nameWidth)}${price}\n`;
    });
    
    receipt += divider2 + '\n';
    
    if (data.order.order_notes) {
      receipt += 'OBSERVACIONES:\n';
      receipt += `${data.order.order_notes}\n`;
      receipt += divider + '\n';
    }
    
    receipt += `TOTAL: ${formatCurrency(data.order.total_amount)}\n`;
    receipt += divider + '\n';
    receipt += '  ¡Gracias por su preferencia!\n';
    receipt += `  Tel: ${data.order.customer_phone}\n`;
    receipt += '\n\n\n\n\n\n\n\n';
    
    return receipt;
  };

  // State to track receipt type
  const [receiptType, setReceiptType] = useState<'kitchen' | 'customer'>('customer');

  // React-to-print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Pedido #${currentOrderData?.order.order_number || ''} - ${receiptType === 'kitchen' ? 'Cocina' : 'Cliente'}`,
    onAfterPrint: () => {
      setIsPrinting(false);
      setCurrentOrderData(null);
    },
  });





  // Print kitchen receipt
  const printKitchenReceipt = useCallback(async (orderId: string) => {
    if (isPrinting) {
      console.log('Print already in progress');
      return;
    }

    setIsPrinting(true);
    setReceiptType('kitchen');

    try {
      const data = await fetchOrderData(orderId);
      
      if (!data) {
        setIsPrinting(false);
        return;
      }

      // Try local print server first
      const serverAvailable = await printServerClient.checkAvailability();
      
      if (serverAvailable) {
        try {
          const plainText = generateKitchenReceipt(data);
          const success = await printServerClient.print(plainText, data.order.order_number);
          
          if (success) {
            toast.success('Imprimiendo comanda de cocina...');
            setIsPrinting(false);
            return;
          } else {
            console.log('Print server failed, falling back to browser print');
          }
        } catch (error) {
          console.error('Print server error:', error);
        }
      }

      // Fallback to react-to-print
      setCurrentOrderData(data);
      setTimeout(() => {
        handlePrint();
      }, 100);
      
    } catch (error) {
      console.error('Error preparing print:', error);
      toast.error('Error al preparar la impresión');
      setIsPrinting(false);
    }
  }, [isPrinting, fetchOrderData, generateKitchenReceipt, handlePrint]);

  // Print customer receipt
  const printCustomerReceipt = useCallback(async (orderId: string) => {
    if (isPrinting) {
      console.log('Print already in progress');
      return;
    }

    setIsPrinting(true);
    setReceiptType('customer');

    try {
      const data = await fetchOrderData(orderId);
      
      if (!data) {
        setIsPrinting(false);
        return;
      }

      // Try local print server first
      const serverAvailable = await printServerClient.checkAvailability();
      
      if (serverAvailable) {
        try {
          const plainText = generateCustomerReceipt(data);
          const success = await printServerClient.print(plainText, data.order.order_number);
          
          if (success) {
            toast.success('Imprimiendo comprobante del cliente...');
            setIsPrinting(false);
            return;
          } else {
            console.log('Print server failed, falling back to browser print');
          }
        } catch (error) {
          console.error('Print server error:', error);
        }
      }

      // Fallback to react-to-print
      setCurrentOrderData(data);
      setTimeout(() => {
        handlePrint();
      }, 100);
      
    } catch (error) {
      console.error('Error preparing print:', error);
      toast.error('Error al preparar la impresión');
      setIsPrinting(false);
    }
  }, [isPrinting, fetchOrderData, generateCustomerReceipt, handlePrint]);



  return {
    printKitchenReceipt,
    printCustomerReceipt,
    isPrinting,
    printRef,
    currentOrderData,
    receiptType,
    generateKitchenReceipt,
    generateCustomerReceipt,
  };
}
