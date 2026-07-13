import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Trash2, Camera } from 'lucide-react';
import type { Clube, Jogador } from '../types';

export function Elenco() {
  const { clubeId } = useParams<{ clubeId: string }>();
  const { user, isAdmin, isDono } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaPosicao, setNovaPosicao] = useState<'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-Campo' | 'Atacante'>('Atacante');
  const [novoNumero, setNovoNumero] = useState('');
  const [novoValor, setNovoValor] = useState('10000000');
  const [fotoJogador, setFotoJogador] = useState<File | null>(null);
  const [clube, setClube] = useState<Clube | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [meusClube, setMeusClube] = useState<Clube | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!clubeId) return;
      
  const [clubeData, jogadoresData, meusClubeData] = await Promise.all([
    db.clubes.buscarPorId(clubeId),
    db.jogadores.listar(clubeId),
    user && isDono && user.clube_id ? db.clubes.buscarPorId(String(user.clube_id)) : Promise.resolve(null)
  ]);
      
      setClube(clubeData || null);
      setJogadores(jogadoresData);
      setMeusClube(meusClubeData);
      setLoading(false);
    };
    fetchData();
  }, [clubeId, user, isDono]);

  const podeEditar = isAdmin || (isDono && meusClube?.id === clubeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-yellow-500">Carregando...</div>
      </div>
    );
  }

  if (!clube) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Clube não encontrado</p>
        <Link to="/" className="text-yellow-500 hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoNumero || !novoValor || !clubeId) return;

    let foto_url: string | null = null;

    // Upload da foto se houver
    if (fotoJogador) {
      const reader = new FileReader();
      foto_url = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fotoJogador);
      });
    }

    await db.jogadores.criar({
      nome: novoNome,
      posicao: novaPosicao,
      numero: parseInt(novoNumero),
      clube_id: clubeId,
      foto_url,
      status: 'ativo',
      valor_mercado: parseInt(novoValor),
      jogos_suspensao: 0,
    });
    
    // Recarregar jogadores
    const novosJogadores = await db.jogadores.listar(clubeId);
    setJogadores(novosJogadores);
    
    setShowAdd(false);
    setNovoNome('');
    setNovoNumero('');
    setNovoValor('10000000');
    setFotoJogador(null);
  };

  const handleRemove = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este jogador?')) {
      await db.jogadores.remover(id);
      setJogadores(jogadores.filter(j => j.id !== id));
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor de mercado (R$)</label>
                <input type="number" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" min="0" step="100000" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto do Jogador (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoJogador(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black file:font-medium file:cursor-pointer hover:file:bg-yellow-400"
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
                {jogador.foto_url ? (
                  <img
                    src={jogador.foto_url}
                    alt={jogador.nome}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-sm">
                    {jogador.numero}
                  </div>
                )}
                <div>
                  <p className="font-medium">{jogador.nome}</p>
                  <p className="text-sm text-gray-400">{jogador.posicao} · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(jogador.valor_mercado || 0)}</p>
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
