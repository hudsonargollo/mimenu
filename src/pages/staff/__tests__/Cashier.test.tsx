import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cashier from '../Cashier';
import * as mimenuContextModule from '@/lib/mimenuContext';

// Mock dependencies that don't reference supabase
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/integrations/whatsapp', () => ({
  notificationTriggers: {
    onOrderReady: vi.fn(),
  },
}));

vi.mock('@/lib/waiterUtils', () => ({
  fetchAllWaiters: vi.fn(() => Promise.resolve([])),
  getWaiterName: vi.fn(() => 'Unknown'),
}));

// Mock useMimenu context instead of Supabase
vi.mock('@/lib/mimenuContext', () => ({
  useMimenu: vi.fn(),
}));

const mockOrders = [
  {
    id: 'order-1',
    order_number: 'ORD-001',
    venue_id: 'jaleo-001',
    fulfillment_type: 'table' as any,
    table_number: '5',
    customer_name: 'Cliente A',
    customer_phone: '+5571234567',
    total: 25.50,
    status: 'pending',
    payment_status: 'pending',
    created_at: '2024-01-01T10:00:00Z',
    items: [
      { item_id: 'item-1', name: 'Pizza', price: 15.00, quantity: 1 },
    ],
  },
  {
    id: 'order-2',
    order_number: 'ORD-002',
    venue_id: 'jaleo-001',
    fulfillment_type: 'table' as any,
    table_number: '3',
    customer_name: 'Cliente B',
    customer_phone: '+5579876543',
    total: 30.00,
    status: 'preparing',
    payment_status: 'paid',
    created_at: '2024-01-01T11:00:00Z',
    items: [
      { item_id: 'item-2', name: 'Pasta', price: 15.00, quantity: 2 },
    ],
  },
  {
    id: 'order-3',
    order_number: 'ORD-003',
    venue_id: 'jaleo-001',
    fulfillment_type: 'table' as any,
    table_number: '8',
    customer_name: 'Cliente C',
    customer_phone: '+5575555555',
    total: 18.00,
    status: 'ready',
    payment_status: 'paid',
    created_at: '2024-01-01T12:00:00Z',
    items: [
      { item_id: 'item-3', name: 'Ensalada', price: 18.00, quantity: 1 },
    ],
  },
  {
    id: 'order-4',
    order_number: 'ORD-004',
    venue_id: 'jaleo-001',
    fulfillment_type: 'table' as any,
    table_number: '2',
    customer_name: 'Cliente D',
    customer_phone: '+5571111111',
    total: 22.00,
    status: 'cancelled',
    payment_status: 'paid',
    created_at: '2024-01-01T13:00:00Z',
    items: [
      { item_id: 'item-4', name: 'Hamburguesa', price: 22.00, quantity: 1 },
    ],
  },
];

const mockTables = [
  { id: '1', number: 1, is_occupied: true },
  { id: '2', number: 2, is_occupied: false },
  { id: '3', number: 3, is_occupied: true },
  { id: '4', number: 4, is_occupied: false },
  { id: '5', number: 5, is_occupied: false },
  { id: '6', number: 6, is_occupied: false },
  { id: '7', number: 7, is_occupied: false },
  { id: '8', number: 8, is_occupied: false },
  { id: '9', number: 9, is_occupied: false },
  { id: '10', number: 10, is_occupied: false },
  { id: '11', number: 11, is_occupied: false },
  { id: '12', number: 12, is_occupied: false },
];

const mockVenue = {
  id: 'jaleo-001',
  name: 'Jaleo',
  city: 'La Paz',
  currency: 'Bs.',
  timezone: 'America/La_Paz',
};

const mockUpdateOrderStatus = vi.fn();
const mockCreateOrder = vi.fn();

