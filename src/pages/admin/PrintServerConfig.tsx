import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { printServerClient } from '@/integrations/print-server/client';
import { 
  Printer, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download,
  PlayCircle,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const PrintServerConfig = () => {
  const navigate = useNavigate();
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<any>(null);

  useEffect(() => {
    // Load saved URL
    const saved = printServerClient.getServerUrl();
    setServerUrl(saved);
    
    // Check connection on mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const available = await printServerClient.checkAvailability();
      setIsConnected(available);
      
      if (available) {
        const status = await printServerClient.getStatus();
        setPrinterStatus(status);
        toast.success('¡Servidor de impresión conectado!');
      } else {
        setPrinterStatus(null);
        toast.error('Servidor de impresión no encontrado');
      }
    } catch (error) {
      setIsConnected(false);
      setPrinterStatus(null);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveUrl = () => {
    printServerClient.setServerUrl(serverUrl);
    toast.success('¡URL guardada con éxito!');
    checkConnection();
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${serverUrl}/test-print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('¡Impresión de prueba enviada!');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message || 'Fallo en la impresión'}`);
      }
    } catch (error) {
      toast.error('Error al enviar la impresión de prueba');
    } finally {
      setIsTesting(false);
    }
  };

  const handleReconnect = async () => {
    try {
      const response = await fetch(`${serverUrl}/reconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('¡Impresora reconectada!');
        checkConnection();
      } else {
        toast.error('Fallo al reconectar la impresora');
      }
    } catch (error) {
      toast.error('Error al reconectar');
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadInstallScript = () => {
    const content = `@echo off
REM PONTAL Carapitangui Print Server - Windows Service Installer

echo.
echo ========================================
echo   PONTAL Carapitangui Print Server
echo   Windows Service Installer
echo ========================================
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: This script requires administrator privileges!
    echo.
    echo Please right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Running with administrator privileges...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

echo Installing Windows service...
echo This may take a few moments...
echo.

REM Install the service
node install-service.js

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo The print server is now installed as a Windows service.
echo It will start automatically when Windows starts.
echo.
echo To manage the service:
echo   1. Press Win+R
echo   2. Type: services.msc
echo   3. Find "PONTAL Carapitangui Print Server"
echo   4. Right-click to Stop, Start, or Restart
echo.
echo To uninstall the service:
echo   Run: uninstall-windows-service.bat
echo.
pause`;
    
    downloadFile('install-windows-service.bat', content);
    toast.success('¡Script de instalación descargado!');
  };

  const downloadStartScript = () => {
    const content = `@echo off
REM PONTAL Carapitangui Print Server - Windows Startup Script

echo.
echo ========================================
echo   PONTAL Carapitangui Print Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    echo.
)

echo Starting print server...
echo.
echo The server will run at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Start the server
node server.js

pause`;
    
    downloadFile('start-server.bat', content);
    toast.success('¡Script de inicio descargado!');
  };

  const downloadGuide = () => {
    const content = `# Guía de Instalación - Servidor de Impresión (Windows)

## Requisitos

- Windows 10 u 11
- Node.js 16 o superior (descargalo en: https://nodejs.org)
- Impresora térmica USB (compatible con ESC/POS)
- Privilegios de administrador

## Paso 1: Instalar Node.js

1. Ingresá a https://nodejs.org
2. Descargá la versión LTS (recomendada)
3. Ejecutá el instalador
4. Reiniciá la computadora

## Paso 2: Descargar los archivos del servidor

1. Descargá todos los archivos del servidor de impresión
2. Colocalos en una carpeta permanente: C:\\CocoLoko\\print-server\\

Archivos necesarios:
- server.js
- package.json
- install-service.js
- install-windows-service.bat (ya descargado)
- start-server.bat (ya descargado)

## Paso 3: Conectar la impresora

1. Conectá la impresora térmica por USB
2. Encendé la impresora
3. Esperá a que Windows la reconozca

## Paso 4: Instalar como servicio

1. Hacé clic derecho en install-windows-service.bat
2. Seleccioná "Ejecutar como administrador"
3. Esperá a que termine la instalación

## Paso 5: Probar

1. Abrí el navegador
2. Ingresá a: http://localhost:3001/health
3. Debe mostrar: "status": "ok"

## Gestionar el servicio

Abrir Servicios de Windows:
1. Presioná Win + R
2. Escribí: services.msc
3. Buscá "PONTAL Carapitangui Print Server"

## Solución de problemas

### El servidor no inicia
- Verificá si Node.js está instalado
- Ejecutá como administrador
- Verificá que el puerto 3001 no esté en uso

### Impresora no detectada
- Verificá la conexión USB
- Asegurate de que esté encendida
- Probá con otro puerto USB
- Reiniciá el servicio

Para más información, ingresá al repositorio del proyecto.`;
    
    downloadFile('GUIA_INSTALACAO.txt', content);
    toast.success('¡Guía de instalación descargada!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
          <AdminPageHeader
            index="14"
            eyebrow="Impresión"
            title="Servidor de impresión"
            description="Conexión local ESC/POS para comandas y recibos."
          />

          {/* Quick Download Card */}
          <Card className="border-2 border-accent bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Descarga rápida
              </CardTitle>
              <CardDescription>
                Descargá los archivos necesarios para instalar el servidor de impresión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={downloadInstallScript} 
                  variant="outline"
                  className="h-auto py-4 flex-col items-start bg-white hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-semibold">Script de instalación</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    install-windows-service.bat
                  </span>
                </Button>
                
                <Button 
                  onClick={downloadStartScript} 
                  variant="outline"
                  className="h-auto py-4 flex-col items-start bg-white hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PlayCircle className="h-4 w-4" />
                    <span className="font-semibold">Script de Teste</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    start-server.bat
                  </span>
                </Button>
                
                <Button 
                  onClick={downloadGuide} 
                  variant="outline"
                  className="h-auto py-4 flex-col items-start bg-white hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-semibold">Guía de instalación</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    GUIA_INSTALACAO.txt
                  </span>
                </Button>
                
                <Button 
                  onClick={() => window.open('https://github.com/hudsonargollo/praia-pix-order/tree/main/print-server', '_blank')}
                  variant="outline"
                  className="h-auto py-4 flex-col items-start bg-white hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-semibold">Arquivos Completos</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    GitHub Repository
                  </span>
                </Button>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Importante:</strong> Además de los scripts anteriores, vas a necesitar descargar los archivos server.js, package.json e install-service.js del{' '}
                  <a 
                    href="https://github.com/hudsonargollo/praia-pix-order/tree/main/print-server" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    repositório GitHub
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          {/* Status Card */}
          <Card className="border-2 border-accent rounded-xl shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5" />
                    Estado del servidor
                  </CardTitle>
                  <CardDescription>
                    Servidor local de impresión térmica
                  </CardDescription>
                </div>
                <div>
                  {isConnected === null ? (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Verificando...
                    </Badge>
                  ) : isConnected ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Desconectado
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {printerStatus && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Servidor</p>
                    <p className="text-lg font-bold text-green-700">
                      {printerStatus.serverRunning ? 'En ejecución' : 'Detenido'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Impressora</p>
                    <p className="text-lg font-bold text-green-700">
                      {printerStatus.printerConnected ? 'Conectada' : 'Desconectada'}
                    </p>
                  </div>
                  {printerStatus.printers && printerStatus.printers.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Impresoras detectadas:</p>
                      {printerStatus.printers.map((printer: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                          Vendor ID: {printer.vendorId} | Product ID: {printer.productId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isConnected && isConnected !== null && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El servidor de impresión no está en ejecución. Asegurate de que esté instalado e iniciado.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card className="border-2 border-accent rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
              <CardDescription>
                Configurá la URL del servidor de impresión local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverUrl">URL del servidor</Label>
                <div className="flex gap-2">
                  <Input
                    id="serverUrl"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://localhost:3001"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveUrl} variant="outline">
                    Guardar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  URL predeterminada: http://localhost:3001
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={checkConnection} 
                  disabled={isChecking}
                  variant="outline"
                  className="flex-1"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Probar conexión
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleTestPrint} 
                  disabled={!isConnected || isTesting}
                  className="flex-1"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Imprimiendo...
                    </>
                  ) : (
                    <>
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir prueba
                    </>
                  )}
                </Button>
              </div>

              {isConnected && (
                <Button 
                  onClick={handleReconnect} 
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reconectar impresora
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Installation Guide Card */}
          <Card className="border-2 border-accent rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Instalación del servidor
              </CardTitle>
              <CardDescription>
                Guía rápida para instalar el servidor de impresión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El servidor de impresión debe instalarse en cada computadora que tenga una impresora térmica conectada.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary/90 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Instalá Node.js</p>
                    <p className="text-sm text-muted-foreground">
                      Descargá e instalá Node.js desde{' '}
                      <a 
                        href="https://nodejs.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        nodejs.org
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary/90 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-2">Descargá los archivos de instalación</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Descargá los scripts necesarios para instalar el servidor
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={downloadInstallScript} 
                        variant="outline" 
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        install-windows-service.bat
                      </Button>
                      <Button 
                        onClick={downloadStartScript} 
                        variant="outline" 
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        start-server.bat
                      </Button>
                      <Button 
                        onClick={downloadGuide} 
                        variant="outline" 
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Guía completa
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Nota: también vas a necesitar los archivos server.js, package.json e install-service.js del repositorio
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary/90 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Conectá la impresora USB</p>
                    <p className="text-sm text-muted-foreground">
                      Conectá tu impresora térmica por USB y asegurate de que esté encendida
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary/90 font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Instalá como servicio de Windows</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Hacé clic derecho en <code className="bg-gray-100 px-1 rounded">install-windows-service.bat</code> y seleccioná "Ejecutar como administrador"
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Inicia automaticamente
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Se ejecuta en segundo plano
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary/90 font-bold">
                    5
                  </div>
                  <div>
                    <p className="font-medium">Probá la conexión</p>
                    <p className="text-sm text-muted-foreground">
                      Usá el botón "Probar conexión" de arriba para verificar si el servidor está en ejecución
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Consejo:</strong> Para una prueba rápida, podés ejecutar <code className="bg-blue-100 px-1 rounded">start-server.bat</code> sin instalarlo como servicio. Pero vas a tener que iniciarlo manualmente cada vez.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Troubleshooting Card */}
          <Card className="border-2 border-accent rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle>Solución de problemas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm">El servidor no conecta</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                  <li>Verificá si Node.js está instalado</li>
                  <li>Asegurate de que el servicio esté en ejecución (services.msc)</li>
                  <li>Verificá que el puerto 3001 no esté en uso</li>
                  <li>Intentá reiniciar el servicio</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-sm">Impresora no detectada</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                  <li>Verificá la conexión USB</li>
                  <li>Asegurate de que la impresora esté encendida</li>
                  <li>Probá con otro puerto USB</li>
                  <li>Usá el botón "Reconectar impresora"</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-sm">La impresión no funciona</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                  <li>Verificá que la impresora tenga papel</li>
                  <li>Probá con "Imprimir prueba"</li>
                  <li>Reconectá la impresora</li>
                  <li>Reiniciá el servicio de Windows</li>
                </ul>
              </div>
            </CardContent>
          </Card>

      </div>
    </AdminLayout>
  );
};

export default PrintServerConfig;
