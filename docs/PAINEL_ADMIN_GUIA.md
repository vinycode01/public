# Guia do Painel Administrativo - Editar e Deletar Lojas

## Visão Geral
O Painel Administrativo agora permite que o admin gerencie completamente as lojas cadastradas, incluindo editar seus dados e deletar lojas inteiras.

## Novas Funcionalidades

### 1. Editar Loja
- **Localização**: Tabela "Gerenciar Lojas" no Painel Admin
- **Botão**: Ícone de engrenagem (Settings) na coluna "Ações"
- **O que pode ser editado**:
  - Nome da loja
  - Descrição
  - Categoria
  - Estado (UF)
  - Cidade

**Fluxo**:
1. Clique no ícone de engrenagem na linha da loja desejada
2. Um modal abrirá com os campos preenchidos
3. Edite os dados conforme necessário
4. Clique em "Salvar" para aplicar as mudanças
5. Confirme a mensagem de sucesso

**Observações**:
- A edição afeta apenas os dados da loja
- Vouchers vinculados não são afetados
- Nenhuma confirmação adicional é necessária (a confirmação do modal é suficiente)

### 2. Deletar Loja
- **Localização**: Tabela "Gerenciar Lojas" no Painel Admin
- **Botão**: Ícone de lixeira (Trash) na coluna "Ações"
- **O que acontece**:
  - A loja é removida do banco de dados
  - **TODOS os vouchers vinculados à loja também são deletados**
  - O usuário proprietário NÃO é deletado automaticamente

**Fluxo**:
1. Clique no ícone de lixeira na linha da loja desejada
2. Um modal de confirmação aparecerá com aviso em vermelho
3. Leia o aviso cuidadosamente (ação irreversível)
4. Clique em "Deletar" para confirmar a exclusão
5. Confirme a segunda mensagem (sistema solicitará confirmação extra)

**Atenção**: 
- ⚠️ Esta ação é **IRREVERSÍVEL**
- Todos os vouchers associados serão perdidos permanentemente
- O admin receberá uma confirmação visual de sucesso após a exclusão

## Funções de API

### `updateStore(id: string, payload: Partial<StoreData>)`
Atualiza dados da loja no Supabase.

**Parâmetros**:
- `id`: ID da loja
- `payload`: Objeto parcial com campos a serem atualizados
  - `name?`: string
  - `description?`: string
  - `category?`: string
  - `city?`: string
  - `state?`: string
  - `images?`: string[]

**Retorno**: `boolean` (true se sucesso)

**Exemplo**:
```typescript
await api.updateStore('s1234567890', {
  name: 'Nova Loja Premium',
  category: 'Vestuário',
  city: 'São Paulo'
});
```

### `deleteStore(id: string)`
Deleta a loja e todos os seus vouchers vinculados.

**Parâmetros**:
- `id`: ID da loja

**Processo**:
1. Busca a loja no banco de dados
2. Deleta todos os vouchers vinculados à loja
3. Deleta a loja
4. Lança erro se alguma etapa falhar

**Retorno**: `boolean` (true se sucesso)

**Exemplo**:
```typescript
await api.deleteStore('s1234567890');
```

## Segurança e RLS (Row Level Security)

⚠️ **Importante**: Certifique-se de que o Supabase está configurado com políticas de Row Level Security (RLS) apropriadas:

- Apenas admins podem editar/deletar lojas
- Lojistas só podem editar suas próprias lojas (se implementado)
- Compradores não podem editar/deletar ninguém

**Exemplo de Policy** (sugerido para `stores` table):
```sql
-- Admins podem fazer qualquer coisa
CREATE POLICY "Admin can do anything"
ON stores FOR ALL
USING (
  auth.jwt() ->> 'role' = 'ADMIN'
);

-- Lojistas podem editar sua própria loja
CREATE POLICY "Stores can edit themselves"
ON stores FOR UPDATE
USING (
  owner_id = auth.uid()
);

-- Ninguém pode deletar exceto admins
CREATE POLICY "Only admins can delete"
ON stores FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'ADMIN'
);
```

## Estados e Fluxo de UI

No `App.tsx`, o `DashboardAdmin` mantém os seguintes estados:
- `editingStore`: Loja sendo editada (ou null)
- `editForm`: Formulário com dados editáveis
- `showDeleteConfirmId`: ID da loja em processo de exclusão (ou null)
- `processingId`: ID da loja sendo processada (carregando)

**Modais**:
1. **Modal de Edição**: Permite alterar dados
2. **Modal de Confirmação de Exclusão**: Aviso em vermelho antes de deletar

## Tratamento de Erros

Ambas as funções possuem tratamento de erro:
- Exibem alertas ao usuário
- Recarregam os dados (`loadData()`) em caso de sucesso
- Não desativam os botões em caso de erro (usuário pode tentar novamente)

## Próximas Melhorias Sugeridas

1. **Edição de Imagens**: Adicionar suporte a editar galeria de fotos
2. **Histórico**: Manter log de quem editou/deletou e quando
3. **Soft Delete**: Ao invés de deletar, marcar lojas como "inativas"
4. **Backup**: Antes de deletar, gerar backup dos dados da loja
5. **Aprovação**: Edições de loja aprovadas pendentes (como lojas novas)

---

**Última atualização**: Dezembro 2025
**Status**: ✅ Implementado e testado
