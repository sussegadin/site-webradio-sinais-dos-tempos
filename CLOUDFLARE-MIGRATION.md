# Migração Cloudflare

O projeto agora contém uma camada de destino baseada em **TypeScript + Hono + Cloudflare Pages Functions + D1 + R2**.

## Componentes adicionados

- `wrangler.toml`: configuração de Pages, D1 e R2.
- `cloudflare/migrations/0001_init.sql`: schema SQLite/D1 para usuários, posts, patrocinadores e louvores.
- `functions/api/[[route]].ts`: API Hono para saúde, posts, patrocinadores, louvores e mídia R2.

## Preparação pelo terminal

```bash
pnpm add hono
pnpm add -D wrangler
npx wrangler login
npx wrangler d1 create sinais-dos-tempos-db
npx wrangler r2 bucket create sinais-dos-tempos-media
npx wrangler d1 migrations apply sinais-dos-tempos-db --remote
pnpm build
npx wrangler pages deploy dist/public --project-name sinais-dos-tempos-webradio
```

Depois de criar o D1, substitua `COLOQUE_O_DATABASE_ID_AQUI` no `wrangler.toml`. Para publicar pelo GitHub, configure o build `pnpm build` e a pasta de saída `dist/public`.

## Estado da migração

A API Cloudflare está pronta como camada inicial. A autenticação administrativa, o editor e os uploads do frontend ainda devem ser conectados a essa API antes de trocar o domínio de produção. Mantenha o Netlify ativo durante os testes.
