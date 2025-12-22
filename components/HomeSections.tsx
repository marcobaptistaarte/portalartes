
import React from 'react';
import { ArrowRight, Calendar, FileText, Newspaper, ExternalLink } from 'lucide-react';
import { ManualPost, NewsItem } from '../types';

interface HomeSectionsProps {
  latestActivities: ManualPost[];
  latestNews: NewsItem[];
  onViewActivity: (activity: ManualPost) => void;
  onViewNews: (news: NewsItem) => void;
  onSeeMoreNews: () => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({ 
  latestActivities, 
  latestNews, 
  onViewActivity, 
  onViewNews,
  onSeeMoreNews
}) => {
  return (
    <div className="container mx-auto px-4 space-y-24 py-16">
      
      {/* Seção Últimas Atividades */}
      {latestActivities.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-adventist-blue text-adventist-yellow rounded-xl">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-adventist-blue dark:text-adventist-yellow">
                Últimas Atividades Postadas
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => onViewActivity(activity)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 uppercase rounded">
                    {activity.level}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{activity.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-adventist-blue transition-colors">
                  {activity.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">
                  {activity.content}
                </p>
                <div className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold text-xs uppercase tracking-wider">
                  Acessar Material <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seção Notícias */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-adventist-blue text-adventist-yellow rounded-xl">
              <Newspaper size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-adventist-blue dark:text-adventist-yellow">
              Notícias e Curadoria
            </h2>
          </div>
          <button 
            onClick={onSeeMoreNews}
            className="hidden md:flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold text-sm uppercase tracking-widest hover:underline"
          >
            Veja Mais <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {latestNews.length > 0 ? (
            latestNews.map((news) => (
              <div 
                key={news.id} 
                className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4">
                    {news.type === 'external' ? (
                      <span className="p-2 bg-black/50 backdrop-blur-md text-white rounded-full">
                        <ExternalLink size={14} />
                      </span>
                    ) : (
                      <span className="p-2 bg-adventist-blue/80 backdrop-blur-md text-adventist-yellow rounded-full">
                        <FileText size={14} />
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-400 font-bold uppercase">
                    <Calendar size={12} /> {news.date}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 italic">
                    {news.summary}
                  </p>
                  <div className="mt-auto">
                    <button 
                      onClick={() => onViewNews(news)}
                      className="text-adventist-blue dark:text-adventist-yellow font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      {news.type === 'external' ? 'Abrir Link' : 'Ler Notícia'} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed">
              Nenhuma notícia cadastrada no momento.
            </div>
          )}
        </div>

        <div className="md:hidden text-center">
          <button 
            onClick={onSeeMoreNews}
            className="inline-flex items-center gap-2 bg-adventist-blue text-adventist-yellow px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg"
          >
            Veja Mais Notícias
          </button>
        </div>
      </section>
    </div>
  );
};
