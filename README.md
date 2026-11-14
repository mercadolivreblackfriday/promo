# Funil Mercado Livre JBL + PinguPag Pix + Roleta 10.10

Projeto completo de funil promocional estilo Mercado Livre com:
- **Pré-sell anti-bloqueio:** `/anti/`
- **Página de Produto / Checkout Oficial:** `/jbl/`
- **Roleta de Prêmios (Upsell):** `/roleta/`
- **Rastreamento de Encomendas em 6 Fases:** `/rastreio/`
- **Painel Administrativo com Métricas:** `/admin/` (Acesso restrito)
- **Netlify Serverless Functions nativas em Node.js:** `/netlify/functions/` (Pix PinguPag, Status Pix, Tracking, TikTok Events API)

## Deploy no Netlify
1. Conecte este repositório no Netlify ou faça o upload manual.
2. O arquivo `netlify.toml` e `_redirects` já configuram todas as rotas e funções serverless automaticamente.

## Execução Local
```bash
npm start
```
Acesse `http://localhost:8080/`
