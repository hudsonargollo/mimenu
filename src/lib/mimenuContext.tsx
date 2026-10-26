import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Venue, 
  MenuCategoryDetail, 
  MenuItemDetail, 
  CyclingOffer, 
  VenueTable, 
  MerchandiseItem, 
  MenuItemReview, 
  MimenuOrder, 
  FulfillmentType, 
  HotnessLevel,
  CustomerProfile
} from '@/types/mimenu';
import { 
  DEFAULT_VENUE, 
  INITIAL_CATEGORIES, 
  INITIAL_CYCLING_OFFERS, 
  INITIAL_TABLES, 
  INITIAL_REVIEWS,
  calculateHotnessScore
} from '@/data/mimenuData';
import { toast } from 'sonner';
import {
  resolveVenueSlug,
  findVenueBySlug,
  defaultVenueSlug,
  toVenue,
  categoriesFor,
  tableCountFor,
} from '@/lib/venueRegistry';

interface MimenuContextType {
  venue: Venue;
  updateVenue: (updated: Partial<Venue>) => void;
  categories: MenuCategoryDetail[];
  cyclingOffers: CyclingOffer[];
  activeOffers: CyclingOffer[];
  tables: VenueTable[];
  reviews: MenuItemReview[];
  orders: MimenuOrder[];
  customers: CustomerProfile[];
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
  fulfillmentType: FulfillmentType;
  setFulfillmentType: (type: FulfillmentType) => void;
  
  // Hotness recalculation
  recalculateAllHotness: () => void;

  // Contextual Upsell Engine
  getContextualUpsells: (currentCartItemIds: string[]) => MenuItemDetail[];
  
  // Cycling offers methods
  addCyclingOffer: (offer: Omit<CyclingOffer, 'id' | 'analytics'>) => void;
  updateCyclingOffer: (id: string, offer: Partial<CyclingOffer>) => void;
  deleteCyclingOffer: (id: string) => void;
  recordOfferImpression: (offerId: string) => void;
  recordOfferClick: (offerId: string) => void;
  recordOfferConversion: (offerId: string, revenue: number) => void;
  
  // Reviews methods
  addReview: (itemId: string, customerName: string, rating: number, comment: string) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  getItemReviews: (itemId: string) => MenuItemReview[];
  
  // Table methods
  addTable: (table: Omit<VenueTable, 'id'>) => void;
  updateTable: (id: string, table: Partial<VenueTable>) => void;
  deleteTable: (id: string) => void;
  resolveTableByHash: (hash: string) => VenueTable | undefined;
  
  // Batch Onboarding & Menu methods
  setCategories: (cats: MenuCategoryDetail[] | ((prev: MenuCategoryDetail[]) => MenuCategoryDetail[])) => void;
  setTables: (tables: VenueTable[] | ((prev: VenueTable[]) => VenueTable[])) => void;
  batchSetupVenue: (venueData: Partial<Venue>, newCategories: MenuCategoryDetail[], tableCount: number) => void;
  
  // Order & CRM methods
  createOrder: (orderData: Omit<MimenuOrder, 'id' | 'order_number' | 'created_at' | 'status'>) => MimenuOrder;
  updateOrderStatus: (orderId: string, status: MimenuOrder['status']) => void;
  updateCustomerNotes: (customerId: string, notes: string) => void;
}

const MimenuContext = createContext<MimenuContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VENUE: 'mimenu_venue_v2',
  CATEGORIES: 'mimenu_categories_v2',
  OFFERS: 'mimenu_cycling_offers_v2',
  TABLES: 'mimenu_tables_v2',
  REVIEWS: 'mimenu_reviews_v2',
  ORDERS: 'mimenu_orders_v2',
  CUSTOMERS: 'mimenu_customers_v2',
  SELECTED_TABLE: 'mimenu_selected_table_v2',
  FULFILLMENT: 'mimenu_fulfillment_v2',
};

