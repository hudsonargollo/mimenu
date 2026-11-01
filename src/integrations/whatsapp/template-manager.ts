import { MessageTemplate, NotificationType, OrderData } from './types';
import { supabase } from '../supabase/client';

/**
 * Message Template Manager
 * Handles loading, rendering, and managing WhatsApp message templates
 */

export class MessageTemplateManager {
  private templateCache: Map<NotificationType, MessageTemplate> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  /**
   * Get a template by type, with caching
   */
  async getTemplate(type: NotificationType): Promise<MessageTemplate> {
    // Check cache first
    const now = Date.now();
    if (this.templateCache.has(type) && (now - this.lastCacheUpdate) < this.cacheExpiry) {
      return this.templateCache.get(type)!;
    }

    // Load from database
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('template_type', type)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn(`Template not found for type ${type}, using default`);
      return this.getDefaultTemplate(type);
    }

    const template: MessageTemplate = {
      id: data.id,
      templateType: data.template_type as NotificationType,
      content: data.content,
      variables: data.variables || [],
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    // Update cache
    this.templateCache.set(type, template);
    this.lastCacheUpdate = now;

    return template;
  }

  /**
   * Render a template with order data
   */
  renderTemplate(template: MessageTemplate, data: OrderData): string {
    let rendered = template.content;

    // Replace variables with actual data
    const variables: Record<string, string> = {
      orderNumber: data.orderNumber.toString(),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableNumber: data.tableNumber,
      totalAmount: `Bs. ${data.totalAmount.toFixed(2)}`,
      status: this.formatStatus(data.status),
      itemCount: data.items.length.toString(),
      itemsList: this.formatItemsList(data.items),
      createdAt: this.formatDate(data.createdAt),
      estimatedTime: '15-20 minutos',
    };

    // Replace all variables in the template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }

    return rendered;
  }

  /**
   * Update a template in the database
   */
  async updateTemplate(type: NotificationType, template: Partial<MessageTemplate>): Promise<void> {
    const { error } = await supabase
      .from('notification_templates')
      .update({
        content: template.content,
        variables: template.variables,
        is_active: template.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('template_type', type);

    if (error) {
      console.error('Failed to update template:', error);
      throw new Error(`Failed to update template: ${error.message}`);
    }

    // Clear cache to force reload
    this.templateCache.delete(type);
  }

  /**
   * Create a new template
   */
  async createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from('notification_templates')
      .insert({
        template_type: template.templateType,
        content: template.content,
        variables: template.variables,
        is_active: template.isActive,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to create template:', error);
      throw new Error(`Failed to create template: ${error?.message}`);
    }

    return {
      id: data.id,
      templateType: data.template_type as NotificationType,
      content: data.content,
      variables: data.variables || [],
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('template_type');

    if (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      templateType: item.template_type as NotificationType,
      content: item.content,
      variables: item.variables || [],
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Get default template for a notification type
   */
  private getDefaultTemplate(type: NotificationType): MessageTemplate {
    const templates: Record<NotificationType, string> = {
      payment_confirmed: `🌴 *MiMenu - Santa Cruz* 🌴

✅ *¡Pedido confirmado!*

📋 *Pedido #{{orderNumber}}*
👤 *Cliente:* {{customerName}}
📱 *Teléfono:* {{customerPhone}}

📝 *Ítems del pedido:*
{{itemsList}}

💰 *Total:* {{totalAmount}}

⏰ *Tiempo estimado:* {{estimatedTime}}

Te avisaremos con otro mensaje cuando tu pedido esté listo para retirar.

¡Gracias por elegirnos! 🥥🌊`,

      preparing: `🌴 *MiMenu - Santa Cruz* 🌴

👨‍🍳 *¡Pedido en preparación!*

📋 *Pedido #{{orderNumber}}*
👤 *Cliente:* {{customerName}}

¡Estamos preparando tu pedido con cariño!

⏰ *Tiempo estimado:* {{estimatedTime}}

En breve recibirás una notificación cuando esté listo. 🥥🌊`,

      ready: `🌴 *MiMenu - Santa Cruz* 🌴

🎉 *¡Tu pedido está listo para retirar en el mostrador!*

📋 *Pedido #{{orderNumber}}*
👤 *Cliente:* {{customerName}}

✨ Por favor, presentá el número de tu pedido: *#{{orderNumber}}*`,

      custom: `🌴 *MiMenu - Santa Cruz* 🌴

📋 *Pedido #{{orderNumber}}*
👤 *Cliente:* {{customerName}}

{{customMessage}}

🥥🌊`,
    };

    return {
      id: `default-${type}`,
      templateType: type,
      content: templates[type] || templates.custom,
      variables: this.extractVariables(templates[type] || templates.custom),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: string): string[] {
    const regex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Format order status for display
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      preparing: 'En preparación',
      ready: 'Listo',
      completed: 'Finalizado',
      cancelled: 'Cancelado',
    };

    return statusMap[status] || status;
  }

  /**
   * Format items list for display
   */
  private formatItemsList(items: OrderData['items']): string {
    return items
      .map(item => `• ${item.quantity}x ${item.itemName} - Bs. ${item.unitPrice.toFixed(2)}`)
      .join('\n');
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Validate template content
   */
  validateTemplate(content: string, requiredVariables: string[] = []): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if content is not empty
    if (!content || content.trim().length === 0) {
      errors.push('Template content cannot be empty');
    }

    // Check if content is too long (WhatsApp limit is 4096 characters)
    if (content.length > 4096) {
      errors.push('Template content exceeds WhatsApp message limit (4096 characters)');
    }

    // Check if required variables are present
    const variables = this.extractVariables(content);
    for (const required of requiredVariables) {
      if (!variables.includes(required)) {
        errors.push(`Required variable {{${required}}} is missing`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const templateManager = new MessageTemplateManager();
