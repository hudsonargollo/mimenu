import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  FileImage, 
  UtensilsCrossed, 
  RotateCcw, 
  ExternalLink,
  Download,
  Copy,
  ChefHat,
  Flame
} from 'lucide-react';
import {
  parseMenuTranscript,
  convertIngestionToMimenuCategories,
  ExtractedRawItem,
  IngestionResult,
  findMatchingFoodImage
} from '@/lib/menuVisionIngester';
import { ocrImage, type OcrLanguage, disposeOcrWorker } from '@/lib/menuIntake';
import { useMimenu } from '@/lib/mimenuContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminMenuIngester: React.FC = () => {
  const navigate = useNavigate();
  const { venue, categories, setCategories } = useMimenu();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [parsedData, setParsedData] = useState<IngestionResult | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('replace');
const [rawTextInput, setRawTextInput] = useState<string>('');

// Dispose OCR worker on unmount to free WASM memory
useEffect(() => {
  return () => disposeOcrWorker();
}, []);

  // Handle file or camera upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      runVisionAnalysis(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Selection
  const handleSelectSample = (sample: { url: string; sampleText: string; title: string }) => {
    setSelectedImage(sample.url);
    runVisionAnalysis(sample.sampleText, sample.title, true);
  };

  // Run AI Vision Analysis
  const runVisionAnalysis = async (inputData: string, sourceName: string, isPresetText: boolean = false) => {
    setIsAnalyzing(true);
    setAnalysisStep('Escaneando imagen y aplicando OCR con detección de layout...');

    try {
      let rawText = '';
      if (isPresetText) {
        rawText = inputData;
      } else {
        await new Promise((r) => setTimeout(r, 300));
        setAnalysisStep('Extrayendo texto con OCR (Tesseract, español, PSM 6)...');

        rawText = await ocrImage(inputData, 'spa', (p) => {
          setAnalysisStep(`Extrayendo texto con OCR... ${Math.round(p * 100)}%`);
        });
        setRawTextInput(rawText);
      }

      setAnalysisStep('Identificando secciones, platos y extrayendo precios en Bs....');
      await new Promise((r) => setTimeout(r, 500));

      const parsed = parseMenuTranscript(rawText, venue.currency || 'Bs.');
      setParsedData(parsed);
      setIsAnalyzing(false);
      toast.success(`¡Menú ingerido! ${parsed.totalItems} platos en ${parsed.categories.length} categorías listos.`);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      toast.error('Error al procesar el menú.', { description: err instanceof Error ? err.message : undefined });
    }
  };

  // Manual raw text parsing
  const handleParseRawText = () => {
    if (!rawTextInput.trim()) {
      toast.error('Ingresa texto o transcript del menú');
      return;
    }
    const parsed = parseMenuTranscript(rawTextInput, venue.currency || 'Bs.');
    setParsedData(parsed);
    toast.success(`Se extrajeron ${parsed.totalItems} platos en ${parsed.categories.length} categorías.`);
  };

  // Update item in local editor
  const handleUpdateItem = (catIdx: number, itemIdx: number, field: keyof ExtractedRawItem, value: any) => {
    if (!parsedData) return;
    const nextCats = [...parsedData.categories];
    const targetItem = { ...nextCats[catIdx].items[itemIdx], [field]: value };
    
    if (field === 'name') {
      targetItem.imageUrl = findMatchingFoodImage(value, targetItem.description);
    }
    
    nextCats[catIdx].items[itemIdx] = targetItem;
    setParsedData({ ...parsedData, categories: nextCats });
  };

  // Remove item
  const handleRemoveItem = (catIdx: number, itemIdx: number) => {
    if (!parsedData) return;
    const nextCats = [...parsedData.categories];
    nextCats[catIdx].items.splice(itemIdx, 1);
    const totalItems = nextCats.reduce((acc, c) => acc + c.items.length, 0);
    setParsedData({ ...parsedData, categories: nextCats, totalItems });
  };

  // Add new item
  const handleAddItem = (catIdx: number) => {
    if (!parsedData) return;
    const nextCats = [...parsedData.categories];
    const newItem: ExtractedRawItem = {
      name: 'Nuevo Plato',
      description: 'Ingredientes frescos y elaboración artesanal.',
      price: 35,
      category: nextCats[catIdx].name,
      dietary: [],
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      confidence: 1.0
    };
    nextCats[catIdx].items.push(newItem);
    setParsedData({
      ...parsedData,
      categories: nextCats,
      totalItems: parsedData.totalItems + 1
    });
  };

  // Apply to venue
  const handleApplyToVenue = () => {
    if (!parsedData) return;
    const newMimenuCategories = convertIngestionToMimenuCategories(parsedData, venue.id);

    if (mergeMode === 'replace') {
      setCategories(newMimenuCategories);
      toast.success(`¡El menú de ${venue.name} ha sido reemplazado con éxito!`);
    } else {
      setCategories((prev) => [...prev, ...newMimenuCategories]);
      toast.success(`¡Nuevos platos incorporados al menú existente!`);
    }
  };

  // Copy JSON
  const handleCopyJSON = () => {
    if (!parsedData) return;
    const newMimenuCategories = convertIngestionToMimenuCategories(parsedData, venue.id);
    navigator.clipboard.writeText(JSON.stringify(newMimenuCategories, null, 2));
    toast.success('JSON copiado al portapapeles');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-16">
        {/* Header */}
        <AdminPageHeader
          index="09"
          eyebrow="Ingestor de carta"
          title="Digitalizador por foto"
          description={`Convierte fotos de cartas físicas, pizarras y volantes en un menú digital interactivo para ${venue.name}.`}
          actions={
            <button
              onClick={() => window.open('/menu', '_blank')}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Ver menú digital
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </button>
          }
          meta={
            <>
              <span className="noir-eyebrow">Vision OCR</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow">Auto-tag</span>
            </>
          }
        />

        {!parsedData && !isAnalyzing && (
          <div className="space-y-6">
            {/* Direct Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File upload */}
              <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-all cursor-pointer bg-card/50">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Subir Foto o Escaneo de la Carta</h3>
                    <p className="text-xs text-muted-foreground mt-1">Soporta formatos JPG, PNG, WEBP o PDF</p>
                  </div>
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <Button size="sm" variant="default" className="text-xs font-bold gap-1.5 pointer-events-none">
                      <FileImage className="w-3.5 h-3.5" />
                      <span>Seleccionar Archivo</span>
                    </Button>
                  </label>
                </CardContent>
              </Card>

              {/* Camera Direct */}
              <Card className="border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer bg-primary/5">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-base">Capturar con la Cámara del Móvil</h3>
                    <p className="text-xs text-muted-foreground mt-1">Apunta directamente a la carta o pizarra</p>
                  </div>
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                    />
                    <Button size="sm" className="text-xs font-bold gap-1.5 pointer-events-none">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Abrir Cámara</span>
                    </Button>
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* Manual text transcript fallback */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                  O pega directamente el texto del menú
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea 
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="Pega las líneas de tu menú, por ejemplo:&#10;Burger Doble Smash - Carne Angus y queso - Bs. 45&#10;Chopp Rubia 500ml - Bs. 25"
                  className="text-xs min-h-[100px]"
                />
                <Button 
                  size="sm" 
                  onClick={handleParseRawText}
                  className="text-xs font-bold gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Procesar Texto con IA</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="font-black text-foreground text-xl">Escaneando Carta con IA</h2>
              <p className="text-xs text-muted-foreground animate-pulse">{analysisStep}</p>
            </div>
          </div>
        )}

        {/* Results Studio */}
        {parsedData && !isAnalyzing && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-bold px-3 py-1">
                  {parsedData.totalItems} Platos Extraídos
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1">
                  {parsedData.categories.length} Categorías
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg">
                  <Button
                    size="sm"
                    variant={mergeMode === 'replace' ? 'default' : 'ghost'}
                    onClick={() => setMergeMode('replace')}
                    className="text-xs font-bold h-7 px-2.5"
                  >
                    Reemplazar Menú
                  </Button>
                  <Button
                    size="sm"
                    variant={mergeMode === 'merge' ? 'default' : 'ghost'}
                    onClick={() => setMergeMode('merge')}
                    className="text-xs font-bold h-7 px-2.5"
                  >
                    Agregar / Fusionar
                  </Button>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCopyJSON}
                  className="text-xs font-bold gap-1 h-8"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar JSON</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleApplyToVenue}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black gap-1.5 shadow-md shadow-primary/20 h-8"
                >
                  <Check className="w-4 h-4" />
                  <span>Aplicar a {venue.name}</span>
                </Button>
              </div>
            </div>

            {/* Two-Column Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Image Preview */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="border border-border bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5 text-primary" /> Foto / Documento Escaneado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="rounded-lg overflow-hidden bg-black/40 max-h-[380px] flex items-center justify-center border border-border">
                      {selectedImage ? (
                        <img 
                          src={selectedImage} 
                          alt="Menu Scan" 
                          className="max-w-full max-h-[360px] object-contain"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground py-12">Sin imagen cargada</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => { setParsedData(null); setSelectedImage(null); }}
                      className="w-full text-xs font-bold gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Escanear otra foto</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Extracted Menu Customizer */}
              <div className="lg:col-span-8 space-y-4">
                {/* Category tabs */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-border">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {parsedData.categories.map((cat, idx) => (
                      <Button
                        key={cat.key}
                        size="sm"
                        variant={activeCategoryIndex === idx ? 'default' : 'secondary'}
                        onClick={() => setActiveCategoryIndex(idx)}
                        className="text-xs font-bold gap-1.5 shrink-0 rounded-full h-8"
                      >
                        <span>{cat.name}</span>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-black">
                          {cat.items.length}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddItem(activeCategoryIndex)}
                    className="text-xs font-bold gap-1 shrink-0 h-8 text-primary border-primary/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Plato</span>
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {parsedData.categories[activeCategoryIndex]?.items.map((item, itemIdx) => (
                    <Card key={itemIdx} className="border border-border/80 bg-card p-3 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-lg object-cover border border-border shrink-0 bg-muted"
                        />

                        <div className="flex-1 min-w-0 space-y-1.5 w-full">
                          <div className="flex items-center justify-between gap-2">
                            <Input 
                              value={item.name}
                              onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, 'name', e.target.value)}
                              className="h-7 text-xs font-bold text-foreground bg-transparent border-border/50 px-2"
                              placeholder="Nombre del plato"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs font-black text-primary">{venue.currency || 'Bs.'}</span>
                              <Input 
                                type="number"
                                value={item.price}
                                onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, 'price', parseFloat(e.target.value) || 0)}
                                className="h-7 w-20 text-xs font-black text-right bg-transparent border-border/50 px-2"
                              />
                            </div>
                          </div>

                          <Input 
                            value={item.description}
                            onChange={(e) => handleUpdateItem(activeCategoryIndex, itemIdx, 'description', e.target.value)}
                            className="h-6 text-[11px] text-muted-foreground bg-transparent border-transparent hover:border-border/50 focus:border-border px-2"
                            placeholder="Descripción"
                          />

                          {item.dietary && item.dietary.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              {item.dietary.map((tag, tIdx) => (
                                <span 
                                  key={tIdx} 
                                  className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveItem(activeCategoryIndex, itemIdx)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMenuIngester;
