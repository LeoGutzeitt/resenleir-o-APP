import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import type { Transferencia, Clube, Jogador } from '../types';
import { ArrowLeftRight, Check, X, ShoppingCart, Send } from 'lucide-react';

interface TransferenciaComDados extends Transferencia {
  jogador?: Jogador;
  origem?: Clube;
  destino?: Clube;
  jogadorTroca?: Jogador | null;
}

export function Transferencias() {
  const { user, isDono } = useAuth();
  const [aba, setAba] = useState<'recebidas' | 'enviadas'>('recebidas');
  const [meusClube, setMeusClube] = useState<Clube | null>(null);
  const [transferenciasComDados, setTransferenciasComDados] = useState<TransferenciaComDados[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [meuClubeData, transferenciasData] = await Promise.all([
        user && isDono ? db.clubes.buscarPorDono(user.id) : Promise.resolve(null),
        db.transferencias.listar()
      ]);
      
      // Carregar dados das transferências
      const transferenciasComDados = await Promise.all(
        transferenciasData.map(async (t) => {
          const [jogador, origem, destino, jogadorTroca] = await Promise.all([
            db.jogadores.buscarPorId(t.jogador_id),
            db.clubes.buscarPorId(t.clube_origem_id),
            db.clubes.buscarPorId(t.clube_destino_id),
            t.jogador_troca_id ? db.jogadores.buscarPorId(t.jogador_troca_id) : Promise.resolve(null)
          ]);
          return { ...t, jogador, origem, destino, jogadorTroca };
        })
      );
      
      setMeusClube(meuClubeData || null);
      setTransferenciasComDados(transferenciasComDados);
      setLoading(false);
    };
    fetchData();
  }, [user, isDono]);

  // Propostas de COMPRA recebidas (outros clubes querem comprar MEUS jogadores)
  const recebidas = meusClube
    ? transferenciasComDados.filter(t => t.clube_origem_id === meusClube.id && t.status === 'pendente')
    : [];
  
  // Propostas de COMPRA enviadas (EU quero comprar jogadores de outros clubes)
  const enviadas = meusClube
    ? transferenciasComDados.filter(t => t.clube_destino_id === meusClube.id && t.status === 'pendente')
    : [];

  const formatValor = (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
    return `R$ ${v}`;
  };

  const handleAceitar = async (id: string) => {
    const result = await db.transferencias.aceitar(id);
    if (!result) {
      alert('Não foi possível aceitar a proposta. Verifique o orçamento.');
    }
    // Recarregar transferências
    const transferenciasData = await db.transferencias.listar();
    const transferenciasComDados = await Promise.all(
      transferenciasData.map(async (t) => {
        const [jogador, origem, destino, jogadorTroca] = await Promise.all([
          db.jogadores.buscarPorId(t.jogador_id),
          db.clubes.buscarPorId(t.clube_origem_id),
          db.clubes.buscarPorId(t.clube_destino_id),
          t.jogador_troca_id ? db.jogadores.buscarPorId(t.jogador_troca_id) : Promise.resolve(null)
        ]);
        return { ...t, jogador, origem, destino, jogadorTroca };
      })
    );
    setTransferenciasComDados(transferenciasComDados);
  };

  const handleRejeitar = async (id: string) => {
    await db.transferencias.rejeitar(id);
    // Recarregar transferências
    const transferenciasData = await db.transferencias.listar();
    const transferenciasComDados = await Promise.all(
      transferenciasData.map(async (t) => {
        const [jogador, origem, destino, jogadorTroca] = await Promise.all([
          db.jogadores.buscarPorId(t.jogador_id),
          db.clubes.buscarPorId(t.clube_origem_id),
          db.clubes.buscarPorId(t.clube_destino_id),
          t.jogador_troca_id ? db.jogadores.buscarPorId(t.jogador_troca_id) : Promise.resolve(null)
        ]);
        return { ...t, jogador, origem, destino, jogadorTroca };
      })
    );
    setTransferenciasComDados(transferenciasComDados);
  };

  const renderTransferencia = (t: TransferenciaComDados) => {
    return (
      <div key={t.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Clubes envolvidos */}
            <div className="flex flex-col items-center">
              {t.origem?.escudo_url ? (
                <img
                  src={t.origem.escudo_url}
                  alt={t.origem.nome}
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: t.origem?.cor_principal || '#666' }}
                >
                  {t.origem?.nome?.charAt(0)}
                </div>
              )}
              <ArrowLeftRight className="w-4 h-4 text-gray-500 my-1" />
              {t.destino?.escudo_url ? (
                <img
                  src={t.destino.escudo_url}
                  alt={t.destino.nome}
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: t.destino?.cor_principal || '#666' }}
                >
                  {t.destino?.nome?.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {t.jogador?.foto_url ? (
                  <img
                    src={t.jogador.foto_url}
                    alt={t.jogador.nome}
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs bg-gray-800">
                    {t.jogador?.numero || '?'}
                  </div>
                )}
                <p className="font-medium">{t.jogador?.nome}</p>
                <span className="text-xs text-gray-500">{t.jogador?.posicao}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === 'aceita' ? 'bg-green-500/20 text-green-500' :
                  t.status === 'rejeitada' ? 'bg-red-500/20 text-red-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {t.status === 'aceita' ? 'Aceita' : t.status === 'rejeitada' ? 'Rejeitada' : 'Pendente'}
                </span>
              </div>
              
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-gray-400">
                  <span className="text-gray-500">{t.origem?.nome}</span>
                  {' → '}
                  <span className="text-gray-500">{t.destino?.nome}</span>
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Tipo:</span>
                  <span className="text-gray-300 capitalize">{t.tipo === 'jogador_mais_valor' ? 'Jogador + Valor' : t.tipo}</span>
                </div>

                {t.valor > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Valor:</span>
                    <span className="font-medium text-yellow-500">{formatValor(t.valor)}</span>
                  </div>
                )}

                {t.jogadorTroca && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Troca:</span>
                    {t.jogadorTroca.foto_url ? (
                      <img
                        src={t.jogadorTroca.foto_url}
                        alt={t.jogadorTroca.nome}
                        className="w-6 h-6 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-xs bg-gray-800">
                        {t.jogadorTroca.numero}
                      </div>
                    )}
                    <span className="text-gray-300">{t.jogadorTroca.nome} ({t.jogadorTroca.posicao})</span>
                  </div>
                )}

                {t.mensagem && (
                  <p className="text-gray-500 italic text-xs mt-1">"{t.mensagem}"</p>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {aba === 'recebidas' && t.status === 'pendente' && isDono && meusClube && t.clube_origem_id === meusClube.id && (
              <div className="flex gap-1">
                <button
                  onClick={() => handleAceitar(t.id)}
                  className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                  title="Aceitar"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejeitar(t.id)}
                  className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                  title="Rejeitar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-yellow-500">Carregando...</div>
      </div>
    );
  }

  if (!isDono) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Transferências</h1>
        {transferenciasComDados.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <ArrowLeftRight className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma transferência registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transferenciasComDados.map(renderTransferencia)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transferências</h1>

      {meusClube && (
        <p className="text-sm text-gray-400">
          Orçamento: <span className="text-green-500 font-bold">{formatValor(meusClube.orcamento)}</span>
        </p>
      )}

      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setAba('recebidas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            aba === 'recebidas'
              ? 'bg-green-500/10 text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Propostas Recebidas
          {recebidas.length > 0 && (
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{recebidas.length}</span>
          )}
        </button>
        <button
          onClick={() => setAba('enviadas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            aba === 'enviadas'
              ? 'bg-blue-500/10 text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          Minhas Propostas
        </button>
      </div>

      {/* Lista */}
      {aba === 'recebidas' ? (
        recebidas.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma proposta de compra recebida</p>
            <p className="text-sm text-gray-600 mt-1">Outros clubes podem fazer propostas para comprar seus jogadores</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recebidas.map(renderTransferencia)}
          </div>
        )
      ) : (
        enviadas.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <Send className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma proposta enviada</p>
            <p className="text-sm text-gray-600 mt-1">Vá ao Mercado para fazer propostas de compra</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enviadas.map(renderTransferencia)}
          </div>
        )
      )}
    </div>
  );
}