
import React from 'react';
import { Smartphone, Apple, Chrome, Share, PlusSquare, MoreVertical, Download, Palette } from 'lucide-react';

const AppTutorial: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-adventist-blue text-adventist-yellow rounded-3xl mb-6 shadow-xl">
          <Smartphone size={40} />
        </div>
        <h2 className="text-4xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-4">
          Instale o nosso Aplicativo
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Sabia que você pode ter o Portal de Artes diretamente na tela do seu celular? 
          É rápido, gratuito e não ocupa espaço na memória como aplicativos comuns.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* iPhone (iOS) */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg space-y-8 flex flex-col h-full">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Apple size={24} />
            </div>
            <h3 className="text-xl font-bold">No iPhone (Safari)</h3>
          </div>

          <ol className="space-y-6 flex-grow">
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">1</div>
              <p className="text-slate-600 dark:text-slate-300">
                Abra este site no navegador <strong>Safari</strong> do seu iPhone.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">2</div>
              <p className="text-slate-600 dark:text-slate-300">
                Toque no botão de <strong>Compartilhar</strong> <Share size={18} className="inline text-adventist-blue" /> (o ícone de um quadrado com uma seta para cima na barra inferior).
              </p>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">3</div>
              <p className="text-slate-600 dark:text-slate-300">
                Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={18} className="inline text-adventist-blue" />.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">4</div>
              <p className="text-slate-600 dark:text-slate-300">
                Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto! O ícone aparecerá no seu celular.
              </p>
            </li>
          </ol>
        </div>

        {/* Android */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg space-y-8 flex flex-col h-full">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Chrome size={24} />
            </div>
            <h3 className="text-xl font-bold">No Android (Chrome)</h3>
          </div>

          <ol className="space-y-6 flex-grow">
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">1</div>
              <p className="text-slate-600 dark:text-slate-300">
                Abra este site no navegador <strong>Google Chrome</strong> do seu celular.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">2</div>
              <p className="text-slate-600 dark:text-slate-300">
                Toque nos <strong>três pontinhos</strong> <MoreVertical size={18} className="inline text-adventist-blue" /> no canto superior direito.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">3</div>
              <p className="text-slate-600 dark:text-slate-300">
                Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center font-bold text-sm">4</div>
              <p className="text-slate-600 dark:text-slate-300">
                Confirme tocando em <strong>"Instalar"</strong>. O ícone aparecerá entre os seus outros aplicativos.
              </p>
            </li>
          </ol>
        </div>
      </div>

      {/* Como o ícone aparecerá */}
      <div className="mt-16 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-700 text-center">
        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-8">O ícone no seu celular será assim:</h4>
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-adventist-blue rounded-3xl shadow-2xl flex flex-col items-center justify-center p-2 border-4 border-white dark:border-slate-800 overflow-hidden">
            <div className="text-adventist-yellow scale-125 mb-1">
              <Palette size={40} strokeWidth={1.5} />
            </div>
            <span className="text-[8px] font-black text-white uppercase text-center leading-[1] mt-1">Portal de Artes</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Portal de Artes</p>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <Download size={20} />
            <span>Vantagens do Aplicativo:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">Acesso Rápido</span>
            <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">Mais espaço na tela</span>
            <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">Sem precisar digitar o link</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
