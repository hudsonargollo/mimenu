# Manual do Sistema MiMenu & Especificações Técnicas

Este documento reúne todas as especificações funcionais, diretrizes visuais e operacionais da plataforma **MiMenu**.

---

## 1. Módulos do Sistema e Fluxos Operacionais

### 1.1 Cardápio Digital & Experiência do Cliente
- **Carregamento Instantâneo (PWA):** Execução 100% web sem necessidade de download na App Store ou Google Play.
- **Estrutura de Categorias:** Navegação ágil com scrollspy horizontal, drawer de categorias em tela cheia e pesquisa por texto livre de pratos e ingredientes.
- **Upsell & Maridagem Inteligente:** Gatilhos sugeridos ao adicionar um item ao carrinho (ex: bebidas artesanais, sobremesas e porções extras), impulsionando o ticket médio em até 24%.
- **Observações Específicas:** Campos de observação vinculados diretamente ao item escolhido (ex: ponto da carne, retirar cebola, molho à parte).
- **Cazador de Reseñas no Google Maps:** Ao concluir o pedido ou pedir a conta, avaliações 5 estrelas são canalizadas em um clique para o perfil do Google Maps do restaurante.

### 1.2 Copiloto por WhatsApp (IA Gastronômica)
- **Comandos Naturais:** O gerente ou dono envia uma mensagem de texto ou áudio (ex: *"Pausa as costelinhas porque acabaram"* ou *"Sobe o chopp para R$ 14 e ativa 2x1 em caipirinhas"*).
- **Sincronização em Tempo Real:** O Copiloto processa a instrução e reflete as alterações no cardápio público imediatamente.
- **Relatórios Flash:** Consultas de faturamento e itens mais vendidos por turno direto na conversa.

### 1.3 KDS (Kitchen Display System) & Impressão
- **Tela de Preparo em Tempo Real:** Visualização de comandas com diferenciação por cores conforme o tempo de espera.
- **Impressão Automática:** Integração com servidores de impressão térmica (PrintNode / WebSockets / USB) para comandas físicas no balcão e na cozinha.

### 1.4 Gestão de Mesas e QR Codes
- **QR Codes Dinâmicos:** Cada mesa possui seu identificador único. Pedidos feitos pela mesa chegam com localização exata e status da conta em aberto.
- **Divisão e Pagamento:** Suporte a divisão de comanda e pagamentos integrados via Pix, QR Simple ou cartão.

---

## 2. Padrões de Design & Anti-Slop Guidelines

Conforme as diretrizes das 132 skills de design instaladas (`taste-skill`, `ui-ux-pro-max`, `ui-styling`):

1. **Zero Em-Dashes:** É expressamente proibido o uso do caractere em-dash (`—`) em qualquer texto de interface ou marketing.
2. **Consistência Temática:** O tema escuro gastronômico é bloqueado no nível da raiz (`#07080B`) sem inversões repentinas de seção.
3. **Contraste e Acessibilidade:** Todos os botões de ação atendem aos critérios WCAG AA (4.5:1 para corpo e 3:1 para display).
4. **Motion com Propósito:** Toda animação utiliza propriedades de acelerador de hardware (`transform`, `opacity`) com curvas físicas (`motion/react` ou `framer-motion`).

---

## 3. Guia de Deploy & Variáveis de Ambiente

### Variáveis no Cloudflare Pages / Workers:
- `MIMENU_KV`: Binding do namespace KV que guarda meseros, tarefas AR e sessões.
- `APP_SESSION_SECRET`: Chave HMAC para assinatura das sessões de admin/garçom.
- `RESEND_API_KEY`: Envio de e-mails transacionais.
- `AR_WORKER_URL`, `AR_WORKER_TOKEN`, `MESHY_API_KEY`: Pipeline WebAR / 3D.
- `CLOUDFLARE_API_TOKEN`: Token de deploy para o GitHub Actions.

Não há banco de dados externo: cardápio, pedidos e clientes ficam no navegador
(`localStorage`) e o servidor usa apenas Cloudflare KV.

### Deploy Contínuo:
Todo commit enviado para a branch `mimenu` no repositório GitHub dispara automaticamente o workflow de testes, build de produção e publicação no Cloudflare Pages.
