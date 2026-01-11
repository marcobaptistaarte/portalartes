
import React, { useState, useEffect } from 'react';
import { Camera, User, School, ArrowRight, Loader2 } from 'lucide-react';
import { MuralPost } from '../types';
import { supabase } from '../supabaseClient';

interface MuralSectionProps {
  onReadMore: (post: MuralPost) => void;
}

const MuralSection: React.FC<MuralSectionProps> = ({ onReadMore }) => {
  const [posts, setPosts] = useState<MuralPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMural = async () => {
      const { data, error } = await supabase
        .from('mural_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setPosts(data.map(p => ({
          id: p.id,
          teacherName: p.professor_nome,
          schoolName: p.escola_nome,
          level: p.nivel,
          grade: p.serie,
          workTitle: p.titulo_trabalho,
          description: p.descricao,
          photos: p.fotos,
          date: new Date(p.created_at).toLocaleDateString('pt-BR')
        })));
      }
      setLoading(false);
    };

    fetchMural();
  }, []);

  if (loading) return (
    <div className="py-24 flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-adventist-blue" size={40} />
      <p className="text-slate-500">Buscando artes incríveis...</p>
    </div>
  );

  return (
    <section className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-4">
          Mural de Inspirações
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Projetos práticos realizados pelos nossos professores. Clique em "Leia Mais" para ver como aplicar em sua aula.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col h-full group">
            <div className="relative aspect-video overflow-hidden">
              <img src={post.photos[0] || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f'} alt={post.workTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <span className="bg-adventist-yellow text-adventist-blue text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  {post.level}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1">
                {post.workTitle}
              </h3>
              
              <div className="flex flex-col gap-2 mb-6 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                <span className="flex items-center gap-1.5"><User size={14} className="text-adventist-blue" /> {post.teacherName}</span>
                <span className="flex items-center gap-1.5"><School size={14} className="text-adventist-blue" /> {post.schoolName}</span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm italic mb-8 line-clamp-2">
                {post.description.split('.')[0]}.
              </p>
              
              <div className="mt-auto">
                <button 
                  onClick={() => onReadMore(post)}
                  className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-extrabold text-sm hover:translate-x-2 transition-transform group/btn"
                >
                  Leia Mais <ArrowRight size={18} className="group-hover/btn:scale-125 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Fix: Adding default export
export default MuralSection;
