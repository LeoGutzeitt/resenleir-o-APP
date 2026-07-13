-- Criar tabela de usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dono')),
  clube_id BIGINT REFERENCES clubes
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas (com DROP IF EXISTS para permitir reexecução)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid() = id);
-- Admin pode gerenciar todos os usuários
DROP POLICY IF EXISTS "Admin pode ver usuarios" ON usuarios;
CREATE POLICY "Admin pode ver usuarios" ON usuarios FOR SELECT USING (auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin'));
DROP POLICY IF EXISTS "Admin pode inserir usuarios" ON usuarios;
CREATE POLICY "Admin pode inserir usuarios" ON usuarios FOR INSERT USING (auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin'));
DROP POLICY IF EXISTS "Admin pode atualizar usuarios" ON usuarios;
CREATE POLICY "Admin pode atualizar usuarios" ON usuarios FOR UPDATE USING (auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin'));
DROP POLICY IF EXISTS "Admin pode deletar usuarios" ON usuarios;
CREATE POLICY "Admin pode deletar usuarios" ON usuarios FOR DELETE USING (auth.uid() IN (SELECT id FROM usuarios WHERE role = 'admin'));
