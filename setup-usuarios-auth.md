# Script para criar usuários no Supabase Auth
# Execute este script no Supabase SQL Editor após executar o setup-completo.sql

-- Primeiro, execute o setup-completo.sql para criar as tabelas e triggers

-- Depois, crie os usuários manualmente no Supabase Auth:
-- 1. Acesse o painel do Supabase
-- 2. Vá para Authentication > Users
-- 3. Crie os seguintes usuários:

-- Admin
-- Email: admin@resenleirao.com
-- Senha: 123456
-- Role: admin (será atribuído automaticamente pelo trigger)

-- Donos dos clubes
-- Email: leo@resenleirao.com
-- Senha: 123456
-- Clube: Fênix FC (id: 1)

-- Email: felipe@resenleirao.com
-- Senha: 123456
-- Clube: Trovão Azul (id: 2)

-- Email: diego@resenleirao.com
-- Senha: 123456
-- Clube: Leões da Vila (id: 3)

-- Email: pedro@resenleirao.com
-- Senha: 123456
-- Clube: Águias Negras (id: 4)

-- Email: berenguer@resenleirao.com
-- Senha: 123456
-- Clube: Dragões Vermelhos (id: 5)

-- Email: bruno@resenleirao.com
-- Senha: 123456
-- Clube: Tubarões FC (id: 6)

-- Email: yves@resenleirao.com
-- Senha: 123456
-- Clube: Guerreiros FC (id: 7)

-- Email: adriano@resenleirao.com
-- Senha: 123456
-- Clube: Corsários (id: 8)

-- Email: jhonny@resenleirao.com
-- Senha: 123456
-- Clube: Tornado FC (id: 9)

-- Email: piscina@resenleirao.com
-- Senha: 123456
-- Clube: Panteras FC (id: 10)

-- NOTA: O trigger on_auth_user_created criará automaticamente os perfis na tabela usuarios
-- com base no email. Se preferir, você pode executar este SQL após criar os usuários:

-- Atualizar os clubes com o ID dos donos (substitua pelos UUIDs reais gerados pelo Supabase)
-- Você pode ver os UUIDs em Authentication > Users após criar os usuários

-- Exemplo:
-- UPDATE clubes SET usuario_dono_id = 'UUID_DO_USUARIO' WHERE id = 1;