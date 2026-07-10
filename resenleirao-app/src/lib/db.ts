// Mock Database for Resenleirão App
// This simulates Supabase for local development
// Replace with real Supabase client when deploying

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
} from "../types";

// ============== MOCK DATA STORE ==============

let usuarios: Usuario[] = [
  {
    id: "1",
    email: "admin@resenleirao.com",
    nome: "Admin",
    role: "admin",
    clube_id: null,
  },
  {
    id: "2",
    email: "dono1@resenleirao.com",
    nome: "Leo",
    role: "dono",
    clube_id: "1",
  },
  {
    id: "3",
    email: "dono2@resenleirao.com",
    nome: "Pedro",
    role: "dono",
    clube_id: "2",
  },
  {
    id: "4",
    email: "dono3@resenleirao.com",
    nome: "João",
    role: "dono",
    clube_id: "3",
  },
  {
    id: "5",
    email: "dono4@resenleirao.com",
    nome: "Lucas",
    role: "dono",
    clube_id: "4",
  },
  {
    id: "6",
    email: "dono5@resenleirao.com",
    nome: "Gabriel",
    role: "dono",
    clube_id: "5",
  },
  {
    id: "7",
    email: "dono6@resenleirao.com",
    nome: "Felipe",
    role: "dono",
    clube_id: "6",
  },
  {
    id: "8",
    email: "dono7@resenleirao.com",
    nome: "Rafael",
    role: "dono",
    clube_id: "7",
  },
  {
    id: "9",
    email: "dono8@resenleirao.com",
    nome: "Thiago",
    role: "dono",
    clube_id: "8",
  },
  {
    id: "10",
    email: "dono9@resenleirao.com",
    nome: "Bruno",
    role: "dono",
    clube_id: "9",
  },
  {
    id: "11",
    email: "dono10@resenleirao.com",
    nome: "Vinicius",
    role: "dono",
    clube_id: "10",
  },
];

const clubesData: Clube[] = [
  {
    id: "1",
    nome: "Fênix FC",
    escudo_url: null,
    cor_principal: "#FF4500",
    usuario_dono_id: "2",
    orcamento: 100000000,
  },
  {
    id: "2",
    nome: "Trovão Azul",
    escudo_url: null,
    cor_principal: "#1E90FF",
    usuario_dono_id: "3",
    orcamento: 100000000,
  },
  {
    id: "3",
    nome: "Leões da Vila",
    escudo_url: null,
    cor_principal: "#FFD700",
    usuario_dono_id: "4",
    orcamento: 100000000,
  },
  {
    id: "4",
    nome: "Águias Negras",
    escudo_url: null,
    cor_principal: "#2F2F2F",
    usuario_dono_id: "5",
    orcamento: 100000000,
  },
  {
    id: "5",
    nome: "Dragões Vermelhos",
    escudo_url: null,
    cor_principal: "#DC143C",
    usuario_dono_id: "6",
    orcamento: 100000000,
  },
  {
    id: "6",
    nome: "Tubarões FC",
    escudo_url: null,
    cor_principal: "#00CED1",
    usuario_dono_id: "7",
    orcamento: 100000000,
  },
  {
    id: "7",
    nome: "Guerreiros FC",
    escudo_url: null,
    cor_principal: "#228B22",
    usuario_dono_id: "8",
    orcamento: 100000000,
  },
  {
    id: "8",
    nome: "Corsários",
    escudo_url: null,
    cor_principal: "#8B0000",
    usuario_dono_id: "9",
    orcamento: 100000000,
  },
  {
    id: "9",
    nome: "Tornado FC",
    escudo_url: null,
    cor_principal: "#9400D3",
    usuario_dono_id: "10",
    orcamento: 100000000,
  },
  {
    id: "10",
    nome: "Panteras FC",
    escudo_url: null,
    cor_principal: "#FF69B4",
    usuario_dono_id: "11",
    orcamento: 100000000,
  },
];

const posicoes = [
  "Goleiro",
  "Zagueiro",
  "Lateral",
  "Meio-Campo",
  "Atacante",
] as const;
const nomesJogadores = [
  "Carlos Alberto",
  "Roberto Santos",
  "Marcos Silva",
  "Paulo Souza",
  "André Lima",
  "Felipe Costa",
  "Rafael Oliveira",
  "Bruno Martins",
  "Thiago Pereira",
  "Diego Rodrigues",
  "Lucas Almeida",
  "Gabriel Ferreira",
  "Henrique Barbosa",
  "Eduardo Gomes",
  "Vinicius Dias",
  "Fernando Ribeiro",
  "Gustavo Carvalho",
  "Daniel Teixeira",
  "Rodrigo Araújo",
  "Leandro Nunes",
  "Fábio Correia",
  "Renato Campos",
  "Alexandre Borges",
  "Ricardo Mendes",
  "Murilo Freitas",
  "Caio Monteiro",
  "Igor Cardoso",
  "Mateus Rocha",
  "João Pedro",
  "Luiz Felipe",
];

