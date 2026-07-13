import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Dices, RefreshCw, DollarSign } from 'lucide-react';
import type { Clube, ContratacaoDraft } from '../types';
import { idsIguais } from '../lib/ids';

export function Draft() {
  const { user, isDono, isAdmin } = useAuth();
  const [draftIniciado, setDraftIniciado] = useState(false);
  const [ordemDraft, setOrdemDraft] = useState<string[]>([]);
  const [posicaoAtual, setPosicaoAtual] = useState(0);
  const [contratacoes, setContratacoes] = useState<ContratacaoDraft[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nomeJogador, setNomeJogador] = useState('');
  const [posicaoJogador, setPosicaoJogador] = useState<'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-Campo' | 'Atacante' | ''>('');
  const [valorJogador, setValorJogador] = useState('');
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [meusClube, setMeusClube] = useState<Clube | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setLoading(true);
      setErro('');
      try {
        const [clubesData, clubeDoUsuario, estadoDraft, contratacoesDraft] = await Promise.all([
          db.clubes.listar(),
          user && isDono ? db.clubes.buscarPorDono(user.id, user.clube_id) : Promise.resolve(undefined),
          db.draft.buscarEstado(),
          db.draft.listarContratacoes(),
        ]);
        if (!ativo) return;
        setClubes(clubesData);
        setMeusClube(clubeDoUsuario || null);
        setDraftIniciado(estadoDraft.iniciado);
        setOrdemDraft(estadoDraft.ordem_clubes);
        setPosicaoAtual(estadoDraft.posicao_atual);
        setContratacoes(contratacoesDraft);
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar os dados do draft.');
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregar();
    const intervalo = window.setInterval(() => {
      void Promise.all([db.draft.buscarEstado(), db.draft.listarContratacoes()])
        .then(([estadoDraft, contratacoesDraft]) => {
          if (!ativo) return;
          setDraftIniciado(estadoDraft.iniciado);
          setOrdemDraft(estadoDraft.ordem_clubes);
          setPosicaoAtual(estadoDraft.posicao_atual);
          setContratacoes(contratacoesDraft);
        })
        .catch((error) => console.error('Não foi possível sincronizar o draft:', error));
    }, 2500);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [user, isDono]);

  // Inicializar sorteio
  const iniciarDraft = async () => {
    if (clubes.length === 0) {
      setErro('Nenhum clube disponível para iniciar o draft.');
      return;
    }
    const idsClubes = clubes.map(c => c.id);
    // Embaralhar array (Fisher-Yates shuffle)
    const shuffled = [...idsClubes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setProcessando(true);
    setErro('');
    try {
      await db.draft.iniciar(shuffled);
      setOrdemDraft(shuffled);
      setPosicaoAtual(0);
      setDraftIniciado(true);
      setContratacoes([]);
    } catch (error) {
      console.error(error);
      setErro(error instanceof Error ? error.message : 'Não foi possível iniciar o draft.');
    } finally {
      setProcessando(false);
    }
  };

  // Re-sortear (mantém as contratações)
  const reSortear = async () => {
    const idsClubes = clubes.map(c => c.id);
    const shuffled = [...idsClubes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setProcessando(true);
    try {
      await db.draft.iniciar(shuffled);
      setOrdemDraft(shuffled);
      setPosicaoAtual(0);
    } catch (error) {
      console.error(error);
      setErro(error instanceof Error ? error.message : 'Não foi possível reordenar o draft.');
    } finally {
      setProcessando(false);
    }
  };

  // Time atual no draft
  const timeAtualId = ordemDraft[posicaoAtual];
  const timeAtual = clubes.find(c => idsIguais(c.id, timeAtualId));

  // Calcular orçamento restante do time atual
  const orcamentoInicial = timeAtual?.orcamento || 0;
  const gastoTimeAtual = contratacoes
    .filter(c => idsIguais(c.clube_id, timeAtualId))
    .reduce((sum, c) => sum + c.valor, 0);
  const orcamentoRestante = timeAtual ? orcamentoInicial - gastoTimeAtual : 0;

  // Verificar se é a vez do usuário
  const isMinhaVez = Boolean(meusClube && idsIguais(timeAtualId, meusClube.id));

  // Abrir formulário para criar jogador
  const handleAbrirFormulario = () => {
    if (!isMinhaVez) return;
    setShowForm(true);
  };

  // Confirmar contratação (criar novo jogador)
  const confirmarContratacao = async () => {
    if (!timeAtual || !nomeJogador || !posicaoJogador || !valorJogador) return;

    const valor = parseInt(valorJogador);
    if (valor > orcamentoRestante) {
      alert('Orçamento insuficiente!');
      return;
    }

    setProcessando(true);
    setErro('');
    try {
      await db.draft.contratar({
        nome: nomeJogador,
        posicao: posicaoJogador,
        valor,
      });
      const [estadoDraft, contratacoesDraft] = await Promise.all([
        db.draft.buscarEstado(),
        db.draft.listarContratacoes(),
      ]);
      setDraftIniciado(estadoDraft.iniciado);
      setOrdemDraft(estadoDraft.ordem_clubes);
      setPosicaoAtual(estadoDraft.posicao_atual);
      setContratacoes(contratacoesDraft);
    } catch (error) {
      console.error(error);
      setErro(error instanceof Error ? error.message : 'Não foi possível concluir a contratação.');
      return;
    } finally {
      setProcessando(false);
    }

    // Resetar e avançar
    setNomeJogador('');
    setPosicaoJogador('');
    setValorJogador('');
    setShowForm(false);
  };

  const formatValor = (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
    return `R$ ${v}`;
  };

  if (loading) {
    return <div className="text-center py-12 text-yellow-500">Carregando draft...</div>;
  }

  return (
    <div className="space-y-6">
      {erro && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draft de Contratações</h1>
          <p className="text-sm text-gray-400 mt-1">
            Sistema de draft para contratação de jogadores
          </p>
        </div>
        {!draftIniciado && isAdmin && (
          <button
            onClick={() => void iniciarDraft()}
            disabled={processando}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <Dices className="w-5 h-5" />
            Iniciar Draft
          </button>
        )}
      </div>

      {!draftIniciado ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <Dices className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Draft não iniciado</p>
          <p className="text-gray-500 text-sm">
            Clique em "Iniciar Draft" para sortear a ordem de escolha dos times
          </p>
        </div>
      ) : (
        <>
          {/* Ordem do Draft */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Ordem de Escolha</h2>
              {isAdmin && contratacoes.length === 0 && <button
                onClick={() => void reSortear()}
                disabled={processando}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Re-sortear
              </button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ordemDraft.map((clubeId, index) => {
                const clube = clubes.find(c => idsIguais(c.id, clubeId));
                const isCurrentPick = index === posicaoAtual;
                const isMyTeam = meusClube && idsIguais(clubeId, meusClube.id);
                
                return (
                  <div
                    key={clubeId}
                    className={`p-3 rounded-lg border-2 ${
                      isCurrentPick
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : isMyTeam
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: clube?.cor_principal || '#666' }}
                      >
                        {clube?.nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{clube?.nome}</p>
                        <p className="text-xs text-gray-400">#{index + 1}</p>
                      </div>
                    </div>
                    {isCurrentPick && (
                      <div className="mt-2 text-xs text-yellow-500 font-medium">
                        Escolhendo...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vez do Time Atual */}
          {timeAtual && (
            <div className={`rounded-xl p-6 border-2 ${
              isMinhaVez 
                ? 'bg-blue-500/10 border-blue-500' 
                : 'bg-gray-900 border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: timeAtual.cor_principal }}
                  >
                    {timeAtual.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{timeAtual.nome}</h3>
                    <p className="text-sm text-gray-400">
                      {isMinhaVez ? 'Sua vez de escolher!' : 'Vez do adversário'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Orçamento Restante</p>
                  <p className={`text-2xl font-bold ${orcamentoRestante > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatValor(orcamentoRestante)}
                  </p>
                </div>
              </div>

              {isMinhaVez && !showForm && (
                <div className="mt-4">
                  <button
                    onClick={handleAbrirFormulario}
                    className="w-full py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Contratar Novo Jogador
                  </button>
                </div>
              )}

              {isMinhaVez && showForm && (
                <div className="mt-4 bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Contratar Novo Jogador</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome do Jogador
                      </label>
                      <input
                        type="text"
                        value={nomeJogador}
                        onChange={(e) => setNomeJogador(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Ex: João Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Posição
                      </label>
                      <select
                        value={posicaoJogador}
                        onChange={(e) => setPosicaoJogador(e.target.value as any)}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Selecione uma posição</option>
                        <option value="Goleiro">Goleiro</option>
                        <option value="Zagueiro">Zagueiro</option>
                        <option value="Lateral">Lateral</option>
                        <option value="Meio-Campo">Meio-Campo</option>
                        <option value="Atacante">Atacante</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Valor de Mercado (R$)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          value={valorJogador}
                          onChange={(e) => setValorJogador(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Ex: 5000000"
                          min="0"
                          max={orcamentoRestante}
                          step="100000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Orçamento restante: {formatValor(orcamentoRestante)}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={confirmarContratacao}
                        disabled={processando || !nomeJogador || !posicaoJogador || !valorJogador || parseInt(valorJogador) > orcamentoRestante}
                        className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        Concluir Contratação
                      </button>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setNomeJogador('');
                          setPosicaoJogador('');
                          setValorJogador('');
                        }}
                        className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contratações do Draft */}
          {contratacoes.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Contratações do Draft</h2>
              <div className="space-y-2">
                {contratacoes.map((contratacao, index) => {
                  const clube = clubes.find(c => idsIguais(c.id, contratacao.clube_id));
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">#{contratacao.rodada}</span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: clube?.cor_principal || '#666' }}
                        >
                          {clube?.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{contratacao.jogador_nome}</p>
                          <p className="text-xs text-gray-400">{clube?.nome}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-500">
                        {formatValor(contratacao.valor)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
