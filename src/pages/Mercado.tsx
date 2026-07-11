import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Store, Send, Search, DollarSign } from 'lucide-react';
import type { Clube, Jogador } from '../types';
import { idsIguais } from '../lib/ids';

export function Mercado() {
  const { user, isDono } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPosicao, setFiltroPosicao] = useState<string>('');
  const [filtroClube, setFiltroClube] = useState<string>('');
  const [showProposta, setShowProposta] = useState(false);
  const [jogadorAlvo, setJogadorAlvo] = useState<string | null>(null);
  const [tipoProposta, setTipoProposta] = useState<'compra' | 'emprestimo' | 'troca' | 'jogador_mais_valor'>('compra');
  const [valor, setValor] = useState('');
  const [jogadorTrocaId, setJogadorTrocaId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [todosJogadores, setTodosJogadores] = useState<Jogador[]>([]);
  const [meusClube, setMeusClube] = useState<Clube | null>(null);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null);
  const [clubeJogador, setClubeJogador] = useState<Clube | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    const fetchData = async () => {
      setLoading(true);
      setErro('');
      try {
        const [clubesData, jogadoresData, meuClubeData] = await Promise.all([
          db.clubes.listar(),
          db.jogadores.listar(),
          user && isDono ? db.clubes.buscarPorDono(user.id, user.clube_id) : Promise.resolve(null)
        ]);
        if (!ativo) return;
        setClubes(clubesData);
        setTodosJogadores(jogadoresData);
        setMeusClube(meuClubeData || null);
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar o mercado.');
      } finally {
        if (ativo) setLoading(false);
      }
    };
    void fetchData();
    return () => { ativo = false; };
  }, [user, isDono]);

  const posicoes = ['', 'Goleiro', 'Zagueiro', 'Lateral', 'Meio-Campo', 'Atacante'];

  const jogadoresFiltrados = todosJogadores.filter(j => {
    if (idsIguais(j.clube_id, meusClube?.id)) return false;
    if (searchTerm && !j.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filtroPosicao && j.posicao !== filtroPosicao) return false;
    if (filtroClube && !idsIguais(j.clube_id, filtroClube)) return false;
    return true;
  });

  const handleProposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jogadorAlvo || !meusClube || !jogadorSelecionado) return;

    const valorNum = parseInt(valor) || 0;

    const result = await db.transferencias.criar({
      jogador_id: jogadorAlvo,
      clube_origem_id: jogadorSelecionado.clube_id,
      clube_destino_id: meusClube.id,
      valor: valorNum,
      tipo: tipoProposta,
      jogador_troca_id: jogadorTrocaId || null,
      data: new Date().toISOString().split('T')[0],
      status: 'pendente',
      mensagem: mensagem,
    });

    if (!result.ok) {
      alert('erro' in result ? result.erro : 'Não foi possível criar a proposta.');
      return;
    }

    setShowProposta(false);
    setJogadorAlvo(null);
    setValor('');
    setJogadorTrocaId('');
    setMensagem('');
    setTipoProposta('compra');
  };

  const formatValor = (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
    return `R$ ${v}`;
  };

  const abrirProposta = async (jogadorId: string) => {
    const jogador = await db.jogadores.buscarPorId(jogadorId);
    const clube = jogador ? await db.clubes.buscarPorId(jogador.clube_id) : null;
    setJogadorSelecionado(jogador || null);
    setClubeJogador(clube || null);
    setJogadorAlvo(jogadorId);
    setShowProposta(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mercado de Transferências</h1>
          {meusClube && (
            <p className="text-sm text-gray-400 mt-1">
              Orçamento: <span className="text-green-500 font-bold">{formatValor(meusClube.orcamento)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar jogador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <select
          value={filtroPosicao}
          onChange={(e) => setFiltroPosicao(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Todas posições</option>
          {posicoes.slice(1).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={filtroClube}
          onChange={(e) => setFiltroClube(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Todos clubes</option>
          {clubes.filter(c => c.id !== meusClube?.id).map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Lista de Jogadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {jogadoresFiltrados.map(jogador => {
          const clube = clubes.find(c => c.id === jogador.clube_id);
          return (
            <div
              key={jogador.id}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-yellow-500/50 transition-colors cursor-pointer"
              onClick={() => {
                if (isDono && meusClube) {
                  abrirProposta(jogador.id);
                }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {jogador.foto_url ? (
                    <img
                      src={jogador.foto_url}
                      alt={jogador.nome}
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm bg-gray-800">
                      {jogador.numero}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{jogador.nome}</p>
                    <p className="text-xs text-gray-400">{jogador.posicao}</p>
                  </div>
                </div>
                <span className="font-bold text-yellow-500 text-sm">{formatValor(jogador.valor_mercado)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  {clube?.escudo_url ? (
                    <img
                      src={clube.escudo_url}
                      alt={clube.nome}
                      className="w-4 h-4 object-cover"
                    />
                  ) : (
                    <div
                      className="w-4 h-4 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: clube?.cor_principal || '#666' }}
                    >
                      {clube?.nome?.charAt(0)}
                    </div>
                  )}
                  {clube?.nome}
                </div>
                {isDono && meusClube && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirProposta(jogador.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-medium hover:bg-yellow-500/20 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Propor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {jogadoresFiltrados.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <Store className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum jogador encontrado</p>
        </div>
      )}

      {/* Modal Proposta */}
      {showProposta && jogadorSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Nova Proposta</h2>
            
            {/* Jogador Alvo */}
            <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center gap-3">
              {jogadorSelecionado.foto_url ? (
                <img
                  src={jogadorSelecionado.foto_url}
                  alt={jogadorSelecionado.nome}
                  className="w-10 h-10 object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-white font-bold bg-gray-700">
                  {jogadorSelecionado.numero}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{jogadorSelecionado.nome}</p>
                <p className="text-sm text-gray-400">{jogadorSelecionado.posicao} - {clubeJogador?.nome}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Valor de mercado</p>
                <p className="font-bold text-yellow-500">{formatValor(jogadorSelecionado.valor_mercado)}</p>
              </div>
            </div>

            <form onSubmit={handleProposta} className="space-y-4">
              {/* Tipo de Proposta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Proposta</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['compra', 'emprestimo', 'troca', 'jogador_mais_valor'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoProposta(t)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        tipoProposta === t
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t === 'compra' ? '💰 Compra' :
                       t === 'emprestimo' ? '📋 Empréstimo' :
                       t === 'troca' ? '🔄 Troca' : '🤝 Jogador + Valor'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor {tipoProposta === 'emprestimo' ? '(opcional)' : ''}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder={tipoProposta === 'emprestimo' ? '0 (sem custo)' : 'Ex: 5000000'}
                    min="0"
                    step="100000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seu orçamento: {meusClube ? formatValor(meusClube.orcamento) : 'R$ 0'}
                </p>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem (opcional)</label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={2}
                  placeholder="Ex: Bons termos para negócio..."
                />
              </div>

              {meusClube && (
                <div className="bg-gray-800 rounded-lg p-3 text-sm">
                  <p className="text-gray-400">Resumo da proposta:</p>
                  <ul className="mt-1 space-y-1">
                    <li className="text-gray-300">
                      • Enviando: <span className="text-yellow-500">{formatValor(parseInt(valor) || 0)}</span>
                    </li>
                    <li className="text-gray-300">
                      • Recebendo: <span className="text-green-500">{jogadorSelecionado.nome}</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Enviar Proposta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProposta(false);
                    setJogadorAlvo(null);
                  }}
                  className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
