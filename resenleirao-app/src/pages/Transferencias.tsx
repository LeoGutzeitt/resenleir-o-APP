import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftRight, Check, X, Send } from 'lucide-react';

export function Transferencias() {
  const { user, isAdmin, isDono } = useAuth();
  const [showProposta, setShowProposta] = useState(false);
  const [jogadorId, setJogadorId] = useState('');
  const [clubeDestinoId, setClubeDestinoId] = useState('');
  const [tipo, setTipo] = useState<'venda' | 'emprestimo' | 'troca'>('venda');

  const transferencias = db.transferencias.listar();
  const clubes = db.clubes.listar();
  const meusClube = user && isDono ? db.clubes.buscarPorDono(user.id) : null;
  const meusJogadores = meusClube ? db.jogadores.listar(meusClube.id) : [];

  const handleProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jogadorId || !clubeDestinoId) return;
    db.transferencias.criar({
      jogador_id: jogadorId,
      clube_origem_id: meusClube?.id || '',
      clube_destino_id: clubeDestinoId,
      data: new Date().toISOString().split('T')[0],
      tipo,
      status: 'pendente',
    });
    setShowProposta(false);
    setJogadorId('');
    setClubeDestinoId('');
  };

  const handleAprovar = (id: string) => {
    db.transferencias.atualizarStatus(id, 'aprovada');
  };

  const handleRejeitar = (id: string) => {
    db.transferencias.atualizarStatus(id, 'rejeitada');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transferências</h1>
        {isDono && meusClube && (
          <button
            onClick={() => setShowProposta(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            <Send className="w-4 h-4" />
            Nova Proposta
          </button>
        )}
      </div>

      {/* Modal de Proposta */}
      {showProposta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Nova Proposta de Transferência</h2>
            <form onSubmit={handleProposta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jogador</label>
                <select
                  value={jogadorId}
                  onChange={(e) => setJogadorId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="">Selecione um jogador</option>
                  {meusJogadores.map(j => (
                    <option key={j.id} value={j.id}>{j.nome} - {j.posicao}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Clube de Destino</label>
                <select
                  value={clubeDestinoId}
                  onChange={(e) => setClubeDestinoId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="">Selecione um clube</option>
                  {clubes.filter(c => c.id !== meusClube?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <div className="flex gap-2">
                  {(['venda', 'emprestimo', 'troca'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tipo === t
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Enviar Proposta
                </button>
                <button
                  type="button"
                  onClick={() => setShowProposta(false)}
                  className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Transferências */}
      {transferencias.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <ArrowLeftRight className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma transferência registrada</p>
          {isDono && <p className="text-sm text-gray-600 mt-1">Faça uma proposta para começar</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {transferencias.map(t => {
            const jogador = db.jogadores.buscarPorId(t.jogador_id);
            const origem = db.clubes.buscarPorId(t.clube_origem_id);
            const destino = db.clubes.buscarPorId(t.clube_destino_id);
            return (
              <div key={t.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                  <div>
                    <p className="font-medium">{jogador?.nome}</p>
                    <p className="text-sm text-gray-400">{jogador?.posicao}</p>
                    <p className="text-xs text-gray-500">
                      {origem?.nome} → {destino?.nome}
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      t.status === 'aprovada' ? 'bg-green-500/20 text-green-500' :
                      t.status === 'rejeitada' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {t.status === 'aprovada' ? 'Aprovada' : t.status === 'rejeitada' ? 'Rejeitada' : 'Pendente'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 capitalize">{t.tipo}</span>
                  {isAdmin && t.status === 'pendente' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAprovar(t.id)}
                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejeitar(t.id)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}