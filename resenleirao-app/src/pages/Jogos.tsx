import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Jogo, Clube } from '../types';

export function Jogos() {
  const [filtroRodada, setFiltroRodada] = useState<number | null>(null);
  const [filtroFase, setFiltroFase] = useState<'todos' | 'grupos' | 'mata-mata'>('todos');
  const [todosJogos, setTodosJogos] = useState<Jogo[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [jogosData, clubesData] = await Promise.all([
        db.jogos.listar(),
        db.clubes.listar()
      ]);
      setTodosJogos(jogosData);
      setClubes(clubesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const rodadas = [...new Set(todosJogos.map(j => j.rodada))].sort((a, b) => a - b);

  const getEscudo = (clubeId: string) => {
    const clube = clubes.find(c => c.id === clubeId);
    return clube?.escudo_url || null;
  };

  const getClubeNome = (clubeId: string) => {
    const clube = clubes.find(c => c.id === clubeId);
    return clube?.nome || '';
  };

  const getClubeCor = (clubeId: string) => {
    const clube = clubes.find(c => c.id === clubeId);
    return clube?.cor_principal || '#666';
  };

  let jogosFiltrados = filtroRodada
    ? todosJogos.filter(j => j.rodada === filtroRodada)
    : todosJogos;

  if (filtroFase === 'grupos') {
    jogosFiltrados = jogosFiltrados.filter(j => j.fase === 'grupos');
  } else if (filtroFase === 'mata-mata') {
    jogosFiltrados = jogosFiltrados.filter(j => j.fase !== 'grupos');
  }

  const jogosPorRodada = rodadas.map(rodada => ({
    rodada,
    jogos: jogosFiltrados.filter(j => j.rodada === rodada),
  })).filter(item => item.jogos.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-yellow-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Jogos</h1>

      {/* Filtros */}
      <div className="space-y-3 mb-6">
        {/* Filtro de Fase */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroFase('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroFase === 'todos'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Todos os Jogos
          </button>
          <button
            onClick={() => setFiltroFase('grupos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroFase === 'grupos'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Liga (Grupos)
          </button>
          <button
            onClick={() => setFiltroFase('mata-mata')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroFase === 'mata-mata'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Mata-Mata
          </button>
        </div>

        {/* Filtro de Rodadas (apenas para liga) */}
        {filtroFase !== 'mata-mata' && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroRodada(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroRodada === null
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Todas as Rodadas
            </button>
            {rodadas.map(rodada => (
              <button
                key={rodada}
                onClick={() => setFiltroRodada(rodada)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroRodada === rodada
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {rodada}ª Rodada
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Jogos */}
      <div className="space-y-6">
        {jogosPorRodada.map(({ rodada, jogos }) => {
          if (jogos.length === 0) return null;
          const fase = jogos[0]?.fase;
          const isMataMata = fase !== 'grupos';
          
          return (
            <div key={rodada}>
              <h2 className="text-lg font-semibold text-yellow-500 mb-3">
                {isMataMata ? (
                  <span className="text-green-500">
                    {fase === 'quartas' ? 'Quartas de Final' :
                     fase === 'semi' ? 'Semifinal' :
                     fase === 'final' ? 'Final' :
                     fase === 'repescagem' ? 'Repescagem' : fase}
                  </span>
                ) : (
                  `${rodada}ª Rodada`
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jogos.map(jogo => (
                  <div
                    key={jogo.id}
                    className={`rounded-xl p-4 border flex items-center justify-between ${
                      isMataMata 
                        ? 'bg-gray-900 border-green-500/30' 
                        : 'bg-gray-900 border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getEscudo(jogo.clube_casa_id) ? (
                        <img
                          src={getEscudo(jogo.clube_casa_id)!}
                          alt={getClubeNome(jogo.clube_casa_id)}
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: getClubeCor(jogo.clube_casa_id) }}
                        >
                          {getClubeNome(jogo.clube_casa_id).charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-sm">{getClubeNome(jogo.clube_casa_id)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {jogo.status === 'realizado' ? (
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1">
                          <span className="text-lg font-bold">{jogo.gols_casa}</span>
                          <span className="text-gray-500">x</span>
                          <span className="text-lg font-bold">{jogo.gols_fora}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">VS</span>
                          <span className="text-xs text-gray-600">{jogo.data}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-medium text-sm">{getClubeNome(jogo.clube_fora_id)}</span>
                      {getEscudo(jogo.clube_fora_id) ? (
                        <img
                          src={getEscudo(jogo.clube_fora_id)!}
                          alt={getClubeNome(jogo.clube_fora_id)}
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: getClubeCor(jogo.clube_fora_id) }}
                        >
                          {getClubeNome(jogo.clube_fora_id).charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}