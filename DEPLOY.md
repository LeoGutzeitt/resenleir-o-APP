# Guia de Deploy - Resenleirão App

## Configuração do Supabase

### 1. Execute o SQL de setup/correção
Para um projeto novo, execute `setup-supabase.sql`. Em um banco que já possui os usuários, execute também `corrigir-supabase.sql` no Supabase SQL Editor para:
- Criar tabelas
- Inserir clubes iniciais
- Configurar RLS (Row Level Security)
- Criar os perfis ausentes a partir do Supabase Auth
- Vincular `usuarios.clube_id` a `clubes.usuario_dono_id`
- Liberar as operações administrativas para quem possui `role = 'admin'`

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
Execute `corrigir-supabase.sql` após criar os usuários. O script usa os e-mails acima para preencher os dois lados do vínculo automaticamente e pode ser executado novamente com segurança.

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
