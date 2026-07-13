// Supabase Database for Resenleirão App
// This replaces the mock database with real Supabase client

import { supabase } from "./supabase";
import type {
  Usuario,
  Clube,
  Jogador,
  Jogo,
  EstatisticaJogador,
  Transferencia,
  DraftEstado,
  ContratacaoDraft,
  TabelaLinha,
  ArtilheiroRanking,
  AssistenteRanking,
  Noticia,
} from "../types";

const verificarErro = (error: { message: string } | null, operacao: string) => {
  if (error) throw new Error(`${operacao}: ${error.message}`);
};

// ============== SUPABASE DB FUNCTIONS ==============

// Helper function to get or create user profile
const getUserProfile = async (authUser: { id: string; email?: string }): Promise<Usuario | null> => {
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (userData) {
    return {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      role: userData.role,
      clube_id: userData.clube_id
    };
  }

  // If user doesn't have profile, create one
  if (userError?.code === 'PGRST116' && authUser.email) {
    const isAdmin = authUser.email === 'admin@resenleirao.com';
    const clubeMap: Record<string, number | null> = {
      'leo@resenleirao.com': 1,
      'felipe@resenleirao.com': 2,
      'diego@resenleirao.com': 3,
      'pedro@resenleirao.com': 4,
      'berenguer@resenleirao.com': 5,
      'bruno@resenleirao.com': 6,
      'yves@resenleirao.com': 7,
      'adriano@resenleirao.com': 8,
      'jhonny@resenleirao.com': 9,
      'piscina@resenleirao.com': 10,
    };

    const { data: newUserData } = await supabase
      .from('usuarios')
      .insert({
        id: authUser.id,
        email: authUser.email,
        nome: authUser.email.split('@')[0],
        role: isAdmin ? 'admin' : 'dono',
        clube_id: clubeMap[authUser.email] || null
      })
      .select()
      .single();

    if (newUserData) {
      return {
        id: newUserData.id,
        email: newUserData.email,
        nome: newUserData.nome,
        role: newUserData.role,
        clube_id: newUserData.clube_id
      };
    }
  }

  return null;
};

