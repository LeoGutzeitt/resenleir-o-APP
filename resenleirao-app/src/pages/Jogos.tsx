import { useState } from 'react';
import { db } from '../lib/db';

export function Jogos() {
  const [filtroRodada, setFiltroRodada] = useState<number | null>(null);
  const todosJogos = db.jogos.listar();
  const rodadas = [...new Set(todosJogos.map(j => j.rodada))].sort((a, b) => a - b);

  const jogosFiltrados = filtroRodada
    ? todosJogos.filter(j => j.rodada === filtroRodada)
    : todosJogos;

  const jogosPorRodada = rodadas.map(rodada => ({
    rodada,
    jogos: jogosFiltrados.filter(j => j.rodada === rodada),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Jogos</h1>

      {/* Filtro de Rodadas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFiltroRodada(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroRodada === null
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Todas
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

      {/* Jogos */}
      <div className="space-y-6">
        {jogosPorRodada.map(({ rodada, jogos }) => {
          if (jogos.length === 0) return null;
          const faseAnterior = jogos[0]?.fase;
          return (
            <div key={rodada}>
              <h2 className="text-lg font-semibold text-yellow-500 mb-3">
                {faseAnterior !== 'grupos' ? `${faseAnterior.charAt(0).toUpperCase() + faseAnterior.slice(1)}` : `${rodada}ª Rodada`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jogos.map(jogo => {
                  const casa = db.clubes.buscarPorId(jogo.clube_casa_id);
                  const fora = db.clubes.buscarPorId(jogo.clube_fora_id);
                  return (
                    <div
                      key={jogo.id}
                      className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: casa?.cor_principal || '#666' }}
                        >
                          {casa?.nome.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{casa?.nome}</span>
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
                        <span className="font-medium text-sm">{fora?.nome}</span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: fora?.cor_principal || '#666' }}
                        >
                          {fora?.nome.charAt(0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}