import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Palette, 
  Save, 
  Store, 
  DollarSign, 
  MapPin, 
  Phone, 
  Globe, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { toast } from 'sonner';

export const AdminBranding: React.FC = () => {
  const { venue, updateVenue } = useMimenu();

  const [name, setName] = useState(venue.name);
  const [tagline, setTagline] = useState(venue.tagline);
  const [description, setDescription] = useState(venue.description);
  const [city, setCity] = useState(venue.city);
  const [address, setAddress] = useState(venue.address);
  const [phone, setPhone] = useState(venue.phone);
  const [whatsapp, setWhatsapp] = useState(venue.whatsapp);
  const [currency, setCurrency] = useState(venue.currency);
  const [primaryColor, setPrimaryColor] = useState(venue.primary_color);
  const [accentColor, setAccentColor] = useState(venue.accent_color);
  const [openingHours, setOpeningHours] = useState(venue.opening_hours);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVenue({
      name,
      tagline,
      description,
      city,
      address,
      phone,
      whatsapp,
      currency,
      primary_color: primaryColor,
      accent_color: accentColor,
      opening_hours: openingHours,
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
              Personaliza el nombre del local, colores de marca, moneda local (Bs.), ubicación en Santa Cruz y textos del menú para la experiencia multi-tenant de MIMENU.
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
          </div>

          {/* Right Column: Theme Colors & Live Preview */}
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
