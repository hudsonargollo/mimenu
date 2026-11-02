import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Palette,
  Save,
  Store,
  DollarSign,
  Film,
  Image as ImageIcon,
  Upload,
  Star,
  Search,
  Sparkles,
  Crop,
  Move,
  RotateCcw,
  ChevronDown,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { isSafeMediaUrl } from '@/lib/media';
import {
  DEFAULT_LOGO_LAYOUT,
  LOGO_ASPECT_MAX,
  LOGO_ASPECT_MIN,
  LOGO_ASPECT_PRESETS,
  LOGO_ZOOM_MAX,
  LOGO_ZOOM_MIN,
  clampLogoLayout,
  logoLayoutFromSize,
  logoPanLimits,
  normalizeLogoAspect,
  normalizeLogoZoom,
  toVenueLogoLayout,
  venueLogoFrameStyle,
  venueLogoImageStyle,
} from '@/lib/venueLogo';
import type { VenueLogoLayout } from '@/lib/venueLogo';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const MAX_FEATURED = 12;
const MAX_LOGO_BYTES = 400 * 1024;

const checkerboard: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  backgroundImage:
    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%), linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%)',
  backgroundSize: '18px 18px',
  backgroundPosition: '0 0, 9px 9px',
};

export const AdminBranding: React.FC = () => {
  const { venue, updateVenue, categories } = useMimenu();

  const [name, setName] = useState(venue.name);
  const [tagline, setTagline] = useState(venue.tagline);
  const [description, setDescription] = useState(venue.description);
  const [city, setCity] = useState(venue.city);
  const [address, setAddress] = useState(venue.address);
  const [whatsapp, setWhatsapp] = useState(venue.whatsapp);
  const [currency, setCurrency] = useState(venue.currency);
  const [primaryColor, setPrimaryColor] = useState(venue.primary_color);
  const [accentColor, setAccentColor] = useState(venue.accent_color);
  const [openingHours, setOpeningHours] = useState(venue.opening_hours);
  const [heroVideoUrl, setHeroVideoUrl] = useState(venue.hero_video_url ?? '');
  const [heroPosterUrl, setHeroPosterUrl] = useState(venue.hero_poster_url ?? '');
  const [featuredIds, setFeaturedIds] = useState<string[]>(venue.featured_item_ids ?? []);
  const [featuredQuery, setFeaturedQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState(venue.logo_url ?? '');
  const [logoLayout, setLogoLayout] = useState<VenueLogoLayout>(() => toVenueLogoLayout(venue));
  const [logoSourceAspect, setLogoSourceAspect] = useState(() =>
    normalizeLogoAspect(venue.logo_source_aspect ?? venue.logo_aspect),
  );
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const logoDrag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
  } | null>(null);

  // Branding fields are local drafts; pull the new media fields again if the
  // tenant switcher changes the active venue while this page is mounted.
  useEffect(() => {
    setHeroVideoUrl(venue.hero_video_url ?? '');
    setHeroPosterUrl(venue.hero_poster_url ?? '');
    setFeaturedIds(venue.featured_item_ids ?? []);
    setLogoUrl(venue.logo_url ?? '');
    setLogoLayout(toVenueLogoLayout(venue));
    setLogoSourceAspect(normalizeLogoAspect(venue.logo_source_aspect ?? venue.logo_aspect));
  }, [venue.slug]);

  const menuItems = useMemo(
    () =>
      categories.flatMap((category) =>
        category.items.map((item) => ({ item, categoryName: category.name })),
      ),
    [categories],
  );

  const visibleMenuItems = useMemo(() => {
    const query = featuredQuery.trim().toLowerCase();
    if (!query) return menuItems;
    return menuItems.filter(
      (entry) =>
        entry.item.name.toLowerCase().includes(query) ||
        entry.categoryName.toLowerCase().includes(query),
    );
  }, [menuItems, featuredQuery]);

  const previewVideo = isSafeMediaUrl(heroVideoUrl) ? heroVideoUrl.trim() : '';
  const previewImage = isSafeMediaUrl(heroPosterUrl, true) ? heroPosterUrl.trim() : '';
  const hasInvalidVideo = !!heroVideoUrl.trim() && !previewVideo;
  const hasInvalidPoster = !!heroPosterUrl.trim() && !previewImage;
  const usingDefaultFeatured = featuredIds.length === 0;

  const previewLogo = isSafeMediaUrl(logoUrl, true) ? logoUrl.trim() : '';
  const hasInvalidLogo = !!logoUrl.trim() && !previewLogo;
  const logoPan = logoPanLimits(logoLayout, logoSourceAspect);
  const logoAspectLabel = `${logoLayout.aspect.toFixed(2)}:1`;

  const updateLogoLayout = (patch: Partial<VenueLogoLayout>) => {
    setLogoLayout((prev) => {
      const zoom = patch.zoom !== undefined ? normalizeLogoZoom(patch.zoom) : prev.zoom;
      const aspect = patch.aspect !== undefined ? normalizeLogoAspect(patch.aspect) : prev.aspect;
      return clampLogoLayout(
        {
          aspect,
          zoom,
          x: patch.x !== undefined ? patch.x : prev.x,
          y: patch.y !== undefined ? patch.y : prev.y,
        },
        logoSourceAspect,
      );
    });
  };

  const resetLogoLayout = () => {
    setLogoLayout(
      clampLogoLayout(
        { aspect: logoSourceAspect, zoom: LOGO_ZOOM_MIN, x: 0, y: 0 },
        logoSourceAspect,
      ),
    );
  };

  const importLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Seleccioná una imagen válida');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('El logo es demasiado grande. Máximo 400 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const layout = logoLayoutFromSize(img.naturalWidth, img.naturalHeight);
        setLogoUrl(src);
        setLogoSourceAspect(layout.aspect);
        setLogoLayout(layout);
        toast.success(`Logo cargado: ${img.naturalWidth} × ${img.naturalHeight} px`);
      };
      img.onerror = () => {
        setLogoUrl(src);
        toast.error('No pudimos leer las dimensiones del logo');
      };
      img.src = src;
    };
    reader.onerror = () => toast.error('No se pudo leer la imagen');
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) importLogoFile(file);
    event.target.value = '';
  };

  const handleLogoDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) importLogoFile(file);
  };

  /** Detect the natural ratio of a remote logo so the slot can match it. */
  const handleLogoUrlBlur = () => {
    const value = logoUrl.trim();
    if (!value || value.startsWith('data:') || !isSafeMediaUrl(value)) return;

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth <= 0 || img.naturalHeight <= 0) return;
      const layout = logoLayoutFromSize(img.naturalWidth, img.naturalHeight);
      setLogoSourceAspect(layout.aspect);
      setLogoLayout(layout);
    };
    img.src = value;
  };

  const handleLogoPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!previewLogo) return;
    const rect = event.currentTarget.getBoundingClientRect();
    logoDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: logoLayout.x,
      originY: logoLayout.y,
      width: rect.width,
      height: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsLogoDragging(true);
    event.preventDefault();
  };

  const handleLogoPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = logoDrag.current;
    if (!drag || drag.pointerId !== event.pointerId || !drag.width || !drag.height) return;
    updateLogoLayout({
      x: drag.originX + ((event.clientX - drag.startX) / drag.width) * 100,
      y: drag.originY + ((event.clientY - drag.startY) / drag.height) * 100,
    });
  };

  const endLogoDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (logoDrag.current?.pointerId !== event.pointerId) return;
    logoDrag.current = null;
    setIsLogoDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const toggleFeatured = (itemId: string) => {
    if (featuredIds.includes(itemId)) {
      setFeaturedIds(featuredIds.filter((id) => id !== itemId));
      return;
    }
    if (featuredIds.length >= MAX_FEATURED) {
      toast.error(`Podés destacar hasta ${MAX_FEATURED} platos en el carrusel`);
      return;
    }
    setFeaturedIds([...featuredIds, itemId]);
  };

  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Seleccioná una imagen válida');
      return;
    }

    if (file.size > 400 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 400 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setHeroPosterUrl(String(reader.result || ''));
      toast.success('Imagen de portada cargada');
    };
    reader.onerror = () => toast.error('No se pudo leer la imagen');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const validFeatured = featuredIds.filter((id) => menuItems.some((entry) => entry.item.id === id));

    updateVenue({
      name,
      tagline,
      description,
      city,
      address,
      whatsapp,
      currency,
      primary_color: primaryColor,
      accent_color: accentColor,
      opening_hours: openingHours,
      hero_video_url: heroVideoUrl.trim(),
      hero_poster_url: heroPosterUrl.trim(),
      featured_item_ids: validFeatured,
      logo_url: previewLogo,
      logo_aspect: logoLayout.aspect,
      logo_source_aspect: normalizeLogoAspect(logoSourceAspect),
      logo_zoom: logoLayout.zoom,
      logo_x: logoLayout.x,
      logo_y: logoLayout.y,
    });
    toast.success('Configuraciones de marca y White-Label actualizadas');
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <AdminPageHeader
          index="10"
          eyebrow="Marca"
          title="Identidad y marca"
          description="Logo del menú con encuadre, nombre del local, colores de marca, moneda local, ubicación, portada con video y platos destacados."
          actions={
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground bg-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              Guardar cambios
            </button>
          }
          meta={<span className="noir-eyebrow">{venue.slug}</span>}
        />

        {/* Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Brand Info */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border border-border/80 bg-card p-6 shadow-xs space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Crop className="w-4 h-4 text-primary" />
                    <span>Logo del Menú</span>
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Reemplaza el ícono y el nombre en la cabecera. Subí el logo y ajustá el encuadre:
                    se guarda con la proporción exacta de la imagen.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  {logoAspectLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Logo (URL o archivo)</label>
                  <div className="flex gap-2">
                    <Input
                      value={logoUrl.startsWith('data:') ? '' : logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      onBlur={handleLogoUrlBlur}
                      placeholder="/jaleo/logo.png"
                      className="text-xs"
                    />
                    <label className="inline-flex h-9 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border hover:bg-muted" title="Subir logo">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                  {logoUrl.startsWith('data:') && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                        <ImageIcon className="h-3 w-3" />
                        Logo cargado desde tu equipo
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl('');
                          setLogoSourceAspect(normalizeLogoAspect(undefined));
                          setLogoLayout({ ...DEFAULT_LOGO_LAYOUT });
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                  {hasInvalidLogo ? (
                    <p className="text-[10px] font-semibold text-rose-600">
                      Usá una URL http(s), una ruta del sitio o subí una imagen.
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      PNG, JPG, WebP o SVG · máximo {MAX_LOGO_BYTES / 1024} KB. También podés arrastrar
                      el archivo sobre el encuadre.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Proporción del área</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateLogoLayout({ aspect: logoSourceAspect })}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        Math.abs(logoLayout.aspect - logoSourceAspect) < 0.02
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-border bg-background text-muted-foreground hover:border-amber-500/50 hover:text-foreground'
                      }`}
                    >
                      Original {logoSourceAspect.toFixed(2)}:1
                    </button>
                    {LOGO_ASPECT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateLogoLayout({ aspect: preset })}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-colors ${
                          Math.abs(logoLayout.aspect - preset) < 0.02
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-border bg-background text-muted-foreground hover:border-amber-500/50 hover:text-foreground'
                        }`}
                      >
                        {preset}:1
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={LOGO_ASPECT_MIN}
                    max={LOGO_ASPECT_MAX}
                    step={0.05}
                    value={logoLayout.aspect}
                    onChange={(e) => updateLogoLayout({ aspect: Number(e.target.value) })}
                    aria-label="Proporción del área del logo"
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    El área define el recorte visible en la cabecera del menú.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Encuadre</span>
                  <button
                    type="button"
                    onClick={resetLogoLayout}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" /> Restablecer
                  </button>
                </div>

                <div
                  onPointerDown={handleLogoPointerDown}
                  onPointerMove={handleLogoPointerMove}
                  onPointerUp={endLogoDrag}
                  onPointerCancel={endLogoDrag}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleLogoDrop}
                  className={`relative mx-auto w-full touch-none select-none overflow-hidden rounded-xl border-2 border-dashed border-amber-500/70 ${
                    isLogoDragging ? 'cursor-grabbing' : previewLogo ? 'cursor-grab' : 'cursor-default'
                  }`}
                  style={{
                    ...checkerboard,
                    aspectRatio: String(logoLayout.aspect),
                    maxWidth: `${Math.min(logoLayout.aspect * 220, 680)}px`,
                  }}
                >
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                      style={venueLogoImageStyle(logoLayout)}
                    />
                  ) : (
                    <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1 text-center text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-[11px] font-semibold">Todavía no hay logo</span>
                      <span className="text-[10px]">Subí una imagen o pegá una URL</span>
                    </div>
                  )}
                  <span className="pointer-events-none absolute inset-2 rounded ring-1 ring-inset ring-white/50" aria-hidden="true" />
                  <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    <Move className="h-2.5 w-2.5" /> {logoAspectLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Zoom</span>
                      <span className="tabular-nums text-foreground">{logoLayout.zoom.toFixed(2)}×</span>
                    </label>
                    <input
                      type="range"
                      min={LOGO_ZOOM_MIN}
                      max={LOGO_ZOOM_MAX}
                      step={0.05}
                      value={logoLayout.zoom}
                      onChange={(e) => updateLogoLayout({ zoom: Number(e.target.value) })}
                      aria-label="Zoom del logo"
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Horizontal</span>
                      <span className="tabular-nums text-foreground">{logoLayout.x.toFixed(0)}%</span>
                    </label>
                    <input
                      type="range"
                      min={-logoPan.x}
                      max={logoPan.x}
                      step={0.5}
                      value={logoLayout.x}
                      disabled={logoPan.x === 0}
                      onChange={(e) => updateLogoLayout({ x: Number(e.target.value) })}
                      aria-label="Posición horizontal del logo"
                      className="w-full accent-amber-500 disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Vertical</span>
                      <span className="tabular-nums text-foreground">{logoLayout.y.toFixed(0)}%</span>
                    </label>
                    <input
                      type="range"
                      min={-logoPan.y}
                      max={logoPan.y}
                      step={0.5}
                      value={logoLayout.y}
                      disabled={logoPan.y === 0}
                      onChange={(e) => updateLogoLayout({ y: Number(e.target.value) })}
                      aria-label="Posición vertical del logo"
                      className="w-full accent-amber-500 disabled:opacity-40"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Arrastrá el logo dentro del área o usá los controles. El encuadre se aplica igual en
                  la cabecera del menú.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Vista en la cabecera del menú
                </span>
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <div className="bg-slate-900 px-3 py-1 text-[9px] font-medium text-slate-300">
                    {name || venue.name} <span className="text-slate-500">• {city || venue.city}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-background px-3 py-2">
                    <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-border px-2 text-[10px] font-semibold text-foreground">
                      <UtensilsCrossed className="h-3 w-3 text-amber-500" aria-hidden="true" />
                      <span className="hidden sm:inline">Elegir mesa</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <span
                      className="block min-w-0 shrink overflow-hidden [--logo-h:2rem]"
                      style={venueLogoFrameStyle(logoLayout)}
                    >
                      {previewLogo ? (
                        <img
                          src={previewLogo}
                          alt=""
                          draggable={false}
                          className="h-full w-full select-none object-cover"
                          style={venueLogoImageStyle(logoLayout)}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-muted text-[10px] font-bold text-muted-foreground">
                          {name || 'Logo'}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-border px-2 text-[10px] font-semibold text-foreground">
                      <ShoppingBag className="h-3 w-3 text-amber-500" aria-hidden="true" />
                      <span className="hidden sm:inline">Comanda</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span>Información del Establecimiento</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Nombre del Restaurante / Bar</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Ciudad / Municipio</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground mb-1 block">Slogan / Tagline</label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground mb-1 block">Descripción del Local</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-xs min-h-[80px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground mb-1 block">Dirección Física</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">WhatsApp de Pedidos</label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Horarios de Atención</label>
                  <Input
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </Card>

            <Card className="border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Moneda & Ajustes Financieros</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Símbolo de Moneda</label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Ejemplo: Bs. (Bolivianos), $, R$</span>
                </div>
              </div>
            </Card>

            {/* Featured items for the flip deck */}
            <Card className="border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Destacados del Carrusel</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    El carrusel premium muestra solo estos platos. Elegí hasta {MAX_FEATURED}.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 self-start rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  {featuredIds.length} seleccionados
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={featuredQuery}
                    onChange={(e) => setFeaturedQuery(e.target.value)}
                    placeholder="Buscar plato por nombre o categoría..."
                    className="text-xs pl-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFeaturedIds([])}
                  disabled={usingDefaultFeatured}
                  className="text-xs"
                >
                  Usar recomendados
                </Button>
              </div>

              {usingDefaultFeatured && (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                  Sin selección manual: el carrusel usa los platos marcados como destacados o, si no hay, los más pedidos.
                </p>
              )}

              <div className="max-h-80 divide-y divide-border overflow-y-auto rounded-xl border border-border/70">
                {visibleMenuItems.map(({ item, categoryName }) => {
                  const selected = featuredIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors ${
                        selected ? 'bg-amber-500/10' : 'hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFeatured(item.id)}
                        className="h-4 w-4 accent-amber-500"
                      />
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {isSafeMediaUrl(item.image_url, true) ? (
                          <img src={item.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
                        <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                          {categoryName}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                        {venue.currency} {item.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}

                {visibleMenuItems.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                    No hay platos que coincidan con la búsqueda.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Theme Colors, Hero Media & Live Preview */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Paleta de Colores de Marca</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Color Primario (Hex)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Color de Acento / Flame (Hex)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              <div className="pt-4 border-t border-border space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Vista Previa de Botón</label>
                <div
                  className="p-3 rounded-xl text-white font-bold text-xs text-center shadow-md"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  🍺 Botón de Marca {name}
                </div>
              </div>
            </Card>

            <Card className="border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Film className="w-4 h-4 text-sky-500" />
                  <span>Portada con Video Premium</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Es el fondo del hero en el menú del cliente. Se reproduce en silencio y en loop.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">Video de fondo (URL MP4 / WebM)</label>
                <Input
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://cdn.turestaurante.com/hero.mp4"
                  className="text-xs"
                />
                {hasInvalidVideo ? (
                  <p className="text-[10px] font-semibold text-rose-600">
                    Usá una URL http(s) o una ruta del sitio (ej. /jaleo/video.mp4).
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    Dejalo vacío para mostrar solo la imagen de portada.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">Imagen de portada (URL o archivo)</label>
                <div className="flex gap-2">
                  <Input
                    value={heroPosterUrl.startsWith('data:') ? '' : heroPosterUrl}
                    onChange={(e) => setHeroPosterUrl(e.target.value)}
                    placeholder="https://.../portada.jpg"
                    className="text-xs"
                  />
                  <label className="inline-flex h-9 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
                  </label>
                </div>
                {heroPosterUrl.startsWith('data:') && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                      <ImageIcon className="h-3 w-3" />
                      Imagen cargada desde tu equipo
                    </span>
                    <button
                      type="button"
                      onClick={() => setHeroPosterUrl('')}
                      className="text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
                {hasInvalidPoster ? (
                  <p className="text-[10px] font-semibold text-rose-600">
                    Usá una URL http(s), una ruta del sitio o subí una imagen.
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    Se muestra mientras carga el video y en equipos con movimiento reducido.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Vista previa del hero</label>
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-[#0b0a09]">
                  {previewVideo ? (
                    <video
                      key={previewVideo}
                      src={previewVideo}
                      poster={previewImage || undefined}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : previewImage ? (
                    <img src={previewImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `radial-gradient(120% 120% at 15% 10%, ${primaryColor} 0%, #241a10 45%, #0b0a09 100%)`,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
                      {city || 'Tu ciudad'}
                    </p>
                    <p className="font-display text-lg leading-tight text-white">{name || 'Nombre del local'}</p>
                    <p className="line-clamp-1 text-[10px] text-white/70">{tagline}</p>
                  </div>
                </div>
                {(previewVideo || previewImage) && (
                  <div className="flex gap-2">
                    {previewVideo && (
                      <Button type="button" variant="outline" size="sm" className="text-[10px]" onClick={() => setHeroVideoUrl('')}>
                        Quitar video
                      </Button>
                    )}
                    {previewImage && (
                      <Button type="button" variant="outline" size="sm" className="text-[10px]" onClick={() => setHeroPosterUrl('')}>
                        Quitar imagen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-11 shadow-lg"
            >
              Guardar Todos los Cambios
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminBranding;
