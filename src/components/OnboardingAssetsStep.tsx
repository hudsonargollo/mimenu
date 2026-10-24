import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ImagePlus,
  Upload,
  X,
  Instagram,
  MessageCircle,
  Clock,
  Store,
} from 'lucide-react';
import { requiredAssetsFor, type Plan } from '@/lib/plans';

const MAX_LANDING_PHOTOS = 6;
const MAX_FILE_MB = 8;

export interface OnboardingAssetsForm {
  logoFile: File | null;
  logoPreview: string | null;
  featuredPhotos: File[];
  featuredPreviews: string[];
  whatsapp: string;
  instagram: string;
  openingHours: string;
  address: string;
}

const EMPTY: OnboardingAssetsForm = {
  logoFile: null,
  logoPreview: null,
  featuredPhotos: [],
  featuredPreviews: [],
  whatsapp: '',
  instagram: '',
  openingHours: '',
  address: '',
};

interface OnboardingAssetsStepProps {
  plan: Plan | undefined;
  value: OnboardingAssetsForm;
  onChange: (next: OnboardingAssetsForm) => void;
}

/**
 * Asset collection for the premium one-page landing.
 *
 * What is mandatory depends on the plan: Tier 1 keeps this short (name,
 * WhatsApp, hours, address, menu). Tiers 2+ also collect the logo, Instagram
 * and featured photos, because those are what the custom landing is built
 * from. Nothing here is a hard blocker — the user can always finish later.
 */
export const OnboardingAssetsStep: React.FC<OnboardingAssetsStepProps> = ({
  plan,
  value,
  onChange,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const required = requiredAssetsFor(plan);
  const isPremium = !!plan?.collectsLandingAssets;

  const readPreview = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(String(e.target?.result ?? ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const acceptImage = async (file: File): Promise<boolean> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se aceptan imágenes (JPG/PNG/WEBP).');
      return false;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`${file.name} supera los ${MAX_FILE_MB} MB.`);
      return false;
    }
    return true;
  };

  const handleLogo = async (file?: File) => {
    if (!file) return;
    if (!(await acceptImage(file))) return;
    const preview = await readPreview(file);
    if (value.logoPreview) URL.revokeObjectURL(value.logoPreview);
    onChange({ ...value, logoFile: file, logoPreview: preview });
    toast.success('Logo cargado');
  };

  const handlePhotos = async (files: File[]) => {
    const accepted: File[] = [];
    for (const f of files) {
      if (value.featuredPhotos.length + accepted.length >= MAX_LANDING_PHOTOS) {
        toast.error(`Máximo ${MAX_LANDING_PHOTOS} fotos destacadas.`);
        break;
      }
      if (await acceptImage(f)) accepted.push(f);
    }
    if (accepted.length === 0) return;

    const previews = await Promise.all(accepted.map(readPreview));
    onChange({
      ...value,
      featuredPhotos: [...value.featuredPhotos, ...accepted],
      featuredPreviews: [...value.featuredPreviews, ...previews],
    });
  };

  const removePhoto = (index: number) => {
    const url = value.featuredPreviews[index];
    if (url) URL.revokeObjectURL(url);
    onChange({
      ...value,
      featuredPhotos: value.featuredPhotos.filter((_, i) => i !== index),
      featuredPreviews: value.featuredPreviews.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-5">
      {!isPremium && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
          <Store className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
            Con el plan <strong>Básico</strong> tu menú digital funciona completo, pero no incluye el
            sitio web premium de una página ni el CRM. Si querés esos beneficios, podés subir de plan
            cuando quieras.
          </p>
        </div>
      )}

      {/* Logo */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          Logo del restaurante
          {required.logo && <span className="text-[10px] text-muted-foreground font-normal">(recomendado)</span>}
        </Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all overflow-hidden ${
              value.logoPreview
                ? 'border-emerald-500 bg-white'
                : 'border-border hover:border-amber-500/60 bg-muted/30'
            }`}
            aria-label="Subir logo"
          >
            {value.logoPreview ? (
              <img src={value.logoPreview} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <span className="text-[9px] text-muted-foreground">Subir logo</span>
              </>
            )}
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handleLogo(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          {value.logoPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (value.logoPreview) URL.revokeObjectURL(value.logoPreview);
                onChange({ ...value, logoFile: null, logoPreview: null });
              }}
              className="h-8 text-[10px]"
            >
              <X className="w-3 h-3 mr-1" aria-hidden="true" /> Quitar
            </Button>
          )}
          <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
            Aparece en el menú digital, los QR y (en Pro/Premium/Custom) en el sitio web.
          </p>
        </div>
      </div>

      {/* Featured photos */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground">
          Fotos destacadas {isPremium ? '(para tu web premium)' : '(opcional)'}
        </Label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handlePhotos(Array.from(e.dataTransfer.files));
          }}
          className={`rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
            dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-border'
          }`}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {value.featuredPreviews.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group">
                <img
                  src={url}
                  alt={`Foto destacada ${i + 1}`}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Quitar foto ${i + 1}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
            {value.featuredPhotos.length < MAX_LANDING_PHOTOS && (
              <button
                type="button"
                onClick={() => photosInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-amber-500/60 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span className="text-[8px]">Agregar</span>
              </button>
            )}
          </div>
          <input
            ref={photosInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handlePhotos(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            Fotos de ambiente, platos insignia o el local. Máximo {MAX_LANDING_PHOTOS} · {MAX_FILE_MB} MB c/u.
          </p>
        </div>
      </div>

      {/* Contact + hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            WhatsApp *
          </Label>
          <Input
            value={value.whatsapp}
            onChange={(e) => onChange({ ...value, whatsapp: e.target.value })}
            placeholder="+591 70000000"
            className="h-10 rounded-lg text-xs bg-background"
            required
          />
          <p className="text-[10px] text-muted-foreground">Por acá te contactamos y tus clientes piden.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Instagram className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
            Instagram {isPremium ? '(recomendado)' : '(opcional)'}
          </Label>
          <Input
            value={value.instagram}
            onChange={(e) => onChange({ ...value, instagram: e.target.value })}
            placeholder="@turestaurante"
            className="h-10 rounded-lg text-xs bg-background"
          />
          <p className="text-[10px] text-muted-foreground">Se enlaza desde el menú y la web premium.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            Horario de atención *
          </Label>
          <Input
            value={value.openingHours}
            onChange={(e) => onChange({ ...value, openingHours: e.target.value })}
            placeholder="Lun a Sáb 18:00 - 02:00"
            className="h-10 rounded-lg text-xs bg-background"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Dirección *</Label>
          <Input
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="Av. San Martín #450, Equipetrol"
            className="h-10 rounded-lg text-xs bg-background"
            required
          />
        </div>
      </div>
    </div>
  );
};

export { EMPTY as EMPTY_ASSETS };
export default OnboardingAssetsStep;
