import { db } from '../lib/db';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';

export function Estatisticas() {
  const tabela = db.views.tabela();
  const totalGols = tabela.reduce((acc, t) => acc + t.gols_pro, 0);
  const mediaGols = tabela.length > 0 ? (totalGols / tabela.reduce((acc, t) => acc + t.jogos, 0)).toFixed(1) : '0';
  const melhorAtaque = [...tabela].sort((a, b) => b.gols_pro - a.gols_pro)[0];
  const melhorDefesa = [...tabela].sort((a, b) => a.gols_contra - b.gols_contra)[0];
  const maisVitorias = [...tabela].sort((a, b) => b.vitorias - a.vitorias)[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estatísticas</h1>

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
    </div>
  );
}