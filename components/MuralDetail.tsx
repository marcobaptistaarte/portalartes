
import React from 'react';
import { ArrowLeft, School, User, Calendar, BookOpen, Layers, GraduationCap, ImageIcon } from 'lucide-react';
import { MuralPost } from '../types';

interface MuralDetailProps {
  post: MuralPost;
  onBack: () => void;
}

const MuralDetail: React.FC<MuralDetailProps> = ({ post, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-10 hover:underline transition-all"
      >
        <ArrowLeft size={20} /> Voltar ao Mural
      </button>

      <div className="space-y-12 pb-24">
        {/* Cabeçalho Limpo */}
        <header className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg">
              <Layers size={14} /> {post.level}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg">
              <GraduationCap size={14} /> {post.grade}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg">
              <Calendar size={14} /> {post.date}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            {post.workTitle}
          </h1>

          <div className="flex items-center gap-6 py-4 border-y border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-xs uppercase">
                {post.teacherName.charAt(0)}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{post.teacherName}</span>
            </div>
            <div className="flex items-center gap-2">
              <School size={18} className="text-adventist-blue" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{post.schoolName}</span>
            </div>
          </div>
        </header>

        {/* Galeria de Fotos Simples */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <ImageIcon size={16} /> Registros do Trabalho
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.photos.map((photo, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-lg">
                <img src={photo} alt={`${post.workTitle} - ${idx}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Explicação Pedagógica */}
        <section className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-14 space-y-8 border border-slate-100 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-adventist-blue dark:text-adventist-yellow flex items-center gap-3">
            <BookOpen size={28} /> Como executar em sala de aula
          </h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {post.description.split('\n').map((para, i) => (
              <p key={i} className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {para}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MuralDetail;