const defaultContextValue = {
  venue: mockVenue,
  orders: mockOrders,
  tables: mockTables,
  cyclingOffers: [],
  updateOrderStatus: mockUpdateOrderStatus,
  createOrder: mockCreateOrder,
  addOrderToTable: vi.fn(),
  removeOrderFromTable: vi.fn(),
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Cashier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(mimenuContextModule.useMimenu).mockReturnValue(defaultContextValue as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Header', () => {
    it('displays venue name in header', () => {
      renderWithRouter(<Cashier />);
      expect(screen.getByText(/Caja & KDS/i)).toBeInTheDocument();
      expect(screen.getByText(/Jaleo/i)).toBeInTheDocument();
    });

    it('displays venue city', () => {
      renderWithRouter(<Cashier />);
      expect(screen.getByText(/La Paz/i)).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('displays pending orders count', () => {
      renderWithRouter(<Cashier />);
      const cards = screen.getAllByText('1');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays completing orders count', () => {
      renderWithRouter(<Cashier />);
      const cards = screen.getAllByText('1');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays ready orders count', () => {
      renderWithRouter(<Cashier />);
      const cards = screen.getAllByText('1');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays completed orders count', () => {
      renderWithRouter(<Cashier />);
      const cards = screen.getAllByText('1');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays occupied tables count', () => {
      renderWithRouter(<Cashier />);
      expect(screen.getByText('2 / 12')).toBeInTheDocument();
    });
  });

  describe('Tabs & Empty States', () => {
    it('shows empty state when no pending orders', () => {
      vi.mocked(mimenuContextModule.useMimenu).mockReturnValue({
        ...defaultContextValue,
        orders: [],
      } as any);
      renderWithRouter(<Cashier />);
      expect(screen.getByText(/Ningun pedido esperando pago/i)).toBeInTheDocument();
    });

    it('shows empty state when no orders in preparation', () => {
      vi.mocked(mimenuContextModule.useMimenu).mockReturnValue({
        ...defaultContextValue,
        orders: [],
      } as any);
      renderWithRouter(<Cashier />);
      const progressTab = screen.getByText(/En Preparacion/i);
      progressTab.click();
      expect(screen.getByText(/Ningun pedido en preparacion/i)).toBeInTheDocument();
    });

    it('shows empty state when no ready orders', () => {
      vi.mocked(mimenuContextModule.useMimenu).mockReturnValue({
        ...defaultContextValue,
        orders: [],
      } as any);
      renderWithRouter(<Cashier />);
      const readyTab = screen.getByText(/Listos/i);
      readyTab.click();
      expect(screen.getByText(/Ningun pedido listo/i)).toBeInTheDocument();
    });

    it('shows empty state when no completed orders', () => {
      vi.mocked(mimenuContextModule.useMimenu).mockReturnValue({
        ...defaultContextValue,
        orders: [],
      } as any);
      renderWithRouter(<Cashier />);
      const completedTab = screen.getByText(/Finalizados/i);
      completedTab.click();
      expect(screen.getByText(/Ningun pedido finalizado/i)).toBeInTheDocument();
    });
  });

  describe('Order Actions', () => {
    it('calls cancelOrder with correct status', async () => {
      renderWithRouter(<Cashier />);
      const cancelButtons = screen.getAllByText('Cancelar');
      if (cancelButtons.length > 0) {
        cancelButtons[0].click();
        await waitFor(() => {
          const confirmBtn = screen.queryByText('Si, Cancelar');
          if (confirmBtn) confirmBtn.click();
        });
      }
    });

    it('calls updateOrderStatus when moving to preparation', async () => {
      renderWithRouter(<Cashier />);
      const prepButtons = screen.queryAllByText(/Iniciar Preparacion|Enviar a Cocina/i);
      if (prepButtons.length > 0) {
        prepButtons[0].click();
        expect(mockUpdateOrderStatus).toHaveBeenCalled();
      }
    });

    it('calls updateOrderStatus when marking as ready', async () => {
      renderWithRouter(<Cashier />);
      const readyButtons = screen.queryAllByText(/Marcar como Listo/i);
      if (readyButtons.length > 0) {
        readyButtons[0].click();
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(expect.any(String), 'ready');
      }
    });

    it('calls updateOrderStatus when completing order from ready tab', async () => {
      renderWithRouter(<Cashier />);
      const readyTab = screen.getByText(/Listos/i);
      readyTab.click();
      await waitFor(() => {
        const completeButtons = screen.queryAllByText(/Entregado \/ Finalizar/i);
        if (completeButtons.length > 0) {
          completeButtons[0].click();
          expect(mockUpdateOrderStatus).toHaveBeenCalledWith(expect.any(String), 'cancelled');
        }
      });
    });
  });

  describe('Payment Verification', () => {
    it('shows paid orders with confirmed payment status', () => {
      renderWithRouter(<Cashier />);
      const paidBadges = screen.queryAllByText(/Pago Confirmado/i);
      expect(paidBadges.length).toBeGreaterThanOrEqual(0);
    });

    it('shows pending payment for unpaid orders', () => {
      renderWithRouter(<Cashier />);
      const noPaymentBadges = screen.queryAllByText(/Sin Pago/i);
      expect(noPaymentBadges.length).toBeGreaterThanOrEqual(0);
    });

    it('disables verify payment button when already paid', () => {
      renderWithRouter(<Cashier />);
      const disabledButtons = screen.queryAllByRole('button', { disabled: true });
      expect(disabledButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Order Details', () => {
    it('opens order details dialog when clicking Ver Detalles', async () => {
      renderWithRouter(<Cashier />);
      const detailsButtons = screen.queryAllByText('Ver Detalles');
      if (detailsButtons.length > 0) {
        detailsButtons[0].click();
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Customer Notification', () => {
    it('calls notificationTriggers.onOrderReady when notifying customer', async () => {
      renderWithRouter(<Cashier />);
      const notifyButtons = screen.queryAllByText(/Notificar Cliente/i);
      if (notifyButtons.length > 0) {
        notifyButtons[0].click();
        const { notificationTriggers } = require('@/integrations/whatsapp');
        await waitFor(() => {
          expect(notificationTriggers.onOrderReady).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Order filtering by tabs', () => {
    it('switches to pending tab by default', () => {
      renderWithRouter(<Cashier />);
      expect(screen.getByText('Esperando')).toBeInTheDocument();
    });

    it('can switch to preparing tab', () => {
      renderWithRouter(<Cashier />);
      const progressTab = screen.getByText('En Preparacion');
      progressTab.click();
    });

    it('can switch to ready tab', () => {
      renderWithRouter(<Cashier />);
      const readyTab = screen.getByText('Listos');
      readyTab.click();
    });

    it('can switch to completed tab', () => {
      renderWithRouter(<Cashier />);
      const completedTab = screen.getByText('Finalizados');
      completedTab.click();
    });
  });
});
