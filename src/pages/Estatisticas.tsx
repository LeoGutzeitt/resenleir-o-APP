import { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/db';
import { BarChart3, TrendingUp, Shield, Users } from 'lucide-react';
import type { ArtilheiroRanking, AssistenteRanking, Clube, TabelaLinha } from '../types';

interface RankingCartao {
  jogador_id: string;
  jogador_nome: string;
  clube_nome: string;
  clube_id: string;
  total: number;
}

export function Estatisticas() {
  const [tabela, setTabela] = useState<TabelaLinha[]>([]);
  const [artilharia, setArtilharia] = useState<ArtilheiroRanking[]>([]);
  const [assistencias, setAssistencias] = useState<AssistenteRanking[]>([]);
  const [cartoesAmarelos, setCartoesAmarelos] = useState<RankingCartao[]>([]);
  const [cartoesVermelhos, setCartoesVermelhos] = useState<RankingCartao[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const [tabelaData, artilhariaData, assistenciasData, estatisticasData, jogadoresData, clubesData] = await Promise.all([
          db.views.tabela(),
          db.views.artilharia(),
          db.views.assistencias(),
          db.estatisticas.listar(),
          db.jogadores.listar(),
          db.clubes.listar(),
        ]);
        if (!ativo) return;

        const jogadoresPorId = new Map(jogadoresData.map((jogador) => [jogador.id, jogador]));
        const clubesPorId = new Map(clubesData.map((clube) => [clube.id, clube]));
        const amarelos = new Map<string, RankingCartao>();
        const vermelhos = new Map<string, RankingCartao>();

        for (const stat of estatisticasData) {
          const jogador = jogadoresPorId.get(stat.jogador_id);
          if (!jogador) continue;
          const clube = clubesPorId.get(jogador.clube_id);

          const acumular = (mapa: Map<string, RankingCartao>, total: number) => {
            if (total <= 0) return;
            const atual = mapa.get(jogador.id);
            if (atual) atual.total += total;
            else mapa.set(jogador.id, {
              jogador_id: jogador.id,
              jogador_nome: jogador.nome,
              clube_nome: clube?.nome || 'Sem clube',
              clube_id: jogador.clube_id,
              total,
            });
          };

          acumular(amarelos, stat.cartoes_amarelos);
          acumular(vermelhos, stat.cartoes_vermelhos);
        }

        setTabela(tabelaData);
        setArtilharia(artilhariaData.slice(0, 10));
        setAssistencias(assistenciasData.slice(0, 10));
        setCartoesAmarelos([...amarelos.values()].sort((a, b) => b.total - a.total).slice(0, 10));
        setCartoesVermelhos([...vermelhos.values()].sort((a, b) => b.total - a.total).slice(0, 10));
        setClubes(clubesData);
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar as estatísticas.');
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const coresClubes = useMemo(
    () => new Map(clubes.map((clube) => [clube.id, clube.cor_principal])),
    [clubes],
  );
  const totalGols = tabela.reduce((acc, t) => acc + t.gols_pro, 0);
  const totalJogosSomados = tabela.reduce((acc, t) => acc + t.jogos, 0);
  // Cada partida aparece para os dois clubes na tabela.
  const mediaGols = totalJogosSomados > 0 ? (totalGols / (totalJogosSomados / 2)).toFixed(1) : '0';
  const melhorAtaque = [...tabela].sort((a, b) => b.gols_pro - a.gols_pro)[0];
  const melhorDefesa = [...tabela].sort((a, b) => a.gols_contra - b.gols_contra)[0];
  const maisVitorias = [...tabela].sort((a, b) => b.vitorias - a.vitorias)[0];

  if (loading) {
    return <div className="text-center py-12 text-yellow-500">Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estatísticas</h1>

      {erro && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm text-gray-400">Total de Gols</h3>
          </div>
          <p className="text-3xl font-bold">{totalGols}</p>
          <p className="text-sm text-gray-500 mt-1">Média: {mediaGols} por jogo</p>
        </div>

        {melhorAtaque && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-sm text-gray-400">Melhor Ataque</h3>
            </div>
            <p className="text-2xl font-bold">{melhorAtaque.clube_nome}</p>
            <p className="text-sm text-green-500 mt-1">{melhorAtaque.gols_pro} gols</p>
          </div>
        )}

        {melhorDefesa && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm text-gray-400">Melhor Defesa</h3>
            </div>
            <p className="text-2xl font-bold">{melhorDefesa.clube_nome}</p>
            <p className="text-sm text-blue-500 mt-1">{melhorDefesa.gols_contra} gols sofridos</p>
          </div>
        )}

        {maisVitorias && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm text-gray-400">Mais Vitórias</h3>
            </div>
            <p className="text-2xl font-bold">{maisVitorias.clube_nome}</p>
            <p className="text-sm text-purple-500 mt-1">{maisVitorias.vitorias} vitórias</p>
          </div>
        )}
      </div>

      {/* Estatísticas por Clube */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Situação dos Clubes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Clube</th>
                <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">Aproveit.</th>
                <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">GP/J</th>
                <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">GC/J</th>
                <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">% Vit.</th>
                <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {tabela.map(time => (
                <tr key={time.clube_id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: time.cor_principal }}
                      >
                        {time.clube_nome.charAt(0)}
                      </div>
                      <span className="font-medium">{time.clube_nome}</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${Math.min(time.aproveitamento, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{time.aproveitamento}%</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-3 font-medium">{time.jogos > 0 ? (time.gols_pro / time.jogos).toFixed(1) : '0'}</td>
                  <td className="text-center py-4 px-3 font-medium">{time.jogos > 0 ? (time.gols_contra / time.jogos).toFixed(1) : '0'}</td>
                  <td className="text-center py-4 px-3">
                    <span className={`font-medium ${time.vitorias > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {time.jogos > 0 ? ((time.vitorias / time.jogos) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                  <td className={`text-center py-4 px-3 font-bold ${time.saldo_gols > 0 ? 'text-green-500' : time.saldo_gols < 0 ? 'text-red-500' : ''}`}>
                    {time.saldo_gols > 0 ? '+' : ''}{time.saldo_gols}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rankings de Jogadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artilharia */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Artilharia
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Jogador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-400">Gols</th>
                </tr>
              </thead>
              <tbody>
                {artilharia.map((artilheiro, index) => (
                  <tr key={artilheiro.jogador_id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-yellow-500">{index + 1}º</td>
                    <td className="py-3 px-4 font-medium">{artilheiro.jogador_nome}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: coresClubes.get(artilheiro.clube_id) || '#666' }}
                        >
                          {artilheiro.clube_nome.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">{artilheiro.clube_nome}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 font-bold text-yellow-500">{artilheiro.gols}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assistências */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Assistências
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Jogador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-400">Assist.</th>
                </tr>
              </thead>
              <tbody>
                {assistencias.map((assistente, index) => (
                  <tr key={assistente.jogador_id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-500">{index + 1}º</td>
                    <td className="py-3 px-4 font-medium">{assistente.jogador_nome}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: coresClubes.get(assistente.clube_id) || '#666' }}
                        >
                          {assistente.clube_nome.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">{assistente.clube_nome}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 font-bold text-blue-500">{assistente.assistencias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cartões Amarelos */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Cartões Amarelos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Jogador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-400">CA</th>
                </tr>
              </thead>
              <tbody>
                {cartoesAmarelos.map((jogador, index) => (
                  <tr key={jogador.jogador_id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-yellow-500">{index + 1}º</td>
                    <td className="py-3 px-4 font-medium">{jogador.jogador_nome}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: coresClubes.get(jogador.clube_id) || '#666' }}
                        >
                          {jogador.clube_nome.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">{jogador.clube_nome}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 font-bold text-yellow-500">{jogador.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cartões Vermelhos */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Cartões Vermelhos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Jogador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-400">CV</th>
                </tr>
              </thead>
              <tbody>
                {cartoesVermelhos.map((jogador, index) => (
                  <tr key={jogador.jogador_id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-red-500">{index + 1}º</td>
                    <td className="py-3 px-4 font-medium">{jogador.jogador_nome}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: coresClubes.get(jogador.clube_id) || '#666' }}
                        >
                          {jogador.clube_nome.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">{jogador.clube_nome}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 font-bold text-red-500">{jogador.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
