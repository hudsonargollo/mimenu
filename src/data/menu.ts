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

export const menu: MenuCategory[] = [
  {
    key: "entradas",
    name: { es: "Entradas", en: "Starters", pt: "Entradas" },
    items: [
      {
        name: { es: "Cuñapé de Queso (6 unidades)", en: "Cuñapé Cheese Bread (6 pcs)", pt: "Cuñapé de Queijo (6 unid.)" },
        description: { es: "Recién horneados, crocantes por fuera y esponjosos por dentro", en: "Freshly baked, crunchy outside and fluffy inside", pt: "Recém-assados, crocantes por fora e fofos por dentro" },
        price: "Bs 18",
        image: "/menu/cunape.jpg",
      },
      {
        name: { es: "Salteña de Carne Picante", en: "Spicy Beef Salteña", pt: "Empanada Salteña de Carne Picante" },
        description: { es: "Jugosa, con ají cruceño y papa del oriente — el doble de picante si lo pides", en: "Juicy, with cruceño chili and lowland potato — double the spice if you ask", pt: "Suculenta, com ají cruceño e batata do oriente — mais picante se preferir" },
        price: "Bs 15",
        image: "/menu/saltena.jpg",
      },
      {
        name: { es: "Anticuchos de Corazón con Llajwa", en: "Beef Heart Anticucho with Llajwa", pt: "Anticuchos de Coração com Llajwa" },
        description: { es: "Brocheta al carbón con ají de llajwa picante y mote", en: "Charcoal skewer with spicy llajwa sauce and mote", pt: "Espetinho na brasa com llajwa picante e mote" },
        price: "Bs 25",
        image: "/menu/anticuchos.jpg",
      },
      {
        name: { es: "Empanadas de la Bahía (3 unidades)", en: "Bahía Empanadas (3 pcs)", pt: "Empanadas de la Bahía (3 unid.)" },
        description: { es: "Carne picada, aceituna y huevo con pasas — clásico reinterpretado por la casa", en: "Minced beef, olive and egg with raisins — a classic house take", pt: "Carne picada, azeitona e ovo com passas — clássico da casa" },
        price: "Bs 20",
        image: "/menu/empanadas-bahia.jpg",
      },
    ],
  },
  {
    key: "piqueos",
    name: { es: "Piqueos Para Compartir", en: "Sharing Platters", pt: "Piqueos Para Compartir" },
    items: [
      {
        name: { es: "Pique Macho Moe's", en: "Moe's Pique Macho", pt: "Pique Macho Moe's" },
        description: { es: "Lomo a la plancha, salchichas, locoto criollo, huevo frito y papas estéreo en montaña abundante", en: "Grilled beef strips, sausage, locoto pepper, fried egg and stereo fries in an abundant mountain", pt: "Lomo na chapa, salsichas, pimenta locoto, ovo frito e batatas em montanha generosa" },
        price: "Bs 65",
        image: "/menu/pique-macho.jpg",
      },
      {
        name: { es: "Silpancho Cruceño", en: "Cruceño Silpancho", pt: "Silpancho Cruceño" },
        description: { es: "Milanesa de res con arroz, papas fritas, huevo y ensalada fresca", en: "Beef milanese with rice, fries, fried egg and fresh salad", pt: "Bife à milanês com arroz, batata frita, ovo e salada fresca" },
        price: "Bs 55",
        image: "/menu/silpancho.jpg",
      },
      {
        name: { es: "Chicharrón con Mote", en: "Pork Chicharrón with Mote", pt: "Chicharrón com Mote" },
        description: { es: "Cerdo dorado crocante con mote, papas y ensalada — el especial de los domingos", en: "Crispy golden pork with mote, potatoes and salad — Sunday specialist", pt: "Porco crocante dourado com mote, batatas e salada — especial de domingo" },
        price: "Bs 50",
        image: "/menu/chicharron.jpg",
      },
      {
        name: { es: "Salchipapa Moe's Monster", en: "Moe's Monster Salchipapa", pt: "Salchipapa Monstro Moe's" },
        description: { es: "450g de papas rústicas, doble salchicha ahumada, tocino crocante y queso cheddar fundido con salsa de ajo secreta", en: "450g of rustic fries, double smoked sausage, crispy bacon, melted cheddar and secret garlic sauce", pt: "450g de batatas rústicas, dupla salsicha defumada, bacon crocante, cheddar derretido e molho de alho secreto" },
        price: "Bs 45",
        image: "/menu/salchipapa-monster.jpg",
      },
      {
        name: { es: "Majao Tradicional Beniano", en: "Traditional Beniano Majao", pt: "Majado Tradicional Beniano" },
        description: { es: "Arroz con charaque, majas de yuca, carne seca y plátano maduro frito", en: "Charaque rice, mashed yuca, dried beef and fried ripe plantain", pt: "Arroz com charaque, mandioca amassada, carne-seca e banana frita" },
        price: "Bs 45",
        image: "/menu/majao.jpg",
      },
    ],
  },
  {
    key: "para-compartir",
    name: { es: "Para 2 Personas", en: "Serves 2", pt: "Para 2 Pessoas" },
    items: [
      {
        name: { es: "Parrillada Cruceña para 2", en: "Cruceño Grill for 2", pt: "Churrasqueira Cruceña para 2" },
        description: { es: "Charque, chorizo parrillero beniano, chuleta ahumada, morcilla y majao para acompañar", en: "Charque, beniano grill chorizo, smoked chop, blood sausage and majao on the side", pt: "Charque, linguiça beniana, costela defumada, morcilla e majado de acompanhamento" },
        price: "Bs 180",
        image: "/menu/parrillada.jpg",
      },
      {
        name: { es: "Tabla del Oriente Moe's", en: "Moe's Oriente Board", pt: "Tábua do Oriente Moe's" },
        description: { es: "Surtido de la casa: cuñapé, anticuchos, empanadas de la bahía, ají con queso y llajwa", en: "House platter: cuñapé, anticuchos, Bahía empanadas, cheese chili and llajwa", pt: "Tábua da casa: cuñapé, anticuchos, empanadas de la Bahía, ají com queijo e llajwa" },
        price: "Bs 90",
        image: "/menu/tabla-oriente.jpg",
      },
      {
        name: { es: "Picante de Pollo para 2", en: "Chicken Picante for 2", pt: "Picante de Frango para 2" },
        description: { es: "Ají colorado boliviano con pollo, arroz grano grande, papas y huevo — picante en su punto", en: "Bolivian ají colorado style chicken with rice, potatoes and egg — just the right heat", pt: "Frango no ají colorado boliviano com arroz, batatas e ovo — picância na medida" },
        price: "Bs 120",
        image: "/menu/picante-pollo.jpg",
      },
    ],
  },
  {
    key: "kids",
    name: { es: "Menú Kids", en: "Kids Menu", pt: "Menu Kids" },
    items: [
      {
        name: { es: "Milanesa Kids con Papas", en: "Kids Milanese with Fries", pt: "Bife à Milanesa Kids com Batatas" },
        description: { es: "Milanesita de pollo empanada con papas doradas y refresco", en: "Breaded chicken milanese with golden fries and soda", pt: "Frango empanado com batatas douradas e refresco" },
        price: "Bs 35",
        image: "/menu/kids-milanesa.jpg",
      },
      {
        name: { es: "Salchipapa Mini", en: "Mini Salchipapa", pt: "Salchipapa Mini" },
        description: { es: "Porción infantil de papas y salchicha con salsas suaves", en: "Kid-sized fries and sausage with mild sauces", pt: "Porção infantil de batatas com salsicha e molhos suaves" },
        price: "Bs 30",
        image: "/menu/kids-salchipapa.jpg",
      },
      {
        name: { es: "Nuggets & Mocochinchi Kids", en: "Nuggets & Mocochinchi Kids", pt: "Nuggets & Mocochinchi Kids" },
        description: { es: "5 nuggets caseros con mocochinchi bien helado", en: "5 homemade nuggets with ice-cold mocochinchi", pt: "5 nuggets caseiros com mocochinchi bem gelado" },
        price: "Bs 32",
        image: "/menu/kids-nuggets.jpg",
      },
    ],
  },
  {
    key: "postres",
    name: { es: "Postres", en: "Desserts", pt: "Sobremesas" },
    items: [
      {
        name: { es: "Helado de Queso con Dulce de Membrillo", en: "Cheese Ice Cream with Quince Paste", pt: "Sorvete de Queijo com Doce de Marmelo" },
        description: { es: "Helado artesanal cruceño con dulce de membrillo calentito", en: "Artisan cruceño ice cream with warm quince paste", pt: "Sorvete artesanal cruceño com doce de marmelo morninho" },
        price: "Bs 25",
        image: "/menu/helado-queso.jpg",
      },
      {
        name: { es: "Coctel de Tumbo & Leche", en: "Tumbo Custard", pt: "Coquetel de Tumbo & Leite" },
        description: { es: "Cremoso de tumbo oriental con galleta de maíz", en: "Andean tumbo custard with corn cookie", pt: "Cremoso de tumbo oriental com biscoito de milho" },
        price: "Bs 20",
        image: "/menu/tumbo-cream.jpg",
      },
      {
        name: { es: "Mazamorra de Maíz", en: "Corn Mazamorra", pt: "Mazamorra de Milho" },
        description: { es: "Postre andino caliente con canela y panela", en: "Warm Andean dessert with cinnamon and panela", pt: "Doce andino morninho com canela e panela" },
        price: "Bs 18",
        image: "/menu/mazamorra.jpg",
      },
      {
        name: { es: "Frituras Dulces de la Casa", en: "House Sweet Fritters", pt: "Frituras Doces da Casa" },
        description: { es: "Sombreritos y alfajores de maicena, para cerrar la noche bien", en: "Sombreritos and cornstarch alfajores to close the night right", pt: "Sombreritos e alfajores de maicena para fechar a noite" },
        price: "Bs 22",
        image: "/menu/frituras-dulces.jpg",
      },
    ],
  },
  {
    key: "drinks-autorales",
    name: { es: "Cocteles de Autor Moe's", en: "Moe's Signature Cocktails", pt: "Drinks Autorais Moe's" },
    items: [
      {
        name: { es: "Yungueñito Moe's", en: "Moe's Yungueñito", pt: "Yungueñito Moe's" },
        description: { es: "Singani Casa Real, coca, limón y azúcar — el ritual del oriente en vaso helado", en: "Casa Real singani, coca leaf, lime and sugar — the lowland ritual in a frosty glass", pt: "Singani Casa Real, folha de coca, limão e açúcar — o ritual do oriente em copo gelado" },
        price: "Bs 45",
        image: "/menu/yunguenito.jpg",
      },
      {
        name: { es: "Chilé de la Casa", en: "House Chilé", pt: "Chilé da Casa" },
        description: { es: "50% Singani, 50% Coca-Cola bien helada con hielo frappé", en: "50% Singani, 50% ice-cold Coke with crushed ice", pt: "50% Singani, 50% Coca-Cola bem gelada com gelo frappé" },
        price: "Bs 35",
        image: "/menu/chile.jpg",
      },
      {
        name: { es: "Figurona de Singani", en: "Singani Figurona", pt: "Figurona de Singani" },
        description: { es: "Singani, maracuyá fresca, espuma de tónica y romero perfumado", en: "Singani, fresh passion fruit, tonic foam and rosemary", pt: "Singani, maracujá fresco, espuma de tônica e alecrim" },
        price: "Bs 40",
        image: "/menu/figurona.jpg",
      },
      {
        name: { es: "Mocochinchi Sour", en: "Mocochinchi Sour", pt: "Mocochinchi Sour" },
        description: { es: "Nuestro mocochinchi casero de la casa con singani y espuma de limón", en: "Our house-made mocochinchi with singani and lime foam", pt: "Nosso mocochinchi caseiro com singani e espuma de limão" },
        price: "Bs 38",
        image: "/menu/mocochinchi-sour.jpg",
      },
      {
        name: { es: "Caipirinha de Maracuyá", en: "Passion Fruit Caipirinha", pt: "Caipirinha de Maracujá" },
        description: { es: "Caña de origen o cachaça brasileña con pulpa de maracuyá fresca y hielo picado", en: "Cane spirit or Brazilian cachaça with fresh passion fruit pulp and crushed ice", pt: "Cachaça brasileira com polpa de maracujá fresca e gelo picado" },
        price: "Bs 30",
        image: "/menu/caipirinha-maracuya.jpg",
      },
    ],
  },
  {
    key: "drinks-clasicos",
    name: { es: "Cócteles Clásicos", en: "Classic Cocktails", pt: "Drinks Clássicos" },
    items: [
      {
        name: { es: "Fernet con Coca (Jarra 1L)", en: "Fernet with Coke (1L Pitcher)", pt: "Fernet com Coca (Jarra 1L)" },
        description: { es: "70% Coca-Cola fría, 30% Fernet Branca y abundante hielo frappé — el sagrado cruceño", en: "70% ice-cold Coke, 30% Fernet Branca and plenty of crushed ice — the cruceño sacred mix", pt: "70% Coca-Cola gelada, 30% Fernet Branca e gelo frappé — o clássico cruceño" },
        price: "Bs 35",
        image: "/menu/fernet.jpg",
      },
      {
        name: { es: "Cuba Libre Clásico", en: "Classic Cuba Libre", pt: "Cuba Libre Clássico" },
        description: { es: "Ron añejo, Coca-Cola y toque de limón sutil", en: "Aged rum, Coke and a subtle lime touch", pt: "Rum añejo, Coca-Cola e toque de limão sutil" },
        price: "Bs 30",
        image: "/menu/cuba-libre.jpg",
      },
      {
        name: { es: "Mojito de Menta Fresca", en: "Fresh Mint Mojito", pt: "Mojito de Menta Fresca" },
        description: { es: "Ron blanco, hierbabuena machacada, azúcar morena, limón y soda con hielo frappé", en: "White rum, muddled mint, brown sugar, lime and soda with crushed ice", pt: "Rum branco, hortelã macerada, açúcar mascavo, limão e soda com gelo picado" },
        price: "Bs 32",
        image: "/menu/mojito.jpg",
      },
      {
        name: { es: "Gin Tonic Pepino & Romero", en: "Cucumber & Rosemary Gin Tonic", pt: "Gin Tônica Pepino & Alecrim" },
        description: { es: "Gin destilado, agua tónica premium, rodajas de pepino y ramita de romero", en: "Distilled gin, premium tonic water, cucumber slices and a rosemary sprig", pt: "Gin destilado, água tônica premium, rodajas de pepino e alecrim" },
        price: "Bs 36",
        image: "/menu/gin-tonic.jpg",
      },
    ],
  },
  {
    key: "cervezas",
    name: { es: "Cervezas & Chopp", en: "Beers & Draft", pt: "Cervezas & Chopp" },
    items: [
      {
        name: { es: "Chopp Artesanal Moe's (500ml)", en: "Moe's Draft Beer (500ml)", pt: "Chopp Artesanal Moe's (500ml)" },
        description: { es: "Rubia o roja estilo Amber Ale, servida en tarro de vidrio escarchado al instante", en: "Blond or red Amber Ale style, served instantly in a frosted glass", pt: "Pilsen ou Amber Ale servida na hora em tarro de vidro escarchado" },
        price: "Bs 25",
        image: "/menu/chopp.jpg",
      },
      {
        name: { es: "Cerveza Huari Tradicional (620ml)", en: "Huari Traditional Lager (620ml)", pt: "Cerveza Huari Tradicional (620ml)" },
        description: { es: "La cerveza premium de Bolivia, maltas seleccionadas y agua de vertiente andina", en: "Bolivia's premium beer, selected malts and Andean spring water", pt: "A cerveza premium da Bolívia, malte selecionado e água de vertiente andina" },
        price: "Bs 28",
        image: "/menu/huari.jpg",
      },
      {
        name: { es: "Paceña Pilsener Helada (620ml)", en: "Paceña Pilsener Ice-Cold (620ml)", pt: "Paceña Pilsener Gelada (620ml)" },
        description: { es: "La reina de las noches bolivianas, bien fría a punto de nieve", en: "The queen of Bolivian nights, ice cold to perfection", pt: "A rainha das noites bolivianas, gelada até o ponto de neve" },
        price: "Bs 24",
        image: "/menu/pacena.jpg",
      },
      {
        name: { es: "Corona Extra con Limón (355ml)", en: "Corona Extra with Lime (355ml)", pt: "Corona Extra com Limão (355ml)" },
        description: { es: "Cerveza importada servida con gajo de limón sutil en el cuello", en: "Imported beer served with a lemon wedge on the neck", pt: "Cerveza importada servida com gajo de limão no gargalo" },
        price: "Bs 22",
        image: "/menu/corona.jpg",
      },
      {
        name: { es: "Balde Cervecero 5 Paceñas (620ml)", en: "Beer Bucket 5 Paceñas (620ml)", pt: "Balde Com 5 Paceñas (620ml)" },
        description: { es: "Balde con 5 Paceñas sumergidas en hielo frappé para compartir con el grupo", en: "Bucket with 5 Paceñas in crushed ice to share with the group", pt: "Balde com 5 Paceñas no gelo frappé para dividir com o grupo" },
        price: "Bs 105",
        image: "/menu/balde.jpg",
      },
    ],
  },
  {
    key: "sin-alcohol",
    name: { es: "Bebidas Sin Alcohol", en: "Non-Alcoholic Drinks", pt: "Bebidas sem Álcool" },
    items: [
      {
        name: { es: "Mocochinchi Casero", en: "House Mocochinchi", pt: "Mocochinchi Caseiro" },
        description: { es: "Durazno seco macerado con cáscara de naranja y canela, bien helado", en: "Sun-dried duranzo peach brewed with orange peel and cinnamon, served ice cold", pt: "Pêssego duranzo macerado com casca de laranja e canela, gelado" },
        price: "Bs 12",
        image: "/menu/mocochinchi.jpg",
      },
      {
        name: { es: "Refresco de Tumbo", en: "Tumbo Refresher", pt: "Refresco de Tumbo" },
        description: { es: "Tumbo oriental exprimido al momento, con hielo frappé y un toque de hierbaluisa", en: "Freshly squeezed lowland tumbo with crushed ice and a hint of lemon verbena", pt: "Tumbo oriental espremido na hora, com gelo frappé e um toque de erva-luiza" },
        price: "Bs 15",
        image: "/menu/refresco-tumbo.jpg",
      },
      {
        name: { es: "Agua Mineral sin Gas", en: "Still Mineral Water", pt: "Água Mineral sem Gás" },
        description: null,
        price: "Bs 7",
        image: "/menu/agua.jpg",
      },
      {
        name: { es: "Jugo Natural del Día", en: "Fresh Juice of the Day", pt: "Suco Natural do Dia" },
        description: { es: "Pregunta por los frutos frescos del día: mora, tumbo o melón", en: "Ask for today's fresh fruit: blackberry, tumbo or melon", pt: "Pergunte pelas frutas frescas do dia: mora, tumbo ou melón" },
        price: "Bs 15",
        image: "/menu/jugo.jpg",
      },
    ],
  },
];

export function pick<T extends { es: string; en: string; pt: string }>(field: T, lang: Lang) {
  return field[lang];
}
