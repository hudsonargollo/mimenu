import { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, ShoppingCart, TrendingUp, Calendar as CalendarIcon, Download, Printer, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usePrintReport } from "@/hooks/usePrintReport";
import { ReportPrintView } from "@/components/printable/ReportPrintView";
import { useMimenu } from "@/lib/mimenuContext";

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
      <div className="space-y-4">
        <Card className="p-4 border-2 border-accent rounded-none shadow-soft">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-sm font-medium">
              {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <CalendarIcon className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Período</span>
                  </Button>
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
              <Button onClick={handlePrintReport} variant="outline" size="sm" className="flex-1 sm:flex-none" disabled={isPrinting}>
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-white border-2 border-accent rounded-none shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-none flex items-center justify-center shadow-soft">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-body text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-2 border-accent rounded-none shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-none flex items-center justify-center shadow-soft">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-body text-gray-600">Ingresos</p>
                <p className="text-xl font-bold text-green-600">Bs. {stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-2 border-accent rounded-none shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/90 rounded-none flex items-center justify-center shadow-soft">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-body text-gray-600">Ticket promedio</p>
                <p className="text-xl font-bold text-primary">Bs. {stats.averageOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-2 border-accent rounded-none shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/90 rounded-none flex items-center justify-center shadow-soft">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-body text-gray-600">Completados</p>
                <p className="text-2xl font-bold">{stats.completedOrders}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 border-2 border-accent rounded-none shadow-soft">
          <h3 className="font-bold text-lg mb-3">Ventas diarias</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-right py-2 px-2">Pedidos</th>
                  <th className="text-right py-2 px-2">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">Sin datos</td></tr>
                ) : (
                  dailyStats.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{format(new Date(day.date), "dd/MM/yyyy (EEE)", { locale: es })}</td>
                      <td className="text-right py-2 px-2 font-semibold">{day.orders}</td>
                      <td className="text-right py-2 px-2 font-bold text-green-600">Bs. {day.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {dailyStats.length > 0 && (
                <tfoot>
                  <tr className="font-bold bg-gray-100">
                    <td className="py-2 px-2">Total</td>
                    <td className="text-right py-2 px-2">{dailyStats.reduce((sum, d) => sum + d.orders, 0)}</td>
                    <td className="text-right py-2 px-2 text-green-600">
                      Bs. {dailyStats.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
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
