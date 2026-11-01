/**
 * Commission Type Definitions
 * 
 * TypeScript interfaces and types for the commission tracking system.
 * These types ensure type safety and consistency across commission-related
 * components and utilities.
 */

/**
 * Order shape consumed by commission components.
 *
 * `total_amount` is the historical field used by the commission math while the
 * rest of the app stores orders with `total`; callers mapping local orders
 * should provide `total_amount` explicitly (see `toCommissionOrder`).
 */
export interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status?: string | null;
  order_number?: string | number;
  customer_name?: string | null;
  customer_phone?: string | null;
  waiter_id?: string | null;
  table_number?: string | number | null;
  payment_method?: string | null;
  items?: unknown[];
  pix_qr_code?: string | null;
  pix_expires_at?: string | null;
  kitchen_notified_at?: string | null;
  notified_at?: string | null;
  payment_confirmed_at?: string | null;
  payment_expires_at?: string | null;
  mercadopago_payment_id?: string | null;
  pix_copy_paste?: string | null;
  qr_code_data?: string | null;
  ready_at?: string | null;
}

/**
 * Commission display configuration
 * 
 * Defines how a commission should be displayed in the UI, including
 * styling, icons, and tooltip information based on the order's payment status.
 * 
 * @example
 * ```typescript
 * const config: CommissionDisplayConfig = {
 *   amount: 5.50,
 *   displayAmount: "Bs 5,50",
 *   status: "confirmed",
 *   className: "text-green-600 font-semibold",
 *   icon: "CheckCircle",
 *   tooltip: "Comisión confirmada"
 * };
 * ```
 */
export interface CommissionDisplayConfig {
  /**
   * Raw commission amount in BOB (Bolivian boliviano)
   * Calculated as order total * commission rate
   */
  amount: number;

  /**
   * Formatted display string with currency symbol
   * Localized to es-BO format (e.g., "Bs 5,50")
   */
  displayAmount: string;

  /**
   * Commission status category
   * - confirmed: From paid/completed orders
   * - pending: From orders awaiting payment
   * - excluded: From cancelled/expired orders
   */
  status: 'confirmed' | 'pending' | 'excluded';

  /**
   * CSS class names for styling the commission display
   * Includes color, font weight, and text decoration
   */
  className: string;

  /**
   * Icon name for visual status indicator
   * - CheckCircle: Confirmed commissions
   * - Clock: Pending commissions
   * - XCircle: Excluded commissions
   */
  icon: 'CheckCircle' | 'Clock' | 'XCircle';

  /**
   * Tooltip text explaining the commission status
   * Displayed on hover to provide context to users
   */
  tooltip: string;
}

/**
 * Commission statistics breakdown
 * 
 * Aggregated commission data showing confirmed earnings from paid orders
 * and estimated earnings from pending orders. Used for dashboard displays
 * and reporting.
 * 
 * @example
 * ```typescript
 * const stats: CommissionStats = {
 *   confirmed: {
 *     total: 125.50,
 *     orderCount: 15
 *   },
 *   estimated: {
 *     total: 45.00,
 *     orderCount: 5
 *   },
 *   total: {
 *     potential: 170.50,
 *     orderCount: 20
 *   }
 * };
 * ```
 */
export interface CommissionStats {
  /**
   * Confirmed commissions from paid orders
   */
  confirmed: {
    /**
     * Total confirmed commission amount in BOB (Bolivian boliviano)
     * Sum of commissions from all paid/completed orders
     */
    total: number;

    /**
     * Number of paid orders contributing to confirmed commissions
     */
    orderCount: number;
  };

  /**
   * Estimated commissions from pending orders
   */
  estimated: {
    /**
     * Total estimated commission amount in BOB (Bolivian boliviano)
     * Sum of potential commissions from pending orders
     */
    total: number;

    /**
     * Number of pending orders contributing to estimated commissions
     */
    orderCount: number;
  };

  /**
   * Combined totals across all commission categories
   */
  total: {
    /**
     * Total potential commission (confirmed + estimated)
     * Represents maximum possible earnings if all pending orders are paid
     */
    potential: number;

    /**
     * Total number of orders (paid + pending)
     * Excludes cancelled and expired orders
     */
    orderCount: number;
  };
}

/**
 * Order status category type
 * 
 * Union type of valid status category keys used for filtering orders
 * in commission calculations.
 */
export type OrderStatusCategory = 'PAID' | 'PENDING' | 'EXCLUDED';

/**
 * Commission calculation result
 * 
 * Return type for commission calculation functions, providing both
 * the raw amount and formatted display string.
 */
export interface CommissionCalculationResult {
  /**
   * Raw commission amount in BOB (Bolivian boliviano)
   */
  amount: number;

  /**
   * Formatted display string with currency
   */
  formatted: string;
}
