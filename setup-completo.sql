-- Script completo - execute tudo junto no Supabase SQL Editor

-- 1. Inserir clubes
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

-- 2. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dono')),
  clube_id BIGINT REFERENCES clubes
);

-- 3. Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- 5. Inserir os usuários (com os UUIDs que você forneceu)
INSERT INTO usuarios (id, email, nome, role, clube_id) VALUES
  ('72bd625c-649c-4330-9e8e-18614e87b293', 'admin@resenleirao.com', 'Admin', 'admin', NULL),
  ('844b475d-d115-4ee6-9215-468ad7d2cbd4', 'leo@resenleirao.com', 'Leo', 'dono', 1),
  ('51cab5fc-34e9-4bc6-85d3-3cbbacc73511', 'felipe@resenleirao.com', 'Felipe', 'dono', 2),
  ('bb684047-c188-4fcf-965a-fa1a30a7516c', 'diego@resenleirao.com', 'Diego', 'dono', 3),
  ('d010627b-a6fb-4ac5-90a4-30022bb0a500', 'pedro@resenleirao.com', 'Pedro', 'dono', 4),
  ('d407d27b-02f0-46eb-89dd-de7e5a95b339', 'berenguer@resenleirao.com', 'Berenguer', 'dono', 5),
  ('05d0f21f-18d8-429c-8527-9b3b640e5677', 'bruno@resenleirao.com', 'Bruno', 'dono', 6),
  ('02f6896d-aac3-4e9a-82af-a80213755bb6', 'yves@resenleirao.com', 'Yves', 'dono', 7),
  ('778fe062-f910-49aa-9a65-6e09a63061e8', 'adriano@resenleirao.com', 'Adriano', 'dono', 8),
  ('38763131-7406-4017-a65d-72ad439e35a0', 'jhonny@resenleirao.com', 'Jhonny', 'dono', 9),
  ('6550bbeb-7300-4534-85c4-5ab62ddada09', 'piscina@resenleirao.com', 'Piscina', 'dono', 10);