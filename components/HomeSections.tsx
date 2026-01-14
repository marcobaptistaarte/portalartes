import React from 'react';
import { ArrowRight, Calendar, FileText, Newspaper, ExternalLink, PlayCircle } from 'lucide-react';
import { ManualPost, NewsItem } from '../types';

interface HomeSectionsProps {
  latestActivities: ManualPost[];
  latestNews: NewsItem[];
  latestVideos: any[];
  onViewActivity: (activity: ManualPost) => void;
  onViewNews: (news: NewsItem) => void;
  onSeeMoreNews: () => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({ 
  latestActivities, 
  latestNews, 
  latestVideos,
  onViewActivity, 
  onViewNews,
  onSeeMoreNews
}) => {
  
  const stripFormatting = (text: string) => {
    if (!text) return '';
    return text.replace(/\[\/?(center|right|justify)\]/g, '').replace(/<\/?u>/g, '').replace(/[*_~]/g, '').replace(/^#+\s+/gm, '').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="container mx-auto px-4 space-y-24 py-16">
      
      {/* 1. Atividades (12 Itens) */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-adventist-blue text-adventist-yellow rounded-xl"><FileText size={24} /></div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-adventist-blue dark:text-adventist-yellow">Últimos Materiais Postados</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestActivities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={() => onViewActivity(activity)}>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-[9px] font-bold text-slate-500 uppercase rounded mb-3 inline-block">{activity.level}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{activity.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">{stripFormatting(activity.content)}</p>
              <div className="text-adventist-blue dark:text-adventist-yellow font-bold text-[10px] uppercase flex items-center gap-1">Acessar <ArrowRight size={12} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Notícias e Artigos (6 Itens) */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-adventist-blue text-adventist-yellow rounded-xl"><Newspaper size={24} /></div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-adventist-blue dark:text-adventist-yellow">Curadoria de Notícias e Artigos Relevantes</h2>
          </div>
          <button onClick={onSeeMoreNews} className="hidden md:flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold text-sm uppercase tracking-widest">Veja Mais <ArrowRight size={16} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestNews.map((news) => (
            <div key={news.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded font-bold uppercase">{news.category}</span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">{news.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 italic">{stripFormatting(news.summary)}</p>
                <button onClick={() => onViewNews(news)} className="mt-auto text-adventist-blue dark:text-adventist-yellow font-bold text-xs uppercase flex items-center gap-2">Ler Agora <ArrowRight size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Vídeos Interessantes (Nova Seção - 6 Itens) */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-adventist-blue text-adventist-yellow rounded-xl"><PlayCircle size={24} /></div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-adventist-blue dark:text-adventist-yellow">Vídeos Interessantes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestVideos.map((vid) => (
            <div key={vid.id} className="bg-slate-900 rounded-[2rem] overflow-hidden group shadow-xl border border-slate-800">
              <div className="relative aspect-video">
                <iframe src={`https://www.youtube.com/embed/${vid.video_id}`} className="w-full h-full" allowFullScreen></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-white font-bold text-base mb-2 line-clamp-1">{vid.titulo}</h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">{vid.resumo}</p>
                <div className="flex items-center gap-2 text-adventist-yellow text-[10px] font-bold uppercase"><PlayCircle size={14} /> Em Destaque</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
