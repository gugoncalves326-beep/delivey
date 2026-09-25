# Plataforma de Delivery Multiempresa — Etapa 1: Fundação

Fundação multi-tenant segura, escalável e visualmente consistente.
Nada além do escopo desta etapa foi implementado (sem carrinho, checkout,
Mercado Pago, mapa, notificações etc. — ver seção 23 do briefing original).

## Stack

Next.js 14 (App Router) + TypeScript + Supabase (Postgres/Auth/Storage) +
Tailwind CSS, preparado para deploy na Vercel.

## O que foi criado nesta etapa

**Banco de dados** (`supabase/schema.sql`):
- Tabelas: `profiles`, `companies`, `company_users`, `categories`, `products`,
  `customers`, `addresses`, `orders`, `order_items`, `payments`,
  `store_settings`, `platform_settings`.
- Toda tabela dependente de empresa tem `company_id`.
- RLS habilitado em **todas** as tabelas.
- Funções `current_user_role()`, `is_adm_supremo()`, `user_company_ids()`
  usadas nas políticas (nunca confiam em dados vindos do frontend).
- Trigger que cria `profiles` automaticamente ao registrar um usuário
  (papel padrão `cliente`).
- `platform_settings` já populado com comissão fixa de R$ 1,00.

**Autenticação e autorização**:
- `src/middleware.ts` protege `/admin/*` e `/dashboard/*`, redirecionando
  quem não tem sessão ou tem o papel errado.
- `src/lib/supabase/{client,server,middleware}.ts` — clients Supabase
  para browser, Server Components e middleware.
- `src/lib/auth/roles.ts` — tipo `UserRole` e helper de redirecionamento
  por papel.

**Rotas criadas**:
- `/` — redireciona conforme o papel do usuário logado.
- `/admin` — dashboard do ADM_SUPREMO (layout com sidebar + topbar).
- `/dashboard` — dashboard do DONO_DA_LOJA (layout com sidebar + topbar).
- `/loja/[slug]` — estrutura visual inicial do site público (mock, sem
  dados reais).

**Design system** (`src/styles/globals.css` + `tailwind.config.ts`):
- Tokens centralizados como CSS variables — nenhuma cor solta nos
  componentes.
- Paleta do painel (preto/grafite, roxo, dourado) exatamente conforme
  especificado.
- Paleta separada para o site público (`--store-*`), pensada para ser
  configurável por empresa numa etapa futura.
- Componentes reutilizáveis: `Card`, `Badge`, `Button`, `EmptyState`,
  `LoadingState`, `StatCard`, sidebars e topbars de admin/dashboard.

**Ainda não implementado** (fora do escopo desta etapa): tela de login,
toggle do drawer mobile da sidebar (o shell responsivo já existe, falta o
estado de abrir/fechar), gráficos com dados reais, queries reais nas
páginas (hoje usam `—` ou dados mock claramente identificados), qualquer
lógica de carrinho/checkout/pagamento.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=       # pública, do painel do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # pública, idem
SUPABASE_SERVICE_ROLE_KEY=      # SECRETA — não implementada nesta etapa, mas já reservada
```

## Como executar localmente

```bash
npm install
npm run dev
```

## Como configurar o Supabase

1. Crie um projeto em supabase.com.
2. No SQL Editor, rode o conteúdo de `supabase/schema.sql`.
3. Copie a URL e a anon key (Project Settings → API) para `.env.local`.
4. Crie ao menos um usuário pelo Auth do Supabase (ou pela tela de
   cadastro que será feita na próxima etapa) — o trigger já cria o
   `profile` automaticamente com papel `cliente`.
5. Para testar como ADM_SUPREMO: no SQL Editor, rode
   `update profiles set role = 'adm_supremo' where id = '<uuid_do_usuário>';`
6. Para testar como DONO_DA_LOJA: crie uma empresa em `companies`, o papel
   `dono_da_loja` no profile, e um vínculo em `company_users` ligando os
   dois.

## Como testar o isolamento entre empresas

1. Crie duas empresas (`companies`) e dois donos, cada um vinculado a uma
   delas via `company_users`.
2. Logado como o dono da Empresa A, tente consultar (via Supabase client)
   produtos/pedidos com o `company_id` da Empresa B — a política RLS deve
   retornar zero linhas, mesmo que o `company_id` seja passado
   manualmente na query.
3. Confirme que o ADM_SUPREMO consegue ver as duas empresas normalmente.