const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cust-1",
    name: "Andrés Banzer",
    phone: "+591 78012345",
    total_orders: 8,
    total_spent: 640,
    first_visit_at: "2026-08-10T20:00:00Z",
    last_visit_at: "2026-09-24T22:30:00Z",
    favorite_items: ["Salchipapa Monster", "Chopp Artesanal (500ml)"],
    loyalty_tier: "VIP",
    notes: "Comensal frecuente de terraza. Prefiere extra salsa de ajo."
  },
  {
    id: "cust-2",
    name: "Mariana Justiniano",
    phone: "+591 77345678",
    total_orders: 5,
    total_spent: 420,
    first_visit_at: "2026-08-22T21:15:00Z",
    last_visit_at: "2026-09-23T23:10:00Z",
    favorite_items: ["Nachos Supremos", "Fernet Branca con Coca (Jarra 1L)"],
    loyalty_tier: "Oro",
    notes: "Suele venir en grupos los viernes por la noche."
  },
  {
    id: "cust-3",
    name: "Carlos Villagómez",
    phone: "+591 70098765",
    total_orders: 2,
    total_spent: 135,
    first_visit_at: "2026-09-12T19:40:00Z",
    last_visit_at: "2026-09-20T20:15:00Z",
    favorite_items: ["Salchipapa Clásica Cruceña"],
    loyalty_tier: "Plata"
  }
];

