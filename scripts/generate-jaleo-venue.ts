/**
 * MiMenu — Venue registry → provisioned_venues.json
 *
 * Reads the per-venue menu source file, translates every item name and
 * description into es / en / pt, and emits the venue entry the
 * MimenuProvider consumes via ?v=<slug>.
 *
 * Run:  npx tsx scripts/generate-jaleo-venue.ts
 * (falls back to plain node when tsx is not installed)
 */
/** @ts-nocheck -- Node-only generator script, not part of the app build. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const OUT = resolve(ROOT, 'src', 'data', 'provisioned_venues.json');

type Local = { es: string; en: string; pt: string };

interface SourceItem {
  name: Local;
  description: Local | null;
  price: string; // e.g. "Bs 68"
  image?: string; // e.g. "/jaleo/tapas/gilda.jpg"
  featured?: boolean;
}

interface SourceCategory {
  key: string;
  name: Local;
  items: SourceItem[];
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ---------------------------------------------------------------- JALEO ---
/** Tenant shown when the URL carries no ?v= slug. */
const DEMO_SLUG = 'demo';
const VENUE = {
  id: 'venue-jaleo',
  slug: 'jaleo',
  name: 'Jaleo',
  tagline: 'Cocina de autor — Santa Cruz de la Sierra',
  description:
    'Tapas, arroces, pastas y parrilla de autor. Productos frescos, cocina de fuego y una carta que viaja de Madrid al Caribe.',
  city: 'Santa Cruz de la Sierra',
  address: 'Santa Cruz de la Sierra, Bolivia',
  phone: '+591 70000000',
  whatsapp: 'https://wa.me/59170000000',
  currency: 'Bs.',
  primary_color: '#BC6C25',
  background_theme: 'light' as const,
  is_active: true,
};

