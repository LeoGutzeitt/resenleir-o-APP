import { useState } from 'react';
import { db } from '../lib/db';
import { Goal, Award } from 'lucide-react';

export function Artilharia() {
  const [aba, setAba] = useState<'gols' | 'assistencias'>('gols');
  const artilharia = db.views.artilharia();
  const assistencias = db.views.assistencias();

  const dados = aba === 'gols' ? artilharia : assistencias;
  const valorKey = aba === 'gols' ? 'gols' : 'assistencias';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Artilharia</h1>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setAba('gols')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            aba === 'gols'
              ? 'bg-green-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Goal className="w-4 h-4" />
          Artilheiros
        </button>
        <button
          onClick={() => setAba('assistencias')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            aba === 'assistencias'
              ? 'bg-blue-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Assistentes
        </button>
      </div>

      {/* Ranking Desktop */}
      <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">#</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Jogador</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Clube</th>
              <th className="text-center py-4 px-4 text-sm font-medium text-gray-400">
                {aba === 'gols' ? 'Gols' : 'Assist.'}
              </th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item, index) => (
              <tr key={item.jogador_id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Goal className="w-5 h-5 text-yellow-500" />}
                    <span className={`font-bold ${index < 3 ? 'text-yellow-500' : ''}`}>{index + 1}º</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-medium">{item.jogador_nome}</td>
                <td className="py-4 px-4 text-gray-400">{item.clube_nome}</td>
                <td className="text-center py-4 px-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-300'
                  }`}>
                    {Number(item[valorKey as keyof typeof item])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ranking Mobile */}
      <div className="md:hidden space-y-2">
        {dados.map((item, index) => (
          <div key={item.jogador_id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{item.jogador_nome}</p>
                <p className="text-sm text-gray-400">{item.clube_nome}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>
                {Number(item[valorKey as keyof typeof item])}
              </span>
              <p className="text-xs text-gray-500">{aba === 'gols' ? 'gols' : 'assist.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}