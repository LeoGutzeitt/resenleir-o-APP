import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Users, Swords, Goal, ArrowLeftRight, Camera, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Clube, Jogador, Jogo, ArtilheiroRanking } from '../types';

export function MeuClube() {
  const { user } = useAuth();
  const [showEditEscudo, setShowEditEscudo] = useState(false);
  const [novoEscudo, setNovoEscudo] = useState<File | null>(null);
  const [meusClube, setMeusClube] = useState<Clube | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [tabela, setTabela] = useState<any[]>([]);
  const [artilharia, setArtilharia] = useState<ArtilheiroRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const clube = await db.clubes.buscarPorDono(user.id);
      if (!clube) {
        setMeusClube(null);
        setLoading(false);
        return;
      }
      
      const [jogadoresData, jogosData, tabelaData, artilhariaData] = await Promise.all([
        db.jogadores.listar(clube.id),
        db.jogos.buscarPorClube(clube.id),
        db.views.tabela(),
        db.views.artilharia()
      ]);
      
      setMeusClube(clube);
      setJogadores(jogadoresData);
      setJogos(jogosData);
      setTabela(tabelaData);
      setArtilharia(artilhariaData.filter((a: any) => a.clube_id === clube.id));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const minhaPosicao = tabela.find((t: any) => t.clube_id === meusClube?.id);

  const handleSalvarEscudo = async () => {
    if (!novoEscudo || !meusClube) return;

    const reader = new FileReader();
    const escudo_url = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(novoEscudo);
    });

    await db.clubes.atualizar(meusClube.id, { escudo_url: escudo_url as string });
    setShowEditEscudo(false);
    setNovoEscudo(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-yellow-500">Carregando...</div>
      </div>
    );
  }

  if (!meusClube) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Você não possui um clube associado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            {meusClube.escudo_url ? (
              <img
                src={meusClube.escudo_url}
                alt={meusClube.nome}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: meusClube.cor_principal }}
              >
                {meusClube.nome.charAt(0)}
              </div>
            )}
            <button
              onClick={() => setShowEditEscudo(true)}
              className="absolute -bottom-2 -right-2 p-1.5 bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
              title="Editar escudo"
            >
              <Camera className="w-4 h-4" />
            </button>
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

      {/* Modal Editar Escudo */}
      {showEditEscudo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Editar Escudo</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {meusClube.escudo_url ? (
                  <img
                    src={meusClube.escudo_url}
                    alt={meusClube.nome}
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <div
                    className="w-24 h-24 flex items-center justify-center text-white font-bold text-3xl"
                    style={{ backgroundColor: meusClube.cor_principal }}
                  >
                    {meusClube.nome.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Novo Escudo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNovoEscudo(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-yellow-500 file:text-black file:font-medium file:cursor-pointer hover:file:bg-yellow-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSalvarEscudo}
                  disabled={!novoEscudo}
                  className="flex-1 py-3 bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Salvar Escudo
                </button>
                <button
                  onClick={() => {
                    setShowEditEscudo(false);
                    setNovoEscudo(null);
                  }}
                  className="px-4 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {adversario?.escudo_url ? (
                    <img
                      src={adversario.escudo_url}
                      alt={adversario.nome}
                      className="w-8 h-8 object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: adversario?.cor_principal || '#666' }}
                    >
                      {adversario?.nome?.charAt(0)}
                    </div>
                  )}
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
            {artilharia.slice(0, 5).map((j, idx) => {
              const jogador = db.jogadores.buscarPorId(j.jogador_id);
              return (
                <div key={j.jogador_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-6">{idx + 1}º</span>
                    {jogador?.foto_url ? (
                      <img
                        src={jogador.foto_url}
                        alt={jogador.nome}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs bg-gray-800">
                        {jogador?.numero || '?'}
                      </div>
                    )}
                    <span className="font-medium">{j.jogador_nome}</span>
                  </div>
                  <span className="font-bold text-yellow-500">{j.gols} gols</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}