const CATEGORIES: SourceCategory[] = [
  {
    key: 'tapas',
    name: { es: 'TAPAS', en: 'TAPAS', pt: 'TAPAS' },
    items: [
      { name: { es: 'GILDA (2)', en: 'GILDA (2)', pt: 'GILDA (2)' }, description: { es: 'Piparras, anchoas, aceitunas verdes.', en: 'Piparras, anchovies, green olives.', pt: 'Piparras, anchoas, azeitonas verdes.' }, price: 'Bs 34', image: '/jaleo/tapas/gilda.jpg' },
      { name: { es: 'GILDA ATÚN (2)', en: 'GILDA ATÚN (2)', pt: 'GILDA ATÚN (2)' }, description: { es: 'Atún fresco, piparras, anchoas y aceitunas verdes.', en: 'Fresh tuna, piparras, anchovies and green olives.', pt: 'Atum fresco, piparras, anchoas e azeitonas verdes.' }, price: 'Bs 46', image: '/jaleo/tapas/gilda-atun.jpg' },
      { name: { es: 'HUEVOS ROTOS', en: 'HUEVOS ROTOS', pt: 'HUEVOS ROTOS' }, description: { es: 'Patatas fritas, huevo, jamón serrano.', en: 'Fried potatoes, egg, serrano ham.', pt: 'Batatas fritas, ovo, presunto serrano.' }, price: 'Bs 59', image: '/jaleo/tapas/huevos-rotos.jpg' },
      { name: { es: 'CHURRO Y BRAVA', en: 'CHURRO Y BRAVA', pt: 'CHURRO Y BRAVA' }, description: { es: 'Nuestra versión de patatas bravas.', en: 'Our version of patatas bravas.', pt: 'Nossa versão de batatas bravas.' }, price: 'Bs 49', image: '/jaleo/tapas/churro-y-brava.jpg' },
      { name: { es: 'TORTILLA ESPAÑOLA', en: 'TORTILLA ESPAÑOLA', pt: 'TORTILLA ESPAÑOLA' }, description: { es: 'La clásica de siempre: patatas, cebolla y huevo.', en: 'The classic: potatoes, onion and egg.', pt: 'A clássica de sempre: batatas, cebola e ovo.' }, price: 'Bs 48', image: '/jaleo/tapas/tortilla-espanhola.jpg' },
      { name: { es: 'TORTILLA A LA RIOJANA', en: 'TORTILLA A LA RIOJANA', pt: 'TORTILLA A LA RIOJANA' }, description: { es: 'Patatas, huevo, chorizo español.', en: 'Potatoes, egg, Spanish chorizo.', pt: 'Batatas, ovo, chouriço espanhol.' }, price: 'Bs 54', image: '/jaleo/tapas/tortilla-riojana.jpg' },
      { name: { es: 'TORTILLA CARBONARA', en: 'TORTILLA CARBONARA', pt: 'TORTILLA CARBONARA' }, description: { es: 'Patatas, huevo, cebolla, tocino y parmesano italiano.', en: 'Potatoes, egg, onion, bacon and Italian parmesan.', pt: 'Batatas, ovo, cebola, bacon e parmesão italiano.' }, price: 'Bs 57', image: '/jaleo/tapas/tortilla-carbonara.jpg' },
      { name: { es: 'ENSALADILLA RUSA', en: 'ENSALADILLA RUSA', pt: 'ENSALADILLA RUSA' }, description: { es: 'Patatas, pepinillo, atún, aceitunas verdes, huevo y mayonesa.', en: 'Potatoes, pickles, tuna, green olives, egg and mayo.', pt: 'Batatas, picles, atum, azeitonas verdes, ovo e maionese.' }, price: 'Bs 44', image: '/jaleo/tapas/ensaladilla-rusa.jpg' },
      { name: { es: 'BUÑUELOS (4)', en: 'BUÑUELOS (4)', pt: 'BUÑUELOS (4)' }, description: { es: 'De queso de cabra y jamón de pato casero.', en: 'Goat cheese and homemade duck ham.', pt: 'Queijo de cabra e presunto de pato caseiro.' }, price: 'Bs 56', image: '/jaleo/tapas/bunuelos.jpg' },
      { name: { es: 'CROISSANT NEGRO', en: 'CROISSANT NEGRO', pt: 'CROISSANT NEGRO' }, description: { es: 'Relleno de calamares en su tinta.', en: 'Filled with squid in its ink.', pt: 'Recheado com lulas na tinta.' }, price: 'Bs 46', image: '/jaleo/tapas/croissant-negro.jpg' },
      { name: { es: 'CALAMAR A LA ROMANA', en: 'CALAMAR A LA ROMANA', pt: 'CALAMAR A LA ROMANA' }, description: { es: 'Aros de calamar rebozados.', en: 'Battered squid rings.', pt: 'Anéis de lula empanizados.' }, price: 'Bs 56', image: '/jaleo/tapas/calamar-romano.jpg' },
      { name: { es: 'CALAMAR RELLENO', en: 'CALAMAR RELLENO', pt: 'CALAMAR RELLENO' }, description: { es: 'De calamares en su tinta, verduras, con guacamole de guisantes.', en: 'Squid in ink, vegetables, with pea guacamole.', pt: 'Lulas na tinta, vegetais, com guacamole de ervilhas.' }, price: 'Bs 68', image: '/jaleo/tapas/calamar-relleno.jpg' },
      { name: { es: 'ALBÓNDIGAS DE PEZ ESPADA', en: 'ALBÓNDIGAS DE PEZ ESPADA', pt: 'ALMÔNDEGAS DE PEIXE-ESPADA' }, description: { es: 'Con salsa de callos a la madrileña.', en: 'With madrileña-style tripe sauce.', pt: 'Com molho de tripas estilo madrileña.' }, price: 'Bs 46', image: '/jaleo/tapas/albongadas-espada.jpg' },
      { name: { es: 'TIGRES', en: 'TIGRES', pt: 'TIGRES' }, description: { es: 'Cremoso de mejillones rebozado en su concha.', en: 'Creamy mussels breaded in their shell.', pt: 'Creme de mexilhões empanizado na concha.' }, price: 'Bs 66', image: '/jaleo/tapas/tigres.jpg' },
      { name: { es: 'PULPO A LA GALLEGA', en: 'PULPO A LA GALLEGA', pt: 'PULPO A LA GALLEGA' }, description: { es: 'Pulpo, patatas, pimentón dulce español y sal maldom.', en: 'Octopus, potatoes, Spanish sweet paprika and coarse salt.', pt: 'Polvo, batatas, pimentão doce espanhol e sal grosso.' }, price: 'Bs 75', image: '/jaleo/tapas/pulpo-gallega.jpg' },
      { name: { es: 'CAMARONES AL AJÍLLO', en: 'CAMARONES AL AJILLO', pt: 'CAMARÕES AO ALHO' }, description: { es: 'Camarones a la plancha, ajo, ají y aceite de oliva.', en: 'Grilled shrimp, garlic, chili and olive oil.', pt: 'Camarões grelhados, alho, pimenta e azeite.' }, price: 'Bs 68', image: '/jaleo/tapas/camarones-ajillo.jpg' },
      { name: { es: 'CROQUETAS DE CALAMAR', en: 'CROQUETAS DE CALAMAR', pt: 'CROQUETAS DE LULA' }, description: { es: 'Bechamel, tinta de calamar.', en: 'Béchamel, squid ink.', pt: 'Bechamel, tinta de lula.' }, price: 'Bs 66', image: '/jaleo/tapas/croquetas-calamar.jpg' },
      { name: { es: 'CROQUETAS DE JAMÓN SERRANO', en: 'CROQUETAS DE JAMÓN SERRANO', pt: 'CROQUETAS DE PRESUNTO SERRANO' }, description: { es: 'Cremosas a base de bechamel con jamón serrano.', en: 'Creamy béchamel with serrano ham.', pt: 'Cremosas de bechamel com presunto serrano.' }, price: 'Bs 54', image: '/jaleo/tapas/croquetas-jamon.jpg' },
      { name: { es: 'BAO DE RABO DE TORO', en: 'BAO DE RABO DE TORO', pt: 'BAO DE RABO DE TORO' }, description: { es: 'Pan chino, rabo de toro, tuétano y alíoli de chipotle.', en: 'Chinese bun, beef tail, bone marrow and chipotle aioli.', pt: 'Pão chinês, rabo de boi, tutano e maionese de chipotle.' }, price: 'Bs 66', image: '/jaleo/tapas/bao-rabo-toro.jpg' },
      { name: { es: 'HAMBURGUESA JALEO', en: 'HAMBURGUESA JALEO', pt: 'HAMBÚRGUER JALEO' }, featured: true, description: { es: 'Pan brioche, carrillera glaseada y trufada, cebolla caramelizada y brie.', en: 'Brioche bun, glazed and truffled pork cheek, caramelized onion and brie.', pt: 'Pão brioche, bochecha de porco glaceada e trufada, cebola caramelizada e brie.' }, price: 'Bs 85', image: '/jaleo/tapas/hamburguesa-jaleo.jpg' },
      { name: { es: 'CARRILLERA AL VINO TINTO', en: 'CARRILLERA AL VINO TINTO', pt: 'BOCHECHA AO VINHO TINTO' }, description: { es: 'Mejilla de cerdo, vino tinto, mollejas al carbón, con parmentier y verduras.', en: 'Pork cheek, red wine, grilled sweetbreads, with parmentier and vegetables.', pt: 'Bochecha de porco, vinho tinto, molejas na brasa, com parmentier e vegetais.' }, price: 'Bs 62', image: '/jaleo/tapas/carrillera-vino.jpg' },
      { name: { es: 'TIMBAL DE CORDERO', en: 'TIMBAL DE CORDERO', pt: 'TIMBAL DE CORDEIRO' }, description: { es: 'Pierna deshuesada cocinada 30 hrs a baja temperatura, con panaderas.', en: 'Boneless leg of lamb slow-cooked for 30hrs, with panzanella.', pt: 'Perna desossada cozida por 30h em baixa temperatura, com panzanella.' }, price: 'Bs 62', image: '/jaleo/tapas/timbal-cordero.jpg' },
      { name: { es: 'CHULETILLAS DE CORDERO', en: 'CHULETILLAS DE CORDERO', pt: 'CHULETINHAS DE CORDEIRO' }, description: { es: 'A la parrilla, con chips y morrones asados.', en: 'Grilled lamb chops, with chips and roasted bell peppers.', pt: 'Grelhadas, com batata frita e pimentões assados.' }, price: 'Bs 98', image: '/jaleo/tapas/chuletas-cordero.jpg' },
      { name: { es: 'PIMIENTO DEL PIQUILLO', en: 'PIMIENTO DEL PIQUILLO', pt: 'PIMENTO PIQUILLO' }, description: { es: 'Relleno de brandada de pez espada, en salsa verde.', en: 'Filled with swordfish brandade, in green sauce.', pt: 'Recheado com brandada de peixe-espada, em molho verde.' }, price: 'Bs 45', image: '/jaleo/tapas/pimiento-piquillo.jpg' },
      { name: { es: 'RACIÓN DE JAMÓN SERRANO', en: 'RACIÓN DE JAMÓN SERRANO', pt: 'PORÇÃO DE PRESUNTO SERRANO' }, description: { es: 'Reserva español.', en: 'Spanish reserve.', pt: 'Reserva espanhola.' }, price: 'Bs 190', image: '/jaleo/tapas/jamon-serrano.jpg' },
      { name: { es: 'TABLA QUE MOLA', en: 'TABLA QUE MOLA', pt: 'TABUA QUE MOLA' }, description: { es: 'Surtido de quesos y fiambres importados.', en: 'Assorted imported cheeses and cured meats.', pt: 'Seleção de queijos e embutidos importados.' }, price: 'Bs 250', image: '/jaleo/tapas/tabla-que-mola.jpg' },
    ],
  },
  {
    key: 'entradas',
    name: { es: 'ENTRADAS', en: 'STARTERS', pt: 'ENTRADAS' },
    items: [
      { name: { es: 'OSTIONES A LA PARMESANA', en: 'OSTIONES A LA PARMESANA', pt: 'OSTRAS À PARMESÃ' }, description: { es: 'Ostiones gratinados con queso parmesano.', en: 'Oysters gratinated with parmesan cheese.', pt: 'Ostras gratinadas com queijo parmesão.' }, price: 'Bs 68', image: '/jaleo/entradas/ostiones-parmesana.jpg' },
      { name: { es: 'BOQUERONES', en: 'BOQUERONES', pt: 'BOQUERONES' }, description: { es: 'Boquerones, crema de ají amarillo y alcaparras.', en: 'Anchovies, yellow chili cream and capers.', pt: 'Anchoas, creme de pimenta amarela e alcaparras.' }, price: 'Bs 58', image: '/jaleo/entradas/boquerones.jpg' },
      { name: { es: 'AL LÍO', en: 'AL LÍO', pt: 'AL LÍO' }, description: { es: 'Pulpitos, calamarcetes a la plancha, espárragos, tirabeques y mole de romesco.', en: 'Crispy calamari, grilled baby squid, asparagus, ladyfingers and romesco mole.', pt: 'Lulinhas, lulas grelhadas, aspargos, vagem e molho de romesco.' }, price: 'Bs 72', image: '/jaleo/entradas/al-lio.jpg' },
      { name: { es: 'SALPICÓN JALEO', en: 'SALPICÓN JALEO', pt: 'SALPICÓN JALEO' }, description: { es: 'De paiche, camarones, almejas, con aguachile verde.', en: 'Paiche, shrimp, clams, with green chili sauce.', pt: 'De paiche, camarões, mariscos, com molho de pimenta verde.' }, price: 'Bs 65', image: '/jaleo/entradas/salpicon-jaleo.jpg' },
      { name: { es: 'TIRADITO', en: 'TIRADITO', pt: 'TIRADITO' }, description: { es: 'De trucha ahumada, boquerones, chicharrón de su piel, palta, camote y ajíes.', en: 'Smoked trout, anchovies, crunchy skin, avocado, sweet potato and chili peppers.', pt: 'De truta defumada, anchoas, pele crocante, abacate, batata-doce e pimentas.' }, price: 'Bs 68', image: '/jaleo/entradas/tiradito.jpg' },
      { name: { es: 'TARTÁR DE ATÚN', en: 'TARTÁR DE ATÚN', pt: 'TARTAR DE ATUM' }, description: { es: 'Dados de atún fresco, tuétano de res, bálsamo de ajonjolí, soya y emulsión de palta.', en: 'Fresh tuna, beef bone marrow, sesame balm, soy and avocado emulsion.', pt: 'Cubos de atum fresco, tutano de boi, bálsamo de gergelim, soja e emulsão de abacate.' }, price: 'Bs 76', image: '/jaleo/entradas/tartar-atun.jpg' },
      { name: { es: 'TARTÁR DE SOLOMILLO', en: 'TARTÁR DE SOLOMILLO', pt: 'TARTAR DE FILÉ MIGNON' }, description: { es: 'Solomillo cortado al cuchillo, pan brioche y jarabe de bourbon.', en: 'Hand-cut filet mignon, brioche bread and bourbon syrup.', pt: 'Filé mignon cortado na faca, pão brioche e xarope de bourbon.' }, price: 'Bs 58', image: '/jaleo/entradas/tartar-solomillo.jpg' },
      { name: { es: 'CARPACCIO JALEO', en: 'CARPACCIO JALEO', pt: 'CARPACCIO JALEO' }, description: { es: 'Finos cortes de filete de res, rúcula, champiñones, jamón serrano, parmesano.', en: 'Thinly sliced beef fillet, arugula, mushrooms, serrano ham, parmesan.', pt: 'Fatias finas de filé de boi, rúcula, cogumelos, presunto serrano, parmesão.' }, price: 'Bs 78', image: '/jaleo/entradas/carpaccio-jaleo.jpg' },
      { name: { es: 'CARPACCIO DE PATO', en: 'CARPACCIO DE PATO', pt: 'CARPACCIO DE PATO' }, description: { es: 'Finos cortes de pato marinado, rúcula, parmesano, con reducción de aceto balsámico.', en: 'Thinly sliced marinated duck, arugula, parmesan, with balsamic reduction.', pt: 'Fatias finas de pato marinado, rúcula, parmesão, com redução de vinagre balsâmico.' }, price: 'Bs 65', image: '/jaleo/entradas/carpaccio-pato.jpg' },
      { name: { es: 'BURRATA EMPANIZADA', en: 'BURRATA EMPANIZADA', pt: 'BURRATA EMPANADA' }, description: { es: 'Burrata frita, tomates secos, salsa de tomate y rúcula.', en: 'Fried burrata, sun-dried tomatoes, tomato sauce and arugula.', pt: 'Burrata frita, tomates secos, molho de tomate e rúcula.' }, price: 'Bs 89', image: '/jaleo/entradas/buratta-empanizada.jpg' },
      { name: { es: 'ESPÁRRAGOS COJONUDO', en: 'ESPÁRRAGOS COJONUDO', pt: 'ASPARGOS COJONUDO' }, description: { es: 'Espárragos blancos XL, con jamón serrano, y salsa holandesa de mandarina.', en: 'Extra-large white asparagus, with serrano ham, and mandarin hollandaise sauce.', pt: 'Aspargos brancos XL, com presunto serrano e molho holandês de tangerina.' }, price: 'Bs 56', image: '/jaleo/entradas/esparragos-cojonudo.jpg' },
    ],
  },
  {
    key: 'ensaladas',
    name: { es: 'ENSALADAS', en: 'SALADS', pt: 'SALADAS' },
    items: [
      { name: { es: 'CESAR', en: 'CESAR', pt: 'CESAR' }, description: { es: 'Surtido de lechugas, pollo, tocino, crutones, anchoas, parmesano y salsa cesar.', en: 'Mixed greens, chicken, bacon, croutons, anchovies, parmesan and Caesar dressing.', pt: 'Mix de folhas, frango, bacon, croutons, anchoas, parmesão e molho caesar.' }, price: 'Bs 64', image: '/jaleo/ensaladas/cesar.jpg' },
      { name: { es: 'MEDITERRÁNEA', en: 'MEDITERRÁNEA', pt: 'MEDITERRÂNEA' }, description: { es: 'Surtido de lechugas, tomate seco, rúcula, aceitunas verdes, almendras, alcachofas, jamón serrano, parmesano con vinagreta de mostaza.', en: 'Mixed greens, sun-dried tomato, arugula, green olives, almonds, artichokes, serrano ham, parmesan with mustard vinaigrette.', pt: 'Mix de folhas, tomate seco, rúcula, azeitonas verdes, amêndoas, alcachofras, presunto serrano, parmesão com vinagrete de mostarda.' }, price: 'Bs 74', image: '/jaleo/ensaladas/mediterranea.jpg' },
    ],
  },
  {
    key: 'de-cuchara',
    name: { es: 'DE CUCHARA', en: 'SINGLE POT', pt: 'DE COLHER' },
    items: [
      { name: { es: 'CALLOS A LA MADRILEÑA', en: 'CALLOS A LA MADRILEÑA', pt: 'CALLOS À MADRILEÑA' }, description: { es: 'Guiso clásico madrileño: con callos, chorizo español, tocino y garbanzos.', en: 'Classic Madrid stew: tripe, Spanish chorizo, bacon and chickpeas.', pt: 'Cozido clássico de Madri: tripas, chouriço espanhol, bacon e grão-de-bico.' }, price: 'Bs 79', image: '/jaleo/de-cuchara/callos-madrilena.jpg' },
      { name: { es: 'FABADA ASTURIANA', en: 'FABADA ASTURIANA', pt: 'FABADA ASTURIANA' }, description: { es: 'Chorizo asturiano ahumado, morcilla, panceta, judiones de la granja.', en: 'Smoked Asturian chorizo, blood sausage, bacon, farm beans.', pt: 'Chouriço asturiano defumado, morcela, bacon, feijões da fazenda.' }, price: 'Bs 98', image: '/jaleo/de-cuchara/fabada-asturiana.jpg' },
      { name: { es: 'SUQUET DE PEIX', en: 'SUQUET DE PEIX', pt: 'SUQUET DE PEIX' }, description: { es: 'Sopa contundente catalana con pescados y mariscos, tomate y patatas.', en: 'Catalan fish stew with fish and seafood, tomato and potatoes.', pt: 'Ensopado catalão de peixe com frutos do mar, tomate e batatas.' }, price: 'Bs 98', image: '/jaleo/de-cuchara/suquet-peix.jpg' },
    ],
  },
  {
    key: 'pastas',
    name: { es: 'PASTAS', en: 'PASTAS', pt: 'MASSAS' },
    items: [
      { name: { es: 'CANELONS DA XAI TRUFATS', en: 'CANELONS DA XAI TRUFATS', pt: 'CANELONS DA XAI TRUFATS' }, description: { es: 'Pasta rellena de cordero a baja temperatura, con bechamel trufada y demi-glace.', en: 'Pasta filled with slow-cooked lamb, truffle béchamel and demi-glace.', pt: 'Massa recheada com cordeiro cozido em baixa temperatura, bechamel trufado e demi-glace.' }, price: 'Bs 120', image: '/jaleo/pastas/canelons-trufats.jpg' },
      { name: { es: 'TORTELLONI JALEO', en: 'TORTELLONI JALEO', pt: 'TORTELLONI JALEO' }, description: { es: 'Pasta de espinaca, rellena de pez espada, pasatta de camarones.', en: 'Spinach pasta, filled with swordfish, shrimp pasatta.', pt: 'Massa de espinafre, recheada com peixe-espada, passata de camarões.' }, price: 'Bs 89', image: '/jaleo/pastas/tortelloni-jaleo.jpg' },
      { name: { es: 'SORRENTINO DEL LAGO', en: 'SORRENTINO DEL LAGO', pt: 'SORRENTINO DEL LAGO' }, description: { es: 'Pasta rellena de ricotta, trucha ahumada, con crema al limón.', en: 'Ricotta-filled pasta, smoked trout, with lemon cream.', pt: 'Massa recheada com ricota, truta defumada, com creme de limão.' }, price: 'Bs 94', image: '/jaleo/pastas/sorrentino-lago.jpg' },
      { name: { es: 'LINGUINI DEL CANTABRICO NEGRO', en: 'LINGUINI DEL CANTABRICO NEGRO', pt: 'LINGUINE NEGRO DO CANTÁBRICO' }, description: { es: 'Pasta negra con pulpo y tomate.', en: 'Black pasta with octopus and tomato.', pt: 'Massa preta com polvo e tomate.' }, price: 'Bs 115', image: '/jaleo/pastas/linguini-negro.jpg' },
    ],
  },
  {
    key: 'arroces-paellas',
    name: { es: 'ARROCES Y PAELLAS', en: 'RICES & PAELLAS', pt: 'ARROZES E PAELLAS' },
    items: [
      { name: { es: 'ARROZ DEL SENYORET (DEL SEÑORITO)', en: 'ARROZ DEL SENYORET', pt: 'ARROZ DEL SENYORET' }, description: { es: 'Arroz bomba español, azafrán y surtido de mariscos.', en: 'Spanish bomba rice, saffron and seafood mix.', pt: 'Arroz bomba espanhol, açafrão e mix de frutos do mar.' }, price: 'Bs 140', image: '/jaleo/arroces-paellas/arroz-senyoret.jpg' },
      { name: { es: 'PAELLA VALENCIANA', en: 'PAELLA VALENCIANA', pt: 'PAELLA VALENCIANA' }, featured: true, description: { es: 'Arroz bomba español, azafrán, conejo, pollo, judiones, morrones y vainitas.', en: 'Spanish bomba rice, saffron, rabbit, chicken, beans, bell peppers and green beans.', pt: 'Arroz bomba espanhol, açafrão, coelho, frango, feijões, pimentões e vagem.' }, price: 'Bs 150', image: '/jaleo/arroces-paellas/paella-valenciana.jpg' },
      { name: { es: 'PAELLA MARINERA', en: 'PAELLA MARINERA', pt: 'PAELLA MARINERA' }, description: { es: 'Arroz bomba español, azafrán, mariscos.', en: 'Spanish bomba rice, saffron, seafood.', pt: 'Arroz bomba espanhol, açafrão, frutos do mar.' }, price: 'Bs 150', image: '/jaleo/arroces-paellas/paella-marinera.jpg' },
      { name: { es: 'PAELLA MIXTA', en: 'PAELLA MIXTA', pt: 'PAELLA MIXTA' }, description: { es: 'Arroz bomba español, azafrán, surtido de mariscos, carnes y verduras.', en: 'Spanish bomba rice, saffron, seafood mix, meats and vegetables.', pt: 'Arroz bomba espanhol, açafrão, mix de frutos do mar, carnes e vegetais.' }, price: 'Bs 140', image: '/jaleo/arroces-paellas/paella-mixta.jpg' },
      { name: { es: 'PAELLA MARINERA 2.0', en: 'PAELLA MARINERA 2.0', pt: 'PAELLA MARINERA 2.0' }, description: { es: 'Clásica paella marinera con extra de mariscos.', en: 'Classic seafood paella with extra seafood.', pt: 'Paella de frutos do mar clássica com extra de frutos do mar.' }, price: 'Bs 185', image: '/jaleo/arroces-paellas/paella-marinera-2.jpg' },
      { name: { es: 'ARROZ NEGRO', en: 'ARROZ NEGRO', pt: 'ARROZ NEGRO' }, description: { es: 'Arroz bomba español, tinta de calamar y calamares.', en: 'Spanish bomba rice, squid ink and squid.', pt: 'Arroz bomba espanhol, tinta de lula e lulas.' }, price: 'Bs 145', image: '/jaleo/arroces-paellas/arroz-negro.jpg' },
      { name: { es: 'FIDEUÁ', en: 'FIDEUÁ', pt: 'FIDEUÁ' }, description: { es: 'Fideos, azafrán, mariscos.', en: 'Noodles, saffron, seafood.', pt: 'Fios de massa, açafrão, frutos do mar.' }, price: 'Bs 140', image: '/jaleo/arroces-paellas/fideua.jpg' },
      { name: { es: 'FIDEUA NEGRA', en: 'FIDEUA NEGRA', pt: 'FIDEUA NEGRA' }, description: { es: 'Fideos, camarones, tinta de calamar.', en: 'Noodles, shrimp, squid ink.', pt: 'Fios de massa, camarões, tinta de lula.' }, price: 'Bs 145', image: '/jaleo/arroces-paellas/fideua-negra.jpg' },
    ],
  },
  {
    key: 'carnes',
    name: { es: 'CARNES', en: 'MEATS', pt: 'CARNES' },
    items: [
      { name: { es: 'POLLITO DE CORRAL A LA LEÑA', en: 'POLLITO DE CORRAL A LA LEÑA', pt: 'FRANGUINHO CAIPIRA NA LENHA' }, description: { es: 'Medio pollo baby cocinado a la brasa con mojo de finas hierbas. Acompañado de patatas panaderas y espinacas al limón.', en: 'Half baby chicken grilled over charcoal with herb mojo. Served with pan-fried potatoes and lemon spinach.', pt: 'Meio frango caipira grelhado na brasa com mojo de ervas finas. Acompanha batatas douradas e espinafre ao limão.' }, price: 'Bs 85', image: '/jaleo/carnes/pollo-corral.jpg' },
      { name: { es: 'POLLITO CAMPERO', en: 'POLLITO CAMPERO', pt: 'FRANGUINHO CAMPERO' }, description: { es: 'Medio pollo baby, bañado con cremosa salsa de ají amarillo y hierbas. Acompañado de verduras a la robata.', en: 'Half baby chicken, bathed in creamy yellow chili and herb sauce. Served with grilled vegetables.', pt: 'Meio frango caipira, banhado em creme de pimenta amarela e ervas. Acompanha vegetais grelhados.' }, price: 'Bs 85', image: '/jaleo/carnes/pollo-campero.jpg' },
      { name: { es: 'JARRETE', en: 'JARRETE', pt: 'JARRETE' }, featured: true, description: { es: 'Pierna deshuesada cocinada 30 hrs a baja temperatura, con cremoso de patatas.', en: 'Boneless leg of lamb slow-cooked for 30hrs, with creamy potatoes.', pt: 'Perna desossada cozida por 30h em baixa temperatura, com purê cremoso de batatas.' }, price: 'Bs 170', image: '/jaleo/carnes/jarrete.jpg' },
      { name: { es: 'MAGRET DE PATO', en: 'MAGRET DE PATO', pt: 'MAGRET DE PATO' }, description: { es: 'Pechuga de pato, gastrique de maracuyá, zanahorias baby y vainitas.', en: 'Duck breast, passion fruit gastrique, baby carrots and green beans.', pt: 'Peito de pato, gastrique de maracujá, cenouras baby e vagem.' }, price: 'Bs 89', image: '/jaleo/carnes/magret-pato.jpg' },
      { name: { es: 'LOMITO NEGRO', en: 'LOMITO NEGRO', pt: 'LOMITO NEGRO' }, description: { es: 'Lomito al carbón, con camarones.', en: 'Grilled beef tenderloin with shrimp.', pt: 'Filé mignon na brasa, com camarões.' }, price: 'Bs 94', image: '/jaleo/carnes/lomito-negro.jpg' },
      { name: { es: 'OJO DE BIFE A LA PARRILLA', en: 'OJO DE BIFE A LA PARRILLA', pt: 'OLHO DE BIFE NA CHURRASQUEIRA' }, description: { es: 'Ojo de bife, acompañado con papas fritas y ensalada.', en: 'Ribeye, served with fries and salad.', pt: 'Contra-filé, acompanhado de batata frita e salada.' }, price: 'Bs 95', image: '/jaleo/carnes/ojo-bife.jpg' },
    ],
  },
  {
    key: 'pescados',
    name: { es: 'PESCADOS', en: 'SEAFOOD', pt: 'PEIXES' },
    items: [
      { name: { es: 'PEZ ESPADA', en: 'PEZ ESPADA', pt: 'PEIXE-ESPADA' }, description: { es: 'A la mantequilla y alcaparras, con puré.', en: 'With butter and capers, with mashed potatoes.', pt: 'Na manteiga e alcaparras, com purê.' }, price: 'Bs 96', image: '/jaleo/pescados/pez-espada.jpg' },
      { name: { es: 'MERLUZA AL AJO ARRIERO', en: 'MERLUZA AL AJO ARRIERO', pt: 'MERLUZA AO ALHO ARRIERO' }, description: { es: 'Merluza del pacífico, con ajo y ají, tomate. Acompañado con verduras.', en: 'Pacific hake, with garlic and chili, tomato. Served with vegetables.', pt: 'Merluza do Pacífico, com alho e pimenta, tomate. Acompanha vegetais.' }, price: 'Bs 94', image: '/jaleo/pescados/merluza-ajo.jpg' },
      { name: { es: 'MERLUZA A LA MARINERA', en: 'MERLUZA A LA MARINERA', pt: 'MERLUZA À MARINHEIRA' }, description: { es: 'Merluza del pacífico, a la plancha, almejas y mejillones al vapor. Acompañado de cremosos de espinacas.', en: 'Pacific hake, grilled, clams and mussels steamed. Served with spinach cream.', pt: 'Merluza do Pacífico, grelhada, mariscos e mexilhões no vapor. Acompanha creme de espinafre.' }, price: 'Bs 98', image: '/jaleo/pescados/merluza-marinera.jpg' },
      { name: { es: 'PAICHE RÍO Y MAR', en: 'PAICHE RÍO Y MAR', pt: 'PAICHE RIO E MAR' }, description: { es: 'Paiche amazónico cocinado a baja temperatura, con calamarcetes en su tinta, cremosos de guisantes y tirabeques.', en: 'Amazonian paiche slow-cooked, with squid in ink, pea cream and ladyfingers.', pt: 'Paiche amazônico cozido em baixa temperatura, com lulas na tinta, creme de ervilhas e vagem.' }, price: 'Bs 95', image: '/jaleo/pescados/paiche-rio-mar.jpg' },
      { name: { es: 'TRUCHA A LA MEDIA SAL', en: 'TRUCHA A LA MEDIA SAL', pt: 'TRUTA AO SAL' }, description: { es: 'Trucha al horno cocinada en sal de Uyuni y verduras asadas.', en: 'Baked trout cooked in Uyuni salt with roasted vegetables.', pt: 'Truta assada cozida no sal de Uyuni com vegetais assados.' }, price: 'Bs 89', image: '/jaleo/pescados/trucha-sal.jpg' },
    ],
  },
];

