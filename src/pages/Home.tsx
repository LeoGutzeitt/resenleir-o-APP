import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { Trophy, Swords, Goal, BarChart3 } from 'lucide-react';
import type { TabelaLinha, ArtilheiroRanking, Clube, Jogo } from '../types';

export function Home() {
  const [tabela, setTabela] = useState<TabelaLinha[]>([]);
  const [artilharia, setArtilharia] = useState<ArtilheiroRanking[]>([]);
  const [jogosRecentes, setJogosRecentes] = useState<Jogo[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    const fetchData = async () => {
      try {
        const [tabelaData, artilhariaData, jogosData, clubesData] = await Promise.all([
          db.views.tabela(),
          db.views.artilharia(),
          db.jogos.listar(),
          db.clubes.listar(),
        ]);
        if (!ativo) return;
        setTabela(tabelaData);
        setArtilharia(artilhariaData);
        setJogosRecentes(jogosData.filter(j => j.status === 'realizado').slice(0, 3));
        setClubes(clubesData);
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar os dados do campeonato.');
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void fetchData();
    return () => { ativo = false; };
  }, []);

  const lider = tabela[0];
  const artilheiro = artilharia[0];

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
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-blue-500/10 rounded-2xl p-8 border border-yellow-500/20">
        <div className="flex items-center gap-4 mb-4">
          <img src="/resenleiraologo.png" alt="Resenleirão" className="w-16 h-16" />
          <h1 className="text-3xl font-bold text-yellow-500">Resenleirão 2026</h1>
        </div>
        <p className="text-gray-400">Acompanhe todas as emoções do campeonato dos amigos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lider && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold">Líder</h3>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: lider.cor_principal }}
              >
                {lider.clube_nome.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{lider.clube_nome}</p>
                <p className="text-sm text-gray-400">{lider.pontos} pts - {lider.aproveitamento}%</p>
              </div>
            </div>
          </div>
        )}

        {artilheiro && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Goal className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold">Artilheiro</h3>
            </div>
            <div>
              <p className="font-semibold">{artilheiro.jogador_nome}</p>
              <p className="text-sm text-gray-400">{artilheiro.clube_nome} - {artilheiro.gols} gols</p>
            </div>
          </div>
        )}

        <Link to="/jogos" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold">Últimos Jogos</h3>
          </div>
          <div className="space-y-2">
            {jogosRecentes.map(jogo => {
              const casa = clubes.find((clube) => clube.id === jogo.clube_casa_id);
              const fora = clubes.find((clube) => clube.id === jogo.clube_fora_id);
              return (
                <div key={jogo.id} className="text-sm text-gray-400">
                  {casa?.nome || 'Clube'} {jogo.gols_casa} x {jogo.gols_fora} {fora?.nome || 'Clube'}
                </div>
              );
            })}
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/tabela" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Tabela</p>
        </Link>
        <Link to="/jogos" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors text-center">
          <Swords className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Jogos</p>
        </Link>
        <Link to="/artilharia" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors text-center">
          <Goal className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Artilharia</p>
        </Link>
        <Link to="/estatisticas" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-colors text-center">
          <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Estatísticas</p>
        </Link>
      </div>
    </div>
  );
}
