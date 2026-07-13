-- Script para inserir dados iniciais no Supabase
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela de clubes (se não existir)
CREATE TABLE IF NOT EXISTS clubes (
  id BIGINT PRIMARY KEY,
  nome TEXT NOT NULL,
  escudo_url TEXT,
  cor_principal TEXT,
  usuario_dono_id UUID REFERENCES auth.users,
  orcamento BIGINT
);

-- Inserir clubes
INSERT INTO clubes (id, nome, cor_principal, usuario_dono_id, orcamento) VALUES
  (1, 'Fênix FC', '#FF4500', '844b475d-d115-4ee6-9215-468ad7d2cbd4', 100000000),
  (2, 'Trovão Azul', '#1E90FF', '51cab5fc-34e9-4bc6-85d3-3cbbacc73511', 100000000),
  (3, 'Leões da Vila', '#FFD700', 'bb684047-c188-4fcf-965a-fa1a30a7516c', 100000000),
  (4, 'Águias Negras', '#2F2F2F', 'd010627b-a6fb-4ac5-90a4-30022bb0a500', 100000000),
  (5, 'Dragões Vermelhos', '#DC143C', 'd407d27b-02f0-46eb-89dd-de7e5a95b339', 100000000),
  (6, 'Tubarões FC', '#00CED1', '05d0f21f-18d8-429c-8527-9b3b640e5677', 100000000),
  (7, 'Guerreiros FC', '#228B22', '02f6896d-aac3-4e9a-82af-a80213755bb6', 100000000),
  (8, 'Corsários', '#8B0000', '778fe062-f910-49aa-9a65-6e09a63061e8', 100000000),
  (9, 'Tornado FC', '#9400D3', '38763131-7406-4017-a65d-72ad439e35a0', 100000000),
  (10, 'Panteras FC', '#FF69B4', '6550bbeb-7300-4534-85c4-5ab62ddada09', 100000000)
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
DROP POLICY IF EXISTS "Clubes são visíveis para todos" ON clubes;
CREATE POLICY "Clubes são visíveis para todos" ON clubes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Donos podem atualizar seus clubes" ON clubes;
CREATE POLICY "Donos podem atualizar seus clubes" ON clubes FOR UPDATE USING (id = (SELECT clube_id FROM usuarios WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Admin pode gerenciar clubes" ON clubes;
CREATE POLICY "Admin pode gerenciar clubes" ON clubes FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Jogadores
DROP POLICY IF EXISTS "Jogadores são visíveis para todos" ON jogadores;
CREATE POLICY "Jogadores são visíveis para todos" ON jogadores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Donos podem gerenciar jogadores de seus clubes" ON jogadores;
CREATE POLICY "Donos podem gerenciar jogadores de seus clubes" ON jogadores FOR ALL USING (
  clube_id = (SELECT clube_id FROM usuarios WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "Admin pode gerenciar jogadores" ON jogadores;
CREATE POLICY "Admin pode gerenciar jogadores" ON jogadores FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Jogos
DROP POLICY IF EXISTS "Jogos são visíveis para todos" ON jogos;
CREATE POLICY "Jogos são visíveis para todos" ON jogos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin pode gerenciar jogos" ON jogos;
CREATE POLICY "Admin pode gerenciar jogos" ON jogos FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Estatísticas
DROP POLICY IF EXISTS "Estatísticas são visíveis para todos" ON estatisticas;
CREATE POLICY "Estatísticas são visíveis para todos" ON estatisticas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin pode gerenciar estatísticas" ON estatisticas;
CREATE POLICY "Admin pode gerenciar estatísticas" ON estatisticas FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Transferências
DROP POLICY IF EXISTS "Transferências são visíveis para todos" ON transferencias;
CREATE POLICY "Transferências são visíveis para todos" ON transferencias FOR SELECT USING (true);
DROP POLICY IF EXISTS "Donos podem gerenciar transferências" ON transferencias;
CREATE POLICY "Donos podem gerenciar transferências" ON transferencias FOR ALL USING (
  clube_origem_id = (SELECT clube_id FROM usuarios WHERE id = auth.uid())
  OR clube_destino_id = (SELECT clube_id FROM usuarios WHERE id = auth.uid())
);

-- Notícias
DROP POLICY IF EXISTS "Notícias são visíveis para todos" ON noticias;
CREATE POLICY "Notícias são visíveis para todos" ON noticias FOR SELECT USING (true);
DROP POLICY IF EXISTS "Donos podem gerenciar notícias de seus clubes" ON noticias;
CREATE POLICY "Donos podem gerenciar notícias de seus clubes" ON noticias FOR ALL USING (
  clube_id = (SELECT clube_id FROM usuarios WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "Admin pode gerenciar notícias" ON noticias;
CREATE POLICY "Admin pode gerenciar notícias" ON noticias FOR ALL USING (
  auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin')
);

-- Tabela de usuários (perfil)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dono')),
  clube_id BIGINT REFERENCES clubes
);

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Determinar o clube_id baseado no email
  INSERT INTO public.usuarios (id, email, nome, role, clube_id)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@resenleirao.com' THEN 'Admin'
      WHEN NEW.email = 'leo@resenleirao.com' THEN 'Leo'
      WHEN NEW.email = 'felipe@resenleirao.com' THEN 'Felipe'
      WHEN NEW.email = 'diego@resenleirao.com' THEN 'Diego'
      WHEN NEW.email = 'pedro@resenleirao.com' THEN 'Pedro'
      WHEN NEW.email = 'berenguer@resenleirao.com' THEN 'Berenguer'
      WHEN NEW.email = 'bruno@resenleirao.com' THEN 'Bruno'
      WHEN NEW.email = 'yves@resenleirao.com' THEN 'Yves'
      WHEN NEW.email = 'adriano@resenleirao.com' THEN 'Adriano'
      WHEN NEW.email = 'jhonny@resenleirao.com' THEN 'Jhonny'
      WHEN NEW.email = 'piscina@resenleirao.com' THEN 'Piscina'
      ELSE split_part(NEW.email, '@', 1)
    END,
    CASE 
      WHEN NEW.email = 'admin@resenleirao.com' THEN 'admin'
      ELSE 'dono'
    END,
    CASE 
      WHEN NEW.email = 'leo@resenleirao.com' THEN 1
      WHEN NEW.email = 'felipe@resenleirao.com' THEN 2
      WHEN NEW.email = 'diego@resenleirao.com' THEN 3
      WHEN NEW.email = 'pedro@resenleirao.com' THEN 4
      WHEN NEW.email = 'berenguer@resenleirao.com' THEN 5
      WHEN NEW.email = 'bruno@resenleirao.com' THEN 6
      WHEN NEW.email = 'yves@resenleirao.com' THEN 7
      WHEN NEW.email = 'adriano@resenleirao.com' THEN 8
      WHEN NEW.email = 'jhonny@resenleirao.com' THEN 9
      WHEN NEW.email = 'piscina@resenleirao.com' THEN 10
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente quando usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Inserir os usuários manualmente (caso já existam)
INSERT INTO usuarios (id, email, nome, role, clube_id)
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email = 'admin@resenleirao.com' THEN 'Admin'
    WHEN u.email = 'leo@resenleirao.com' THEN 'Leo'
    WHEN u.email = 'felipe@resenleirao.com' THEN 'Felipe'
    WHEN u.email = 'diego@resenleirao.com' THEN 'Diego'
    WHEN u.email = 'pedro@resenleirao.com' THEN 'Pedro'
    WHEN u.email = 'berenguer@resenleirao.com' THEN 'Berenguer'
    WHEN u.email = 'bruno@resenleirao.com' THEN 'Bruno'
    WHEN u.email = 'yves@resenleirao.com' THEN 'Yves'
    WHEN u.email = 'adriano@resenleirao.com' THEN 'Adriano'
    WHEN u.email = 'jhonny@resenleirao.com' THEN 'Jhonny'
    WHEN u.email = 'piscina@resenleirao.com' THEN 'Piscina'
    ELSE split_part(u.email, '@', 1)
  END,
  CASE 
    WHEN u.email = 'admin@resenleirao.com' THEN 'admin'
    ELSE 'dono'
  END,
  CASE 
    WHEN u.email = 'leo@resenleirao.com' THEN 1
    WHEN u.email = 'felipe@resenleirao.com' THEN 2
    WHEN u.email = 'diego@resenleirao.com' THEN 3
    WHEN u.email = 'pedro@resenleirao.com' THEN 4
    WHEN u.email = 'berenguer@resenleirao.com' THEN 5
    WHEN u.email = 'bruno@resenleirao.com' THEN 6
    WHEN u.email = 'yves@resenleirao.com' THEN 7
    WHEN u.email = 'adriano@resenleirao.com' THEN 8
    WHEN u.email = 'jhonny@resenleirao.com' THEN 9
    WHEN u.email = 'piscina@resenleirao.com' THEN 10
    ELSE NULL
  END
FROM auth.users u
WHERE u.email IN ('admin@resenleirao.com', 'leo@resenleirao.com', 'felipe@resenleirao.com', 'diego@resenleirao.com', 'pedro@resenleirao.com', 'berenguer@resenleirao.com', 'bruno@resenleirao.com', 'yves@resenleirao.com', 'adriano@resenleirao.com', 'jhonny@resenleirao.com', 'piscina@resenleirao.com')
ON CONFLICT (id) DO NOTHING;

-- Política para usuários
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários visíveis para autenticados" ON usuarios;
CREATE POLICY "Usuários visíveis para autenticados" ON usuarios FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid() = id);
-- Admin pode gerenciar todos os usuários
DROP POLICY IF EXISTS "Admin pode gerenciar usuarios" ON usuarios;
CREATE POLICY "Admin pode gerenciar usuarios" ON usuarios FOR ALL USING (auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin'));
