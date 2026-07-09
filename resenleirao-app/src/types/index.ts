export type Role = 'admin' | 'dono' | 'visitante';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: Role;
  clube_id: string | null;
}

export interface Clube {
  id: string;
  nome: string;
  escudo_url: string | null;
  cor_principal: string;
  usuario_dono_id: string | null;
}

export interface Jogador {
  id: string;
  nome: string;
  posicao: 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-Campo' | 'Atacante';
  numero: number;
  clube_id: string;
  foto_url: string | null;
  status: 'ativo' | 'vendido' | 'emprestado';
}

export interface Jogo {
  id: string;
  clube_casa_id: string;
  clube_fora_id: string;
  gols_casa: number | null;
  gols_fora: number | null;
  rodada: number;
  fase: 'grupos' | 'repescagem' | 'quartas' | 'semi' | 'final';
  data: string;
  status: 'agendado' | 'realizado';
}

export interface EstatisticaJogador {
  id: string;
  jogador_id: string;
  jogo_id: string;
  gols: number;
  assistencias: number;
  cartoes_amarelos: number;
  cartoes_vermelhos: number;
}

export interface Transferencia {
  id: string;
  jogador_id: string;
  clube_origem_id: string;
  clube_destino_id: string;
  data: string;
  tipo: 'venda' | 'emprestimo' | 'troca';
  status: 'pendente' | 'aprovada' | 'rejeitada';
}

export interface TabelaLinha {
  clube_id: string;
  clube_nome: string;
  escudo_url: string | null;
  cor_principal: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo_gols: number;
  aproveitamento: number;
}

export interface ArtilheiroRanking {
  jogador_id: string;
  jogador_nome: string;
  clube_nome: string;
  clube_id: string;
  gols: number;
}

export interface AssistenteRanking {
  jogador_id: string;
  jogador_nome: string;
  clube_nome: string;
  clube_id: string;
  assistencias: number;
}