export const db = {
  // Auth
  auth: {
    login: async (email: string, senha: string): Promise<Usuario | null> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error || !data.user) return null;

      return getUserProfile(data.user);
    },
    getCurrentUser: async (): Promise<Usuario | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      return getUserProfile(session.user);
    },
    setCurrentUser: async (user: Usuario | null) => {
      // Não usado com Supabase Auth - mantido para compatibilidade
      if (user) {
        localStorage.setItem("resenleirao_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("resenleirao_user");
      }
    },
  },

  // Perfis de usuários (operações administrativas protegidas por RPC)
  usuarios: {
    listarDonos: async (): Promise<Usuario[]> => {
      const { data, error } = await supabase.rpc('admin_listar_donos');
      verificarErro(error, 'Erro ao listar donos');
      return (data || []) as Usuario[];
    },
    associarClube: async (clubeId: string, usuarioId: string | null): Promise<void> => {
      const { error } = await supabase.rpc('admin_associar_clube_dono', {
        p_clube_id: clubeId,
        p_usuario_id: usuarioId,
      });
      verificarErro(error, 'Erro ao associar dono ao clube');
    },
  },

  // Clubes
  clubes: {
    listar: async (): Promise<Clube[]> => {
      const { data, error } = await supabase.from('clubes').select('*');
      verificarErro(error, 'Erro ao listar clubes');
      return data || [];
    },
    buscarPorId: async (id: string): Promise<Clube | undefined> => {
      const { data, error } = await supabase.from('clubes').select('*').eq('id', id).maybeSingle();
      verificarErro(error, 'Erro ao buscar clube');
      return data || undefined;
    },
    buscarPorDono: async (usuarioId: string, clubeId?: string | null): Promise<Clube | undefined> => {
      if (clubeId) {
        const clubeVinculado = await db.clubes.buscarPorId(clubeId);
        if (clubeVinculado) return clubeVinculado;
      }

      const { data: clubeDoDono, error: erroClubeDoDono } = await supabase
        .from('clubes')
        .select('*')
        .eq('usuario_dono_id', usuarioId)
        .maybeSingle();
      verificarErro(erroClubeDoDono, 'Erro ao buscar clube do usuário');

      if (clubeDoDono) return clubeDoDono;

      // Bancos configurados pela primeira versão guardavam o vínculo apenas em
      // usuarios.clube_id. O fallback mantém esses usuários funcionando e a
      // migração corrige também o vínculo inverso usado pelo RLS.
      const { data: perfil, error: erroPerfil } = await supabase
        .from('usuarios')
        .select('clube_id')
        .eq('id', usuarioId)
        .maybeSingle();
      verificarErro(erroPerfil, 'Erro ao buscar vínculo do usuário');

      if (!perfil?.clube_id) return undefined;
      const { data: clubeDoPerfil, error: erroClubeDoPerfil } = await supabase
        .from('clubes')
        .select('*')
        .eq('id', perfil.clube_id)
        .maybeSingle();
      verificarErro(erroClubeDoPerfil, 'Erro ao buscar clube vinculado');
      return clubeDoPerfil || undefined;
    },
    criar: async (clube: Omit<Clube, "id">): Promise<Clube> => {
      const { data, error } = await supabase.from('clubes').insert(clube).select().single();
      verificarErro(error, 'Erro ao criar clube');
      return data;
    },
    atualizar: async (id: string, dados: Partial<Clube>): Promise<Clube | null> => {
      const { data, error } = await supabase.from('clubes').update(dados).eq('id', id).select().single();
      verificarErro(error, 'Erro ao atualizar clube');
      return data;
    },
    remover: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('clubes').delete().eq('id', id);
      verificarErro(error, 'Erro ao remover clube');
      return !error;
    },
  },

  // Jogadores
  jogadores: {
    listar: async (clubeId?: string): Promise<Jogador[]> => {
      let query = supabase.from('jogadores').select('*');
      if (clubeId) query = query.eq('clube_id', clubeId);
      const { data, error } = await query;
      verificarErro(error, 'Erro ao listar jogadores');
      return data || [];
    },
    buscarPorId: async (id: string): Promise<Jogador | undefined> => {
      const { data, error } = await supabase.from('jogadores').select('*').eq('id', id).maybeSingle();
      verificarErro(error, 'Erro ao buscar jogador');
      return data || undefined;
    },
    criar: async (jogador: Omit<Jogador, "id">): Promise<Jogador> => {
      const { data, error } = await supabase.from('jogadores').insert(jogador).select().single();
<<<<<<< HEAD
      if (error) throw new Error(error.message);
=======
      verificarErro(error, 'Erro ao criar jogador');
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
      return data;
    },
    atualizar: async (id: string, dados: Partial<Jogador>): Promise<Jogador | null> => {
      const { data, error } = await supabase.from('jogadores').update(dados).eq('id', id).select().single();
      verificarErro(error, 'Erro ao atualizar jogador');
      return data;
    },
    remover: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('jogadores').delete().eq('id', id);
      verificarErro(error, 'Erro ao remover jogador');
      return !error;
    },
  },

  // Jogos
  jogos: {
    listar: async (fase?: string): Promise<Jogo[]> => {
      let query = supabase.from('jogos').select('*').order('rodada');
      if (fase) query = query.eq('fase', fase);
      const { data, error } = await query;
      verificarErro(error, 'Erro ao listar jogos');
      return data || [];
    },
    buscarPorId: async (id: string): Promise<Jogo | undefined> => {
      const { data, error } = await supabase.from('jogos').select('*').eq('id', id).maybeSingle();
      verificarErro(error, 'Erro ao buscar jogo');
      return data || undefined;
    },
    buscarPorClube: async (clubeId: string): Promise<Jogo[]> => {
      const { data, error } = await supabase
        .from('jogos')
        .select('*')
        .or(`clube_casa_id.eq.${clubeId},clube_fora_id.eq.${clubeId}`);
      verificarErro(error, 'Erro ao listar jogos do clube');
      return data || [];
    },
    criar: async (jogo: Omit<Jogo, "id">): Promise<Jogo> => {
      const { data, error } = await supabase.from('jogos').insert(jogo).select().single();
      verificarErro(error, 'Erro ao criar jogo');
      return data;
    },
    atualizarResultado: async (
      id: string,
      golsCasa: number,
      golsFora: number,
    ): Promise<Jogo | null> => {
      const { data, error } = await supabase
        .from('jogos')
        .update({ gols_casa: golsCasa, gols_fora: golsFora, status: 'realizado' })
        .eq('id', id)
        .select()
        .single();
      verificarErro(error, 'Erro ao atualizar resultado');
      return data;
    },
    remover: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('jogos').delete().eq('id', id);
      verificarErro(error, 'Erro ao remover jogo');
      return !error;
    },
