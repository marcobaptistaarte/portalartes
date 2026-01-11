import React from 'react';
import { Palette } from 'lucide-react';

const AppIconPreview = () => (
  <div className="flex flex-col items-center justify-center p-3 bg-white border-[2.5px] border-[#003366] rounded-[1.5rem] shadow-sm w-24 h-24 md:w-28 md:h-28 shrink-0 pointer-events-none select-none">
    <div className="bg-[#FFCC00] p-1.5 rounded-lg text-[#003366] mb-1">
      <Palette size={32} />
    </div>
    <span className="text-[8px] md:text-[10px] font-bold tracking-tight text-[#003366] uppercase text-center leading-tight">Portal de<br/>Artes</span>
  </div>
);

const AppInstallPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto reveal-animation space-y-12 pb-24 px-4 pt-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-extrabold text-[#003366] dark:text-[#FFCC00]">Portal de Artes no seu celular</h2>
        <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400">Instale o portal como um aplicativo real. É rápido, gratuito e facilita seu acesso aos materiais pedagógicos! 🎨</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* iOS Section */}
        <div className="p-8 md:p-10 rounded-[2.5rem] border-2 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <AppIconPreview />
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-gray-100 flex items-center justify-center">
              <span className="text-xl">🍎</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No iPhone (iOS)</h3>
          <ol className="text-left space-y-4 text-sm md:text-base opacity-80 text-slate-600 dark:text-slate-300">
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">1.</span><span>Abra este site pelo navegador <strong>Safari</strong>.</span></li>
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">2.</span><span>Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima).</span></li>
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">3.</span><span>Toque em <strong>"Adicionar à Tela de Início"</strong>.</span></li>
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">4.</span><span>Clique em <strong>"Adicionar"</strong> no canto superior.</span></li>
          </ol>
        </div>

        {/* Android Section */}
        <div className="p-8 md:p-10 rounded-[2.5rem] border-2 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <AppIconPreview />
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-gray-100 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No Android</h3>
          <ol className="text-left space-y-4 text-sm md:text-base opacity-80 text-slate-600 dark:text-slate-300">
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">1.</span><span>Abra este site pelo navegador <strong>Chrome</strong>.</span></li>
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">2.</span><span>Toque nos <strong>três pontinhos</strong> superiores.</span></li>
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">3.</span><span>Procure pela opção <strong>"Instalar aplicativo"</strong>.</span></li>
            <li className="flex gap-3"><span className="font-black text-[#003366] dark:text-[#FFCC00]">4.</span><span>Aguarde a instalação. Ele aparecerá na sua <strong>gaveta de apps</strong>.</span></li>
          </ol>
          <p className="text-[10px] text-slate-400 mt-4 italic">Dica: Se aparecer apenas "Adicionar à tela inicial", aguarde alguns segundos ou recarregue a página até que o sistema identifique o aplicativo.</p>
        </div>
      </div>
    </div>
  );
};

export default AppInstallPage;