function gerarValorMercado(posicao: string): number {
  const base =
    posicao === "Goleiro"
      ? 15000000
      : posicao === "Zagueiro"
        ? 12000000
        : posicao === "Lateral"
          ? 10000000
          : posicao === "Meio-Campo"
            ? 18000000
            : 22000000;
  return base + Math.floor(Math.random() * 20000000);
}

function gerarJogadores(): Jogador[] {
  const jogadores: Jogador[] = [];
  let id = 1;
  for (let clubeId = 1; clubeId <= 10; clubeId++) {
    const jogadoresDoClube = nomesJogadores.slice(
      (clubeId - 1) * 3,
      clubeId * 3,
    );
    jogadoresDoClube.forEach((nome, index) => {
      const posicao = posicoes[index % 5];
      jogadores.push({
        id: String(id++),
        nome,
        posicao,
        numero: index + 1 + (clubeId - 1) * 10,
        clube_id: String(clubeId),
        foto_url: null,
        status: "ativo",
        valor_mercado: gerarValorMercado(posicao),
        jogos_suspensao: 0,
      });
    });
  }
  return jogadores;
}

let jogadores = gerarJogadores();

function gerarJogos(): Jogo[] {
  const jogos: Jogo[] = [];
  let id = 1;
  const times = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const rodadas: [number, number][][] = [];
  const n = times.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;
  const temp = [...times];

  for (let round = 0; round < rounds; round++) {
    const roundMatches: [number, number][] = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const home = temp[match];
      const away = temp[n - 1 - match];
      if (home !== undefined && away !== undefined) {
        roundMatches.push([home, away]);
      }
    }
    rodadas.push(roundMatches);
    temp.splice(1, 0, temp.pop()!);
  }

  rodadas.forEach((rodada, idx) => {
    rodada.forEach(([casa, fora]) => {
      const data = new Date(2026, 2, 15 + idx * 7);
      jogos.push({
        id: String(id++),
        clube_casa_id: String(casa),
        clube_fora_id: String(fora),
        gols_casa: idx < 5 ? Math.floor(Math.random() * 4) : null,
        gols_fora: idx < 5 ? Math.floor(Math.random() * 4) : null,
        rodada: idx + 1,
        fase: "grupos",
        data: data.toISOString().split("T")[0],
        status: idx < 5 ? "realizado" : "agendado",
      });
    });
  });

  return jogos;
}

let jogos = gerarJogos();

function gerarEstatisticas(): EstatisticaJogador[] {
  const stats: EstatisticaJogador[] = [];
  let id = 1;
  jogos
    .filter((j) => j.status === "realizado")
    .forEach((jogo) => {
      const jogadoresCasa = jogadores.filter(
        (j) => j.clube_id === jogo.clube_casa_id,
      );
      const jogadoresFora = jogadores.filter(
        (j) => j.clube_id === jogo.clube_fora_id,
      );
      [...jogadoresCasa, ...jogadoresFora].forEach((jog) => {
        if (Math.random() > 0.3) {
          stats.push({
            id: String(id++),
            jogador_id: jog.id,
            jogo_id: jogo.id,
            gols: Math.floor(Math.random() * 2),
            assistencias: Math.floor(Math.random() * 2),
            cartoes_amarelos: Math.floor(Math.random() * 2),
            cartoes_vermelhos: Math.random() > 0.9 ? 1 : 0,
          });
        }
      });
    });
  return stats;
}

let estatisticas = gerarEstatisticas();

let transferencias: Transferencia[] = [];

function formatarMoeda(valor: number): string {
  if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `R$ ${(valor / 1000).toFixed(0)}K`;
  return `R$ ${valor}`;
}

// ============== MOCK DB FUNCTIONS ==============

