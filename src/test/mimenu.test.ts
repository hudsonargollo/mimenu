import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_VENUE, 
  INITIAL_CATEGORIES, 
  INITIAL_CYCLING_OFFERS, 
  INITIAL_TABLES, 
  INITIAL_REVIEWS,
  calculateHotnessScore, 
  getHotnessLabel 
} from '@/data/mimenuData';
import { kv, KV_KEYS } from '@/lib/kvStore';
import { MimenuAIEngine } from '@/lib/aiCopilotEngine';

describe('MIMENU - Demo Test Suite', () => {

  describe('Venue Configuration', () => {
    it('should be configured for MiMenu Demo', () => {
      expect(DEFAULT_VENUE.slug).toBe('mimenu-demo');
      expect(DEFAULT_VENUE.name).toBe("MiMenu Demo");
      expect(DEFAULT_VENUE.city).toBe('Santa Cruz de la Sierra');
      expect(DEFAULT_VENUE.currency).toBe('Bs.');
      expect(DEFAULT_VENUE.currency_code).toBe('BOB');
    });

    it('should contain the primary menu categories (Salchipapas, Nachos, Cervezas, Tragos, Merch)', () => {
      const keys = INITIAL_CATEGORIES.map(c => c.key);
      expect(keys).toContain('salchipapas');
      expect(keys).toContain('nachos');
      expect(keys).toContain('cervezas');
      expect(keys).toContain('tragos');
      expect(keys).toContain('merch');
    });
  });

  describe('6.1 Hotness Algorithm', () => {
    it('should return 5 (On Fire 🔥🔥🔥) when velocity/baseline ratio >= 3.5 or velocity >= 40', () => {
      // 38 orders with 9.2 baseline = ratio 4.13 -> Score 5
      expect(calculateHotnessScore(38, 9.2)).toBe(5);
      expect(calculateHotnessScore(42, 10.1)).toBe(5);
      expect(calculateHotnessScore(50, 20)).toBe(5);
    });

    it('should return 4 (Muy Caliente 🔥) when velocity/baseline ratio >= 2.5 or velocity >= 25', () => {
      // 29 orders with 8.5 baseline = ratio 3.41 -> Score 4
      expect(calculateHotnessScore(24, 8.0)).toBe(4);
    });

    it('should return 3 (Popular ⚡) when velocity/baseline ratio >= 1.5', () => {
      expect(calculateHotnessScore(15, 8.0)).toBe(3);
    });

    it('should return 2 (Templado 🌡️) when velocity/baseline ratio >= 0.8', () => {
      expect(calculateHotnessScore(7, 8.0)).toBe(2);
    });

    it('should return 1 (Frío ❄️) for low velocity', () => {
      expect(calculateHotnessScore(1, 10.0)).toBe(1);
    });

    it('should generate correct visual metadata from score', () => {
      const hotLabel = getHotnessLabel(5);
      expect(hotLabel.label).toBe('¡En Llamas!');
      expect(hotLabel.flameCount).toBe(3);

      const warmLabel = getHotnessLabel(2);
      expect(warmLabel.label).toBe('Templado');
    });
  });

  describe('5.1 Intelligent Cycling Offers', () => {
    it('should contain pre-configured offers for Happy Hour and Late Night', () => {
      expect(INITIAL_CYCLING_OFFERS.length).toBeGreaterThanOrEqual(3);
      
      const happyHour = INITIAL_CYCLING_OFFERS.find(o => o.id === 'offer-happy-hour-fernet');
      expect(happyHour).toBeDefined();
      expect(happyHour?.discount_price).toBe(35);
      expect(happyHour?.original_price).toBe(70);

      const lateNight = INITIAL_CYCLING_OFFERS.find(o => o.id === 'offer-late-night-combo');
      expect(lateNight).toBeDefined();
      expect(lateNight?.discount_price).toBe(85);
    });
  });

  describe('6.3 Physical Table & QR Mapping', () => {
    it('should have tables configured with unique hashes', () => {
      expect(INITIAL_TABLES.length).toBeGreaterThanOrEqual(10);
      const hashes = INITIAL_TABLES.map(t => t.qr_code_hash);
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });
  });

  describe('KV Storage Engine (No Supabase Dependency)', () => {
    it('should persist and retrieve objects by namespace key', async () => {
      const testKey = KV_KEYS.venue('test-venue-1');
      await kv.put(testKey, { name: "Test Demo", city: "Santa Cruz" });
      
      const retrieved = await kv.get<{ name: string; city: string }>(testKey);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Test Demo");
      expect(retrieved?.city).toBe("Santa Cruz");

      await kv.delete(testKey);
      const afterDelete = await kv.get(testKey);
      expect(afterDelete).toBeNull();
    });

    it('should support export and import for full state backup', async () => {
      await kv.put('test:export', { ok: true });
      const dump = await kv.exportAll();
      expect(dump).toBeDefined();
      expect(dump['test:export']).toEqual({ ok: true });
      await kv.delete('test:export');
    });
  });

  describe('AI Copilot & Business Intelligence Engine', () => {
    const aiEngine = new MimenuAIEngine(
      DEFAULT_VENUE,
      INITIAL_CATEGORIES,
      INITIAL_CYCLING_OFFERS,
      INITIAL_REVIEWS,
      []
    );

    it('should synthesize self-learning insights from orders and reviews', async () => {
      const memory = await aiEngine.generateLearnedInsights();
      expect(memory).toBeDefined();
      expect(memory.learnedInsights.length).toBeGreaterThanOrEqual(3);
      expect(memory.peakDemandWindow).toContain('21:00');
    });

    it('should generate structured actions for adding menu items', async () => {
      const response = await aiEngine.processUserInput('Agrega una nueva cerveza artesanal IPA a 28 Bs');
      expect(response.sender).toBe('ai');
      expect(response.actions).toBeDefined();
      expect(response.actions?.length).toBe(1);
      expect(response.actions?.[0].type).toBe('ADD_MENU_ITEM');
      expect(response.actions?.[0].payload.price).toBe(28);
    });

    it('should generate structured actions for updating prices', async () => {
      const response = await aiEngine.processUserInput('Sube el precio de la Salchipapa Monster a 48 Bs');
      expect(response.sender).toBe('ai');
      expect(response.actions).toBeDefined();
      expect(response.actions?.[0].type).toBe('UPDATE_ITEM_PRICE');
      expect(response.actions?.[0].payload.new_price).toBe(48);
    });

    it('should answer analytics questions with metrics summary', async () => {
      const response = await aiEngine.processUserInput('¿Cuáles son las métricas de venta y rendimiento?');
      expect(response.sender).toBe('ai');
      expect(response.dataInsights).toBeDefined();
      expect(response.dataInsights?.metrics.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('8 Core Landing Pillars Backing Functionality', () => {
    it('Pillar 1 & 8: Menu items should support structured allergens, dietary tags, and hotness baselines', () => {
      const allItems = INITIAL_CATEGORIES.flatMap(c => c.items);
      const itemsWithAllergens = allItems.filter(i => i.allergens && i.allergens.length > 0);
      expect(itemsWithAllergens.length).toBeGreaterThanOrEqual(3);

      const itemsWithDietary = allItems.filter(i => i.dietary && i.dietary.length > 0);
      expect(itemsWithDietary.length).toBeGreaterThanOrEqual(2);
    });

    it('Pillar 4: Table QR codes should format cleanly for unique tables in Santa Cruz', () => {
      const sampleTable = INITIAL_TABLES[0];
      expect(sampleTable.qr_code_hash).toBeDefined();
      expect(sampleTable.zone).toBeDefined();
      expect(['Principal', 'Terraza', 'VIP', 'Barra']).toContain(sampleTable.zone);
    });

    it('Pillar 2: Review Hunter data structures should record 1-5 star ratings with status', () => {
      const sampleReview = INITIAL_REVIEWS[0];
      expect(sampleReview.rating).toBeGreaterThanOrEqual(1);
      expect(sampleReview.rating).toBeLessThanOrEqual(5);
      expect(sampleReview.customer_name).toBeDefined();
      expect(['approved', 'pending', 'rejected']).toContain(sampleReview.status);
    });
  });
});
