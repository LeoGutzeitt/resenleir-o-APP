import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Plus, Trash2, Edit3, Save, X } from 'lucide-react';

export function Admin() {
  const { isAdmin } = useAuth();
  const [aba, setAba] = useState<'clubes' | 'jogos' | 'jogadores'>('clubes');
  const [showAddClube, setShowAddClube] = useState(false);
  const [novoClubeNome, setNovoClubeNome] = useState('');
  const [novoClubeCor, setNovoClubeCor] = useState('#FF4500');
  const [editingClubeId, setEditingClubeId] = useState<string | null>(null);
  const [editClubeNome, setEditClubeNome] = useState('');

  const clubes = db.clubes.listar();
  const jogos = db.jogos.listar();
  const todosJogadores = db.jogadores.listar();

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-400">Acesso restrito ao administrador</p>
      </div>
    );
  }

  // Clubes
  const handleAddClube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClubeNome) return;
    db.clubes.criar({
      nome: novoClubeNome,
      escudo_url: null,
      cor_principal: novoClubeCor,
      usuario_dono_id: null,
    });
    setShowAddClube(false);
    setNovoClubeNome('');
  };

  const handleRemoveClube = (id: string) => {
    if (confirm('Tem certeza que deseja remover este clube?')) {
      db.clubes.remover(id);
    }
  };

  const handleEditClube = (id: string) => {
    const clube = db.clubes.buscarPorId(id);
    if (clube) {
      setEditingClubeId(id);
      setEditClubeNome(clube.nome);
    }
  };

  const handleSaveEdit = (id: string) => {
    db.clubes.atualizar(id, { nome: editClubeNome });
    setEditingClubeId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>

      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {(['clubes', 'jogos', 'jogadores'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              aba === tab
                ? 'bg-yellow-500/10 text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'clubes' ? 'Clubes' : tab === 'jogos' ? 'Jogos' : 'Jogadores'}
          </button>
        ))}
      </div>

      {/* Aba Clubes */}
      {aba === 'clubes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Gerenciar Clubes</h2>
            <button
              onClick={() => setShowAddClube(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Clube
            </button>
          </div>

          {/* Modal Add Clube */}
          {showAddClube && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Adicionar Clube</h3>
                <form onSubmit={handleAddClube} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                    <input
                      type="text"
                      value={novoClubeNome}
                      onChange={(e) => setNovoClubeNome(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cor Principal</label>
                    <input
                      type="color"
                      value={novoClubeCor}
                      onChange={(e) => setNovoClubeCor(e.target.value)}
                      className="w-full h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
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
                      onClick={() => setShowAddClube(false)}
                      className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de Clubes */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Cor</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Dono</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clubes.map(clube => {
                  return (
                    <tr key={clube.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        {editingClubeId === clube.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editClubeNome}
                              onChange={(e) => setEditClubeNome(e.target.value)}
                              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                            />
                            <button
                              onClick={() => handleSaveEdit(clube.id)}
                              className="p-1 text-green-500 hover:text-green-400"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingClubeId(null)}
                              className="p-1 text-red-500 hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: clube.cor_principal }}
                            >
                              {clube.nome.charAt(0)}
                            </div>
                            <span className="font-medium">{clube.nome}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: clube.cor_principal }}
                          />
                          <span className="text-sm text-gray-400">{clube.cor_principal}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{clube.usuario_dono_id ? 'Sim' : 'Não'}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditClube(clube.id)}
                            className="p-2 text-gray-500 hover:text-yellow-500 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveClube(clube.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba Jogos */}
      {aba === 'jogos' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Jogos do Campeonato</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Rodada</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Casa</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-400">Placar</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Fora</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {jogos.map(jogo => {
                  const casa = db.clubes.buscarPorId(jogo.clube_casa_id);
                  const fora = db.clubes.buscarPorId(jogo.clube_fora_id);
                  return (
                    <tr key={jogo.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-400">{jogo.rodada}ª</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: casa?.cor_principal || '#666' }}
                          >
                            {casa?.nome.charAt(0)}
                          </div>
                          <span className="text-sm">{casa?.nome}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        {jogo.status === 'realizado' ? (
                          <span className="font-bold">{jogo.gols_casa} x {jogo.gols_fora}</span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{fora?.nome}</span>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: fora?.cor_principal || '#666' }}
                          >
                            {fora?.nome.charAt(0)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          jogo.status === 'realizado' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {jogo.status === 'realizado' ? 'Realizado' : 'Agendado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba Jogadores */}
      {aba === 'jogadores' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Todos os Jogadores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">#</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Nome</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Posição</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {todosJogadores.map(jog => {
                  const clube = db.clubes.buscarPorId(jog.clube_id);
                  return (
                    <tr key={jog.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-sm">{jog.numero}</td>
                      <td className="py-4 px-4 font-medium">{jog.nome}</td>
                      <td className="py-4 px-4 text-gray-400">{jog.posicao}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: clube?.cor_principal || '#666' }}
                          >
                            {clube?.nome.charAt(0)}
                          </div>
                          <span className="text-sm">{clube?.nome}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          jog.status === 'ativo' ? 'bg-green-500/20 text-green-500' :
                          jog.status === 'vendido' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {jog.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}