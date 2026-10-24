# AtendeFlow

Sistema moderno de gestão de solicitações e atendimento, projetado com uma experiência simples, eficiente, responsiva e acessível.

---

## 🎨 Identidade Visual e Design System

O projeto adota o **Design System oficial do AtendeFlow** baseado no arquivo de referência `Painel de Design AtendeFlow.png`:

### 1. Cores
- **Primária:** `#18324A` (Azul profundo — cabeçalhos, barras laterais, botões principais)
- **Secundária:** `#14B8A6` (Verde-água — destaques, badges e indicadores de progresso)
- **Fundo:** `#F8FAFC` (Plano de fundo da aplicação)
- **Superfície:** `#FFFFFF` (Cards, tabelas, modais e formulários)
- **Texto Principal:** `#0F172A` (Títulos e conteúdo de alta ênfase)
- **Texto Secundário:** `#64748B` (Subtítulos, legendas e rótulos auxiliares)
- **Bordas:** `#E2E8F0` (Linhas divisórias e contornos de inputs/cards)
- **Perigo:** `#EF4444` (Ações destrutivas e alertas de erro)
- **Sucesso:** `#22C55E` (Confirmações e resoluções)
- **Atenção:** `#F59E0B` (Demandas em andamento e avisos)
- **Info:** `#3B82F6` (Solicitações abertas e comunicados)

### 2. Tipografia
- Família tipográfica: **Inter** (com fallback sans-serif moderno)
- **Título 1:** 32px / Bold (700)
- **Título 2:** 24px / Semibold (600)
- **Título 3:** 20px / Semibold (600)
- **Texto:** 16px / Regular (400)
- **Texto pequeno:** 14px / Regular (400)
- **Legenda:** 12px / Regular (400)

### 3. Escala e Formas
- **Espaçamentos:** 4px, 8px, 12px, 16px, 24px e 32px
- **Raios de Borda:** 8px a 12px para cards, modais e inputs; 9999px (pill) para badges e tags
- **Ícones:** Lucide Icons (`lucide-vue-next`)

---

## 📱 Páginas Principais

O sistema mantém estritamente 3 páginas centrais:

1. **Dashboard (`/`):**
   - Indicadores numéricos (`StatCard`) para Total, Em andamento, Resolvidas e Tempo médio.
   - Gráfico Donut SVG de status com legenda detalhada.
   - Lista dinâmica de solicitações recentes com atalho para a listagem completa.
   - Filtro por período (7, 15, 30 e 90 dias).

2. **Solicitações (`/solicitacoes`):**
   - Barra de busca dinâmica e filtros por status, prioridade e categoria.
   - Tabela de dados (`DataTable`) com paginação responsiva.
   - Modal de criação e edição com validação em tempo real.
   - Diálogo acessível de confirmação de exclusão (`ConfirmDialog`).

3. **Acesso (`/login` e `/acesso`):**
   - Painel dividido com apresentação institucional em azul profundo e benefícios visuais.
   - Abas integradas de **Entrar** e **Cadastrar** na mesma tela.
   - Campos com ícones, suporte a lembrar senha e botão corporativo com Google.

---

## 🧩 Componentes Reutilizáveis

Os componentes seguem a Vue 3 Composition API com TypeScript e estão localizados em `client/src/components/`:

- `AppLayout`: Shell estrutural com sidebar colapsável e header superior.
- `AppSidebar`: Navegação lateral azul profundo com logotipo e links de rotas.
- `AppHeader`: Barra superior com campo de busca global, sininho de notificações e menu do usuário.
- `BaseButton`: Botão com variantes (`primary`, `secondary`, `outline`, `danger`, `ghost`), tamanhos (`sm`, `md`, `lg`) e estado de carregamento.
- `BaseInput`: Campo de texto com suporte a ícones, mensagens de erro e validações.
- `BaseSelect`: Seletor de opções com chevron e foco visual consistente.
- `StatusBadge`: Tag com borda arredondada e estilos específicos para cada status e prioridade.
- `StatCard`: Cartão de métricas estatísticas com barras coloridas e badges percentuais.
- `DataTable`: Tabela completa com paginação e slots customizados.
- `EmptyState`: Apresentação amigável quando nenhum registro é encontrado.
- `LoadingState`: Indicador giratório com mensagem de carregamento.
- `ConfirmDialog`: Modal de confirmação para ações críticas (ex: exclusão).
- `ToastNotification`: Sistema de notificações temporárias flutuantes integrado via Pinia (`useToastStore`).

---

## 📁 Estrutura do Projeto

```text
AtendeFlow/
├── client/                     # Frontend Vue 3 + TypeScript + Vite
│   ├── src/
│   │   ├── assets/styles/      # Centralização do Design System
│   │   │   ├── tokens.css      # Variáveis de cor, tipografia e espaçamento
│   │   │   └── global.css      # Estilos globais e resets
│   │   ├── components/         # Biblioteca de componentes do Design System
│   │   ├── router/             # Rotas com lazy loading e guarda de autenticação
│   │   ├── stores/             # Gerenciamento de estado (auth, requests, toast)
│   │   ├── types/              # Tipagens TypeScript compartilhadas
│   │   ├── utils/              # Cliente HTTP e utilitários
│   │   ├── views/              # As 3 telas principais (Dashboard, Requests, Login)
│   │   ├── App.vue             # Raiz da aplicação com container de Toasts
│   │   └── main.ts             # Ponto de entrada
│   └── tests/                  # Testes unitários de componentes com Vitest
├── server/                     # Backend API Express + TypeScript + SQLite
│   ├── src/                    # Controladores, rotas, schemas Zod e banco de dados
│   └── tests/                  # Testes da API
├── Painel de Design AtendeFlow.png # Referência visual de alta fidelidade
└── package.json                # Monorepo workspaces (client e server)
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** >= 18 (testado e validado no Node.js v24)
- **npm** >= 9

### Instalação e Execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o ambiente de desenvolvimento (API + Frontend simultâneos):**
   ```bash
   npm run dev
   ```
   - Frontend disponível em: **http://localhost:5173**
   - API disponível em: **http://localhost:3000**

3. **Executar a suíte de testes:**
   ```bash
   npm test
   ```

4. **Executar a análise de lint:**
   ```bash
   npm run lint
   ```

5. **Construir para produção:**
   ```bash
   npm run build
   ```
