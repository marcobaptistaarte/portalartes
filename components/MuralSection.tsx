
import React, { useState, useEffect } from 'react';
import { Camera, User, School, ArrowRight } from 'lucide-react';
import { MuralPost } from '../types';

interface MuralSectionProps {
  onReadMore: (post: MuralPost) => void;
}

// Exemplos Fictícios Iniciais
const FICTIONAL_POSTS: MuralPost[] = [
  {
    id: 'f-1',
    teacherName: 'Denise Baptista',
    schoolName: 'CAP',
    level: 'Ensino Fundamental I',
    grade: '4º ano',
    workTitle: 'Mosaico com Papel de Revista',
    description: 'Neste projeto, os alunos exploraram a técnica do mosaico utilizando apenas pequenos pedaços de revistas antigas. O objetivo foi trabalhar a coordenação motora fina e a percepção de tons cromáticos. Para executar em sala de aula, peça que os alunos desenhem uma silhueta simples e preencham com os recortes, colando-os bem próximos uns dos outros.',
    photos: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'],
    date: '10/02/2025'
  },
  {
    id: 'f-2',
    teacherName: 'Marco Baptista',
    schoolName: 'CAP',
    level: 'Ensino Fundamental II',
    grade: '8º ano',
    workTitle: 'Releitura: O Grito no Cotidiano',
    description: 'Os alunos foram desafiados a fotografar cenas do cotidiano escolar que remetessem à angústia da obra de Munch. Uma abordagem que une história da arte e fotografia digital. Para executar, utilize o celular dos próprios alunos para captar cenas reais e depois edite as cores para tons saturados e dramáticos.',
    photos: ['https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80'],
    date: '12/02/2025'
  },
  {
    id: 'f-3',
    teacherName: 'Ana Cláudia',
    schoolName: 'CAP',
    level: 'Educação Infantil',
    grade: 'Pré V',
    workTitle: 'Escultura com Massa de Modelar Caseira',
    description: 'Trabalho de exploração tátil focado em animais marinhos. A massa foi feita pelos próprios alunos usando farinha, sal e corante alimentício. Para executar, comece pela produção da massa para envolver os alunos no processo químico antes da modelagem artística.',
    photos: ['https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80'],
    date: '15/02/2025'
  }
];

const MuralSection: React.FC<MuralSectionProps> = ({ onReadMore }) => {
  const [posts, setPosts] = useState<MuralPost[]>([]);

  useEffect(() => {
    const savedMural = localStorage.getItem('mural_posts');
    const customPosts = savedMural ? JSON.parse(savedMural) : [];
    // Unindo fictícios com os postados pelo admin
    setPosts([...FICTIONAL_POSTS, ...customPosts]);
  }, []);

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
              <img src={post.photos[0]} alt={post.workTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
              
              {/* Resumo de 1 frase (Snippet) */}
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

      <div className="mt-20 py-10 text-center border-t border-slate-100 dark:border-slate-800">
        <p className="text-slate-400 text-sm font-medium">Somente administradores podem postar no mural.</p>
      </div>
    </section>
  );
};

export default MuralSection;
