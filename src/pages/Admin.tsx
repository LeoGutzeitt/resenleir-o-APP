<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useEffect, useMemo, useState } from 'react';
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Plus, Trash2, Edit3, Save, X, DollarSign, Users, CheckCircle } from 'lucide-react';
import type { Clube, Jogador, Jogo, Usuario } from '../types';

type ValoresEstatistica = {
  gols: number;
  assistencias: number;
  cartoes_amarelos: number;
  cartoes_vermelhos: number;
};

export function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [aba, setAba] = useState<'clubes' | 'jogos' | 'jogadores'>('clubes');
  const [showAddClube, setShowAddClube] = useState(false);
  const [novoClubeNome, setNovoClubeNome] = useState('');
  const [novoClubeCor, setNovoClubeCor] = useState('#FF4500');
  const [novoClubeEscudo, setNovoClubeEscudo] = useState<File | null>(null);
  const [editingClubeId, setEditingClubeId] = useState<string | null>(null);
  const [editClubeNome, setEditClubeNome] = useState('');
  const [editClubeOrcamento, setEditClubeOrcamento] = useState('');
  const [editingJogoId, setEditingJogoId] = useState<string | null>(null);
  const [editGolsCasa, setEditGolsCasa] = useState('');
  const [editGolsFora, setEditGolsFora] = useState('');
  const [jogoSelecionado, setJogoSelecionado] = useState<string | null>(null);
<<<<<<< HEAD
  const [estatisticasJogo, setEstatisticasJogo] = useState<Map<string, {gols: number, assistencias: number, cartoes_amarelos: number, cartoes_vermelhos: number}>>(new Map());
  const [clubes, setClubes] = useState<any[]>([]);
  const [jogos, setJogos] = useState<any[]>([]);
  const [todosJogadores, setTodosJogadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [clubesData, jogosData, jogadoresData] = await Promise.all([
        db.clubes.listar(),
        db.jogos.listar(),
        db.jogadores.listar()
      ]);
      setClubes(clubesData);
      setJogos(jogosData);
      setTodosJogadores(jogadoresData);
      setLoading(false);
    };
    fetchData();
  }, []);
=======
  const [estatisticasJogo, setEstatisticasJogo] = useState<Map<string, ValoresEstatistica>>(new Map());
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [donos, setDonos] = useState<Usuario[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [todosJogadores, setTodosJogadores] = useState<Jogador[]>([]);
  const [salvandoClube, setSalvandoClube] = useState(false);
  const [associandoClubeId, setAssociandoClubeId] = useState<string | null>(null);
  const [gerandoJogos, setGerandoJogos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const carregar = async () => {
      setLoading(true);
      setErro('');
      try {
        const [clubesResult, donosResult, jogosResult, jogadoresResult] = await Promise.allSettled([
          db.clubes.listar(),
          db.usuarios.listarDonos(),
          db.jogos.listar(),
          db.jogadores.listar(),
        ]);
        if (!ativo) return;

        if (clubesResult.status === 'fulfilled') setClubes(clubesResult.value);
        if (donosResult.status === 'fulfilled') setDonos(donosResult.value);
        if (jogosResult.status === 'fulfilled') setJogos(jogosResult.value);
        if (jogadoresResult.status === 'fulfilled') setTodosJogadores(jogadoresResult.value);

        const falhaClubes = clubesResult.status === 'rejected' || donosResult.status === 'rejected';
        const falhaCompeticao = jogosResult.status === 'rejected' || jogadoresResult.status === 'rejected';
        if (falhaClubes) {
          setErro('Não foi possível carregar clubes e perfis de donos. Execute a migração mais recente do Supabase.');
        } else if (falhaCompeticao) {
          setErro('Clubes carregados, mas alguns dados de jogos ou jogadores estão indisponíveis.');
        }
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar os dados administrativos.');
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, [isAdmin]);

  const clubesPorId = useMemo(() => new Map(clubes.map((clube) => [clube.id, clube])), [clubes]);
  const jogosPorId = useMemo(() => new Map(jogos.map((jogo) => [jogo.id, jogo])), [jogos]);
  const jogadoresPorId = useMemo(
    () => new Map(todosJogadores.map((jogador) => [jogador.id, jogador])),
    [todosJogadores],
  );

  if (authLoading || (isAdmin && loading)) {
    return <div className="text-center py-12 text-yellow-500">Carregando painel administrativo...</div>;
  }
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-400">Acesso restrito ao administrador</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-yellow-500">Carregando...</div>
      </div>
    );
  }

  const handleAddClube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClubeNome) return;
    setSalvandoClube(true);
    setErro('');
    try {
      let escudo_url: string | null = null;

      if (novoClubeEscudo) {
        const reader = new FileReader();
        escudo_url = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(novoClubeEscudo);
        });
      }

      const clube = await db.clubes.criar({
        nome: novoClubeNome,
        escudo_url,
        cor_principal: novoClubeCor,
        usuario_dono_id: null,
        orcamento: 100000000,
      });
      setClubes((atuais) => [...atuais, clube]);
      setShowAddClube(false);
      setNovoClubeNome('');
      setNovoClubeCor('#FF4500');
      setNovoClubeEscudo(null);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível criar o clube. Verifique se a migração mais recente foi executada.');
    } finally {
      setSalvandoClube(false);
    }
