import { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, ShoppingCart, TrendingUp, Calendar as CalendarIcon, Download, Printer, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usePrintReport } from "@/hooks/usePrintReport";
import { ReportPrintView } from "@/components/printable/ReportPrintView";
import { useMimenu } from "@/lib/mimenuContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

const Reports = () => {
  const { orders } = useMimenu();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: new Date() };
  });

  const { printReport, isPrinting, reportData, printRef } = usePrintReport();

  const { stats, dailyStats } = useMemo(() => {
    const from = dateRange.from.getTime();
    const to = dateRange.to.getTime();

    const inRange = orders.filter((order) => {
      const created = new Date(order.created_at).getTime();
      return created >= from && created <= to && order.status !== "cancelled";
    });

    const paid = inRange.filter((order) => order.payment_status === "paid");
    const completed = inRange.filter((order) => order.status === "delivered");
    const totalRevenue = paid.reduce((sum, order) => sum + order.total, 0);

    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    paid.forEach((order) => {
      const date = format(new Date(order.created_at), "yyyy-MM-dd");
      const existing = dailyMap.get(date) || { orders: 0, revenue: 0 };
      dailyMap.set(date, {
        orders: existing.orders + 1,
        revenue: existing.revenue + order.total,
      });
    });

    return {
      stats: {
        totalOrders: inRange.length,
        completedOrders: completed.length,
        totalRevenue,
        averageOrderValue: paid.length > 0 ? totalRevenue / paid.length : 0,
      } satisfies OrderStats,
      dailyStats: Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)) satisfies DailyStats[],
    };
  }, [orders, dateRange]);

  const exportToCSV = () => {
    const headers = ["Fecha", "Pedidos", "Ingresos"];
    const rows = dailyStats.map((d) => [
      format(new Date(d.date), "dd/MM/yyyy"),
      d.orders,
      `Bs. ${d.revenue.toFixed(2)}`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${format(dateRange.from, "dd-MM-yyyy")}-${format(dateRange.to, "dd-MM-yyyy")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("¡CSV exportado!");
  };

  const handlePrintReport = () => {
    printReport({ dateRange, stats, dailyStats, reportType: "geral" });
  };

  return (
    <AdminLayout>
      <div className="pb-12">
        <AdminPageHeader
          index="13"
          eyebrow="Reportes"
          title="Reportes de ventas"
          description="Pedidos, ingresos y ticket promedio del período seleccionado."
          actions={
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {format(dateRange.from, "dd/MM/yy")} — {format(dateRange.to, "dd/MM/yy")}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <button
                onClick={handlePrintReport}
                disabled={isPrinting}
                className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground disabled:opacity-50"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Imprimir
              </button>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground bg-foreground px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-85"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Exportar
              </button>
            </>
          }
        />

        <section className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border lg:grid-cols-4 lg:divide-y-0">
          {[
            { label: "Pedidos", value: String(stats.totalOrders), icon: <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />, note: "en el período" },
            { label: "Ingresos", value: `Bs. ${stats.totalRevenue.toFixed(0)}`, icon: <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />, note: "pagos confirmados" },
            { label: "Ticket promedio", value: `Bs. ${stats.averageOrderValue.toFixed(0)}`, icon: <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />, note: "por pedido pagado" },
            { label: "Completados", value: String(stats.completedOrders), icon: <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />, note: "pedidos entregados" },
          ].map((cell) => (
            <div key={cell.label} className="flex flex-col justify-between gap-7 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="noir-eyebrow">{cell.label}</span>
                <span className="text-muted-foreground">{cell.icon}</span>
              </div>
              <div>
                <p className="noir-num font-display text-[2rem] leading-none tracking-[-0.02em] text-foreground">
                  {cell.value}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{cell.note}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 border-y border-border">
          <div className="border-b border-border py-3">
            <p className="noir-eyebrow">Ventas diarias</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="py-2.5 pr-2 text-left font-semibold">Fecha</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Pedidos</th>
                  <th className="py-2.5 pl-2 text-right font-semibold">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {dailyStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">Sin datos en el período.</td>
                  </tr>
                ) : (
                  dailyStats.map((day) => (
                    <tr key={day.date} className="transition-colors hover:bg-card/70">
                      <td className="py-2.5 pr-2 capitalize">
                        {format(new Date(day.date), "dd/MM/yyyy (EEE)", { locale: es })}
                      </td>
                      <td className="noir-num px-2 py-2.5 text-right font-semibold">{day.orders}</td>
                      <td className="noir-num py-2.5 pl-2 text-right font-display text-sm text-emerald-700">
                        Bs. {day.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {dailyStats.length > 0 && (
                <tfoot className="border-t border-foreground/20">
                  <tr className="text-[11px] font-bold">
                    <td className="py-3 pr-2 uppercase tracking-[0.12em]">Total</td>
                    <td className="noir-num px-2 py-3 text-right">{dailyStats.reduce((sum, d) => sum + d.orders, 0)}</td>
                    <td className="noir-num py-3 pl-2 text-right text-emerald-700">
                      Bs. {dailyStats.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>

      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {reportData && (
            <ReportPrintView
              dateRange={reportData.dateRange}
              stats={reportData.stats}
              dailyStats={reportData.dailyStats}
              reportType={reportData.reportType}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
