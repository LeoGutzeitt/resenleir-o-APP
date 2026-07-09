import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Users, Swords, Goal, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MeuClube() {
  const { user } = useAuth();

  if (!user) return null;

  const meusClube = db.clubes.buscarPorDono(user.id);
  if (!meusClube) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Você não possui um clube associado</p>
      </div>
    );
  }

  const jogadores = db.jogadores.listar(meusClube.id);
  const jogos = db.jogos.buscarPorClube(meusClube.id);
  const tabela = db.views.tabela();
  const minhaPosicao = tabela.find(t => t.clube_id === meusClube.id);
  const artilharia = db.views.artilharia().filter(a => a.clube_id === meusClube.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: meusClube.cor_principal }}
          >
            {meusClube.nome.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{meusClube.nome}</h1>
            {minhaPosicao && (
              <p className="text-gray-400">
                {minhaPosicao.pontos} pts - {minhaPosicao.aproveitamento}% - {minhaPosicao.jogos} jogos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to={`/elenco/${meusClube.id}`}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors text-center"
        >
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Elenco</p>
          <p className="text-xs text-gray-500">{jogadores.length} jog.</p>
        </Link>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
          <Swords className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Jogos</p>
          <p className="text-xs text-gray-500">{jogos.length} jogos</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
          <Goal className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Artilheiro</p>
          <p className="text-xs text-gray-500">{artilharia[0]?.jogador_nome || '-'}</p>
        </div>
        <Link
          to="/transferencias"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors text-center"
        >
          <ArrowLeftRight className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Transferências</p>
          <p className="text-xs text-gray-500">Propor troca</p>
        </Link>
      </div>

      {/* Próximos Jogos */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Próximos Jogos</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {jogos.filter(j => j.status === 'agendado').slice(0, 3).map(jogo => {
            const adversario = db.clubes.buscarPorId(
              jogo.clube_casa_id === meusClube.id ? jogo.clube_fora_id : jogo.clube_casa_id
            );
            const isCasa = jogo.clube_casa_id === meusClube.id;
            return (
              <div key={jogo.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: adversario?.cor_principal || '#666' }}
                  >
                    {adversario?.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{isCasa ? `${meusClube.nome} vs ${adversario?.nome}` : `${adversario?.nome} vs ${meusClube.nome}`}</p>
                    <p className="text-sm text-gray-500">{isCasa ? 'Em casa' : 'Fora'}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{jogo.data}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Artilheiros do Clube */}
      {artilharia.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Artilheiros</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {artilharia.slice(0, 5).map((j, idx) => (
              <div key={j.jogador_id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-6">{idx + 1}º</span>
                  <span className="font-medium">{j.jogador_nome}</span>
                </div>
                <span className="font-bold text-yellow-500">{j.gols} gols</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}