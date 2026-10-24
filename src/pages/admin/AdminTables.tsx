import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  QrCode, 
  Plus, 
  Trash2, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { VenueTable } from '@/types/mimenu';
import { toast } from 'sonner';

export const AdminTables: React.FC = () => {
  const { venue, tables, addTable, updateTable, deleteTable } = useMimenu();

  const [newTableNum, setNewTableNum] = useState('');
  const [newZone, setNewZone] = useState<'Principal' | 'Terraza' | 'VIP' | 'Barra'>('Principal');
  const [selectedQRForModal, setSelectedQRForModal] = useState<VenueTable | null>(null);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) {
      toast.error('Ingresa el número o nombre de la mesa');
      return;
    }

    const hash = `SCZ-DEMO-T${newTableNum.trim().toUpperCase()}`;

    addTable({
      venue_id: venue.id,
      table_number: newTableNum.trim(),
      label: `Mesa ${newTableNum.trim()}`,
      qr_code_hash: hash,
      zone: newZone,
      is_occupied: false,
      is_active: true,
    });

    setNewTableNum('');
    toast.success(`Mesa ${newTableNum} y código QR generados con éxito`);
  };

  const getQRUrl = (t: VenueTable) => {
    const origin = window.location.origin;
    return `${origin}/menu?table=${encodeURIComponent(t.table_number)}&qr=${encodeURIComponent(t.qr_code_hash)}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Mapeo de Mesas & Códigos QR Físicos
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cada mesa física cuenta con un Hash único. Cuando el cliente escanea el QR en su mesa, se vincula automáticamente la comanda para el Kitchen Display System (KDS).
            </p>
          </div>

          <Button
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Hojas de QR para Mesas</span>
          </Button>
        </div>

        {/* Add Table Card */}
        <Card className="border border-border/80 bg-card p-5 shadow-xs">
          <form onSubmit={handleAddTable} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-foreground mb-1 block">
                Número o Identificador de Mesa
              </label>
              <Input
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                placeholder="Ej. 25, VIP 3, Terraza 4"
                className="text-xs"
                required
              />
            </div>

            <div className="w-44">
              <label className="text-xs font-bold text-foreground mb-1 block">
                Zona del Local
              </label>
              <select
                value={newZone}
                onChange={(e) => setNewZone(e.target.value as any)}
                className="w-full text-xs h-9 px-3 rounded-md bg-background border border-input text-foreground font-medium"
              >
                <option value="Principal">Salón Principal</option>
                <option value="Terraza">Terraza al Aire Libre</option>
                <option value="VIP">Zona VIP</option>
                <option value="Barra">Barra Principal</option>
              </select>
            </div>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground font-bold text-xs h-9 px-5 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Generar Mesa & QR</span>
            </Button>
          </form>
        </Card>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((t) => {
            const qrUrl = getQRUrl(t);
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}&color=000000&bgcolor=ffffff`;

            return (
              <Card
                key={t.id}
                className={`border-2 transition-all duration-200 bg-card overflow-hidden shadow-xs flex flex-col justify-between ${
                  t.is_occupied ? 'border-amber-500/60 bg-amber-500/5' : 'border-border/80'
                }`}
              >
                <CardHeader className="p-3.5 bg-muted/20 border-b border-border/60 flex flex-row items-center justify-between pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {t.zone}
                    </span>
                    <CardTitle className="text-base font-black text-foreground">
                      {t.label}
                    </CardTitle>
                  </div>

                  <button
                    onClick={() => updateTable(t.id, { is_occupied: !t.is_occupied })}
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      t.is_occupied
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                    }`}
                  >
                    {t.is_occupied ? 'Ocupada' : 'Libre'}
                  </button>
                </CardHeader>

                <CardContent className="p-4 flex flex-col items-center space-y-3">
                  {/* QR Image */}
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-200">
                    <img
                      src={qrApiUrl}
                      alt={`QR Mesa ${t.table_number}`}
                      className="w-28 h-28 object-contain"
                    />
                  </div>

                  <div className="text-center space-y-0.5">
                    <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {t.qr_code_hash}
                    </code>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">
                      {qrUrl}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full pt-2 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(qrUrl, '_blank')}
                      className="flex-1 text-[11px] h-8 font-bold gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Probar</span>
                    </Button>

                    <button
                      onClick={() => deleteTable(t.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar mesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTables;
