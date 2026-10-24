import { OrderData } from './types';
import { templateManager } from './template-manager';
import { 
  getPaymentConfirmedMessage, 
  getOrderReadyMessage, 
  getOrderPreparingMessage 
} from './message-variations';

/**
 * WhatsApp message templates with fallback to hardcoded templates
 * Uses template manager for database-driven templates
 */
export class WhatsAppTemplates {
  /**
   * Generate order created message (when order is first placed)
   */
  static async generateOrderCreated(orderData: OrderData, orderStatusUrl?: string, paymentUrl?: string): Promise<string> {
    try {
      const template = await templateManager.getTemplate('order_created');
      return templateManager.renderTemplate(template, orderData);
    } catch (error) {
      console.warn('Failed to load order_created template, using fallback:', error);
      return this.generateOrderCreatedFallback(orderData, orderStatusUrl, paymentUrl);
    }
  }
  
  /**
   * Generate order confirmation message (when payment is confirmed)
   */
  static async generateOrderConfirmation(orderData: OrderData): Promise<string> {
    try {
      const template = await templateManager.getTemplate('payment_confirmed');
      return templateManager.renderTemplate(template, orderData);
    } catch (error) {
      console.warn('Failed to load template, using fallback:', error);
      return this.generateOrderConfirmationFallback(orderData);
    }
  }
  
  /**
   * Generate ready for pickup message
   */
  static async generateReadyForPickup(orderData: OrderData): Promise<string> {
    try {
      const template = await templateManager.getTemplate('ready');
      return templateManager.renderTemplate(template, orderData);
    } catch (error) {
      console.warn('Failed to load template, using fallback:', error);
      return this.generateReadyForPickupFallback(orderData);
    }
  }
  
  /**
   * Generate preparing status message
   */
  static async generatePreparingMessage(orderData: OrderData): Promise<string> {
    try {
      const template = await templateManager.getTemplate('preparing');
      return templateManager.renderTemplate(template, orderData);
    } catch (error) {
      console.warn('Failed to load template, using fallback:', error);
      return this.generatePreparingFallback(orderData);
    }
  }
  
  /**
   * Generate custom message
   */
  static async generateCustomMessage(orderData: OrderData, customText: string): Promise<string> {
    try {
      const template = await templateManager.getTemplate('custom');
      // Add custom message to order data for rendering
      const dataWithCustom = {
        ...orderData,
        customMessage: customText,
      } as any;
      return templateManager.renderTemplate(template, dataWithCustom);
    } catch (error) {
      console.warn('Failed to load template, using fallback:', error);
      return this.generateCustomMessageFallback(orderData, customText);
    }
  }
  
  /**
   * Generate status update message (legacy support)
   */
  static async generateStatusUpdate(orderData: OrderData, status: string): Promise<string> {
    // Map status to notification type
    switch (status) {
      case 'paid':
      case 'payment_confirmed':
        return this.generateOrderConfirmation(orderData);
      case 'preparing':
      case 'in_preparation':
        return this.generatePreparingMessage(orderData);
      case 'ready':
        return this.generateReadyForPickup(orderData);
      default:
        return this.generateStatusUpdateFallback(orderData, status);
    }
  }
  
  // Fallback methods (hardcoded templates)
  
  private static generateOrderCreatedFallback(orderData: OrderData, orderStatusUrl?: string, paymentUrl?: string): string {
    const itemsList = orderData.items
      .map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        return `• ${item.quantity}x ${item.itemName} - Bs ${itemTotal.toFixed(2)}`
      })
      .join('\n');
    
    // Get first name for personalization
    const firstName = orderData.customerName.split(' ')[0];
    
    let message = `🎉 *Pedido #${orderData.orderNumber} Creado!*\n\n` +
      `¡Hola *${firstName}*! Recibimos tu pedido.\n\n` +
      `📋 *Ítems del Pedido:*\n${itemsList}\n\n` +
      `💰 *Total: Bs ${orderData.totalAmount.toFixed(2)}*`;

    if (orderStatusUrl && paymentUrl) {
      message += `\n\n🔗 *Links Útiles:*\n` +
        `📱 Ver Pedido: ${orderStatusUrl}\n` +
        `💳 Ir al Pago: ${paymentUrl}\n\n` +
        `Puedes ver tu pedido, editarlo o finalizar el pago a través de los enlaces.`;
    } else {
      message += `\n\n¡Pronto recibirás más información sobre tu pedido! 😊`;
    }
  
    return message;
  }
  
  private static generateOrderConfirmationFallback(orderData: OrderData): string {
    // Use rotating message variations
    return getPaymentConfirmedMessage(orderData);
  }
  
  private static generateReadyForPickupFallback(orderData: OrderData): string {
    // Use rotating message variations
    return getOrderReadyMessage(orderData);
  }
  
  private static generatePreparingFallback(orderData: OrderData): string {
    // Use rotating message variations
    return getOrderPreparingMessage(orderData);
  }
  
  private static generateStatusUpdateFallback(orderData: OrderData, status: string): string {
    let statusMessage = '';
    let emoji = '';
    let additionalMessage = '';
    
    // Get first name for personalization
    const firstName = orderData.customerName.split(' ')[0];
    
    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.itemName}`)
      .join('\n');
    
    switch (status) {
      case 'in_preparation':
      case 'preparing':
        statusMessage = 'en preparación';
        emoji = '👨‍🍳';
        additionalMessage = '¡Estamos preparando tu pedido con cariño!';
        break;
      case 'ready':
        statusMessage = 'listo para retirar';
        emoji = '✅';
        additionalMessage = `Por favor, *${firstName}*, pasa a recoger tu pedido en el mostrador.`;
        break;
      case 'completed':
        statusMessage = 'finalizado';
        emoji = '🎉';
        additionalMessage = `¡Gracias por tu preferencia, *${firstName}*!`;
        break;
      default:
        statusMessage = status;
        emoji = 'ℹ️';
        additionalMessage = '¡Gracias por tu preferencia!';
    }
    
    return `🌴 *MiMenu - Santa Cruz* 🌴\n\n¡Hola *${firstName}*! 👋\n\n${emoji} *Actualización del Pedido*\n\n📋 *Pedido #${orderData.orderNumber}*\n🪑 *Mesa:* ${orderData.tableNumber}\n\n📝 *Tus Ítems:*\n${itemsList}\n\n💰 *Total:* Bs ${orderData.totalAmount.toFixed(2)}\n\n📊 *Estado:* ${statusMessage}\n\n${additionalMessage}\n\n🌊🥥`;
  }
  
  private static generateCustomMessageFallback(orderData: OrderData, customText: string): string {
    // Get first name for personalization
    const firstName = orderData.customerName.split(' ')[0];
    
    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.itemName}`)
      .join('\n');
    
    return `🌴 *MiMenu - Santa Cruz* 🌴\n\n¡Hola *${firstName}*! 👋\n\n📋 *Pedido #${orderData.orderNumber}*\n🪑 *Mesa:* ${orderData.tableNumber}\n\n📝 *Tus Ítems:*\n${itemsList}\n\n💰 *Total:* Bs ${orderData.totalAmount.toFixed(2)}\n\n---\n\n${customText}\n\n🥥🌊`;
  }
}