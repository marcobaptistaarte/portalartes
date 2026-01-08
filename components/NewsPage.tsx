
import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ExternalLink, ArrowRight, Search, Loader2 } from 'lucide-react';
import { NewsItem } from '../types';
import { supabase } from '../supabaseClient';

interface NewsPageProps {
  onViewNews: (news: NewsItem) => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ onViewNews }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('curated_news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setNews(data.map(n => ({
          id: n.id,
          title: n.titulo,
          summary: n.resumo,
          imageUrl: n.imagem_url,
          externalUrl: n.url_externa,
          date: n.data_postagem,
          type: n.tipo as 'internal' | 'external'
        })));
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="py-24 flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-adventist-blue" size={40} />
      <p className="text-slate-500">Lendo as últimas notícias...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-2">
            Notícias e Curadoria
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            O que está acontecendo no mundo das artes e educação.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar notícias..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-adventist-blue transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {filteredNews.map((n) => (
          <div 
            key={n.id} 
            className="flex flex-col lg:flex-row gap-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all group"
          >
            <div className="w-full lg:w-[400px] shrink-0 aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden">
              <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            
            <div className="flex flex-col justify-center py-4">
              <div className="flex items-center gap-4 mb-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {n.date}</span>
                <span className={`px-2 py-0.5 rounded ${n.type === 'external' ? 'bg-black text-white' : 'bg-adventist-blue text-adventist-yellow'}`}>
                  {n.type === 'external' ? 'Link Externo' : 'Exclusivo'}
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-adventist-blue dark:group-hover:text-adventist-yellow transition-colors">
                {n.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                {n.summary}
              </p>
              
              <div className="mt-auto">
                <button 
                  onClick={() => onViewNews(n)}
                  className="inline-flex items-center gap-2 bg-adventist-blue hover:bg-slate-900 text-adventist-yellow px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  {n.type === 'external' ? 'Acessar Link' : 'Ler Matéria Completa'} 
                  {n.type === 'external' ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
