-- Script para inserir dados iniciais no Supabase
-- Execute este SQL no Supabase SQL Editor

-- Inserir clubes (se não existirem)
INSERT INTO clubes (id, nome, cor_principal, orcamento) VALUES
  (1, 'Fênix FC', '#FF4500', 100000000),
  (2, 'Trovão Azul', '#1E90FF', 100000000),
  (3, 'Leões da Vila', '#FFD700', 100000000),
  (4, 'Águias Negras', '#2F2F2F', 100000000),
  (5, 'Dragões Vermelhos', '#DC143C', 100000000),
  (6, 'Tubarões FC', '#00CED1', 100000000),
  (7, 'Guerreiros FC', '#228B22', 100000000),
  (8, 'Corsários', '#8B0000', 100000000),
  (9, 'Tornado FC', '#9400D3', 100000000),
  (10, 'Panteras FC', '#FF69B4', 100000000)
ON CONFLICT (id) DO NOTHING;

-- Criar funções para atualizar orçamento
CREATE OR REPLACE FUNCTION increment_orcamento(clube_id INTEGER, valor BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE clubes SET orcamento = orcamento + valor WHERE id = clube_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_orcamento(clube_id INTEGER, valor BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE clubes SET orcamento = orcamento - valor WHERE id = clube_id;
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS (Row Level Security)
ALTER TABLE clubes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jogadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE jogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso - todos podem ler, apenas donos podem escrever
-- Clubes
CREATE POLICY "Clubes são visíveis para todos" ON clubes FOR SELECT USING (true);
CREATE POLICY "Donos podem atualizar seus clubes" ON clubes FOR UPDATE USING (auth.uid() = usuario_dono_id);

-- Jogadores
CREATE POLICY "Jogadores são visíveis para todos" ON jogadores FOR SELECT USING (true);
CREATE POLICY "Donos podem gerenciar jogadores de seus clubes" ON jogadores FOR ALL USING (
  clube_id IN (SELECT id FROM clubes WHERE usuario_dono_id = auth.uid())
);

-- Jogos
CREATE POLICY "Jogos são visíveis para todos" ON jogos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar jogos" ON jogos FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Estatísticas
CREATE POLICY "Estatísticas são visíveis para todos" ON estatisticas FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar estatísticas" ON estatisticas FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Transferências
CREATE POLICY "Transferências são visíveis para todos" ON transferencias FOR SELECT USING (true);
CREATE POLICY "Donos podem gerenciar transferências" ON transferencias FOR ALL USING (
  clube_origem_id IN (SELECT id FROM clubes WHERE usuario_dono_id = auth.uid())
  OR clube_destino_id IN (SELECT id FROM clubes WHERE usuario_dono_id = auth.uid())
);

-- Notícias
CREATE POLICY "Notícias são visíveis para todos" ON noticias FOR SELECT USING (true);
CREATE POLICY "Donos podem gerenciar notícias de seus clubes" ON noticias FOR ALL USING (
  clube_id IN (SELECT id FROM clubes WHERE usuario_dono_id = auth.uid())
);

-- Tabela de usuários (perfil)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dono')),
  clube_id BIGINT REFERENCES clubes
);

-- Política para usuários
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid() = id);