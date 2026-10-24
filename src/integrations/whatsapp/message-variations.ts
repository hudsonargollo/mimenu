/**
 * WhatsApp Message Variations
 * Multiple message templates that rotate to keep communications fresh and engaging
 */

import { OrderData } from './types';

/**
 * Get a random variation from an array
 */
function getRandomVariation<T>(variations: T[]): T {
  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Payment Confirmed Message Variations (5 different versions)
 */
export function getPaymentConfirmedMessage(orderData: OrderData): string {
  const firstName = orderData.customerName.split(' ')[0];
  
  const itemsList = orderData.items
    .map(item => `• ${item.quantity}x ${item.itemName}`)
    .join('\n');
  
  const variations = [
    // Variation 1: Super casual and friendly
    `¡Ey, *${firstName}*! 😊\n\nTu pedido fue confirmado y ya se está preparando.\n\n${itemsList}\n\n💰 Total: Bs ${orderData.totalAmount.toFixed(2)}\n\nTranquilo, en unos 15-20 min estará listo. ¡Te aviso cuando puedas recogerlo! 🥥`,
    
    // Variation 2: Warm and conversational
    `Hola, *${firstName}*! 👋\n\nConfirmado. Ya empecé a preparar tu pedido.\n\n${itemsList}\n\n💵 Bs ${orderData.totalAmount.toFixed(2)}\n\nEn unos 15-20 minutos estará listo. ¡Te escribo cuando esté para recoger! 🌴`,
    
    // Variation 3: Friendly and direct
    `¡Guay, *${firstName}*! ✌️\n\nRecibí tu pedido y ya lo estoy haciendo.\n\n${itemsList}\n\n💰 Bs ${orderData.totalAmount.toFixed(2)}\n\nUnos 15-20 min y está listo. ¡Te llamo cuando puedas pasar! 🥥`,
    
    // Variation 4: Upbeat and casual
    `¡Hola, *${firstName}*! 🤙\n\n¡Bien, pedido confirmado! Ya estoy preparando todo para ti.\n\n${itemsList}\n\n💵 Bs ${orderData.totalAmount.toFixed(2)}\n\nEn 15-20 min está en tus manos. ¡Te aviso! 🌊`,
    
    // Variation 5: Simple and friendly
    `Hola, *${firstName}*! 😄\n\nConfirmado. Tu pedido ya se está haciendo.\n\n${itemsList}\n\n💰 Bs ${orderData.totalAmount.toFixed(2)}\n\n¡15-20 minutos y te llamo para recoger! 🥥🌴`
  ];
  
  return getRandomVariation(variations);
}

/**
 * Order Ready Message Variations (5 different versions)
 */
export function getOrderReadyMessage(orderData: OrderData): string {
  const firstName = orderData.customerName.split(' ')[0];
  
  const itemsList = orderData.items
    .map(item => `• ${item.quantity}x ${item.itemName}`)
    .join('\n');
  
  const variations = [
    // Variation 1: Excited and friendly
    `*${firstName}*, ¡listo! 🎉\n\nPuedes pasar a recogerlo en el mostrador.\n\n${itemsList}\n\n¡Te espero aquí! 🥥`,
    
    // Variation 2: Warm and inviting
    `Hola, *${firstName}*! 👋\n\nTu pedido está listo. Pasa a recoger en el mostrador.\n\n${itemsList}\n\n¡Hasta luego! 🌴`,
    
    // Variation 3: Casual and direct
    `¡Ey, *${firstName}*! 🤙\n\nListo. Puedes pasar a recoger en el mostrador.\n\n${itemsList}\n\n¡Te aguardo! 🥥`,
    
    // Variation 4: Friendly and simple
    `¡Guay, *${firstName}*! ✌️\n\nEstá listo. Pasa a recoger.\n\n${itemsList}\n\n¡Gracias! 🌊`,
    
    // Variation 5: Warm and welcoming
    `*${firstName}*, ¡listo! 😊\n\nPasa a recoger en el mostrador.\n\n${itemsList}\n\n¡Te espero! 🥥🌴`
  ];
  
  return getRandomVariation(variations);
}

/**
 * Order Preparing Message Variations (5 different versions)
 */
export function getOrderPreparingMessage(orderData: OrderData): string {
  const firstName = orderData.customerName.split(' ')[0];
  
  const itemsList = orderData.items
    .map(item => `• ${item.quantity}x ${item.itemName}`)
    .join('\n');
  
  const variations = [
    // Variation 1: Friendly and reassuring
    `Hola, *${firstName}*! 👨‍🍳\n\n¡Ya estoy preparando tu pedido!\n\n${itemsList}\n\nEn unos 15-20 min estará listo. ¡Te aviso! 🥥`,
    
    // Variation 2: Casual and warm
    `¡Ey, *${firstName}*! 👋\n\nTu pedido ya se está haciendo en la cocina.\n\n${itemsList}\n\n¡Espera un momento que pronto está listo! 🌴`,
    
    // Variation 3: Simple and friendly
    `¡Guay, *${firstName}*! 🤙\n\n¡Estoy preparando tu pedido!\n\n${itemsList}\n\n¡15-20 min y te llamo! 🥥`,
    
    // Variation 4: Warm and conversational
    `¡Hola, *${firstName}*! ✌️\n\n¡Ya empecé a hacerlo aquí!\n\n${itemsList}\n\n¡Rápido estará listo. ¡Te aviso! 🌊`,
    
    // Variation 5: Friendly and direct
    `*${firstName}*! 😊\n\n¡Estoy preparando tu pedido ahora!\n\n${itemsList}\n\n¡15-20 min y te llamo! 🥥🌴`
  ];
  
  return getRandomVariation(variations);
}

/**
 * Get notification type label in Spanish (Bolivia)
 */
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'order_created': 'Pedido Creado',
    'payment_confirmed': 'Pago Confirmado',
    'preparing': 'En Preparación',
    'in_preparation': 'En Preparación',
    'ready': 'Listo para Retirar',
    'custom': 'Mensaje Personalizado',
    'confirmation': 'Confirmación',
    'status_update': 'Actualización de Estado',
  };
  
  return labels[type] || type;
}

/**
 * Get notification status label in Spanish (Bolivia)
 */
export function getNotificationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pending': 'Pendiente',
    'sent': 'Enviada',
    'failed': 'Falló',
    'cancelled': 'Cancelada',
  };
  
  return labels[status] || status;
}
