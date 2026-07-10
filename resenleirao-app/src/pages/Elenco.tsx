import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Trash2 } from 'lucide-react';

export function Elenco() {
  const { clubeId } = useParams<{ clubeId: string }>();
  const { user, isAdmin, isDono } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaPosicao, setNovaPosicao] = useState<'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-Campo' | 'Atacante'>('Atacante');
  const [novoNumero, setNovoNumero] = useState('');

  const clube = db.clubes.buscarPorId(clubeId || '');
  const jogadores = clubeId ? db.jogadores.listar(clubeId) : [];
  const meusClube = user && isDono ? db.clubes.buscarPorDono(user.id) : null;
  const podeEditar = isAdmin || (isDono && meusClube?.id === clubeId);

  if (!clube) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Clube não encontrado</p>
        <Link to="/" className="text-yellow-500 hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoNumero || !clubeId) return;
    db.jogadores.criar({
      nome: novoNome,
      posicao: novaPosicao,
      numero: parseInt(novoNumero),
      clube_id: clubeId,
      foto_url: null,
      status: 'ativo',
      valor_mercado: 10000000,
      jogos_suspensao: 0,
    });
    setShowAdd(false);
    setNovoNome('');
    setNovoNumero('');
  };

  const handleRemove = (id: string) => {
    if (confirm('Tem certeza que deseja remover este jogador?')) {
      db.jogadores.remover(id);
    }
  };

  const posicoes = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-Campo', 'Atacante'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: clube.cor_principal }}
          >
            {clube.nome.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{clube.nome}</h1>
            <p className="text-sm text-gray-400">{jogadores.length} jogadores</p>
          </div>
        </div>
        {podeEditar && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Jogador
          </button>
        )}
      </div>

      {/* Modal Add */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Adicionar Jogador</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Posição</label>
                <select
                  value={novaPosicao}
                  onChange={(e) => setNovaPosicao(e.target.value as typeof novaPosicao)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {posicoes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número</label>
                <input
                  type="number"
                  value={novoNumero}
                  onChange={(e) => setNovoNumero(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min="1"
                  max="99"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elenco */}
      {jogadores.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum jogador no elenco</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {jogadores.map(jogador => (
            <div key={jogador.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-sm">
                  {jogador.numero}
                </div>
                <div>
                  <p className="font-medium">{jogador.nome}</p>
                  <p className="text-sm text-gray-400">{jogador.posicao}</p>
                </div>
              </div>
              {podeEditar && (
                <button
                  onClick={() => handleRemove(jogador.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}