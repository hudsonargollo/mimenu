import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { generateContractPDF } from '@/components/ContractPDFGenerator';

interface ContractData {
  responsibleName: string;
  cpfCnpj: string;
  address: string;
  email: string;
  phone: string;
  basePackagePrice: number;
  paymentOption: 'full' | 'split';
  totalPrice: number;
  firstPayment: number;
  secondPayment: number;
}

const BASE_PACKAGE_PRICE = 1000;

const ContractManagement = () => {
  const [contractData, setContractData] = useState<ContractData>({
    responsibleName: '',
    cpfCnpj: '',
    address: '',
    email: '',
    phone: '',
    basePackagePrice: BASE_PACKAGE_PRICE,
    paymentOption: 'full',
    totalPrice: BASE_PACKAGE_PRICE * 0.85,
    firstPayment: BASE_PACKAGE_PRICE * 0.85,
    secondPayment: 0,
  });

  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    calculateTotalPrice();
  }, [contractData.basePackagePrice, contractData.paymentOption]);

  const calculateTotalPrice = () => {
    let total = contractData.basePackagePrice;
    let finalTotal = total;
    let firstPayment = total;
    let secondPayment = 0;

    if (contractData.paymentOption === 'full') {
      finalTotal = total * 0.85;
      firstPayment = finalTotal;
    } else {
      firstPayment = total / 2;
      secondPayment = total / 2;
    }

    setContractData((prev) => ({ ...prev, totalPrice: finalTotal, firstPayment, secondPayment }));
  };

  const handleInputChange = (field: keyof Omit<ContractData, 'optionalModules' | 'totalPrice' | 'firstPayment' | 'secondPayment'>, value: string | number) => {
    setContractData((prev) => ({ ...prev, [field]: value }));
  };



  const handlePaymentOptionChange = (option: 'full' | 'split') => {
    setContractData((prev) => ({ ...prev, paymentOption: option }));
  };

  const handleSaveContract = async () => {
    if (!contractData.responsibleName || !contractData.cpfCnpj || !contractData.address || !contractData.email) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }
    setIsSaving(true);
    try {
      localStorage.setItem('contractData', JSON.stringify(contractData));
      toast.success('¡Contrato guardado correctamente!');
    } catch (error) {
      toast.error('Error al guardar el contrato');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contractData.responsibleName || !contractData.cpfCnpj) {
      toast.error('Por favor, completa los datos de la empresa antes de generar el PDF');
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const pdf = await generateContractPDF(contractData, '');
      pdf.save('contrato_pontal_carapitangui.pdf');
      toast.success('¡PDF generado correctamente!');
    } catch (error) {
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2EEE4]">
      <Header />
      <main>
        {/* Hero Section */}
        <header className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1A2B2A] to-[#2A3B3A]">
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto py-12 sm:py-16">
            <p className="text-amber-300 tracking-[0.3em] text-xs sm:text-sm uppercase font-semibold mb-3 sm:mb-4 flex items-center justify-center">
              <span className="w-8 sm:w-12 h-px bg-amber-300 mr-2 sm:mr-4" />
              Contrato de Servicios
              <span className="w-8 sm:w-12 h-px bg-amber-300 ml-2 sm:ml-4" />
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-3 sm:mb-4 leading-tight font-display">
              Gestión de <br />
              <span className="italic font-normal">Contrato Digital</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 font-light mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Configura tus datos, elige las opciones de pago y genera tu contrato en PDF.
            </p>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
          {/* What's Included Section */}
          <section className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Qué incluye</h2>
              <p className="text-gray-600">Conoce los detalles de tu paquete</p>
            </div>

            <div className="grid md:grid-cols-1 gap-6">
              {/* Base Package */}
              <Card className="rounded-3xl border border-gray-100 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-[#1A2B2A] to-[#2A3B3A] rounded-t-3xl text-white">
                  <CardTitle className="text-2xl">Paquete Base</CardTitle>
                  <p className="text-sm text-gray-200 mt-2">Bs. 1.000,00</p>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#BC6C25] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Sitio Web Corporativo</p>
                        <p className="text-sm text-gray-600">Desarrollo del sitio institucional profesional de la empresa</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#BC6C25] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Menú Digital</p>
                        <p className="text-sm text-gray-600">Menú digital interactivo con acceso fácil y fotos de los productos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#BC6C25] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Estrategia de Google Ads</p>
                        <p className="text-sm text-gray-600">Planificación y estructuración de campañas de anuncios en Google</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary */}
            <Card className="rounded-3xl border border-gray-100 shadow-sm bg-gradient-to-br from-gray-50 to-white">
              <CardHeader className="bg-white rounded-t-3xl">
                <CardTitle className="text-2xl text-gray-900">Resumen de Precios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Pago al Contado</h3>
                    <div className="p-4 rounded-2xl bg-[#BC6C25]/5 border border-[#BC6C25]/20">
                      <p className="text-sm text-gray-600 mb-2">Con 15% de Descuento</p>
                      <p className="text-2xl font-bold text-[#BC6C25]">Bs. 850,00</p>
                      <p className="text-xs text-gray-500 mt-2">Valor original: Bs. 1.000,00</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Pago en Cuotas</h3>
                    <div className="p-4 rounded-2xl bg-gray-100">
                      <p className="text-sm text-gray-600 mb-2">50/50 (sin descuento)</p>
                      <p className="text-sm font-semibold text-gray-900">1ª: Bs. 500,00 | 2ª: Bs. 500,00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl mb-6 bg-white border border-gray-200 p-1">
              <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-[#BC6C25] data-[state=active]:text-white">Datos</TabsTrigger>
              <TabsTrigger value="summary" className="rounded-xl data-[state=active]:bg-[#BC6C25] data-[state=active]:text-white">Resumen</TabsTrigger>
            </TabsList>

            {/* Tab 1: Details */}
            <TabsContent value="details" className="space-y-4">
              <Card className="rounded-3xl border border-gray-100 shadow-sm">
                <CardHeader className="bg-white rounded-t-3xl">
                  <CardTitle className="text-2xl text-gray-900">Datos de la Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-900">Nombre del Responsable *</Label>
                      <Input placeholder="Ej: Juan Silva" value={contractData.responsibleName} onChange={(e) => handleInputChange('responsibleName', e.target.value)} className="rounded-2xl border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-900">CI/NIT *</Label>
                      <Input placeholder="Ej: 12345678-9A" value={contractData.cpfCnpj} onChange={(e) => handleInputChange('cpfCnpj', e.target.value)} className="rounded-2xl border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-900">Email *</Label>
                      <Input type="email" placeholder="Ej: contacto@empresa.com" value={contractData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="rounded-2xl border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-900">Teléfono</Label>
                      <Input placeholder="Ej: +591 700 00000" value={contractData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="rounded-2xl border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-900">Dirección Completa *</Label>
                    <Input placeholder="Ej: Av. Principal 123, Equipetrol, Santa Cruz" value={contractData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="rounded-2xl border-gray-200" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* Tab 3: Summary */}
            <TabsContent value="summary" className="space-y-4">
              <Card className="rounded-3xl border border-gray-100 shadow-sm">
                <CardHeader className="bg-white rounded-t-3xl">
                  <CardTitle className="text-2xl text-gray-900">Resumen del Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Datos de la Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50">
                      <div>
                        <p className="text-sm text-gray-600">Responsable</p>
                        <p className="font-semibold text-gray-900">{contractData.responsibleName || 'Sin completar'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CI/NIT</p>
                        <p className="font-semibold text-gray-900">{contractData.cpfCnpj || 'Sin completar'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">{contractData.email || 'Sin completar'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-semibold text-gray-900">{contractData.phone || 'Sin completar'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Servicios y Valores</h3>
                    <div className="space-y-2 p-4 rounded-2xl bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Paquete Base</span>
                        <span className="font-semibold">Bs. {contractData.basePackagePrice.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Subtotal</span>
                        <span className="font-bold text-lg text-gray-900">Bs. {contractData.basePackagePrice.toFixed(2)}</span>
                      </div>
                      {contractData.paymentOption === 'full' && (
                        <div className="p-2 rounded-lg flex justify-between items-center bg-[#BC6C25]/10 border-l-4 border-[#BC6C25]">
                          <span className="font-semibold text-[#BC6C25]">Descuento (15%)</span>
                          <span className="font-bold text-[#BC6C25]">-Bs. {(contractData.basePackagePrice * 0.15).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Detalles del Pago</h3>
                    <div className="p-4 rounded-2xl border-2 border-[#BC6C25] bg-[#BC6C25]/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-700">Valor Total</span>
                        <span className="text-2xl font-bold text-[#BC6C25]">Bs. {contractData.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {contractData.paymentOption === 'full' ? (
                          <div className="p-3 rounded-lg bg-[#BC6C25]/10 border-l-4 border-[#BC6C25]">
                            <p className="font-semibold text-[#BC6C25]">Pago al Contado con 15% de Descuento</p>
                            <p className="mt-1 text-[#BC6C25]">Valor: Bs. {contractData.totalPrice.toFixed(2)}</p>
                            <p className="text-[#BC6C25]">Pago: hudsonargollo@gmail.com</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-3 rounded-lg bg-gray-100 border-l-4 border-gray-400">
                              <p className="font-semibold text-gray-900">1ª Cuota - Al Firmar</p>
                              <p className="mt-1 text-gray-700">Bs. {contractData.firstPayment.toFixed(2)}</p>
                              <p className="text-gray-700">Pago: hudsonargollo@gmail.com</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-100 border-l-4 border-gray-400">
                              <p className="font-semibold text-gray-900">2ª Cuota - En la Entrega</p>
                              <p className="mt-1 text-gray-700">Bs. {contractData.secondPayment.toFixed(2)}</p>
                              <p className="text-gray-700">Pago: hudsonargollo@gmail.com</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Alert className="rounded-2xl border-2 border-gray-200 bg-gray-50">
                    <AlertCircle className="h-4 w-4 text-[#BC6C25]" />
                    <AlertDescription className="ml-2 text-gray-900">
                      <p className="font-semibold mb-1">Información Importante:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Entrega prevista: 2 a 5 días hábiles tras la confirmación del pago</li>
                        <li>Vigencia del contrato: 1 año desde la firma</li>
                        <li>Soporte técnico gratuito incluido durante la vigencia</li>
                        <li>Todas las comunicaciones deben realizarse vía WhatsApp</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveContract} disabled={isSaving} className="flex-1 rounded-lg h-12 font-semibold flex items-center justify-center gap-2 text-white bg-[#1A2B2A] hover:bg-[#0F1A19]">
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Guardando...' : 'Guardar Contrato'}
                </Button>
                <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex-1 rounded-lg h-12 font-semibold flex items-center justify-center gap-2 text-white bg-[#BC6C25] hover:bg-[#A85A1F]">
                  <Download className="w-5 h-5" />
                  {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                </Button>
                <Button onClick={() => setActiveTab('details')} variant="outline" className="flex-1 rounded-lg h-12 font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-900 hover:bg-gray-50">
                  <Eye className="w-5 h-5" />
                  Editar Datos
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContractManagement;
