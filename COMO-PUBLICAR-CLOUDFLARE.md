# Sinais dos Tempos Web Rádio — publicação no Cloudflare

Este pacote contém o projeto completo da Web Rádio: frontend, blog, editor administrativo, IA, louvores, patrocinadores, banco de dados e autenticação.

## Importante

O projeto não é apenas um site estático. O editor, upload de imagens e MP3, IA, login e banco de dados dependem do servidor Node.js e das variáveis de ambiente do projeto. Portanto, não envie somente a pasta `dist/public` para o Cloudflare Pages esperando que o painel administrativo funcione.

## Caminho recomendado

1. Crie um repositório Git e envie o conteúdo deste pacote.
2. Publique o frontend e o servidor em uma hospedagem compatível com Node.js ou adapte o backend para Cloudflare Workers/Pages Functions.
3. Configure as variáveis `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` e as demais variáveis indicadas no projeto.
4. Aponte o domínio `sinaisdostemposwebradio.com.br` para a nova hospedagem somente depois de testar o endereço provisório.
5. Mantenha o Netlify ativo durante a transição. Após confirmar o novo site, altere o DNS no Cloudflare.

## Comandos de produção

```bash
pnpm install
pnpm build
pnpm start
```

O projeto usa a porta definida pelo ambiente de hospedagem. Não apague o banco antigo até confirmar que blog, login, uploads, player e área administrativa estão funcionando.
