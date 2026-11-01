import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Printer, ExternalLink } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { VenueTable } from '@/types/mimenu';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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

    const hash = `${venue.slug.toUpperCase()}-T${newTableNum.trim().toUpperCase()}`;

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
        <AdminPageHeader
          index="03"
          eyebrow="Mesas y QR"
          title="Mesas y códigos QR"
          description="Cada mesa física tiene un hash único. Al escanear el QR, la comanda se vincula sola al Kitchen Display System."
          actions={
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground bg-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Imprimir hojas QR
            </button>
          }
          meta={
            <>
              <span className="noir-eyebrow">{tables.length} mesas</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow">{tables.filter((t) => t.is_occupied).length} ocupadas</span>
            </>
          }
        />

        {/* Add Table Card */}
        <section className="border-y border-border bg-card/50 px-5 py-4">
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

            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-foreground bg-foreground px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Generar mesa y QR
            </button>
          </form>
        </section>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-border">
          {tables.map((t) => {
            const qrUrl = getQRUrl(t);
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}&color=000000&bgcolor=ffffff`;

            return (
              <div
                key={t.id}
                className={`flex flex-col justify-between border-b border-r border-border p-4 transition-colors ${
                  t.is_occupied ? 'bg-accent/5' : 'hover:bg-card/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="noir-eyebrow">{t.zone}</p>
                    <p className="mt-0.5 truncate font-display text-lg leading-tight text-foreground">{t.label}</p>
                  </div>

                  <button
                    onClick={() => updateTable(t.id, { is_occupied: !t.is_occupied })}
                    className={`shrink-0 border-0 border-b bg-transparent pb-0.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors ${
                      t.is_occupied
                        ? 'border-amber-600 text-amber-700'
                        : 'border-emerald-600/50 text-emerald-700'
                    }`}
                  >
                    {t.is_occupied ? 'Ocupada' : 'Libre'}
                  </button>
                </div>

                <div className="mt-4 flex flex-col items-center gap-3">
                  {/* QR Image */}
                  <div className="rounded-[2px] border border-border bg-white p-2">
                    <img
                      src={qrApiUrl}
                      alt={`QR Mesa ${t.table_number}`}
                      className="h-28 w-28 object-contain"
                    />
                  </div>

                  <div className="w-full space-y-0.5 text-center">
                    <code className="block truncate text-[10px] font-mono text-muted-foreground">
                      {t.qr_code_hash}
                    </code>
                    <p className="line-clamp-1 max-w-[200px] truncate text-[10px] text-muted-foreground/70">
                      {qrUrl}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex w-full items-center gap-2 border-t border-border pt-2">
                    <button
                      onClick={() => window.open(qrUrl, '_blank')}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 border border-border bg-transparent py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      Probar
                    </button>

                    <button
                      onClick={() => deleteTable(t.id)}
                      className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                      title="Eliminar mesa"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTables;
