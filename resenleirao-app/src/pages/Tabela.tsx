import { db } from '../lib/db';

export function Tabela() {
  const tabela = db.views.tabela();

  const getPosicaoClass = (pos: number) => {
    if (pos === 1) return 'border-l-4 border-yellow-500';
    if (pos <= 5) return 'border-l-4 border-green-500';
    if (pos <= 7) return 'border-l-4 border-blue-500';
    return '';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classificação</h1>

      {/* Legenda */}
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

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">#</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Clube</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">P</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">J</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">V</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">E</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">D</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">GP</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">GC</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">SG</th>
              <th className="text-center py-4 px-3 text-sm font-medium text-gray-400">%</th>
            </tr>
          </thead>
          <tbody>
            {tabela.map((time, index) => (
              <tr key={time.clube_id} className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${getPosicaoClass(index + 1)}`}>
                <td className="py-4 px-4 font-bold">{index + 1}º</td>
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
                <td className="text-center py-4 px-3 font-bold text-yellow-500">{time.pontos}</td>
                <td className="text-center py-4 px-3 text-gray-400">{time.jogos}</td>
                <td className="text-center py-4 px-3 text-green-500">{time.vitorias}</td>
                <td className="text-center py-4 px-3 text-gray-400">{time.empates}</td>
                <td className="text-center py-4 px-3 text-red-500">{time.derrotas}</td>
                <td className="text-center py-4 px-3">{time.gols_pro}</td>
                <td className="text-center py-4 px-3">{time.gols_contra}</td>
                <td className={`text-center py-4 px-3 font-medium ${time.saldo_gols > 0 ? 'text-green-500' : time.saldo_gols < 0 ? 'text-red-500' : ''}`}>
                  {time.saldo_gols > 0 ? '+' : ''}{time.saldo_gols}
                </td>
                <td className="text-center py-4 px-3">{time.aproveitamento}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela Mobile */}
      <div className="md:hidden space-y-2">
        {tabela.map((time, index) => (
          <div key={time.clube_id} className={`bg-gray-900 rounded-xl p-4 border border-gray-800 ${getPosicaoClass(index + 1)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{index + 1}º</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: time.cor_principal }}
                >
                  {time.clube_nome.charAt(0)}
                </div>
                <span className="font-semibold">{time.clube_nome}</span>
              </div>
              <span className="text-xl font-bold text-yellow-500">{time.pontos}</span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-sm text-gray-400">
              <div><span className="text-white font-medium">{time.jogos}</span> J</div>
              <div><span className="text-green-500 font-medium">{time.vitorias}</span> V</div>
              <div><span className="text-gray-300 font-medium">{time.empates}</span> E</div>
              <div><span className="text-red-500 font-medium">{time.derrotas}</span> D</div>
              <div><span className={time.saldo_gols > 0 ? 'text-green-500' : time.saldo_gols < 0 ? 'text-red-500' : ''}>{time.saldo_gols}</span> SG</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}