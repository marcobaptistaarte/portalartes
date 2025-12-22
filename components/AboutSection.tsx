
import React from 'react';
import { 
  GraduationCap, 
  Award, 
  Book, 
  Instagram, 
  Facebook, 
  Youtube, 
  Linkedin, 
  Globe, 
  FileText 
} from 'lucide-react';

const MARCO_PHOTO = "https://i.imgur.com/WriUFkJ.png";

const AboutSection: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-8">
            Sobre
          </h2>
          
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-adventist-blue dark:first-letter:text-adventist-yellow first-letter:mr-3 first-letter:float-left">
                Sou o <strong>Marco Baptista</strong>, professor de Artes no Ensino Fundamental e Médio há oito anos, e este portal nasceu da minha própria vivência em sala de aula.
              </p>
              <p>
                Ao longo desses anos, senti na prática a dificuldade de encontrar materiais de Artes que fossem, ao mesmo tempo, bem organizados, didáticos, fáceis de acessar e realmente pensados para a realidade da escola. Muitas vezes, o tempo é curto, o planejamento precisa ser objetivo, e nem sempre é simples reunir bons conteúdos em um só lugar.
              </p>
              <p>
                A ideia deste portal é justamente essa: oferecer um espaço onde você, professor ou professora de Artes, possa encontrar aulas, atividades e recursos pedagógicos prontos para usar, adaptar e recriar, de forma clara e intuitiva, sem complicação. Tudo foi pensado para apoiar o seu trabalho e facilitar o dia a dia em sala de aula.
              </p>
            </div>
            
            <div className="w-full md:w-80 shrink-0 sticky top-24">
              <div className="relative group">
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 transform transition-transform duration-500 group-hover:scale-[1.02]">
                  <img 
                    src={MARCO_PHOTO} 
                    alt="Marco Baptista" 
                    className="w-full h-auto object-cover min-h-[400px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-adventist-blue text-white text-center">
                    <p className="text-sm font-bold">Marco Baptista</p>
                    <p className="text-[10px] uppercase tracking-widest text-adventist-yellow">Artista, Pesquisador e Professor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 text-lg leading-relaxed mt-10">
            <p>
              Os conteúdos aqui reunidos são desenvolvidos a partir de princípios cristãos, com foco em uma formação integral do aluno, valorizando o respeito, a sensibilidade, o cuidado com o outro e o papel da arte como linguagem de expressão, reflexão e construção de valores. Este portal é especialmente voltado para educadores que buscam alinhar o ensino de Artes a esses princípios em sua prática pedagógica.
            </p>
            <p>
              Mais do que uma plataforma, este é um espaço de apoio entre professores, criado para ajudar no planejamento, inspirar novas abordagens e fortalecer o ensino de Artes na escola.
            </p>
            <div className="pt-6 flex items-center gap-4">
               <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
               <div className="font-serif italic text-2xl text-adventist-blue dark:text-adventist-yellow">Marco Baptista</div>
               <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
            </div>
          </div>

          <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Award className="text-adventist-yellow" />
              Mini currículo
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 text-adventist-blue dark:text-adventist-yellow">
                  <GraduationCap size={20} />
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Graduado Bacharel em Pintura pela Escola de Belas Artes da Universidade Federal do Rio de Janeiro (UFRJ)
                </p>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 text-adventist-blue dark:text-adventist-yellow">
                  <Book size={20} />
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Pós-graduação em Cinema e Linguagem Audiovisual pela Universidade Estácio de Sá
                </p>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 text-adventist-blue dark:text-adventist-yellow">
                  <Award size={20} />
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Mestre e Doutor em Artes Visuais pela Universidade do Estado de Santa Catarina (UDESC)
                </p>
              </li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="https://www.instagram.com/marcobaptista.arte/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-pink-600 hover:scale-110 hover:shadow-lg transition-all" title="Instagram">
                <Instagram size={24} />
              </a>
              <a href="https://www.facebook.com/marcobaptistaarte" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-blue-700 hover:scale-110 hover:shadow-lg transition-all" title="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://www.youtube.com/MarcoBaptistaMultimidias" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-red-600 hover:scale-110 hover:shadow-lg transition-all" title="YouTube">
                <Youtube size={24} />
              </a>
              <a href="https://www.linkedin.com/in/omarcobaptista/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-blue-600 hover:scale-110 hover:shadow-lg transition-all" title="LinkedIn">
                <Linkedin size={24} />
              </a>
              <a href="http://lattes.cnpq.br/1822277137965965" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:scale-110 hover:shadow-lg transition-all" title="Currículo Lattes">
                <FileText size={24} />
              </a>
              <a href="https://marcobaptista.com.br/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-adventist-blue dark:text-adventist-yellow hover:scale-110 hover:shadow-lg transition-all" title="Site Oficial">
                <Globe size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
