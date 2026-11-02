/**
 * MiMenu Data — Jaleo tenant (real data only, no mocks).
 *
 * All categories, tables, and offers are derived from the Jaleo venue
 * registered in provisioned_venues.json. No demo/sample/fake data.
 */
import {
  Venue,
  MenuCategoryDetail,
  CyclingOffer,
  VenueTable,
  MenuItemReview,
  HotnessLevel,
} from '@/types/mimenu';
import { planFieldsForVenue } from '@/lib/plans';

export const DEFAULT_VENUE: Venue = {
  id: "venue-jaleo",
  slug: "jaleo",
  name: "Jaleo",
  description: "Tapas, arroces, pastas y parrilla de autor. Productos frescos, cocina de fuego y una carta que viaja de Madrid al Caribe.",
  city: "Santa Cruz de la Sierra",
  address: "Santa Cruz de la Sierra, Bolivia",
  phone: "+591 70000000",
  whatsapp: "https://wa.me/59170000000",
  currency: "Bs.",
  primary_color: "#BC6C25",
  background_theme: "light",
  is_active: true,
  currency_code: "BOB",
  logo_url: "",
  logo_aspect: 2,
  logo_source_aspect: 2,
  logo_zoom: 1,
  logo_x: 0,
  logo_y: 0,
  banner_url: "",
  accent_color: "#BC6C25",
  opening_hours: "",
  instagram: "@jaleo",
  ...planFieldsForVenue("jaleo"),
};

