
import React, { useState } from 'react';
import { ArrowLeft, School, Calendar, BookOpen, Layers, GraduationCap, ImageIcon, X } from 'lucide-react';
import { MuralPost } from '../types';

interface MuralDetailProps {
  post: MuralPost;
  onBack: () => void;
}

const MuralDetail: React.FC<MuralDetailProps> = ({ post, onBack }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-10 hover:underline transition-all"
      >
        <ArrowLeft size={20} /> Voltar ao Mural
      </button>

      {/* Pop-up de Imagem */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
            <X size={32} />
          </button>
          <img src={selectedPhoto} alt="Visualização" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="space-y-12 pb-24">
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

        {/* Galeria de Fotos Real */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <ImageIcon size={16} /> Galeria de Fotos (Clique para ampliar)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.photos.length > 0 ? (
              post.photos.map((photo, idx) => (
                <div 
                  key={idx} 
                  className="rounded-3xl overflow-hidden shadow-lg cursor-zoom-in group relative aspect-video bg-slate-100"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo} alt={`${post.workTitle} - ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ImageIcon size={32} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-sm">Nenhuma foto anexada.</p>
            )}
          </div>
        </section>

        {/* Explicação Pedagógica - Fundo Branco Sempre para Leitura */}
        <section className="bg-white rounded-[2.5rem] p-10 md:p-14 space-y-8 border border-slate-200 shadow-sm mx-auto">
          <h3 className="text-2xl font-bold text-adventist-blue flex items-center gap-3">
            <BookOpen size={28} /> Como executar em sala de aula
          </h3>
          <div className="prose prose-slate max-w-none text-slate-800">
            <div 
              dangerouslySetInnerHTML={{ __html: post.description }} 
              className="text-lg leading-relaxed space-y-4"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default MuralDetail;
