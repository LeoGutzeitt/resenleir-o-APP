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

-- Políticas
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid() = id);