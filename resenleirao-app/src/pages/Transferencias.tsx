import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import type { Transferencia } from '../types';
import { ArrowLeftRight, Check, X, ShoppingCart, Send } from 'lucide-react';

export function Transferencias() {
  const { user, isDono } = useAuth();
  const [aba, setAba] = useState<'recebidas' | 'enviadas'>('recebidas');

  const meusClube = user && isDono ? db.clubes.buscarPorDono(user.id) : null;
  const todasTransferencias = db.transferencias.listar();
  
  // Propostas de COMPRA recebidas (outros clubes querem comprar MEUS jogadores)
  const recebidas = meusClube
    ? todasTransferencias.filter(t => t.clube_origem_id === meusClube.id && t.status === 'pendente')
    : [];
  
  // Propostas de COMPRA enviadas (EU quero comprar jogadores de outros clubes)
  const enviadas = meusClube
    ? todasTransferencias.filter(t => t.clube_destino_id === meusClube.id && t.status === 'pendente')
    : [];

  const formatValor = (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
    return `R$ ${v}`;
  };

  const handleAceitar = (id: string) => {
    const result = db.transferencias.aceitar(id);
    if (!result) {
      alert('Não foi possível aceitar a proposta. Verifique o orçamento.');
    }
  };

  const handleRejeitar = (id: string) => {
    db.transferencias.rejeitar(id);
  };

  const renderTransferencia = (t: Transferencia) => {
    const jogador = db.jogadores.buscarPorId(t.jogador_id);
    const origem = db.clubes.buscarPorId(t.clube_origem_id);
    const destino = db.clubes.buscarPorId(t.clube_destino_id);
    const jogadorTroca = t.jogador_troca_id ? db.jogadores.buscarPorId(t.jogador_troca_id) : null;

    return (
      <div key={t.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Clubes envolvidos */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: origem?.cor_principal || '#666' }}
              >
                {origem?.nome.charAt(0)}
              </div>
              <ArrowLeftRight className="w-4 h-4 text-gray-500 my-1" />
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: destino?.cor_principal || '#666' }}
              >
                {destino?.nome.charAt(0)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{jogador?.nome}</p>
                <span className="text-xs text-gray-500">{jogador?.posicao}</span>
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
                  <span className="text-gray-500">{origem?.nome}</span>
                  {' → '}
                  <span className="text-gray-500">{destino?.nome}</span>
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

                {jogadorTroca && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Troca:</span>
                    <span className="text-gray-300">{jogadorTroca.nome} ({jogadorTroca.posicao})</span>
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

  if (!isDono) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Transferências</h1>
        {todasTransferencias.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <ArrowLeftRight className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma transferência registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todasTransferencias.map(renderTransferencia)}
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