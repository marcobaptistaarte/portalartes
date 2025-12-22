
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-adventist-blue py-12 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-adventist-yellow opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl -ml-24 -mb-24"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ensinar arte pode ser mais simples.
        </h2>
        <div className="text-blue-100 text-lg md:xl max-w-3xl mx-auto leading-relaxed space-y-4">
          <p className="font-medium text-white/90">
            Este é um espaço pensado para quem vive a sala de aula.
          </p>
          <p>
            Aqui você encontra aulas, atividades e recursos de Artes alinhados a princípios cristãos, pensados para apoiar o professor em diferentes etapas da educação. Os materiais são organizados para facilitar o planejamento, respeitar a prática docente e inspirar novas ideias no cotidiano escolar.
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <span className="px-3 py-1 bg-adventist-yellow text-adventist-blue text-xs font-bold rounded-full uppercase tracking-wider">Inovação</span>
          <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full uppercase tracking-wider border border-white/20">Metodologia</span>
          <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full uppercase tracking-wider border border-white/20">Criatividade</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
