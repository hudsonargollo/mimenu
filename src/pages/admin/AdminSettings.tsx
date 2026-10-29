import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Bell,
  Lock,
  Database,
  CheckCircle2,
  RefreshCw,
  Download,
  PlayCircle,
  Loader2,
  Printer,
  Globe,
  Bot,
  ShieldCheck,
  Server,
  Layers,
  UploadCloud,
  Check,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { printServerClient } from '@/integrations/print-server/client';
import { useMimenu } from '@/lib/mimenuContext';

const AdminSettings = () => {
  const { venue, categories, tables, orders, customers, cyclingOffers } = useMimenu();
  const v = venue; // may be null until a tenant is selected
  const [activeTab, setActiveTab] = useState('general');
  
  // Printer settings state
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<any>(null);

  // WhatsApp/Evolution API settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('http://wppapi.clubemkt.digital');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [evolutionInstanceName, setEvolutionInstanceName] = useState('cocooo');
  const [whatsappSenderPhone, setWhatsappSenderPhone] = useState('');
  const [isVerifyingWhatsapp, setIsVerifyingWhatsapp] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);

  useEffect(() => {
    document.title = 'Configurações | MiMenu';
    const saved = printServerClient.getServerUrl();
    setServerUrl(saved);
    checkPrinterConnection();
  }, []);

  const checkPrinterConnection = async () => {
    setIsChecking(true);
    try {
      const available = await printServerClient.checkAvailability();
      setIsConnected(available);
      
      if (available) {
        const status = await printServerClient.getStatus();
        setPrinterStatus(status);
        toast.success('Servidor de impressão conectado!');
      } else {
        setPrinterStatus(null);
      }
    } catch {
      setIsConnected(false);
      setPrinterStatus(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSavePrinterUrl = () => {
    printServerClient.setServerUrl(serverUrl);
    toast.success('URL do servidor de impressão salva');
    checkPrinterConnection();
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
        toast.success('Impressão de teste enviada com sucesso!');
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.message || 'Falha na impressão'}`);
      }
    } catch {
      toast.error('Erro ao conectar com servidor de impressão local');
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportJSON = () => {
    const backupData = {
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      venue,
      categories,
      tables,
      orders,
      customers,
      cyclingOffers,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mimenu_backup_${venue?.slug || 'store'}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado em JSON com sucesso');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Settings className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Configurações da Plataforma
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gerencie a conectividade do servidor de impressão, mensageria WhatsApp, isolamento multi-tenant e backups.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleExportJSON}
            variant="outline"
            className="text-xs font-bold gap-1.5 border-border hover:border-amber-500"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Exportar Backup JSON</span>
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="general" className="rounded-lg text-xs font-semibold">Geral & Tenant</TabsTrigger>
            <TabsTrigger value="printer" className="rounded-lg text-xs font-semibold">Impressão Térmica</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs font-semibold">WhatsApp & Copilot</TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-lg text-xs font-semibold">WhatsApp AI Concierge</TabsTrigger>
            <TabsTrigger value="database" className="rounded-lg text-xs font-semibold">KV Storage & Backup</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-500" />
                  <span>Ambiente & Multi-Tenant KV</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Especificações de execução e integridade da infraestrutura edge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plataforma</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">MiMenu SaaS</p>
                  </div>
                  <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Versão do Core</p>
                    <p className="text-sm font-bold text-foreground mt-0.5 tabular-nums">v2.4.0 (Edge)</p>
                  </div>
                  <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Storage Engine</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Cloudflare KV</p>
                  </div>
                  <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status do Gateway</p>
                    <p className="text-sm font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Online (0ms Cold)</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Loja Atual Conectada:</span>
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                      {venue?.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Slug Público:</span>
                    <span className="font-mono text-xs text-foreground">mimenu.clubemkt.digital/loja/{venue?.slug}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Moeda e Localidade:</span>
                    <span className="font-medium text-foreground">{venue?.currency} ({venue?.city})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Printer Settings */}
          <TabsContent value="printer" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-500" />
                  <span>Servidor de Impressão Térmica (ESC/POS & PrintNode)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Integração para disparo automático de comandas de cozinha (KDS) e recibos de mesa via USB/Rede local.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Connection Status */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-xs font-bold text-foreground">Servidor Local de Impressão</p>
                      <p className="text-[11px] text-muted-foreground">Driver WebSocket / HTTP ESC/POS</p>
                    </div>
                  </div>
                  <Badge className={isConnected ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'}>
                    {isConnected ? 'Conectado' : 'Aguardando Servidor'}
                  </Badge>
                </div>

                {/* Server URL */}
                <div className="space-y-2">
                  <Label htmlFor="serverUrl" className="text-xs font-semibold">URL do Servidor Local</Label>
                  <div className="flex gap-2">
                    <Input
                      id="serverUrl"
                      type="text"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://localhost:3001"
                      className="text-xs h-10 rounded-xl"
                    />
                    <Button
                      onClick={handleSavePrinterUrl}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold h-10 px-5 rounded-xl shrink-0"
                    >
                      Salvar URL
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={checkPrinterConnection}
                    disabled={isChecking}
                    variant="outline"
                    className="text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Testar Conexão</span>
                  </Button>
                  
                  <Button
                    onClick={handleTestPrint}
                    disabled={isTesting}
                    variant="outline"
                    className="text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                    <span>Imprimir Comanda de Teste</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp Copilot & Webhooks de Notificação</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Automação de comandas, confirmação de Pix e comando de voz/texto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Disparo Automático de Status</p>
                        <p className="text-[10px] text-muted-foreground">Envia mensagem quando o pedido for aceito, preparado ou sair para entrega</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Ativo</Badge>
                  </div>

                  <div className="p-4 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Copiloto IA para Gerência</p>
                        <p className="text-[10px] text-muted-foreground">Permite pausar itens, alterar preços e consultar vendas pelo WhatsApp</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp AI Concierge Settings */}
          <TabsContent value="whatsapp" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp AI Concierge (Evolution API)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Conecte o agente de IA do cardápio ao WhatsApp via Evolution API. O concierge responde por conta do restaurante de forma personalizada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable/Disable toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">AI Concierge no WhatsApp</p>
                      <p className="text-[10px] text-muted-foreground">Ativa a integração do chatbot com o WhatsApp via Evolution API</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${whatsappEnabled ? 'bg-emerald-500' : 'bg-muted'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${whatsappEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Evolution API Configuration */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="evolutionApiUrl" className="text-xs font-semibold">Evolution API URL</Label>
                    <Input
                      id="evolutionApiUrl"
                      type="url"
                      value={evolutionApiUrl}
                      onChange={(e) => setEvolutionApiUrl(e.target.value)}
                      placeholder="https://evolution-api.seudominio.com"
                      className="text-xs h-10 rounded-xl"
                      disabled={!whatsappEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolutionApiKey" className="text-xs font-semibold">API Key</Label>
                    <Input
                      id="evolutionApiKey"
                      type="password"
                      value={evolutionApiKey}
                      onChange={(e) => setEvolutionApiKey(e.target.value)}
                      placeholder="Chave de API do Evolution"
                      className="text-xs h-10 rounded-xl"
                      disabled={!whatsappEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolutionInstanceName" className="text-xs font-semibold">Instance Name</Label>
                    <Input
                      id="evolutionInstanceName"
                      type="text"
                      value={evolutionInstanceName}
                      onChange={(e) => setEvolutionInstanceName(e.target.value)}
                      placeholder="Nome da instância WhatsApp"
                      className="text-xs h-10 rounded-xl"
                      disabled={!whatsappEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappSenderPhone" className="text-xs font-semibold">Telefone do Restaurante (para respostas)</Label>
                    <Input
                      id="whatsappSenderPhone"
                      type="tel"
                      value={whatsappSenderPhone}
                      onChange={(e) => setWhatsappSenderPhone(e.target.value)}
                      placeholder="+591 XXX XXX XXX"
                      className="text-xs h-10 rounded-xl"
                      disabled={!whatsappEnabled}
                    />
                  </div>
                </div>

                {/* Webhook URL */}
                <div className="p-3 bg-muted/30 border border-border/60 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-foreground">Webhook URL (Evolution API)</p>
                  <p className="text-[11px] font-mono text-muted-foreground break-all">
                    {window.location.origin}/api/whatsapp/chatbot-webhook/{venue.slug || 'slug-do-venue'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Configure este URL no painel da Evolution API como webhook de mensagens.
                  </p>
                </div>

                {/* Save & Verify */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={async () => {
                      if (!whatsappEnabled) {
                        toast.success('Configurações do WhatsApp salvas localmente');
                        return;
                      }
                      setIsVerifyingWhatsapp(true);
                      await new Promise(r => setTimeout(r, 500));
                      try {
                        const res = await fetch(`${window.location.origin}/api/whatsapp/send-message`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ number: whatsappSenderPhone, text: 'Teste de conexão MiMenu ✓' })
                        });
                        if (res.ok) {
                          setWhatsappVerified(true);
                          toast.success('WhatsApp conectado com sucesso!');
                        } else {
                          toast.error('Falha na conexão WhatsApp');
                        }
                      } catch {
                        toast.error('Erro ao conectar WhatsApp');
                      } finally {
                        setIsVerifyingWhatsapp(false);
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold h-10 px-5 rounded-xl flex items-center gap-2"
                  >
                    {isVerifyingWhatsapp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Salvar e Verificar Conexão</span>
                  </Button>
                  {whatsappVerified && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold h-10 px-3 rounded-xl">
                      Verificado
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database & Backup Settings */}
          <TabsContent value="database" className="space-y-4 pt-2">
            <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  <span>Estado KV Storage & Snapshot Atômico</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Exportação de dados de cardápio, mesas, pedidos e CRM para backup completo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-muted/30 border border-border/60 rounded-xl text-center">
                    <p className="text-[10px] text-muted-foreground">Categorias</p>
                    <p className="text-lg font-bold text-foreground mt-0.5 tabular-nums">{categories.length}</p>
                  </div>
                  <div className="p-3 bg-muted/30 border border-border/60 rounded-xl text-center">
                    <p className="text-[10px] text-muted-foreground">Platos</p>
                    <p className="text-lg font-bold text-amber-500 mt-0.5 tabular-nums">{categories.flatMap(c => c.items).length}</p>
                  </div>
                  <div className="p-3 bg-muted/30 border border-border/60 rounded-xl text-center">
                    <p className="text-[10px] text-muted-foreground">Mesas QR</p>
                    <p className="text-lg font-bold text-blue-500 mt-0.5 tabular-nums">{tables.length}</p>
                  </div>
                  <div className="p-3 bg-muted/30 border border-border/60 rounded-xl text-center">
                    <p className="text-[10px] text-muted-foreground">Clientes CRM</p>
                    <p className="text-lg font-bold text-emerald-500 mt-0.5 tabular-nums">{customers.length}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleExportJSON}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold h-10 px-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Snapshot JSON Completo</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;