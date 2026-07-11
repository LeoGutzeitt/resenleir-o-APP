-- Correção idempotente de perfis, vínculos de clubes e permissões.
-- Execute este arquivo uma vez no SQL Editor do Supabase (como proprietário do projeto).

begin;

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null,
  role text not null check (role in ('admin', 'dono')),
  clube_id bigint references public.clubes(id)
);

alter table public.usuarios enable row level security;
alter table public.clubes enable row level security;
alter table public.jogadores enable row level security;
alter table public.jogos enable row level security;
alter table public.estatisticas enable row level security;
alter table public.transferencias enable row level security;
alter table public.noticias enable row level security;

-- Garante que os dez clubes iniciais existam antes de associar os perfis.
-- OVERRIDING SYSTEM VALUE também funciona quando id é uma identity column.
insert into public.clubes (id, nome, cor_principal, orcamento)
overriding system value
values
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
on conflict (id) do update set
  nome = excluded.nome,
  cor_principal = excluded.cor_principal,
  orcamento = coalesce(public.clubes.orcamento, excluded.orcamento);

-- Cria/atualiza perfis para os usuários que já existem no Supabase Auth.
-- Para as contas conhecidas, o clube é derivado do e-mail; vínculos manuais
-- existentes são preservados quando não há um clube conhecido no mapeamento.
with perfis_auth as (
  select
    u.id,
    u.email,
    coalesce(nullif(u.raw_user_meta_data ->> 'nome', ''), split_part(u.email, '@', 1)) as nome,
    case
      when lower(u.email) = 'admin@resenleirao.com' then 'admin'
      when u.raw_app_meta_data ->> 'role' = 'admin' then 'admin'
      else 'dono'
    end as role,
    case lower(u.email)
      when 'leo@resenleirao.com' then 1
      when 'felipe@resenleirao.com' then 2
      when 'diego@resenleirao.com' then 3
      when 'pedro@resenleirao.com' then 4
      when 'berenguer@resenleirao.com' then 5
      when 'bruno@resenleirao.com' then 6
      when 'yves@resenleirao.com' then 7
      when 'adriano@resenleirao.com' then 8
      when 'jhonny@resenleirao.com' then 9
      when 'piscina@resenleirao.com' then 10
      else null
    end::bigint as clube_id
  from auth.users u
)
insert into public.usuarios as perfil (id, email, nome, role, clube_id)
select id, email, nome, role, clube_id
from perfis_auth
on conflict (id) do update set
  email = excluded.email,
  nome = coalesce(nullif(perfil.nome, ''), excluded.nome),
  role = case
    when excluded.role = 'admin' then 'admin'
    else coalesce(perfil.role, excluded.role)
  end,
  clube_id = coalesce(excluded.clube_id, perfil.clube_id);

-- Mantém os dois lados do relacionamento consistentes. O frontend lê ambos e
-- as políticas de escrita usam clubes.usuario_dono_id.
update public.clubes c
set usuario_dono_id = null
from public.usuarios u
where c.usuario_dono_id = u.id
  and u.clube_id is not null
  and c.id <> u.clube_id;

update public.clubes c
set usuario_dono_id = u.id
from public.usuarios u
where u.clube_id = c.id
  and c.usuario_dono_id is distinct from u.id;

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  novo_role text;
  novo_clube_id bigint;
begin
  novo_role := case
    when lower(new.email) = 'admin@resenleirao.com' then 'admin'
    when new.raw_app_meta_data ->> 'role' = 'admin' then 'admin'
    else 'dono'
  end;

  novo_clube_id := case lower(new.email)
    when 'leo@resenleirao.com' then 1
    when 'felipe@resenleirao.com' then 2
    when 'diego@resenleirao.com' then 3
    when 'pedro@resenleirao.com' then 4
    when 'berenguer@resenleirao.com' then 5
    when 'bruno@resenleirao.com' then 6
    when 'yves@resenleirao.com' then 7
    when 'adriano@resenleirao.com' then 8
    when 'jhonny@resenleirao.com' then 9
    when 'piscina@resenleirao.com' then 10
    else null
  end;

  insert into public.usuarios (id, email, nome, role, clube_id)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    novo_role,
    novo_clube_id
  )
  on conflict (id) do update set email = excluded.email;

  if novo_clube_id is not null then
    update public.clubes
    set usuario_dono_id = new.id
    where id = novo_clube_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_resenleirao on auth.users;
create trigger on_auth_user_created_resenleirao
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

create or replace function public.usuario_eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Impede que um usuário comum se promova para admin ou troque o próprio clube.
revoke update on public.usuarios from authenticated;
grant update (nome) on public.usuarios to authenticated;

