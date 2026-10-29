import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Sparkles, 
  RotateCw,
  Award,
  Zap
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { HotnessIndicator } from '@/components/HotnessIndicator';
import { calculateHotnessScore } from '@/data/mimenuData';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500 fill-red-500" />
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Algoritmo "Hotness" & Analítica
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fórmula de velocidad en tiempo real: <code className="bg-muted px-1.5 py-0.5 rounded font-bold text-foreground">Velocity (24h) / Baseline (14d)</code> para generar social proof visual sin exponer ventas brutas.
            </p>
          </div>

          <Button
            onClick={recalculateAllHotness}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md"
          >
            <RotateCw className="w-4 h-4" />
            <span>Recalcular Todo Ahora</span>
          </Button>
        </div>

        {/* Algorithm Logic Explanation Card */}
        <Card className="border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-red-500/10 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                ¿Cómo funciona el Termómetro de Hotness en MIMENU?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cada pedido incrementa la velocidad de las últimas 24 horas del plato. Cuando la relación contra el promedio histórico de 14 días supera 3.5x o supera 40 pedidos diarios, el plato pasa automáticamente al estado <strong>¡En Llamas! 🔥🔥🔥</strong>, posicionándose primero en recomendaciones y disparando la conversión de clientes indecisos.
              </p>
            </div>
          </div>
        </Card>

        {/* Peak Hours Nightlife Chart */}
        <Card className="border border-border/80 bg-card p-5 shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Curva de Demanda por Horario</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            {peakHours.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                No hay datos de pedidos por horario aún. La curva de demanda se mostrará una vez que los pedidos empiecen a fluir.
              </div>
            ) : (
            <div className="flex items-end gap-2 h-44 pt-6 border-b border-border/60">
              {peakHours.map((p, idx) => {
                const heightPct = (p.orders / maxOrders) * 100;
                const isPeak = p.orders >= 75;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                      {p.orders}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isPeak
                          ? 'bg-gradient-to-t from-red-600 to-amber-500 shadow-md'
                          : 'bg-primary/40 group-hover:bg-primary/70'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-bold text-muted-foreground pt-1">
                      {p.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          </CardContent>
        </Card>

        {/* Full Menu Velocity Table */}
        <Card className="border border-border/80 bg-card overflow-hidden shadow-sm">
          <CardHeader className="p-4 bg-muted/20 border-b border-border/60">
            <CardTitle className="text-sm font-black uppercase tracking-wider">
              Desglose de Velocidad por Ítem del Menú
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-bold uppercase text-[10px] border-b border-border/60">
                  <tr>
                    <th className="p-3">Ítem</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3 text-center">Velocidad 24h</th>
                    <th className="p-3 text-center">Base 14d</th>
                    <th className="p-3 text-center">Ratio</th>
                    <th className="p-3 text-center">Hotness Score</th>
                    <th className="p-3 text-right">Reseñas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sortedByHotness.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                        No hay datos de ventas aún. Los pedidos comenzarán a alimentar este ranking en tiempo real.
                      </td>
                    </tr>
                  ) : (
                  sortedByHotness.map((item) => {
                    const ratio = (item.velocity_24h / (item.baseline_14d || 1)).toFixed(1);

                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover border border-border"
                          />
                          <span>{item.name}</span>
                        </td>
                        <td className="p-3 font-bold text-amber-500">
                          {venue.currency} {item.price}
                        </td>
                        <td className="p-3 text-center font-bold text-foreground">
                          {item.velocity_24h}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">
                          {item.baseline_14d}/día
                        </td>
                        <td className="p-3 text-center font-black text-emerald-500">
                          {ratio}x
                        </td>
                        <td className="p-3 text-center">
                          <HotnessIndicator score={item.hotness_score} compact />
                        </td>
                        <td className="p-3 text-right font-bold text-muted-foreground">
                          ⭐ {item.average_rating > 0 ? item.average_rating : '-'} ({item.reviews_count})
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