export const db = {
  // Auth
  auth: {
    login: (email: string, senha: string): Usuario | null => {
      const user = usuarios.find((u) => u.email === email);
      if (user && senha === "123456") return user;
      return null;
    },
    getCurrentUser: (): Usuario | null => {
      const stored = localStorage.getItem("resenleirao_user");
      if (stored) return JSON.parse(stored);
      return null;
    },
    setCurrentUser: (user: Usuario | null) => {
      if (user) {
        localStorage.setItem("resenleirao_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("resenleirao_user");
      }
    },
  },

  // Clubes
  clubes: {
    listar: (): Clube[] => [...clubesData],
    buscarPorId: (id: string): Clube | undefined =>
      clubesData.find((c) => c.id === id),
    buscarPorDono: (usuarioId: string): Clube | undefined =>
      clubesData.find((c) => c.usuario_dono_id === usuarioId),
    criar: (clube: Omit<Clube, "id">): Clube => {
      const novo = { ...clube, id: String(clubesData.length + 1) };
      clubesData.push(novo);
      return novo;
    },
    atualizar: (id: string, dados: Partial<Clube>): Clube | null => {
      const idx = clubesData.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      clubesData[idx] = { ...clubesData[idx], ...dados };
      return clubesData[idx];
    },
    remover: (id: string): boolean => {
      const idx = clubesData.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      clubesData.splice(idx, 1);
      return true;
    },
  },

  // Jogadores
  jogadores: {
    listar: (clubeId?: string): Jogador[] => {
      if (clubeId) return jogadores.filter((j) => j.clube_id === clubeId);
      return [...jogadores];
    },
    buscarPorId: (id: string): Jogador | undefined =>
      jogadores.find((j) => j.id === id),
    criar: (jogador: Omit<Jogador, "id">): Jogador => {
      const novo = { ...jogador, id: String(jogadores.length + 1) };
      jogadores.push(novo);
      return novo;
    },
    atualizar: (id: string, dados: Partial<Jogador>): Jogador | null => {
      const idx = jogadores.findIndex((j) => j.id === id);
      if (idx === -1) return null;
      jogadores[idx] = { ...jogadores[idx], ...dados };
      return jogadores[idx];
    },
    remover: (id: string): boolean => {
      const idx = jogadores.findIndex((j) => j.id === id);
      if (idx === -1) return false;
      jogadores.splice(idx, 1);
      return true;
    },
  },

  // Jogos
  jogos: {
    listar: (fase?: string): Jogo[] => {
      if (fase) return jogos.filter((j) => j.fase === fase);
      return [...jogos].sort((a, b) => a.rodada - b.rodada);
    },
    buscarPorId: (id: string): Jogo | undefined =>
      jogos.find((j) => j.id === id),
    buscarPorClube: (clubeId: string): Jogo[] =>
      jogos.filter(
        (j) => j.clube_casa_id === clubeId || j.clube_fora_id === clubeId,
      ),
    criar: (jogo: Omit<Jogo, "id">): Jogo => {
      const novo = { ...jogo, id: String(jogos.length + 1) };
      jogos.push(novo);
      return novo;
    },
    atualizarResultado: (
      id: string,
      golsCasa: number,
      golsFora: number,
    ): Jogo | null => {
      const jogo = jogos.find((j) => j.id === id);
      if (!jogo) return null;
      jogo.gols_casa = golsCasa;
      jogo.gols_fora = golsFora;
      jogo.status = "realizado";
      return jogo;
    },
    remover: (id: string): boolean => {
      const idx = jogos.findIndex((j) => j.id === id);
      if (idx === -1) return false;
      jogos.splice(idx, 1);
      return true;
    },
  },

  // Estatísticas
  estatisticas: {
    listar: (): EstatisticaJogador[] => [...estatisticas],
    listarPorJogador: (jogadorId: string): EstatisticaJogador[] =>
      estatisticas.filter((e) => e.jogador_id === jogadorId),
    listarPorJogo: (jogoId: string): EstatisticaJogador[] =>
      estatisticas.filter((e) => e.jogo_id === jogoId),
    criar: (stat: Omit<EstatisticaJogador, "id">): EstatisticaJogador => {
      const novo = { ...stat, id: String(estatisticas.length + 1) };
      estatisticas.push(novo);
      return novo;
    },
    remover: (id: string): boolean => {
      const idx = estatisticas.findIndex((e) => e.id === id);
      if (idx === -1) return false;
      estatisticas.splice(idx, 1);
      return true;
    },
  },

  // Transferências
  transferencias: {
    listar: (): Transferencia[] => [...transferencias],
    listarPorClube: (clubeId: string): Transferencia[] =>
      transferencias.filter(
        (t) => t.clube_origem_id === clubeId || t.clube_destino_id === clubeId,
      ),
    listarRecebidas: (clubeId: string): Transferencia[] =>
      transferencias.filter(
        (t) => t.clube_origem_id === clubeId && t.status === "pendente",
      ),
    criar: (
      t: Omit<Transferencia, "id">,
    ): { ok: false; erro: string } | { ok: true; data: Transferencia } => {
      // Validar orçamento do COMPRADOR (clube_destino)
      // O vendedor não precisa ter dinheiro para vender
      const clubeDestino = clubesData.find((c) => c.id === t.clube_destino_id);
      if (t.valor > 0 && (!clubeDestino || clubeDestino.orcamento < t.valor)) {
        return { ok: false, erro: `Orçamento insuficiente. ${clubeDestino?.nome || 'Clube'} tem ${formatarMoeda(clubeDestino?.orcamento || 0)} e a proposta é de ${formatarMoeda(t.valor)}` };
      }

      const nova = { ...t, id: String(transferencias.length + 1) };
      transferencias.push(nova);
      return { ok: true, data: nova };
    },
    aceitar: (id: string): Transferencia | null => {
      const t = transferencias.find((tr) => tr.id === id);
      if (!t) return null;

      const jogador = jogadores.find((j) => j.id === t.jogador_id);
      const clubeOrigem = clubesData.find((c) => c.id === t.clube_origem_id);
      const clubeDestino = clubesData.find((c) => c.id === t.clube_destino_id);

      if (!jogador || !clubeOrigem || !clubeDestino) return null;

      // Processar troca de jogador
      if (t.jogador_troca_id) {
        const jogadorTroca = jogadores.find((j) => j.id === t.jogador_troca_id);
        if (jogadorTroca) {
          jogadorTroca.clube_id = t.clube_origem_id;
        }
      }

      // Transferir jogador principal para o destino (comprador)
      jogador.clube_id = t.clube_destino_id;

      // Processar valores financeiros
      if (t.valor > 0) {
        // Origem (vendedor) RECEBE o dinheiro
        clubeOrigem.orcamento += t.valor;
        // Destino (comprador) PAGA o dinheiro
        clubeDestino.orcamento -= t.valor;
      }

      t.status = "aceita";
      return t;
    },
    rejeitar: (id: string): Transferencia | null => {
      const t = transferencias.find((tr) => tr.id === id);
      if (!t) return null;
      t.status = "rejeitada";
      return t;
    },
  },

  // Views/Calculos
  views: {
    tabela: (): TabelaLinha[] => {
      const clubes = clubesData;
      return clubes
        .map((clube) => {
          const jogosDoClube = jogos.filter(
            (j) =>
              (j.clube_casa_id === clube.id || j.clube_fora_id === clube.id) &&
              j.status === "realizado",
          );
          let pontos = 0,
            vitorias = 0,
            empates = 0,
            derrotas = 0;
          let golsPro = 0,
            golsContra = 0;

          jogosDoClube.forEach((jogo) => {
            if (jogo.gols_casa === null || jogo.gols_fora === null) return;
            const golsFavor =
              jogo.clube_casa_id === clube.id ? jogo.gols_casa : jogo.gols_fora;
            const golsSofridos =
              jogo.clube_casa_id === clube.id ? jogo.gols_fora : jogo.gols_casa;

            golsPro += golsFavor;
            golsContra += golsSofridos;

            if (golsFavor > golsSofridos) {
              pontos += 3;
              vitorias++;
            } else if (golsFavor === golsSofridos) {
              pontos += 1;
              empates++;
            } else derrotas++;
          });

          const jogosCount = jogosDoClube.length;
          return {
            clube_id: clube.id,
            clube_nome: clube.nome,
            escudo_url: clube.escudo_url,
            cor_principal: clube.cor_principal,
            pontos,
            jogos: jogosCount,
            vitorias,
            empates,
            derrotas,
            gols_pro: golsPro,
            gols_contra: golsContra,
            saldo_gols: golsPro - golsContra,
            aproveitamento:
              jogosCount > 0
                ? Number(((pontos / (jogosCount * 3)) * 100).toFixed(1))
                : 0,
          };
        })
        .sort((a, b) => {
          if (b.pontos !== a.pontos) return b.pontos - a.pontos;
          if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
          return b.saldo_gols - a.saldo_gols;
        });
    },

    artilharia: (): ArtilheiroRanking[] => {
      const golMap = new Map<string, number>();
      estatisticas.forEach((e) => {
        golMap.set(e.jogador_id, (golMap.get(e.jogador_id) || 0) + e.gols);
      });
      return Array.from(golMap.entries())
        .map(([jogadorId, gols]) => {
          const jogador = jogadores.find((j) => j.id === jogadorId);
          const clube = jogador
            ? clubesData.find((c) => c.id === jogador.clube_id)
            : undefined;
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

    assistencias: (): AssistenteRanking[] => {
      const astMap = new Map<string, number>();
      estatisticas.forEach((e) => {
        astMap.set(
          e.jogador_id,
          (astMap.get(e.jogador_id) || 0) + e.assistencias,
        );
      });
      return Array.from(astMap.entries())
        .map(([jogadorId, assistencias]) => {
          const jogador = jogadores.find((j) => j.id === jogadorId);
          const clube = jogador
            ? clubesData.find((c) => c.id === jogador.clube_id)
            : undefined;
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