export const MimenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Venue state — the active tenant, resolved from ?v=<slug> in the URL.
  const [venue, setVenue] = useState<Venue>(() => {
    if (typeof window !== 'undefined') {
      const { slug, requested, found } = resolveVenueSlug(window.location.search);
      const matched = findVenueBySlug(slug);
      if (matched) return toVenue(matched);
      // A slug was requested but does not exist: fall back to the demo tenant.
      if (requested && !found) return toVenue(findVenueBySlug(defaultVenueSlug()) ?? DEFAULT_VENUE);
    }
    const saved = localStorage.getItem(STORAGE_KEYS.VENUE);
    return saved ? JSON.parse(saved) : DEFAULT_VENUE;
  });

  // Categories & items state — the active tenant's menu.
  const [categories, setCategories] = useState<MenuCategoryDetail[]>(() => {
    if (typeof window !== 'undefined') {
      const { slug } = resolveVenueSlug(window.location.search);
      const matched = findVenueBySlug(slug);
      if (matched) {
        const cats = categoriesFor(matched);
        if (cats.length > 0) return cats;
      }
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Cycling offers state
  const [cyclingOffers, setCyclingOffers] = useState<CyclingOffer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFERS);
    return saved ? JSON.parse(saved) : INITIAL_CYCLING_OFFERS;
  });

  // Tables state — generated from the active tenant's table count.
  const [tables, setTables] = useState<VenueTable[]>(() => {
    if (typeof window !== 'undefined') {
      const { slug } = resolveVenueSlug(window.location.search);
      const matched = findVenueBySlug(slug);
      if (matched) {
        return Array.from({ length: tableCountFor(matched) }, (_, idx) => ({
          id: `tbl-${matched.slug}-${idx + 1}`,
          venue_id: matched.id,
          table_number: (idx + 1).toString(),
          label: `Mesa ${idx + 1}`,
          qr_code_hash: `${matched.slug}-m${idx + 1}`,
          zone: idx < 6 ? 'Principal' : 'Terraza',
          is_occupied: false,
          is_active: true,
        }));
      }
    }
    const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  // Reviews state
  const [reviews, setReviews] = useState<MenuItemReview[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Orders state
  const [orders, setOrders] = useState<MimenuOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [
      {
        id: "ord-1001",
        order_number: "1001",
        venue_id: "venue-mimenu-demo",
        fulfillment_type: "dine_in",
        table_number: "4",
        customer_name: "Andrés Banzer",
        customer_phone: "+591 78012345",
        items: [
          { item_id: "item-salchipapa-monster", name: "Salchipapa Monster", price: 45, quantity: 1, notes: "Extra salsa de ajo" },
          { item_id: "item-chopp-artesanal", name: "Chopp Artesanal (500ml)", price: 25, quantity: 2 }
        ],
        subtotal: 95,
        discount: 0,
        total: 95,
        status: "preparing",
        payment_method: "qr_simple",
        payment_status: "paid",
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: "ord-1002",
        order_number: "1002",
        venue_id: "venue-mimenu-demo",
        fulfillment_type: "dine_in",
        table_number: "VIP 1",
        customer_name: "Mariana Justiniano",
        customer_phone: "+591 77345678",
        items: [
          { item_id: "item-fernet-branca", name: "Fernet Branca con Coca (Jarra 1L)", price: 35, quantity: 2 },
          { item_id: "item-nachos-supremos", name: "Nachos Supremos", price: 48, quantity: 1 }
        ],
        subtotal: 118,
        discount: 0,
        total: 118,
        status: "delivered",
        payment_method: "card",
        payment_status: "paid",
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      }
    ];
  });

  // Customer CRM state
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Selected table & fulfillment
  const [selectedTable, setSelectedTableState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table') || urlParams.get('mesa') || urlParams.get('t');
      if (tableParam) return tableParam;
    }
    return localStorage.getItem(STORAGE_KEYS.SELECTED_TABLE) || "4";
  });

  const [fulfillmentType, setFulfillmentTypeState] = useState<FulfillmentType>(() => {
    return (localStorage.getItem(STORAGE_KEYS.FULFILLMENT) as FulfillmentType) || 'dine_in';
  });

  // Tracks the URL search string so tenant switches re-resolve the venue.
  const [urlSearch, setUrlSearch] = useState<string>(
    () => (typeof window !== 'undefined' ? window.location.search + window.location.pathname : '')
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => setUrlSearch(window.location.search + window.location.pathname);
    window.addEventListener('popstate', sync);
    const wrap = (method: 'pushState' | 'replaceState') => {
      const original = history[method];
      history[method] = function (this: History, ...args: Parameters<History['pushState']>) {
        original.apply(this, args as []);
        sync();
      };
    };
    wrap('pushState');
    wrap('replaceState');
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { slug, requested, found } = resolveVenueSlug(window.location.search);
    // resolveVenueSlug now also checks pathname internally
    const matched = findVenueBySlug(slug);
    if (!matched) return;
    setVenue((current) => {
      if (current.slug === matched.slug) return current;
      const next = toVenue(matched);
      toast.info(`Cambiaste a ${next.name}${requested && !found ? ' (venue no encontrado)' : ''}`);
      return next;
    });
    setCategories((current) => {
      const cats = categoriesFor(matched);
      return cats.length > 0 ? cats : current;
    });
    setTables(
      Array.from({ length: tableCountFor(matched) }, (_, idx) => ({
        id: `tbl-${matched.slug}-${idx + 1}`,
        venue_id: matched.id,
        table_number: (idx + 1).toString(),
        label: `Mesa ${idx + 1}`,
        qr_code_hash: `${matched.slug}-m${idx + 1}`,
        zone: idx < 6 ? 'Principal' : 'Terraza',
        is_occupied: false,
        is_active: true,
      }))
    );
  }, [urlSearch]);

  // Auto-detect table / QR from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get('qr');
    const tableParam = urlParams.get('table') || urlParams.get('mesa') || urlParams.get('t');

    if (qrParam) {
      const matched = tables.find(t => t.qr_code_hash.toLowerCase() === qrParam.toLowerCase());
      if (matched) {
        setSelectedTable(matched.table_number);
        setFulfillmentType('dine_in');
        toast.info(`Mesa ${matched.table_number} asignada (${matched.zone})`);
      }
    } else if (tableParam) {
      setSelectedTable(tableParam);
      setFulfillmentType('dine_in');
    }
  }, [tables]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENUE, JSON.stringify(venue));
  }, [venue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(cyclingOffers));
  }, [cyclingOffers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  const setSelectedTable = (table: string | null) => {
    setSelectedTableState(table);
    if (table) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TABLE, table);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_TABLE);
    }
  };

  const setFulfillmentType = (type: FulfillmentType) => {
    setFulfillmentTypeState(type);
    localStorage.setItem(STORAGE_KEYS.FULFILLMENT, type);
  };

  const updateVenue = (updated: Partial<Venue>) => {
    setVenue(prev => ({ ...prev, ...updated }));
    toast.success('Configuración actualizada');
  };

  // Hotness recalculation
  const recalculateAllHotness = () => {
    setCategories(prevCats => 
      prevCats.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const newScore = calculateHotnessScore(item.velocity_24h, item.baseline_14d);
          return { ...item, hotness_score: newScore };
        })
      }))
    );
    toast.success('Algoritmo de Hotness recalculado con éxito');
  };

  // Contextual Upselling Engine: recommends high-margin drinks or sides based on what's in cart
  const allItems = useMemo(() => categories.flatMap(c => c.items), [categories]);

  const getContextualUpsells = (currentCartItemIds: string[]): MenuItemDetail[] => {
    const cartItems = allItems.filter(i => currentCartItemIds.includes(i.id));
    const hasDrinks = cartItems.some(i => i.category_id === 'cat-cervezas' || i.category_id === 'cat-tragos' || i.category_id === 'cat-bebidas');
    const hasFood = cartItems.some(i => i.category_id === 'cat-salchipapas' || i.category_id === 'cat-nachos' || i.category_id === 'cat-burgers' || i.category_id === 'cat-pizzas');

    let candidates: MenuItemDetail[] = [];

    if (hasFood && !hasDrinks) {
      // Suggest top beers or cocktails
      candidates = allItems.filter(i => (i.category_id === 'cat-cervezas' || i.category_id === 'cat-tragos') && i.is_available);
    } else if (hasDrinks && !hasFood) {
      // Suggest hot appetizers or nachos
      candidates = allItems.filter(i => (i.category_id === 'cat-salchipapas' || i.category_id === 'cat-nachos') && i.is_available);
    } else {
      // General top-sellers
      candidates = allItems.filter(i => i.hotness_score >= 4 && !currentCartItemIds.includes(i.id) && i.is_available);
    }

    return candidates.sort((a, b) => b.hotness_score - a.hotness_score || b.velocity_24h - a.velocity_24h).slice(0, 3);
  };

  // Active offers computation
  const activeOffers = useMemo(() => cyclingOffers.filter(o => o.is_active), [cyclingOffers]);

  // Cycling offers actions
  const addCyclingOffer = (offerData: Omit<CyclingOffer, 'id' | 'analytics'>) => {
    const newOffer: CyclingOffer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      analytics: {
        impressions: 0,
        clicks: 0,
        add_to_carts: 0,
        conversions: 0,
        revenue_generated: 0,
      }
    };
    setCyclingOffers(prev => [newOffer, ...prev]);
    toast.success('Oferta inteligente creada');
  };

  const updateCyclingOffer = (id: string, updated: Partial<CyclingOffer>) => {
    setCyclingOffers(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
    toast.success('Oferta actualizada');
  };

  const deleteCyclingOffer = (id: string) => {
    setCyclingOffers(prev => prev.filter(o => o.id !== id));
    toast.success('Oferta eliminada');
  };

  const recordOfferImpression = (offerId: string) => {
    setCyclingOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          analytics: { ...o.analytics, impressions: o.analytics.impressions + 1 }
        };
      }
      return o;
    }));
  };

  const recordOfferClick = (offerId: string) => {
    setCyclingOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          analytics: { ...o.analytics, clicks: o.analytics.clicks + 1, add_to_carts: o.analytics.add_to_carts + 1 }
        };
      }
      return o;
    }));
  };

  const recordOfferConversion = (offerId: string, revenue: number) => {
    setCyclingOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          analytics: { 
            ...o.analytics, 
            conversions: o.analytics.conversions + 1,
            revenue_generated: o.analytics.revenue_generated + revenue
          }
        };
      }
      return o;
    }));
  };

  // Review methods
  const addReview = (itemId: string, customerName: string, rating: number, comment: string) => {
    const newReview: MenuItemReview = {
      id: `rev-${Date.now()}`,
      item_id: itemId,
      customer_name: customerName,
      rating,
      comment,
      status: 'approved',
      created_at: new Date().toISOString(),
    };
    setReviews(prev => [newReview, ...prev]);

    // Update item review count & average rating
    setCategories(prevCats => 
      prevCats.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          if (item.id === itemId) {
            const allItemReviews = [...reviews.filter(r => r.item_id === itemId), newReview];
            const avg = allItemReviews.reduce((sum, r) => sum + r.rating, 0) / allItemReviews.length;
            return {
              ...item,
              reviews_count: allItemReviews.length,
              average_rating: Number(avg.toFixed(1)),
            };
          }
          return item;
        })
      }))
    );

    toast.success('¡Gracias por tu opinión! Ya está registrada.');
  };

  const approveReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r));
    toast.success('Reseña aprobada');
  };

  const rejectReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'rejected' } : r));
    toast.info('Reseña rechazada');
  };

  const getItemReviews = (itemId: string) => {
    return reviews.filter(r => r.item_id === itemId && r.status === 'approved');
  };

  // Table methods
  const addTable = (tableData: Omit<VenueTable, 'id'>) => {
    const newTable: VenueTable = {
      ...tableData,
      id: `tbl-${Date.now()}`,
    };
    setTables(prev => [...prev, newTable]);
    toast.success('Mesa agregada');
  };

  const updateTable = (id: string, updated: Partial<VenueTable>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    toast.success('Mesa actualizada');
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    toast.success('Mesa eliminada');
  };

  const resolveTableByHash = (hash: string) => {
    return tables.find(t => t.qr_code_hash.toLowerCase() === hash.toLowerCase() || t.table_number.toLowerCase() === hash.toLowerCase());
  };

  const batchSetupVenue = (venueData: Partial<Venue>, newCategories: MenuCategoryDetail[], tableCount: number) => {
    const updatedVenue: Venue = {
      ...venue,
      ...venueData,
    };
    setVenue(updatedVenue);

    if (newCategories && newCategories.length > 0) {
      setCategories(newCategories);
    }

    if (tableCount > 0) {
      const generatedTables: VenueTable[] = Array.from({ length: tableCount }, (_, idx) => {
        const num = (idx + 1).toString();
        const zone: VenueTable['zone'] = idx < 6 ? 'Principal' : idx < 12 ? 'Terraza' : 'Barra';
        return {
          id: `tbl-${Date.now()}-${num}`,
          venue_id: updatedVenue.id,
          table_number: num,
          label: `Mesa ${num}`,
          qr_code_hash: `${updatedVenue.slug || 'venue'}-m${num}-${Math.random().toString(36).substring(2, 7)}`,
          zone,
          is_occupied: false,
          is_active: true,
        };
      });
      setTables(generatedTables);
    }

    toast.success('Restaurante configurado con éxito');
  };

  // Order & CRM methods
  const createOrder = (orderData: Omit<MimenuOrder, 'id' | 'order_number' | 'created_at' | 'status'>): MimenuOrder => {
    const orderNumber = `${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: MimenuOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);

    // Update 24h velocity and hotness score for ordered items
    setCategories(prevCats => 
      prevCats.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const matchedItem = orderData.items.find(i => i.item_id === item.id);
          if (matchedItem) {
            const newVelocity = item.velocity_24h + matchedItem.quantity;
            const newScore = calculateHotnessScore(newVelocity, item.baseline_14d);
            return {
              ...item,
              velocity_24h: newVelocity,
              hotness_score: newScore,
            };
          }
          return item;
        })
      }))
    );

    // Auto-update or provision CRM customer
    const phone = orderData.customer_phone.trim();
    if (phone) {
      setCustomers(prevCusts => {
        const existingIndex = prevCusts.findIndex(c => c.phone === phone);
        const itemNames = orderData.items.map(i => i.name);
        
        if (existingIndex >= 0) {
          const existing = prevCusts[existingIndex];
          const newTotalOrders = existing.total_orders + 1;
          const newTotalSpent = existing.total_spent + orderData.total;
          const updatedFavs = Array.from(new Set([...existing.favorite_items, ...itemNames])).slice(0, 4);
          
          let loyaltyTier: CustomerProfile['loyalty_tier'] = 'Bronce';
          if (newTotalOrders >= 8 || newTotalSpent >= 600) loyaltyTier = 'VIP';
          else if (newTotalOrders >= 4 || newTotalSpent >= 300) loyaltyTier = 'Oro';
          else if (newTotalOrders >= 2 || newTotalSpent >= 120) loyaltyTier = 'Plata';

          const updated: CustomerProfile = {
            ...existing,
            name: orderData.customer_name || existing.name,
            total_orders: newTotalOrders,
            total_spent: newTotalSpent,
            last_visit_at: new Date().toISOString(),
            favorite_items: updatedFavs,
            loyalty_tier: loyaltyTier,
          };
          const copy = [...prevCusts];
          copy[existingIndex] = updated;
          return copy;
        } else {
          const newCust: CustomerProfile = {
            id: `cust-${Date.now()}`,
            name: orderData.customer_name || 'Cliente',
            phone,
            total_orders: 1,
            total_spent: orderData.total,
            first_visit_at: new Date().toISOString(),
            last_visit_at: new Date().toISOString(),
            favorite_items: itemNames.slice(0, 3),
            loyalty_tier: 'Bronce',
          };
          return [newCust, ...prevCusts];
        }
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: MimenuOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    toast.success(`Pedido actualizado: ${status}`);
  };

  const updateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes } : c));
    toast.success('Notas de cliente guardadas');
  };

  return (
    <MimenuContext.Provider
      value={{
        venue,
        updateVenue,
        categories,
        cyclingOffers,
        activeOffers,
        tables,
        reviews,
        orders,
        customers,
        selectedTable,
        setSelectedTable,
        fulfillmentType,
        setFulfillmentType,
        recalculateAllHotness,
        getContextualUpsells,
        addCyclingOffer,
        updateCyclingOffer,
        deleteCyclingOffer,
        recordOfferImpression,
        recordOfferClick,
        recordOfferConversion,
        addReview,
        approveReview,
        rejectReview,
        getItemReviews,
        addTable,
        updateTable,
        deleteTable,
        resolveTableByHash,
        setCategories,
        setTables,
        batchSetupVenue,
        createOrder,
        updateOrderStatus,
        updateCustomerNotes,
      }}
    >
      {children}
    </MimenuContext.Provider>
  );
};

export const useMimenu = () => {
  const context = useContext(MimenuContext);
  if (!context) {
    throw new Error('useMimenu must be used within a MimenuProvider');
  }
  return context;
};
