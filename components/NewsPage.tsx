
import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ExternalLink, ArrowRight, Search } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsPageProps {
  onViewNews: (news: NewsItem) => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ onViewNews }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('curated_news');
    if (saved) {
      setNews(JSON.parse(saved).reverse()); // Recentes primeiro
    } else {
      // Mock inicial com os pedidos do usuário e imagens simuladas de cabeçalho
      const mock: NewsItem[] = [
        {
          id: 'n-internal-1',
          title: 'Novo site para Professores de Arte é criado',
          summary: 'O Portal de Ensino de Artes chega como uma ferramenta inovadora para auxiliar o cotidiano docente com curadoria especializada.',
          imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
          date: '25/02/2025',
          type: 'internal',
          content: 'Temos o prazer de anunciar o lançamento do Portal de Ensino de Artes, uma plataforma pensada por professores para professores. Este projeto nasceu da necessidade de centralizar recursos pedagógicos de alta qualidade em um ambiente seguro, intuitivo e alinhado com valores cristãos.\n\nNesta fase inicial, o portal oferece acesso a planejamentos bimestrais, planos de aula detalhados e uma rica biblioteca de imagens para uso em sala de aula. Além disso, o "Mural de Inspirações" permite que educadores vejam resultados práticos de projetos aplicados em outras escolas, criando uma verdadeira rede de apoio e criatividade.\n\nO site continuará evoluindo com a inclusão de novos materiais e a curadoria constante de notícias do mundo das artes, garantindo que você tenha sempre o melhor conteúdo à disposição para suas aulas.'
        },
        {
          id: 'n-ext-1',
          title: 'Catálogo do Museu Histórico de Santa Catarina',
          summary: 'Confira a publicação completa que documenta o acervo do museu e a história cultural de SC.',
          imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80',
          date: '22/02/2025',
          type: 'external',
          externalUrl: 'https://marcobaptista.com.br/catalogo-do-museu-historico-de-santa-catarina/'
        },
        {
          id: 'n-ext-2',
          title: 'Crime afeta exposições, diz curador-chefe sobre roubo em SP',
          summary: 'Entenda como o roubo de obras de arte impacta o acesso público e a segurança das instituições culturais no Brasil.',
          imageUrl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=1200&q=80',
          date: '20/02/2025',
          type: 'external',
          externalUrl: 'https://www.cnnbrasil.com.br/nacional/crime-afeta-exposicoes-diz-curador-chefe-sobre-roubo-de-obras-em-sp/'
        },
        {
          id: 'n-ext-3',
          title: 'Um brinde à arte na 36ª Bienal de São Paulo',
          summary: 'A Forbes destaca as novidades e o que esperar de um dos eventos artísticos mais importantes do mundo.',
          imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=80',
          date: '15/02/2025',
          type: 'external',
          externalUrl: 'https://forbes.com.br/forbeslife/2025/09/um-brinde-a-arte-na-36a-bienal-de-sao-paulo/'
        }
      ];
      setNews(mock);
      localStorage.setItem('curated_news', JSON.stringify(mock));
    }
  }, []);

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.summary.toLowerCase().includes(searchTerm.toLowerCase())
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
              
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-adventist-blue transition-colors">
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

        {filteredNews.length === 0 && (
          <div className="py-24 text-center">
            <Newspaper size={64} className="mx-auto text-slate-300 mb-6" />
            <h3 className="text-xl font-bold text-slate-700">Nenhuma notícia encontrada</h3>
            <p className="text-slate-500">Tente buscar por outros termos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
