import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { isSafeMediaUrl } from '@/lib/media';
import { toast } from 'sonner';

const MAX_FEATURED = 12;

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

  // Branding fields are local drafts; pull the new media fields again if the
  // tenant switcher changes the active venue while this page is mounted.
  useEffect(() => {
    setHeroVideoUrl(venue.hero_video_url ?? '');
    setHeroPosterUrl(venue.hero_poster_url ?? '');
    setFeaturedIds(venue.featured_item_ids ?? []);
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
    });
    toast.success('Configuraciones de marca y White-Label actualizadas');
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-pink-500" />
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Motor White-Label & Personalización
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Personaliza el nombre del local, colores de marca, moneda local (Bs.), ubicación, portada con video y los platos destacados del menú.
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </Button>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Brand Info */}
          <div className="lg:col-span-8 space-y-6">
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
                <Palette className="w-4 h-4 text-pink-500" />
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
