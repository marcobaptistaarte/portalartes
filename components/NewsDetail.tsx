
import React from 'react';
import { ArrowLeft, Calendar, Share2, Printer, Tag } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsDetailProps {
  news: NewsItem;
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-10 hover:underline transition-all"
      >
        <ArrowLeft size={20} /> Voltar para Notícias
      </button>

      <div className="space-y-8 pb-24">
        <header className="space-y-6">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {news.date}</span>
            <span className="bg-adventist-blue text-adventist-yellow px-2 py-0.5 rounded">Exclusivo</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            {news.title}
          </h1>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed border-l-4 border-adventist-yellow pl-6">
            {news.summary}
          </p>
        </header>

        <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-[16/9] border-4 border-white dark:border-slate-800">
          <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-14 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="space-y-6">
            {news.content?.split('\n').map((para, i) => (
              <p key={i} className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-adventist-yellow" />
              <span className="text-sm font-bold text-adventist-blue dark:text-adventist-yellow uppercase tracking-widest">Equipe Portal de Artes</span>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-adventist-blue transition-colors">
                <Printer size={18}/> <span className="text-xs font-bold uppercase">Imprimir</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-adventist-blue transition-colors">
                <Share2 size={18}/> <span className="text-xs font-bold uppercase">Compartilhar</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
