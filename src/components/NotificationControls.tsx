import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, MessageSquare, AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { notificationTriggers, getNotificationTypeLabel, getNotificationStatusLabel } from '@/integrations/whatsapp';
import { evolutionClient } from '@/integrations/whatsapp/evolution-client';
import type { NotificationHistory } from '@/hooks/useNotificationHistory';

interface NotificationControlsProps {
  orderId: string;
  orderNumber: number;
  customerPhone: string;
  customerName: string;
  orderStatus: string;
  notificationHistory?: NotificationHistory;
  onNotificationSent?: () => void;
}

export function NotificationControls({
  orderId,
  orderNumber,
  customerPhone,
  customerName,
  orderStatus,
  notificationHistory,
  onNotificationSent,
}: NotificationControlsProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [sendingCustom, setSendingCustom] = useState(false);
  const [sendingReady, setSendingReady] = useState(false);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const lastNotification = notificationHistory?.lastNotification;
  const hasFailedNotifications = notificationHistory?.hasFailedNotifications || false;

  const handleSendReadyNotification = async () => {
    setSendingReady(true);
    try {
      await notificationTriggers.onOrderReady(orderId);
      toast.success('¡Notificación de pedido listo enviada!');
      onNotificationSent?.();
    } catch (error) {
      console.error('Error sending ready notification:', error);
      toast.error('Error al enviar la notificación');
    } finally {
      setSendingReady(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) {
      toast.error('Escribí un mensaje');
      return;
    }

    setSendingCustom(true);
    try {
      // Use Evolution API client to send custom message
      await evolutionClient.sendTextMessage({
        number: customerPhone,
        text: customMessage.trim(),
        delay: 0
      });
      
      toast.success('¡Mensaje personalizado enviado!');
      setCustomMessage('');
      setIsCustomDialogOpen(false);
      onNotificationSent?.();
    } catch (error) {
      console.error('Error sending custom message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setSendingCustom(false);
    }
  };

  const getNotificationStatusBadge = () => {
    if (!lastNotification) {
      return (
        <Badge variant="outline" className="text-xs">
          <Clock className="mr-1 h-3 w-3" />
          Sin notificaciones
        </Badge>
      );
    }

    const statusLabel = getNotificationStatusLabel(lastNotification.status);

    if (lastNotification.status === 'sent') {
      return (
        <Badge variant="default" className="text-xs bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          {statusLabel}
        </Badge>
      );
    }

    if (lastNotification.status === 'failed') {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="mr-1 h-3 w-3" />
          {statusLabel}
        </Badge>
      );
    }

    if (lastNotification.status === 'pending') {
      return (
        <Badge variant="secondary" className="text-xs">
          <Clock className="mr-1 h-3 w-3" />
          {statusLabel}
        </Badge>
      );
    }

    return null;
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-2">
      {/* Notification Status */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Estado de la notificación:</span>
        {getNotificationStatusBadge()}
      </div>

      {lastNotification && (
        <div className="text-xs text-muted-foreground space-y-1">
          {lastNotification.sent_at && (
            <p>Último envío: {formatTimestamp(lastNotification.sent_at)}</p>
          )}
          {lastNotification.notification_type && (
            <p>Tipo: {getNotificationTypeLabel(lastNotification.notification_type)}</p>
          )}
          {lastNotification.attempts > 1 && (
            <p>Intentos: {lastNotification.attempts}</p>
          )}
          {lastNotification.error_message && (
            <p className="text-destructive">Error: {lastNotification.error_message}</p>
          )}
        </div>
      )}

      {hasFailedNotifications && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>Fallaron las notificaciones - requiere atención</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {/* Only show "Notificar Pronto" button if order is NOT ready or completed */}
        {orderStatus !== 'ready' && orderStatus !== 'completed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendReadyNotification}
            disabled={sendingReady}
            className="flex-1"
          >
            <Bell className="mr-1 h-3 w-3" />
            {sendingReady ? 'Enviando...' : 'Notificar Listo'}
          </Button>
        )}

        {/* Custom message button - always available */}
        <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className={orderStatus === 'ready' || orderStatus === 'completed' ? 'flex-1' : ''}>
              <MessageSquare className="mr-1 h-3 w-3" />
              Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar mensaje personalizado</DialogTitle>
              <DialogDescription>
                Enviá un mensaje de WhatsApp personalizado a {customerName} ({customerPhone})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="custom-message">Mensaje</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Escribí tu mensaje aquí..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={5}
                  maxLength={4096}
                />
                <p className="text-xs text-muted-foreground">
                  {customMessage.length}/4096 caracteres
                </p>
              </div>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Vista previa:</p>
                <p className="whitespace-pre-wrap">{customMessage || 'Tu mensaje aparecerá aquí...'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCustomDialogOpen(false)}
                disabled={sendingCustom}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendCustomMessage}
                disabled={sendingCustom || !customMessage.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                {sendingCustom ? 'Enviando...' : 'Enviar mensaje'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
