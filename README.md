# MiMenu — Sistema Operacional & Cardápio Digital Inteligente para Gastronomia

> Plataforma multi-tenant de cardápios digitais, pedidos em mesa via QR Code, delivery direto com 0% de comissão, KDS de cozinha, copiloto IA e CRM gastronômico.

---

## 🎯 Visão Geral & Proposta de Valor

**MiMenu** (`mimenu.clubemkt.digital` / `mimenu.clubemkt.online`) é a solução completa para restaurantes, bares, cervejarias, hamburguerias e redes gastronômicas venderem diretamente aos seus clientes, mantendo 100% do faturamento sem pagar comissões para plataformas agregadoras.

- **0% de Comissão:** Mensalidade fixa sem cobranças percentuais por pedido.
- **Link Próprio Fixo:** Endereço exclusivo (`mimenu.clubemkt.digital/loja/suamarca`) para Instagram, TikTok e WhatsApp.
- **Operação Unificada em 1 Tela:** Do pedido na mesa ou delivery até o KDS da cozinha e fechamento do caixa.
- **Copiloto IA:** Administração da carta e pausas de estoque em tempo real por chat.
- **Base de Clientes 100% Própria:** CRM integrado com histórico de consumo, ticket médio e fidelização.

---

## 🏗️ Arquitetura dos 6 Hubs Operacionais

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MIMENU GASTRONOMIC OS                           │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ 1. CARDÁPIO      │ 2. COZINHA (KDS) │ 3. DELIVERY/MESA │ 4. BALCÃO     │
│  • Fotos otimiz. │  • Tela cheia    │  • Taxa por zona │  • Lançamento │
│  • Upsell (+22%) │  • Impressão     │  • QR por mesa   │    express    │
│  • Preço riscado │  • Tempo cocção  │  • Motoboy sync  │  • PDV rápido │
├──────────────────┴──────────────────┴──────────────────┴───────────────┤
│ 5. PAGAMENTOS INTEGRADOS            │ 6. GESTÃO & CRM GASTRONÔMICO     │
│  • Pix automático & QR Simple       │  • Faturamento e ticket médio    │
│  • Cartão no checkout e troco       │  • Exportação e fidelização      │
└─────────────────────────────────────┴──────────────────────────────────┘
```

1. **Cardápio Inteligente:** Categorias, fotos em cache ultra-rápidas para 3G, complementos obrigatórios (ponto da carne, borda recheada), itens esgotados (86) sem sumir da lista e maridagem com IA (+22% no ticket).
2. **KDS de Cozinha & Barra:** Interface touch em tela cheia com fila de comandas, tempos de preparo, alertas sonoros e impressão térmica automática.
3. **Delivery & Mesa:** Cálculo automatizado de taxa de entrega por bairro ou raio, despacho de entregador e comanda expressa na mesa com QR Code único.
4. **Balcão & Caixa:** Lançamento ágil em menos de 10 segundos para pedidos presenciais ou recebidos por telefone.
5. **Pagamentos Integrados:** Pix automático instantâneo, cartões de crédito/débito online ou maquininha/dinheiro na entrega.
6. **Gestão & CRM:** Inteligência de faturamento, horários de pico, produtos de alta rotatividade e histórico completo de clientes.

---

## 🎨 Design System & Awwwards-Grade UI/UX

A plataforma adota o framework unificado de alta fidelidade visual compilado a partir de 132 skills de design (`taste-skill`, `designer-skills`, `gzh-design-skill`, `ui-skills`):

- **Paleta de Cores:** Fundo Obsidian Profundo (`#07080B`), Superfícies em Vidro Tátil (`backdrop-blur-xl`), Acento Âmbar Gastronômico (`#F59E0B` / `#D97706`), e contrastes WCAG AA.
- **Os 3 Dials de Design:** `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 7`, `VISUAL_DENSITY: 4`.
- **Motion & Performance:** Animações baseadas estritamente em propriedades de compositor (`transform`, `opacity`) com física de molas (`framer-motion`), sem layout thrashing.
- **Tipografia:** Hierarquia com entrelinhamento amplo (`1.75–1.9`), tracking comprimido em títulos (`-0.03em`), sem em-dashes (`—`).

---

## 📱 Rotas e Módulos Principais

| Rota | Descrição |
| :--- | :--- |
| `/` & `/cardapio-digital` | Landing page oficial com oferta Cardápio Gênio AI (0% comissão, Raio-X operacional, calculadora ROI e planos). |
| `/saas` | Landing page técnica avançada com simulador do Copiloto IA e Bento Grid de 8 módulos. |
| `/onboarding` | Wizard interativo em 5 passos para novos restaurantes configurarem sua loja. |
| `/menu` | Experiência de cardápio digital para o comensal com carrinho express, fotos e maridagem. |
| `/kds` & `/kitchen` | Tela cheia da cozinha com fila de preparo e tempos em tempo real. |
| `/cashier` | Ponto de venda e controle de comandas para o operador de caixa. |
| `/admin` | Painel administrativo unificado de produtos, categorias, mesas e faturamento. |
| `/admin/ai` | Copiloto conversacional gastronômico para controle por linguagem natural. |

---

## 🚀 Deploy & Infraestrutura

- **Build Tool:** Vite + React 18 + TypeScript + Tailwind CSS
- **Edge Runtime:** Cloudflare Workers / Cloudflare Pages
- **Domínios Ativos:** `mimenu.clubemkt.digital`, `mimenu.clubemkt.online`
- **CI/CD:** GitHub Actions configurado para deploy automático na branch `mimenu` via `.github/workflows/deploy.yml`.

### Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar ambiente de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar testes
npm run test:run
```

---

## 🔒 Regra de Isolamento do Projeto
Este repositório (`/root/ClubeMkt/mimenu`) opera estritamente como um produto SaaS multi-tenant independente da marca **MiMenu**, com branch dedicada `mimenu` e domínios próprios `mimenu.clubemkt.digital`.
