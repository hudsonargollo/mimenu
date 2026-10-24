import type { Lang } from "@/i18n/translations";

export interface MenuItem {
  name: { es: string; en: string; pt: string };
  description: { es: string; en: string; pt: string } | null;
  price: string;
  image?: string;
}

export interface MenuCategory {
  key: string;
  name: { es: string; en: string; pt: string };
  items: MenuItem[];
}

export const jaleoMenu: MenuCategory[] = [
  {
    key: "tapas",
    name: { es: "TAPAS", en: "TAPAS", pt: "TAPAS" },
    items: [
      {
        name: { es: "GILDA (2)", en: "GILDA (2)", pt: "GILDA (2)" },
        description: { es: "Piparras, anchoas, aceitunas verdes.", en: "Piparras, anchovies, green olives.", pt: "Piparras, anchoas, azeitonas verdes." },
        price: "Bs 34",
        image: "/jaleo/tapas/gilda.jpg",
      },
      {
        name: { es: "GILDA ATÚN (2)", en: "GILDA ATÚN (2)", pt: "GILDA ATÚN (2)" },
        description: { es: "Atún frescos, piparras, anchoas y aceitunas verdes.", en: "Fresh tuna, piparras, anchovies and green olives.", pt: "Atún fresco, piparras, anchoas e azeitonas verdes." },
        price: "Bs 46",
        image: "/jaleo/tapas/gilda-atun.jpg",
      },
      {
        name: { es: "HUEVOS ROTOS", en: "HUEVOS ROTOS", pt: "HUEVOS ROTOS" },
        description: { es: "Patatas fritas, huevo, jamón serrano.", en: "Fried potatoes, egg, serrano ham.", pt: "Batatas fritas, ovo, presunto serrano." },
        price: "Bs 59",
        image: "/jaleo/tapas/huevos-rotos.jpg",
      },
      {
        name: { es: "CHURRO Y BRAVA", en: "CHURRO Y BRAVA", pt: "CHURRO Y BRAVA" },
        description: { es: "Nuestra versión de patatas bravas.", en: "Our version of patatas bravas.", pt: "Nossa versão de batatas bravas." },
        price: "Bs 49",
        image: "/jaleo/tapas/churro-y-brava.jpg",
      },
      {
        name: { es: "TORTILLA ESPAÑOLA", en: "TORTILLA ESPAÑOLA", pt: "TORTILLA ESPAÑOLA" },
        description: { es: "La clásica de siempre: patatas, cebolla y huevo.", en: "The classic: potatoes, onion and egg.", pt: "A clássica de sempre: batatas, cebola e ovo." },
        price: "Bs 48",
        image: "/jaleo/tapas/tortilla-espanhola.jpg",
      },
      {
        name: { es: "TORTILLA A LA RIOJANA", en: "TORTILLA A LA RIOJANA", pt: "TORTILLA A LA RIOJANA" },
        description: { es: "Patatas, huevo, chorizo español.", en: "Potatoes, egg, Spanish chorizo.", pt: "Batatas, ovo, chouriço espanhol." },
        price: "Bs 54",
        image: "/jaleo/tapas/tortilla-riojana.jpg",
      },
      {
        name: { es: "TORTILLA CARBONARA", en: "TORTILLA CARBONARA", pt: "TORTILLA CARBONARA" },
        description: { es: "Patatas, huevo, cebolla, tocino y parmesano italiano.", en: "Potatoes, egg, onion, bacon and Italian parmesan.", pt: "Batatas, ovo, cebola, bacon e parmesão italiano." },
        price: "Bs 57",
        image: "/jaleo/tapas/tortilla-carbonara.jpg",
      },
      {
        name: { es: "ENSALADILLA RUSA", en: "ENSALADILLA RUSA", pt: "ENSALADILLA RUSA" },
        description: { es: "Patatas, pepinillo, atún, aceitunas verdes, huevo y mayonesa.", en: "Potatoes, pickles, tuna, green olives, egg and mayo.", pt: "Batatas, picles, atún, azeitonas verdes, ovo e maionese." },
        price: "Bs 44",
        image: "/jaleo/tapas/ensaladilla-rusa.jpg",
      },
      {
        name: { es: "BUÑUELOS (4)", en: "BUÑUELOS (4)", pt: "BUÑUELOS (4)" },
        description: { es: "De queso de cabra y jamón de pato casero.", en: "Goat cheese and homemade duck ham.", pt: "Queijo de cabra e presunto de pato caseiro." },
        price: "Bs 56",
        image: "/jaleo/tapas/bunuelos.jpg",
      },
      {
        name: { es: "CROISSANT NEGRO", en: "CROISSANT NEGRO", pt: "CROISSANT NEGRO" },
        description: { es: "Relleno de calamares en su tinta.", en: "Filled with squid in its ink.", pt: "Recheado com lulas na tinta." },
        price: "Bs 46",
        image: "/jaleo/tapas/croissant-negro.jpg",
      },
      {
        name: { es: "CALAMAR A LA ROMANA", en: "CALAMAR A LA ROMANA", pt: "CALAMAR A LA ROMANA" },
        description: { es: "Aros de calamar rebozados.", en: "Battered squid rings.", pt: "Anéis de lula empanizados." },
        price: "Bs 56",
        image: "/jaleo/tapas/calamar-romano.jpg",
      },
      {
        name: { es: "CALAMAR RELLENO", en: "CALAMAR RELLENO", pt: "CALAMAR RELLENO" },
        description: { es: "De calamares en su tinta, verduras, con guacamoles de guisantes.", en: "Squid in ink, vegetables, with pea guacamole.", pt: "Lulas na tinta, vegetais, com guacamole de ervilhas." },
        price: "Bs 68",
        image: "/jaleo/tapas/calamar-relleno.jpg",
      },
      {
        name: { es: "ALBÓNDIGAS DE PEZ ESPADA", en: "ALBÓNDIGAS DE PEZ ESPADA", pt: "ALBÓNDIGAS DE PEZ ESPADA" },
        description: { es: "Con salsa de callos a la madrileña.", en: "With madrileña-style tripe sauce.", pt: "Com molho de tripas estilo madrileña." },
        price: "Bs 46",
        image: "/jaleo/tapas/albongadas-espada.jpg",
      },
      {
        name: { es: "TIGRES", en: "TIGRES", pt: "TIGRES" },
        description: { es: "Cremoso de mejillones rebozado en su concha.", en: "Creamy mussels breaded in their shell.", pt: "Creme de mexilhões empanizados em sua concha." },
        price: "Bs 66",
        image: "/jaleo/tapas/tigres.jpg",
      },
      {
        name: { es: "PULPO A LA GALLEGA", en: "PULPO A LA GALLEGA", pt: "PULPO A LA GALLEGA" },
        description: { es: "Pulpo, patatas, pimentón dulce español y sal maldom.", en: "Octopus, potatoes, Spanish sweet paprika and coarse salt.", pt: "Polvo, batatas, pimentón doce espanhol e sal grosso." },
        price: "Bs 75",
        image: "/jaleo/tapas/pulpo-gallega.jpg",
      },
      {
        name: { es: "CAMARONES AL AJÍLLO", en: "CAMARONES AL AJÍLLO", pt: "CAMARONES AL AJÍLLO" },
        description: { es: "Camarones a la plancha, ajo, ají y aceite de oliva.", en: "Grilled shrimp, garlic, chili and olive oil.", pt: "Camarões grelhados, alho, ají e azeite." },
        price: "Bs 68",
        image: "/jaleo/tapas/camarones-ajillo.jpg",
      },
      {
        name: { es: "CROQUETAS DE CALAMAR", en: "CROQUETAS DE CALAMAR", pt: "CROQUETAS DE CALAMAR" },
        description: { es: "Bechamel, tinta de calamar.", en: "Béchamel, squid ink.", pt: "Bechamel, tinta de lula." },
        price: "Bs 66",
        image: "/jaleo/tapas/croquetas-calamar.jpg",
      },
      {
        name: { es: "CROQUETAS DE JAMÓN SERRANO", en: "CROQUETAS DE JAMÓN SERRANO", pt: "CROQUETAS DE JAMÓN SERRANO" },
        description: { es: "Cremosas a base de bechamel con jamón serrano.", en: "Creamy béchamel with serrano ham.", pt: "Cremosas a base de bechamel com presunto serrano." },
        price: "Bs 54",
        image: "/jaleo/tapas/croquetas-jamon.jpg",
      },
      {
        name: { es: "BAO DE RABO DE TORO", en: "BAO DE RABO DE TORO", pt: "BAO DE RABO DE TORO" },
        description: { es: "Pan chino, rabo de toro, tuétano y alíoli de chipotle.", en: "Chinese bun, beef tail, bone marrow and chipotle aioli.", pt: "Pão chinês, caudal de boi, medulha e alhoiço de chipotle." },
        price: "Bs 66",
        image: "/jaleo/tapas/bao-rabo-toro.jpg",
      },
      {
        name: { es: "HAMBURGUESA JALEO", en: "HAMBURGUESA JALEO", pt: "HAMBURGUESA JALEO" },
        description: { es: "Pan brioche, carrillera glaseada y trufada, cebolla caramelizada y brie.", en: "Brioche bun, glazed and truffled pork cheek, caramelized onion and brie.", pt: "Pão brioche, queixo de porco brilhante e trufado, cebola caramelizada e brie." },
        price: "Bs 85",
        image: "/jaleo/tapas/hamburguesa-jaleo.jpg",
      },
      {
        name: { es: "CARRILLERA AL VINO TINTO", en: "CARRILLERA AL VINO TINTO", pt: "CARRILLERA AL VINO TINTO" },
        description: { es: "Mejilla de cerdo, vino tinto, mollejas al carbón, con parmentier y verduras.", en: "Pork cheek, red wine, grilled sweetbreads, with parmentier and vegetables.", pt: "Meia-cana de porco, vinho tinto, molhos ao carvão, com purê e vegetais." },
        price: "Bs 62",
        image: "/jaleo/tapas/carrillera-vino.jpg",
      },
      {
        name: { es: "TIMBAL DE CORDERO", en: "TIMBAL DE CORDERO", pt: "TIMBAL DE CORDERO" },
        description: { es: "Pierna deshuesada cocinada 30 hrs a baja temperatura, con panaderas.", en: "Boneless leg of lamb slow-cooked for 30hrs, with panzanella.", pt: "Perna desossada cozida a lenço por 30hrs, com panzanella." },
        price: "Bs 62",
        image: "/jaleo/tapas/timbal-cordero.jpg",
      },
      {
        name: { es: "CHULETILLAS DE CORDERO", en: "CHULETILLAS DE CORDERO", pt: "CHULETILLAS DE CORDERO" },
        description: { es: "A la parrilla, con chips y morrones asados.", en: "Grilled lamb chops, with chips and roasted bell peppers.", pt: "A grelhar, com batatas fritas e pimentões assados." },
        price: "Bs 98",
        image: "/jaleo/tapas/chuletas-cordero.jpg",
      },
      {
        name: { es: "PIMIENTO DEL PIQUILLO", en: "PIMIENTO DEL PIQUILLO", pt: "PIMIENTO DEL PIQUILLO" },
        description: { es: "Relleno de brandada de pez espada, en salsa verde.", en: "Filled with swordfish brandade, in green sauce.", pt: "Recheado com brandade de peixe-espada, em molho verde." },
        price: "Bs 45",
        image: "/jaleo/tapas/pimiento-piquillo.jpg",
      },
      {
        name: { es: "RACIÓN DE JAMÓN SERRANO", en: "RACIÓN DE JAMÓN SERRANO", pt: "RACIÓN DE JAMÓN SERRANO" },
        description: { es: "Reserva español.", en: "Spanish reserve.", pt: "Reserva espanhol." },
        price: "Bs 190",
        image: "/jaleo/tapas/jamon-serrano.jpg",
      },
      {
        name: { es: "TABLA QUE MOLA", en: "TABLA QUE MOLA", pt: "TABLA QUE MOLA" },
        description: { es: "Surtido de quesos y fiambres importados.", en: "Assorted imported cheeses and cured meats.", pt: "Sortido de queijos e enchidos importados." },
        price: "Bs 250",
        image: "/jaleo/tapas/tabla-que-mola.jpg",
      },
    ],
  },
  {
    key: "entradas",
    name: { es: "ENTRADAS", en: "STARTERS", pt: "ENTRADAS" },
    items: [
      {
        name: { es: "OSTIONES A LA PARMESANA", en: "OSTIONES A LA PARMESANA", pt: "OSTIONES A LA PARMESANA" },
        description: { es: "Ostiones gratinados con queso parmesano.", en: "Oysters gratinated with parmesan cheese.", pt: "Ostras gratinados com queijo parmesão." },
        price: "Bs 68",
        image: "/jaleo/entradas/ostiones-parmesana.jpg",
      },
      {
        name: { es: "BOQUERONES", en: "BOQUERONES", pt: "BOQUERONES" },
        description: { es: "Boquerones, crema de ají amarillo y alcaparras.", en: "Anchovies, yellow chili cream and capers.", pt: "Anchoas, creme de pimenta amarela e capers." },
        price: "Bs 58",
        image: "/jaleo/entradas/boquerones.jpg",
      },
      {
        name: { es: "AL LÍO", en: "AL LÍO", pt: "AL LÍO" },
        description: { es: "Pulpitos, calamarcetes a la plancha, espárragos, tirabeques y mole de romesco.", en: "Crispy calamari, grilled baby squid, asparagus, ladyfingers and romesco mole.", pt: "Coxinhas crocantes, lulas grelhadas, espargos, dedos de moça e molho de romesco." },
        price: "Bs 72",
        image: "/jaleo/entradas/al-lio.jpg",
      },
      {
        name: { es: "SALPICÓN JALEO", en: "SALPICÓN JALEO", pt: "SALPICÓN JALEO" },
        description: { es: "De paiche, camarones, almejas, con aguachile verde.", en: "Paiche, shrimp, clams, with green chili sauce.", pt: "Paiche, camarões, mexilhões, com molho de pimenta verde." },
        price: "Bs 65",
        image: "/jaleo/entradas/salpicon-jaleo.jpg",
      },
      {
        name: { es: "TIRADITO", en: "TIRADITO", pt: "TIRADITO" },
        description: { es: "De trucha ahumada, boquerones, chicharrón de su piel, palta, camote y ajíes.", en: "Smoked trout, anchovies, crunchy skin, avocado, sweet potato and chili peppers.", pt: "Truta defumada, anchoas, chicharrón de sua pele, abacate, batata-doce e pimentas." },
        price: "Bs 68",
        image: "/jaleo/entradas/tiradito.jpg",
      },
      {
        name: { es: "TARTÁR DE ATÚN", en: "TARTÁR DE ATÚN", pt: "TARTÁR DE ATÚN" },
        description: { es: "Dados de atún fresco, tuétano de res, bálsamo de ajonjolí, soya y emulsión de palta.", en: "Fresh tuna, beef bone marrow, sesame balm, soy and avocado emulsion.", pt: "Cubos de atún fresco, medulha de boi, bálsamo de gergelim, soja e emulsão de abacate." },
        price: "Bs 76",
        image: "/jaleo/entradas/tartar-atun.jpg",
      },
      {
        name: { es: "TARTÁR DE SOLOMILLO", en: "TARTÁR DE SOLOMILLO", pt: "TARTÁR DE SOLOMILLO" },
        description: { es: "Solomillo cortado al cuchillo, pan brioche y jarabe de bourbon.", en: "Hand-cut filet mignon, brioche bread and bourbon syrup.", pt: "Filet mignon cortado à mão, pão brioche e xarope de bourbon." },
        price: "Bs 58",
        image: "/jaleo/entradas/tartar-solomillo.jpg",
      },
      {
        name: { es: "CARPACCIO JALEO", en: "CARPACCIO JALEO", pt: "CARPACCIO JALEO" },
        description: { es: "Finos cortes de filete de res, rúcula, champiñones, jamón serrano, parmesano.", en: "Thinly sliced beef fillet, arugula, mushrooms, serrano ham, parmesan.", pt: "Finais cortes de filet de boi, rúcula, cogumelos, presunto serrano, parmesão." },
        price: "Bs 78",
        image: "/jaleo/entradas/carpaccio-jaleo.jpg",
      },
      {
        name: { es: "CARPACCIO DE PATO", en: "CARPACCIO DE PATO", pt: "CARPACCIO DE PATO" },
        description: { es: "Finos cortes de pato marinado, rúcula, parmesano, con reducción de aceto balsámico.", en: "Thinly sliced marinated duck, arugula, parmesan, with balsamic reduction.", pt: "Finais cortes de pato marinado, rúcula, parmesão, com redução de vinagre balsâmico." },
        price: "Bs 65",
        image: "/jaleo/entradas/carpaccio-pato.jpg",
      },
      {
        name: { es: "BURRATA EMPANIZADA", en: "BURRATA EMPANIZADA", pt: "BURRATA EMPANIZADA" },
        description: { es: "Burrata frita, tomates secos, salsa de tomate y rúcula.", en: "Fried burrata, sun-dried tomatoes, tomato sauce and arugula.", pt: "Burrata frita, tomates secos, molho de tomate e rúcula." },
        price: "Bs 89",
        image: "/jaleo/entradas/buratta-empanizada.jpg",
      },
      {
        name: { es: "ESPÁRRAGOS COJONUDO", en: "ESPÁRRAGOS COJONUDO", pt: "ESPÁRRAGOS COJONUDO" },
        description: { es: "Espárragos blancos XL, con jamón serrano, y salsa holandesa de mandarina.", en: "Extra-large white asparagus, with serrano ham, and mandarin hollandaise sauce.", pt: "Espargos brancos XL, com presunto serrano, e molho holandês de manga." },
        price: "Bs 56",
        image: "/jaleo/entradas/esparragos-cojonudo.jpg",
      },
    ],
  },
  {
    key: "ensaladas",
    name: { es: "ENSALADAS", en: "SALADS", pt: "ENSALADAS" },
    items: [
      {
        name: { es: "CESAR", en: "CESAR", pt: "CESAR" },
        description: { es: "Surtido de lechugas, pollo, tocino, crutones, anchoas, parmesano y salsa cesar.", en: "Mixed greens, chicken, bacon, croutons, anchovies, parmesan and Caesar dressing.", pt: "Salada de folhas, frango, bacon, croutons, anchoas, parmesão e molho caesar." },
        price: "Bs 64",
        image: "/jaleo/ensaladas/cesar.jpg",
      },
      {
        name: { es: "MEDITERRÁNEA", en: "MEDITERRÁNEA", pt: "MEDITERRÁNEA" },
        description: { es: "Surtido de lechugas, tomate seco, rúcula, aceitunas verdes, almendras, alcachofas, jamón serrano, parmesano con vinagreta de mostaza.", en: "Mixed greens, sun-dried tomato, arugula, green olives, almonds, artichokes, serrano ham, parmesan with mustard vinaigrette.", pt: "Salada de folhas, tomate seco, rúcula, azeitonas verdes, amêndoas, alcachofas, presunto serrano, parmesão com vinagrete de mostarda." },
        price: "Bs 74",
        image: "/jaleo/ensaladas/mediterranea.jpg",
      },
    ],
  },
  {
    key: "de-cuchara",
    name: { es: "DE CUCHARA", en: "SINGLE POT", pt: "DE COLHER" },
    items: [
      {
        name: { es: "CALLOS A LA MADRILEÑA", en: "CALLOS A LA MADRILEÑA", pt: "CALLOS A LA MADRILEÑA" },
        description: { es: "Guiso clásico madrileño: con callos, chorizo español, tocino y garbanzos.", en: "Classic Madrid stew: tripe, Spanish chorizo, bacon and chickpeas.", pt: "Ensopado clássico madrileño: tripas, chouriço espanhol, bacon e grão-de-bico." },
        price: "Bs 79",
        image: "/jaleo/de-cuchara/callos-madrilena.jpg",
      },
      {
        name: { es: "FABADA ASTURIANA", en: "FABADA ASTURIANA", pt: "FABADA ASTURIANA" },
        description: { es: "Chorizo asturiano ahumado, morcilla, panceta, judiones de la granja.", en: "Smoked Asturian chorizo, blood sausage, bacon, farm beans.", pt: "Chouriço asturiano defumado, morcela, bacon, feijões da fazenda." },
        price: "Bs 98",
        image: "/jaleo/de-cuchara/fabada-asturiana.jpg",
      },
      {
        name: { es: "SUQUET DE PEIX", en: "SUQUET DE PEIX", pt: "SUQUET DE PEIX" },
        description: { es: "Sopa contundente catalana con pescados y mariscos, tomate y patatas.", en: "Catalan fish stew with fish and seafood, tomato and potatoes.", pt: "Sopa catalã de peixe com peixes e mariscos, tomate e batatas." },
        price: "Bs 98",
        image: "/jaleo/de-cuchara/suquet-peix.jpg",
      },
    ],
  },
  {
    key: "pastas",
    name: { es: "PASTAS", en: "PASTAS", pt: "PASTAS" },
    items: [
      {
        name: { es: "CANELONS DA XAI TRUFATS", en: "CANELONS DA XAI TRUFATS", pt: "CANELONS DA XAI TRUFATS" },
        description: { es: "Pasta rellena de cordero a baja temperatura, con bechamel trufada y demi-glace.", en: "Pasta filled with slow-cooked lamb, truffle béchamel and demi-glace.", pt: "Massa recheada com cordeiro cozido a lenço, bechamel trufado e demi-glace." },
        price: "Bs 120",
        image: "/jaleo/pastas/canelons-trufats.jpg",
      },
      {
        name: { es: "TORTELLONI JALEO", en: "TORTELLONI JALEO", pt: "TORTELLONI JALEO" },
        description: { es: "Pasta de espinaca, rellena de pez espada, pasatta de camarones.", en: "Spinach pasta, filled with swordfish, shrimp pasatta.", pt: "Massa de espinafre, recheada com peixe-espada, pasatta de camarões." },
        price: "Bs 89",
        image: "/jaleo/pastas/tortelloni-jaleo.jpg",
      },
      {
        name: { es: "SORRENTINO DEL LAGO", en: "SORRENTINO DEL LAGO", pt: "SORRENTINO DEL LAGO" },
        description: { es: "Pasta rellena de ricotta, trucha ahumada, con crema al limón.", en: "Ricotta-filled pasta, smoked trout, with lemon cream.", pt: "Massa recheada com ricota, truta defumada, com creme de limão." },
        price: "Bs 94",
        image: "/jaleo/pastas/sorrentino-lago.jpg",
      },
      {
        name: { es: "LINGUINI DEL CANTABRICO NEGRO", en: "LINGUINI DEL CANTABRICO NEGRO", pt: "LINGUINI DEL CANTABRICO NEGRO" },
        description: { es: "Pasta negra con pulpo y tomate.", en: "Black pasta with octopus and tomato.", pt: "Massa preta com polvo e tomate." },
        price: "Bs 115",
        image: "/jaleo/pastas/linguini-negro.jpg",
      },
    ],
  },
  {
    key: "arroces-paellas",
    name: { es: "ARROCES Y PAELLAS", en: "RICES & PAELLAS", pt: "ARROZES Y PAELLAS" },
    items: [
      {
        name: { es: "ARROZ DEL SENYORET (DEL SEÑORITO)", en: "ARROZ DEL SENYORET", pt: "ARROZ DEL SENYORET" },
        description: { es: "Arroz bomba español, azafrán y surtido de mariscos.", en: "Spanish bomba rice, saffron and seafood mix.", pt: "Arroz bomba espanhol, açafrão e mariscos variados." },
        price: "Bs 140",
        image: "/jaleo/arroces-paellas/arroz-senyoret.jpg",
      },
      {
        name: { es: "PAELLA VALENCIANA", en: "PAELLA VALENCIANA", pt: "PAELLA VALENCIANA" },
        description: { es: "Arroz bomba español, azafrán, conejo, pollo, judiones, morrones y vainitas.", en: "Spanish bomba rice, saffron, rabbit, chicken, beans, bell peppers and green beans.", pt: "Arroz bomba espanhol, açafrão, coelho, frango, feijões, pimentos e vagem." },
        price: "Bs 150",
        image: "/jaleo/arroces-paellas/paella-valenciana.jpg",
      },
      {
        name: { es: "PAELLA MARINERA", en: "PAELLA MARINERA", pt: "PAELLA MARINERA" },
        description: { es: "Arroz bomba español, azafrán, mariscos.", en: "Spanish bomba rice, saffron, seafood.", pt: "Arroz bomba espanhol, açafrão, mariscos." },
        price: "Bs 150",
        image: "/jaleo/arroces-paellas/paella-marinera.jpg",
      },
      {
        name: { es: "PAELLA MIXTA", en: "PAELLA MIXTA", pt: "PAELLA MIXTA" },
        description: { es: "Arroz bomba español, azafrán, surtido de mariscos, carnes y verduras.", en: "Spanish bomba rice, saffron, seafood mix, meats and vegetables.", pt: "Arroz bomba espanhol, açafrão, mariscos variados, carnes e vegetais." },
        price: "Bs 140",
        image: "/jaleo/arroces-paellas/paella-mixta.jpg",
      },
      {
        name: { es: "PAELLA MARINERA 2.0", en: "PAELLA MARINERA 2.0", pt: "PAELLA MARINERA 2.0" },
        description: { es: "Clásica paella marinera con extra de mariscos.", en: "Classic seafood paella with extra seafood.", pt: "Paella de marisco clássica com extra de mariscos." },
        price: "Bs 185",
        image: "/jaleo/arroces-paellas/paella-marinera-2.jpg",
      },
      {
        name: { es: "ARROZ NEGRO", en: "ARROZ NEGRO", pt: "ARROZ NEGRO" },
        description: { es: "Arroz bomba español, tinta de calamar y calamares.", en: "Spanish bomba rice, squid ink and squid.", pt: "Arroz bomba espanhol, tinta de lula e lulas." },
        price: "Bs 145",
        image: "/jaleo/arroces-paellas/arroz-negro.jpg",
      },
      {
        name: { es: "FIDEUÁ", en: "FIDEUÁ", pt: "FIDEUÁ" },
        description: { es: "Fideos, azafrán, mariscos.", en: "Noodles, saffron, seafood.", pt: "Fios, açafrão, mariscos." },
        price: "Bs 140",
        image: "/jaleo/arroces-paellas/fideua.jpg",
      },
      {
        name: { es: "FIDEUA NEGRA", en: "FIDEUA NEGRA", pt: "FIDEUA NEGRA" },
        description: { es: "Fideos, camarones, tinta de calamar.", en: "Noodles, shrimp, squid ink.", pt: "Fios, camarões, tinta de lula." },
        price: "Bs 145",
        image: "/jaleo/arroces-paellas/fideua-negra.jpg",
      },
    ],
  },
  {
    key: "carnes",
    name: { es: "CARNES", en: "MEATS", pt: "CARNES" },
    items: [
      {
        name: { es: "POLLITO DE CORRAL A LA LEÑA", en: "POLLITO DE CORRAL A LA LEÑA", pt: "POLLITO DE CORRAL A LA LEÑA" },
        description: { es: "Medio pollo baby cocinado a la brasa con mojo de finas hierbas. Acompañado de patatas panaderas y espinacas al limón.", en: "Half baby chicken grilled over charcoal with herb mojo. Served with pan-fried potatoes and lemon spinach.", pt: "Meio frango bebê grelhado sobre carvão com molho de ervas finas. Servido com batatas fritas e espinafre de limão." },
        price: "Bs 85",
        image: "/jaleo/carnes/pollo-corral.jpg",
      },
      {
        name: { es: "POLLITO CAMPERO", en: "POLLITO CAMPERO", pt: "POLLITO CAMPERO" },
        description: { es: "Medio pollo baby, bañado con cremosa salsa de ají amarillo y hierbas. Acompañado de verduras a la robata.", en: "Half baby chicken, bathed in creamy yellow chili and herb sauce. Served with grilled vegetables.", pt: "Meio frango bebê, banhado em cremosa molho de pimenta amarela e ervas. Servido com vegetais grelhados." },
        price: "Bs 85",
        image: "/jaleo/carnes/pollo-campero.jpg",
      },
      {
        name: { es: "JARRETE", en: "JARRETE", pt: "JARRETE" },
        description: { es: "Pierna deshuesada cocinada 30 hrs a baja temperatura, con cremoso de patatas.", en: "Boneless leg of lamb slow-cooked for 30hrs, with creamy potatoes.", pt: "Perna desossada cozida a lenço por 30hrs, com purê de batatas." },
        price: "Bs 170",
        image: "/jaleo/carnes/jarrete.jpg",
      },
      {
        name: { es: "MAGRET DE PATO", en: "MAGRET DE PATO", pt: "MAGRET DE PATO" },
        description: { es: "Pechuga de pato, gastrique de maracuyá, zanahorias baby y vainitas.", en: "Duck breast, passion fruit gastrique, baby carrots and green beans.", pt: "Peito de pato, gastrique de maracujá, cenouras baby e vagem." },
        price: "Bs 89",
        image: "/jaleo/carnes/magret-pato.jpg",
      },
      {
        name: { es: "LOMITO NEGRO", en: "LOMITO NEGRO", pt: "LOMITO NEGRO" },
        description: { es: "Lomito al carbón, con camarones.", en: "Grilled beef tenderloin with shrimp.", pt: "Filé grelhado com camarões." },
        price: "Bs 94",
        image: "/jaleo/carnes/lomito-negro.jpg",
      },
      {
        name: { es: "OJO DE BIFE A LA PARRILLA", en: "OJO DE BIFE A LA PARRILLA", pt: "OJO DE BIFE A LA PARRILLA" },
        description: { es: "Ojo de bife, acompañado con papas fritas y ensalada.", en: "Ribeye, served with fries and salad.", pt: "Picanha, servido com batatas fritas e salada." },
        price: "Bs 95",
        image: "/jaleo/carnes/ojo-bife.jpg",
      },
    ],
  },
  {
    key: "pescados",
    name: { es: "PESCADOS", en: "SEAFOOD", pt: "PEIXES" },
    items: [
      {
        name: { es: "PEZ ESPADA", en: "PEZ ESPADA", pt: "PEZ ESPADA" },
        description: { es: "A la mantequilla y alcaparras, con puré.", en: "With butter and capers, with mashed potatoes.", pt: "Com manteiga e capers, com purê." },
        price: "Bs 96",
        image: "/jaleo/pescados/pez-espada.jpg",
      },
      {
        name: { es: "MERLUZA AL AJO ARRIERO", en: "MERLUZA AL AJO ARRIERO", pt: "MERLUZA AL AJO ARRIERO" },
        description: { es: "Merluza del pacífico, con ajo y ají, tomate. Acompañado con verduras.", en: "Pacific hake, with garlic and chili, tomato. Served with vegetables.", pt: "Hake do Pacífico, com alho e ají, tomate. Servido com vegetais." },
        price: "Bs 94",
        image: "/jaleo/pescados/merluza-ajo.jpg",
      },
      {
        name: { es: "MERLUZA A LA MARINERA", en: "MERLUZA A LA MARINERA", pt: "MERLUZA A LA MARINERA" },
        description: { es: "Merluza del pacífico, a la plancha, almejas y mejillones al vapor. Acompañado de cremosos de espinacas.", en: "Pacific hake, grilled, clams and mussels steamed. Served with spinach cream.", pt: "Hake do Pacífico, grelhado, mexilhões e mexilhões a vapor. Servido com creme de espinafre." },
        price: "Bs 98",
        image: "/jaleo/pescados/merluza-marinera.jpg",
      },
      {
        name: { es: "PAICHE RÍO Y MAR", en: "PAICHE RÍO Y MAR", pt: "PAICHE RÍO Y MAR" },
        description: { es: "Paiche amazónico cocinado a baja temperatura, con calamarcetes en su tinta, cremosos de guisantes y tirabeques.", en: "Amazonian paiche slow-cooked, with squid in ink, pea cream and ladyfingers.", pt: "Paiche amazônico cozido a lenço, com lulas na tinta, creme de ervilhas e dedos de moça." },
        price: "Bs 95",
        image: "/jaleo/pescados/paiche-rio-mar.jpg",
      },
      {
        name: { es: "TRUCHA A LA MEDIA SAL", en: "TRUCHA A LA MEDIA SAL", pt: "TRUCHA A LA MEDIA SAL" },
        description: { es: "Trucha al horno cocinada en sal de Uyuni y verduras asadas.", en: "Baked trout cooked in Uyuni salt with roasted vegetables.", pt: "Truta assada cozida em sal de Uyuni com vegetais assados." },
        price: "Bs 89",
        image: "/jaleo/pescados/trucha-sal.jpg",
      },
    ],
  },
];

export function pick<T extends { es: string; en: string; pt: string }>(field: T, lang: Lang) {
  return field[lang];
}
