import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface ReportPrintViewProps {
  dateRange: { from: Date; to: Date };
  stats: OrderStats;
  dailyStats: DailyStats[];
  waiterName?: string;
  reportType?: "geral" | "individual";
}

export const ReportPrintView = ({
  dateRange,
  stats,
  dailyStats,
  waiterName,
  reportType = "geral",
}: ReportPrintViewProps) => {
  const generatedAt = new Date();
  const totalDailyOrders = dailyStats.reduce((sum, d) => sum + d.orders, 0);
  const totalDailyRevenue = dailyStats.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="report-print-view">
      {/* Header */}
      <div className="report-header">
        <h1 className="report-title">PONTAL Carapitangui Açaiteria</h1>
        <h2 className="report-subtitle">
          Reporte {reportType === "individual" ? "Individual" : "General"} de Ventas
        </h2>
        {waiterName && (
          <p className="report-waiter">Mesero: {waiterName}</p>
        )}
        <p className="report-period">
          Período: {format(dateRange.from, "dd/MM/yyyy", { locale: es })} hasta{" "}
          {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
        </p>
        <p className="report-generated">
          Generado el: {format(generatedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="report-summary">
        <h3 className="summary-title">Resumen del Período</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Total de Pedidos</div>
            <div className="summary-value">{stats.totalOrders}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Pedidos Completados</div>
            <div className="summary-value">{stats.completedOrders}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Ingresos Totales</div>
            <div className="summary-value summary-revenue">
              Bs. {stats.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Ticket Promedio</div>
            <div className="summary-value">
              Bs. {stats.averageOrderValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="report-daily">
        <h3 className="daily-title">Ventas Diarias</h3>
        <table className="daily-table">
          <thead>
            <tr>
              <th className="table-header">Fecha</th>
              <th className="table-header table-header-right">Pedidos</th>
              <th className="table-header table-header-right">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.length === 0 ? (
              <tr>
                <td colSpan={3} className="table-cell table-empty">
                  No hay datos disponibles para el período seleccionado
                </td>
              </tr>
            ) : (
              dailyStats.map((day) => (
                <tr key={day.date}>
                  <td className="table-cell">
                    {format(new Date(day.date), "dd/MM/yyyy (EEE)", { locale: es })}
                  </td>
                  <td className="table-cell table-cell-right">{day.orders}</td>
                  <td className="table-cell table-cell-right table-cell-revenue">
                    Bs. {day.revenue.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {dailyStats.length > 0 && (
            <tfoot>
              <tr className="table-footer">
                <td className="table-cell table-cell-bold">Total</td>
                <td className="table-cell table-cell-right table-cell-bold">
                  {totalDailyOrders}
                </td>
                <td className="table-cell table-cell-right table-cell-bold table-cell-revenue">
                  Bs. {totalDailyRevenue.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer */}
      <div className="report-footer">
        <p className="footer-text">
          Este reporte fue generado automáticamente por el sistema PONTAL Carapitangui Açaiteria
        </p>
      </div>
    </div>
  );
};