<<<<<<< HEAD

    await db.clubes.criar({
      nome: novoClubeNome,
      escudo_url,
      cor_principal: novoClubeCor,
      usuario_dono_id: null,
      orcamento: 100000000,
    });
    setShowAddClube(false);
    setNovoClubeNome('');
    setNovoClubeCor('#FF4500');
    setNovoClubeEscudo(null);
    // Recarregar clubes
    setClubes(await db.clubes.listar());
  };

  const handleRemoveClube = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este clube?')) {
      await db.clubes.remover(id);
      setClubes(await db.clubes.listar());
=======
  };

  const handleAssociarDono = async (clubeId: string, usuarioId: string | null) => {
    setAssociandoClubeId(clubeId);
    setErro('');
    try {
      await db.usuarios.associarClube(clubeId, usuarioId);
      const [clubesAtualizados, donosAtualizados] = await Promise.all([
        db.clubes.listar(),
        db.usuarios.listarDonos(),
      ]);
      setClubes(clubesAtualizados);
      setDonos(donosAtualizados);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível associar o dono ao clube. Verifique as permissões do Supabase.');
    } finally {
      setAssociandoClubeId(null);
    }
  };

  const handleRemoveClube = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este clube?')) {
      const removido = await db.clubes.remover(id);
      if (removido) setClubes((atuais) => atuais.filter((clube) => clube.id !== id));
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    }
  };

  const handleEditClube = (id: string) => {
<<<<<<< HEAD
    const clube = clubes.find((c: any) => c.id === id);
=======
    const clube = clubesPorId.get(id);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    if (clube) {
      setEditingClubeId(id);
      setEditClubeNome(clube.nome);
      setEditClubeOrcamento(String(clube.orcamento));
    }
  };

  const handleSaveEdit = async (id: string) => {
<<<<<<< HEAD
    await db.clubes.atualizar(id, { 
=======
    const clube = await db.clubes.atualizar(id, {
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
      nome: editClubeNome,
      orcamento: parseInt(editClubeOrcamento) || 0
    });
    if (clube) setClubes((atuais) => atuais.map((atual) => atual.id === id ? clube : atual));
    setEditingClubeId(null);
    setClubes(await db.clubes.listar());
  };

  const handleEditJogo = (id: string) => {
<<<<<<< HEAD
    const jogo = jogos.find((j: any) => j.id === id);
=======
    const jogo = jogosPorId.get(id);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    if (jogo) {
      setEditingJogoId(id);
      setEditGolsCasa(String(jogo.gols_casa || 0));
      setEditGolsFora(String(jogo.gols_fora || 0));
    }
  };

  const handleSaveJogo = async (id: string) => {
    const golsCasa = parseInt(editGolsCasa) || 0;
    const golsFora = parseInt(editGolsFora) || 0;
<<<<<<< HEAD
    await db.jogos.atualizarResultado(id, golsCasa, golsFora);
=======
    const jogo = await db.jogos.atualizarResultado(id, golsCasa, golsFora);
    if (jogo) setJogos((atuais) => atuais.map((atual) => atual.id === id ? jogo : atual));
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    setEditingJogoId(null);
    setJogos(await db.jogos.listar());
  };

<<<<<<< HEAD
  const handleAbrirEstatisticas = async (jogoId: string) => {
    const jogo = jogos.find((j: any) => j.id === jogoId);
    if (!jogo) return;

    const [jogadoresCasa, jogadoresFora, stats] = await Promise.all([
      db.jogadores.listar(jogo.clube_casa_id),
      db.jogadores.listar(jogo.clube_fora_id),
      db.estatisticas.listarPorJogo(jogoId)
    ]);
=======
  const handleGerarJogos = async () => {
    setGerandoJogos(true);
    setErro('');
    try {
      const total = await db.jogos.gerarTabela();
      const jogosAtualizados = await db.jogos.listar();
      setJogos(jogosAtualizados);
      if (total === 0) setErro('Nenhum jogo foi gerado. Verifique a quantidade de clubes.');
    } catch (error) {
      console.error(error);
      setErro(error instanceof Error ? error.message : 'Não foi possível gerar os jogos.');
    } finally {
      setGerandoJogos(false);
    }
  };

  const handleAbrirEstatisticas = async (jogoId: string) => {
    const jogo = jogosPorId.get(jogoId);
    if (!jogo) return;

    const jogadoresCasa = todosJogadores.filter((jogador) => jogador.clube_id === jogo.clube_casa_id);
    const jogadoresFora = todosJogadores.filter((jogador) => jogador.clube_id === jogo.clube_fora_id);
    const stats = await db.estatisticas.listarPorJogo(jogoId);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
    
    const novasStats = new Map<string, {gols: number, assistencias: number, cartoes_amarelos: number, cartoes_vermelhos: number}>();
    
    [...jogadoresCasa, ...jogadoresFora].forEach((jogador: any) => {
      const stat = stats.find((s: any) => s.jogador_id === jogador.id);
      novasStats.set(jogador.id, {
        gols: stat?.gols || 0,
        assistencias: stat?.assistencias || 0,
        cartoes_amarelos: stat?.cartoes_amarelos || 0,
        cartoes_vermelhos: stat?.cartoes_vermelhos || 0
      });
    });
    
    setEstatisticasJogo(novasStats);
    setJogoSelecionado(jogoId);
  };

  const handleSalvarEstatisticas = async (jogoId: string) => {
<<<<<<< HEAD
    const jogo = jogos.find((j: any) => j.id === jogoId);
    if (!jogo) return;

    const statsAntigas = await db.estatisticas.listarPorJogo(jogoId);
    for (const stat of statsAntigas) {
      await db.estatisticas.remover(stat.id);
    }

    for (const [jogadorId, valores] of estatisticasJogo.entries()) {
=======
    const jogo = jogosPorId.get(jogoId);
    if (!jogo) return;

    const statsAntigas = await db.estatisticas.listarPorJogo(jogoId);
    await Promise.all(statsAntigas.map((stat) => db.estatisticas.remover(stat.id)));

    for (const [jogadorId, valores] of estatisticasJogo) {
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
      if (valores.gols > 0 || valores.assistencias > 0 || valores.cartoes_amarelos > 0 || valores.cartoes_vermelhos > 0) {
        await db.estatisticas.criar({
          jogador_id: jogadorId,
          jogo_id: jogoId,
          gols: valores.gols,
          assistencias: valores.assistencias,
          cartoes_amarelos: valores.cartoes_amarelos,
          cartoes_vermelhos: valores.cartoes_vermelhos
        });

<<<<<<< HEAD
        const jogador = await db.jogadores.buscarPorId(jogadorId);
=======
        const jogador = jogadoresPorId.get(jogadorId);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
        if (jogador) {
          let jogosSuspensao = 0;
          const cartoesAmarelos = valores.cartoes_amarelos;
          const cartoesVermelhos = valores.cartoes_vermelhos;
          
          jogosSuspensao += Math.floor(cartoesAmarelos / 3);
          jogosSuspensao += cartoesVermelhos;
          
          if (jogosSuspensao > 0) {
<<<<<<< HEAD
            await db.jogadores.atualizar(jogadorId, {
              jogos_suspensao: (jogador.jogos_suspensao || 0) + jogosSuspensao,
=======
            const jogadorAtualizado = await db.jogadores.atualizar(jogadorId, {
              jogos_suspensao: jogador.jogos_suspensao + jogosSuspensao,
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
              status: 'suspenso'
            });
            if (jogadorAtualizado) {
              setTodosJogadores((atuais) => atuais.map((atual) => atual.id === jogadorId ? jogadorAtualizado : atual));
            }
          }
        }
      }
    }

    setJogoSelecionado(null);
    setEstatisticasJogo(new Map());
  };

  const handleUpdateEstatistica = (jogadorId: string, campo: 'gols' | 'assistencias' | 'cartoes_amarelos' | 'cartoes_vermelhos', valor: number) => {
    setEstatisticasJogo(prev => {
      const novas = new Map(prev);
      const atual = novas.get(jogadorId) as {gols: number, assistencias: number, cartoes_amarelos: number, cartoes_vermelhos: number} | undefined;
      const novoValor = {
        gols: campo === 'gols' ? valor : (atual?.gols ?? 0),
        assistencias: campo === 'assistencias' ? valor : (atual?.assistencias ?? 0),
        cartoes_amarelos: campo === 'cartoes_amarelos' ? valor : (atual?.cartoes_amarelos ?? 0),
        cartoes_vermelhos: campo === 'cartoes_vermelhos' ? valor : (atual?.cartoes_vermelhos ?? 0)
      };
      novas.set(jogadorId, novoValor);
      return novas;
    });
  };

  const handleCumpriuSuspensao = async (jogadorId: string) => {
<<<<<<< HEAD
    const jogador = await db.jogadores.buscarPorId(jogadorId);
    if (jogador && (jogador.jogos_suspensao || 0) > 0) {
      const novaSuspensao = (jogador.jogos_suspensao || 0) - 1;
      if (novaSuspensao <= 0) {
        await db.jogadores.atualizar(jogadorId, {
=======
    const jogador = jogadoresPorId.get(jogadorId);
    if (jogador && jogador.jogos_suspensao > 0) {
      const novaSuspensao = jogador.jogos_suspensao - 1;
      if (novaSuspensao <= 0) {
        const atualizado = await db.jogadores.atualizar(jogadorId, {
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
          jogos_suspensao: 0,
          status: 'ativo'
        });
        if (atualizado) setTodosJogadores((atuais) => atuais.map((atual) => atual.id === jogadorId ? atualizado : atual));
      } else {
<<<<<<< HEAD
        await db.jogadores.atualizar(jogadorId, {
=======
        const atualizado = await db.jogadores.atualizar(jogadorId, {
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
          jogos_suspensao: novaSuspensao
        });
        if (atualizado) setTodosJogadores((atuais) => atuais.map((atual) => atual.id === jogadorId ? atualizado : atual));
      }
      setTodosJogadores(await db.jogadores.listar());
    }
  };

  const handleGerarCalendario = async () => {
    const substituir = jogos.length > 0;
    if (substituir && !confirm('Isso substituirá somente jogos ainda não realizados. Continuar?')) return;
    try {
      const total = await db.jogos.gerarIdaVolta(substituir);
      setJogos(await db.jogos.listar());
      alert(`Calendário criado: ${total} jogos, com ida e volta.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível gerar o calendário.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>

      {erro && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Escudo do Clube (opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNovoClubeEscudo(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black file:font-medium file:cursor-pointer hover:file:bg-yellow-400"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={salvandoClube}
                      className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60"
                    >
                      {salvandoClube ? 'Adicionando...' : 'Adicionar'}
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

          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Clube</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Cor</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Dono</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Orçamento</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clubes.map(clube => (
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
                          {clube.escudo_url ? (
                            <img
                              src={clube.escudo_url}
                              alt={clube.nome}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: clube.cor_principal }}
                            >
                              {clube.nome?.charAt(0)}
                            </div>
                          )}
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
                    <td className="py-4 px-4">
                      <select
                        value={clube.usuario_dono_id || ''}
                        disabled={associandoClubeId === clube.id}
                        onChange={(e) => void handleAssociarDono(clube.id, e.target.value || null)}
                        aria-label={`Dono do clube ${clube.nome}`}
                        className="w-full min-w-48 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 disabled:opacity-60"
                      >
                        <option value="">Sem dono</option>
                        {donos.map((dono) => (
                          <option key={dono.id} value={dono.id}>
                            {dono.nome} ({dono.email})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      {editingClubeId === clube.id ? (
                        <input
                          type="number"
                          value={editClubeOrcamento}
                          onChange={(e) => setEditClubeOrcamento(e.target.value)}
                          className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm w-32"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">{clube.orcamento?.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClube(clube.id)}
                          className="p-2 text-gray-500 hover:text-yellow-500 transition-colors"
                          title="Editar clube"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveClube(clube.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          title="Remover clube"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'jogos' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
<<<<<<< HEAD
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">Gerenciar Jogos</h2>
              <button onClick={handleGerarCalendario} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400">Gerar ida e volta</button>
            </div>
            <p className="text-sm text-gray-400 mt-1">Edite os resultados e estatísticas dos jogos</p>
=======
          <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Gerenciar Jogos</h2>
              <p className="text-sm text-gray-400 mt-1">Edite os resultados e estatísticas dos jogos</p>
            </div>
            {jogos.length === 0 && (
              <button
                onClick={() => void handleGerarJogos()}
                disabled={gerandoJogos || clubes.length < 2}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {gerandoJogos ? 'Gerando...' : 'Gerar Jogos'}
              </button>
            )}
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
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
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {jogos.map(jogo => {
<<<<<<< HEAD
                  const casa = clubes.find((c: any) => c.id === jogo.clube_casa_id);
                  const fora = clubes.find((c: any) => c.id === jogo.clube_fora_id);
=======
                  const casa = clubesPorId.get(jogo.clube_casa_id);
                  const fora = clubesPorId.get(jogo.clube_fora_id);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
                  const isEditing = editingJogoId === jogo.id;
                  
                  return (
                    <tr key={jogo.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-400">{jogo.rodada}ª</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: casa?.cor_principal || '#666' }}
                          >
                            {casa?.nome?.charAt(0)}
                          </div>
                          <span className="text-sm">{casa?.nome}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={editGolsCasa}
                              onChange={(e) => setEditGolsCasa(e.target.value)}
                              className="w-12 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center text-sm"
                              min="0"
                            />
                            <span className="text-gray-500">x</span>
                            <input
                              type="number"
                              value={editGolsFora}
                              onChange={(e) => setEditGolsFora(e.target.value)}
                              className="w-12 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center text-sm"
                              min="0"
                            />
                          </div>
                        ) : jogo.status === 'realizado' ? (
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
                            {fora?.nome?.charAt(0)}
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
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveJogo(jogo.id)}
                                className="p-2 text-green-500 hover:text-green-400 transition-colors"
                                title="Salvar placar"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingJogoId(null)}
                                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditJogo(jogo.id)}
                                className="p-2 text-gray-500 hover:text-yellow-500 transition-colors"
                                title="Editar placar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {jogo.status === 'realizado' && (
                                <button
                                  onClick={() => handleAbrirEstatisticas(jogo.id)}
                                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                                  title="Editar estatísticas"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
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

      {jogoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Estatísticas do Jogo</h3>
              <button
                onClick={() => {
                  setJogoSelecionado(null);
                  setEstatisticasJogo(new Map());
                }}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {(() => {
<<<<<<< HEAD
              const jogo = jogos.find((j: any) => j.id === jogoSelecionado);
              if (!jogo) return null;
              
              const clubeCasa = clubes.find((c: any) => c.id === jogo.clube_casa_id);
              const clubeFora = clubes.find((c: any) => c.id === jogo.clube_fora_id);
              const jogadoresCasa = todosJogadores.filter((j: any) => j.clube_id === jogo.clube_casa_id);
              const jogadoresFora = todosJogadores.filter((j: any) => j.clube_id === jogo.clube_fora_id);
=======
              const jogo = jogosPorId.get(jogoSelecionado);
              if (!jogo) return null;

              const jogadoresCasa = todosJogadores.filter((jogador) => jogador.clube_id === jogo.clube_casa_id);
              const jogadoresFora = todosJogadores.filter((jogador) => jogador.clube_id === jogo.clube_fora_id);
              const clubeCasa = clubesPorId.get(jogo.clube_casa_id);
              const clubeFora = clubesPorId.get(jogo.clube_fora_id);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
              
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: clubeCasa?.cor_principal }}
                        >
                          {clubeCasa?.nome?.charAt(0)}
                        </div>
                        {clubeCasa?.nome}
                      </h4>
                      <div className="space-y-2">
                        {jogadoresCasa.map((jogador: any) => {
                          const stats = estatisticasJogo.get(jogador.id) || {gols: 0, assistencias: 0, cartoes_amarelos: 0, cartoes_vermelhos: 0};
                          return (
                            <div key={jogador.id} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{jogador.nome}</p>
                                <p className="text-xs text-gray-400">{jogador.posicao}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-400">G:</label>
                                  <input
                                    type="number"
                                    value={stats.gols}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'gols', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-400">A:</label>
                                  <input
                                    type="number"
                                    value={stats.assistencias}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'assistencias', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-yellow-400">CA:</label>
                                  <input
                                    type="number"
                                    value={stats.cartoes_amarelos}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'cartoes_amarelos', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                    max="2"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-red-400">CV:</label>
                                  <input
                                    type="number"
                                    value={stats.cartoes_vermelhos}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'cartoes_vermelhos', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                    max="1"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: clubeFora?.cor_principal }}
                        >
                          {clubeFora?.nome?.charAt(0)}
                        </div>
                        {clubeFora?.nome}
                      </h4>
                      <div className="space-y-2">
                        {jogadoresFora.map((jogador: any) => {
                          const stats = estatisticasJogo.get(jogador.id) || {gols: 0, assistencias: 0, cartoes_amarelos: 0, cartoes_vermelhos: 0};
                          return (
                            <div key={jogador.id} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{jogador.nome}</p>
                                <p className="text-xs text-gray-400">{jogador.posicao}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-400">G:</label>
                                  <input
                                    type="number"
                                    value={stats.gols}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'gols', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-400">A:</label>
                                  <input
                                    type="number"
                                    value={stats.assistencias}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'assistencias', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-yellow-400">CA:</label>
                                  <input
                                    type="number"
                                    value={stats.cartoes_amarelos}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'cartoes_amarelos', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                    max="2"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-red-400">CV:</label>
                                  <input
                                    type="number"
                                    value={stats.cartoes_vermelhos}
                                    onChange={(e) => handleUpdateEstatistica(jogador.id, 'cartoes_vermelhos', parseInt(e.target.value) || 0)}
                                    className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                    min="0"
                                    max="1"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSalvarEstatisticas(jogoSelecionado)}
                      className="flex-1 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors"
                    >
                      Salvar Estatísticas
                    </button>
                    <button
                      onClick={() => {
                        setJogoSelecionado(null);
                        setEstatisticasJogo(new Map());
                      }}
                      className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
<<<<<<< HEAD
                {todosJogadores.map((jog: any) => {
                  const clube = clubes.find((c: any) => c.id === jog.clube_id);
=======
                {todosJogadores.map(jog => {
                  const clube = clubesPorId.get(jog.clube_id);
>>>>>>> 702690a7763f707c4d59175d952155e1881f56d3
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
                            {clube?.nome?.charAt(0)}
                          </div>
                          <span className="text-sm">{clube?.nome}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            jog.status === 'ativo' ? 'bg-green-500/20 text-green-500' :
                            jog.status === 'vendido' ? 'bg-red-500/20 text-red-500' :
                            jog.status === 'suspenso' ? 'bg-orange-500/20 text-orange-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {jog.status === 'suspenso' ? `Suspenso (${jog.jogos_suspensao} jogos)` : jog.status}
                          </span>
                          {jog.status === 'suspenso' && (jog.jogos_suspensao || 0) > 0 && (
                            <button
                              onClick={() => handleCumpriuSuspensao(jog.id)}
                              className="p-1 text-green-500 hover:text-green-400 transition-colors"
                              title="Marcar suspensão como cumprida"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
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
    </div>
  );
}
