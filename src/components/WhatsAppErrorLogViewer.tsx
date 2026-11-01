import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, AlertCircle, Info, XCircle, RefreshCw, Filter, Eye } from 'lucide-react';
import { useAllWhatsAppErrors, type WhatsAppError } from '@/hooks/useWhatsAppErrors';
import { formatPhoneNumber } from '@/lib/phoneUtils';

const severityConfig = {
  critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Crítico' },
  high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Alto' },
  medium: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Medio' },
  low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Bajo' },
};

const categoryLabels: Record<string, string> = {
  connection: 'Conexión',
  authentication: 'Autenticación',
  message_delivery: 'Entrega de mensaje',
  phone_validation: 'Validación de teléfono',
  rate_limit: 'Límite de tasa',
  network: 'Red',
  database: 'Base de datos',
  configuration: 'Configuración',
  unknown: 'Desconocido',
};

export function WhatsAppErrorLogViewer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdFilter = searchParams.get('orderId');
  
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [selectedError, setSelectedError] = useState<WhatsAppError | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getSinceDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  };

  const { errors, loading, refresh } = useAllWhatsAppErrors({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
    since: getSinceDate(),
    limit: 100,
  });

  // Filter by order ID if provided
  const filteredErrors = orderIdFilter
    ? errors.filter(e => e.order_id === orderIdFilter)
    : errors;

  const handleViewDetails = (error: WhatsAppError) => {
    setSelectedError(error);
    setShowDetailsDialog(true);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Calculate statistics
  const stats = {
    total: filteredErrors.length,
    critical: filteredErrors.filter(e => e.severity === 'critical').length,
    high: filteredErrors.filter(e => e.severity === 'high').length,
    medium: filteredErrors.filter(e => e.severity === 'medium').length,
    low: filteredErrors.filter(e => e.severity === 'low').length,
    retryable: filteredErrors.filter(e => e.is_retryable).length,
  };

  const errorsByCategory = filteredErrors.reduce((acc, error) => {
    acc[error.category] = (acc[error.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Registro de errores de WhatsApp</CardTitle>
              <CardDescription className="text-sm">
                {orderIdFilter ? 'Errores filtrados por pedido' : 'Historial de errores y fallas'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground px-1">Período</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground px-1">Severidad</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="low">Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground px-1">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {orderIdFilter && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground px-1">Filtro activo</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchParams({})}
                  className="w-full justify-start"
                >
                  Limpiar filtro de pedido
                </Button>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-xs text-muted-foreground">Altos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.retryable}</div>
              <div className="text-xs text-muted-foreground">Reintentables</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      {loading ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando errores...</p>
        </Card>
      ) : filteredErrors.length === 0 ? (
        <Card className="p-8 text-center">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-lg font-medium text-gray-700">Ningún error encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            {orderIdFilter 
              ? 'No hay errores registrados para este pedido'
              : 'No hay errores en el período seleccionado'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredErrors.map((error) => {
            const config = severityConfig[error.severity as keyof typeof severityConfig] || severityConfig.medium;
            const Icon = config.icon;

            return (
              <Card 
                key={error.id} 
                className={`${config.bg} ${config.border} border-l-4 hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handleViewDetails(error)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${config.color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                            <Badge variant="secondary">
                              {categoryLabels[error.category] || error.category}
                            </Badge>
                            {error.is_retryable && (
                              <Badge variant="outline" className="text-blue-600">
                                Reintentable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-2">
                            {error.error_message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(error);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{formatTimestamp(error.created_at)}</span>
                        {error.order_id && (
                          <span>Pedido: {error.context?.orderNumber || error.order_id.substring(0, 8)}</span>
                        )}
                        {error.customer_phone && (
                          <span>Tel: {formatPhoneNumber(error.customer_phone)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Error Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del error</DialogTitle>
            <DialogDescription>
              Información completa sobre el error
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              {/* Severity and Category */}
              <div className="flex gap-2">
                <Badge variant="outline" className={severityConfig[selectedError.severity as keyof typeof severityConfig]?.color}>
                  {severityConfig[selectedError.severity as keyof typeof severityConfig]?.label || selectedError.severity}
                </Badge>
                <Badge variant="secondary">
                  {categoryLabels[selectedError.category] || selectedError.category}
                </Badge>
                {selectedError.is_retryable && (
                  <Badge variant="outline" className="text-blue-600">
                    Reintentable
                  </Badge>
                )}
              </div>

              {/* Error Message */}
              <div>
                <h4 className="text-sm font-semibold mb-1">Mensaje de error</h4>
                <p className="text-sm bg-gray-50 p-3 rounded border">
                  {selectedError.error_message}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Fecha/Hora</h4>
                  <p className="text-muted-foreground">{formatTimestamp(selectedError.created_at)}</p>
                </div>
                {selectedError.order_id && (
                  <div>
                    <h4 className="font-semibold mb-1">ID del pedido</h4>
                    <p className="text-muted-foreground font-mono text-xs">{selectedError.order_id}</p>
                  </div>
                )}
                {selectedError.customer_phone && (
                  <div>
                    <h4 className="font-semibold mb-1">Telefone</h4>
                    <p className="text-muted-foreground">{formatPhoneNumber(selectedError.customer_phone)}</p>
                  </div>
                )}
                {selectedError.notification_id && (
                  <div>
                    <h4 className="font-semibold mb-1">ID de la notificación</h4>
                    <p className="text-muted-foreground font-mono text-xs">{selectedError.notification_id}</p>
                  </div>
                )}
              </div>

              {/* Context */}
              {selectedError.context && Object.keys(selectedError.context).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Contexto</h4>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              )}

              {/* Stack Trace */}
              {selectedError.error_stack && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Stack Trace</h4>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto max-h-48">
                    {selectedError.error_stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
