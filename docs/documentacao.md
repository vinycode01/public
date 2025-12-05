# Documentação do Projeto - Vale-Presente

## Visão Geral
Este projeto tem o objetivo de eliminar erros ao presentear alguém: permitir que uma pessoa escolha uma loja cadastrada, compre um voucher (vale-presente) de determinado valor e envie como presente. O presenteado pode usar o voucher na loja para gastar o valor como desejar. O lojista valida o voucher através do painel do lojista e o admin do sistema controla a plataforma (aprova lojistas, cadastra/exclui lojas, gerencia vouchers).

## Atores e Funções
- **Comprador**: seleciona uma loja, escolhe o valor do voucher, efetua pagamento e envia o voucher ao presenteado. Observação: o comprador não precisa se cadastrar com login e senha — o fluxo permite compra como convidado (guest). O sistema registra recursos mínimos do comprador (nome e, quando disponível, email) sem exigir autenticação completa.
- **Presenteado**: recebe o voucher e o utiliza na loja para pagar por produtos/serviços até o valor do voucher. Os dados do presenteado no projeto atual são apenas `nome` e `mensagem` (o voucher é enviado via WhatsApp, não por e-mail).
- **Lojista**: gerencia vouchers no painel do lojista, valida resgates e confere pagamentos na conta. Cada lojista pode configurar sua `apiKey` do Asaas no cadastro.
- **Administrador (Admin)**: gerencia a plataforma inteira — aprova/recusa lojistas, cria ou deleta lojas, inspeciona e resolve problemas com vouchers.

## Principais Funcionalidades
- **Cadastro de lojas**: lojistas podem solicitar cadastro; admin aprova.
- **Compra de voucher**: comprador escolhe loja e valor; o sistema emite um voucher (código ou QR) vinculado à loja e ao valor pago.
- **Envio do voucher**: o voucher pode ser enviado por e-mail/URL ao presenteado.
- **Resgate do voucher**: lojista valida o voucher no painel, confirma que o valor foi recebido e marca como resgatado.
- **Painel do lojista**: lista de vouchers, status (emitido, pago, resgatado, cancelado), busca por código/cliente, histórico.
- **Painel do admin**: aprova lojistas, cadastra/deleta lojas, visualiza todos os vouchers e estatísticas.

## Fluxos (passo a passo)

Comprar voucher
- **1.** Comprador escolhe a loja disponível.
- **2.** Define o valor do voucher e dados do presenteado (apenas `nome` e `mensagem` conforme implementação atual). O comprador pode comprar sem criar conta / sem login.
- **3.** Efetua pagamento (integração com gateway de pagamento externo — atualmente Asaas via config da loja).
- **4.** Sistema emite voucher com código/QR único e envia ao presenteado via WhatsApp (fluxo implementado no projeto).

Resgatar voucher (lojista)
- **1.** Presenteado apresenta o código/QR ao lojista.
- **2.** Lojista pesquisa/escaneia o voucher no painel do lojista.
- **3.** Lojista confirma que o pagamento foi recebido (ou que o voucher é válido) e marca como resgatado.
- **4.** Sistema registra o uso parcial/total do voucher.

Fluxo admin
- **1.** Admin recebe solicitações de lojistas.
- **2.** Admin aprova ou rejeita lojistas.
- **3.** Admin pode cadastrar novas lojas manualmente e apagar lojas quando necessário.

## Modelo de Dados (estrutural - sugestão)
- **Stores (lojas)**: `id`, `name`, `Description`, `ownerId`, `approved`, `createdAt`.
- **Users (usuários)**: `id`, `name`, `email`, `role` (admin|lojista|user), `createdAt`.
- **Vouchers**: `id`, `code` (ou `qrData`), `amount`, `storeId`, `purchaserId`, `recipientEmail`, `status` (issued|paid|redeemed|cancelled), `createdAt`, `redeemedAt`.
- **Transactions**: `id`, `voucherId`, `amount`, `status`, `paymentProviderId`, `createdAt`.

## Estrutura do Projeto (arquivos principais)
- **`App.tsx`**, **`index.tsx`**: entrada do app React.
- **`services/api.ts`**: funções para comunicação com backend/Supabase.
- **`services/geminiService.ts`**: integração com serviços externos (ex.: AI ou APIs auxiliares).
- **`services/mockDb.ts`**: dados de exemplo usados em desenvolvimento.
- **`package.json`**: scripts e dependências do projeto.

Dependências notáveis encontradas no projeto: `@supabase/supabase-js`, `@google/genai`, `react-qr-code` (sugere uso de QR para vouchers), `react-router-dom`, `recharts`.

## Variáveis de Ambiente (sugestão)
- `VITE_SUPABASE_URL` - URL do projeto Supabase.
- `VITE_SUPABASE_ANON_KEY` - chave pública/anon do Supabase.
- `VITE_GENAI_API_KEY` - chave para o serviço `@google/genai` (se utilizado).
- `VITE_PAYMENT_PROVIDER_KEY` - credenciais para gateway de pagamento.

Coloque essas variáveis em um arquivo `.env` na raiz (não versionar chaves privadas).

## Instalação e execução (Windows + PowerShell)
Recomenda-se usar `pnpm` (há `pnpm-lock.yaml`), mas `npm` ou `yarn` também funcionam.

```powershell
pnpm install
pnpm run dev
```

Scripts úteis (conforme `package.json`):
- `dev`: inicia o servidor de desenvolvimento (Vite).
- `build`: gera a versão de produção.
- `preview`: serve a build de produção localmente.

## Configuração do Supabase / Backend
- Se o projeto utiliza Supabase como backend, crie o projeto no Supabase, configure tabelas para `stores`, `users`, `vouchers`, `transactions` e copie `URL` e `ANON_KEY` para o `.env`.
- Ajuste regras de Row Level Security (RLS) conforme necessário para proteger endpoints administrativos.

## Segurança e validação de vouchers
- Use códigos ou QR com comprimento e entropia suficiente para evitar colisões/fraudes.
- Marque o voucher como `paid` somente após confirmação do gateway de pagamento.
- Lojista só deve marcar `redeemed` após verificar a transação ou confirmar pagamento via painel.

## Testes e validação manual
- Teste compras com valores fictícios e use um `mockDb` para validar fluxos sem integrar pagamentos reais.
- Verifique a emissão, envio por e-mail (se implementado), escaneamento de QR e marcação como `redeemed`.

## Próximos passos e melhorias sugeridas
- Implementar integração com gateway de pagamento (ex.: Stripe, PagSeguro).
- Implementar email automático para envio de vouchers.
- Adicionar logs e auditoria para resgates e mudanças de status.
- Adicionar testes automatizados (unitários e E2E).
- Painel de analytics para admin com métricas de vendas e vouchers ativos.

## Observações finais
O repositório já contém dependências e arquivos iniciais para um app React com Vite. A documentação acima é um ponto de partida prático para desenvolver e operar o sistema de vale-presente descrito. Se desejar, posso gerar diagramas, endpoints de API, ou um README mais voltado ao deploy.

---
Arquivo gerado: `docs/documentacao.md`
