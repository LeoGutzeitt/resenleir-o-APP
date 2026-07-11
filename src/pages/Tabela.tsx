import { useEffect, useState } from "react";
import { db } from "../lib/db";
import type { TabelaLinha, Clube } from "../types";

export function Tabela() {
  const [modoVisualizacao, setModoVisualizacao] = useState<
    "pontos_corridos" | "mata_mata"
  >("pontos_corridos");
  const [tabela, setTabela] = useState<TabelaLinha[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    const fetchData = async () => {
      try {
        const [tabelaData, clubesData] = await Promise.all([
          db.views.tabela(),
          db.clubes.listar()
        ]);
        if (!ativo) return;
        setTabela(tabelaData);
        setClubes(clubesData);
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar a tabela.');
      } finally {
        if (ativo) setLoading(false);
      }
    };
    void fetchData();
    return () => { ativo = false; };
  }, []);

  const getEscudo = (clubeId: string) => {
    const clube = clubes.find(c => c.id === clubeId);
    return clube?.escudo_url || null;
  };

  const getPosicaoClass = (pos: number) => {
    if (modoVisualizacao === "pontos_corridos") {
      if (pos === 1) return "border-l-4 border-yellow-500";
      if (pos <= 5) return "border-l-4 border-green-500";
      if (pos <= 7) return "border-l-4 border-blue-500";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-yellow-500">Carregando...</div>
      </div>
    );
  }

  if (erro) {
    return <div className="text-center py-12 text-red-400">{erro}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classificação</h1>

      {/* Seletor de Modo */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setModoVisualizacao("pontos_corridos")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            modoVisualizacao === "pontos_corridos"
              ? "bg-yellow-500 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Pontos Corridos
        </button>
        <button
          onClick={() => setModoVisualizacao("mata_mata")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            modoVisualizacao === "mata_mata"
              ? "bg-yellow-500 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Mata-Mata
        </button>
      </div>

      {/* Legenda */}
      {modoVisualizacao === "pontos_corridos" && (
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Líder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Zona de classificação (2º-5º)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Repescagem (6º-7º)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-700" />
            <span>Eliminados</span>
          </div>
        </div>
      )}

      {/* Chaveamento Mata-Mata */}
      {modoVisualizacao === "mata_mata" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Chaveamento do Mata-Mata</h2>
            <p className="text-sm text-gray-400 mt-1">
              Top 7 classificados para as fases eliminatórias
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quartas de Final */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-center text-blue-500">
                  Quartas de Final
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Q1: 2º vs 5º</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {tabela[1]?.clube_nome || "2º"}
                      </span>
                      <span className="text-xs text-gray-500">vs</span>
                      <span className="text-sm font-medium">
                        {tabela[4]?.clube_nome || "5º"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Q2: 3º vs 4º</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {tabela[2]?.clube_nome || "3º"}
                      </span>
                      <span className="text-xs text-gray-500">vs</span>
                      <span className="text-sm font-medium">
                        {tabela[3]?.clube_nome || "4º"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Semifinais */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-center text-green-500">
                  Semifinais
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-3 border border-green-500/50">
                    <p className="text-xs text-gray-400 mb-1">
                      S1: 1º vs Vencedor 6x7
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {tabela[0]?.clube_nome || "1º"}
                      </span>
                      <span className="text-xs text-gray-500">vs</span>
                      <span className="text-sm text-gray-400">Vencedor 6x7</span>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-green-500/50">
                    <p className="text-xs text-gray-400 mb-1">
                      S2: Vencedor Q1 vs Vencedor Q2
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Vencedor Q1</span>
                      <span className="text-xs text-gray-500">vs</span>
                      <span className="text-sm text-gray-400">Vencedor Q2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-center text-yellow-500">
                  Final
                </h3>
                <div className="bg-gray-800 rounded-lg p-4 border-2 border-yellow-500">
                  <p className="text-xs text-gray-400 mb-2">
                    Final: Vencedor S1 vs Vencedor S2
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vencedor S1</span>
                    <span className="text-xs text-yellow-500 font-bold">
                      vs
                    </span>
                    <span className="text-sm font-medium">Vencedor S2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                #
              </th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                Clube
              </th>
              {modoVisualizacao === "pontos_corridos" && (
                <>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    P
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    J
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    V
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    E
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    D
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    GP
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    GC
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    SG
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    %
                  </th>
                </>
              )}
              {modoVisualizacao === "mata_mata" && (
                <>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    Fase
                  </th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">
                    Status
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tabela.map((time, index) => (
              <tr
                key={time.clube_id}
                className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${getPosicaoClass(index + 1)}`}
              >
                <td className="py-4 px-4 font-bold">{index + 1}º</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {getEscudo(time.clube_id) ? (
                      <img
                        src={getEscudo(time.clube_id)!}
                        alt={time.clube_nome}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: time.cor_principal }}
                      >
                        {time.clube_nome.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{time.clube_nome}</span>
                  </div>
                </td>
                {modoVisualizacao === "pontos_corridos" && (
                  <>
                    <td className="text-center py-4 px-3 font-bold text-yellow-500">
                      {time.pontos}
                    </td>
                    <td className="text-center py-4 px-3 text-gray-400">
                      {time.jogos}
                    </td>
                    <td className="text-center py-4 px-3 text-green-500">
                      {time.vitorias}
                    </td>
                    <td className="text-center py-4 px-3 text-gray-400">
                      {time.empates}
                    </td>
                    <td className="text-center py-4 px-3 text-red-500">
                      {time.derrotas}
                    </td>
                    <td className="text-center py-4 px-3">{time.gols_pro}</td>
                    <td className="text-center py-4 px-3">
                      {time.gols_contra}
                    </td>
                    <td
                      className={`text-center py-4 px-3 font-medium ${time.saldo_gols > 0 ? "text-green-500" : time.saldo_gols < 0 ? "text-red-500" : ""}`}
                    >
                      {time.saldo_gols > 0 ? "+" : ""}
                      {time.saldo_gols}
                    </td>
                    <td className="text-center py-4 px-3">
                      {time.aproveitamento}%
                    </td>
                  </>
                )}
                {modoVisualizacao === "mata_mata" && (
                  <>
                    <td className="text-center py-4 px-3">
                      <span className="text-sm text-gray-300">
                        {index === 0
                          ? "Semifinal"
                          : index >= 1 && index <= 4
                            ? "Quartas"
                            : index >= 5 && index <= 6
                              ? "Repescagem"
                              : "Eliminado"}
                      </span>
                    </td>
                    <td className="text-center py-4 px-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          index + 1 <= 7
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {index + 1 <= 7 ? "Classificado" : "Eliminado"}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela Mobile */}
      <div className="md:hidden space-y-2">
        {tabela.map((time, index) => (
          <div
            key={time.clube_id}
            className={`bg-gray-900 rounded-xl p-4 border border-gray-800 ${getPosicaoClass(index + 1)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{index + 1}º</span>
                {getEscudo(time.clube_id) ? (
                  <img
                    src={getEscudo(time.clube_id)!}
                    alt={time.clube_nome}
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: time.cor_principal }}
                  >
                    {time.clube_nome.charAt(0)}
                  </div>
                )}
                <span className="font-semibold">{time.clube_nome}</span>
              </div>
              {modoVisualizacao === "pontos_corridos" && (
                <span className="text-xl font-bold text-yellow-500">
                  {time.pontos}
                </span>
              )}
            </div>
            {modoVisualizacao === "pontos_corridos" && (
              <div className="grid grid-cols-5 gap-2 text-center text-sm text-gray-400">
                <div>
                  <span className="text-white font-medium">{time.jogos}</span> J
                </div>
                <div>
                  <span className="text-green-500 font-medium">
                    {time.vitorias}
                  </span>{" "}
                  V
                </div>
                <div>
                  <span className="text-gray-300 font-medium">
                    {time.empates}
                  </span>{" "}
                  E
                </div>
                <div>
                  <span className="text-red-500 font-medium">
                    {time.derrotas}
                  </span>{" "}
                  D
                </div>
                <div>
                  <span
                    className={
                      time.saldo_gols > 0
                        ? "text-green-500"
                        : time.saldo_gols < 0
                          ? "text-red-500"
                          : ""
                    }
                  >
                    {time.saldo_gols}
                  </span>{" "}
                  SG
                </div>
              </div>
            )}
            {modoVisualizacao === "mata_mata" && (
              <div className="text-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    index + 1 <= 7
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {index === 0
                    ? "Semifinal"
                    : index >= 1 && index <= 4
                      ? "Quartas"
                      : index >= 5 && index <= 6
                        ? "Repescagem"
                        : "Eliminado"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