// --------------------------------------------------------------- BUILD ---
const priceNum = (p: string) => {
  const m = p.replace(/[^\d.]/g, '');
  return m ? parseFloat(m) : 0;
};

const categories = CATEGORIES.map((cat, ci) => {
  const catId = `cat-${VENUE.slug}-${ci + 1}`;
  return {
    id: catId,
    venue_id: VENUE.id,
    key: cat.key,
    name: cat.name.es,
    name_i18n: cat.name,
    description: `${cat.name.es} — Jaleo`,
    icon: 'UtensilsCrossed',
    order_index: ci + 1,
    items: cat.items.map((item, ii) => {
      const price = priceNum(item.price);
      const nameEs = item.name.es.toUpperCase();
      const featured = item.featured === true;
      return {
        id: `item-${VENUE.slug}-${ci + 1}-${ii + 1}`,
        venue_id: VENUE.id,
        category_id: catId,
        name: nameEs,
        name_i18n: item.name,
        description: item.description ? item.description.es : null,
        description_i18n: item.description,
        price,
        original_price: null,
        image_url: item.image || '',
        is_available: true,
        is_featured: featured,
        is_best_seller: featured,
        hotness_score: featured ? 4 : 2,
        velocity_24h: featured ? 18 : 3,
        baseline_14d: featured ? 9 : 2,
        reviews_count: featured ? 12 : 2,
        average_rating: featured ? 4.6 : 4.1,
        tags: featured ? ['Recomendado', 'De la casa'] : [],
        allergens: [],
        dietary: [],
      };
    }),
  };
});

