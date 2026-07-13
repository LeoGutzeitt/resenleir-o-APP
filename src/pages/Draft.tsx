import { useEffect, useState } from 'react';
import { Dices, DollarSign } from 'lucide-react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import type { Clube, Jogador } from '../types';

export function Draft() {
  const { user, isAdmin, isDono } = useAuth();
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [draft, setDraft] = useState<any | null>(null);
  const [escolhas, setEscolhas] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState<Jogador['posicao']>('Atacante');
  const [numero, setNumero] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');

  const carregar = async () => {
    const [listaClubes, aberto] = await Promise.all([db.clubes.listar(), db.draft.aberto()]);
    setClubes(listaClubes); setDraft(aberto);
    setEscolhas(aberto ? await db.draft.escolhas(aberto.id) : []);
  };
  useEffect(() => { carregar(); }, []);
  const atualId = draft?.ordem?.[draft.escolha_atual];
  const atual = clubes.find(c => c.id === atualId);
  const minhaVez = isAdmin || (!!user?.clube_id && String(user.clube_id) === String(atualId));
  const formatar = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0);

  const iniciar = async () => { try { setErro(''); await db.draft.iniciar(); await carregar(); } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível iniciar o draft'); } };
  const escolher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErro(''); await db.draft.escolher(nome, posicao, Number(numero), Number(valor));
      setNome(''); setNumero(''); setValor(''); await carregar();
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível registrar a escolha'); }
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Draft de Contratações</h1><p className="text-sm text-gray-400">Ordem, escolhas e orçamento ficam salvos e sincronizados para todos.</p></div>
      {isAdmin && !draft && <button onClick={iniciar} className="flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-bold rounded-lg"><Dices className="w-5 h-5" />Iniciar novo draft</button>}</div>
    {erro && <p className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-red-400">{erro}</p>}
    {!draft ? <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">Nenhum draft aberto. O administrador pode iniciar um quando todos estiverem prontos.</div> : <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5"><p className="text-sm text-gray-400 mb-3">Ordem de escolha</p><div className="grid grid-cols-2 md:grid-cols-5 gap-2">{draft.ordem.map((id: string, i: number) => { const c = clubes.find(x => String(x.id) === String(id)); return <div key={`${id}-${i}`} className={`rounded-lg p-3 ${i === draft.escolha_atual ? 'bg-yellow-500/15 border border-yellow-500 text-yellow-400' : 'bg-gray-800 text-gray-300'}`}>#{i + 1} {c?.nome || 'Clube'}</div>; })}</div></div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6"><h2 className="text-xl font-bold">Vez de {atual?.nome}</h2><p className="text-gray-400 mt-1">{minhaVez ? 'Sua vez de escolher.' : 'Aguardando a escolha deste clube.'}</p>
        {isDono && minhaVez && <form onSubmit={escolher} className="mt-5 grid md:grid-cols-4 gap-3"><input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do jogador" className="px-3 py-2 bg-gray-800 rounded-lg" /><select value={posicao} onChange={e => setPosicao(e.target.value as Jogador['posicao'])} className="px-3 py-2 bg-gray-800 rounded-lg">{['Goleiro','Zagueiro','Lateral','Meio-Campo','Atacante'].map(p => <option key={p}>{p}</option>)}</select><input required min="1" max="99" type="number" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Camisa" className="px-3 py-2 bg-gray-800 rounded-lg" /><div className="flex gap-2"><input required min="0" type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Valor (R$)" className="min-w-0 flex-1 px-3 py-2 bg-gray-800 rounded-lg" /><button className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg">Escolher</button></div></form>}</div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"><div className="p-4 font-semibold">Escolhas realizadas</div>{escolhas.length === 0 ? <p className="px-4 pb-4 text-gray-500">Nenhuma escolha ainda.</p> : escolhas.map((e, i) => <div key={e.id} className="flex justify-between border-t border-gray-800 p-4 text-sm"><span>#{i + 1} · {clubes.find(c => String(c.id) === String(e.clube_id))?.nome}</span><span className="text-green-400">{formatar(e.valor)}</span></div>)}</div>
    </>}
  </div>;
}
