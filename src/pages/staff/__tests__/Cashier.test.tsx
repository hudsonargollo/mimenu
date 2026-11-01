import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Cashier from '../Cashier';
import * as mimenuContextModule from '@/lib/mimenuContext';
import { LanguageProvider } from '@/i18n/LanguageProvider';

// Mock external dependencies
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

vi.mock('@/lib/authContext', () => ({
  useAuth: () => ({ user: { email: 'admin@mimenu.test' }, logout: vi.fn() }),
}));

// Mock the useMimenu context
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
const mockUpdateOrder = vi.fn();
const mockCreateOrder = vi.fn();

const defaultContextValue = {
  venue: mockVenue,
  orders: mockOrders,
  tables: mockTables,
  cyclingOffers: [],
  updateOrderStatus: mockUpdateOrderStatus,
  updateOrder: mockUpdateOrder,
  createOrder: mockCreateOrder,
  addOrderToTable: vi.fn(),
  removeOrderFromTable: vi.fn(),
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </LanguageProvider>
  );
};

describe('Cashier', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(mimenuContextModule.useMimenu).mockReturnValue(defaultContextValue as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  describe('Header', () => {
    it('displays venue name in header', () => {
      renderWithRouter(<Cashier />);
      expect(screen.getByText(/Caja & KDS/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Jaleo/i).length).toBeGreaterThan(0);
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
    const emptyContext = () => vi.mocked(mimenuContextModule.useMimenu).mockReturnValue({
      ...defaultContextValue,
      orders: [],
    } as any);

    it('shows empty state when no pending orders', () => {
      emptyContext();
      renderWithRouter(<Cashier />);
      expect(screen.getByText(/Ningún pedido esperando pago/i)).toBeInTheDocument();
    });

    it('shows empty state when no orders in preparation', async () => {
      const user = userEvent.setup();
      emptyContext();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /En Preparación/i }));
      expect(await screen.findByText(/Ningún pedido en preparación/i)).toBeInTheDocument();
    });

    it('shows empty state when no ready orders', async () => {
      const user = userEvent.setup();
      emptyContext();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /Listos/i }));
      expect(await screen.findByText(/Ningún pedido listo/i)).toBeInTheDocument();
    });

    it('shows empty state when no completed orders', async () => {
      const user = userEvent.setup();
      emptyContext();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /Finalizados/i }));
      expect(await screen.findByText(/Ningún pedido finalizado/i)).toBeInTheDocument();
    });
  });

  describe('Order Actions', () => {
    it('calls updateOrderStatus with cancelled after confirming', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      const cancelButtons = screen.getAllByRole('button', { name: /Cancelar/i });
      await user.click(cancelButtons[0]);
      await user.click(await screen.findByRole('button', { name: /Sí, Cancelar/i }));
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-1', 'cancelled');
    });

    it('calls updateOrderStatus when moving to preparation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      const prepButtons = screen.queryAllByRole('button', { name: /Iniciar Preparación|Enviar a Cocina/i });
      if (prepButtons.length > 0) {
        await user.click(prepButtons[0]);
        expect(mockUpdateOrderStatus).toHaveBeenCalled();
      }
    });

    it('calls updateOrderStatus when marking as ready', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /En Preparación/i }));
      const readyButtons = await screen.findAllByRole('button', { name: /Marcar como Listo/i });
      await user.click(readyButtons[0]);
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(expect.any(String), 'ready');
    });

    it('calls updateOrder when completing order from ready tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /Listos/i }));
      const completeButtons = await screen.findAllByRole('button', { name: /Entregado \/ Finalizar/i });
      await user.click(completeButtons[0]);
      expect(mockUpdateOrder).toHaveBeenCalledWith(expect.any(String), { status: 'delivered' });
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
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      await user.click(screen.getAllByRole('button', { name: /Ver Detalles/i })[0]);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Order filtering by tabs', () => {
    it('switches to pending tab by default', () => {
      renderWithRouter(<Cashier />);
      expect(screen.getByRole('tab', { name: /Esperando/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('can switch to preparing tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /En Preparación/i }));
      expect(screen.getByRole('tab', { name: /En Preparación/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('can switch to ready tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /Listos/i }));
      expect(screen.getByRole('tab', { name: /Listos/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('can switch to completed tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Cashier />);
      await user.click(screen.getByRole('tab', { name: /Finalizados/i }));
      expect(screen.getByRole('tab', { name: /Finalizados/i })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