const venue = {
  ...VENUE,
  name_i18n: { es: 'Jaleo', en: 'Jaleo', pt: 'Jaleo' },
  tagline_i18n: {
    es: 'Cocina de autor — Santa Cruz de la Sierra',
    en: 'Signature cuisine — Santa Cruz de la Sierra',
    pt: 'Cozinha de autor — Santa Cruz de la Sierra',
  },
  description_i18n: {
    es: 'Tapas, arroces, pastas y parrilla de autor. Productos frescos, cocina de fuego y una carta que viaja de Madrid al Caribe.',
    en: 'Tapas, rices, pastas and signature grill. Fresh produce, fire cooking and a menu that travels from Madrid to the Caribbean.',
    pt: 'Tapas, arrozes, massas e grelha de autor. Produtos frescos, cozinha de fogo e um cardápio que viaja de Madri ao Caribe.',
  },
  // Staff tenant logins: email → role. The password is supplied on the login
  // screen; only the role binding is stored here.
  staff: [
    { email: 'admin@jaleo.com', name: 'Jaleo Admin', role: 'admin' },
    { email: 'cocina@jaleo.com', name: 'Jaleo Cocina', role: 'kitchen' },
    { email: 'caja@jaleo.com', name: 'Jaleo Caja', role: 'cashier' },
    { email: 'mozo@jaleo.com', name: 'Jaleo Mozo', role: 'waiter' },
  ],
  categories,
  tables: 12,
};


