# Guia de Deploy - Resenleirão App

## Configuração do Supabase

### 1. Execute o SQL de setup
Execute o arquivo `setup-supabase.sql` no Supabase SQL Editor para:
- Criar tabelas
- Inserir clubes iniciais
- Configurar RLS (Row Level Security)

### 2. Criar usuários
No Supabase Auth, crie os seguintes usuários:

| Email | Senha | Role |
|-------|-------|------|
| admin@resenleirao.com | 123456 | admin |
| leo@resenleirao.com | 123456 | dono |
| felipe@resenleirao.com | 123456 | dono |
| diego@resenleirao.com | 123456 | dono |
| pedro@resenleirao.com | 123456 | dono |
| berenguer@resenleirao.com | 123456 | dono |
| bruno@resenleirao.com | 123456 | dono |
| yves@resenleirao.com | 123456 | dono |
| adriano@resenleirao.com | 123456 | dono |
| jhonny@resenleirao.com | 123456 | dono |
| piscina@resenleirao.com | 123456 | dono |

### 3. Vincular usuários aos clubes
Execute este SQL após criar os usuários:

```sql
-- Atualizar os clubes com o ID dos donos
UPDATE clubes SET usuario_dono_id = 'ID_DO_USUARIO_LEO' WHERE id = 1;
UPDATE clubes SET usuario_dono_id = 'ID_DO_USUARIO_FELIPE' WHERE id = 2;
-- ... repita para todos os clubes
```

## Deploy no Vercel

### 1. Conectar ao GitHub
- Faça commit de todas as alterações
- Conecte o repositório ao Vercel

### 2. Configurar variáveis de ambiente
No Vercel, adicione:
- `VITE_SUPABASE_URL` = https://sdwksbyjqybjtozteytr.supabase.co
- `VITE_SUPABASE_ANON_KEY` = (sua anon key)

### 3. Build
O Vercel fará o build automaticamente com `npm run build`

## Arquivos modificados

- `.env` - Credenciais do Supabase
- `src/lib/supabase.ts` - Cliente Supabase
- `src/lib/db.ts` - Database com Supabase
- `src/contexts/AuthContext.tsx` - Auth com Supabase
- `src/pages/Login.tsx` - Login atualizado
- `src/pages/Home.tsx` - Home com async/await
- `setup-supabase.sql` - SQL de setup do banco

## Próximos passos

1. Execute o SQL de setup no Supabase
2. Crie os usuários no Supabase Auth
3. Vincule os usuários aos clubes
4. Commit e push para o GitHub
5. Conecte ao Vercel
6. Teste o site!