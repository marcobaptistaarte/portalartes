import React from 'react';
import { Smartphone, Share, MoreVertical, PlusSquare, ArrowRight, Download } from 'lucide-react';

const AppInstallPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-adventist-blue text-adventist-yellow rounded-3xl mb-4 shadow-lg">
          <Smartphone size={48} />
        </div>
        <h2 className="text-4xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-2">Instale o Aplicativo</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Leve o Portal de Artes sempre com você na gaveta de aplicativos do seu celular.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 text-green-600 rounded-xl">
              <Smartphone size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Android (Chrome)</h3>
          </div>
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-adventist-blue dark:text-adventist-yellow">1</div>
              <p className="text-slate-600 dark:text-slate-300">Toque nos <strong>três pontinhos</strong> <MoreVertical className="inline" size={18} /> no canto superior direito do navegador.</p>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-adventist-blue dark:text-adventist-yellow">2</div>
              <p className="text-slate-600 dark:text-slate-300">Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-adventist-blue dark:text-adventist-yellow">3</div>
              <p className="text-slate-600 dark:text-slate-300">Confirme em <strong>"Instalar"</strong>. O ícone aparecerá na sua lista de apps em instantes.</p>
            </li>
          </ul>
        </div>

        {/* iOS Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Share size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">iOS (Safari)</h3>
          </div>
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-adventist-blue dark:text-adventist-yellow">1</div>
              <p className="text-slate-600 dark:text-slate-300">Toque no botão de <strong>Compartilhar</strong> <Share className="inline" size={18} /> (o quadrado com uma seta para cima) na barra inferior.</p>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-adventist-blue dark:text-adventist-yellow">2</div>
              <p className="text-slate-600 dark:text-slate-300">Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="inline" size={18} />.</p>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-adventist-blue dark:text-adventist-yellow">3</div>
              <p className="text-slate-600 dark:text-slate-300">Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto!</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-adventist-blue/5 dark:bg-adventist-yellow/5 border border-adventist-blue/20 dark:border-adventist-yellow/20 p-8 rounded-[2rem] text-center">
        <h4 className="text-xl font-bold text-adventist-blue dark:text-adventist-yellow mb-4">Vantagens de usar o App:</h4>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
            <ArrowRight size={16} className="text-adventist-yellow" /> Acesso mais rápido
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
            <ArrowRight size={16} className="text-adventist-yellow" /> Sem barra de navegação
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
            <ArrowRight size={16} className="text-adventist-yellow" /> Experiência imersiva
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInstallPage;
