// Utility functions for MercadoPago integration
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a payment has expired based on expiration date
 */
export function isPaymentExpired(expirationDate: string): boolean {
  const expiration = new Date(expirationDate);
  const now = new Date();
  return now > expiration;
}

/**
 * Calculate remaining time until payment expires
 */
export function getTimeUntilExpiration(expirationDate: string): number {
  const expiration = new Date(expirationDate);
  const now = new Date();
  return Math.max(0, expiration.getTime() - now.getTime());
}

/**
 * Format time in milliseconds to MM:SS format
 */
export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Clean up expired orders in the database
 */
export async function cleanupExpiredOrders(): Promise<void> {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'expired' })
      .eq('status', 'pending_payment')
      .lt('created_at', fifteenMinutesAgo);

    if (error) {
      console.error('Error cleaning up expired orders:', error);
    } else {
      console.log('Expired orders cleaned up successfully');
    }
  } catch (error) {
    console.error('Error in cleanup process:', error);
  }
}

/**
 * Get payment status color for UI display
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'paid':
      return 'text-green-600';
    case 'pending':
    case 'pending_payment':
      return 'text-yellow-600';
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get payment status icon
 */
export function getPaymentStatusIcon(status: string): string {
  switch (status) {
    case 'approved':
    case 'paid':
      return 'CheckCircle';
    case 'pending':
    case 'pending_payment':
      return 'Clock';
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'AlertCircle';
    default:
      return 'Clock';
  }
}

/**
 * Validate Bolivian phone number format
 */
export function validateBolivianPhone(phone: string): boolean {
  // Format: +591XXXXXXXX (country code + 8 digits)
  const phoneRegex = /^\+591\d{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Format Bolivian phone number for display
 */
export function formatBolivianPhone(phone: string): string {
  // Remove +591 and format as XXXX-XXXX
  if (phone.startsWith('+591')) {
    const number = phone.substring(4);
    if (number.length === 8) {
      return `${number.substring(0, 4)}-${number.substring(4)}`;
    }
  }
  return phone;
}

/**
 * Generate order description for MercadoPago
 */
export function generateOrderDescription(orderNumber: number, customerName: string, itemCount: number): string {
  return `Pedido #${orderNumber} - ${customerName} (${itemCount} ${itemCount === 1 ? 'item' : 'itens'})`;
}

/**
 * Calculate payment expiration time (15 minutes from now)
 */
export function calculatePaymentExpiration(): string {
  const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return expiration.toISOString();
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}