export const INITIAL_CATEGORIES: MenuCategoryDetail[] = [
  {
    "id": "cat-jaleo-1",
    "venue_id": "venue-jaleo",
    "key": "tapas",
    "name": "TAPAS",
    "name_i18n": {
      "es": "TAPAS",
      "en": "TAPAS",
      "pt": "TAPAS"
    },
    "description": "TAPAS — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 1,
    "items": [
      {
        "id": "item-jaleo-1-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "GILDA (2)",
        "name_i18n": {
          "es": "GILDA (2)",
          "en": "GILDA (2)",
          "pt": "GILDA (2)"
        },
        "description": "Piparras, anchoas, aceitunas verdes.",
        "description_i18n": {
          "es": "Piparras, anchoas, aceitunas verdes.",
          "en": "Piparras, anchovies, green olives.",
          "pt": "Piparras, anchoas, azeitonas verdes."
        },
        "price": 34,
        "original_price": null,
        "image_url": "/jaleo/tapas/gilda.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "GILDA ATÚN (2)",
        "name_i18n": {
          "es": "GILDA ATÚN (2)",
          "en": "GILDA ATÚN (2)",
          "pt": "GILDA ATÚN (2)"
        },
        "description": "Atún fresco, piparras, anchoas y aceitunas verdes.",
        "description_i18n": {
          "es": "Atún fresco, piparras, anchoas y aceitunas verdes.",
          "en": "Fresh tuna, piparras, anchovies and green olives.",
          "pt": "Atum fresco, piparras, anchoas e azeitonas verdes."
        },
        "price": 46,
        "original_price": null,
        "image_url": "/jaleo/tapas/gilda-atun.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "HUEVOS ROTOS",
        "name_i18n": {
          "es": "HUEVOS ROTOS",
          "en": "HUEVOS ROTOS",
          "pt": "HUEVOS ROTOS"
        },
        "description": "Patatas fritas, huevo, jamón serrano.",
        "description_i18n": {
          "es": "Patatas fritas, huevo, jamón serrano.",
          "en": "Fried potatoes, egg, serrano ham.",
          "pt": "Batatas fritas, ovo, presunto serrano."
        },
        "price": 59,
        "original_price": null,
        "image_url": "/jaleo/tapas/huevos-rotos.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-4",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CHURRO Y BRAVA",
        "name_i18n": {
          "es": "CHURRO Y BRAVA",
          "en": "CHURRO Y BRAVA",
          "pt": "CHURRO Y BRAVA"
        },
        "description": "Nuestra versión de patatas bravas.",
        "description_i18n": {
          "es": "Nuestra versión de patatas bravas.",
          "en": "Our version of patatas bravas.",
          "pt": "Nossa versão de batatas bravas."
        },
        "price": 49,
        "original_price": null,
        "image_url": "/jaleo/tapas/churro-y-brava.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-5",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "TORTILLA ESPAÑOLA",
        "name_i18n": {
          "es": "TORTILLA ESPAÑOLA",
          "en": "TORTILLA ESPAÑOLA",
          "pt": "TORTILLA ESPAÑOLA"
        },
        "description": "La clásica de siempre: patatas, cebolla y huevo.",
        "description_i18n": {
          "es": "La clásica de siempre: patatas, cebolla y huevo.",
          "en": "The classic: potatoes, onion and egg.",
          "pt": "A clássica de sempre: batatas, cebola e ovo."
        },
        "price": 48,
        "original_price": null,
        "image_url": "/jaleo/tapas/tortilla-espanhola.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-6",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "TORTILLA A LA RIOJANA",
        "name_i18n": {
          "es": "TORTILLA A LA RIOJANA",
          "en": "TORTILLA A LA RIOJANA",
          "pt": "TORTILLA A LA RIOJANA"
        },
        "description": "Patatas, huevo, chorizo español.",
        "description_i18n": {
          "es": "Patatas, huevo, chorizo español.",
          "en": "Potatoes, egg, Spanish chorizo.",
          "pt": "Batatas, ovo, chouriço espanhol."
        },
        "price": 54,
        "original_price": null,
        "image_url": "/jaleo/tapas/tortilla-riojana.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-7",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "TORTILLA CARBONARA",
        "name_i18n": {
          "es": "TORTILLA CARBONARA",
          "en": "TORTILLA CARBONARA",
          "pt": "TORTILLA CARBONARA"
        },
        "description": "Patatas, huevo, cebolla, tocino y parmesano italiano.",
        "description_i18n": {
          "es": "Patatas, huevo, cebolla, tocino y parmesano italiano.",
          "en": "Potatoes, egg, onion, bacon and Italian parmesan.",
          "pt": "Batatas, ovo, cebola, bacon e parmesão italiano."
        },
        "price": 57,
        "original_price": null,
        "image_url": "/jaleo/tapas/tortilla-carbonara.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-8",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "ENSALADILLA RUSA",
        "name_i18n": {
          "es": "ENSALADILLA RUSA",
          "en": "ENSALADILLA RUSA",
          "pt": "ENSALADILLA RUSA"
        },
        "description": "Patatas, pepinillo, atún, aceitunas verdes, huevo y mayonesa.",
        "description_i18n": {
          "es": "Patatas, pepinillo, atún, aceitunas verdes, huevo y mayonesa.",
          "en": "Potatoes, pickles, tuna, green olives, egg and mayo.",
          "pt": "Batatas, picles, atum, azeitonas verdes, ovo e maionese."
        },
        "price": 44,
        "original_price": null,
        "image_url": "/jaleo/tapas/ensaladilla-rusa.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-9",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "BUÑUELOS (4)",
        "name_i18n": {
          "es": "BUÑUELOS (4)",
          "en": "BUÑUELOS (4)",
          "pt": "BUÑUELOS (4)"
        },
        "description": "De queso de cabra y jamón de pato casero.",
        "description_i18n": {
          "es": "De queso de cabra y jamón de pato casero.",
          "en": "Goat cheese and homemade duck ham.",
          "pt": "Queijo de cabra e presunto de pato caseiro."
        },
        "price": 56,
        "original_price": null,
        "image_url": "/jaleo/tapas/bunuelos.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-10",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CROISSANT NEGRO",
        "name_i18n": {
          "es": "CROISSANT NEGRO",
          "en": "CROISSANT NEGRO",
          "pt": "CROISSANT NEGRO"
        },
        "description": "Relleno de calamares en su tinta.",
        "description_i18n": {
          "es": "Relleno de calamares en su tinta.",
          "en": "Filled with squid in its ink.",
          "pt": "Recheado com lulas na tinta."
        },
        "price": 46,
        "original_price": null,
        "image_url": "/jaleo/tapas/croissant-negro.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-11",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CALAMAR A LA ROMANA",
        "name_i18n": {
          "es": "CALAMAR A LA ROMANA",
          "en": "CALAMAR A LA ROMANA",
          "pt": "CALAMAR A LA ROMANA"
        },
        "description": "Aros de calamar rebozados.",
        "description_i18n": {
          "es": "Aros de calamar rebozados.",
          "en": "Battered squid rings.",
          "pt": "Anéis de lula empanizados."
        },
        "price": 56,
        "original_price": null,
        "image_url": "/jaleo/tapas/calamar-romano.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-12",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CALAMAR RELLENO",
        "name_i18n": {
          "es": "CALAMAR RELLENO",
          "en": "CALAMAR RELLENO",
          "pt": "CALAMAR RELLENO"
        },
        "description": "De calamares en su tinta, verduras, con guacamole de guisantes.",
        "description_i18n": {
          "es": "De calamares en su tinta, verduras, con guacamole de guisantes.",
          "en": "Squid in ink, vegetables, with pea guacamole.",
          "pt": "Lulas na tinta, vegetais, com guacamole de ervilhas."
        },
        "price": 68,
        "original_price": null,
        "image_url": "/jaleo/tapas/calamar-relleno.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-13",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "ALBÓNDIGAS DE PEZ ESPADA",
        "name_i18n": {
          "es": "ALBÓNDIGAS DE PEZ ESPADA",
          "en": "ALBÓNDIGAS DE PEZ ESPADA",
          "pt": "ALMÔNDEGAS DE PEIXE-ESPADA"
        },
        "description": "Con salsa de callos a la madrileña.",
        "description_i18n": {
          "es": "Con salsa de callos a la madrileña.",
          "en": "With madrileña-style tripe sauce.",
          "pt": "Com molho de tripas estilo madrileña."
        },
        "price": 46,
        "original_price": null,
        "image_url": "/jaleo/tapas/albongadas-espada.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-14",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "TIGRES",
        "name_i18n": {
          "es": "TIGRES",
          "en": "TIGRES",
          "pt": "TIGRES"
        },
        "description": "Cremoso de mejillones rebozado en su concha.",
        "description_i18n": {
          "es": "Cremoso de mejillones rebozado en su concha.",
          "en": "Creamy mussels breaded in their shell.",
          "pt": "Creme de mexilhões empanizado na concha."
        },
        "price": 66,
        "original_price": null,
        "image_url": "/jaleo/tapas/tigres.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-15",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "PULPO A LA GALLEGA",
        "name_i18n": {
          "es": "PULPO A LA GALLEGA",
          "en": "PULPO A LA GALLEGA",
          "pt": "PULPO A LA GALLEGA"
        },
        "description": "Pulpo, patatas, pimentón dulce español y sal maldom.",
        "description_i18n": {
          "es": "Pulpo, patatas, pimentón dulce español y sal maldom.",
          "en": "Octopus, potatoes, Spanish sweet paprika and coarse salt.",
          "pt": "Polvo, batatas, pimentão doce espanhol e sal grosso."
        },
        "price": 75,
        "original_price": null,
        "image_url": "/jaleo/tapas/pulpo-gallega.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-16",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CAMARONES AL AJÍLLO",
        "name_i18n": {
          "es": "CAMARONES AL AJÍLLO",
          "en": "CAMARONES AL AJILLO",
          "pt": "CAMARÕES AO ALHO"
        },
        "description": "Camarones a la plancha, ajo, ají y aceite de oliva.",
        "description_i18n": {
          "es": "Camarones a la plancha, ajo, ají y aceite de oliva.",
          "en": "Grilled shrimp, garlic, chili and olive oil.",
          "pt": "Camarões grelhados, alho, pimenta e azeite."
        },
        "price": 68,
        "original_price": null,
        "image_url": "/jaleo/tapas/camarones-ajillo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-17",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CROQUETAS DE CALAMAR",
        "name_i18n": {
          "es": "CROQUETAS DE CALAMAR",
          "en": "CROQUETAS DE CALAMAR",
          "pt": "CROQUETAS DE LULA"
        },
        "description": "Bechamel, tinta de calamar.",
        "description_i18n": {
          "es": "Bechamel, tinta de calamar.",
          "en": "Béchamel, squid ink.",
          "pt": "Bechamel, tinta de lula."
        },
        "price": 66,
        "original_price": null,
        "image_url": "/jaleo/tapas/croquetas-calamar.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-18",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CROQUETAS DE JAMÓN SERRANO",
        "name_i18n": {
          "es": "CROQUETAS DE JAMÓN SERRANO",
          "en": "CROQUETAS DE JAMÓN SERRANO",
          "pt": "CROQUETAS DE PRESUNTO SERRANO"
        },
        "description": "Cremosas a base de bechamel con jamón serrano.",
        "description_i18n": {
          "es": "Cremosas a base de bechamel con jamón serrano.",
          "en": "Creamy béchamel with serrano ham.",
          "pt": "Cremosas de bechamel com presunto serrano."
        },
        "price": 54,
        "original_price": null,
        "image_url": "/jaleo/tapas/croquetas-jamon.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-19",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "BAO DE RABO DE TORO",
        "name_i18n": {
          "es": "BAO DE RABO DE TORO",
          "en": "BAO DE RABO DE TORO",
          "pt": "BAO DE RABO DE TORO"
        },
        "description": "Pan chino, rabo de toro, tuétano y alíoli de chipotle.",
        "description_i18n": {
          "es": "Pan chino, rabo de toro, tuétano y alíoli de chipotle.",
          "en": "Chinese bun, beef tail, bone marrow and chipotle aioli.",
          "pt": "Pão chinês, rabo de boi, tutano e maionese de chipotle."
        },
        "price": 66,
        "original_price": null,
        "image_url": "/jaleo/tapas/bao-rabo-toro.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-20",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "HAMBURGUESA JALEO",
        "name_i18n": {
          "es": "HAMBURGUESA JALEO",
          "en": "HAMBURGUESA JALEO",
          "pt": "HAMBÚRGUER JALEO"
        },
        "description": "Pan brioche, carrillera glaseada y trufada, cebolla caramelizada y brie.",
        "description_i18n": {
          "es": "Pan brioche, carrillera glaseada y trufada, cebolla caramelizada y brie.",
          "en": "Brioche bun, glazed and truffled pork cheek, caramelized onion and brie.",
          "pt": "Pão brioche, bochecha de porco glaceada e trufada, cebola caramelizada e brie."
        },
        "price": 85,
        "original_price": null,
        "image_url": "/jaleo/tapas/hamburguesa-jaleo.jpg",
        "is_available": true,
        "is_featured": true,
        "is_best_seller": true,
        "hotness_score": 4,
        "velocity_24h": 18,
        "baseline_14d": 9,
        "reviews_count": 12,
        "average_rating": 4.6,
        "tags": [
          "Recomendado",
          "De la casa"
        ],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-21",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CARRILLERA AL VINO TINTO",
        "name_i18n": {
          "es": "CARRILLERA AL VINO TINTO",
          "en": "CARRILLERA AL VINO TINTO",
          "pt": "BOCHECHA AO VINHO TINTO"
        },
        "description": "Mejilla de cerdo, vino tinto, mollejas al carbón, con parmentier y verduras.",
        "description_i18n": {
          "es": "Mejilla de cerdo, vino tinto, mollejas al carbón, con parmentier y verduras.",
          "en": "Pork cheek, red wine, grilled sweetbreads, with parmentier and vegetables.",
          "pt": "Bochecha de porco, vinho tinto, molejas na brasa, com parmentier e vegetais."
        },
        "price": 62,
        "original_price": null,
        "image_url": "/jaleo/tapas/carrillera-vino.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-22",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "TIMBAL DE CORDERO",
        "name_i18n": {
          "es": "TIMBAL DE CORDERO",
          "en": "TIMBAL DE CORDERO",
          "pt": "TIMBAL DE CORDEIRO"
        },
        "description": "Pierna deshuesada cocinada 30 hrs a baja temperatura, con panaderas.",
        "description_i18n": {
          "es": "Pierna deshuesada cocinada 30 hrs a baja temperatura, con panaderas.",
          "en": "Boneless leg of lamb slow-cooked for 30hrs, with panzanella.",
          "pt": "Perna desossada cozida por 30h em baixa temperatura, com panzanella."
        },
        "price": 62,
        "original_price": null,
        "image_url": "/jaleo/tapas/timbal-cordero.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-23",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "CHULETILLAS DE CORDERO",
        "name_i18n": {
          "es": "CHULETILLAS DE CORDERO",
          "en": "CHULETILLAS DE CORDERO",
          "pt": "CHULETINHAS DE CORDEIRO"
        },
        "description": "A la parrilla, con chips y morrones asados.",
        "description_i18n": {
          "es": "A la parrilla, con chips y morrones asados.",
          "en": "Grilled lamb chops, with chips and roasted bell peppers.",
          "pt": "Grelhadas, com batata frita e pimentões assados."
        },
        "price": 98,
        "original_price": null,
        "image_url": "/jaleo/tapas/chuletas-cordero.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-24",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "PIMIENTO DEL PIQUILLO",
        "name_i18n": {
          "es": "PIMIENTO DEL PIQUILLO",
          "en": "PIMIENTO DEL PIQUILLO",
          "pt": "PIMENTO PIQUILLO"
        },
        "description": "Relleno de brandada de pez espada, en salsa verde.",
        "description_i18n": {
          "es": "Relleno de brandada de pez espada, en salsa verde.",
          "en": "Filled with swordfish brandade, in green sauce.",
          "pt": "Recheado com brandada de peixe-espada, em molho verde."
        },
        "price": 45,
        "original_price": null,
        "image_url": "/jaleo/tapas/pimiento-piquillo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-25",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "RACIÓN DE JAMÓN SERRANO",
        "name_i18n": {
          "es": "RACIÓN DE JAMÓN SERRANO",
          "en": "RACIÓN DE JAMÓN SERRANO",
          "pt": "PORÇÃO DE PRESUNTO SERRANO"
        },
        "description": "Reserva español.",
        "description_i18n": {
          "es": "Reserva español.",
          "en": "Spanish reserve.",
          "pt": "Reserva espanhola."
        },
        "price": 190,
        "original_price": null,
        "image_url": "/jaleo/tapas/jamon-serrano.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-1-26",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-1",
        "name": "TABLA QUE MOLA",
        "name_i18n": {
          "es": "TABLA QUE MOLA",
          "en": "TABLA QUE MOLA",
          "pt": "TABUA QUE MOLA"
        },
        "description": "Surtido de quesos y fiambres importados.",
        "description_i18n": {
          "es": "Surtido de quesos y fiambres importados.",
          "en": "Assorted imported cheeses and cured meats.",
          "pt": "Seleção de queijos e embutidos importados."
        },
        "price": 250,
        "original_price": null,
        "image_url": "/jaleo/tapas/tabla-que-mola.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-2",
    "venue_id": "venue-jaleo",
    "key": "entradas",
    "name": "ENTRADAS",
    "name_i18n": {
      "es": "ENTRADAS",
      "en": "STARTERS",
      "pt": "ENTRADAS"
    },
    "description": "ENTRADAS — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 2,
    "items": [
      {
        "id": "item-jaleo-2-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "OSTIONES A LA PARMESANA",
        "name_i18n": {
          "es": "OSTIONES A LA PARMESANA",
          "en": "OSTIONES A LA PARMESANA",
          "pt": "OSTRAS À PARMESÃ"
        },
        "description": "Ostiones gratinados con queso parmesano.",
        "description_i18n": {
          "es": "Ostiones gratinados con queso parmesano.",
          "en": "Oysters gratinated with parmesan cheese.",
          "pt": "Ostras gratinadas com queijo parmesão."
        },
        "price": 68,
        "original_price": null,
        "image_url": "/jaleo/entradas/ostiones-parmesana.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "BOQUERONES",
        "name_i18n": {
          "es": "BOQUERONES",
          "en": "BOQUERONES",
          "pt": "BOQUERONES"
        },
        "description": "Boquerones, crema de ají amarillo y alcaparras.",
        "description_i18n": {
          "es": "Boquerones, crema de ají amarillo y alcaparras.",
          "en": "Anchovies, yellow chili cream and capers.",
          "pt": "Anchoas, creme de pimenta amarela e alcaparras."
        },
        "price": 58,
        "original_price": null,
        "image_url": "/jaleo/entradas/boquerones.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "AL LÍO",
        "name_i18n": {
          "es": "AL LÍO",
          "en": "AL LÍO",
          "pt": "AL LÍO"
        },
        "description": "Pulpitos, calamarcetes a la plancha, espárragos, tirabeques y mole de romesco.",
        "description_i18n": {
          "es": "Pulpitos, calamarcetes a la plancha, espárragos, tirabeques y mole de romesco.",
          "en": "Crispy calamari, grilled baby squid, asparagus, ladyfingers and romesco mole.",
          "pt": "Lulinhas, lulas grelhadas, aspargos, vagem e molho de romesco."
        },
        "price": 72,
        "original_price": null,
        "image_url": "/jaleo/entradas/al-lio.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-4",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "SALPICÓN JALEO",
        "name_i18n": {
          "es": "SALPICÓN JALEO",
          "en": "SALPICÓN JALEO",
          "pt": "SALPICÓN JALEO"
        },
        "description": "De paiche, camarones, almejas, con aguachile verde.",
        "description_i18n": {
          "es": "De paiche, camarones, almejas, con aguachile verde.",
          "en": "Paiche, shrimp, clams, with green chili sauce.",
          "pt": "De paiche, camarões, mariscos, com molho de pimenta verde."
        },
        "price": 65,
        "original_price": null,
        "image_url": "/jaleo/entradas/salpicon-jaleo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-5",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "TIRADITO",
        "name_i18n": {
          "es": "TIRADITO",
          "en": "TIRADITO",
          "pt": "TIRADITO"
        },
        "description": "De trucha ahumada, boquerones, chicharrón de su piel, palta, camote y ajíes.",
        "description_i18n": {
          "es": "De trucha ahumada, boquerones, chicharrón de su piel, palta, camote y ajíes.",
          "en": "Smoked trout, anchovies, crunchy skin, avocado, sweet potato and chili peppers.",
          "pt": "De truta defumada, anchoas, pele crocante, abacate, batata-doce e pimentas."
        },
        "price": 68,
        "original_price": null,
        "image_url": "/jaleo/entradas/tiradito.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-6",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "TARTÁR DE ATÚN",
        "name_i18n": {
          "es": "TARTÁR DE ATÚN",
          "en": "TARTÁR DE ATÚN",
          "pt": "TARTAR DE ATUM"
        },
        "description": "Dados de atún fresco, tuétano de res, bálsamo de ajonjolí, soya y emulsión de palta.",
        "description_i18n": {
          "es": "Dados de atún fresco, tuétano de res, bálsamo de ajonjolí, soya y emulsión de palta.",
          "en": "Fresh tuna, beef bone marrow, sesame balm, soy and avocado emulsion.",
          "pt": "Cubos de atum fresco, tutano de boi, bálsamo de gergelim, soja e emulsão de abacate."
        },
        "price": 76,
        "original_price": null,
        "image_url": "/jaleo/entradas/tartar-atun.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-7",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "TARTÁR DE SOLOMILLO",
        "name_i18n": {
          "es": "TARTÁR DE SOLOMILLO",
          "en": "TARTÁR DE SOLOMILLO",
          "pt": "TARTAR DE FILÉ MIGNON"
        },
        "description": "Solomillo cortado al cuchillo, pan brioche y jarabe de bourbon.",
        "description_i18n": {
          "es": "Solomillo cortado al cuchillo, pan brioche y jarabe de bourbon.",
          "en": "Hand-cut filet mignon, brioche bread and bourbon syrup.",
          "pt": "Filé mignon cortado na faca, pão brioche e xarope de bourbon."
        },
        "price": 58,
        "original_price": null,
        "image_url": "/jaleo/entradas/tartar-solomillo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-8",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "CARPACCIO JALEO",
        "name_i18n": {
          "es": "CARPACCIO JALEO",
          "en": "CARPACCIO JALEO",
          "pt": "CARPACCIO JALEO"
        },
        "description": "Finos cortes de filete de res, rúcula, champiñones, jamón serrano, parmesano.",
        "description_i18n": {
          "es": "Finos cortes de filete de res, rúcula, champiñones, jamón serrano, parmesano.",
          "en": "Thinly sliced beef fillet, arugula, mushrooms, serrano ham, parmesan.",
          "pt": "Fatias finas de filé de boi, rúcula, cogumelos, presunto serrano, parmesão."
        },
        "price": 78,
        "original_price": null,
        "image_url": "/jaleo/entradas/carpaccio-jaleo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-9",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "CARPACCIO DE PATO",
        "name_i18n": {
          "es": "CARPACCIO DE PATO",
          "en": "CARPACCIO DE PATO",
          "pt": "CARPACCIO DE PATO"
        },
        "description": "Finos cortes de pato marinado, rúcula, parmesano, con reducción de aceto balsámico.",
        "description_i18n": {
          "es": "Finos cortes de pato marinado, rúcula, parmesano, con reducción de aceto balsámico.",
          "en": "Thinly sliced marinated duck, arugula, parmesan, with balsamic reduction.",
          "pt": "Fatias finas de pato marinado, rúcula, parmesão, com redução de vinagre balsâmico."
        },
        "price": 65,
        "original_price": null,
        "image_url": "/jaleo/entradas/carpaccio-pato.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-10",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "BURRATA EMPANIZADA",
        "name_i18n": {
          "es": "BURRATA EMPANIZADA",
          "en": "BURRATA EMPANIZADA",
          "pt": "BURRATA EMPANADA"
        },
        "description": "Burrata frita, tomates secos, salsa de tomate y rúcula.",
        "description_i18n": {
          "es": "Burrata frita, tomates secos, salsa de tomate y rúcula.",
          "en": "Fried burrata, sun-dried tomatoes, tomato sauce and arugula.",
          "pt": "Burrata frita, tomates secos, molho de tomate e rúcula."
        },
        "price": 89,
        "original_price": null,
        "image_url": "/jaleo/entradas/buratta-empanizada.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-2-11",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-2",
        "name": "ESPÁRRAGOS COJONUDO",
        "name_i18n": {
          "es": "ESPÁRRAGOS COJONUDO",
          "en": "ESPÁRRAGOS COJONUDO",
          "pt": "ASPARGOS COJONUDO"
        },
        "description": "Espárragos blancos XL, con jamón serrano, y salsa holandesa de mandarina.",
        "description_i18n": {
          "es": "Espárragos blancos XL, con jamón serrano, y salsa holandesa de mandarina.",
          "en": "Extra-large white asparagus, with serrano ham, and mandarin hollandaise sauce.",
          "pt": "Aspargos brancos XL, com presunto serrano e molho holandês de tangerina."
        },
        "price": 56,
        "original_price": null,
        "image_url": "/jaleo/entradas/esparragos-cojonudo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-3",
    "venue_id": "venue-jaleo",
    "key": "ensaladas",
    "name": "ENSALADAS",
    "name_i18n": {
      "es": "ENSALADAS",
      "en": "SALADS",
      "pt": "SALADAS"
    },
    "description": "ENSALADAS — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 3,
    "items": [
      {
        "id": "item-jaleo-3-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-3",
        "name": "CESAR",
        "name_i18n": {
          "es": "CESAR",
          "en": "CESAR",
          "pt": "CESAR"
        },
        "description": "Surtido de lechugas, pollo, tocino, crutones, anchoas, parmesano y salsa cesar.",
        "description_i18n": {
          "es": "Surtido de lechugas, pollo, tocino, crutones, anchoas, parmesano y salsa cesar.",
          "en": "Mixed greens, chicken, bacon, croutons, anchovies, parmesan and Caesar dressing.",
          "pt": "Mix de folhas, frango, bacon, croutons, anchoas, parmesão e molho caesar."
        },
        "price": 64,
        "original_price": null,
        "image_url": "/jaleo/ensaladas/cesar.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-3-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-3",
        "name": "MEDITERRÁNEA",
        "name_i18n": {
          "es": "MEDITERRÁNEA",
          "en": "MEDITERRÁNEA",
          "pt": "MEDITERRÂNEA"
        },
        "description": "Surtido de lechugas, tomate seco, rúcula, aceitunas verdes, almendras, alcachofas, jamón serrano, parmesano con vinagreta de mostaza.",
        "description_i18n": {
          "es": "Surtido de lechugas, tomate seco, rúcula, aceitunas verdes, almendras, alcachofas, jamón serrano, parmesano con vinagreta de mostaza.",
          "en": "Mixed greens, sun-dried tomato, arugula, green olives, almonds, artichokes, serrano ham, parmesan with mustard vinaigrette.",
          "pt": "Mix de folhas, tomate seco, rúcula, azeitonas verdes, amêndoas, alcachofras, presunto serrano, parmesão com vinagrete de mostarda."
        },
        "price": 74,
        "original_price": null,
        "image_url": "/jaleo/ensaladas/mediterranea.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-4",
    "venue_id": "venue-jaleo",
    "key": "de-cuchara",
    "name": "DE CUCHARA",
    "name_i18n": {
      "es": "DE CUCHARA",
      "en": "SINGLE POT",
      "pt": "DE COLHER"
    },
    "description": "DE CUCHARA — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 4,
    "items": [
      {
        "id": "item-jaleo-4-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-4",
        "name": "CALLOS A LA MADRILEÑA",
        "name_i18n": {
          "es": "CALLOS A LA MADRILEÑA",
          "en": "CALLOS A LA MADRILEÑA",
          "pt": "CALLOS À MADRILEÑA"
        },
        "description": "Guiso clásico madrileño: con callos, chorizo español, tocino y garbanzos.",
        "description_i18n": {
          "es": "Guiso clásico madrileño: con callos, chorizo español, tocino y garbanzos.",
          "en": "Classic Madrid stew: tripe, Spanish chorizo, bacon and chickpeas.",
          "pt": "Cozido clássico de Madri: tripas, chouriço espanhol, bacon e grão-de-bico."
        },
        "price": 79,
        "original_price": null,
        "image_url": "/jaleo/de-cuchara/callos-madrilena.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-4-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-4",
        "name": "FABADA ASTURIANA",
        "name_i18n": {
          "es": "FABADA ASTURIANA",
          "en": "FABADA ASTURIANA",
          "pt": "FABADA ASTURIANA"
        },
        "description": "Chorizo asturiano ahumado, morcilla, panceta, judiones de la granja.",
        "description_i18n": {
          "es": "Chorizo asturiano ahumado, morcilla, panceta, judiones de la granja.",
          "en": "Smoked Asturian chorizo, blood sausage, bacon, farm beans.",
          "pt": "Chouriço asturiano defumado, morcela, bacon, feijões da fazenda."
        },
        "price": 98,
        "original_price": null,
        "image_url": "/jaleo/de-cuchara/fabada-asturiana.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-4-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-4",
        "name": "SUQUET DE PEIX",
        "name_i18n": {
          "es": "SUQUET DE PEIX",
          "en": "SUQUET DE PEIX",
          "pt": "SUQUET DE PEIX"
        },
        "description": "Sopa contundente catalana con pescados y mariscos, tomate y patatas.",
        "description_i18n": {
          "es": "Sopa contundente catalana con pescados y mariscos, tomate y patatas.",
          "en": "Catalan fish stew with fish and seafood, tomato and potatoes.",
          "pt": "Ensopado catalão de peixe com frutos do mar, tomate e batatas."
        },
        "price": 98,
        "original_price": null,
        "image_url": "/jaleo/de-cuchara/suquet-peix.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-5",
    "venue_id": "venue-jaleo",
    "key": "pastas",
    "name": "PASTAS",
    "name_i18n": {
      "es": "PASTAS",
      "en": "PASTAS",
      "pt": "MASSAS"
    },
    "description": "PASTAS — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 5,
    "items": [
      {
        "id": "item-jaleo-5-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-5",
        "name": "CANELONS DA XAI TRUFATS",
        "name_i18n": {
          "es": "CANELONS DA XAI TRUFATS",
          "en": "CANELONS DA XAI TRUFATS",
          "pt": "CANELONS DA XAI TRUFATS"
        },
        "description": "Pasta rellena de cordero a baja temperatura, con bechamel trufada y demi-glace.",
        "description_i18n": {
          "es": "Pasta rellena de cordero a baja temperatura, con bechamel trufada y demi-glace.",
          "en": "Pasta filled with slow-cooked lamb, truffle béchamel and demi-glace.",
          "pt": "Massa recheada com cordeiro cozido em baixa temperatura, bechamel trufado e demi-glace."
        },
        "price": 120,
        "original_price": null,
        "image_url": "/jaleo/pastas/canelons-trufats.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-5-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-5",
        "name": "TORTELLONI JALEO",
        "name_i18n": {
          "es": "TORTELLONI JALEO",
          "en": "TORTELLONI JALEO",
          "pt": "TORTELLONI JALEO"
        },
        "description": "Pasta de espinaca, rellena de pez espada, pasatta de camarones.",
        "description_i18n": {
          "es": "Pasta de espinaca, rellena de pez espada, pasatta de camarones.",
          "en": "Spinach pasta, filled with swordfish, shrimp pasatta.",
          "pt": "Massa de espinafre, recheada com peixe-espada, passata de camarões."
        },
        "price": 89,
        "original_price": null,
        "image_url": "/jaleo/pastas/tortelloni-jaleo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-5-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-5",
        "name": "SORRENTINO DEL LAGO",
        "name_i18n": {
          "es": "SORRENTINO DEL LAGO",
          "en": "SORRENTINO DEL LAGO",
          "pt": "SORRENTINO DEL LAGO"
        },
        "description": "Pasta rellena de ricotta, trucha ahumada, con crema al limón.",
        "description_i18n": {
          "es": "Pasta rellena de ricotta, trucha ahumada, con crema al limón.",
          "en": "Ricotta-filled pasta, smoked trout, with lemon cream.",
          "pt": "Massa recheada com ricota, truta defumada, com creme de limão."
        },
        "price": 94,
        "original_price": null,
        "image_url": "/jaleo/pastas/sorrentino-lago.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-5-4",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-5",
        "name": "LINGUINI DEL CANTABRICO NEGRO",
        "name_i18n": {
          "es": "LINGUINI DEL CANTABRICO NEGRO",
          "en": "LINGUINI DEL CANTABRICO NEGRO",
          "pt": "LINGUINE NEGRO DO CANTÁBRICO"
        },
        "description": "Pasta negra con pulpo y tomate.",
        "description_i18n": {
          "es": "Pasta negra con pulpo y tomate.",
          "en": "Black pasta with octopus and tomato.",
          "pt": "Massa preta com polvo e tomate."
        },
        "price": 115,
        "original_price": null,
        "image_url": "/jaleo/pastas/linguini-negro.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-6",
    "venue_id": "venue-jaleo",
    "key": "arroces-paellas",
    "name": "ARROCES Y PAELLAS",
    "name_i18n": {
      "es": "ARROCES Y PAELLAS",
      "en": "RICES & PAELLAS",
      "pt": "ARROZES E PAELLAS"
    },
    "description": "ARROCES Y PAELLAS — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 6,
    "items": [
      {
        "id": "item-jaleo-6-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "ARROZ DEL SENYORET (DEL SEÑORITO)",
        "name_i18n": {
          "es": "ARROZ DEL SENYORET (DEL SEÑORITO)",
          "en": "ARROZ DEL SENYORET",
          "pt": "ARROZ DEL SENYORET"
        },
        "description": "Arroz bomba español, azafrán y surtido de mariscos.",
        "description_i18n": {
          "es": "Arroz bomba español, azafrán y surtido de mariscos.",
          "en": "Spanish bomba rice, saffron and seafood mix.",
          "pt": "Arroz bomba espanhol, açafrão e mix de frutos do mar."
        },
        "price": 140,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/arroz-senyoret.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "PAELLA VALENCIANA",
        "name_i18n": {
          "es": "PAELLA VALENCIANA",
          "en": "PAELLA VALENCIANA",
          "pt": "PAELLA VALENCIANA"
        },
        "description": "Arroz bomba español, azafrán, conejo, pollo, judiones, morrones y vainitas.",
        "description_i18n": {
          "es": "Arroz bomba español, azafrán, conejo, pollo, judiones, morrones y vainitas.",
          "en": "Spanish bomba rice, saffron, rabbit, chicken, beans, bell peppers and green beans.",
          "pt": "Arroz bomba espanhol, açafrão, coelho, frango, feijões, pimentões e vagem."
        },
        "price": 150,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/paella-valenciana.jpg",
        "is_available": true,
        "is_featured": true,
        "is_best_seller": true,
        "hotness_score": 4,
        "velocity_24h": 18,
        "baseline_14d": 9,
        "reviews_count": 12,
        "average_rating": 4.6,
        "tags": [
          "Recomendado",
          "De la casa"
        ],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "PAELLA MARINERA",
        "name_i18n": {
          "es": "PAELLA MARINERA",
          "en": "PAELLA MARINERA",
          "pt": "PAELLA MARINERA"
        },
        "description": "Arroz bomba español, azafrán, mariscos.",
        "description_i18n": {
          "es": "Arroz bomba español, azafrán, mariscos.",
          "en": "Spanish bomba rice, saffron, seafood.",
          "pt": "Arroz bomba espanhol, açafrão, frutos do mar."
        },
        "price": 150,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/paella-marinera.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-4",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "PAELLA MIXTA",
        "name_i18n": {
          "es": "PAELLA MIXTA",
          "en": "PAELLA MIXTA",
          "pt": "PAELLA MIXTA"
        },
        "description": "Arroz bomba español, azafrán, surtido de mariscos, carnes y verduras.",
        "description_i18n": {
          "es": "Arroz bomba español, azafrán, surtido de mariscos, carnes y verduras.",
          "en": "Spanish bomba rice, saffron, seafood mix, meats and vegetables.",
          "pt": "Arroz bomba espanhol, açafrão, mix de frutos do mar, carnes e vegetais."
        },
        "price": 140,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/paella-mixta.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-5",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "PAELLA MARINERA 2.0",
        "name_i18n": {
          "es": "PAELLA MARINERA 2.0",
          "en": "PAELLA MARINERA 2.0",
          "pt": "PAELLA MARINERA 2.0"
        },
        "description": "Clásica paella marinera con extra de mariscos.",
        "description_i18n": {
          "es": "Clásica paella marinera con extra de mariscos.",
          "en": "Classic seafood paella with extra seafood.",
          "pt": "Paella de frutos do mar clássica com extra de frutos do mar."
        },
        "price": 185,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/paella-marinera-2.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-6",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "ARROZ NEGRO",
        "name_i18n": {
          "es": "ARROZ NEGRO",
          "en": "ARROZ NEGRO",
          "pt": "ARROZ NEGRO"
        },
        "description": "Arroz bomba español, tinta de calamar y calamares.",
        "description_i18n": {
          "es": "Arroz bomba español, tinta de calamar y calamares.",
          "en": "Spanish bomba rice, squid ink and squid.",
          "pt": "Arroz bomba espanhol, tinta de lula e lulas."
        },
        "price": 145,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/arroz-negro.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-7",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "FIDEUÁ",
        "name_i18n": {
          "es": "FIDEUÁ",
          "en": "FIDEUÁ",
          "pt": "FIDEUÁ"
        },
        "description": "Fideos, azafrán, mariscos.",
        "description_i18n": {
          "es": "Fideos, azafrán, mariscos.",
          "en": "Noodles, saffron, seafood.",
          "pt": "Fios de massa, açafrão, frutos do mar."
        },
        "price": 140,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/fideua.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-6-8",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-6",
        "name": "FIDEUA NEGRA",
        "name_i18n": {
          "es": "FIDEUA NEGRA",
          "en": "FIDEUA NEGRA",
          "pt": "FIDEUA NEGRA"
        },
        "description": "Fideos, camarones, tinta de calamar.",
        "description_i18n": {
          "es": "Fideos, camarones, tinta de calamar.",
          "en": "Noodles, shrimp, squid ink.",
          "pt": "Fios de massa, camarões, tinta de lula."
        },
        "price": 145,
        "original_price": null,
        "image_url": "/jaleo/arroces-paellas/fideua-negra.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-7",
    "venue_id": "venue-jaleo",
    "key": "carnes",
    "name": "CARNES",
    "name_i18n": {
      "es": "CARNES",
      "en": "MEATS",
      "pt": "CARNES"
    },
    "description": "CARNES — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 7,
    "items": [
      {
        "id": "item-jaleo-7-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-7",
        "name": "POLLITO DE CORRAL A LA LEÑA",
        "name_i18n": {
          "es": "POLLITO DE CORRAL A LA LEÑA",
          "en": "POLLITO DE CORRAL A LA LEÑA",
          "pt": "FRANGUINHO CAIPIRA NA LENHA"
        },
        "description": "Medio pollo baby cocinado a la brasa con mojo de finas hierbas. Acompañado de patatas panaderas y espinacas al limón.",
        "description_i18n": {
          "es": "Medio pollo baby cocinado a la brasa con mojo de finas hierbas. Acompañado de patatas panaderas y espinacas al limón.",
          "en": "Half baby chicken grilled over charcoal with herb mojo. Served with pan-fried potatoes and lemon spinach.",
          "pt": "Meio frango caipira grelhado na brasa com mojo de ervas finas. Acompanha batatas douradas e espinafre ao limão."
        },
        "price": 85,
        "original_price": null,
        "image_url": "/jaleo/carnes/pollo-corral.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-7-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-7",
        "name": "POLLITO CAMPERO",
        "name_i18n": {
          "es": "POLLITO CAMPERO",
          "en": "POLLITO CAMPERO",
          "pt": "FRANGUINHO CAMPERO"
        },
        "description": "Medio pollo baby, bañado con cremosa salsa de ají amarillo y hierbas. Acompañado de verduras a la robata.",
        "description_i18n": {
          "es": "Medio pollo baby, bañado con cremosa salsa de ají amarillo y hierbas. Acompañado de verduras a la robata.",
          "en": "Half baby chicken, bathed in creamy yellow chili and herb sauce. Served with grilled vegetables.",
          "pt": "Meio frango caipira, banhado em creme de pimenta amarela e ervas. Acompanha vegetais grelhados."
        },
        "price": 85,
        "original_price": null,
        "image_url": "/jaleo/carnes/pollo-campero.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-7-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-7",
        "name": "JARRETE",
        "name_i18n": {
          "es": "JARRETE",
          "en": "JARRETE",
          "pt": "JARRETE"
        },
        "description": "Pierna deshuesada cocinada 30 hrs a baja temperatura, con cremoso de patatas.",
        "description_i18n": {
          "es": "Pierna deshuesada cocinada 30 hrs a baja temperatura, con cremoso de patatas.",
          "en": "Boneless leg of lamb slow-cooked for 30hrs, with creamy potatoes.",
          "pt": "Perna desossada cozida por 30h em baixa temperatura, com purê cremoso de batatas."
        },
        "price": 170,
        "original_price": null,
        "image_url": "/jaleo/carnes/jarrete.jpg",
        "is_available": true,
        "is_featured": true,
        "is_best_seller": true,
        "hotness_score": 4,
        "velocity_24h": 18,
        "baseline_14d": 9,
        "reviews_count": 12,
        "average_rating": 4.6,
        "tags": [
          "Recomendado",
          "De la casa"
        ],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-7-4",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-7",
        "name": "MAGRET DE PATO",
        "name_i18n": {
          "es": "MAGRET DE PATO",
          "en": "MAGRET DE PATO",
          "pt": "MAGRET DE PATO"
        },
        "description": "Pechuga de pato, gastrique de maracuyá, zanahorias baby y vainitas.",
        "description_i18n": {
          "es": "Pechuga de pato, gastrique de maracuyá, zanahorias baby y vainitas.",
          "en": "Duck breast, passion fruit gastrique, baby carrots and green beans.",
          "pt": "Peito de pato, gastrique de maracujá, cenouras baby e vagem."
        },
        "price": 89,
        "original_price": null,
        "image_url": "/jaleo/carnes/magret-pato.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-7-5",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-7",
        "name": "LOMITO NEGRO",
        "name_i18n": {
          "es": "LOMITO NEGRO",
          "en": "LOMITO NEGRO",
          "pt": "LOMITO NEGRO"
        },
        "description": "Lomito al carbón, con camarones.",
        "description_i18n": {
          "es": "Lomito al carbón, con camarones.",
          "en": "Grilled beef tenderloin with shrimp.",
          "pt": "Filé mignon na brasa, com camarões."
        },
        "price": 94,
        "original_price": null,
        "image_url": "/jaleo/carnes/lomito-negro.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-7-6",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-7",
        "name": "OJO DE BIFE A LA PARRILLA",
        "name_i18n": {
          "es": "OJO DE BIFE A LA PARRILLA",
          "en": "OJO DE BIFE A LA PARRILLA",
          "pt": "OLHO DE BIFE NA CHURRASQUEIRA"
        },
        "description": "Ojo de bife, acompañado con papas fritas y ensalada.",
        "description_i18n": {
          "es": "Ojo de bife, acompañado con papas fritas y ensalada.",
          "en": "Ribeye, served with fries and salad.",
          "pt": "Contra-filé, acompanhado de batata frita e salada."
        },
        "price": 95,
        "original_price": null,
        "image_url": "/jaleo/carnes/ojo-bife.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  },
  {
    "id": "cat-jaleo-8",
    "venue_id": "venue-jaleo",
    "key": "pescados",
    "name": "PESCADOS",
    "name_i18n": {
      "es": "PESCADOS",
      "en": "SEAFOOD",
      "pt": "PEIXES"
    },
    "description": "PESCADOS — Jaleo",
    "icon": "UtensilsCrossed",
    "order_index": 8,
    "items": [
      {
        "id": "item-jaleo-8-1",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-8",
        "name": "PEZ ESPADA",
        "name_i18n": {
          "es": "PEZ ESPADA",
          "en": "PEZ ESPADA",
          "pt": "PEIXE-ESPADA"
        },
        "description": "A la mantequilla y alcaparras, con puré.",
        "description_i18n": {
          "es": "A la mantequilla y alcaparras, con puré.",
          "en": "With butter and capers, with mashed potatoes.",
          "pt": "Na manteiga e alcaparras, com purê."
        },
        "price": 96,
        "original_price": null,
        "image_url": "/jaleo/pescados/pez-espada.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-8-2",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-8",
        "name": "MERLUZA AL AJO ARRIERO",
        "name_i18n": {
          "es": "MERLUZA AL AJO ARRIERO",
          "en": "MERLUZA AL AJO ARRIERO",
          "pt": "MERLUZA AO ALHO ARRIERO"
        },
        "description": "Merluza del pacífico, con ajo y ají, tomate. Acompañado con verduras.",
        "description_i18n": {
          "es": "Merluza del pacífico, con ajo y ají, tomate. Acompañado con verduras.",
          "en": "Pacific hake, with garlic and chili, tomato. Served with vegetables.",
          "pt": "Merluza do Pacífico, com alho e pimenta, tomate. Acompanha vegetais."
        },
        "price": 94,
        "original_price": null,
        "image_url": "/jaleo/pescados/merluza-ajo.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-8-3",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-8",
        "name": "MERLUZA A LA MARINERA",
        "name_i18n": {
          "es": "MERLUZA A LA MARINERA",
          "en": "MERLUZA A LA MARINERA",
          "pt": "MERLUZA À MARINHEIRA"
        },
        "description": "Merluza del pacífico, a la plancha, almejas y mejillones al vapor. Acompañado de cremosos de espinacas.",
        "description_i18n": {
          "es": "Merluza del pacífico, a la plancha, almejas y mejillones al vapor. Acompañado de cremosos de espinacas.",
          "en": "Pacific hake, grilled, clams and mussels steamed. Served with spinach cream.",
          "pt": "Merluza do Pacífico, grelhada, mariscos e mexilhões no vapor. Acompanha creme de espinafre."
        },
        "price": 98,
        "original_price": null,
        "image_url": "/jaleo/pescados/merluza-marinera.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-8-4",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-8",
        "name": "PAICHE RÍO Y MAR",
        "name_i18n": {
          "es": "PAICHE RÍO Y MAR",
          "en": "PAICHE RÍO Y MAR",
          "pt": "PAICHE RIO E MAR"
        },
        "description": "Paiche amazónico cocinado a baja temperatura, con calamarcetes en su tinta, cremosos de guisantes y tirabeques.",
        "description_i18n": {
          "es": "Paiche amazónico cocinado a baja temperatura, con calamarcetes en su tinta, cremosos de guisantes y tirabeques.",
          "en": "Amazonian paiche slow-cooked, with squid in ink, pea cream and ladyfingers.",
          "pt": "Paiche amazônico cozido em baixa temperatura, com lulas na tinta, creme de ervilhas e vagem."
        },
        "price": 95,
        "original_price": null,
        "image_url": "/jaleo/pescados/paiche-rio-mar.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      },
      {
        "id": "item-jaleo-8-5",
        "venue_id": "venue-jaleo",
        "category_id": "cat-jaleo-8",
        "name": "TRUCHA A LA MEDIA SAL",
        "name_i18n": {
          "es": "TRUCHA A LA MEDIA SAL",
          "en": "TRUCHA A LA MEDIA SAL",
          "pt": "TRUTA AO SAL"
        },
        "description": "Trucha al horno cocinada en sal de Uyuni y verduras asadas.",
        "description_i18n": {
          "es": "Trucha al horno cocinada en sal de Uyuni y verduras asadas.",
          "en": "Baked trout cooked in Uyuni salt with roasted vegetables.",
          "pt": "Truta assada cozida no sal de Uyuni com vegetais assados."
        },
        "price": 89,
        "original_price": null,
        "image_url": "/jaleo/pescados/trucha-sal.jpg",
        "is_available": true,
        "is_featured": false,
        "is_best_seller": false,
        "hotness_score": 0,
        "velocity_24h": 0,
        "baseline_14d": 0,
        "reviews_count": 0,
        "average_rating": 0,
        "tags": [],
        "allergens": [],
        "dietary": []
      }
    ]
  }
];

export const INITIAL_CYCLING_OFFERS: CyclingOffer[] = [
  {
    id: "offer-item-jaleo-1-20",
    venue_id: "venue-jaleo",
    title: "🔥 Destacado: HAMBURGUESA JALEO",
    subtitle: "Oferta especial del día",
    description: "Pan brioche, carrillera glaseada y trufada, cebolla caramelizada y brie. Remesa de los mejores ingredientes frescos de nuestra carta.",
    badge: "-15% HOY",
    original_price: 85,
    discount_price: 72,
    image_url: "/jaleo/tapas/hamburguesa-jaleo.jpg",
    is_active: true,
    priority_level: 1,
    included_item_names: ["HAMBURGUESA JALEO"],
    schedules: [
      { day_of_week: -1, start_time: "12:00", end_time: "23:00" }
    ],
    analytics: {
      impressions: 0,
      clicks: 0,
      add_to_carts: 0,
      conversions: 0,
      revenue_generated: 0,
    },
  },
  {
    id: "offer-item-jaleo-6-2",
    venue_id: "venue-jaleo",
    title: "🔥 Destacado: PAELLA VALENCIANA",
    subtitle: "Oferta especial del día",
    description: "Arroz bomba español, azafrán, conejo, pollo, judiones, morrones y vainitas. Remesa de los mejores ingredientes frescos de nuestra carta.",
    badge: "-15% HOY",
    original_price: 150,
    discount_price: 128,
    image_url: "/jaleo/arroces-paellas/paella-valenciana.jpg",
    is_active: true,
    priority_level: 1,
    included_item_names: ["PAELLA VALENCIANA"],
    schedules: [
      { day_of_week: -1, start_time: "12:00", end_time: "23:00" }
    ],
    analytics: {
      impressions: 0,
      clicks: 0,
      add_to_carts: 0,
      conversions: 0,
      revenue_generated: 0,
    },
  },
  {
    id: "offer-item-jaleo-7-3",
    venue_id: "venue-jaleo",
    title: "🔥 Destacado: JARRETE",
    subtitle: "Oferta especial del día",
    description: "Pierna deshuesada cocinada 30 hrs a baja temperatura, con cremoso de patatas. Remesa de los mejores ingredientes frescos de nuestra carta.",
    badge: "-15% HOY",
    original_price: 170,
    discount_price: 144,
    image_url: "/jaleo/carnes/jarrete.jpg",
    is_active: true,
    priority_level: 1,
    included_item_names: ["JARRETE"],
    schedules: [
      { day_of_week: -1, start_time: "12:00", end_time: "23:00" }
    ],
    analytics: {
      impressions: 0,
      clicks: 0,
      add_to_carts: 0,
      conversions: 0,
      revenue_generated: 0,
    },
  },
];

export const INITIAL_TABLES: VenueTable[] = [
  { id: "tbl-jaleo-1", venue_id: "venue-jaleo", table_number: "1", label: "Mesa 1", qr_code_hash: "jaleo-m1", zone: "Principal", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-2", venue_id: "venue-jaleo", table_number: "2", label: "Mesa 2", qr_code_hash: "jaleo-m2", zone: "Principal", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-3", venue_id: "venue-jaleo", table_number: "3", label: "Mesa 3", qr_code_hash: "jaleo-m3", zone: "Principal", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-4", venue_id: "venue-jaleo", table_number: "4", label: "Mesa 4", qr_code_hash: "jaleo-m4", zone: "Principal", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-5", venue_id: "venue-jaleo", table_number: "5", label: "Mesa 5", qr_code_hash: "jaleo-m5", zone: "Principal", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-6", venue_id: "venue-jaleo", table_number: "6", label: "Mesa 6", qr_code_hash: "jaleo-m6", zone: "Principal", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-7", venue_id: "venue-jaleo", table_number: "7", label: "Mesa 7", qr_code_hash: "jaleo-m7", zone: "Terraza", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-8", venue_id: "venue-jaleo", table_number: "8", label: "Mesa 8", qr_code_hash: "jaleo-m8", zone: "Terraza", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-9", venue_id: "venue-jaleo", table_number: "9", label: "Mesa 9", qr_code_hash: "jaleo-m9", zone: "Terraza", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-10", venue_id: "venue-jaleo", table_number: "10", label: "Mesa 10", qr_code_hash: "jaleo-m10", zone: "Terraza", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-11", venue_id: "venue-jaleo", table_number: "11", label: "Mesa 11", qr_code_hash: "jaleo-m11", zone: "VIP", is_occupied: false, is_active: true },
  { id: "tbl-jaleo-12", venue_id: "venue-jaleo", table_number: "12", label: "Mesa 12", qr_code_hash: "jaleo-m12", zone: "VIP", is_occupied: false, is_active: true },
];

export const INITIAL_REVIEWS: MenuItemReview[] = [];

/**
 * 6.1 The "Hotness" Algorithm Implementation
 * Baseline: SUM(quantity_sold over last 14 days) / 14
 * Velocity: SUM(quantity_sold in last 24 hours)
 * Ratio: Velocity / Baseline
 * Output: Integer 1 (Cold) to 5 (On Fire)
 */
export function calculateHotnessScore(velocity24h: number, baseline14d: number): HotnessLevel {
  if (baseline14d <= 0) {
    if (velocity24h > 20) return 5;
    if (velocity24h > 10) return 4;
    if (velocity24h > 5) return 3;
    if (velocity24h > 1) return 2;
    return 1;
  }
  const ratio = velocity24h / baseline14d;
  if (ratio >= 3.5 || velocity24h >= 40) return 5;
  if (ratio >= 2.5 || velocity24h >= 25) return 4;
  if (ratio >= 1.5 || velocity24h >= 15) return 3;
  if (ratio >= 0.8 || velocity24h >= 5) return 2;
  return 1;
}

export function getHotnessLabel(score: HotnessLevel): { label: string; badge: string; color: string; flameCount: number } {
  switch (score) {
    case 5:
      return { label: "¡En Llamas!", badge: "TOP 1 • ALTA DEMANDA", color: "text-rose-500 bg-rose-500/10 border-rose-500/30", flameCount: 3 };
    case 4:
      return { label: "Muy Caliente", badge: "MUY PEDIDO", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", flameCount: 2 };
    case 3:
      return { label: "Popular", badge: "TENDENCIA", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", flameCount: 1 };
    case 2:
      return { label: "Templado", badge: "ACTIVO", color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30", flameCount: 1 };
    default:
      return { label: "Normal", badge: "DISPONIBLE", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", flameCount: 0 };
  }
}
