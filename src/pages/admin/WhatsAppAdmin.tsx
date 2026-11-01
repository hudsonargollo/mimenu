import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock,
  RefreshCw,
  Activity,
  XCircle,
  Smartphone,
  Wifi,
  WifiOff,
  MessageCircle,
  SendHorizontal,
  FileText,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { UniformHeader } from '@/components/UniformHeader';
import { WhatsAppErrorLogViewer } from '@/components/WhatsAppErrorLogViewer';

interface ConnectionInfo {
  phoneNumber?: string;
  connectedAt?: string;
  profileName?: string;
}

interface WhatsAppStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  deliveryRate: number;
  lastActivity?: string;
}

export default function WhatsAppAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // WhatsApp connection state
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [stats, setStats] = useState<WhatsAppStats>({
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
    deliveryRate: 0
  });
  
  // Test phone number - start with empty, will be set from API
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');

  useEffect(() => {
    checkConnectionStatus();
    loadStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      checkConnectionStatus();
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/connection?action=status');
      const data = await response.json();
      
      console.log('Connection status response:', data);
      
      if (data.isConnected) {
        setConnectionStatus('connected');
        
        // Extract phone number from various possible fields
        let phoneNumber = data.phoneNumber || data.phone || data.number;
        
        // If phone number has @s.whatsapp.net suffix, remove it
        if (phoneNumber && phoneNumber.includes('@')) {
          phoneNumber = phoneNumber.split('@')[0];
        }
        
        // Extract from instance data if available (try ownerJid first as it's the actual connected number)
        if (!phoneNumber && data.instanceData) {
          const instancePhone = data.instanceData.ownerJid || data.instanceData.owner || data.instanceData.phoneNumber || data.instanceData.number;
          if (instancePhone && instancePhone.includes('@')) {
            phoneNumber = instancePhone.split('@')[0];
          } else {
            phoneNumber = instancePhone;
          }
        }
        
        setConnectionInfo({
          phoneNumber,
          connectedAt: data.lastConnected || data.connectedAt || data.instance?.createdAt,
          profileName: data.profileName || data.name || data.instance?.profileName
        });
        
        // Always update test number with connected number
        if (phoneNumber) {
          // Clear any old cached value and set the new one
          localStorage.removeItem('whatsapp_test_number');
          setTestPhoneNumber(phoneNumber);
          localStorage.setItem('whatsapp_test_number', phoneNumber);
        }
      } else {
        setConnectionStatus('disconnected');
        setConnectionInfo(null);
        // Set default number if disconnected and no number is set
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch real WhatsApp notification stats from Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get all WhatsApp notifications
      const { data: notifications, error } = await supabase
        .from('whatsapp_notifications')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching WhatsApp stats:', error);
        return;
      }

      const totalSent = notifications?.length || 0;
      const totalFailed = notifications?.filter(n => n.status === 'failed').length || 0;
      const totalPending = notifications?.filter(n => n.status === 'pending').length || 0;
      const deliveryRate = totalSent > 0 ? ((totalSent - totalFailed) / totalSent) * 100 : 0;
      const lastActivity = notifications?.[0]?.created_at || new Date().toISOString();

      setStats({
        totalSent,
        totalFailed,
        totalPending,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        lastActivity
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleConnectWhatsApp = async () => {
    setShowConnectionDialog(true);
    setConnectionStatus('connecting');
    setQrCode(null);

    try {
      // First check if already connected
      const statusResponse = await fetch('/api/whatsapp/connection?action=status');
      const statusData = await statusResponse.json();

      if (statusData.isConnected) {
        setConnectionStatus('connected');
        setConnectionInfo({
          phoneNumber: statusData.phoneNumber,
          connectedAt: statusData.lastConnected,
          profileName: statusData.profileName
        });
        toast.success('¡WhatsApp ya está conectado!');
        setShowConnectionDialog(false);
        return;
      }

      // Try to get QR code directly first
      const qrResponse = await fetch('/api/whatsapp/qr-code');
      const qrData = await qrResponse.json();

      if (qrData.success && qrData.qrCode) {
        console.log('QR Code received, length:', qrData.qrCode.length);
        console.log('QR Code starts with:', qrData.qrCode.substring(0, 100));
        
        // Clean up any double prefixes that might exist
        let cleanQrCode = qrData.qrCode;
        if (cleanQrCode.startsWith('data:image/png;base64,data:image/png;base64,')) {
          cleanQrCode = cleanQrCode.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
          console.log('Removed double prefix, new length:', cleanQrCode.length);
        }
        
        setQrCode(cleanQrCode);
        pollConnectionStatus();
        return;
      }

      // Try restart if QR code generation failed
      const restartResponse = await fetch('/api/whatsapp/connection?action=restart', {
        method: 'POST'
      });

      if (restartResponse.ok) {
        const restartData = await restartResponse.json();
        if (restartData.qrCode) {
          console.log('QR Code from restart, length:', restartData.qrCode.length);
          
          // Clean up any double prefixes that might exist
          let cleanQrCode = restartData.qrCode;
          if (cleanQrCode.startsWith('data:image/png;base64,data:image/png;base64,')) {
            cleanQrCode = cleanQrCode.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
          }
          
          setQrCode(cleanQrCode);
          pollConnectionStatus();
          return;
        }
      }

      // Fallback to connect action
      const response = await fetch('/api/whatsapp/connection?action=connect');
      const data = await response.json();

      if (data.qrCode) {
        console.log('QR Code from connect, length:', data.qrCode.length);
        
        // Clean up any double prefixes that might exist
        let cleanQrCode = data.qrCode;
        if (cleanQrCode.startsWith('data:image/png;base64,data:image/png;base64,')) {
          cleanQrCode = cleanQrCode.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
        }
        
        setQrCode(cleanQrCode);
        pollConnectionStatus();
      } else if (data.isConnected) {
        setConnectionStatus('connected');
        setConnectionInfo({
          phoneNumber: data.phoneNumber,
          connectedAt: data.lastConnected,
          profileName: data.profileName
        });
        toast.success('¡WhatsApp conectado con éxito!');
        setShowConnectionDialog(false);
      } else {
        // Start polling for QR code if not immediately available
        toast.info('Generando código QR... Esperá unos segundos.');
        pollForQrCode();
      }
    } catch (error) {
      console.error('Failed to connect WhatsApp:', error);
      toast.error('Error al conectar WhatsApp. Verificá la conexión con la API.');
      setConnectionStatus('disconnected');
    }
  };

  const pollConnectionStatus = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/whatsapp/connection?action=status');
        const data = await response.json();

        if (data.isConnected) {
          setConnectionStatus('connected');
          setConnectionInfo({
            phoneNumber: data.phoneNumber,
            connectedAt: data.lastConnected,
            profileName: data.profileName
          });
          setQrCode(null);
          setShowConnectionDialog(false);
          clearInterval(pollInterval);
          toast.success('¡WhatsApp conectado con éxito!');
        }
      } catch (error) {
        console.error('Failed to poll connection status:', error);
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (connectionStatus === 'connecting') {
        setConnectionStatus('disconnected');
        toast.error('Se excedió el tiempo límite de conexión');
      }
    }, 120000);
  };

  const pollForQrCode = () => {
    const qrPollInterval = setInterval(async () => {
      try {
        // Try the dedicated QR code endpoint first
        const qrResponse = await fetch('/api/whatsapp/qr-code');
        const qrData = await qrResponse.json();

        if (qrData.success && qrData.qrCode) {
          console.log('QR Code from polling, length:', qrData.qrCode.length);
          
          // Clean up any double prefixes that might exist
          let cleanQrCode = qrData.qrCode;
          if (cleanQrCode.startsWith('data:image/png;base64,data:image/png;base64,')) {
            cleanQrCode = cleanQrCode.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
          }
          
          setQrCode(cleanQrCode);
          clearInterval(qrPollInterval);
          pollConnectionStatus();
          return;
        }

        // Fallback to connection endpoint
        const response = await fetch('/api/whatsapp/connection?action=connect');
        const data = await response.json();

        if (data.qrCode) {
          console.log('QR Code from polling fallback, length:', data.qrCode.length);
          
          // Clean up any double prefixes that might exist
          let cleanQrCode = data.qrCode;
          if (cleanQrCode.startsWith('data:image/png;base64,data:image/png;base64,')) {
            cleanQrCode = cleanQrCode.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
          }
          
          setQrCode(cleanQrCode);
          clearInterval(qrPollInterval);
          pollConnectionStatus();
        } else if (data.isConnected) {
          setConnectionStatus('connected');
          setConnectionInfo({
            phoneNumber: data.phoneNumber,
            connectedAt: data.lastConnected,
            profileName: data.profileName
          });
          clearInterval(qrPollInterval);
          setShowConnectionDialog(false);
          toast.success('¡WhatsApp conectado con éxito!');
        }
      } catch (error) {
        console.error('Failed to poll for QR code:', error);
      }
    }, 3000);

    // Stop polling after 45 seconds
    setTimeout(() => {
      clearInterval(qrPollInterval);
      if (!qrCode && connectionStatus === 'connecting') {
        toast.error('No se pudo generar el código QR. Intentá reiniciar la conexión.');
        setConnectionStatus('disconnected');
      }
    }, 45000);
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/whatsapp/connection?action=disconnect', {
        method: 'POST'
      });

      setConnectionStatus('disconnected');
      setConnectionInfo(null);
      setShowConnectionDialog(false);
      toast.success('WhatsApp desconectado');
    } catch (error) {
      console.error('Failed to disconnect WhatsApp:', error);
      toast.error('Error al desconectar WhatsApp');
    }
  };

  const handleTestMessage = async () => {
    if (connectionStatus !== 'connected') {
      toast.error('WhatsApp no está conectado. Conectá primero para enviar mensajes.');
      return;
    }

    if (!testPhoneNumber) {
      toast.error('Ingresá un número de prueba.');
      return;
    }

    // Save to localStorage
    localStorage.setItem('whatsapp_test_number', testPhoneNumber);

    try {
      toast.info(`Enviando mensaje de prueba a ${testPhoneNumber}...`);
      
      const response = await fetch('/api/whatsapp/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          message: '🥥 Prueba de conexión de WhatsApp - MiMenu ✅\n\nSi recibiste este mensaje, el sistema de notificaciones está funcionando perfectamente.\n\n📱 Mensaje enviado el: ' + new Date().toLocaleString('es-BO')
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ ¡Mensaje de prueba enviado con éxito!');
        // Update stats after successful test
        loadStats();
      } else {
        console.error('Test message failed:', data);
        toast.error(`❌ Error al enviar el mensaje: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Failed to send test message:', error);
      toast.error('❌ Error de conexión al enviar el mensaje de prueba');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-white shadow-soft rounded-lg border-2 border-accent">
            <TabsTrigger value="overview" className="font-display uppercase tracking-wider rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white shadow-soft">
              <Activity className="h-4 w-4 mr-2" />
              Vista general
            </TabsTrigger>
            <TabsTrigger value="logs" className="font-display uppercase tracking-wider rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white shadow-soft">
              <FileText className="h-4 w-4 mr-2" />
              Registro de errores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
        {/* Connection Status Card */}
        <Card className={connectionStatus === 'connected' ? 'border-2 border-accent bg-white shadow-soft rounded-xl' : 'border-2 border-accent bg-white shadow-soft rounded-xl'}>
          <CardHeader className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl flex-shrink-0 ${connectionStatus === 'connected' ? 'bg-green-100' : 'bg-orange-100'}`}>
                <MessageCircle className={`h-8 w-8 ${connectionStatus === 'connected' ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className={`text-xl font-bold ${connectionStatus === 'connected' ? 'text-green-800' : 'text-orange-800'}`}>
                  {connectionStatus === 'connected' ? 'Notificaciones activas' : 'Notificaciones por WhatsApp'}
                </CardTitle>
                {connectionStatus === 'connected' && connectionInfo?.phoneNumber ? (
                  <CardDescription className="text-green-700 font-medium mt-1.5 flex items-center gap-1.5 text-sm">
                    <Smartphone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{connectionInfo.phoneNumber}</span>
                  </CardDescription>
                ) : (
                  <CardDescription className="text-orange-700 mt-1.5 text-sm">
                    Conectá tu cuenta para enviar alertas
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="w-full pt-1">
              {connectionStatus === 'connected' ? (
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="default"
                  className="border-red-200 text-red-700 hover:bg-red-50 h-11 text-sm w-full"
                >
                  <WifiOff className="h-5 w-5 mr-2" />
                  Desconectar
                </Button>
              ) : (
                <Button
                  onClick={handleConnectWhatsApp}
                  size="default"
                  className="bg-green-600 hover:bg-green-700 h-11 text-sm w-full"
                >
                  <Wifi className="h-5 w-5 mr-2" />
                  Conectar Agora
                </Button>
              )}
            </div>
          </CardHeader>
          {connectionStatus === 'connected' && connectionInfo?.connectedAt && (
            <CardContent className="pt-0 pb-4 border-t">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-4">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Conectado el: {new Date(connectionInfo.connectedAt).toLocaleString('es-BO')}</span>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Enviados</CardTitle>
              <Send className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalSent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.deliveryRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Fallidos</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalFailed}</div>
              <p className="text-xs text-muted-foreground">
                Errores de entrega
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalPending}</div>
              <p className="text-xs text-muted-foreground">
                Esperando envío
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Tiempo promedio</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">0s</div>
              <p className="text-xs text-muted-foreground">
                Tiempo de entrega
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Connection Card */}
        <Card className="border-2 border-accent rounded-xl shadow-soft">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Probar notificaciones
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enviá un mensaje de prueba para verificar la conexión
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Número de WhatsApp</Label>
              <Input
                placeholder="Ex: 5573987387231"
                value={testPhoneNumber}
                onChange={(e) => {
                  setTestPhoneNumber(e.target.value);
                  localStorage.setItem('whatsapp_test_number', e.target.value);
                }}
                className="h-10"
                disabled={connectionStatus !== 'connected'}
              />
              {connectionInfo?.phoneNumber && (
                <p className="text-xs text-muted-foreground">
                  Número conectado: {connectionInfo.phoneNumber}
                </p>
              )}
            </div>

            <Button
              onClick={handleTestMessage}
              disabled={connectionStatus !== 'connected' || !testPhoneNumber}
              className="w-full bg-green-600 hover:bg-green-700 h-10"
            >
              <SendHorizontal className="h-4 w-4 mr-2" />
              Enviar mensaje de prueba
            </Button>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="logs">
            <WhatsAppErrorLogViewer />
          </TabsContent>
        </Tabs>

        {/* WhatsApp Connection Dialog */}
        <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto mx-6 sm:mx-auto">
            <DialogHeader className="space-y-1 pr-8">
              <DialogTitle className="text-lg font-bold">Conectar WhatsApp</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Escaneá el código QR
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-4 space-y-4 px-2">
              {connectionStatus === 'connecting' && qrCode ? (
                <>
                  <div className="bg-white p-3 rounded-xl border-2 border-gray-300 shadow-sm">
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="w-44 h-44 sm:w-52 sm:h-52"
                      onError={() => {
                        console.error('QR Code image failed to load');
                        console.error('QR Code data length:', qrCode?.length);
                        console.error('QR Code starts with:', qrCode?.substring(0, 100));
                      }}
                      onLoad={() => {
                        console.log('QR Code image loaded successfully');
                      }}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Passos:</p>
                    <ol className="text-sm text-gray-700 space-y-1.5 bg-gray-50 p-3 rounded-lg">
                      <li className="flex gap-2">
                        <span className="font-semibold text-green-600 flex-shrink-0">1.</span>
                        <span>Abrí WhatsApp en el celular</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-green-600 flex-shrink-0">2.</span>
                        <span>Andá a <strong>Configuración</strong> → <strong>Dispositivos vinculados</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-green-600 flex-shrink-0">3.</span>
                        <span>Tocá <strong>Conectar dispositivo</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-green-600 flex-shrink-0">4.</span>
                        <span>Escaneá este código QR</span>
                      </li>
                    </ol>
                  </div>
                </>
              ) : connectionStatus === 'connecting' ? (
                <div className="flex flex-col items-center space-y-4 py-8">
                  <RefreshCw className="h-14 w-14 animate-spin text-green-600" />
                  <div className="text-center space-y-1">
                    <p className="text-base font-medium text-gray-900">Generando código QR</p>
                    <p className="text-sm text-gray-500">Esperá...</p>
                  </div>
                </div>
              ) : connectionStatus === 'connected' ? (
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Wifi className="h-14 w-14 text-green-600" />
                  </div>
                  <div className="text-center space-y-2 w-full">
                    <p className="text-lg font-bold text-green-700">Conectado!</p>
                    {connectionInfo && connectionInfo.phoneNumber && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p><strong>Número:</strong> {connectionInfo.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-6">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <WifiOff className="h-14 w-14 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Desconectado</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}