drop policy if exists "Usuários podem ver seus próprios dados" on public.usuarios;
drop policy if exists "Usuários podem atualizar seus próprios dados" on public.usuarios;
drop policy if exists "Usuarios podem ler o proprio perfil" on public.usuarios;
drop policy if exists "Usuarios podem atualizar o proprio nome" on public.usuarios;
create policy "Usuarios podem ler o proprio perfil"
  on public.usuarios for select
  using (auth.uid() = id);
create policy "Usuarios podem atualizar o proprio nome"
  on public.usuarios for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Clubes são visíveis para todos" on public.clubes;
drop policy if exists "Donos podem atualizar seus clubes" on public.clubes;
drop policy if exists "Clubes podem ser lidos" on public.clubes;
drop policy if exists "Admin gerencia clubes" on public.clubes;
drop policy if exists "Dono atualiza seu clube" on public.clubes;
create policy "Clubes podem ser lidos" on public.clubes for select using (true);
create policy "Admin gerencia clubes" on public.clubes for all
  using (public.usuario_eh_admin()) with check (public.usuario_eh_admin());
create policy "Dono atualiza seu clube" on public.clubes for update
  using (auth.uid() = usuario_dono_id)
  with check (auth.uid() = usuario_dono_id);

drop policy if exists "Jogadores são visíveis para todos" on public.jogadores;
drop policy if exists "Donos podem gerenciar jogadores de seus clubes" on public.jogadores;
drop policy if exists "Jogadores podem ser lidos" on public.jogadores;
drop policy if exists "Admin e dono gerenciam jogadores" on public.jogadores;
create policy "Jogadores podem ser lidos" on public.jogadores for select using (true);
create policy "Admin e dono gerenciam jogadores" on public.jogadores for all
  using (
    public.usuario_eh_admin()
    or exists (select 1 from public.clubes c where c.id = clube_id and c.usuario_dono_id = auth.uid())
  )
  with check (
    public.usuario_eh_admin()
    or exists (select 1 from public.clubes c where c.id = clube_id and c.usuario_dono_id = auth.uid())
  );

drop policy if exists "Jogos são visíveis para todos" on public.jogos;
drop policy if exists "Admin pode gerenciar jogos" on public.jogos;
drop policy if exists "Jogos podem ser lidos" on public.jogos;
drop policy if exists "Admin gerencia jogos" on public.jogos;
create policy "Jogos podem ser lidos" on public.jogos for select using (true);
create policy "Admin gerencia jogos" on public.jogos for all
  using (public.usuario_eh_admin()) with check (public.usuario_eh_admin());

drop policy if exists "Estatísticas são visíveis para todos" on public.estatisticas;
drop policy if exists "Admin pode gerenciar estatísticas" on public.estatisticas;
drop policy if exists "Estatisticas podem ser lidas" on public.estatisticas;
drop policy if exists "Admin gerencia estatisticas" on public.estatisticas;
create policy "Estatisticas podem ser lidas" on public.estatisticas for select using (true);
create policy "Admin gerencia estatisticas" on public.estatisticas for all
  using (public.usuario_eh_admin()) with check (public.usuario_eh_admin());

drop policy if exists "Transferências são visíveis para todos" on public.transferencias;
drop policy if exists "Donos podem gerenciar transferências" on public.transferencias;
drop policy if exists "Transferencias podem ser lidas" on public.transferencias;
drop policy if exists "Admin e donos gerenciam transferencias" on public.transferencias;
create policy "Transferencias podem ser lidas" on public.transferencias for select using (true);
create policy "Admin e donos gerenciam transferencias" on public.transferencias for all
  using (
    public.usuario_eh_admin()
    or exists (
      select 1 from public.clubes c
      where c.usuario_dono_id = auth.uid()
        and c.id in (clube_origem_id, clube_destino_id)
    )
  )
  with check (
    public.usuario_eh_admin()
    or exists (
      select 1 from public.clubes c
      where c.usuario_dono_id = auth.uid()
        and c.id in (clube_origem_id, clube_destino_id)
    )
  );

drop policy if exists "Notícias são visíveis para todos" on public.noticias;
drop policy if exists "Donos podem gerenciar notícias de seus clubes" on public.noticias;
drop policy if exists "Noticias podem ser lidas" on public.noticias;
drop policy if exists "Admin e dono gerenciam noticias" on public.noticias;
create policy "Noticias podem ser lidas" on public.noticias for select using (true);
create policy "Admin e dono gerenciam noticias" on public.noticias for all
  using (
    public.usuario_eh_admin()
    or exists (select 1 from public.clubes c where c.id = clube_id and c.usuario_dono_id = auth.uid())
  )
  with check (
    public.usuario_eh_admin()
    or exists (select 1 from public.clubes c where c.id = clube_id and c.usuario_dono_id = auth.uid())
  );

commit;
