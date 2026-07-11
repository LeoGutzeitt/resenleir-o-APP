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
  TabelaLinha,
  ArtilheiroRanking,
  AssistenteRanking,
  Noticia,
} from "../types";

const verificarErro = (error: { message: string } | null, operacao: string) => {
  if (error) throw new Error(`${operacao}: ${error.message}`);
};

// ============== SUPABASE DB FUNCTIONS ==============

export const db = {
  // Auth
  auth: {
    login: async (email: string, senha: string): Promise<Usuario | null> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error || !data.user) return null;

      // Buscar dados do usuário da tabela usuarios
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
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
      return null;
    },
    getCurrentUser: async (): Promise<Usuario | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
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
      return null;
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
    buscarPorDono: async (usuarioId: string): Promise<Clube | undefined> => {
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
      verificarErro(error, 'Erro ao criar jogador');
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
      const { data } = await supabase.from('transferencias').select('*');
      return data || [];
    },
    listarPorClube: async (clubeId: string): Promise<Transferencia[]> => {
      const { data } = await supabase
        .from('transferencias')
        .select('*')
        .or(`clube_origem_id.eq.${clubeId},clube_destino_id.eq.${clubeId}`);
      return data || [];
    },
    listarRecebidas: async (clubeId: string): Promise<Transferencia[]> => {
      const { data } = await supabase
        .from('transferencias')
        .select('*')
        .eq('clube_destino_id', clubeId)
        .eq('status', 'pendente');
      return data || [];
    },
    criar: async (
      t: Omit<Transferencia, "id">,
    ): Promise<{ ok: false; erro: string } | { ok: true; data: Transferencia }> => {
      const { data: clubeDestino } = await supabase.from('clubes').select('orcamento').eq('id', t.clube_destino_id).single();
      
      if (t.valor > 0 && (!clubeDestino || clubeDestino.orcamento < t.valor)) {
        return { ok: false, erro: `Orçamento insuficiente` };
      }

      const { data } = await supabase.from('transferencias').insert(t).select().single();
      return { ok: true, data };
    },
    aceitar: async (id: string): Promise<Transferencia | null> => {
      // Implementar lógica de aceitação
      const { data: t } = await supabase.from('transferencias').select('*').eq('id', id).single();
      if (!t) return null;

      // Atualizar jogador
      if (t.jogador_troca_id) {
        await supabase.from('jogadores').update({ clube_id: t.clube_origem_id }).eq('id', t.jogador_troca_id);
      }
      await supabase.from('jogadores').update({ clube_id: t.clube_destino_id }).eq('id', t.jogador_id);

      // Atualizar orçamento
      if (t.valor > 0) {
        await supabase.rpc('increment_orcamento', { clube_id: t.clube_origem_id, valor: t.valor });
        await supabase.rpc('decrement_orcamento', { clube_id: t.clube_destino_id, valor: t.valor });
      }

      const { data } = await supabase
        .from('transferencias')
        .update({ status: 'aceita' })
        .eq('id', id)
        .select()
        .single();
      return data;
    },
    rejeitar: async (id: string): Promise<Transferencia | null> => {
      const { data } = await supabase
        .from('transferencias')
        .update({ status: 'rejeitada' })
        .eq('id', id)
        .select()
        .single();
      return data;
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