// ---------------------------------------------------------------- DEMO -----
// Demo tenant = the app's built-in sample venue (Moe's Taberna). It is the
// default for URLs with no ?v= slug and stays resolvable so existing links
// that used ?v=moes keep working.
const DEMO_VENUE = {
  id: 'venue-demo',
  slug: 'demo',
  name: "Moe's Taberna",
  tagline: 'La Taberna Más Prendida de Santa Cruz',
  description:
    'Salchipapas legendarias con queso derretido, nachos monstruosos, fernet bien cruceño, chopp helado escarchado y el mejor ambiente nocturno de Santa Cruz de la Sierra.',
  city: 'Santa Cruz de la Sierra',
  address: 'Av. San Martín #450, Barrio Equipetrol, Santa Cruz, Bolivia',
  phone: '+591 78012345',
  whatsapp: 'https://wa.me/59178012345',
  currency: 'Bs.',
  primary_color: '#D97706',
  background_theme: 'dark' as const,
  is_active: true,
};

const demo = { ...DEMO_VENUE };

// ------------------------------------------------------- PATCH REGISTRY ---
const registry = JSON.parse(readFileSync(OUT, 'utf8'));
const next = registry.filter((v: any) => v.slug !== VENUE.slug);
// Jaleo is the first *customer* tenant, so it sorts first. The default
// tenant for URLs with no ?v= slug is DEMO_SLUG, not Jaleo.
next.unshift(venue);
next.sort((a: any, b: any) => (a.slug === DEMO_SLUG ? -1 : b.slug === DEMO_SLUG ? 1 : 0));
// Drop any legacy demo slug variants so the registry holds exactly one demo.
const deduped = next.filter(
  (v: any) => v.slug !== DEMO_VENUE.slug && v.slug !== 'moes'
);
deduped.unshift(demo);
deduped.sort((a: any, b: any) => (a.slug === DEMO_SLUG ? -1 : b.slug === DEMO_SLUG ? 1 : 0));

writeFileSync(OUT, JSON.stringify(deduped, null, 1) + '\n', 'utf8');

const itemCount = categories.reduce((n, c) => n + c.items.length, 0);
console.log(`✅ ${VENUE.slug}: ${categories.length} categorías, ${itemCount} platos`);
console.log(`   registry: ${registry.length} → ${deduped.length} venues → ${OUT}`);
console.log(`   first tenant: ${deduped[0].slug} (demo default: ${DEMO_SLUG})`);