<<<<<<< HEAD
    gerarIdaVolta: async (substituir = false): Promise<number> => {
      const { data, error } = await supabase.rpc('gerar_calendario_ida_volta', { p_substituir: substituir });
      if (error) throw new Error(error.message);
      return data || 0;
=======
    gerarTabela: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('admin_gerar_jogos');
      verificarErro(error, 'Erro ao gerar jogos');
      return Number(data || 0);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    },
  },

  // Estatísticas
  estatisticas: {
    listar: async (): Promise<EstatisticaJogador[]> => {
      const { data, error } = await supabase.from('estatisticas').select('*');
      verificarErro(error, 'Erro ao listar estatísticas');
      return data || [];
    },
    listarPorJogador: async (jogadorId: string): Promise<EstatisticaJogador[]> => {
      const { data, error } = await supabase.from('estatisticas').select('*').eq('jogador_id', jogadorId);
      verificarErro(error, 'Erro ao listar estatísticas do jogador');
      return data || [];
    },
    listarPorJogo: async (jogoId: string): Promise<EstatisticaJogador[]> => {
      const { data, error } = await supabase.from('estatisticas').select('*').eq('jogo_id', jogoId);
      verificarErro(error, 'Erro ao listar estatísticas do jogo');
      return data || [];
    },
    criar: async (stat: Omit<EstatisticaJogador, "id">): Promise<EstatisticaJogador> => {
      const { data, error } = await supabase.from('estatisticas').insert(stat).select().single();
      verificarErro(error, 'Erro ao criar estatística');
      return data;
    },
    remover: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('estatisticas').delete().eq('id', id);
      verificarErro(error, 'Erro ao remover estatística');
      return !error;
    },
  },

  // Transferências
  transferencias: {
    listar: async (): Promise<Transferencia[]> => {
      const { data, error } = await supabase.from('transferencias').select('*').order('data', { ascending: false });
      verificarErro(error, 'Erro ao listar transferências');
      return data || [];
    },
    listarPorClube: async (clubeId: string): Promise<Transferencia[]> => {
      const { data, error } = await supabase
        .from('transferencias')
        .select('*')
        .or(`clube_origem_id.eq.${clubeId},clube_destino_id.eq.${clubeId}`);
      verificarErro(error, 'Erro ao listar transferências do clube');
      return data || [];
    },
    listarRecebidas: async (clubeId: string): Promise<Transferencia[]> => {
      const { data, error } = await supabase
        .from('transferencias')
        .select('*')
        .eq('clube_destino_id', clubeId)
        .eq('status', 'pendente');
      verificarErro(error, 'Erro ao listar propostas recebidas');
      return data || [];
    },
    criar: async (
      t: Omit<Transferencia, "id">,
<<<<<<< HEAD
    ): Promise<{ ok: false; erro: string } | { ok: true; data: Transferencia }> => {
      const { data, error } = await supabase.rpc('criar_proposta_transferencia', {
        p_jogador_id: t.jogador_id, p_valor: t.valor, p_tipo: t.tipo,
        p_jogador_troca_id: t.jogador_troca_id, p_mensagem: t.mensagem || '',
      });
      if (error) return { ok: false, erro: error.message };
      return { ok: true, data };
    },
    aceitar: async (id: string): Promise<Transferencia | null> => {
      const { data } = await supabase.rpc('decidir_transferencia', { p_transferencia_id: id, p_aceitar: true });
      return data;
    },
    rejeitar: async (id: string): Promise<Transferencia | null> => {
      const { data } = await supabase.rpc('decidir_transferencia', { p_transferencia_id: id, p_aceitar: false });
=======
    ): Promise<{ ok: false; erro: string } | { ok: true }> => {
      const { error } = await supabase.rpc('criar_proposta_transferencia', {
        p_jogador_id: t.jogador_id,
        p_clube_destino_id: t.clube_destino_id,
        p_valor: t.valor,
        p_tipo: t.tipo,
        p_jogador_troca_id: t.jogador_troca_id,
        p_mensagem: t.mensagem,
      });
      if (error) return { ok: false, erro: error.message };
      return { ok: true };
    },
    aceitar: async (id: string): Promise<Transferencia | null> => {
      const { error } = await supabase.rpc('aceitar_proposta_transferencia', { p_transferencia_id: id });
      verificarErro(error, 'Erro ao aceitar proposta');
      const { data, error: erroBusca } = await supabase.from('transferencias').select('*').eq('id', id).single();
      verificarErro(erroBusca, 'Erro ao recarregar proposta');
      return data;
    },
    rejeitar: async (id: string): Promise<Transferencia | null> => {
      const { error } = await supabase.rpc('rejeitar_proposta_transferencia', { p_transferencia_id: id });
      verificarErro(error, 'Erro ao rejeitar proposta');
      const { data, error: erroBusca } = await supabase.from('transferencias').select('*').eq('id', id).single();
      verificarErro(erroBusca, 'Erro ao recarregar proposta');
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
      return data;
    },
  },

  draft: {
<<<<<<< HEAD
    aberto: async (): Promise<any | null> => (await supabase.from('drafts').select('*').eq('status', 'aberto').order('criado_em', { ascending: false }).limit(1).maybeSingle()).data,
    iniciar: async (): Promise<any> => { const { data, error } = await supabase.rpc('iniciar_draft'); if (error) throw new Error(error.message); return data; },
    escolhas: async (draftId: string): Promise<any[]> => (await supabase.from('escolhas_draft').select('*').eq('draft_id', draftId).order('escolha')).data || [],
    escolher: async (nome: string, posicao: Jogador['posicao'], numero: number, valor: number): Promise<Jogador> => {
      const { data, error } = await supabase.rpc('escolher_no_draft', { p_nome: nome, p_posicao: posicao, p_numero: numero, p_valor: valor });
      if (error) throw new Error(error.message); return data;
=======
    buscarEstado: async (): Promise<DraftEstado> => {
      const { data, error } = await supabase.from('draft_estado').select('*').eq('id', 1).single();
      verificarErro(error, 'Erro ao carregar estado do draft');
      return {
        ...data,
        ordem_clubes: (data.ordem_clubes || []).map(String),
      } as DraftEstado;
    },
    listarContratacoes: async (): Promise<ContratacaoDraft[]> => {
      const { data, error } = await supabase.from('draft_contratacoes').select('*').order('rodada');
      verificarErro(error, 'Erro ao listar contratações do draft');
      return data || [];
    },
    iniciar: async (ordemClubes: string[]): Promise<void> => {
      const { error } = await supabase.rpc('admin_iniciar_draft', { p_ordem_clubes: ordemClubes });
      verificarErro(error, 'Erro ao iniciar draft');
    },
    contratar: async (dados: { nome: string; posicao: Jogador['posicao']; valor: number }): Promise<void> => {
      const { error } = await supabase.rpc('draft_contratar_jogador', {
        p_nome: dados.nome,
        p_posicao: dados.posicao,
        p_valor: dados.valor,
      });
      verificarErro(error, 'Erro ao contratar jogador no draft');
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    },
  },

  // Notícias
  noticias: {
    listar: async (): Promise<Noticia[]> => {
      const { data } = await supabase.from('noticias').select('*').order('data', { ascending: false });
      return data || [];
    },
    listarPorClube: async (clubeId: string): Promise<Noticia[]> => {
      const { data } = await supabase
        .from('noticias')
        .select('*')
        .eq('clube_id', clubeId)
        .order('data', { ascending: false });
      return data || [];
    },
    listarDestaques: async (): Promise<Noticia[]> => {
      const { data } = await supabase
        .from('noticias')
        .select('*')
        .eq('destaque', true)
        .order('data', { ascending: false });
      return data || [];
    },
    criar: async (noticia: Omit<Noticia, "id">): Promise<Noticia> => {
      const { data } = await supabase.from('noticias').insert(noticia).select().single();
      return data;
    },
    atualizar: async (id: string, dados: Partial<Noticia>): Promise<Noticia | null> => {
      const { data } = await supabase.from('noticias').update(dados).eq('id', id).select().single();
      return data;
    },
    remover: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('noticias').delete().eq('id', id);
      return !error;
    },
  },

  // Views/Calculos
  views: {
    tabela: async (): Promise<TabelaLinha[]> => {
      const { data: clubes, error: erroClubes } = await supabase.from('clubes').select('*');
      verificarErro(erroClubes, 'Erro ao calcular tabela');
      if (!clubes) return [];

      const tabela: TabelaLinha[] = [];

      for (const clube of clubes) {
        const { data: jogosDoClube, error: erroJogos } = await supabase
          .from('jogos')
          .select('*')
          .eq('status', 'realizado')
          .or(`clube_casa_id.eq.${clube.id},clube_fora_id.eq.${clube.id}`);
        verificarErro(erroJogos, 'Erro ao calcular jogos da tabela');

        let pontos = 0;
        let vitorias = 0;
        let empates = 0;
        let derrotas = 0;
        let golsPro = 0;
        let golsContra = 0;

        jogosDoClube?.forEach((jogo) => {
          if (jogo.gols_casa === null || jogo.gols_fora === null) return;
          const golsFavor = jogo.clube_casa_id === clube.id ? jogo.gols_casa : jogo.gols_fora;
          const golsSofridos = jogo.clube_casa_id === clube.id ? jogo.gols_fora : jogo.gols_casa;

          golsPro += golsFavor;
          golsContra += golsSofridos;

          if (golsFavor > golsSofridos) {
            pontos += 3;
            vitorias++;
          } else if (golsFavor === golsSofridos) {
            pontos += 1;
            empates++;
          } else {
            derrotas++;
          }
        });

        const totalJogos = jogosDoClube?.length || 0;
        const aproveitamento = totalJogos > 0
          ? Math.round((pontos / (totalJogos * 3)) * 1000) / 10
          : 0;

        tabela.push({
          clube_id: clube.id,
          clube_nome: clube.nome,
          escudo_url: clube.escudo_url,
          cor_principal: clube.cor_principal,
          pontos,
          jogos: totalJogos,
          vitorias,
          empates,
          derrotas,
          gols_pro: golsPro,
          gols_contra: golsContra,
          saldo_gols: golsPro - golsContra,
          aproveitamento,
        });
      }

      return tabela.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
        return b.saldo_gols - a.saldo_gols;
      });
    },

    artilharia: async (): Promise<ArtilheiroRanking[]> => {
      const [statsResult, jogadoresResult, clubesResult] = await Promise.all([
        supabase.from('estatisticas').select('jogador_id, gols'),
        supabase.from('jogadores').select('id, nome, clube_id'),
        supabase.from('clubes').select('id, nome'),
      ]);
      verificarErro(statsResult.error, 'Erro ao calcular artilharia');
      verificarErro(jogadoresResult.error, 'Erro ao carregar jogadores da artilharia');
      verificarErro(clubesResult.error, 'Erro ao carregar clubes da artilharia');
      const stats = statsResult.data;
      const jogadores = jogadoresResult.data;
      const clubes = clubesResult.data;

      const golMap = new Map<string, number>();
      stats?.forEach((e) => {
        golMap.set(e.jogador_id, (golMap.get(e.jogador_id) || 0) + e.gols);
      });

      return Array.from(golMap.entries())
        .map(([jogadorId, gols]) => {
          const jogador = jogadores?.find((j) => j.id === jogadorId);
          const clube = clubes?.find((c) => c.id === jogador?.clube_id);
          return {
            jogador_id: jogadorId,
            jogador_nome: jogador?.nome || "Desconhecido",
            clube_nome: clube?.nome || "Sem clube",
            clube_id: jogador?.clube_id || "",
            gols,
          };
        })
        .sort((a, b) => b.gols - a.gols);
    },

    assistencias: async (): Promise<AssistenteRanking[]> => {
      const [statsResult, jogadoresResult, clubesResult] = await Promise.all([
        supabase.from('estatisticas').select('jogador_id, assistencias'),
        supabase.from('jogadores').select('id, nome, clube_id'),
        supabase.from('clubes').select('id, nome'),
      ]);
      verificarErro(statsResult.error, 'Erro ao calcular assistências');
      verificarErro(jogadoresResult.error, 'Erro ao carregar jogadores das assistências');
      verificarErro(clubesResult.error, 'Erro ao carregar clubes das assistências');
      const stats = statsResult.data;
      const jogadores = jogadoresResult.data;
      const clubes = clubesResult.data;

      const astMap = new Map<string, number>();
      stats?.forEach((e) => {
        astMap.set(e.jogador_id, (astMap.get(e.jogador_id) || 0) + e.assistencias);
      });

      return Array.from(astMap.entries())
        .map(([jogadorId, assistencias]) => {
          const jogador = jogadores?.find((j) => j.id === jogadorId);
          const clube = clubes?.find((c) => c.id === jogador?.clube_id);
          return {
            jogador_id: jogadorId,
            jogador_nome: jogador?.nome || "Desconhecido",
            clube_nome: clube?.nome || "Sem clube",
            clube_id: jogador?.clube_id || "",
            assistencias,
          };
        })
        .sort((a, b) => b.assistencias - a.assistencias);
    },
  },
};
