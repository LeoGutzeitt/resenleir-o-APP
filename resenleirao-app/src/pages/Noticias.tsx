import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Newspaper, Plus, Star, Calendar, User, X } from 'lucide-react';

export function Noticias() {
  const { user, isDono } = useAuth();
  const [noticias, setNoticias] = useState<any[]>([]);
  const [noticiasDestaque, setNoticiasDestaque] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [destaque, setDestaque] = useState(false);
  const [imagem, setImagem] = useState<File | null>(null);
  const [meuClube, setMeuClube] = useState<any>(null);

  useEffect(() => {
    carregarNoticias();
    if (user && isDono) {
      const clube = db.clubes.buscarPorDono(user.id);
      setMeuClube(clube);
    }
  }, [user, isDono]);

  const carregarNoticias = () => {
    const todasNoticias = db.noticias.listar();
    const destaques = db.noticias.listarDestaques();
    setNoticias(todasNoticias);
    setNoticiasDestaque(destaques);
  };

  const handleCriarNoticia = async () => {
    if (!titulo || !conteudo || !meuClube) return;

    let imagem_url: string | null = null;

    // Upload da imagem se houver
    if (imagem) {
      const reader = new FileReader();
      imagem_url = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imagem);
      });
    }

    db.noticias.criar({
      titulo,
      conteudo,
      clube_id: meuClube.id,
      data: new Date().toISOString().split('T')[0],
      destaque,
      imagem_url,
    });

    setTitulo('');
    setConteudo('');
    setDestaque(false);
    setImagem(null);
    setShowForm(false);
    carregarNoticias();
  };

  const formatarData = (data: string) => {
    const date = new Date(data + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NoticiaCard = ({ noticia, isDestaque }: { noticia: any; isDestaque?: boolean }) => {
    const clube = db.clubes.buscarPorId(noticia.clube_id);
    
    return (
      <div className={`bg-gray-900 rounded-xl overflow-hidden border ${isDestaque ? 'border-yellow-500/50' : 'border-gray-800'}`}>
        {noticia.imagem_url && (
          <div className="w-full h-48 bg-gray-800">
            <img
              src={noticia.imagem_url}
              alt={noticia.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          {isDestaque && (
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium text-yellow-500">DESTAQUE</span>
            </div>
          )}
          
          <h3 className="text-lg font-semibold mb-2">{noticia.titulo}</h3>
          
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: clube?.cor_principal || '#666' }}
              >
                {clube?.nome.charAt(0)}
              </div>
              <span>{clube?.nome}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatarData(noticia.data)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 whitespace-pre-wrap">{noticia.conteudo}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notícias</h1>
          <p className="text-sm text-gray-400 mt-1">
            Últimas notícias e atualizações dos clubes
          </p>
        </div>
        {isDono && meuClube && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Notícia
          </button>
        )}
      </div>

      {/* Formulário de Criação */}
      {showForm && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Criar Nova Notícia</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ex: Contratação de novo jogador"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conteúdo
              </label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                placeholder="Escreva o conteúdo da notícia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Imagem da Notícia (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagem(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black file:font-medium file:cursor-pointer hover:file:bg-yellow-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="destaque"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
              />
              <label htmlFor="destaque" className="text-sm text-gray-300 cursor-pointer">
                Marcar como destaque
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCriarNoticia}
                disabled={!titulo || !conteudo}
                className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Publicar Notícia
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setTitulo('');
                  setConteudo('');
                  setDestaque(false);
                  setImagem(null);
                }}
                className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notícias em Destaque */}
      {noticiasDestaque.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-semibold">Em Destaque</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {noticiasDestaque.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} isDestaque />
            ))}
          </div>
        </div>
      )}

      {/* Todas as Notícias */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Últimas Notícias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {noticias.map((noticia) => (
            <NoticiaCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      </div>

      {noticias.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Nenhuma notícia ainda</p>
          <p className="text-gray-500 text-sm">
            {isDono ? 'Clique em "Nova Notícia" para publicar a primeira notícia do seu clube' : 'As notícias dos clubes aparecerão aqui'}
          </p>
        </div>
      )}
    </div>
  );
}