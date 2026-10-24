/**
 * Sample menu presets for 1-click onboarding.
 * Kept separate from Onboarding.tsx so the wizard stays readable.
 */
import type { ComponentType } from 'react';
import type { MenuCategoryDetail } from '@/types/mimenu';
import { Utensils, Pizza, Wine } from 'lucide-react';

export interface MenuPreset {
  label: string;
  icon: ComponentType<{ className?: string }>;
  categories: MenuCategoryDetail[];
}

export const MENU_PRESETS: Record<string, MenuPreset> = {
  burger_bar: {
    label: 'Hamburguesas & Salchipapas',
    icon: Utensils,
    categories: [
      {
        id: 'cat-burgers',
        venue_id: 'custom-venue',
        key: 'burgers',
        name: 'Hamburguesas Artesanales',
        description: 'Carne 100% de res a la parrilla en pan brioche',
        icon: 'UtensilsCrossed',
        order_index: 1,
        items: [
          {
            id: 'item-b1',
            venue_id: 'custom-venue',
            category_id: 'cat-burgers',
            name: 'Burger Doble Bacon Cheddar',
            description: 'Doble medallón de 120g, queso cheddar fundido, tocino crocante y salsa secreta.',
            price: 42,
            original_price: 48,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
            is_available: true,
            is_best_seller: true,
            hotness_score: 5,
            velocity_24h: 35,
            baseline_14d: 8,
            reviews_count: 32,
            average_rating: 4.9,
            tags: ['Insignia', 'Doble Carne'],
            allergens: ['Gluten', 'Lácteos'],
          },
          {
            id: 'item-b2',
            venue_id: 'custom-venue',
            category_id: 'cat-burgers',
            name: 'Burger Clásica Royal',
            description: 'Medallón simple, lechuga fresca, tomate, huevo frito y queso mozzarella.',
            price: 32,
            image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
            is_available: true,
            hotness_score: 4,
            velocity_24h: 21,
            baseline_14d: 7,
            reviews_count: 18,
            average_rating: 4.8,
            tags: ['Clásico'],
            allergens: ['Gluten', 'Lácteos', 'Huevo'],
          },
        ],
      },
      {
        id: 'cat-bebidas',
        venue_id: 'custom-venue',
        key: 'bebidas',
        name: 'Cervezas & Tragos',
        description: 'Tarros escarchados y tragos de la casa',
        icon: 'Beer',
        order_index: 2,
        items: [
          {
            id: 'item-b3',
            venue_id: 'custom-venue',
            category_id: 'cat-bebidas',
            name: 'Chopp Artesanal 500ml',
            description: 'Cerveza rubia helada servida en vaso escarchado.',
            price: 22,
            image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
            is_available: true,
            is_best_seller: true,
            hotness_score: 5,
            velocity_24h: 44,
            baseline_14d: 10,
            reviews_count: 40,
            average_rating: 5.0,
            tags: ['Top Maridaje', 'Escarchado'],
            allergens: ['Gluten'],
          },
        ],
      },
    ],
  },
  pizzeria: {
    label: 'Pizzería & Pastas',
    icon: Pizza,
    categories: [
      {
        id: 'cat-pizzas',
        venue_id: 'custom-venue',
        key: 'pizzas',
        name: 'Pizzas a la Leña',
        description: 'Masa madre madurada 48h y mozzarella fundida',
        icon: 'UtensilsCrossed',
        order_index: 1,
        items: [
          {
            id: 'item-p1',
            venue_id: 'custom-venue',
            category_id: 'cat-pizzas',
            name: 'Pizza Pepperoni Supremo',
            description: 'Salsa de tomate San Marzano, doble mozzarella y rodajas de pepperoni crocante.',
            price: 58,
            image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
            is_available: true,
            is_best_seller: true,
            hotness_score: 5,
            velocity_24h: 29,
            baseline_14d: 7,
            reviews_count: 27,
            average_rating: 4.9,
            tags: ['Favorito', 'Masa Madre'],
            allergens: ['Gluten', 'Lácteos'],
          },
        ],
      },
    ],
  },
  cocktail_lounge: {
    label: 'Bar & Coctelería Nocturna',
    icon: Wine,
    categories: [
      {
        id: 'cat-tragos',
        venue_id: 'custom-venue',
        key: 'tragos',
        name: 'Coctelería de Autor',
        description: 'Mezclas exclusivas de nuestros bartenders',
        icon: 'Wine',
        order_index: 1,
        items: [
          {
            id: 'item-c1',
            venue_id: 'custom-venue',
            category_id: 'cat-tragos',
            name: 'Gin Tonic Botánico',
            description: 'Gin premium, agua tónica francesa, frutos rojos macerados y romero flameado.',
            price: 35,
            image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
            is_available: true,
            hotness_score: 5,
            velocity_24h: 30,
            baseline_14d: 6,
            reviews_count: 22,
            average_rating: 4.9,
            tags: ['Premium', 'Refrescante'],
          },
        ],
      },
    ],
  },
};
