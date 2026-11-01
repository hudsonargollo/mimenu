import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Clock, RotateCw, Zap } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { HotnessIndicator } from '@/components/HotnessIndicator';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const AdminAnalytics: React.FC = () => {
  const { venue, categories, recalculateAllHotness } = useMimenu();

  const allItems = categories.flatMap(c => c.items);
  const sortedByHotness = allItems.length > 0 && allItems.some(i => i.velocity_24h > 0)
    ? [...allItems].sort((a, b) => b.hotness_score - a.hotness_score || b.velocity_24h - a.velocity_24h)
    : [];

  // Peak Hours chart — empty state since no real data yet
  const peakHours: Array<{ hour: string; orders: number; label: string }> = [];

  const maxOrders = peakHours.length > 0 ? Math.max(...peakHours.map(p => p.orders)) : 1;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <AdminPageHeader
          index="05"
          eyebrow="Hotness"
          title="Hotness y analítica"
          description={
            <>
              Velocidad en tiempo real: <span className="font-mono text-[11px] text-foreground">velocity 24h / baseline 14d</span>.
              Genera prueba social visual sin exponer ventas brutas.
            </>
          }
          actions={
            <button
              onClick={recalculateAllHotness}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground bg-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Recalcular todo
            </button>
          }
          meta={
            <>
              <span className="noir-eyebrow">{allItems.length} platos</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow">{sortedByHotness.length} con movimiento</span>
            </>
          }
        />

        {/* Algorithm Logic Explanation Card */}
        <section className="my-8 flex items-start gap-4 border-y border-border bg-card/50 px-5 py-5">
          <span className="mt-0.5 shrink-0 text-primary">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="noir-eyebrow">Cómo funciona</p>
            <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-muted-foreground">
              Cada pedido incrementa la velocidad de las últimas 24 horas del plato. Cuando la relación contra el
              promedio histórico de 14 días supera 3.5x o supera 40 pedidos diarios, el plato pasa al estado{' '}
              <strong className="font-semibold text-foreground">En llamas</strong>, se posiciona primero en
              recomendaciones y dispara la conversión de clientes indecisos.
            </p>
          </div>
        </section>

        {/* Peak Hours Nightlife Chart */}
        <section className="border-y border-border">
          <div className="flex items-center justify-between gap-4 border-b border-border py-3">
            <p className="noir-eyebrow">Curva de demanda por horario</p>
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </div>
          <div className="p-0">
            {peakHours.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Clock className="mx-auto mb-2 h-5 w-5 opacity-40" aria-hidden="true" />
                No hay datos de pedidos por horario aún. La curva aparecerá cuando empiecen a fluir los pedidos.
              </div>
            ) : (
            <div className="flex h-44 items-end gap-2 border-b border-border/60 pt-6">
              {peakHours.map((p, idx) => {
                const heightPct = (p.orders / maxOrders) * 100;
                const isPeak = p.orders >= 75;

                return (
                  <div key={idx} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="noir-num text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                      {p.orders}
                    </span>
                    <div
                      className={`w-full transition-all duration-300 ${
                        isPeak ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="noir-num pt-1 text-[10px] font-semibold text-muted-foreground">
                      {p.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </section>

        {/* Full Menu Velocity Table */}
        <section className="mt-8 overflow-hidden border-y border-border">
          <div className="border-b border-border py-3">
            <p className="noir-eyebrow">Desglose de velocidad por ítem del menú</p>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="py-2.5 pr-3 font-semibold">Ítem</th>
                    <th className="px-3 py-2.5 font-semibold">Precio</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Velocidad 24h</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Base 14d</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Ratio</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Hotness</th>
                    <th className="py-2.5 pl-3 text-right font-semibold">Reseñas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {sortedByHotness.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                        No hay datos de ventas aún. Los pedidos alimentarán este ranking en tiempo real.
                      </td>
                    </tr>
                  ) : (
                  sortedByHotness.map((item) => {
                    const ratio = (item.velocity_24h / (item.baseline_14d || 1)).toFixed(1);

                    return (
                      <tr key={item.id} className="transition-colors hover:bg-card/70">
                        <td className="flex items-center gap-2.5 py-3 pr-3 font-semibold">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-8 w-10 rounded-[2px] border border-border object-cover"
                          />
                          <span className="truncate">{item.name}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-display text-sm">
                          {venue.currency} {item.price}
                        </td>
                        <td className="noir-num px-3 py-3 text-center font-bold text-foreground">
                          {item.velocity_24h}
                        </td>
                        <td className="noir-num px-3 py-3 text-center text-muted-foreground">
                          {item.baseline_14d}/día
                        </td>
                        <td className="noir-num px-3 py-3 text-center font-bold text-emerald-600">
                          {ratio}x
                        </td>
                        <td className="px-3 py-3 text-center">
                          <HotnessIndicator score={item.hotness_score} compact />
                        </td>
                        <td className="noir-num py-3 pl-3 text-right font-semibold text-muted-foreground">
                          {item.average_rating > 0 ? item.average_rating.toFixed(1) : '—'} ({item.reviews_count})
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
