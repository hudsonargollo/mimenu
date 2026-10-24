import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wine,
  UtensilsCrossed,
} from 'lucide-react';
import {
  extractPdf,
  ocrImage,
  type MenuSource,
  type OcrLanguage,
  OCR_LANGUAGES,
} from '@/lib/menuIntake';
import { parseMenuTranscript, type IngestionResult } from '@/lib/menuVisionIngester';

const MAX_FILES = 12;

interface MenuIntakePanelProps {
  currency: string;
  /** Called with the parsed categories so the parent can merge into the venue. */
  onParsed: (categories: IngestionResult['categories'], sources: MenuSource[]) => void;
}

/**
 * Real menu intake: accepts several photos and/or multi-page PDFs, OCRs each
 * one client-side, and shows the extracted text per source for review before
 * the parent converts it into menu categories.
 */
export const MenuIntakePanel: React.FC<MenuIntakePanelProps> = ({ currency, onParsed }) => {
  const [sources, setSources] = useState<MenuSource[]>([]);
  const [language, setLanguage] = useState<OcrLanguage>('spa+eng');
  const [isBusy, setIsBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingFiles = useRef<File[]>([]);

  const acceptMore = sources.length < MAX_FILES;

  const handleFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.filter(
        (f) => f.type.startsWith('image/') || f.type === 'application/pdf',
      );
      if (accepted.length === 0) {
        toast.error('Solo se aceptan imágenes (JPG/PNG/WEBP) o PDF.');
        return;
      }
      if (sources.length + accepted.length > MAX_FILES) {
        toast.error(`Máximo ${MAX_FILES} archivos por carga.`);
        return;
      }

      setIsBusy(true);
      const added: MenuSource[] = [];

      for (const file of accepted) {
        const id = `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const isPdf = file.type === 'application/pdf';
        const previewUrl = isPdf ? null : URL.createObjectURL(file);
        const source: MenuSource = {
          id,
          kind: isPdf ? 'pdf' : 'image',
          fileName: file.name,
          previewUrl,
          rawText: '',
          pageCount: 1,
          progress: 0,
          status: 'extracting',
        };
        setSources((prev) => [...prev, source]);
        added.push(source);

        try {
          if (isPdf) {
            const result = await extractPdf(file, language, (done, total) => {
              setProgressLabel(`${file.name}: página ${done} de ${total}`);
              setSources((prev) =>
                prev.map((s) => (s.id === id ? { ...s, progress: total ? done / total : 0 } : s)),
              );
            });
            setSources((prev) =>
              prev.map((s) =>
                s.id === id
                  ? { ...s, rawText: result.text, pageCount: result.pageCount, progress: 1, status: 'done' }
                  : s,
              ),
            );
          } else {
            const text = await ocrImage(previewUrl ?? '', language, (p) => {
              setSources((prev) => prev.map((s) => (s.id === id ? { ...s, progress: p } : s)));
            });
            setSources((prev) =>
              prev.map((s) => (s.id === id ? { ...s, rawText: text, progress: 1, status: 'done' } : s)),
            );
          }
          toast.success(`${file.name}: texto extraído`);
        } catch (err) {
          console.error('Intake failed for', file.name, err);
          setSources((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: 'error', error: String(err) } : s,
            ),
          );
          toast.error(`No se pudo leer ${file.name}`);
        }
      }

      setProgressLabel('');
      setIsBusy(false);
    },
    [language, sources.length],
  );

  const removeSource = (id: string) => {
    const target = sources.find((s) => s.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setSources((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateSourceText = (id: string, text: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, rawText: text } : s)));
  };

  const mergeParsed = () => {
    const done = sources.filter((s) => s.status === 'done' && s.rawText.trim().length > 0);
    if (done.length === 0) {
      toast.error('Todavía no hay texto extraído para importar.');
      return;
    }
    // Each source is parsed separately so a multi-page menu keeps its sections,
    // then the categories are concatenated in upload order.
    const allCategories: IngestionResult['categories'] = [];
    let offset = 0;
    for (const source of done) {
      const parsed = parseMenuTranscript(source.rawText, currency || 'Bs.');
      for (const cat of parsed.categories) {
        allCategories.push({
          ...cat,
          key: `${cat.key}-${offset}`,
          name: done.length > 1 ? `${cat.name} (${source.fileName})` : cat.name,
          items: cat.items.map((item, i) => ({
            ...item,
            id: `intake-${offset}-${i}-${Date.now().toString(36)}`,
          })),
        });
        offset += 1;
      }
    }
    if (allCategories.length === 0) {
      toast.error('El texto extraído no contiene platos reconocibles.');
      return;
    }
    onParsed(allCategories, done);
    const count = allCategories.reduce((n, c) => n + c.items.length, 0);
    toast.success(`${count} platos listos para revisar en ${allCategories.length} categorías.`);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void handleFiles(Array.from(e.dataTransfer.files));
  };

  const totalItems = sources.filter((s) => s.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Idioma del menú</Label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
            className="h-10 rounded-lg text-xs bg-background border border-border px-3 w-full"
            aria-label="Idioma del menú"
          >
            {OCR_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground">
            El OCR corre en tu navegador. No se sube nada a un servidor.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Bebidas y vinos (opcional)</Label>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Subí una foto o PDF de la carta de bebidas/vinos y la separamos en su propia categoría.
            Si no la tenés ahora, se puede agregar después.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => acceptMore && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Subir menú en imágenes o PDF"
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-amber-500 bg-amber-500/5'
            : 'border-border hover:border-amber-500/60 hover:bg-muted/30'
        } ${!acceptMore ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
        <div className="flex flex-col items-center gap-2">
          {isBusy ? (
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
          )}
          <p className="text-sm font-semibold text-foreground">
            {isBusy ? (progressLabel || 'Procesando…') : 'Arrastrá fotos o PDFs de tu menú'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Varias páginas del menú = varias fotos o un PDF de varias páginas. Máximo {MAX_FILES} archivos.
          </p>
          {!acceptMore && (
            <Badge variant="secondary" className="text-[10px]">
              Llegaste al límite de {MAX_FILES} archivos
            </Badge>
          )}
        </div>
      </div>

      {/* Source list */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {sources.length} archivo{sources.length > 1 ? 's' : ''} · {totalItems} con texto
            </p>
            <Button size="sm" variant="outline" onClick={() => setSources([])} className="h-7 text-[10px]">
              Limpiar todo
            </Button>
          </div>

          {sources.map((source) => {
            const expanded = expandedId === source.id;
            return (
              <div
                key={source.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3">
                  {source.previewUrl ? (
                    <img
                      src={source.previewUrl}
                      alt={source.fileName}
                      className="w-10 h-10 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {source.kind === 'pdf' ? (
                        <FileText className="w-5 h-5 text-rose-500" aria-hidden="true" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{source.fileName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {source.kind === 'pdf' ? `PDF · ${source.pageCount} página(s)` : 'Imagen'}
                      {source.status === 'done' && ` · ${source.rawText.length} caracteres`}
                    </p>
                  </div>

                  {source.status === 'extracting' && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${Math.round(source.progress * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {Math.round(source.progress * 100)}%
                      </span>
                    </div>
                  )}

                  {source.status === 'done' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                  )}
                  {source.status === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : source.id)}
                    aria-label={expanded ? 'Ocultar texto' : 'Revisar texto'}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    {expanded ? (
                      <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSource(source.id)}
                    aria-label={`Quitar ${source.fileName}`}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-border p-3 space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Texto extraído — corregí lo que el OCR haya leído mal
                    </Label>
                    <Textarea
                      value={source.rawText}
                      onChange={(e) => updateSourceText(source.id, e.target.value)}
                      rows={Math.min(14, Math.max(5, source.rawText.split('\n').length + 1))}
                      className="text-[11px] font-mono rounded-lg bg-background"
                      placeholder="El texto reconocido aparecerá acá…"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Tip: una línea por plato. Usá una línea en MAYÚSCULAS como título de sección para
                      separar categorías (ej. TAPAS, BEBIDAS).
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {sources.some((s) => s.status === 'done' && s.rawText.trim()) && (
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={mergeParsed} className="h-9 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white">
            <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Importar texto a mi menú
          </Button>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="h-9 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Agregar más
          </Button>
        </div>
      )}

      {sources.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
          <Wine className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            La carta de bebidas y vinos es <strong>sugerida, no obligatoria</strong>. Si subís un archivo
            de bebidas lo separamos en su propia categoría automáticamente. Si preferís cargarla después,
            el menú funciona igual.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuIntakePanel;
