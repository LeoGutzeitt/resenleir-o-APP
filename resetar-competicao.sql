-- Limpeza segura da competição do Resenleirão.
-- Execute no Supabase SQL Editor, logado como administrador do projeto.
-- Preserva clubes, usuários, jogadores, valores de mercado, transferências e draft.

begin;

delete from public.estatisticas where id is not null;
delete from public.jogos where id is not null;

commit;

-- Depois da limpeza, execute corrigir-supabase.sql atualizado e use
-- Admin > Jogos > Gerar jogos. Com 10 clubes serão criados 90 jogos:
-- 18 rodadas, com ida e volta.
